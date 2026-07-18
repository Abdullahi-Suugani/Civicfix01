import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Reports from "./pages/Reports";
import ReportDetails from "./pages/ReportDetails";
import SubmitReport from "./pages/SubmitReport";
import MapPage from "./pages/MapPage";
import CitizenDashboard from "./pages/CitizenDashboard";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReports from "./pages/AdminReports";
import AdminUsers from "./pages/AdminUsers";
import AdminCategories from "./pages/AdminCategories";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetails />} />
        <Route path="/map" element={<MapPage />} />

        <Route
          path="/submit-report"
          element={
            <ProtectedRoute>
              <SubmitReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN", "MODERATOR"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["ADMIN", "MODERATOR"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminCategories />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
