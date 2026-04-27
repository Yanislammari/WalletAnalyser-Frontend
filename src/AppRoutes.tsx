import type React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import ForgottenPassword from "./pages/ForgottenPassword";
import ResetPassword from "./pages/ResetPassword";
import LandingPage from "./pages/LandingPage";
import HomeLayout from "./layouts/HomeLayout";
import DashboardPage from "./pages/DashboardPage";
import ImportPage from "./pages/ImportPage";
import ActivateAccountPage from "./pages/ActivateAccountPage";
import PublicRoute from "./guards/PublicRoute";
import PrivateRoute from "./guards/PrivateRoute";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes — redirect in Home if user is already connected */}
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/main" element={<PublicRoute><Main /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Routes Full Access */}
        <Route path="/forgotten-password" element={<ForgottenPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />

        {/* Private Routes - redirect in Landing Page if user is not connected */}
        <Route path="/home" element={<PrivateRoute><HomeLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="import" element={<ImportPage />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
