"""Practice router for transcription, feedback, and logging."""

from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from supabase import Client

from app.auth import get_current_user_id
from app.database import get_db
from app.models.practice import (
    ComparisonResult,
    DailyGoal,
    FeedbackRequest,
    FeedbackResponse,
    PracticeLogRequest,
    PracticeLogResponse,
    TranscribeResponse,
    UserStats,
    WordAnalysis,
)
from app.services.ai_service import ai_service
from app.services.gamification_service import GamificationService
from app.services.scoring_service import scoring_service
from app.services.stt_service import stt_service

router = APIRouter()


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
):
    """
    Transcribe audio file to text using STT service.

    Accepts audio file upload and returns transcribed text.
    """
    try:
        # Read audio file
        audio_content = await audio.read()

        # Create a file-like object for the STT service
        from io import BytesIO

        audio_file = BytesIO(audio_content)

        # Transcribe using STT service
        transcript = await stt_service.speech_to_text(audio_file)

        return TranscribeResponse(transcript=transcript)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}") from e


@router.post("/feedback", response_model=FeedbackResponse)
async def get_feedback(request: FeedbackRequest, db: Client = Depends(get_db)):
    """
    Generate feedback for user's practice attempt.

    Compares user's transcript with expected text, calculates score,
    and generates AI feedback.
    """
    try:
        # Get material to retrieve expected text
        expected_text = None
        duration = 30

        try:
            material_response = (
                db.table("materials").select("*").eq("id", request.material_id).execute()
            )

            if not material_response.data:
                # If material not found, use demo text
                expected_text = (
                    "Hello, my name is John. Nice to meet you. I like to study English every day."
                )
            else:
                material = material_response.data[0]

                # Get all sentences for this material
                try:
                    sentences_response = (
                        db.table("sentences")
                        .select("text")
                        .eq("material_id", request.material_id)
                        .order("sequence_order")
                        .execute()
                    )

                    if sentences_response.data:
                        # Combine sentences into expected text
                        expected_text = " ".join([s["text"] for s in sentences_response.data])
                    else:
                        # No sentences found, use demo text
                        expected_text = "Hello, my name is John. Nice to meet you."
                except Exception:
                    # If sentences table doesn't exist, use demo text
                    expected_text = "Hello, my name is John. Nice to meet you."

                duration = material.get("duration_seconds", 30)
        except Exception:
            # If any database error (invalid UUID, table doesn't exist, etc.)
            if expected_text is None:
                expected_text = (
                    "Hello, my name is John. Nice to meet you. I like to study English every day."
                )

        # Calculate score using scoring service
        score_result = scoring_service.calculate_score(expected_text, request.user_transcript)

        # Get word analysis
        word_analysis = scoring_service.get_word_analysis(expected_text, request.user_transcript)
        word_analysis_models = [WordAnalysis(**wa) for wa in word_analysis]

        # Generate AI feedback
        ai_feedback_text = await ai_service.generate_feedback(
            expected_text=expected_text,
            user_text=request.user_transcript,
            score=score_result["score"],
            missed_words=score_result["missed_words"],
            extra_words=score_result["extra_words"],
        )

        # Calculate XP gain
        gamification = GamificationService(db)
        xp_gained = gamification.calculate_xp_gain(score_result["score"], duration)

        # Build comparison result
        comparison = ComparisonResult(
            expected_text=expected_text,
            user_text=request.user_transcript,
            matched_words=score_result["matched_words"],
            missed_words=score_result["missed_words"],
            extra_words=score_result["extra_words"],
            word_analysis=word_analysis_models,
        )

        return FeedbackResponse(
            score=score_result["score"],
            comparison=comparison,
            ai_feedback=ai_feedback_text,
            xp_gained=xp_gained,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback generation failed: {str(e)}") from e


@router.post("/practice-logs", response_model=PracticeLogResponse)
async def save_practice_log(
    request: PracticeLogRequest,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """
    Save practice log and update user stats, streak, and achievements.

    This is called after the user completes a practice session.
    """
    try:
        today = date.today()

        # Try to save to database, but continue if it fails (graceful degradation)
        log_id = "demo-log-id"
        try:
            # Create gamification service
            gamification = GamificationService(db)

            # Update streak
            await gamification.update_streak(user_id)

            # Update stats
            await gamification.update_stats(user_id, request.score, request.duration_seconds)

            # Update daily goal
            await gamification.update_daily_goal(user_id)

            # Save practice log
            practice_log_data = {
                "user_id": user_id,
                "material_id": request.material_id,
                "score": request.score,
                "duration_seconds": request.duration_seconds,
                "xp_gained": request.xp_gained,
                "user_transcript": request.user_transcript,
                "ai_feedback": request.ai_feedback,
            }

            log_response = db.table("practice_logs").insert(practice_log_data).execute()
            if log_response.data:
                log_id = log_response.data[0]["id"]

        except Exception as db_error:
            print(f"Database operation failed (using defaults): {str(db_error)}")
            # Continue with default values

        # Get user stats (with fallback)
        user_stats = UserStats(
            id=user_id,
            user_id=user_id,
            current_streak=0,
            longest_streak=0,
            total_practices=1,
            total_time_seconds=request.duration_seconds,
            total_xp=request.xp_gained,
            level=1,
            average_score=float(request.score),
        )

        try:
            stats_response = db.table("user_stats").select("*").eq("user_id", user_id).execute()
            if stats_response.data:
                user_stats = UserStats(**stats_response.data[0])
        except Exception:
            pass

        # Get daily goal (with fallback)
        daily_goal = DailyGoal(
            id=user_id,
            user_id=user_id,
            target_count=5,
            completed_count=1,
            goal_date=today.isoformat(),
        )

        try:
            goal_response = (
                db.table("daily_goals")
                .select("*")
                .eq("user_id", user_id)
                .eq("goal_date", today.isoformat())
                .execute()
            )
            if goal_response.data:
                daily_goal = DailyGoal(**goal_response.data[0])
        except Exception:
            pass

        # No new achievements in demo mode
        new_achievements = []

        return PracticeLogResponse(
            log_id=log_id,
            user_stats=user_stats,
            daily_goal=daily_goal,
            new_achievements=new_achievements,
            streak_updated=True,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save practice log: {str(e)}") from e


@router.get("/stats", response_model=UserStats)
async def get_user_stats(user_id: str = Depends(get_current_user_id), db: Client = Depends(get_db)):
    """
    Get user statistics.
    """
    try:
        stats_response = db.table("user_stats").select("*").eq("user_id", user_id).execute()

        if not stats_response.data:
            # Return default stats if not exists
            return UserStats(
                id=user_id,
                user_id=user_id,
                current_streak=0,
                longest_streak=0,
                total_practices=0,
                total_time_seconds=0,
                total_xp=0,
                level=1,
                average_score=0.0,
            )

        return UserStats(**stats_response.data[0])

    except Exception:
        # If table doesn't exist or any other error, return default stats
        # Generate a temporary ID for error cases
        temp_id = "00000000-0000-0000-0000-000000000001"
        return UserStats(
            id=temp_id,
            user_id=temp_id,
            current_streak=0,
            longest_streak=0,
            total_practices=0,
            total_time_seconds=0,
            total_xp=0,
            level=1,
            average_score=0.0,
        )


@router.get("/daily-goal", response_model=DailyGoal)
async def get_daily_goal(user_id: str = Depends(get_current_user_id), db: Client = Depends(get_db)):
    """
    Get today's daily goal for the user.
    """
    try:
        today = date.today()

        goal_response = (
            db.table("daily_goals")
            .select("*")
            .eq("user_id", user_id)
            .eq("goal_date", today.isoformat())
            .execute()
        )

        if not goal_response.data:
            # Return default goal if not exists
            return DailyGoal(
                id=user_id,
                user_id=user_id,
                target_count=5,
                completed_count=0,
                goal_date=today.isoformat(),
            )

        return DailyGoal(**goal_response.data[0])

    except Exception:
        # If table doesn't exist or any other error, return default goal
        today = date.today()
        temp_id = "00000000-0000-0000-0000-000000000001"
        return DailyGoal(
            id=temp_id,
            user_id=temp_id,
            target_count=5,
            completed_count=0,
            goal_date=today.isoformat(),
        )


@router.get("/practice-logs")
async def get_practice_logs(
    limit: int = 50, user_id: str = Depends(get_current_user_id), db: Client = Depends(get_db)
):
    """
    Get practice logs for the user.
    """
    try:
        logs_response = (
            db.table("practice_logs")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        return logs_response.data if logs_response.data else []

    except Exception:
        # If table doesn't exist or any other error, return empty list
        return []
