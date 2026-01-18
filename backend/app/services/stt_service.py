"""Speech-to-Text service with ElevenLabs API and mock fallback."""

import random
from typing import BinaryIO

from app.config import settings


class STTService:
    """Speech-to-Text service that switches between real and mock implementations."""

    def __init__(self):
        """Initialize STT service."""
        self.use_mock = settings.use_mock_stt

    async def speech_to_text(self, audio_file: BinaryIO) -> str:
        """
        Convert speech audio to text.

        Args:
            audio_file: Audio file binary data

        Returns:
            Transcribed text
        """
        if self.use_mock:
            return await self._generate_mock_transcript(audio_file)
        return await self._elevenlabs_stt(audio_file)

    async def _generate_mock_transcript(self, audio_file: BinaryIO) -> str:
        """
        Generate mock transcript for development.

        Returns a plausible transcript based on common phrases.

        Args:
            audio_file: Audio file (not used in mock)

        Returns:
            Mock transcript
        """
        # Sample phrases for mock transcripts
        mock_phrases = [
            "Hello, my name is John. Nice to meet you.",
            "I like to study English every day.",
            "The weather is beautiful today.",
            "Can you help me with this problem?",
            "I'm learning to speak more fluently.",
            "Practice makes perfect.",
            "Good morning! How are you today?",
            "Thank you very much for your help.",
            "I enjoy reading books in English.",
            "Let's have a great conversation.",
        ]

        # Return a random phrase or combination
        if random.random() < 0.7:
            return random.choice(mock_phrases)
        else:
            # Sometimes return a combination
            phrase1 = random.choice(mock_phrases)
            phrase2 = random.choice(mock_phrases)
            return f"{phrase1} {phrase2}"

    async def _elevenlabs_stt(self, audio_file: BinaryIO) -> str:
        """
        Call ElevenLabs API for speech-to-text.

        Args:
            audio_file: Audio file to transcribe

        Returns:
            Transcribed text
        """
        import httpx

        api_key = settings.elevenlabs_api_key
        url = "https://api.elevenlabs.io/v1/speech-to-text"

        headers = {"xi-api-key": api_key}

        # Read the audio content
        audio_content = audio_file.read()
        audio_file.seek(0)  # Reset file pointer

        files = {"audio": ("audio.webm", audio_content, "audio/webm")}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, files=files)
                response.raise_for_status()

                result = response.json()
                return result.get("text", "")
        except (httpx.HTTPError, Exception) as e:
            # If ElevenLabs API fails, fall back to mock transcript
            print(f"ElevenLabs STT failed: {str(e)}, falling back to mock")
            return await self._generate_mock_transcript(audio_file)


# Global STT service instance
stt_service = STTService()
