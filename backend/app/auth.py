"""Authentication utilities for extracting user info from JWT tokens."""

import jwt
from fastapi import Header, HTTPException


async def get_current_user_id(authorization: str | None = Header(None)) -> str:
    """
    Extract user ID from JWT token in Authorization header.

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User ID (UUID string)

    Raises:
        HTTPException: If no valid token is provided
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please login with your Google account.",
        )

    try:
        # Remove "Bearer " prefix
        token = authorization.replace("Bearer ", "")

        # Decode JWT without signature verification
        # In production, you should verify with Supabase JWT secret
        payload = jwt.decode(token, options={"verify_signature": False})

        # Extract user ID from "sub" claim
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: user ID not found")

        return user_id

    except jwt.DecodeError as e:
        raise HTTPException(status_code=401, detail="Invalid token format") from e
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}") from e
