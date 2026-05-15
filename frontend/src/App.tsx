import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Public Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/Auth/LoginPage";

// Layout
import { AppLayout } from "./components/layout/AppLayout";

// Dashboard Pages
import { AgentDashboard } from "./pages/Dashboard/AgentDashboard";
import DashboardPage from "./pages/Dashboard/DashboardPage";

// Feature Pages
import FarmPage from "./pages/FarmPage";
import SalesManagementPage from "./pages/SalesManagementPage";
import StockManagementPage from "./pages/StockManagementPage";
import AlertsPage from "./pages/AlertsPage";

// ======================================================
// Dashboard Router (redirect users based on their role)
// ======================================================
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "agent":
      return <AgentDashboard />;

    case "admin":
      return <DashboardPage />;

    default:
      return <DashboardPage />;
  }
}

// ======================================================
// Protected Route
// ======================================================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// ======================================================
// Application Routes
// ======================================================
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* =========================
          Public Routes
      ========================= */}
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* =========================
          Dashboard Routes
      ========================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard-page"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Sidebar Feature Routes
      ========================= */}

      {/* Farms */}
      <Route
        path="/farms"
        element={
          <ProtectedRoute>
            <FarmPage />
          </ProtectedRoute>
        }
      />

      {/* Sales Management */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <SalesManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Stock Management */}
      <Route
        path="/stock"
        element={
          <ProtectedRoute>
            <StockManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Alerts */}
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <AlertsPage />
          </ProtectedRoute>
        }
      />

      {/* =========================
          Redirect Old Route
      ========================= */}
      <Route
        path="/adminDashboard"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* =========================
          Fallback Route
      ========================= */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

// ======================================================
// Main App Component
// ======================================================
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