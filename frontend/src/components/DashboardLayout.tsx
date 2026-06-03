import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  FireExtinguisher,
  Calendar,
  Wrench,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { ConfirmDialog } from "./ui/ConfirmDialog";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

export const DashboardLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Role-based navigation:
  // ADMIN    → everything
  // INSPECTOR → Dashboard, Inspections, Maintenance (for conducting inspections, logging results, scheduling maintenance)
  // USER      → Dashboard, Extinguishers (view-only), Inspections (schedule inspections only)
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Extinguishers",
      path: "/extinguishers",
      icon: <FireExtinguisher className="w-5 h-5" />,
      roles: ["ADMIN", "USER"],
    },
    {
      label: "Inspections",
      path: "/inspections",
      icon: <Calendar className="w-5 h-5" />,
      roles: ["ADMIN", "INSPECTOR", "USER"],
    },
    {
      label: "Maintenance",
      path: "/maintenance",
      icon: <Wrench className="w-5 h-5" />,
      roles: ["ADMIN", "INSPECTOR"],
    },
    {
      label: "Reports",
      path: "/reports",
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ["ADMIN"],
    },
  ];

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(item.roles as any);
  });

  const currentPageName =
    location.pathname.split("/")[1] || "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-brand-primary">FE MIS</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? "bg-brand-primary text-white"
                    : "text-text-secondary hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-text-secondary">{user?.role}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/profile"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === "/profile"
                    ? "bg-brand-primary text-white"
                    : "text-text-secondary hover:bg-gray-100"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-text-primary capitalize">
              {currentPageName}
            </h2>
            <div className="w-8" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        isDangerous={false}
      />
    </div>
  );
};
