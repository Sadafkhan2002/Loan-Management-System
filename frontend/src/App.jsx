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

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ================================= */}
          {/* PUBLIC ROUTES */}
          {/* ================================= */}

          <Route path="/login" element={<Login />} />

          {/* ================================= */}
          {/* AUTHENTICATED ROUTES */}
          {/* ================================= */}

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* ================================= */}
              {/* STAFF ROUTES */}
              {/* ================================= */}

              <Route
                element={<RoleRoute allowedRoles={["admin", "loan_officer"]} />}
              >
                <Route path="/customers" element={<Customers />} />

                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* ================================= */}
              {/* LOAN ROUTES */}
              {/* ================================= */}

              <Route path="/loans" element={<Loans />} />

              {/* ================================= */}
              {/* PAYMENT ROUTES */}
              {/* ================================= */}

              <Route path="/payments" element={<Payments />} />

              {/* ================================= */}
              {/* NOTIFICATIONS */}
              {/* ================================= */}

              <Route path="/notifications" element={<Notifications />} />

              {/* ================================= */}
              {/* ADMIN ONLY */}
              {/* ================================= */}

              <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Route>

          {/* ================================= */}
          {/* DEFAULT */}
          {/* ================================= */}

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
