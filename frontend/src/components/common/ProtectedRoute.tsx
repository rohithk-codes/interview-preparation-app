import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";


interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}



function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  //  Route requires admin but user is not admin

  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/questions" replace />;
  }


  return children;
}


export default ProtectedRoute;
