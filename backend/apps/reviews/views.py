from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.tutors.models import TutorProfile
from apps.common.permissions import IsOwnerOrReadOnly
from apps.ai.services import ai_service
from apps.notifications.services import create_notification
from .models import Review
from .serializers import ReviewSerializer

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Review.objects.all()
        tutor_id = self.request.query_params.get('tutor_id') or self.kwargs.get('tutor_id')
        if tutor_id:
            queryset = queryset.filter(tutor__tutor_id=tutor_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        student_name = user.full_name or user.email.split('@')[0].title()
        review = serializer.save(
            student=user,
            student_name=student_name,
            is_verified_student=True
        )

        # Notify tutor
        try:
            tutor_user = review.tutor.user
            create_notification(
                recipient=tutor_user,
                sender=user,
                notification_type='REVIEW',
                title='New Student Review',
                message=f"{student_name} left a {review.rating}★ review on your profile.",
                link=f"/hub/tutor-details/{review.tutor.tutor_id}"
            )
        except Exception:
            pass

class TutorReviewsOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tutor_id):
        tutor = TutorProfile.objects.filter(tutor_id=tutor_id).first()
        if not tutor:
            return Response({"error": "Tutor not found"}, status=status.HTTP_404_NOT_FOUND)

        reviews = Review.objects.filter(tutor=tutor).order_by('-created_at')
        total_count = reviews.count()

        # Compute rating distribution
        distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        for r in reviews:
            if 1 <= r.rating <= 5:
                distribution[r.rating] += 1

        distribution_pct = {
            star: round((count / total_count * 100), 1) if total_count > 0 else 0
            for star, count in distribution.items()
        }

        # Serialized reviews
        serializer = ReviewSerializer(reviews, many=True, context={'request': request})

        # AI review summarization
        reviews_for_ai = [
            {
                "rating": r.rating,
                "comment": r.comment,
                "strengths": r.ai_strengths,
                "created_at": r.created_at.strftime("%Y-%m-%d")
            }
            for r in reviews[:20]
        ]
        tutor_name = tutor.user.full_name or tutor.tutor_id
        ai_summary = ai_service.summarize_reviews(tutor_name, reviews_for_ai)

        return Response({
            "tutor_id": tutor.tutor_id,
            "overall_rating": float(tutor.rating),
            "total_reviews": total_count,
            "rating_distribution": distribution,
            "rating_distribution_percentages": distribution_pct,
            "ai_insights": ai_summary,
            "reviews": serializer.data
        })

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
