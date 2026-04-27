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

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotten-password" element={<ForgottenPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Zone authentifiée — layout partagé */}
        <Route path="/home" element={<HomeLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="import" element={<ImportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
