import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_and_health():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "Online"

    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "Healthy"

def test_parcels_endpoints():
    response = client.get("/api/v1/parcels/list")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) > 0

    first_parcel_id = data["features"][0]["properties"]["parcel_id"]
    detail_resp = client.get(f"/api/v1/parcels/{first_parcel_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["properties"]["parcel_id"] == first_parcel_id

def test_public_parcel_lookup_serializer():
    response = client.get("/api/v1/parcels/public/lookup")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    
    # Verify sensitive PII fields are stripped in public serializer
    for feat in data["features"]:
        props = feat["properties"]
        assert "owner_phone" not in props
        assert "owner_email" not in props
        assert "citizen_phone" not in props
        assert "citizen_email" not in props

def test_parcel_exports():
    geojson_resp = client.get("/api/v1/parcels/export/geojson")
    assert geojson_resp.status_code == 200
    assert geojson_resp.headers["content-type"] == "application/json"

    kml_resp = client.get("/api/v1/parcels/export/kml")
    assert kml_resp.status_code == 200
    assert "application/vnd.google-earth.kml+xml" in kml_resp.headers["content-type"]
    assert "<kml" in kml_resp.text

def test_topology_endpoints():
    response = client.get("/api/v1/topology/check")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Success"
    assert "total_parcels_checked" in data

def test_risk_analytics_endpoints():
    payload = {
        "iou": 0.94,
        "boundary_offset_m": 0.10,
        "gnss_diff_m": 0.05,
        "compactness": 0.95
    }
    response = client.post("/api/v1/risk/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["confidence_score"] > 80.0
    assert data["risk_level"] == "Green"

    heatmap_resp = client.get("/api/v1/risk/heatmap")
    assert heatmap_resp.status_code == 200
    assert len(heatmap_resp.json()["points"]) > 0

def test_gnss_endpoints():
    response = client.get("/api/v1/verification/gnss/points")
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert "metrics" in data

def test_complaints_validation_and_public_tracking():
    # 1. Test complaint creation with invalid parcel ID (should fail 400)
    bad_payload = {
        "parcel_id": "NON-EXISTENT-PARCEL-9999",
        "citizen_name": "Test Citizen",
        "title": "Invalid Parcel Test"
    }
    bad_resp = client.post("/api/v1/complaints/create", json=bad_payload)
    assert bad_resp.status_code == 400
    assert "does not exist" in bad_resp.json()["detail"]

    # 2. Test complaint creation with valid parcel ID
    valid_payload = {
        "parcel_id": "P2P-IND-MH-4001",
        "citizen_name": "Test Citizen",
        "citizen_phone": "+91 99999 88888",
        "citizen_email": "test@example.in",
        "title": "Boundary Offset Test",
        "description": "Test complaint created by automated suite."
    }
    create_resp = client.post("/api/v1/complaints/create", json=valid_payload)
    assert create_resp.status_code == 200
    comp_no = create_resp.json()["complaint"]["complaint_no"]
    assert comp_no.startswith("GRV-2026-")

    # 3. Test public complaint tracking by exact complaint number
    track_resp = client.get(f"/api/v1/complaints/public/{comp_no}")
    assert track_resp.status_code == 200
    assert track_resp.json()["complaint_no"] == comp_no
    assert track_resp.json()["current_stage"] == "Submitted"

def test_role_gating_security():
    # Citizen session attempting government mutation (should fail 403 Forbidden)
    headers = {"X-User-Role": "Citizen"}
    
    patch_resp = client.patch(
        "/api/v1/complaints/GRV-2026-0891/update-stage",
        json={"stage": "Resolved", "remarks": "Unauthorized attempt"},
        headers=headers
    )
    assert patch_resp.status_code == 403

    save_geom_resp = client.post(
        "/api/v1/parcels/save-geometry",
        json={"parcel_id": "P2P-IND-MH-4001", "geometry": {"type": "Polygon", "coordinates": [[[73.78, 18.55], [73.79, 18.55], [73.79, 18.56], [73.78, 18.55]]]}},
        headers=headers
    )
    assert save_geom_resp.status_code == 403

    # Authorized Survey Officer session (should succeed 200)
    gov_headers = {"X-User-Role": "Survey Officer"}
    valid_patch = client.patch(
        "/api/v1/complaints/GRV-2026-0891/update-stage",
        json={"stage": "Under Review", "remarks": "Authorized review by Officer"},
        headers=gov_headers
    )
    assert valid_patch.status_code == 200
    assert valid_patch.json()["complaint"]["status"] == "Under Review"

def test_segmentation_endpoint():
    response = client.post("/api/v1/segmentation/run", json={"raster_path": "sample.tif"})
    assert response.status_code == 200
    assert response.json()["status"] == "Success"
    assert "extracted_layers" in response.json()

def test_reports_pdf_generator():
    response = client.get("/api/v1/reports/pdf/P2P-IND-MH-4001")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
