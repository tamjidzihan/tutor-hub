from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from apps.common.permissions import IsOwnerOrReadOnly
from apps.ai.services import ai_service
from apps.notifications.services import create_notification
from .models import Post, PostLike, Comment, PostReport
from .serializers import PostSerializer, CommentSerializer, PostReportSerializer

class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Post.objects.select_related('author').prefetch_related('comments__author').all()
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if category and category != 'ALL':
            queryset = queryset.filter(category=category)

        if search:
            queryset = queryset.filter(
                Q(content__icontains=search) | Q(author__first_name__icontains=search) | Q(author__last_name__icontains=search)
            )

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Check if AI personalization / "For You" is requested
        for_you = request.query_params.get('for_you', 'false').lower() == 'true'
        if for_you and queryset.exists():
            posts_data = PostSerializer(queryset[:30], many=True, context={'request': request}).data
            user_interests = []
            if hasattr(request.user, 'tutor_profile'):
                user_interests = request.user.tutor_profile.subjects
            elif request.user.role == 'STUDENT':
                user_interests = ['mathematics', 'science', 'physics', 'tips', 'academic']

            ranked = ai_service.recommend_feed(user_interests, posts_data)
            return Response(ranked)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset[:30], many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        content = self.request.data.get('content', '')
        # Basic AI moderation check
        mod_result = ai_service.moderate_content(content)
        if not mod_result.get('is_appropriate', True):
            # We still record it or let admin know, or clean content
            pass

        # Extract tags or auto summary if long
        summary = ""
        if len(content) > 200:
            summary = content[:150] + "..."

        serializer.save(
            author=self.request.user,
            ai_summary=summary
        )

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

class PostLikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = Post.objects.filter(id=pk).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        like_qs = PostLike.objects.filter(post=post, user=request.user)
        if like_qs.exists():
            like_qs.delete()
            post.likes_count = max(0, post.likes_count - 1)
            post.save(update_fields=['likes_count'])
            is_liked = False
        else:
            PostLike.objects.create(post=post, user=request.user)
            post.likes_count += 1
            post.save(update_fields=['likes_count'])
            is_liked = True

            # Notify author if not own post
            if post.author != request.user:
                sender_name = request.user.full_name or request.user.email
                create_notification(
                    recipient=post.author,
                    sender=request.user,
                    notification_type='POST',
                    title='Reaction on Your Post',
                    message=f"{sender_name} liked your post.",
                    link="/feed"
                )

        return Response({
            'is_liked': is_liked,
            'likes_count': post.likes_count
        })

class CommentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, post_id):
        post = Post.objects.filter(id=post_id).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        comments = post.comments.select_related('author').all()
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, post_id):
        post = Post.objects.filter(id=post_id).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Comment content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        comment = Comment.objects.create(
            post=post,
            author=request.user,
            content=content
        )
        post.comments_count += 1
        post.save(update_fields=['comments_count'])

        # Notify author
        if post.author != request.user:
            sender_name = request.user.full_name or request.user.email
            create_notification(
                recipient=post.author,
                sender=request.user,
                notification_type='POST',
                title='New Comment on Your Post',
                message=f"{sender_name} commented: {content[:80]}",
                link="/feed"
            )

        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PostReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = Post.objects.filter(id=pk).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({'error': 'Reason is required'}, status=status.HTTP_400_BAD_REQUEST)

        report = PostReport.objects.create(
            post=post,
            reporter=request.user,
            reason=reason
        )
        serializer = PostReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
