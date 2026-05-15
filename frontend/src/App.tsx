import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/Auth/LoginPage";
import { AppLayout } from "./components/layout/AppLayout";
import { AgentDashboard } from "./pages/Dashboard/AgentDashboard";
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard";
import { SalesDashboard } from "./pages/Dashboard/SaleDashboard";
import { VeterinarianDashboard } from "./pages/Dashboard/VeterinarianDashboard";
import { WeighingPage } from "./pages/weighingpage";
import { IoTMonitoring } from "./pages/iotMonitoring";
// import { PoultryPage } from "./pages/PoultryPage";








function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case "agent": return <AgentDashboard />;
    case "admin": return <AdminDashboard />;
    case "veterinarian": return <VeterinarianDashboard />;
    case "commercial": return <SalesDashboard />;

    default: return <div>Dashboard - {user.role}</div>;
  }
}


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}


function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/weighing" element={<ProtectedRoute><WeighingPage /></ProtectedRoute>} />
      <Route path="/iot-monitoring" element={<ProtectedRoute><IoTMonitoring /></ProtectedRoute>} />
      {/* <Route path="/poultry-houses" element={<ProtectedRoute><PoultryPage /></ProtectedRoute>} /> */}



      <Route path="*" element={<Navigate to="#" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              color: "#374151",
              border: "1px solid #E5E7EB",
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}