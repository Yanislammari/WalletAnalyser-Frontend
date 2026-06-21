import type React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "sonner";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = (props: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    toast.info("Your session has expired please login again")
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{props.children}</>;
};

export default PrivateRoute;
