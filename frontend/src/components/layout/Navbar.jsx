import { Bell, Menu, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  // Format roles for display.
  // Example: loan_officer -> Loan Officer
  const formatRole = (role) => {
    if (!role) return "User";

    return role
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Button */}

        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
          title="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Application Title */}

        <div className="hidden lg:block">
          <h2 className="text-sm font-semibold text-slate-800">
            Loan Management System
          </h2>
        </div>

        {/* Right Side */}

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {/* Notifications */}

          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
          </Link>

          {/* Logged-in User */}

          <div className="hidden items-center gap-2 sm:flex">
            <UserCircle className="h-8 w-8 text-slate-400" aria-hidden="true" />

            <div className="max-w-40">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {formatRole(user?.role)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
