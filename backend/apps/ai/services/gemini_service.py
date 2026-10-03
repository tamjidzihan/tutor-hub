import os
import json
import logging
from typing import Dict, Any, List, Optional
import requests
from django.conf import settings
from .base import BaseAIService

logger = logging.getLogger(__name__)

class GeminiAIService(BaseAIService):
    """
    Google Gemini AI Service implementation.
    Model: gemini-1.5-flash (configurable via AI_MODEL or GEMINI_MODEL).
    Provider: gemini.
    Gracefully falls back to heuristic computation if the API key is not configured or network fails.
    """

    def __init__(self):
        self.api_key = getattr(
            settings,
            'AI_API_KEY',
            os.getenv('GEMINI_API_KEY', os.getenv('AI_API_KEY', ''))
        )
        self.model = getattr(
            settings,
            'AI_MODEL',
            os.getenv('AI_MODEL', 'gemini-1.5-flash')
        )
        self.provider = getattr(settings, 'AI_PROVIDER', 'gemini')
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def _call_gemini(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        if not self.api_key:
            return None

        headers = {'Content-Type': 'application/json'}
        url = f"{self.base_url}?key={self.api_key}"

        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
            else:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.warning(f"Gemini API invocation failed: {e}")

        return None

    def analyze_review(self, comment: str, rating: int) -> Dict[str, Any]:
        """
        Analyze student review using Gemini, falling back to rule-based analysis.
        """
        prompt = (
            f"Analyze this student review for a private tutor in Bangladesh.\n"
            f"Rating: {rating}/5\n"
            f"Review: \"{comment}\"\n"
            f"Return JSON with format:\n"
            f'{{"sentiment": "Positive|Neutral|Negative", "summary": "One sentence summary", "strengths": ["trait1", "trait2"], "weaknesses": ["area1"]}}'
        )

        response_text = self._call_gemini(prompt)
        if response_text:
            try:
                parsed = json.loads(response_text)
                return {
                    "sentiment": parsed.get("sentiment", "Positive" if rating >= 4 else "Neutral"),
                    "summary": parsed.get("summary", comment[:120]),
                    "strengths": parsed.get("strengths", []),
                    "weaknesses": parsed.get("weaknesses", []),
                    "ai_powered": True
                }
            except Exception:
                pass

        # Robust Heuristic Fallback
        sentiment = "Positive" if rating >= 4 else ("Neutral" if rating == 3 else "Negative")
        strengths = []
        weaknesses = []

        lower = comment.lower()
        if any(w in lower for w in ['clear', 'explain', 'concept', 'good teacher', 'great', 'excellent', 'helpful', 'patient', 'best']):
            strengths.append("Clear Conceptual Explanations")
        if any(w in lower for w in ['punctual', 'regular', 'time', 'dedicated', 'responsible', 'discipline']):
            strengths.append("Punctual & Disciplined")
        if any(w in lower for w in ['friendly', 'caring', 'polite', 'cooperative']):
            strengths.append("Approachable & Engaging")
        if not strengths and rating >= 4:
            strengths = ["Strong Subject Knowledge", "Dedicated Mentorship"]

        if rating <= 2 or any(w in lower for w in ['late', 'irregular', 'fast', 'slow', 'miss', 'strict']):
            weaknesses.append("Pacing or scheduling consistency could improve")

        return {
            "sentiment": sentiment,
            "summary": comment[:140] if len(comment) > 140 else comment,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "ai_powered": False
        }

    def summarize_reviews(self, tutor_name: str, reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not reviews:
            return {
                "overall_summary": f"No student reviews yet for {tutor_name}.",
                "highlight_points": [],
                "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                "ai_powered": False
            }

        prompt = (
            f"You are evaluating private tutor '{tutor_name}'. Summarize these {len(reviews)} student reviews:\n"
            f"{json.dumps(reviews[:15])}\n"
            f"Return JSON format:\n"
            f'{{"overall_summary": "1-2 sentence overall summary", "highlight_points": ["point1", "point2"], "sentiment_breakdown": "predominantly positive/mixed"}}'
        )

        response_text = self._call_gemini(prompt)
        if response_text:
            try:
                parsed = json.loads(response_text)
                return {
                    "overall_summary": parsed.get("overall_summary", ""),
                    "highlight_points": parsed.get("highlight_points", []),
                    "sentiment_breakdown": parsed.get("sentiment_breakdown", "Positive"),
                    "ai_powered": True
                }
            except Exception:
                pass

        # Heuristic fallback
        avg_rating = sum(r.get('rating', 5) for r in reviews) / len(reviews)
        traits = set()
        for r in reviews:
            for s in r.get('strengths', []):
                traits.add(s)

        summary = (
            f"{tutor_name} holds an average student rating of {avg_rating:.1f}/5.0 across {len(reviews)} reviews. "
            f"Students particularly value their strong conceptual mastery and supportive teaching methodology."
        )

        return {
            "overall_summary": summary,
            "highlight_points": list(traits)[:4] or ["Engaging teaching style", "Solid academic foundation"],
            "sentiment_breakdown": "Positive" if avg_rating >= 4.0 else "Mixed",
            "ai_powered": False
        }

    def recommend_tutors(self, student_preferences: Dict[str, Any], candidate_tutors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        target_subject = str(student_preferences.get('subject', '')).lower()
        max_budget = student_preferences.get('max_budget') or 999999
        location = str(student_preferences.get('location', '')).lower()

        # Score candidates
        scored = []
        for t in candidate_tutors:
            score = 50
            reasons = []

            # Rating bonus
            rating = float(t.get('rating') or 5.0)
            score += int((rating - 3.0) * 15)

            # Verification bonus
            if t.get('is_verified'):
                score += 15
                reasons.append("Verified Academic Credentials")

            # Budget match
            expected = int(t.get('expected_salary') or 0)
            if expected <= max_budget:
                score += 15
                reasons.append(f"Within budget (৳{expected})")

            # Location match
            t_loc = f"{t.get('city', '')} {t.get('area', '')} {' '.join(t.get('preferred_locations', []))}".lower()
            if location and location in t_loc:
                score += 15
                reasons.append(f"Serves {t.get('area') or location.title()}")

            # Subject match
            subjects = [str(s).lower() for s in t.get('subjects', [])]
            if target_subject and any(target_subject in s for s in subjects):
                score += 20
                reasons.append(f"Expert in {target_subject.title()}")

            scored.append({
                **t,
                "ai_match_score": min(score, 99),
                "ai_recommendation_reasons": reasons or ["High completion profile", "Qualified tutor"]
            })

        scored.sort(key=lambda x: x["ai_match_score"], reverse=True)
        return scored

    def recommend_feed(self, user_interests: List[str], candidate_posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        ranked = []
        interests_lower = [i.lower() for i in user_interests]

        for p in candidate_posts:
            score = 10
            content = f"{p.get('content', '')} {' '.join(p.get('tags', []))}".lower()
            category = str(p.get('category', '')).lower()

            for interest in interests_lower:
                if interest in content or interest in category:
                    score += 25

            # Engagement points
            score += min(p.get('likes_count', 0) * 2, 20)
            score += min(p.get('comments_count', 0) * 3, 20)

            ranked.append({
                **p,
                "relevance_score": score,
                "is_recommended": score >= 35
            })

        ranked.sort(key=lambda x: (x["is_recommended"], x["relevance_score"]), reverse=True)
        return ranked

    def moderate_content(self, text: str) -> Dict[str, Any]:
        """
        Check for inappropriate keywords or spam.
        """
        bad_words = ['scam', 'cheat', 'hack', 'porn', 'abuse', 'kill', 'fraud']
        text_lower = text.lower()
        flagged = [w for w in bad_words if w in text_lower]

        return {
            "is_appropriate": len(flagged) == 0,
            "flagged_keywords": flagged,
            "action": "FLAG" if flagged else "APPROVE"
        }

# Global singleton service
ai_service = GeminiAIService()
