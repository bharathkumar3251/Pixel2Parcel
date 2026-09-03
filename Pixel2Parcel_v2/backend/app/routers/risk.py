from fastapi import APIRouter, Body
from typing import Dict, Any
from app.services.gis_processor import GISProcessor

router = APIRouter(prefix="/risk", tags=["Confidence & Risk Analytics"])

@router.post("/analyze")
async def analyze_confidence(payload: Dict[str, Any] = Body(...)):
    """Calculate mathematical confidence score (0-100) and risk category."""
    iou = payload.get("iou", 0.92)
    boundary_offset_m = payload.get("boundary_offset_m", 0.15)
    gnss_diff_m = payload.get("gnss_diff_m", 0.08)
    compactness = payload.get("compactness", 0.94)

    result = GISProcessor.calculate_confidence(iou, boundary_offset_m, gnss_diff_m, compactness)
    return result

@router.get("/heatmap")
async def get_risk_heatmap():
    """Return risk intensity points and polygon attributes for map spatial heatmap rendering."""
    heatmap_points = [
        {"lat": 18.5578, "lon": 73.7888, "intensity": 0.1, "risk_level": "Green", "parcel_id": "P2P-IND-MH-4001"},
        {"lat": 18.5579, "lon": 73.7896, "intensity": 0.65, "risk_level": "Amber", "parcel_id": "P2P-IND-MH-4002"},
        {"lat": 18.5588, "lon": 73.7890, "intensity": 0.05, "risk_level": "Green", "parcel_id": "P2P-IND-MH-4003"},
        {"lat": 18.5587, "lon": 73.7901, "intensity": 0.15, "risk_level": "Green", "parcel_id": "P2P-IND-MH-4004"},
        {"lat": 18.5579, "lon": 73.7906, "intensity": 0.95, "risk_level": "Red", "parcel_id": "P2P-IND-MH-4005"}
    ]
    return {"points": heatmap_points}
