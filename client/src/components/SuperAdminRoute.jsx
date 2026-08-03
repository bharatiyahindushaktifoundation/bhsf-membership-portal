import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Spinner from "./Spinner.jsx";

export default function SuperAdminRoute({ children }) {
  const { isAuthenticated, loading, isSuperAdmin } = useAuth();

  if (loading) return <Spinner label="Checking permissions..." />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  return children;
}
