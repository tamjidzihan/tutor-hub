from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.tutors.models import TutorProfile
from apps.notifications.services import create_notification
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()

class ConversationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.is_staff:
            conversations = Conversation.objects.all().order_by('-updated_at')
        else:
            conversations = Conversation.objects.filter(
                Q(student=request.user) | Q(tutor=request.user)
            ).order_by('-updated_at')
        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        target_user_id = request.data.get('target_user_id')
        tutor_id = request.data.get('tutor_id')

        target_user = None
        if target_user_id:
            try:
                target_user = User.objects.filter(id=target_user_id).first()
            except Exception:
                pass
            if not target_user:
                target_user = User.objects.filter(email__iexact=str(target_user_id).strip()).first()
        elif tutor_id:
            # 1. Match CharField tutor_id (e.g. 'TT-T-100229')
            tutor_profile = TutorProfile.objects.filter(tutor_id__iexact=str(tutor_id).strip()).first()
            
            # 2. Match TutorProfile UUID
            if not tutor_profile:
                try:
                    tutor_profile = TutorProfile.objects.filter(id=tutor_id).first()
                except Exception:
                    pass

            # 3. Match TutorProfile user__id
            if not tutor_profile:
                try:
                    tutor_profile = TutorProfile.objects.filter(user__id=tutor_id).first()
                except Exception:
                    pass

            if tutor_profile:
                target_user = tutor_profile.user
            else:
                # 4. Fallback: maybe tutor_id is directly a User UUID or email
                try:
                    target_user = User.objects.filter(id=tutor_id).first()
                except Exception:
                    pass
                if not target_user:
                    target_user = User.objects.filter(email__iexact=str(tutor_id).strip()).first()

        if not target_user:
            return Response({'error': 'Target user not found.'}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({'error': 'Cannot start a conversation with yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if a conversation between these two users already exists in either direction
        conversation = Conversation.objects.filter(
            (Q(student=request.user) & Q(tutor=target_user)) |
            (Q(student=target_user) & Q(tutor=request.user))
        ).first()

        created = False
        if not conversation:
            # Determine student and tutor roles for initial creation
            if request.user.role == User.Role.STUDENT and target_user.role == User.Role.TUTOR:
                student, tutor = request.user, target_user
            elif request.user.role == User.Role.TUTOR and target_user.role == User.Role.STUDENT:
                student, tutor = target_user, request.user
            elif request.user.role == User.Role.ADMIN or target_user.role == User.Role.ADMIN:
                student, tutor = (request.user, target_user) if request.user.role != User.Role.TUTOR else (target_user, request.user)
            else:
                student, tutor = request.user, target_user

            conversation = Conversation.objects.create(student=student, tutor=tutor)
            created = True

        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class ConversationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Conversation.objects.all()
        return Conversation.objects.filter(
            Q(student=self.request.user) | Q(tutor=self.request.user)
        )

class MessageListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_conversation(self, conversation_id, user):
        conv = Conversation.objects.filter(id=conversation_id).first()
        if not conv:
            return None
        if conv.student != user and conv.tutor != user and not user.is_staff:
            return None
        return conv

    def get(self, request, conversation_id):
        conv = self.get_conversation(conversation_id, request.user)
        if not conv:
            return Response({'error': 'Conversation not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        messages = conv.messages.all().order_by('created_at')
        # Mark unread messages sent by the other party as read
        conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, conversation_id):
        conv = self.get_conversation(conversation_id, request.user)
        if not conv:
            return Response({'error': 'Conversation not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conv,
            sender=request.user,
            content=content
        )
        conv.save()  # Updates conversation updated_at

        # Notify recipient
        recipient = conv.tutor if request.user == conv.student else conv.student
        sender_name = request.user.full_name or request.user.email
        create_notification(
            recipient=recipient,
            sender=request.user,
            notification_type='MESSAGE',
            title=f"Message from {sender_name}",
            message=content[:100],
            link=f"/dashboard/messages?conversation={conv.id}"
        )

        serializer = MessageSerializer(message, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MarkConversationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        conv = Conversation.objects.filter(id=conversation_id).first()
        if not conv or (conv.student != request.user and conv.tutor != request.user and not request.user.is_staff):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        updated = conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'success': True, 'marked_read': updated})
