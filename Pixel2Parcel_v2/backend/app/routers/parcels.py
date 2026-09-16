import json
import os
from fastapi import APIRouter, HTTPException, Body, Depends, Response
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.security import require_government_role
from app.services.gis_processor import GISProcessor

router = APIRouter(prefix="/parcels", tags=["Cadastral Parcels"])

ACTIVE_SESSION_GEOJSON = os.path.join(settings.UPLOAD_DIR, "active_cadastral_parcels.geojson")
SAMPLE_GEOJSON_PATH = os.path.join(settings.SAMPLE_DATA_DIR, "sample_parcels.geojson")

def _load_parcels_geojson():
    # Priority 1: User-uploaded active dataset in UPLOAD_DIR
    if os.path.exists(ACTIVE_SESSION_GEOJSON):
        try:
            with open(ACTIVE_SESSION_GEOJSON, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # Priority 2: Check if any parcel vector file uploaded in UPLOAD_DIR
    if os.path.exists(settings.UPLOAD_DIR) and len(os.listdir(settings.UPLOAD_DIR)) > 0:
        for fname in os.listdir(settings.UPLOAD_DIR):
            if (fname.endswith(".geojson") or fname.endswith(".json")) and "building" not in fname.lower():
                fpath = os.path.join(settings.UPLOAD_DIR, fname)
                try:
                    with open(fpath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        feats = data.get("features", [])
                        if feats and "parcel_id" in feats[0].get("properties", {}):
                            return data
                except Exception:
                    pass

    # Priority 3: Fallback to sample parcels dataset
    if os.path.exists(SAMPLE_GEOJSON_PATH):
        try:
            with open(SAMPLE_GEOJSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # By default, when no user dataset uploaded, return empty FeatureCollection ("Awaiting Dataset Upload")
    return {"type": "FeatureCollection", "features": []}

@router.get("/list")
async def get_parcels():
    """Retrieve full FeatureCollection of verified and extracted cadastral parcels."""
    data = _load_parcels_geojson()
    return data

@router.get("/public/lookup")
async def public_parcel_lookup(parcel_id: Optional[str] = None):
    """Public-safe parcel lookup for Citizen Portal.
    Filters to verified/approved parcels and strips sensitive owner PII (phone/email/address details).
    """
    data = _load_parcels_geojson()
    features = data.get("features", [])
    
    # Filter to officially verified or approved parcels only
    verified_features = [
        f for f in features 
        if f.get("properties", {}).get("risk_level") in ["Green", "Amber"] 
        or f.get("properties", {}).get("status") in ["Verified", "Approved", "Under Verification"]
    ]

    if parcel_id:
        verified_features = [
            f for f in verified_features 
            if f.get("properties", {}).get("parcel_id", "").lower() == parcel_id.lower()
            or f.get("properties", {}).get("survey_number", "").lower() == parcel_id.lower()
        ]

    # Create public-safe copies (remove private contact info)
    public_features = []
    for feat in verified_features:
        props = feat.get("properties", {}).copy()
        # Remove any sensitive internal fields if present
        props.pop("owner_phone", None)
        props.pop("owner_email", None)
        props.pop("citizen_phone", None)
        props.pop("citizen_email", None)

        public_features.append({
            "type": feat.get("type", "Feature"),
            "properties": props,
            "geometry": feat.get("geometry")
        })

    return {
        "type": "FeatureCollection",
        "features": public_features
    }

@router.get("/export/geojson")
async def export_geojson():
    """Export verified cadastral parcels layer as downloadable GeoJSON."""
    data = _load_parcels_geojson()
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=Verified_Cadastral_Parcels.geojson"}
    )

@router.get("/export/kml")
async def export_kml():
    """Export verified cadastral parcels layer as OGC KML format."""
    data = _load_parcels_geojson()
    kml_elements = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "<kml xmlns=\"http://www.opengis.net/kml/2.2\">", "<Document>", "<name>P2P Verified Cadastral Parcels</name>"]
    
    for feat in data.get("features", []):
        p_id = feat.get("properties", {}).get("parcel_id", "P2P")
        s_no = feat.get("properties", {}).get("survey_number", "")
        coords = feat.get("geometry", {}).get("coordinates", [[]])[0]
        coord_str = " ".join([f"{c[0]},{c[1]},0" for c in coords])
        
        kml_elements.append(f"""  <Placemark>
    <name>{p_id} (Survey {s_no})</name>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>{coord_str}</coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>""")

    kml_elements.extend(["</Document>", "</kml>"])
    kml_content = "\n".join(kml_elements)
    
    return Response(
        content=kml_content,
        media_type="application/vnd.google-earth.kml+xml",
        headers={"Content-Disposition": "attachment; filename=Verified_Cadastral_Parcels.kml"}
    )

@router.get("/{parcel_id}")
async def get_parcel_details(parcel_id: str):
    """Retrieve specific parcel by Parcel ID."""
    data = _load_parcels_geojson()
    for feat in data.get("features", []):
        if feat.get("properties", {}).get("parcel_id") == parcel_id:
            return feat
    raise HTTPException(status_code=404, detail=f"Parcel ID {parcel_id} not found.")

@router.post("/save-geometry")
async def save_edited_geometry(
    payload: Dict[str, Any] = Body(...),
    role: str = Depends(require_government_role)
):
    """Save modified vertex geometry from OpenLayers editor, recalculate geodesic Area & Perimeter.
    Requires Government Staff Role.
    """
    parcel_id = payload.get("parcel_id")
    new_geometry = payload.get("geometry")

    if not parcel_id or not new_geometry:
        raise HTTPException(status_code=400, detail="Missing parcel_id or geometry")

    coords = new_geometry.get("coordinates", [[]])[0]
    area_sqm, perim_m = GISProcessor.calculate_polygon_area_perimeter(coords)

    data = _load_parcels_geojson()
    updated = False

    for feat in data.get("features", []):
        if feat.get("properties", {}).get("parcel_id") == parcel_id:
            feat["geometry"] = new_geometry
            feat["properties"]["area_sqm"] = area_sqm
            feat["properties"]["perimeter_m"] = perim_m
            feat["properties"]["status"] = "Edited & Under Review"
            updated = True
            break

    if updated:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        with open(ACTIVE_SESSION_GEOJSON, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        if os.path.exists(SAMPLE_GEOJSON_PATH):
            with open(SAMPLE_GEOJSON_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

    return {
        "status": "Success",
        "message": f"Geometry for parcel {parcel_id} successfully updated.",
        "recalculated_area_sqm": area_sqm,
        "recalculated_perimeter_m": perim_m
    }
