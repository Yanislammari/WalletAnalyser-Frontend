import type React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = (props: PublicRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home/dashboard" replace />;
  }

  return <>{props.children}</>;
};

export default PublicRoute;
