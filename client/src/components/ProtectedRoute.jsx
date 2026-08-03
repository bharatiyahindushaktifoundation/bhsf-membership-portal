import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Spinner from "./Spinner.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner label="Checking session..." />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}
