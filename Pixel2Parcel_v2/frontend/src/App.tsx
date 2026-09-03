import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { useGISStore } from './store/gisStore';
import { RefreshCw } from 'lucide-react';

// Route-Level Code Splitting for performance and bundle size reduction
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const GISWorkspacePage = lazy(() => import('./pages/GISWorkspacePage').then(m => ({ default: m.GISWorkspacePage })));
const Cesium3DPage = lazy(() => import('./pages/Cesium3DPage').then(m => ({ default: m.Cesium3DPage })));
const UploadPage = lazy(() => import('./pages/UploadPage').then(m => ({ default: m.UploadPage })));
const SegmentationPage = lazy(() => import('./pages/SegmentationPage').then(m => ({ default: m.SegmentationPage })));
const ParcelExtractPage = lazy(() => import('./pages/ParcelExtractPage').then(m => ({ default: m.ParcelExtractPage })));
const TopologyPage = lazy(() => import('./pages/TopologyPage').then(m => ({ default: m.TopologyPage })));
const GeometryEditorPage = lazy(() => import('./pages/GeometryEditorPage').then(m => ({ default: m.GeometryEditorPage })));
const GnssVerificationPage = lazy(() => import('./pages/GnssVerificationPage').then(m => ({ default: m.GnssVerificationPage })));
const ComplaintManagerPage = lazy(() => import('./pages/ComplaintManagerPage').then(m => ({ default: m.ComplaintManagerPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));

// Citizen Pages
const CitizenHomePage = lazy(() => import('./pages/CitizenHomePage').then(m => ({ default: m.CitizenHomePage })));
const CitizenSearchPage = lazy(() => import('./pages/CitizenSearchPage').then(m => ({ default: m.CitizenSearchPage })));
const CitizenComplaintPage = lazy(() => import('./pages/CitizenComplaintPage').then(m => ({ default: m.CitizenComplaintPage })));

// Loading fallback component during route transitions
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-[calc(100vh-120px)] text-slate-500 text-xs space-x-2">
    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
    <span className="font-semibold">Loading Module Workspace...</span>
  </div>
);

// Route Guard component for Government Portal
const GovRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { role } = useGISStore();
  if (role === 'Citizen') {
    return <Navigate to="/citizen/home" replace />;
  }
  return element;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { role } = useGISStore();
  const isCitizen = location.pathname.startsWith('/citizen') || role === 'Citizen';

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {!isCitizen && <Sidebar />}
        <main className="flex-1 overflow-y-auto bg-slate-100 relative">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Redirect root to Government Dashboard if staff, or Citizen Home if Citizen */}
              <Route path="/" element={<Navigate to={role === 'Citizen' ? "/citizen/home" : "/government/dashboard"} replace />} />

              {/* Government Routes (Protected by GovRoute) */}
              <Route path="/government/dashboard" element={<GovRoute element={<Dashboard />} />} />
              <Route path="/government/workspace" element={<GovRoute element={<GISWorkspacePage />} />} />
              <Route path="/government/3d" element={<GovRoute element={<Cesium3DPage />} />} />
              <Route path="/government/upload" element={<GovRoute element={<UploadPage />} />} />
              <Route path="/government/segmentation" element={<GovRoute element={<SegmentationPage />} />} />
              <Route path="/government/parcels" element={<GovRoute element={<ParcelExtractPage />} />} />
              <Route path="/government/topology" element={<GovRoute element={<TopologyPage />} />} />
              <Route path="/government/editor" element={<GovRoute element={<GeometryEditorPage />} />} />
              <Route path="/government/verification" element={<GovRoute element={<GnssVerificationPage />} />} />
              <Route path="/government/complaints" element={<GovRoute element={<ComplaintManagerPage />} />} />
              <Route path="/government/reports" element={<GovRoute element={<ReportsPage />} />} />

              {/* Citizen Routes (Public Access) */}
              <Route path="/citizen/home" element={<CitizenHomePage />} />
              <Route path="/citizen/search" element={<CitizenSearchPage />} />
              <Route path="/citizen/complaint" element={<CitizenComplaintPage />} />
              <Route path="/citizen/status" element={<CitizenComplaintPage />} />

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to={role === 'Citizen' ? "/citizen/home" : "/government/dashboard"} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
