"""Database client initialization for Supabase."""

from supabase import Client, create_client

from app.config import settings


class Database:
    """Supabase database client wrapper."""

    def __init__(self):
        """Initialize Supabase client."""
        self.client: Client = create_client(settings.supabase_url, settings.supabase_service_key)

    def get_client(self) -> Client:
        """Get Supabase client instance."""
        return self.client


# Global database instance
db = Database()


def get_db() -> Client:
    """Dependency for FastAPI routes to get database client."""
    return db.get_client()
