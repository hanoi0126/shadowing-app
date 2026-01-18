"""Scoring service for comparing user transcripts with expected text."""

import re
from typing import Any


class ScoringService:
    """Service for calculating pronunciation accuracy scores."""

    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean text for comparison.

        Args:
            text: Raw text

        Returns:
            Cleaned text (lowercase, no punctuation)
        """
        # Convert to lowercase
        text = text.lower()
        # Remove punctuation
        text = re.sub(r"[^\w\s]", "", text)
        # Normalize whitespace
        text = " ".join(text.split())
        return text

    def calculate_score(self, expected_text: str, user_text: str) -> dict[str, Any]:
        """
        Calculate pronunciation score using word-level matching.

        Algorithm:
        1. Clean both texts (lowercase, remove punctuation)
        2. Split into words
        3. Calculate intersection
        4. Score = (matched words / total expected words) × 100

        Args:
            expected_text: Original expected text
            user_text: User's transcribed text

        Returns:
            Dictionary containing:
            - score: Percentage score (0-100)
            - matched_words: List of correctly matched words
            - missed_words: Words user didn't say
            - extra_words: Words user added that weren't in original
            - total_words: Total words in expected text
        """
        # Clean texts
        expected_clean = self.clean_text(expected_text)
        user_clean = self.clean_text(user_text)

        # Split into words
        expected_words = expected_clean.split()
        user_words = user_clean.split()

        # Convert to sets for comparison
        expected_set = set(expected_words)
        user_set = set(user_words)

        # Calculate matches
        matched_words = expected_set.intersection(user_set)
        missed_words = expected_set - user_set
        extra_words = user_set - expected_set

        # Calculate score
        total_words = len(expected_words)
        if total_words == 0:
            score = 100.0
        else:
            # Use word-level matching
            matched_count = len(matched_words)
            score = round((matched_count / total_words) * 100, 2)

        return {
            "score": score,
            "matched_words": sorted(matched_words),
            "missed_words": sorted(missed_words),
            "extra_words": sorted(extra_words),
            "total_words": total_words,
            "matched_count": len(matched_words),
        }

    def get_word_analysis(self, expected_text: str, user_text: str) -> list[dict[str, Any]]:
        """
        Get detailed word-by-word analysis.

        Args:
            expected_text: Original expected text
            user_text: User's transcribed text

        Returns:
            List of word analysis objects with status (correct/missed/extra)
        """
        expected_clean = self.clean_text(expected_text)
        user_clean = self.clean_text(user_text)

        expected_words = expected_clean.split()
        user_words = user_clean.split()

        user_set = set(user_words)

        analysis = []
        for word in expected_words:
            analysis.append({"word": word, "status": "correct" if word in user_set else "missed"})

        # Add extra words
        expected_set = set(expected_words)
        for word in user_words:
            if word not in expected_set:
                analysis.append({"word": word, "status": "extra"})

        return analysis


# Global scoring service instance
scoring_service = ScoringService()
