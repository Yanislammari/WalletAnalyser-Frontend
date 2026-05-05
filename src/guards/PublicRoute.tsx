import type React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import AuthLoading from "../components/AuthLoading";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = (props: PublicRouteProps) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <AuthLoading />
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home/dashboard" replace />;
  }

  return <>{props.children}</>;
};

export default PublicRoute;
