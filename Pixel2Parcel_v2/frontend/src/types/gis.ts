export type UserRole = 'Survey Officer' | 'GIS Analyst' | 'Admin' | 'Revenue Inspector' | 'Citizen';

export type RiskLevel = 'Green' | 'Amber' | 'Red';

export interface GISLayer {
  id: string;
  name: string;
  type: 'vector' | 'wms' | 'wmts' | 'raster';
  url?: string;
  visible: boolean;
  opacity: number;
  crs?: string;
  legendUrl?: string;
  featureCount?: number;
  data?: any;
}

export interface ParcelProperties {
  parcel_id: string;
  survey_number: string;
  ward_number: string;
  state: string;
  district: string;
  taluk: string;
  village: string;
  owner_name: string;
  land_use: string;
  area_sqm: number;
  perimeter_m: number;
  compactness: number;
  confidence_score: number;
  risk_level: RiskLevel;
  status: string;
}

export interface ParcelFeature {
  type: 'Feature';
  properties: ParcelProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface ParcelFeatureCollection {
  type: 'FeatureCollection';
  features: ParcelFeature[];
}

export interface TopologyIssue {
  id?: number;
  parcel_id: string;
  issue_type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  coordinates: [number, number];
}

export interface GNSSPoint {
  point_id: string;
  latitude: number;
  longitude: number;
  elevation: number;
  accuracy_m: number;
  timestamp: string;
}

export interface ComplaintTimelineItem {
  stage: string;
  timestamp: string;
  note: string;
}

export interface ComplaintItem {
  id: number;
  complaint_no: string;
  parcel_id: string;
  citizen_name: string;
  citizen_phone: string;
  citizen_email: string;
  title: string;
  description: string;
  status: string;
  current_stage: string;
  timeline: ComplaintTimelineItem[];
  officer_remarks?: string;
  created_at: string;
}
