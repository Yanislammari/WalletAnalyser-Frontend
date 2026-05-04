import type React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../providers/AuthProvider";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = (props: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{props.children}</>;
};

export default PrivateRoute;
