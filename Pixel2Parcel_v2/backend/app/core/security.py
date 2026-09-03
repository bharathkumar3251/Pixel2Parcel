from fastapi import Header, HTTPException, Depends

GOVT_ROLES = ["Survey Officer", "GIS Analyst", "Revenue Inspector", "Admin"]

def require_government_role(x_user_role: str = Header("Citizen", alias="X-User-Role")):
    """Enforce server-side role check for government mutation operations."""
    if x_user_role not in GOVT_ROLES:
        raise HTTPException(
            status_code=403,
            detail=f"Forbidden: Action requires Government Staff role ({', '.join(GOVT_ROLES)}). Provided role: '{x_user_role}'"
        )
    return x_user_role
