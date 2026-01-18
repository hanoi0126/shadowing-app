"""Materials router for CRUD operations."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.auth import get_current_user_id
from app.database import get_db
from app.models.material import (
    MaterialCreateRequest,
    MaterialListItem,
    MaterialResponse,
    SentenceResponse,
)
from app.services.timestamp_service import timestamp_service
from app.services.tts_service import tts_service

router = APIRouter()


@router.post("/materials", response_model=MaterialResponse, status_code=201)
async def create_material(
    material: MaterialCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """
    Create a new material with TTS audio and timestamps.

    Flow:
    1. Generate audio from sentences using TTS
    2. Upload audio to Supabase Storage
    3. Generate timestamps for sentences
    4. Insert material and sentences into database
    5. Return material with audio URL and sentences
    """
    try:
        # Combine all sentences into single text for TTS
        full_text = " ".join(material.sentences)

        # Generate audio using TTS service
        audio_bytes, duration_seconds = await tts_service.text_to_speech(full_text)

        # Upload audio to Supabase Storage
        file_name = f"{uuid.uuid4()}.wav"
        db.storage.from_("audio-files").upload(
            file_name, audio_bytes, file_options={"content-type": "audio/wav"}
        )

        # Get public URL
        audio_url = db.storage.from_("audio-files").get_public_url(file_name)

        # Create material in database
        material_data = {
            "title": material.title,
            "description": material.description,
            "difficulty": material.difficulty,
            "audio_url": audio_url,
            "duration_seconds": duration_seconds,
            "created_by": user_id,
        }

        material_response = db.table("materials").insert(material_data).execute()

        if not material_response.data:
            raise HTTPException(status_code=500, detail="Failed to create material")

        material_id = material_response.data[0]["id"]

        # Generate timestamps for sentences
        timestamps = timestamp_service.generate_timestamps(material.sentences, duration_seconds)

        # Insert sentences with timestamps
        sentence_records = []
        for ts in timestamps:
            sentence_data = {
                "material_id": material_id,
                "text": ts["text"],
                "start_time": ts["start_time"],
                "end_time": ts["end_time"],
                "sequence_order": ts["sequence_order"],
            }
            sentence_records.append(sentence_data)

        if sentence_records:
            sentences_response = db.table("sentences").insert(sentence_records).execute()

            if not sentences_response.data:
                # Rollback: delete material if sentences failed
                db.table("materials").delete().eq("id", material_id).execute()
                raise HTTPException(status_code=500, detail="Failed to create sentences")

        # Fetch complete material with sentences
        complete_material = await get_material_by_id(material_id, db)

        return complete_material

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/materials", response_model=list[MaterialListItem])
async def list_materials(
    difficulty: str | None = None,
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(get_current_user_id),
    db: Client = Depends(get_db),
):
    """
    List user's materials with optional filtering.

    Query parameters:
    - difficulty: Filter by difficulty level
    - limit: Maximum number of results (default 50)
    - offset: Offset for pagination (default 0)
    """
    try:
        # Build query - filter by user
        query = db.table("materials").select("*").eq("created_by", user_id)

        if difficulty:
            query = query.eq("difficulty", difficulty)

        query = query.order("created_at", desc=True).limit(limit).offset(offset)

        response = query.execute()

        materials = []
        for material in response.data:
            # Get practice stats for this material (if user is authenticated)
            # For MVP, skip this for now
            material_item = MaterialListItem(
                id=material["id"],
                title=material["title"],
                description=material["description"],
                difficulty=material["difficulty"],
                audio_url=material.get("audio_url"),
                duration_seconds=material.get("duration_seconds"),
                created_at=material["created_at"],
                practice_count=0,
                best_score=None,
            )
            materials.append(material_item)

        return materials

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/materials/{material_id}", response_model=MaterialResponse)
async def get_material(material_id: str, db: Client = Depends(get_db)):
    """
    Get a single material with all sentences.
    """
    try:
        material = await get_material_by_id(material_id, db)
        return material

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


async def get_material_by_id(material_id: str, db: Client) -> MaterialResponse:
    """
    Helper function to get material with sentences.
    """
    # Get material
    material_response = db.table("materials").select("*").eq("id", material_id).execute()

    if not material_response.data:
        raise HTTPException(status_code=404, detail="Material not found")

    material_data = material_response.data[0]

    # Get sentences
    sentences_response = (
        db.table("sentences")
        .select("*")
        .eq("material_id", material_id)
        .order("sequence_order")
        .execute()
    )

    sentences = [
        SentenceResponse(
            id=s["id"],
            text=s["text"],
            start_time=s["start_time"],
            end_time=s["end_time"],
            sequence_order=s["sequence_order"],
        )
        for s in sentences_response.data
    ]

    return MaterialResponse(
        id=material_data["id"],
        title=material_data["title"],
        description=material_data["description"],
        difficulty=material_data["difficulty"],
        audio_url=material_data.get("audio_url"),
        duration_seconds=material_data.get("duration_seconds"),
        created_by=material_data.get("created_by"),
        created_at=material_data["created_at"],
        sentences=sentences,
    )


@router.delete("/materials/{material_id}", status_code=204)
async def delete_material(
    material_id: str, user_id: str = Depends(get_current_user_id), db: Client = Depends(get_db)
):
    """
    Delete a material owned by the user.
    """
    try:
        # Check if material exists and is owned by user
        material_response = (
            db.table("materials")
            .select("*")
            .eq("id", material_id)
            .eq("created_by", user_id)
            .execute()
        )

        if not material_response.data:
            raise HTTPException(
                status_code=404,
                detail="Material not found or you don't have permission to delete it",
            )

        material = material_response.data[0]

        # Delete audio file from storage if exists
        if material.get("audio_url"):
            # Extract file name from URL
            # This is a simplified version - in production, handle URL parsing properly
            try:
                file_name = material["audio_url"].split("/")[-1]
                db.storage.from_("audio-files").remove([file_name])
            except Exception:
                pass  # Continue even if storage deletion fails

        # Delete material (sentences will be cascade deleted)
        db.table("materials").delete().eq("id", material_id).execute()

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
