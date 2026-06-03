import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { reportService } from "../services/reportService";
import { Card, CardHeader } from "../components/ui/Card";
import {
  FireExtinguisher,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Card as TremorCard } from "@tremor/react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await reportService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // ── ADMIN stat cards ──────────────────────────────────────────────
  const adminStatCards = [
    {
      title: "Total Extinguishers",
      value: stats?.extinguishers?.total ?? 0,
      icon: <FireExtinguisher className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      title: "Active",
      value: stats?.extinguishers?.active ?? 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      title: "Expired",
      value: stats?.extinguishers?.expired ?? 0,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "bg-red-500",
    },
    {
      title: "Maintenance Required",
      value: stats?.extinguishers?.maintenanceRequired ?? 0,
      icon: <Wrench className="w-6 h-6" />,
      color: "bg-yellow-500",
    },
    {
      title: "Scheduled Inspections",
      value: stats?.inspections?.scheduled ?? 0,
      icon: <Clock className="w-6 h-6" />,
      color: "bg-indigo-500",
    },
    {
      title: "Completed Inspections",
      value: stats?.inspections?.completed ?? 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      title: "Failed Inspections",
      value: stats?.inspections?.failed ?? 0,
      icon: <XCircle className="w-6 h-6" />,
      color: "bg-orange-500",
    },
    {
      title: "Maintenance Records",
      value: stats?.maintenance?.total ?? 0,
      icon: <Wrench className="w-6 h-6" />,
      color: "bg-teal-500",
    },
  ];

  // ── INSPECTOR stat cards ─────────────────────────────────────────
  const inspectorStatCards = [
    {
      title: "Scheduled Inspections",
      value: stats?.inspections?.scheduled ?? 0,
      icon: <Clock className="w-6 h-6" />,
      color: "bg-indigo-500",
    },
    {
      title: "Completed Inspections",
      value: stats?.inspections?.completed ?? 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      title: "Failed Inspections",
      value: stats?.inspections?.failed ?? 0,
      icon: <XCircle className="w-6 h-6" />,
      color: "bg-red-500",
    },
    {
      title: "Maintenance Records",
      value: stats?.maintenance?.total ?? 0,
      icon: <Wrench className="w-6 h-6" />,
      color: "bg-yellow-500",
    },
  ];

  // ── USER stat cards ──────────────────────────────────────────────
  const userStatCards = [
    {
      title: "Total Extinguishers",
      value: stats?.extinguishers?.total ?? 0,
      icon: <FireExtinguisher className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      title: "Active Extinguishers",
      value: stats?.extinguishers?.active ?? 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      title: "Expired Extinguishers",
      value: stats?.extinguishers?.expired ?? 0,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "bg-red-500",
    },
    {
      title: "My Scheduled Inspections",
      value: stats?.inspections?.scheduled ?? 0,
      icon: <Clock className="w-6 h-6" />,
      color: "bg-indigo-500",
    },
  ];

  const statCards =
    user?.role === "ADMIN"
      ? adminStatCards
      : user?.role === "INSPECTOR"
        ? inspectorStatCards
        : userStatCards;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-text-secondary mt-1">
          {user?.role === "ADMIN" && "System overview across all resources."}
          {user?.role === "INSPECTOR" &&
            "Your inspection and maintenance activity."}
          {user?.role === "USER" &&
            "Fire extinguisher status and your scheduled inspections."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <TremorCard key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{stat.title}</p>
                <p className="text-3xl font-bold text-text-primary mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </TremorCard>
        ))}
      </div>

      {/* Quick Actions + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-3">
            {/* ADMIN only: add extinguisher */}
            {user?.role === "ADMIN" && (
              <button
                onClick={() => navigate("/extinguishers")}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <FireExtinguisher className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium text-text-primary">
                    Add Extinguisher
                  </p>
                  <p className="text-sm text-text-secondary">
                    Register a new fire extinguisher
                  </p>
                </div>
              </button>
            )}

            {/* USER: browse extinguishers */}
            {user?.role === "USER" && (
              <button
                onClick={() => navigate("/extinguishers")}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <FireExtinguisher className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium text-text-primary">
                    View Extinguishers
                  </p>
                  <p className="text-sm text-text-secondary">
                    Browse the extinguisher inventory
                  </p>
                </div>
              </button>
            )}

            {/* ADMIN + USER: schedule inspection */}
            {(user?.role === "ADMIN" || user?.role === "USER") && (
              <button
                onClick={() => navigate("/inspections")}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Calendar className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium text-text-primary">
                    Schedule Inspection
                  </p>
                  <p className="text-sm text-text-secondary">
                    Book an inspection appointment
                  </p>
                </div>
              </button>
            )}

            {/* INSPECTOR: view my inspections */}
            {user?.role === "INSPECTOR" && (
              <button
                onClick={() => navigate("/inspections")}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Calendar className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium text-text-primary">
                    My Inspections
                  </p>
                  <p className="text-sm text-text-secondary">
                    View and update your assigned inspections
                  </p>
                </div>
              </button>
            )}

            {/* ADMIN + INSPECTOR: log maintenance */}
            {(user?.role === "ADMIN" || user?.role === "INSPECTOR") && (
              <button
                onClick={() => navigate("/maintenance")}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Wrench className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium text-text-primary">
                    Log Maintenance
                  </p>
                  <p className="text-sm text-text-secondary">
                    Record a maintenance activity
                  </p>
                </div>
              </button>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="System Status" />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-text-primary">System Operational</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>

            {/* Show extinguisher health for ADMIN & USER */}
            {(user?.role === "ADMIN" || user?.role === "USER") && (
              <>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FireExtinguisher className="w-5 h-5 text-blue-600" />
                    <span className="text-text-primary">
                      Active Extinguishers
                    </span>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    {stats?.extinguishers?.active ?? 0}
                  </span>
                </div>
                {(stats?.extinguishers?.expired ?? 0) > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-text-primary">
                        Expired – Action Required
                      </span>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      {stats?.extinguishers?.expired}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Show inspection stats for ADMIN & INSPECTOR */}
            {(user?.role === "ADMIN" || user?.role === "INSPECTOR") && (
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span className="text-text-primary">
                    Inspections Completed
                  </span>
                </div>
                <span className="text-sm text-indigo-600 font-medium">
                  {stats?.inspections?.completed ?? 0}
                </span>
              </div>
            )}

            {(user?.role === "ADMIN" || user?.role === "INSPECTOR") && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Wrench className="w-5 h-5 text-purple-600" />
                  <span className="text-text-primary">Maintenance Records</span>
                </div>
                <span className="text-sm text-purple-600 font-medium">
                  {stats?.maintenance?.total ?? 0}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
