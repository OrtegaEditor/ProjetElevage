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
import UsersPage from "./pages/UsersPage";
import { FarmPage } from "./pages/farmPage";
import { StockManagementPage } from "./pages/StockManagementPage";
import { PoultryHousesPage } from "./pages/PoultryHousesPage";
import { Flockspage } from "./pages/Flockspage";
import { AlertsPage } from "./pages/AlertPage";
import { TreatmentsPage } from "./pages/TreatmentsPage";
import { VaccinationsPage } from "./pages/VaccinationsPage";
import { SalesPage } from "./pages/salesPage";








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
      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/poultry-houses" element={<ProtectedRoute><FarmPage /></ProtectedRoute>} />
      <Route path="/stock" element={<ProtectedRoute><StockManagementPage /></ProtectedRoute>} />
      <Route path="/poultry-houses/:farmId" element={<ProtectedRoute><PoultryHousesPage /></ProtectedRoute>} />
      <Route path="/flocks" element={<ProtectedRoute><Flockspage /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
      <Route path="/Treatments" element={<ProtectedRoute><TreatmentsPage /></ProtectedRoute>} />
      <Route path="/vaccinations" element={<ProtectedRoute><VaccinationsPage /></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />



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