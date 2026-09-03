import axios from 'axios';
import { ParcelFeatureCollection, TopologyIssue, GNSSPoint, ComplaintItem } from '../types/gis';
import { useGISStore } from '../store/gisStore';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor to attach active session role to request headers for server-side role gating
apiClient.interceptors.request.use((config) => {
  try {
    const currentRole = useGISStore.getState().role || 'Citizen';
    config.headers['X-User-Role'] = currentRole;
  } catch (e) {
    config.headers['X-User-Role'] = 'Citizen';
  }
  return config;
});

export const api = {
  // Parcels (Government)
  getParcels: async (): Promise<ParcelFeatureCollection> => {
    const res = await apiClient.get('/parcels/list');
    return res.data;
  },

  getPublicParcelLookup: async (parcelId?: string): Promise<ParcelFeatureCollection> => {
    const res = await apiClient.get('/parcels/public/lookup', {
      params: parcelId ? { parcel_id: parcelId } : {}
    });
    return res.data;
  },

  getParcelDetails: async (parcelId: string) => {
    const res = await apiClient.get(`/parcels/${parcelId}`);
    return res.data;
  },

  saveEditedGeometry: async (parcelId: string, geometry: any) => {
    const res = await apiClient.post('/parcels/save-geometry', {
      parcel_id: parcelId,
      geometry: geometry
    });
    return res.data;
  },

  exportGeoJSONUrl: () => `${API_BASE_URL}/parcels/export/geojson`,
  exportKMLUrl: () => `${API_BASE_URL}/parcels/export/kml`,

  // Survey Upload
  uploadSurvey: async (formData: FormData) => {
    const res = await apiClient.post('/survey/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getSurveys: async () => {
    const res = await apiClient.get('/survey/list');
    return res.data;
  },

  loadBenchmarkDataset: async () => {
    const res = await apiClient.post('/survey/load-sih-benchmark');
    return res.data;
  },

  // AI Segmentation
  runSegmentation: async (rasterPath: string) => {
    const res = await apiClient.post('/segmentation/run', { raster_path: rasterPath });
    return res.data;
  },

  // Topology Validation
  checkTopology: async () => {
    const res = await apiClient.get('/topology/check');
    return res.data;
  },

  // Risk & Confidence
  analyzeRisk: async (iou: number, offset: number, gnssDiff: number, compactness: number) => {
    const res = await apiClient.post('/risk/analyze', {
      iou,
      boundary_offset_m: offset,
      gnss_diff_m: gnssDiff,
      compactness
    });
    return res.data;
  },

  // GNSS Field Verification
  getGnssPoints: async (): Promise<{ points: GNSSPoint[]; metrics: any }> => {
    const res = await apiClient.get('/verification/gnss/points');
    return res.data;
  },

  // Complaints (Government & Citizen)
  getComplaints: async (): Promise<{ complaints: ComplaintItem[] }> => {
    const res = await apiClient.get('/complaints');
    return res.data;
  },

  getPublicComplaint: async (complaintNo: string) => {
    const res = await apiClient.get(`/complaints/public/${complaintNo}`);
    return res.data;
  },

  createComplaint: async (payload: any) => {
    const res = await apiClient.post('/complaints/create', payload);
    return res.data;
  },

  updateComplaintStage: async (complaintNo: string, stage: string, remarks?: string) => {
    const res = await apiClient.patch(`/complaints/${complaintNo}/update-stage`, {
      stage,
      remarks
    });
    return res.data;
  },

  // Reports
  getReportPdfUrl: (parcelId: string) => {
    return `${API_BASE_URL}/reports/pdf/${parcelId}`;
  },

  // Nominatim Address Search
  searchNominatim: async (query: string) => {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5
      }
    });
    return res.data;
  }
};
