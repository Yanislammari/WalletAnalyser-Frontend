import type React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import AuthLoading from "../components/AuthLoading";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = (props: PublicRouteProps) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/home/dashboard";

  if (isAuthLoading) {
    return (
      <AuthLoading />
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{props.children}</>;
};

export default PublicRoute;
