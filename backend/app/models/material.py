"""Pydantic models for materials."""

from datetime import datetime

from pydantic import BaseModel, Field


class SentenceBase(BaseModel):
    """Base sentence model."""

    text: str = Field(..., min_length=1, description="Sentence text")


class SentenceCreate(SentenceBase):
    """Sentence creation model."""

    pass


class SentenceResponse(SentenceBase):
    """Sentence response model with timestamps."""

    id: str
    start_time: float = Field(..., description="Start time in seconds")
    end_time: float = Field(..., description="End time in seconds")
    sequence_order: int = Field(..., description="Order in the material")

    class Config:
        from_attributes = True


class MaterialBase(BaseModel):
    """Base material model."""

    title: str = Field(..., min_length=1, max_length=255, description="Material title")
    description: str | None = Field(None, description="Material description")
    difficulty: str = Field(
        ..., description="Difficulty level", pattern="^(beginner|intermediate|advanced)$"
    )


class MaterialCreateRequest(MaterialBase):
    """Material creation request."""

    sentences: list[str] = Field(..., min_items=1, description="List of sentences")


class MaterialResponse(MaterialBase):
    """Material response model."""

    id: str
    audio_url: str | None = Field(None, description="URL to audio file")
    duration_seconds: int | None = Field(None, description="Audio duration in seconds")
    created_by: str | None = None
    created_at: datetime
    sentences: list[SentenceResponse] = Field(
        default_factory=list, description="Sentences with timestamps"
    )

    class Config:
        from_attributes = True


class MaterialListItem(MaterialBase):
    """Material list item (without sentences)."""

    id: str
    audio_url: str | None = None
    duration_seconds: int | None = None
    created_at: datetime
    practice_count: int = Field(default=0, description="Number of times practiced")
    best_score: float | None = Field(None, description="Best score achieved")

    class Config:
        from_attributes = True
