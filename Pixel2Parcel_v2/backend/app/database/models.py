from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="Survey Officer") # Survey Officer, GIS Analyst, Admin, Revenue Inspector, Citizen
    department = Column(String, default="DoLR")
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # GeoTIFF, GeoJSON, Shapefile, KML, GNSS_CSV
    file_path = Column(String, nullable=False)
    file_size_mb = Column(Float, default=0.0)
    crs = Column(String, default="EPSG:4326")
    epsg = Column(Integer, default=4326)
    bounding_box = Column(JSON) # [minx, miny, maxx, maxy]
    metadata_json = Column(JSON)
    uploaded_by = Column(String, default="Officer")
    created_at = Column(DateTime, default=datetime.utcnow)

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String, unique=True, index=True, nullable=False) # e.g. P2P-IND-MH-4001
    survey_number = Column(String, index=True)
    ward_number = Column(String, index=True)
    state = Column(String, default="Maharashtra")
    district = Column(String, default="Pune")
    taluk = Column(String, default="Haveli")
    village = Column(String, default="Baner")
    owner_name = Column(String, default="Government of Maharashtra / Land Revenue")
    area_sqm = Column(Float, nullable=False)
    perimeter_m = Column(Float, nullable=False)
    land_use = Column(String, default="Urban Residential") # Residential, Commercial, Agriculture, Open Land, Public Asset
    geometry_json = Column(JSON, nullable=False) # GeoJSON Feature or Geometry dict
    compactness_score = Column(Float, default=0.92)
    confidence_score = Column(Float, default=94.5)
    risk_level = Column(String, default="Green") # Green, Amber, Red
    status = Column(String, default="Draft") # Draft, Under Verification, Verified, Disputed, Approved
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(String, nullable=True)
    officer_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TopologyIssue(Base):
    __tablename__ = "topology_issues"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String, ForeignKey("parcels.parcel_id"))
    issue_type = Column(String, nullable=False) # Overlap, Gap, Self Intersection, Duplicate Geometry, Encroachment
    severity = Column(String, default="Medium") # Low, Medium, High, Critical
    description = Column(Text, nullable=False)
    geometry_json = Column(JSON, nullable=True)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class GNSSPoint(Base):
    __tablename__ = "gnss_points"

    id = Column(Integer, primary_key=True, index=True)
    point_id = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, default=0.0)
    accuracy_m = Column(Float, default=0.02)
    timestamp = Column(DateTime, default=datetime.utcnow)
    offset_m = Column(Float, default=0.15)
    verified_status = Column(String, default="Matched")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_no = Column(String, unique=True, index=True, nullable=False)
    parcel_id = Column(String, nullable=False)
    citizen_name = Column(String, nullable=False)
    citizen_phone = Column(String, nullable=False)
    citizen_email = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    geometry_json = Column(JSON, nullable=True)
    status = Column(String, default="Submitted") # Submitted, Under Review, Field Verification, Resolved, Rejected
    current_stage = Column(String, default="Submitted")
    timeline_json = Column(JSON, default=list)
    officer_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String, nullable=False)
    officer_name = Column(String, nullable=False)
    officer_role = Column(String, nullable=False)
    action = Column(String, nullable=False)
    remarks = Column(Text, nullable=True)
    prev_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
