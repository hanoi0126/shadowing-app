"""AI feedback service with Google Gemini API and mock fallback."""

import logging

from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """AI service for generating pronunciation feedback."""

    def __init__(self):
        """Initialize AI service."""
        # If no API key is provided, always use mock.
        # Otherwise, attempt Gemini and fall back to mock on any error.
        self.use_mock = settings.use_mock_ai

    async def generate_feedback(
        self,
        expected_text: str,
        user_text: str,
        score: float,
        missed_words: list[str],
        extra_words: list[str],
    ) -> str:
        """
        Generate AI feedback based on user performance.

        Args:
            expected_text: Original expected text
            user_text: User's transcribed text
            score: Calculated score (0-100)
            missed_words: Words user missed
            extra_words: Extra words user added

        Returns:
            AI-generated feedback text
        """
        if self.use_mock or not settings.google_api_key:
            return self._generate_mock_feedback(
                expected_text, user_text, score, missed_words, extra_words
            )
        return await self._gemini_feedback(
            expected_text, user_text, score, missed_words, extra_words
        )

    def _generate_mock_feedback(
        self,
        expected_text: str,
        user_text: str,
        score: float,
        missed_words: list[str],
        extra_words: list[str],
    ) -> str:
        """
        Generate template-based feedback.

        Args:
            expected_text: Original expected text
            user_text: User's transcribed text
            score: Calculated score
            missed_words: Words user missed
            extra_words: Extra words user added

        Returns:
            Mock feedback
        """
        feedback_parts = []

        # Score-based encouragement
        if score >= 90:
            feedback_parts.append("Excellent work! Your pronunciation is very clear and accurate.")
        elif score >= 80:
            feedback_parts.append("Great job! You're doing really well with your pronunciation.")
        elif score >= 70:
            feedback_parts.append("Good effort! You're making solid progress.")
        elif score >= 60:
            feedback_parts.append("Nice try! Keep practicing to improve further.")
        else:
            feedback_parts.append("Keep practicing! Every attempt makes you better.")

        # Specific feedback on mistakes
        if missed_words:
            if len(missed_words) <= 3:
                feedback_parts.append(
                    f"Focus on pronouncing these words more clearly: {', '.join(missed_words)}."
                )
            else:
                feedback_parts.append(
                    f"Try to include all words - you missed {len(missed_words)} words. "
                    "Slow down and enunciate each word carefully."
                )

        if extra_words:
            feedback_parts.append(
                "Be careful not to add extra words. Listen closely to the original audio."
            )

        # Encouragement
        if score < 100:
            feedback_parts.append("Keep practicing daily to see consistent improvement!")
        else:
            feedback_parts.append(
                "Perfect! Your hard work is paying off. Try more challenging materials!"
            )

        return " ".join(feedback_parts)

    async def _gemini_feedback(
        self,
        expected_text: str,
        user_text: str,
        score: float,
        missed_words: list[str],
        extra_words: list[str],
    ) -> str:
        """
        Call Google Gemini API for AI-generated feedback.

        Args:
            expected_text: Original expected text
            user_text: User's transcribed text
            score: Calculated score
            missed_words: Words user missed
            extra_words: Extra words user added

        Returns:
            AI-generated feedback
        """
        try:
            # Try new package first (google-genai)
            try:
                # Preferred import path
                from google import genai
            except Exception:
                # Some environments expose it as google.genai
                import google.genai as genai

                client = genai.Client(api_key=settings.google_api_key)

                prompt = f"""You are an encouraging English pronunciation coach.

A student practiced shadowing this text:
"{expected_text}"

Their transcribed speech was:
"{user_text}"

They scored {score}% accuracy.
Missed words: {", ".join(missed_words) if missed_words else "none"}
Extra words: {", ".join(extra_words) if extra_words else "none"}

Provide brief, encouraging feedback (2-3 sentences) focusing on:
1. What they did well
2. One specific area to improve
3. Motivation to keep practicing

Keep it friendly, supportive, and actionable."""

                response = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt,
                )

            text = getattr(response, "text", None)
            if isinstance(text, str) and text.strip():
                return text.strip()

            # Defensive fallback in case SDK response shape differs
            return str(response)

        except Exception as new_sdk_error:
            # Fall back to old package only if it's available.
            # This package is deprecated upstream, so we keep it as a last resort.
            try:
                import google.generativeai as genai

                genai.configure(api_key=settings.google_api_key)
                model = genai.GenerativeModel("gemini-pro")

                prompt = f"""You are an encouraging English pronunciation coach.

A student practiced shadowing this text:
"{expected_text}"

Their transcribed speech was:
"{user_text}"

They scored {score}% accuracy.
Missed words: {", ".join(missed_words) if missed_words else "none"}
Extra words: {", ".join(extra_words) if extra_words else "none"}

Provide brief, encouraging feedback (2-3 sentences) focusing on:
1. What they did well
2. One specific area to improve
3. Motivation to keep practicing

Keep it friendly, supportive, and actionable."""

                response = await model.generate_content_async(prompt)
                return response.text
            except Exception as old_sdk_error:
                logger.warning(
                    "Gemini API failed (new=%s, old=%s). Falling back to mock.",
                    repr(new_sdk_error),
                    repr(old_sdk_error),
                )
            return self._generate_mock_feedback(
                expected_text, user_text, score, missed_words, extra_words
            )


# Global AI service instance
ai_service = AIService()
