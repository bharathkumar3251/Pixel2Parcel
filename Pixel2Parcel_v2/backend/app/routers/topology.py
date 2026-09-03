import os
import json
from fastapi import APIRouter
from app.core.config import settings
from app.services.gis_processor import GISProcessor

router = APIRouter(prefix="/topology", tags=["Topology Validation"])

SAMPLE_GEOJSON_PATH = os.path.join(settings.SAMPLE_DATA_DIR, "sample_parcels.geojson")

@router.get("/check")
async def run_topology_check():
    """Execute Shapely topology validation rules across parcel geometries."""
    parcels = []
    if os.path.exists(SAMPLE_GEOJSON_PATH):
        with open(SAMPLE_GEOJSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            parcels = data.get("features", [])

    issues = GISProcessor.validate_topology(parcels)

    return {
        "status": "Success",
        "total_parcels_checked": len(parcels),
        "total_issues_found": len(issues),
        "issues": issues
    }
