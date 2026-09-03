from fastapi import APIRouter, HTTPException, Body, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import json
import os
from app.core.config import settings
from app.core.security import require_government_role

router = APIRouter(prefix="/complaints", tags=["Citizen Complaints"])

SAMPLE_GEOJSON_PATH = os.path.join(settings.SAMPLE_DATA_DIR, "sample_parcels.geojson")

def _parcel_exists(parcel_id: str) -> bool:
    if os.path.exists(SAMPLE_GEOJSON_PATH):
        with open(SAMPLE_GEOJSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            for feat in data.get("features", []):
                if feat.get("properties", {}).get("parcel_id", "").lower() == parcel_id.lower():
                    return True
    return False

# In-memory storage with initial complaints
COMPLAINTS_DB: List[Dict[str, Any]] = [
    {
        "id": 1,
        "complaint_no": "GRV-2026-0891",
        "parcel_id": "P2P-IND-MH-4005",
        "citizen_name": "Vikram Deshmukh",
        "citizen_phone": "+91 98220 12345",
        "citizen_email": "vikram.deshmukh@example.in",
        "title": "Property Boundary Encroachment & Offset Error",
        "description": "The AI drone boundary for survey 107/3 overlaps into my western perimeter by 1.8 meters. Seeking field resurvey verification.",
        "status": "Under Review",
        "current_stage": "Under Review",
        "officer_remarks": "Assigned to District Survey Officer for CORS point inspection.",
        "timeline": [
            {"stage": "Submitted", "timestamp": "2026-08-25T10:15:00Z", "note": "Complaint registered by citizen via P2P portal."},
            {"stage": "Under Review", "timestamp": "2026-08-26T14:30:00Z", "note": "Reviewed by Revenue Inspector. Forwarded to GIS Cell."}
        ],
        "created_at": "2026-08-25T10:15:00Z"
    },
    {
        "id": 2,
        "complaint_no": "GRV-2026-0892",
        "parcel_id": "P2P-IND-MH-4002",
        "citizen_name": "Ananya Verma",
        "citizen_phone": "+91 94210 67890",
        "citizen_email": "ananya.verma@example.in",
        "title": "Area Discrepancy in Survey 104/1B",
        "description": "Calculated drone area shows 920.8 sq.m, whereas 7/12 land extract states 925.0 sq.m. Requesting official reconciliation.",
        "status": "Field Verification",
        "current_stage": "Field Verification",
        "officer_remarks": "Field team deployed with DGPS on 29th Aug.",
        "timeline": [
            {"stage": "Submitted", "timestamp": "2026-08-27T11:00:00Z", "note": "Complaint filed with 7/12 extract attachment."},
            {"stage": "Under Review", "timestamp": "2026-08-28T09:00:00Z", "note": "Document verified."},
            {"stage": "Field Verification", "timestamp": "2026-08-29T10:00:00Z", "note": "DGPS survey team assigned."}
        ],
        "created_at": "2026-08-27T11:00:00Z"
    }
]

@router.get("")
async def list_complaints(role: str = Depends(require_government_role)):
    """Retrieve all citizen complaints for Government review dashboard. Requires Government Staff Role."""
    return {"complaints": COMPLAINTS_DB}

@router.get("/public/{complaint_no}")
async def public_track_complaint(complaint_no: str):
    """Public tracking endpoint for citizens by exact complaint number match only."""
    for cmp in COMPLAINTS_DB:
        if cmp["complaint_no"].lower() == complaint_no.lower():
            # Return complaint tracking detail
            return {
                "complaint_no": cmp["complaint_no"],
                "parcel_id": cmp["parcel_id"],
                "title": cmp["title"],
                "description": cmp["description"],
                "status": cmp["status"],
                "current_stage": cmp["current_stage"],
                "officer_remarks": cmp["officer_remarks"],
                "timeline": cmp["timeline"],
                "created_at": cmp["created_at"]
            }
    raise HTTPException(status_code=404, detail=f"Complaint number '{complaint_no}' not found. Please verify reference number.")

@router.get("/{complaint_no}")
async def get_complaint(complaint_no: str, role: str = Depends(require_government_role)):
    """Retrieve complaint details by complaint number for Government review."""
    for cmp in COMPLAINTS_DB:
        if cmp["complaint_no"].lower() == complaint_no.lower():
            return cmp
    raise HTTPException(status_code=404, detail=f"Complaint {complaint_no} not found.")

@router.post("/create")
async def create_complaint(payload: Dict[str, Any] = Body(...)):
    """File a new land parcel boundary complaint from Citizen Portal.
    Validates that the target parcel ID exists in the Cadastral Database before creating complaint.
    """
    parcel_id = payload.get("parcel_id", "").strip()
    if not parcel_id:
        raise HTTPException(status_code=400, detail="Target Parcel ID is required.")

    # Validate target parcel ID exists
    if not _parcel_exists(parcel_id):
        raise HTTPException(
            status_code=400,
            detail=f"Target Parcel ID '{parcel_id}' does not exist in the official Cadastral Database."
        )

    seq = len(COMPLAINTS_DB) + 893
    complaint_no = f"GRV-2026-{seq:04d}"
    now_iso = datetime.now(timezone.utc).isoformat()

    new_cmp = {
        "id": len(COMPLAINTS_DB) + 1,
        "complaint_no": complaint_no,
        "parcel_id": parcel_id,
        "citizen_name": payload.get("citizen_name", "Anonymous Citizen"),
        "citizen_phone": payload.get("citizen_phone", ""),
        "citizen_email": payload.get("citizen_email", ""),
        "title": payload.get("title", "Boundary Discrepancy"),
        "description": payload.get("description", ""),
        "status": "Submitted",
        "current_stage": "Submitted",
        "officer_remarks": "Awaiting initial review by District Survey Office.",
        "timeline": [
            {"stage": "Submitted", "timestamp": now_iso, "note": "Complaint filed successfully via Citizen Portal."}
        ],
        "created_at": now_iso
    }

    COMPLAINTS_DB.append(new_cmp)

    return {
        "status": "Success",
        "message": f"Complaint {complaint_no} registered successfully.",
        "complaint": new_cmp
    }

@router.patch("/{complaint_no}/update-stage")
async def update_complaint_stage(
    complaint_no: str,
    payload: Dict[str, Any] = Body(...),
    role: str = Depends(require_government_role)
):
    """Update complaint status & timeline from Government dashboard (Submitted -> Under Review -> Field Verification -> Resolved/Rejected).
    Requires Government Staff Role.
    """
    new_stage = payload.get("stage")
    remarks = payload.get("remarks", "")
    now_iso = datetime.now(timezone.utc).isoformat()

    for cmp in COMPLAINTS_DB:
        if cmp["complaint_no"] == complaint_no:
            cmp["status"] = new_stage
            cmp["current_stage"] = new_stage
            if remarks:
                cmp["officer_remarks"] = remarks

            cmp["timeline"].append({
                "stage": new_stage,
                "timestamp": now_iso,
                "note": remarks or f"Stage updated to {new_stage}."
            })
            return {"status": "Success", "complaint": cmp}

    raise HTTPException(status_code=404, detail="Complaint not found")
