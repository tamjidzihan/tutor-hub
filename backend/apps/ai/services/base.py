from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseAIService(ABC):
    """
    Abstract AI service interface allowing pluggable LLM providers (Gemini, OpenAI, etc.).
    """

    @abstractmethod
    def analyze_review(self, comment: str, rating: int) -> Dict[str, Any]:
        """
        Analyze a written review for sentiment, key strengths, weaknesses, and a concise summary.
        """
        pass

    @abstractmethod
    def summarize_reviews(self, tutor_name: str, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate an aggregate performance review and key pedagogical traits for a tutor.
        """
        pass

    @abstractmethod
    def recommend_tutors(self, student_preferences: Dict[str, Any], candidate_tutors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank candidate tutors matching student goals with match score and rationale.
        """
        pass

    @abstractmethod
    def recommend_feed(self, user_interests: List[str], candidate_posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank community feed posts based on student/tutor educational interests.
        """
        pass

    @abstractmethod
    def moderate_content(self, text: str) -> Dict[str, Any]:
        """
        Check content for spam, toxicity, or inappropriate material.
        """
        pass
