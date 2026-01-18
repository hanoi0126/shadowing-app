"""Timestamp service for generating sentence timing in audio."""

from typing import Any


class TimestampService:
    """Service for generating timestamps for sentences in audio."""

    @staticmethod
    def generate_timestamps(sentences: list[str], total_duration: int) -> list[dict[str, Any]]:
        """
        Generate timestamps for sentences based on word count.

        Uses a simple heuristic: distribute time proportionally based on
        the number of words in each sentence.

        Args:
            sentences: List of sentence texts
            total_duration: Total audio duration in seconds

        Returns:
            List of timestamp dictionaries with start_time, end_time, text
        """
        if not sentences:
            return []

        # Count words in each sentence
        word_counts = [len(sentence.split()) for sentence in sentences]
        total_words = sum(word_counts)

        if total_words == 0:
            return []

        timestamps = []
        current_time = 0.0

        for i, (sentence, word_count) in enumerate(zip(sentences, word_counts, strict=True)):
            # Calculate duration for this sentence
            sentence_duration = (word_count / total_words) * total_duration

            start_time = round(current_time, 3)
            end_time = round(current_time + sentence_duration, 3)

            # Ensure last sentence ends exactly at total duration
            if i == len(sentences) - 1:
                end_time = float(total_duration)

            timestamps.append(
                {
                    "text": sentence,
                    "start_time": start_time,
                    "end_time": end_time,
                    "sequence_order": i,
                }
            )

            current_time = end_time

        return timestamps


# Global timestamp service instance
timestamp_service = TimestampService()
