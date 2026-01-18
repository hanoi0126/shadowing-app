"""Shadowing App Backend - FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="Shadowing App API",
    description="API for English shadowing practice with gamification",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "mock_mode": {
            "tts": settings.use_mock_tts,
            "stt": settings.use_mock_stt,
            "ai": settings.use_mock_ai
        }
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Shadowing App API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# Include routers
from app.routers import materials, practice
app.include_router(materials.router, prefix="/api", tags=["materials"])
app.include_router(practice.router, prefix="/api", tags=["practice"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
