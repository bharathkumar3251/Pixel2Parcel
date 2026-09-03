// Centralized GIS & System Configuration for P2P – Pixel2Parcel
// Ministry of Rural Development - Department of Land Resources (DoLR)

export const GIS_CONFIG = {
  APP_NAME: "P2P – Pixel2Parcel",
  APP_SUBTITLE: "Urban Cadastral Mapping & Parcel Verification Engine",
  GOVT_HEADER: "GOVERNMENT OF INDIA | Ministry of Rural Development | Department of Land Resources (DoLR)",
  VERSION: "v1.0.0",
  FOOTER_TEXT: "© 2026 Department of Land Resources (DoLR), Govt of India · NIC GIS Standards",
  DEFAULT_CRS: "EPSG:4326",
  MAX_UPLOAD_SIZE_MB: 500,

  // Mathematical Confidence Formula Weights:
  // Confidence = (15 × IoU) + max(0, 30 − 5 × Offset) + max(0, 30 − 4 × GNSS_Diff) + (15 × Compactness)
  CONFIDENCE_FORMULA: {
    IOU_WEIGHT: 15,
    OFFSET_BASE: 30,
    OFFSET_PENALTY_MULT: 5,
    GNSS_BASE: 30,
    GNSS_PENALTY_MULT: 4,
    COMPACTNESS_WEIGHT: 15,
  },

  // Risk Severity Thresholds (in sq.m and boolean flags)
  RISK_THRESHOLDS: {
    CRITICAL_OVERLAP_SQM: 5.0,
    HIGH_OVERLAP_SQM: 1.0,
    MEDIUM_OVERLAP_SQM: 0.1,
  },

  // Field Verification Tolerance (in meters)
  GNSS_TOLERANCE: {
    RMSE_THRESHOLD_M: 0.15, // Max allowable RMSE in meters for PASSED status
    WARNING_RMSE_M: 0.30,
  },

  // Map Defaults
  MAP: {
    DEFAULT_CENTER: [73.7895, 18.5582] as [number, number], // Baner, Pune
    DEFAULT_ZOOM: 16.5,
  }
};

