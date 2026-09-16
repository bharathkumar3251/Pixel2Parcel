# 🛰️ P2P – Pixel2Parcel

### *From Pixels to Verified Urban Parcels*

An AI-powered Government GIS platform for automated urban cadastral mapping, topology validation, intelligent verification, and digital land record management.

---

## 📌 Overview

**Pixel2Parcel (P2P)** is a production-grade **Government GIS Platform** designed for the **Department of Land Resources (DoLR), Ministry of Rural Development, Government of India**.

The platform automates **urban cadastral parcel mapping** using drone imagery, orthophotos, DSM/DTM, and GIS datasets. It generates GIS-ready parcel boundaries, validates topology, calculates explainable confidence and risk scores, supports GNSS/CORS-based field verification, and manages verified digital land records through separate Government and Citizen portals.

> **AI maps every parcel. UMAI decides where humans need to verify.**

---

## 🎯 Problem Statement

**AI-Based Automated Urban Parcel Mapping and Cadastral Feature Extraction System using Drone Imagery**

Urban cadastral mapping is highly manual, time-consuming, and requires extensive field verification. Pixel2Parcel reduces manual effort by automatically extracting parcel boundaries and identifying only uncertain parcels for surveyor verification.

---

## 💡 Proposed Solution

Pixel2Parcel is built around five core innovations:

* **AI-Based Cadastral Mapping** — Automatic parcel extraction from drone and orthophoto imagery.
* **GIS-Ready Parcel Generation** — Converts AI predictions into editable GIS polygons.
* **Intelligent Verification** — AI prioritizes only uncertain parcels for GNSS/CORS field verification.
* **Explainable Topology & Risk Validation** — Every parcel includes confidence, topology status, and verification reasons.
* **Verified Cadastral Management** — Stores approved parcels in a secure GIS-ready land records database.

---

## 🌟 UMAI — Uncertainty Management for Automated Intelligence

UMAI is the core intelligence layer of Pixel2Parcel.

Instead of treating every parcel equally, UMAI evaluates AI confidence, topology quality, boundary consistency, and terrain validation to determine which parcels require human verification.

### UMAI Workflow

MAP → DETECT → VALIDATE → RISK → VERIFY → LEARN

This creates a continuous learning loop where verified corrections improve future AI predictions.

---

## ✨ Key Features

* 🤖 AI-powered parcel boundary extraction.
* 🗺️ GIS-ready parcel generation (GeoJSON, Shapefile, KML, PostGIS).
* 📍 Automated topology validation.
* 📊 Explainable confidence and risk engine.
* 📡 GNSS/CORS-assisted field verification.
* ✏️ Interactive parcel geometry editing.
* 🌍 OpenLayers-based Government WebGIS workspace.
* 🏙️ CesiumJS-powered 3D parcel visualization.
* 📄 Digital Land Record PDF generation.
* 👥 Separate Government and Citizen portals.

---

## 🏛️ Government Portal Modules

The Government Portal is designed for Survey Officers, GIS Analysts, and Revenue Inspectors.

| Module                  | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| Dashboard               | Survey overview and cadastral statistics                 |
| Survey Workspace        | Upload and manage GIS datasets                           |
| Input Validation        | Validate CRS, raster integrity, and geometries           |
| AI Feature Extraction   | Detect buildings, roads, vegetation, and boundaries      |
| AI Parcel Extraction    | Generate preliminary cadastral parcels                   |
| GIS Polygon Generation  | Convert AI masks into GIS polygons                       |
| Topology Validation     | Detect overlaps, gaps, conflicts, and invalid geometries |
| Confidence Engine       | Calculate parcel confidence scores                       |
| Explainable Risk Engine | Prioritize parcels requiring verification                |
| WebGIS Review Workspace | Review generated parcels on interactive map              |
| Geometry Editor         | Edit parcel boundaries using GIS tools                   |
| GNSS/CORS Verification  | Compare AI boundaries with field observations            |
| Verified Cadastral Map  | Display approved parcel boundaries                       |
| GIS Export              | Export GeoJSON, Shapefile, KML, and PDF                  |
| Complaint Management    | Review and resolve citizen complaints                    |
| 3D Urban Visualization  | Terrain and parcel visualization using CesiumJS          |

---

## 👤 Citizen Portal

The Citizen Portal is a completely independent public interface.

### Citizens Can

* Search parcels.
* View verified parcel boundaries.
* View land-use information.
* Download verified land record cards.
* Raise cadastral complaints.
* Track complaint status.

### Citizens Cannot

* Access Government GIS workspace.
* View AI confidence or risk.
* View GNSS observations.
* Edit parcel boundaries.
* Access topology or verification modules.

---

## 🗺️ Supported Survey Inputs

| Dataset               | Format                       |
| --------------------- | ---------------------------- |
| Drone RGB Imagery     | TIFF, JPG, PNG               |
| Orthophoto (ORI)      | GeoTIFF                      |
| DSM                   | GeoTIFF                      |
| DTM                   | GeoTIFF                      |
| Existing Parcel Layer | GeoJSON, Shapefile, KML, KMZ |
| GNSS/CORS Survey Data | CSV, GeoJSON                 |

