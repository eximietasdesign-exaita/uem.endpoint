import React, { useState } from "react";
import { Search, Play, Clock, Settings, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    // Simulate scan duration
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("discovery")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Discover and scan network endpoints
          </p>
        </div>
      </div>

      {/* Quick Scan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            {t("network_scan")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ip-range">IP Range</Label>
              <Input
                id="ip-range"
                placeholder="192.168.1.0/24"
                defaultValue="192.168.1.0/24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scan-type">Scan Type</Label>
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
          
          <div className="flex items-center space-x-4">
            <Button onClick={startDiscoveryScan} disabled={isScanning}>
              <Play className="w-4 h-4 mr-2" />
              {isScanning ? "Scanning..." : t("start_discovery")}
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </Button>
          </div>

          {isScanning && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Discovery scan in progress... Please wait.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {t("scheduled_tasks")}
            </CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {task.name}
                    </h3>
                    <Badge
                      variant={task.status === "active" ? "default" : "secondary"}
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {task.schedule}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <span>Last run: {task.lastRun}</span>
                    <span>Next run: {task.nextRun}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
          <CardTitle>Recent Discovery Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No recent discovery scans. Start a scan to see results here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
