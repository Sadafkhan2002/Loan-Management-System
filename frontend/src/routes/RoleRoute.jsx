import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loading from "../components/common/Loading";
import { ROLES } from "../constants/roles";

const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Send unauthorized users to their dashboard.
    // If the user has an unknown role, send them to login.
    const knownRoles = Object.values(ROLES);
    const destination = knownRoles.includes(user?.role)
      ? "/dashboard"
      : "/login";

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
