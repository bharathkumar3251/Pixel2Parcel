import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style';
import { ScaleLine, OverviewMap } from 'ol/control';
import { fromLonLat, toLonLat } from 'ol/proj';
import proj4 from 'proj4';
import { useGISStore } from '../../store/gisStore';
import { api } from '../../services/api';
import { ParcelFeature } from '../../types/gis';
import { Modify, Select, Snap } from 'ol/interaction';
import { click } from 'ol/events/condition';

// Define Proj4 for Indian UTM Zone 43N (EPSG:32643)
proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");

export const OpenLayersMap: React.FC = () => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const fetchReqIdRef = useRef<number>(0);

  // Vector Sources
  const parcelsSourceRef = useRef<VectorSource>(new VectorSource());
  const buildingsSourceRef = useRef<VectorSource>(new VectorSource());
  const gnssSourceRef = useRef<VectorSource>(new VectorSource());

  // Vector Layer References
  const parcelsLayerRef = useRef<VectorLayer<any> | null>(null);
  const buildingsLayerRef = useRef<VectorLayer<any> | null>(null);
  const gnssLayerRef = useRef<VectorLayer<any> | null>(null);

  const modifyInteractionRef = useRef<Modify | null>(null);
  const snapInteractionRef = useRef<Snap | null>(null);

  const {
    activeBasemap,
    setSelectedParcel,
    setMouseCoords,
    isEditingGeometry,
    layers,
    selectedParcel,
    dataVersion,
    triggerRefresh
  } = useGISStore();

  const [basemapLayer, setBasemapLayer] = useState<TileLayer<any> | null>(null);

  // Parcel Style Function based on Risk Category
  const parcelStyleFunction = (feature: any) => {
    const risk = feature.get('risk_level') || 'Green';
    const parcelId = feature.get('parcel_id') || '';

    let strokeColor = '#166534';
    let fillColor = 'rgba(34, 197, 94, 0.25)';

    if (risk === 'Amber') {
      strokeColor = '#B45309';
      fillColor = 'rgba(245, 158, 11, 0.30)';
    } else if (risk === 'Red') {
      strokeColor = '#991B1B';
      fillColor = 'rgba(239, 68, 68, 0.40)';
    }

    return new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: 2.5,
      }),
      fill: new Fill({
        color: fillColor,
      }),
      text: new Text({
        text: parcelId,
        font: 'bold 11px Inter, sans-serif',
        fill: new Fill({ color: '#0F172A' }),
        stroke: new Stroke({ color: '#FFFFFF', width: 2.5 }),
        overflow: true
      })
    });
  };

  // Building Style Function
  const buildingStyleFunction = (feature: any) => {
    const bId = feature.get('building_id') || 'BLD';
    return new Style({
      stroke: new Stroke({ color: '#DC2626', width: 2 }),
      fill: new Fill({ color: 'rgba(220, 38, 38, 0.45)' }),
      text: new Text({
        text: bId,
        font: 'bold 10px Inter, sans-serif',
        fill: new Fill({ color: '#FFFFFF' }),
        stroke: new Stroke({ color: '#991B1B', width: 2 })
      })
    });
  };

  // GNSS Point Style Function
  const gnssStyleFunction = (feature: any) => {
    const ptId = feature.get('point_id') || 'PT';
    return new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#2563EB' }),
        stroke: new Stroke({ color: '#FFFFFF', width: 2 })
      }),
      text: new Text({
        text: ptId,
        font: 'bold 10px Inter, sans-serif',
        fill: new Fill({ color: '#1E40AF' }),
        stroke: new Stroke({ color: '#FFFFFF', width: 2 }),
        offsetY: -12
      })
    });
  };

  // Helper to load all vector features with race condition guard & auto-fit extent
  const loadVectorData = () => {
    const reqId = ++fetchReqIdRef.current;

    // 1. Fetch Cadastral Parcels
    api.getParcels().then((data) => {
      if (reqId !== fetchReqIdRef.current) return;
      if (data && data.features && data.features.length > 0) {
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });
        parcelsSourceRef.current.clear();
        parcelsSourceRef.current.addFeatures(features);

        // Auto-fit extent to ingested dataset
        if (mapRef.current && features.length > 0) {
          const extent = parcelsSourceRef.current.getExtent();
          if (extent && !isNaN(extent[0])) {
            mapRef.current.getView().fit(extent, {
              padding: [80, 80, 80, 80],
              maxZoom: 18.5,
              duration: 1000
            });
          }
        }
      } else {
        parcelsSourceRef.current.clear();
      }
    }).catch(err => console.error("Failed to load parcels:", err));

    // 2. Fetch AI Segmentation Buildings
    api.runSegmentation('Baner_Drone_Orthomosaic.tif').then((res) => {
      if (reqId !== fetchReqIdRef.current) return;
      if (res && res.extracted_layers && res.extracted_layers.buildings) {
        const format = new GeoJSON();
        const features = format.readFeatures(res.extracted_layers.buildings, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });
        buildingsSourceRef.current.clear();
        buildingsSourceRef.current.addFeatures(features);
      }
    }).catch(err => console.error("Failed to load building layers:", err));

    // 3. Fetch GNSS Field Points
    api.getGnssPoints().then((res) => {
      if (reqId !== fetchReqIdRef.current) return;
      if (res && res.points) {
        const format = new GeoJSON();
        const pointFeatures = res.points.map((pt: any) => ({
          type: "Feature",
          properties: pt,
          geometry: {
            type: "Point",
            coordinates: [pt.longitude, pt.latitude]
          }
        }));
        const geojsonObj = { type: "FeatureCollection", features: pointFeatures };
        const features = format.readFeatures(geojsonObj, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });
        gnssSourceRef.current.clear();
        gnssSourceRef.current.addFeatures(features);
      }
    }).catch(err => console.error("Failed to load GNSS points:", err));
  };

  // Initialize OpenLayers Map
  useEffect(() => {
    if (!mapElement.current) return;

    // Load OpenStreetMap as default immediately
    const initialTileSource = new OSM();

    const initialBasemap = new TileLayer({
      source: initialTileSource,
    });
    setBasemapLayer(initialBasemap);

    // Vector Layers
    const pLayer = new VectorLayer({
      source: parcelsSourceRef.current,
      style: parcelStyleFunction,
      properties: { id: 'parcels' }
    });
    parcelsLayerRef.current = pLayer;

    const bLayer = new VectorLayer({
      source: buildingsSourceRef.current,
      style: buildingStyleFunction,
      properties: { id: 'buildings' }
    });
    buildingsLayerRef.current = bLayer;

    const gLayer = new VectorLayer({
      source: gnssSourceRef.current,
      style: gnssStyleFunction,
      properties: { id: 'gnss' }
    });
    gnssLayerRef.current = gLayer;

    // Map instance
    const initialMap = new Map({
      target: mapElement.current,
      layers: [initialBasemap, pLayer, bLayer, gLayer],
      view: new View({
        center: fromLonLat([73.7895, 18.5582]), // Pune / Baner Center
        zoom: 16.5,
        minZoom: 3,
        maxZoom: 20
      }),
      controls: [
        new ScaleLine({ units: 'metric' }),
        new OverviewMap({
          layers: [new TileLayer({ source: new OSM() })],
          collapsed: true
        })
      ]
    });

    mapRef.current = initialMap;

    // Ensure size update after container mounted
    setTimeout(() => {
      initialMap.updateSize();
    }, 100);

    loadVectorData();

    // Pointer move listener for Lat/Lon & UTM coordinates
    initialMap.on('pointermove', (evt) => {
      if (evt.dragging) return;
      const lonLat = toLonLat(evt.coordinate);
      const lon = parseFloat(lonLat[0].toFixed(6));
      const lat = parseFloat(lonLat[1].toFixed(6));

      try {
        const utm = proj4('EPSG:4326', 'EPSG:32643', [lon, lat]);
        const utmStr = `43N E:${Math.round(utm[0])} m, N:${Math.round(utm[1])} m`;
        setMouseCoords({ lat, lon, utm: utmStr });
      } catch (e) {
        setMouseCoords({ lat, lon, utm: 'UTM 43N' });
      }
    });

    // Click selection listener for parcels
    const selectInteraction = new Select({
      condition: click,
      layers: [pLayer],
      style: (feature) => {
        return new Style({
          stroke: new Stroke({ color: '#1D4ED8', width: 4 }),
          fill: new Fill({ color: 'rgba(29, 78, 216, 0.4)' }),
          text: new Text({
            text: feature.get('parcel_id') || '',
            font: 'bold 12px Inter, sans-serif',
            fill: new Fill({ color: '#FFFFFF' }),
            stroke: new Stroke({ color: '#0A2540', width: 3 })
          })
        });
      }
    });

    selectInteraction.on('select', (e) => {
      const selected = e.selected[0];
      if (selected) {
        const format = new GeoJSON();
        const geojsonObj = format.writeFeatureObject(selected, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });
        setSelectedParcel(geojsonObj as ParcelFeature);
      }
    });

    initialMap.addInteraction(selectInteraction);

    return () => {
      initialMap.setTarget(undefined);
    };
  }, []);

  // Re-fetch vector data when dataVersion signal increments (upstream changes)
  useEffect(() => {
    if (mapRef.current) {
      loadVectorData();
    }
  }, [dataVersion]);

  // Sync Layer Opacity & Visibility with Store
  useEffect(() => {
    layers.forEach(l => {
      if (l.id === 'parcels' && parcelsLayerRef.current) {
        parcelsLayerRef.current.setOpacity(l.visible ? l.opacity : 0);
      }
      if (l.id === 'buildings' && buildingsLayerRef.current) {
        buildingsLayerRef.current.setOpacity(l.visible ? l.opacity : 0);
      }
      if (l.id === 'gnss' && gnssLayerRef.current) {
        gnssLayerRef.current.setOpacity(l.visible ? l.opacity : 0);
      }
    });
  }, [layers]);

  // Center/Pan Map when Selected Parcel Changes
  useEffect(() => {
    if (!mapRef.current || !selectedParcel || !selectedParcel.geometry) return;
    try {
      const format = new GeoJSON();
      const feature: any = format.readFeature(selectedParcel, {
        featureProjection: 'EPSG:3857',
        dataProjection: 'EPSG:4326'
      });
      const extent = feature?.getGeometry?.()?.getExtent();
      if (extent) {
        mapRef.current.getView().fit(extent, { duration: 800, padding: [100, 100, 100, 100], maxZoom: 18 });
      }
    } catch (e) {
      console.error("Fit extent error:", e);
    }
  }, [selectedParcel]);

  // Update Basemap Layer Source
  useEffect(() => {
    if (!basemapLayer) return;

    let newSource: any;
    switch (activeBasemap) {
      case 'osm':
        newSource = new OSM();
        break;
      case 'carto':
        newSource = new XYZ({ url: 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' });
        break;
      case 'opentopo':
        newSource = new XYZ({ url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png' });
        break;
      case 'esri':
      default:
        newSource = new XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 19
        });
        break;
    }
    basemapLayer.setSource(newSource);
  }, [activeBasemap, basemapLayer]);

  // Handle Vertex Geometry Editing & Snapping Interaction Mode
  useEffect(() => {
    if (!mapRef.current) return;

    if (isEditingGeometry) {
      if (!modifyInteractionRef.current) {
        const modify = new Modify({ source: parcelsSourceRef.current });
        const snap = new Snap({ source: parcelsSourceRef.current });

        modify.on('modifyend', (evt) => {
          const modifiedFeature = evt.features.getArray()[0];
          if (modifiedFeature) {
            const format = new GeoJSON();
            const geojsonObj = format.writeFeatureObject(modifiedFeature, {
              featureProjection: 'EPSG:3857',
              dataProjection: 'EPSG:4326'
            });
            const pId = modifiedFeature.get('parcel_id');
            api.saveEditedGeometry(pId, geojsonObj.geometry).then((res) => {
              console.log("Geometry saved to backend:", res);
              setSelectedParcel(geojsonObj as ParcelFeature);
              triggerRefresh(); // Signal global refresh
            }).catch(err => console.error("Geometry save error:", err));
          }
        });

        mapRef.current.addInteraction(modify);
        mapRef.current.addInteraction(snap);

        modifyInteractionRef.current = modify;
        snapInteractionRef.current = snap;
      }
    } else {
      if (modifyInteractionRef.current) {
        mapRef.current.removeInteraction(modifyInteractionRef.current);
        modifyInteractionRef.current = null;
      }
      if (snapInteractionRef.current) {
        mapRef.current.removeInteraction(snapInteractionRef.current);
        snapInteractionRef.current = null;
      }
    }
  }, [isEditingGeometry]);

  return (
    <div className="relative w-full h-full">
      {/* Map Target Element */}
      <div ref={mapElement} className="w-full h-full bg-slate-900" />
    </div>
  );
};
