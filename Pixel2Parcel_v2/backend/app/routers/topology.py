import os
import json
from fastapi import APIRouter
from app.core.config import settings
from app.services.gis_processor import GISProcessor
from app.routers.parcels import _load_parcels_geojson

router = APIRouter(prefix="/topology", tags=["Topology Validation"])

@router.get("/check")
async def run_topology_check():
    """Execute Shapely topology validation rules across active parcel geometries."""
    data = _load_parcels_geojson()
    parcels = data.get("features", [])

    issues = GISProcessor.validate_topology(parcels)

    return {
        "status": "Success",
        "total_parcels_checked": len(parcels),
        "total_issues_found": len(issues),
        "issues": issues
    }
