import { create } from 'zustand';
import { UserRole, GISLayer, ParcelFeature } from '../types/gis';
import { LanguageCode } from '../i18n/translations';

interface GISState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  activeBasemap: 'osm' | 'esri' | 'carto' | 'opentopo';
  setActiveBasemap: (basemap: 'osm' | 'esri' | 'carto' | 'opentopo') => void;

  viewMode: '2d' | '3d';
  setViewMode: (mode: '2d' | '3d') => void;

  layers: GISLayer[];
  toggleLayerVisibility: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  addLayer: (layer: GISLayer) => void;
  removeLayer: (id: string) => void;

  selectedParcel: ParcelFeature | null;
  setSelectedParcel: (parcel: ParcelFeature | null) => void;

  isEditingGeometry: boolean;
  setIsEditingGeometry: (editing: boolean) => void;

  mouseCoords: { lat: number; lon: number; utm: string } | null;
  setMouseCoords: (coords: { lat: number; lon: number; utm: string } | null) => void;

  // Signal for global data invalidation across upstream -> downstream modules
  dataVersion: number;
  triggerRefresh: () => void;
}

export const useGISStore = create<GISState>((set) => ({
  role: 'Survey Officer',
  setRole: (role) => set({ role }),

  language: 'en',
  setLanguage: (language) => set({ language }),

  activeBasemap: 'osm',
  setActiveBasemap: (activeBasemap) => set({ activeBasemap }),

  viewMode: '2d',
  setViewMode: (viewMode) => set({ viewMode }),

  layers: [
    { id: 'parcels', name: 'Cadastral Parcels (GeoJSON)', type: 'vector', visible: true, opacity: 0.85, featureCount: 5 },
    { id: 'buildings', name: 'AI Extracted Buildings', type: 'vector', visible: true, opacity: 0.75, featureCount: 2 },
    { id: 'gnss', name: 'CORS GNSS Field Points', type: 'vector', visible: true, opacity: 1.0, featureCount: 6 }
  ],
  toggleLayerVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    })),
  setLayerOpacity: (id, opacity) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, opacity } : l)),
    })),
  addLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
    })),
  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
    })),

  selectedParcel: null,
  setSelectedParcel: (selectedParcel) => set({ selectedParcel }),

  isEditingGeometry: false,
  setIsEditingGeometry: (isEditingGeometry) => set({ isEditingGeometry }),

  mouseCoords: null,
  setMouseCoords: (mouseCoords) => set({ mouseCoords }),

  dataVersion: 0,
  triggerRefresh: () => set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));
