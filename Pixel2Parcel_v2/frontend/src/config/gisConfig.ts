// Centralized GIS & System Configuration for P2P – Pixel2Parcel Urban
// Ministry of Housing and Urban Affairs (MoHUA) / Municipal Land Records Directorate

export const GIS_CONFIG = {
  APP_NAME: "Pixel2Parcel Urban GIS",
  APP_SUBTITLE: "Municipal Urban Cadastral Mapping & Property Card (PR Card) Engine",
  GOVT_HEADER: "GOVERNMENT OF INDIA | Ministry of Housing and Urban Affairs (MoHUA) | Smart Cities Municipal Cadastre",
  VERSION: "v1.0.0 Enterprise",
  FOOTER_TEXT: "© 2026 Ministry of Housing and Urban Affairs (MoHUA), Govt of India · National Spatial Data Infrastructure (NSDI)",
  DEFAULT_CRS: "EPSG:4326 / UTM Zone 43N",
  MAX_UPLOAD_SIZE_MB: 500,

  // Urban Land Terminology
  TERMINOLOGY: {
    SURVEY_LABEL: "CTS No. (City Survey Number)",
    PROPERTY_CARD_LABEL: "Property Register Card (PR Card)",
    WARD_LABEL: "Municipal Ward & Sector",
    CORP_LABEL: "Municipal Corporation / ULB",
  },

  // Mathematical Confidence Formula Weights:
  CONFIDENCE_FORMULA: {
    IOU_WEIGHT: 15,
    OFFSET_BASE: 30,
    OFFSET_PENALTY_MULT: 5,
    GNSS_BASE: 30,
    GNSS_PENALTY_MULT: 4,
    COMPACTNESS_WEIGHT: 15,
  },

  // Risk Severity Thresholds (in sq.m)
  RISK_THRESHOLDS: {
    CRITICAL_OVERLAP_SQM: 5.0,
    HIGH_OVERLAP_SQM: 1.0,
    MEDIUM_OVERLAP_SQM: 0.1,
  },

  // Sub-5cm Field Verification Tolerance for High-Density Urban Parcels
  GNSS_TOLERANCE: {
    RMSE_THRESHOLD_M: 0.05, // Sub-5cm precision for urban property values
    WARNING_RMSE_M: 0.15,
  },

  // Map Defaults (Pune Municipal Sector 12 - Baner Smart City Cadastre)
  MAP: {
    DEFAULT_CENTER: [73.7895, 18.5582] as [number, number],
    DEFAULT_ZOOM: 16.8,
  }
};

