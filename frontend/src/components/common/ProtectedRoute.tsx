import React from "react";
import { Navigate } from "react-router-dom";
<<<<<<< HEAD
import { useAuth } from "@/contexts/AuthContext";
=======
import { useAuth } from "../../contexts/AuthContext";
>>>>>>> 6dcae7d4016ed4154fe2d7a5c5105ab2b15c9a29

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

<<<<<<< HEAD
function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

=======
function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking auth
>>>>>>> 6dcae7d4016ed4154fe2d7a5c5105ab2b15c9a29
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

<<<<<<< HEAD
=======
  //  Not logged in → redirect to login
>>>>>>> 6dcae7d4016ed4154fe2d7a5c5105ab2b15c9a29
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

<<<<<<< HEAD
=======
  //  Route requires admin but user is not admin
>>>>>>> 6dcae7d4016ed4154fe2d7a5c5105ab2b15c9a29
  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/questions" replace />;
  }

<<<<<<< HEAD
=======
 
>>>>>>> 6dcae7d4016ed4154fe2d7a5c5105ab2b15c9a29
  return children;
}

export default ProtectedRoute;
