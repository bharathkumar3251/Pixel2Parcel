from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.services.ai_segmenter import AISegmenter

router = APIRouter(prefix="/segmentation", tags=["AI Drone Segmentation"])

@router.post("/run")
async def run_segmentation(payload: Dict[str, Any] = Body(...)):
    """Run AI Segmentation pipeline on uploaded drone orthomosaic image."""
    raster_path = payload.get("raster_path", "")
    result = AISegmenter.run_drone_segmentation(raster_path)
    return result
