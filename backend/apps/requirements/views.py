from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import TutorRequirement
from .serializers import TutorRequirementSerializer
from .services import calculate_tutor_matches

class TutorRequirementListCreateView(generics.ListCreateAPIView):
    serializer_class = TutorRequirementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            if self.request.user.is_staff or self.request.user.role == 'ADMIN':
                return TutorRequirement.objects.all()
            return TutorRequirement.objects.filter(user=self.request.user)
        return TutorRequirement.objects.none()

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        instance = serializer.save(user=user)
        matches = calculate_tutor_matches(instance)
        instance.matched_tutors = matches
        if matches:
            instance.status = TutorRequirement.Status.MATCHED
        instance.save(update_fields=['matched_tutors', 'status'])

class TutorRequirementDetailView(generics.RetrieveUpdateAPIView):
    queryset = TutorRequirement.objects.all()
    serializer_class = TutorRequirementSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'requirement_id'

class SelectTutorView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, requirement_id):
        tutor_id = request.data.get('tutor_id')
        if not tutor_id:
            return Response({'error': 'tutor_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            req = TutorRequirement.objects.get(requirement_id=requirement_id)
            req.selected_tutor_id = tutor_id
            req.status = TutorRequirement.Status.TUTOR_SELECTED
            req.save(update_fields=['selected_tutor_id', 'status'])
            return Response({
                'message': f'Tutor {tutor_id} selected successfully for requirement {requirement_id}',
                'requirement': TutorRequirementSerializer(req).data
            })
        except TutorRequirement.DoesNotExist:
            return Response({'error': 'Requirement not found'}, status=status.HTTP_404_NOT_FOUND)
