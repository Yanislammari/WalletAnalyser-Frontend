import type React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Start from "./pages/Start";
import Login from "./pages/Login";

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
