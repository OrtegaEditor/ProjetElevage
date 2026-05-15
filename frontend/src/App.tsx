import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/Auth/LoginPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AgentDashboard } from "./pages/Dashboard/AgentDashboard";
import { IoTMonitoring } from "./pages/iotMonitoring";
import { WeighingPage } from "./pages/weighingpage";
import { VeterinarianDashboard } from "./pages/Dashboard/VeterinarianDashboard";




function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case "agent": return <AgentDashboard />;
    case "veterinarian": return <VeterinarianDashboard />;
    default: return <div>Dashboard - {user.role}</div>;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/iot-monitoring" element={<ProtectedRoute> <IoTMonitoring /></ProtectedRoute>}/>
      <Route path="/weighing" element={<ProtectedRoute> <WeighingPage/> </ProtectedRoute>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ style: { background: "white", color: "#374151", border: "1px solid #E5E7EB" } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}