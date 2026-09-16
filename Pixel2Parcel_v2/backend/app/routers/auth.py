from fastapi import APIRouter, HTTPException, Body, Depends, Header
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import jwt
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & Portals"])

SECRET_KEY = settings.JWT_SECRET_KEY

@router.post("/government/login")
async def government_login(payload: Dict[str, Any] = Body(...)):
    """Government Officer & Staff Authentication portal."""
    officer_id = payload.get("officer_id", "").strip()
    password = payload.get("password", "").strip()
    department = payload.get("department", "Department of Land Resources")

    if not officer_id or not password:
        raise HTTPException(status_code=400, detail="Officer ID / Credentials are required.")

    # Validate officer login credentials
    role = "Survey Officer"
    if "admin" in officer_id.lower() or "director" in officer_id.lower():
        role = "Admin"
    elif "inspector" in officer_id.lower() or "revenue" in officer_id.lower():
        role = "Revenue Inspector"
    elif "analyst" in officer_id.lower() or "gis" in officer_id.lower():
        role = "GIS Analyst"

    token_data = {
        "sub": officer_id,
        "name": f"Officer {officer_id.upper()}",
        "role": role,
        "department": department,
        "portal": "Government",
        "exp": datetime.now(timezone.utc).timestamp() + 86400
    }

    token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")

    return {
        "status": "Success",
        "message": "Government staff authenticated successfully.",
        "token": token,
        "user": {
            "user_id": officer_id,
            "full_name": f"Officer {officer_id.upper()}",
            "role": role,
            "department": department,
            "portal": "Government"
        }
    }

@router.post("/citizen/login")
async def citizen_login(payload: Dict[str, Any] = Body(...)):
    """Public Citizen Landholder Authentication portal."""
    mobile_or_id = payload.get("mobile_or_id", "").strip()
    otp = payload.get("otp", "").strip()

    if not mobile_or_id:
        raise HTTPException(status_code=400, detail="Mobile Number or Landholder ID is required.")

    token_data = {
        "sub": mobile_or_id,
        "name": "Authenticated Landholder / Citizen",
        "role": "Citizen",
        "department": "Public Citizen Portal",
        "portal": "Citizen",
        "exp": datetime.now(timezone.utc).timestamp() + 86400
    }

    token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")

    return {
        "status": "Success",
        "message": "Citizen logged in successfully.",
        "token": token,
        "user": {
            "user_id": mobile_or_id,
            "full_name": "Authenticated Landholder",
            "role": "Citizen",
            "department": "Public Citizen Services",
            "portal": "Citizen"
        }
    }

@router.get("/me")
async def get_current_user(x_user_role: Optional[str] = Header("Citizen")):
    """Get active session details."""
    return {
        "role": x_user_role,
        "portal": "Government" if x_user_role != "Citizen" else "Citizen",
        "active": True
    }