The platform automatically validates CRS, metadata, spatial extent, raster resolution, and geometry integrity before processing.

---

## 🧠 AI Processing Pipeline

```text
Survey Data Upload
        │
        ▼
Input Validation
        │
        ▼
Raster Preprocessing
        │
        ▼
AI Feature Extraction
(U-Net++ + YOLO)
        │
        ▼
Parcel Boundary Extraction
        │
        ▼
GIS Polygon Generation
        │
        ▼
Topology Validation
        │
        ▼
Confidence & Risk Assessment
        │
        ▼
GNSS/CORS Verification
        │
        ▼
Geometry Editing & Approval
        │
        ▼
Verified Urban Cadastral Map
```

---

## ⚙️ Algorithms Used

| Algorithm                        | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| **U-Net++**                      | Semantic segmentation for parcel boundary extraction   |
| **YOLO**                         | Building and road object detection                     |
| **Contour Detection**            | Boundary extraction from segmentation masks            |
| **Morphological Operations**     | Noise removal and mask refinement                      |
| **Connected Component Analysis** | Separate individual parcel regions                     |
| **Raster-to-Vector Conversion**  | Convert raster masks into GIS polygons                 |
| **Topology Validation**          | Detect overlaps, gaps, invalid polygons, and conflicts |

---

## 📐 Mathematical Models

### AI Model Weight Update

<math block value="\\theta_{new}=\\theta_{old}-\\eta\\nabla_{\\theta}L"/>

### Building Height Calculation

<math block value="Height=DSM-DTM"/>

### Parcel Confidence Score

<math block value="Confidence=(AI\\ Score)^{0.5}\\times(Boundary\\ Score)^{0.3}\\times(DSM/DTM\\ Score)^{0.2}"/>

### Explainable Risk Score

<math block value="Risk=0.40(AI\\ Uncertainty)+0.35(Topology\\ Errors)+0.15(Boundary\\ Mismatch)+0.10(GNSS\\ Offset)"/>

---

## 🌍 Technology Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* Zustand

### GIS & Mapping

* OpenLayers
* GeoJSON
* GeoTIFF
* WMS / WMTS
* KML / KMZ
* Shapefile

### Backend

* FastAPI
* Python
* SQLAlchemy
* Pydantic

### AI & Computer Vision

* PyTorch
* U-Net++
* YOLO
* OpenCV

### Geospatial Processing

* Rasterio
* GDAL
* GeoPandas
* Shapely
* PyProj

### Database

* PostgreSQL
* PostGIS

### 3D Visualization

* CesiumJS
* Resium

### Survey Data

* Drone Imagery
* Orthophotos (ORI)
* DSM
* DTM
* GNSS/CORS

---

## 📊 Existing Solution vs Pixel2Parcel

| Capability                    | Existing Solutions | Pixel2Parcel |
| ----------------------------- | ------------------ | ------------ |
| AI Parcel Extraction          | Partial            | ✅            |
| GIS-Ready Parcel Generation   | Partial            | ✅            |
| Automated Topology Validation | Limited            | ✅            |
| Confidence-Based Verification | ❌                  | ✅            |
| Explainable Risk Engine       | ❌                  | ✅            |
| GNSS Priority Verification    | Manual             | ✅            |
| Editable Government WebGIS    | Limited            | ✅            |
| Separate Citizen Portal       | Limited            | ✅            |

---

## 📈 Feasibility & Viability

### Feasibility

* Pre-trained AI models enable parcel and feature extraction.
* Open-source GIS technologies support mapping and spatial analysis.
* Drone imagery, ORI, DSM/DTM, and GNSS data provide reliable survey inputs.
* Human verification ensures accuracy for uncertain parcels.

### Challenges

* Limited cadastral training datasets.
* Complex urban boundaries.
* Image quality and terrain variation.
* Accurate risk prioritization.

### Strategy

* Fine-tune AI using cadastral datasets.
* Combine AI confidence, topology validation, and GIS mismatch.
* Use GNSS verification only for high-risk parcels.
* Store verified corrections for future learning.

---

## 🌍 Expected Impact

| Area          | Impact                                                                     |
| ------------- | -------------------------------------------------------------------------- |
| Social        | Faster access to updated land information and reduced surveyor workload.   |
| Economic      | Lower surveying costs and improved productivity.                           |
| Environmental | Fewer field visits and reduced paper-based workflows.                      |
| Government    | Faster urban cadastral modernization and improved land record reliability. |

---

## 🔬 Research References

* SVAMITVA Scheme — Department of Land Resources.
* AIKosh — IndiaAI Dataset Repository.
* ISRO Bhuvan Geoportal.
* Naksha Portal — Department of Land Resources.
* ISPRS Potsdam Dataset.
* Project Vaayu (Open Source Reference).

---

## 🚀 Future Scope

* Real-time GNSS/CORS integration.
* AI feedback and retraining pipeline.
* Advanced cadastral change detection.
* Multi-city scalable deployment.
* Digital Twin ready 3D cadastral visualization.

---

## 👨‍💻 Team TRIUMVIRATE

**Bharath Kumar S**

**Dev Akash K L**

**Azeem M S**

Sri Eshwar College of Engineering

**Hack2Ignite 2026 **
