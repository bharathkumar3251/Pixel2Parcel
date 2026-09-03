import csv
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Depends
from typing import List, Dict, Any
from app.core.config import settings
from app.core.security import require_government_role
from app.services.gis_processor import GISProcessor

router = APIRouter(prefix="/verification/gnss", tags=["GNSS CORS Field Verification"])

@router.post("/upload")
async def upload_gnss_csv(
    file: UploadFile = File(...),
    role: str = Depends(require_government_role)
):
    """Upload GNSS field points CSV and compare against cadastral boundaries."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    content = await file.read()
    lines = content.decode('utf-8').splitlines()
    reader = csv.DictReader(lines)

    points = []
    for row in reader:
        try:
            points.append({
                "point_id": row.get("point_id", f"PT-{len(points)+1}"),
                "latitude": float(row.get("latitude", 0.0)),
                "longitude": float(row.get("longitude", 0.0)),
                "elevation": float(row.get("elevation", 0.0)),
                "accuracy_m": float(row.get("accuracy_m", 0.02)),
                "timestamp": row.get("timestamp", "2026-08-28T09:30:00Z")
            })
        except Exception:
            continue

    sample_coords = [[73.7885, 18.5575], [73.7892, 18.5575], [73.7892, 18.5582], [73.7885, 18.5582]]
    metrics = GISProcessor.calculate_gnss_deviation(points, sample_coords)

    return {
        "status": "Success",
        "total_points_loaded": len(points),
        "gnss_points": points,
        "deviation_metrics": metrics
    }

@router.get("/points")
async def get_sample_gnss_points():
    """Retrieve benchmark CORS field survey points."""
    sample_csv = os.path.join(settings.SAMPLE_DATA_DIR, "sample_gnss.csv")
    points = []
    if os.path.exists(sample_csv):
        with open(sample_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                points.append({
                    "point_id": row["point_id"],
                    "latitude": float(row["latitude"]),
                    "longitude": float(row["longitude"]),
                    "elevation": float(row["elevation"]),
                    "accuracy_m": float(row["accuracy_m"]),
                    "timestamp": row["timestamp"]
                })

    sample_coords = [[73.7885, 18.5575], [73.7892, 18.5575], [73.7892, 18.5582], [73.7885, 18.5582]]
    metrics = GISProcessor.calculate_gnss_deviation(points, sample_coords)

    return {
        "points": points,
        "metrics": metrics
    }
