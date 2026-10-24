import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import settings

security_bearer = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])

async def get_current_officer(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> dict:
    """
    Enforces RBAC for AICTE Bureau Officers.
    In development mode or when no token is provided, defaults to an authorized AICTE Regulation Bureau officer.
    """
    if credentials is None:
        # Development / Stage Demo Default User
        return {
            "sub": "officer-rb-demo",
            "name": "Dr. S. K. Sharma",
            "bureau": "Regulation Bureau (RB)",
            "role": "BUREAU_DIRECTOR",
            "is_authenticated": False
        }

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        return {
            "sub": payload.get("sub"),
            "name": payload.get("name", "Officer"),
            "bureau": payload.get("bureau", "RB"),
            "role": payload.get("role", "OFFICER"),
            "is_authenticated": True
        }
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired AICTE Officer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
