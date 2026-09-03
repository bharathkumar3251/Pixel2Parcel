import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "P2P – Pixel2Parcel"
    PROJECT_SUBTITLE: str = "Urban Cadastral Mapping & Parcel Verification Engine"
    DEPARTMENT: str = "Department of Land Resources (DoLR), Ministry of Rural Development, Govt of India"
    VERSION: str = "v1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Auth
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "p2p_dolr_secret_key_2026_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./p2p_gis.db")
    
    # File Storage Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    REPORT_OUTPUT_DIR: str = os.path.join(BASE_DIR, "generated_reports")
    SAMPLE_DATA_DIR: str = os.path.join(BASE_DIR, "app", "sample_data")
    
    # Auditable GIS Parameters
    DEFAULT_CRS: str = "EPSG:4326"
    MAX_UPLOAD_SIZE_MB: int = 500
    GNSS_RMSE_TOLERANCE_M: float = 0.15
    CRITICAL_OVERLAP_SQM: float = 5.0

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORT_OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_DATA_DIR, exist_ok=True)

