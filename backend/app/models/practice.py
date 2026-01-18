"""Pydantic models for practice and feedback."""

from datetime import datetime

from pydantic import BaseModel, Field


class TranscribeRequest(BaseModel):
    """Request for transcribing audio."""

    # Audio file will be uploaded as multipart/form-data
    pass


class TranscribeResponse(BaseModel):
    """Response from transcription."""

    transcript: str = Field(..., description="Transcribed text")


class FeedbackRequest(BaseModel):
    """Request for feedback on practice."""

    material_id: str = Field(..., description="Material ID")
    user_transcript: str = Field(..., description="User's transcribed text")


class WordAnalysis(BaseModel):
    """Word-level analysis."""

    word: str
    status: str = Field(..., description="correct, missed, or extra")


class ComparisonResult(BaseModel):
    """Comparison between expected and user text."""

    expected_text: str
    user_text: str
    matched_words: list[str]
    missed_words: list[str]
    extra_words: list[str]
    word_analysis: list[WordAnalysis]


class FeedbackResponse(BaseModel):
    """Response with score and AI feedback."""

    score: float = Field(..., ge=0, le=100, description="Score percentage")
    comparison: ComparisonResult
    ai_feedback: str = Field(..., description="AI-generated feedback")
    xp_gained: int = Field(..., description="XP gained from this practice")


class PracticeLogRequest(BaseModel):
    """Request to save practice log."""

    material_id: str
    score: float
    duration_seconds: int
    user_transcript: str
    ai_feedback: str
    xp_gained: int


class Achievement(BaseModel):
    """Achievement model."""

    id: str
    achievement_type: str
    title: str
    description: str
    icon: str
    unlocked_at: datetime

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    """User statistics model."""

    id: str
    user_id: str
    current_streak: int
    longest_streak: int
    total_practices: int
    total_time_seconds: int
    total_xp: int
    level: int
    average_score: float

    class Config:
        from_attributes = True


class DailyGoal(BaseModel):
    """Daily goal model."""

    id: str
    user_id: str
    target_count: int
    completed_count: int
    goal_date: str

    class Config:
        from_attributes = True


class PracticeLogResponse(BaseModel):
    """Response after saving practice log."""

    log_id: str
    user_stats: UserStats
    daily_goal: DailyGoal
    new_achievements: list[Achievement] = Field(default_factory=list)
    streak_updated: bool = Field(default=False)
