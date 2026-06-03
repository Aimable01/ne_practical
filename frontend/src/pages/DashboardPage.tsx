import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { reportService } from "../services/reportService";
import type { DashboardStats } from "../types";
import { Card, CardHeader } from "../components/ui/Card";
import {
  FireExtinguisher,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card as TremorCard } from "@tremor/react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
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

  const statCards = [
    {
      title: "Total Extinguishers",
      value: stats?.totalExtinguishers || 0,
      icon: <FireExtinguisher className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      title: "Active Extinguishers",
      value: stats?.activeExtinguishers || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      title: "Expired",
      value: stats?.expiredExtinguishers || 0,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "bg-red-500",
    },
    {
      title: "Maintenance Required",
      value: stats?.maintenanceRequired || 0,
      icon: <Wrench className="w-6 h-6" />,
      color: "bg-yellow-500",
    },
    {
      title: "Total Inspections",
      value: stats?.totalInspections || 0,
      icon: <Calendar className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      title: "Scheduled Inspections",
      value: stats?.scheduledInspections || 0,
      icon: <Clock className="w-6 h-6" />,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-text-secondary mt-1">
          Here's what's happening with your fire safety management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-3">
            {user?.role === "ADMIN" && (
              <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
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
            <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
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
            {(user?.role === "ADMIN" || user?.role === "INSPECTOR") && (
              <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <Wrench className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium text-text-primary">
                    Log Maintenance
                  </p>
                  <p className="text-sm text-text-secondary">
                    Record maintenance activity
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
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-text-primary">Inspections</span>
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {stats?.completedInspections || 0} completed
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Wrench className="w-5 h-5 text-purple-600" />
                <span className="text-text-primary">Maintenance</span>
              </div>
              <span className="text-sm text-purple-600 font-medium">
                {stats?.totalMaintenance || 0} records
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
