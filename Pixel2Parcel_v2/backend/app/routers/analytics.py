from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any

router = APIRouter(
    prefix="/analytics",
    tags=["Government Intelligence Analytics"]
)

# 1. FAR / FSI Violation Audit Data
@router.get("/far-violations")
async def get_far_violations(
    state: Optional[str] = "Maharashtra",
    city: Optional[str] = "Pune Municipal Corporation (PMC)",
    ward: Optional[str] = "Ward 12 - Baner Smart Sector"
):
    return {
        "jurisdiction": {"state": state, "city": city, "ward": ward},
        "total_audited_structures": 142,
        "compliant_count": 128,
        "violation_count": 14,
        "total_penalty_estimated_inr": 4850000,
        "violations": [
            {
                "building_id": "BLD-BAN-107-A",
                "parcel_id": "P2P-IND-MH-4003",
                "survey_no": "107/3B",
                "owner": "Vertex Tech Parks Pvt. Ltd.",
                "land_use": "Commercial IT",
                "permitted_far": 2.50,
                "actual_far": 3.12,
                "permitted_height_m": 24.0,
                "actual_height_m": 30.0,
                "footprint_sqm": 1450,
                "excess_builtup_sqm": 3410,
                "violation_severity": "High (FAR > 2.50)",
                "penalty_notice_inr": 1705000,
                "status": "Notice Issued"
            },
            {
                "building_id": "BLD-BAN-104-C",
                "parcel_id": "P2P-IND-MH-4001",
                "survey_no": "104/1A",
                "owner": "Skyline Heights Co-Op Society",
                "land_use": "Residential High-Density",
                "permitted_far": 1.80,
                "actual_far": 2.25,
                "permitted_height_m": 15.0,
                "actual_height_m": 18.5,
                "footprint_sqm": 920,
                "excess_builtup_sqm": 1440,
                "violation_severity": "Medium (Unauthorized 6th Floor)",
                "penalty_notice_inr": 864000,
                "status": "Under Review"
            },
            {
                "building_id": "BLD-BAN-109-W",
                "parcel_id": "P2P-IND-MH-4004",
                "survey_no": "109/2C",
                "owner": "Industrial Fabrication Works",
                "land_use": "Industrial Light",
                "permitted_far": 1.50,
                "actual_far": 1.95,
                "permitted_height_m": 9.0,
                "actual_height_m": 12.0,
                "footprint_sqm": 1800,
                "excess_builtup_sqm": 2160,
                "violation_severity": "High (Setback & Height Breach)",
                "penalty_notice_inr": 1296000,
                "status": "Notice Pending"
            }
        ]
    }

# 2. Temporal AI Change Detection Data
@router.get("/temporal-changes")
async def get_temporal_changes(
    baseline_year: int = 2020,
    current_year: int = 2026
):
    return {
        "baseline_year": baseline_year,
        "current_year": current_year,
        "total_change_events": 28,
        "new_buildings_constructed": 12,
        "vertical_floor_extensions": 9,
        "encroachments_detected": 7,
        "net_builtup_expansion_sqm": 42500,
        "changes": [
            {
                "id": "EVT-2026-001",
                "parcel_id": "P2P-IND-MH-4003",
                "survey_no": "107/3B",
                "change_type": "Vertical Floor Addition (G+5 -> G+8)",
                "confidence_score": 0.96,
                "area_changed_sqm": 4350,
                "date_detected": "2026-04-12",
                "status": "Verified by AI"
            },
            {
                "id": "EVT-2026-002",
                "parcel_id": "P2P-IND-MH-4002",
                "survey_no": "105/2",
                "change_type": "Road Right-of-Way Encroachment",
                "confidence_score": 0.92,
                "area_changed_sqm": 180,
                "date_detected": "2026-06-04",
                "status": "Requires Field Audit"
            },
            {
                "id": "EVT-2026-003",
                "parcel_id": "P2P-IND-MH-4005",
                "survey_no": "112/1",
                "change_type": "New Structural Footprint",
                "confidence_score": 0.98,
                "area_changed_sqm": 2100,
                "date_detected": "2026-07-22",
                "status": "Approved Construction"
            }
        ]
    }

# 3. Municipal Property Tax Revenue Deficit Estimator Data
@router.get("/tax-deficits")
async def get_tax_deficits():
    return {
        "total_ward_tax_revenue_collected_inr": 84200000,
        "estimated_tax_evasion_leakage_inr": 12850000,
        "audited_parcels": 850,
        "mismatched_parcels": 64,
        "evasion_summary": [
            {
                "parcel_id": "P2P-IND-MH-4003",
                "owner": "Vertex Tech Parks Pvt. Ltd.",
                "declared_builtup_sqft": 85000,
                "ai_measured_builtup_sqft": 124800,
                "unreported_sqft": 39800,
                "annual_tax_paid_inr": 1275000,
                "actual_tax_due_inr": 1872000,
                "annual_deficit_inr": 597000,
                "penalty_inr": 298500
            },
            {
                "parcel_id": "P2P-IND-MH-4004",
                "owner": "Industrial Fabrication Works",
                "declared_builtup_sqft": 19300,
                "ai_measured_builtup_sqft": 38700,
                "unreported_sqft": 19400,
                "annual_tax_paid_inr": 289500,
                "actual_tax_due_inr": 580500,
                "annual_deficit_inr": 291000,
                "penalty_inr": 145500
            }
        ]
    }

# 4. Solar PV Rooftop Potential Data
@router.get("/solar-potential")
async def get_solar_potential(parcel_id: Optional[str] = "P2P-IND-MH-4003"):
    return {
        "parcel_id": parcel_id,
        "roof_area_sqm": 1450,
        "usable_solar_area_sqm": 1160,
        "solar_pv_capacity_kwp": 174.0,
        "annual_energy_generation_kwh": 261000,
        "annual_electricity_savings_inr": 2088000,
        "co2_reduction_tons_per_year": 214.0,
        "payback_period_years": 3.8
    }

# 5. Urban Flood Inundation Risk Data
@router.get("/flood-risk")
async def get_flood_risk(water_rise_m: float = 1.5):
    return {
        "simulated_water_rise_m": water_rise_m,
        "total_inundated_parcels": 8 if water_rise_m >= 2.0 else 3,
        "affected_population": 420 if water_rise_m >= 2.0 else 115,
        "high_risk_parcels": [
            {
                "parcel_id": "P2P-IND-MH-4001",
                "survey_no": "104/1A",
                "ground_elevation_m": 561.8,
                "water_depth_m": max(0.0, water_rise_m - 0.3),
                "risk_level": "High Flood Exposure",
                "evacuation_zone": "Evacuation Route Alpha-2"
            }
        ]
    }
