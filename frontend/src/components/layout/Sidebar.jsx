import { NavLink, useNavigate } from "react-router-dom";

import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { ROLES, STAFF_ROLES, ADMIN_ROLES } from "../../constants/roles";

// ==========================================
// Navigation Configuration
// ==========================================

const ALL_ROLES = [ROLES.ADMIN, ROLES.LOAN_OFFICER, ROLES.CUSTOMER];

const navigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ALL_ROLES,
  },
  {
    label: "Customers",
    path: "/customers",
    icon: Users,
    roles: STAFF_ROLES,
  },
  {
    label: "Loans",
    path: "/loans",
    icon: CreditCard,
    roles: ALL_ROLES,
  },
  {
    label: "Payments",
    path: "/payments",
    icon: CreditCard,
    roles: ALL_ROLES,
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
    roles: ADMIN_ROLES,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    roles: STAFF_ROLES,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
    roles: ALL_ROLES,
  },
];

// ==========================================
// Helper
// ==========================================

const formatRole = (role) => {
  if (!role) return "User";

  return role
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ==========================================
// Sidebar Component
// ==========================================

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  // ========================================
  // Logout
  // ========================================

  const handleLogout = () => {
    logout();

    onClose();

    navigate("/login", {
      replace: true,
    });
  };

  // ========================================
  // Filter Navigation by Role
  // ========================================

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role),
  );

  // ========================================
  // Render
  // ========================================

  return (
    <>
      {/* Mobile Backdrop */}

      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        id="main-sidebar"
        aria-label="Main sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ====================================
            Logo
        ==================================== */}

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Loan Management
            </h1>

            <p className="text-xs text-slate-500">Management System</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ====================================
            Logged-in User
        ==================================== */}

        <div className="border-b border-slate-200 p-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name || "User"}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {user?.email || ""}
            </p>

            <span className="mt-2 inline-block rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
              {formatRole(user?.role)}
            </span>
          </div>
        </div>

        {/* ====================================
            Navigation
        ==================================== */}

        <nav
          aria-label="Primary navigation"
          className="flex-1 space-y-1 overflow-y-auto p-4"
        >
          {visibleNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ====================================
            Logout
        ==================================== */}

        <div className="border-t border-slate-200 px-4 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />

            <span>Logout</span>
          </button>
        </div>

        {/* ====================================
            Footer
        ==================================== */}

        <div className="border-t border-slate-200 p-4">
          <p className="text-center text-xs text-slate-400">
            Loan Management System
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
