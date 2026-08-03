import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SuperAdminRoute from "./components/SuperAdminRoute.jsx";

import Home from "./pages/public/Home.jsx";
import MembershipApplication from "./pages/public/MembershipApplication.jsx";
import ApplicationStatus from "./pages/public/ApplicationStatus.jsx";
import ActivitiesPublic from "./pages/public/ActivitiesPublic.jsx";
import NewsPublic from "./pages/public/NewsPublic.jsx";
import GalleryPublic from "./pages/public/GalleryPublic.jsx";
import NotFound from "./pages/public/NotFound.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Members from "./pages/admin/Members.jsx";
import Applications from "./pages/admin/Applications.jsx";
import OrganizationStructure from "./pages/admin/OrganizationStructure.jsx";
import Departments from "./pages/admin/Departments.jsx";
import ActivitiesAdmin from "./pages/admin/ActivitiesAdmin.jsx";
import NewsAdmin from "./pages/admin/NewsAdmin.jsx";
import GalleryAdmin from "./pages/admin/GalleryAdmin.jsx";
import Settings from "./pages/admin/Settings.jsx";
import IdCardView from "./pages/admin/IdCardView.jsx";
import AdminManagement from "./pages/admin/AdminManagement.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<MembershipApplication />} />
        <Route path="/apply/status/:id" element={<ApplicationStatus />} />
        <Route path="/activities" element={<ActivitiesPublic />} />
        <Route path="/news" element={<NewsPublic />} />
        <Route path="/gallery" element={<GalleryPublic />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="members/:id/id-card" element={<IdCardView />} />
        <Route path="applications" element={<Applications />} />
        <Route
          path="organization"
          element={
            <SuperAdminRoute>
              <OrganizationStructure />
            </SuperAdminRoute>
          }
        />
        <Route
          path="departments"
          element={
            <SuperAdminRoute>
              <Departments />
            </SuperAdminRoute>
          }
        />
        <Route path="activities" element={<ActivitiesAdmin />} />
        <Route path="news" element={<NewsAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route
          path="settings"
          element={
            <SuperAdminRoute>
              <Settings />
            </SuperAdminRoute>
          }
        />
        <Route
          path="admin-management"
          element={
            <SuperAdminRoute>
              <AdminManagement />
            </SuperAdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
