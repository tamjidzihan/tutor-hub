from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from apps.tutors.models import TutorProfile
from apps.tutors.serializers import TutorProfileListSerializer
from apps.reviews.models import Review
from .services import ai_service

class AIStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            "provider": ai_service.provider,
            "model": ai_service.model,
            "has_api_key": bool(ai_service.api_key),
            "features": [
                "review_sentiment_analysis",
                "tutor_review_summarization",
                "ai_tutor_recommendation",
                "feed_personalization",
                "content_moderation"
            ]
        })

class AIRecommendTutorsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        student_prefs = {
            "subject": request.data.get("subject", ""),
            "max_budget": request.data.get("max_budget"),
            "location": request.data.get("location", ""),
            "class_level": request.data.get("class_level", ""),
            "curriculum": request.data.get("curriculum", ""),
        }

        # Query verified/active candidate tutors
        candidates_qs = TutorProfile.objects.filter(is_available=True)[:40]
        serialized_candidates = TutorProfileListSerializer(candidates_qs, many=True).data

        ranked = ai_service.recommend_tutors(student_prefs, serialized_candidates)
        return Response({
            "results": ranked[:15],
            "total_matches": len(ranked),
            "applied_preferences": student_prefs
        })

class AISummarizeTutorReviewsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tutor_id = request.data.get("tutor_id")
        if not tutor_id:
            return Response({"error": "tutor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        tutor = TutorProfile.objects.filter(tutor_id=tutor_id).first()
        if not tutor:
            return Response({"error": "Tutor not found"}, status=status.HTTP_404_NOT_FOUND)

        reviews_qs = Review.objects.filter(tutor=tutor).order_by('-created_at')[:25]
        reviews_data = [
            {
                "rating": r.rating,
                "comment": r.comment,
                "strengths": r.ai_strengths if hasattr(r, 'ai_strengths') else [],
                "created_at": r.created_at.strftime("%Y-%m-%d")
            }
            for r in reviews_qs
        ]

        tutor_name = tutor.user.get_full_name() or tutor.user.email
        summary = ai_service.summarize_reviews(tutor_name, reviews_data)
        return Response(summary)
