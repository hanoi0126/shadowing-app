"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    # External APIs (optional)
    elevenlabs_api_key: str = ""
    google_api_key: str = ""

    # App Configuration
    environment: str = "development"
    cors_origins: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "case_sensitive": False, "extra": "ignore"}

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins string into list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def use_mock_tts(self) -> bool:
        """Check if we should use mock TTS service."""
        return not self.elevenlabs_api_key

    @property
    def use_mock_stt(self) -> bool:
        """Check if we should use mock STT service."""
        return not self.elevenlabs_api_key

    @property
    def use_mock_ai(self) -> bool:
        """Check if we should use mock AI service."""
        return not self.google_api_key


# Global settings instance
# Settings are loaded from environment variables (.env file)
settings = Settings()  # type: ignore[call-arg]
