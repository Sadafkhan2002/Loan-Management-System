import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import MainLayout from "./layouts/MainLayout";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/customers/Customers";
import Loans from "./pages/loans/Loans";
import Payments from "./pages/payments/Payments";
import Users from "./pages/users/Users";
import Reports from "./pages/reports/Reports";
import Notifications from "./pages/notifications/Notifications";

// Shared role constants
import { ADMIN_ROLES, STAFF_ROLES } from "./constants/roles";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* =====================================
              PUBLIC ROUTES
          ===================================== */}

          <Route path="/login" element={<Login />} />

          {/* =====================================
              AUTHENTICATED ROUTES
          ===================================== */}

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Dashboard */}

              <Route path="/dashboard" element={<Dashboard />} />

              {/* =================================
                  STAFF ROUTES
                  Admin and Loan Officer
              ================================= */}

              <Route element={<RoleRoute allowedRoles={STAFF_ROLES} />}>
                <Route path="/customers" element={<Customers />} />

                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* =================================
                  LOANS
              ================================= */}

              <Route path="/loans" element={<Loans />} />

              {/* =================================
                  PAYMENTS
              ================================= */}

              <Route path="/payments" element={<Payments />} />

              {/* =================================
                  NOTIFICATIONS
              ================================= */}

              <Route path="/notifications" element={<Notifications />} />

              {/* =================================
                  ADMIN ONLY
              ================================= */}

              <Route element={<RoleRoute allowedRoles={ADMIN_ROLES} />}>
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Route>

          {/* =====================================
              DEFAULT ROUTES
          ===================================== */}

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Unknown URLs */}

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
