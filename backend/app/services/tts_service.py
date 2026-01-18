"""Text-to-Speech service with ElevenLabs API and mock fallback."""

from app.config import settings


class TTSService:
    """Text-to-Speech service that switches between real and mock implementations."""

    def __init__(self):
        """Initialize TTS service."""
        self.use_mock = settings.use_mock_tts

    async def text_to_speech(self, text: str) -> tuple[bytes, int]:
        """
        Convert text to speech audio.

        Args:
            text: Text to convert to speech

        Returns:
            Tuple of (audio_bytes, duration_seconds)
        """
        if self.use_mock:
            return await self._generate_mock_audio(text)
        return await self._elevenlabs_tts(text)

    async def _generate_mock_audio(self, text: str) -> tuple[bytes, int]:
        """
        Generate mock audio file for development.

        Creates a deterministic audio file based on text hash.
        In production with real API keys, this won't be used.

        Args:
            text: Input text

        Returns:
            Tuple of (audio_bytes, duration_seconds)
        """
        # Calculate approximate duration (avg 150 words per minute)
        word_count = len(text.split())
        duration = max(int(word_count / 150 * 60), 1)

        # Generate a simple WAV file header + silence
        # This is a minimal valid WAV file
        sample_rate = 22050
        num_samples = sample_rate * duration
        num_channels = 1
        bits_per_sample = 16

        # WAV header
        wav_header = bytearray()
        wav_header.extend(b"RIFF")
        wav_header.extend(
            (36 + num_samples * num_channels * bits_per_sample // 8).to_bytes(4, "little")
        )
        wav_header.extend(b"WAVE")
        wav_header.extend(b"fmt ")
        wav_header.extend((16).to_bytes(4, "little"))  # Format chunk size
        wav_header.extend((1).to_bytes(2, "little"))  # Audio format (PCM)
        wav_header.extend(num_channels.to_bytes(2, "little"))
        wav_header.extend(sample_rate.to_bytes(4, "little"))
        wav_header.extend((sample_rate * num_channels * bits_per_sample // 8).to_bytes(4, "little"))
        wav_header.extend((num_channels * bits_per_sample // 8).to_bytes(2, "little"))
        wav_header.extend(bits_per_sample.to_bytes(2, "little"))
        wav_header.extend(b"data")
        wav_header.extend((num_samples * num_channels * bits_per_sample // 8).to_bytes(4, "little"))

        # Generate silence (zeros)
        audio_data = bytes(num_samples * num_channels * bits_per_sample // 8)

        audio_bytes = bytes(wav_header) + audio_data

        return audio_bytes, duration

    async def _elevenlabs_tts(self, text: str) -> tuple[bytes, int]:
        """
        Call ElevenLabs API for text-to-speech.

        Args:
            text: Text to convert

        Returns:
            Tuple of (audio_bytes, duration_seconds)
        """
        import httpx

        api_key = settings.elevenlabs_api_key
        voice_id = "21m00Tcm4TlvDq8ikWAM"  # Default voice (Rachel)

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key,
        }

        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.5},
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()

            audio_bytes = response.content

            # Estimate duration (rough approximation)
            word_count = len(text.split())
            duration = max(int(word_count / 150 * 60), 1)

            return audio_bytes, duration


# Global TTS service instance
tts_service = TTSService()
