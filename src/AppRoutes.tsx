import type React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import ForgottenPassword from "./pages/ForgottenPassword";
import ResetPassword from "./pages/ResetPassword";
import LandingPage from "./pages/LandingPage";
import HomeLayout from "./layouts/HomeLayout";
import Dashboard from "./pages/Dashboard";
import ImportData from "./pages/ImportData";
import Portfolios from "./pages/Portfolios";
import Transactions from "./pages/Transactions";
import ActivateAccount from "./pages/ActivateAccount";
import PublicRoute from "./guards/PublicRoute";
import PrivateRoute from "./guards/PrivateRoute";
import Badges from "./pages/Badges";

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
        <Route path="/activate-account" element={<ActivateAccount />} />

        {/* Private Routes - redirect in Landing Page if user is not connected */}
        <Route path="/home" element={<PrivateRoute><HomeLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolios />} />
          <Route path="portfolio/:portfolioId/transactions" element={<Transactions />} />
          <Route path="import" element={<ImportData />} />
          <Route path="badges" element={<Badges/>} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
