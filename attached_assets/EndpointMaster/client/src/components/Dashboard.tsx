import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Monitor, 
  CheckCircle, 
  AlertTriangle, 
  Shield,
  Plus,
  Search,
  Download,
  FileText,
  Circle,
  TrendingUp,
  ArrowUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";

export function Dashboard() {
  const { t } = useLanguage();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities/recent"],
  });

  const { data: systemStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/system/status"],
  });

  const getActivityIcon = (type: string, severity: string) => {
    switch (type) {
      case "discovery":
        return <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "policy":
        return <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "disconnect":
        return <Circle className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getActivityBgColor = (type: string, severity: string) => {
    switch (type) {
      case "discovery":
        return "bg-green-100 dark:bg-green-900/20";
      case "alert":
        return severity === "critical" 
          ? "bg-red-100 dark:bg-red-900/20" 
          : "bg-yellow-100 dark:bg-yellow-900/20";
      case "policy":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "disconnect":
        return "bg-gray-100 dark:bg-gray-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "offline":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("total_endpoints")}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : stats?.totalEndpoints?.toLocaleString() || "0"}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  <ArrowUp className="inline w-3 h-3 mr-1" />
                  +12% {t("from_last_month")}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("online_endpoints")}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : stats?.onlineEndpoints?.toLocaleString() || "0"}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {statsLoading ? "..." : 
                    `${Math.round((stats?.onlineEndpoints / stats?.totalEndpoints * 100) || 0)}% ${t("uptime")}`
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("security_alerts")}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : stats?.securityAlerts || "0"}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  5 {t("critical")}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("compliance_score")}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? "..." : `${stats?.complianceScore || 0}%`}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                  -2% {t("from_last_week")}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("recent_endpoint_activity")}</CardTitle>
              <Button variant="ghost" size="sm">
                {t("view_all")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities?.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent activities
              </div>
            ) : (
              <div className="space-y-4">
                {activities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${getActivityBgColor(activity.type, activity.severity)}`}>
                      {getActivityIcon(activity.type, activity.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("quick_actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start h-auto p-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <Search className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{t("start_discovery")}</span>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start h-auto p-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                  <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">{t("add_endpoint")}</span>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start h-auto p-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mr-3">
                  <Download className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-sm font-medium">{t("deploy_agent")}</span>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start h-auto p-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium">{t("generate_report")}</span>
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t("system_status")}</CardTitle>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {systemStatus?.map((status: any) => (
                    <div key={status.service} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {status.service}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusDotColor(status.status)}`} />
                        <span className={`text-sm ${getStatusColor(status.status)}`}>
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
