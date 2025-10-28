import React, { useState } from "react";
import { Search, Play, Clock, Settings, Plus, Activity, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DiscoveryPage() {
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);

  const startDiscoveryScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const scheduledTasks = [
    {
      id: 1,
      name: "Daily Network Scan",
      schedule: "Every day at 2:00 AM",
      lastRun: "2024-01-16 02:00:00",
      status: "active",
      nextRun: "2024-01-17 02:00:00"
    },
    {
      id: 2,
      name: "Weekly Deep Discovery",
      schedule: "Every Sunday at 1:00 AM",
      lastRun: "2024-01-14 01:00:00",
      status: "active",
      nextRun: "2024-01-21 01:00:00"
    }
  ];

  const discoveryStats = [
    {
      label: "Total Scans",
      value: "342",
      trend: "+12%",
      icon: Activity,
      color: "blue"
    },
    {
      label: "Active Jobs",
      value: "8",
      trend: "+2",
      icon: TrendingUp,
      color: "green"
    },
    {
      label: "This Month",
      value: "67",
      trend: "+8%",
      icon: Calendar,
      color: "purple"
    },
    {
      label: "Failed",
      value: "3",
      trend: "-1",
      icon: AlertCircle,
      color: "red"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("discovery_dashboard")}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
              Centralized discovery operations, scheduled jobs, and network scanning
            </p>
          </div>
        </div>
      </div>

      {/* Discovery Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {discoveryStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
            green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
            purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
            red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          };
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                    <p className={`text-sm font-medium mt-1 ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Scan Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Search className="w-5 h-5 mr-2" />
            Quick Network Scan
          </CardTitle>
          <CardDescription>
            Execute immediate network discovery scans with customizable parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ip-range" className="text-sm font-medium">
                IP Range
              </Label>
              <Input
                id="ip-range"
                placeholder="192.168.1.0/24"
                defaultValue="192.168.1.0/24"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scan-type" className="text-sm font-medium">
                Scan Type
              </Label>
              <Select defaultValue="full">
                <SelectTrigger id="scan-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick Scan</SelectItem>
                  <SelectItem value="full">Full Discovery</SelectItem>
                  <SelectItem value="ping">Ping Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 pt-2">
            <Button onClick={startDiscoveryScan} disabled={isScanning} size="lg">
              <Play className="w-4 h-4 mr-2" />
              {isScanning ? "Scanning..." : t("start_discovery")}
            </Button>
            <Button variant="outline" size="lg">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </Button>
          </div>

          {isScanning && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Discovery scan in progress
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Scanning network range 192.168.1.0/24...
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Discovery Jobs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2" />
                {t("scheduled_tasks")}
              </CardTitle>
              <CardDescription className="mt-1">
                Automated discovery jobs with recurring schedules
              </CardDescription>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {task.name}
                    </h3>
                    <Badge
                      variant={task.status === "active" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                    {task.schedule}
                  </p>
                  <div className="flex items-center space-x-6 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <span className="flex items-center">
                      <span className="font-medium mr-1">Last run:</span>
                      {task.lastRun}
                    </span>
                    <span className="flex items-center">
                      <span className="font-medium mr-1">Next run:</span>
                      {task.nextRun}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Run Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Discovery Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Discovery Results</CardTitle>
          <CardDescription>
            Latest discovery scan results and endpoint detections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-base font-medium">No recent discovery scans</p>
            <p className="text-sm mt-1">Start a scan to see results here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
