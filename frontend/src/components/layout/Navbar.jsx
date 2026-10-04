import { Bell, Menu, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden lg:block">
          <h2 className="text-sm font-semibold text-slate-800">
            Loan Management System
          </h2>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <UserCircle className="h-8 w-8 text-slate-400" />

            <div className="max-w-40">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs capitalize text-slate-500">
                {user?.role?.replace("_", " ") || "User"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
