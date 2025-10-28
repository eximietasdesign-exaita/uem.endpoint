import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Activity, FileText, Shield, AlertTriangle, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface AssetChangeLog {
  id: number;
  assetId: number;
  assetName: string;
  changeType: 'created' | 'updated' | 'deleted' | 'integrity_check';
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  verificationHash: string;
}

export default function AssetChangeLogPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [changeTypeFilter, setChangeTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Mock data for asset change logs
  const mockChangeLogs: AssetChangeLog[] = [
    {
      id: 1,
      assetId: 101,
      assetName: "DESKTOP-WIN-001",
      changeType: "updated",
      fieldChanged: "operating_system",
      oldValue: "Windows 10 Pro 21H2",
      newValue: "Windows 10 Pro 22H2",
      changedBy: "System Auto-Update",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      severity: "medium",
      verificationHash: "a7f3b9c2e4d1..."
    },
    {
      id: 2,
      assetId: 102,
      assetName: "SERVER-DB-001",
      changeType: "integrity_check",
      fieldChanged: "security_compliance",
      oldValue: "95%",
      newValue: "97%",
      changedBy: "Automated Scan",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      severity: "low",
      verificationHash: "c8e2d4f6a9b1..."
    },
    {
      id: 3,
      assetId: 103,
      assetName: "LAPTOP-MAC-042",
      changeType: "updated",
      fieldChanged: "installed_software",
      oldValue: "Chrome 118.0.1",
      newValue: "Chrome 119.0.1",
      changedBy: "admin@company.com",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      severity: "low",
      verificationHash: "d9f1e3a5c7b2..."
    },
    {
      id: 4,
      assetId: 104,
      assetName: "FIREWALL-EDGE-01",
      changeType: "updated",
      fieldChanged: "firewall_rules",
      oldValue: "Allow HTTP:80",
      newValue: "Block HTTP:80",
      changedBy: "security@company.com",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      severity: "critical",
      verificationHash: "e2a4b6c8d9f1..."
    },
    {
      id: 5,
      assetId: 105,
      assetName: "PRINTER-HP-015",
      changeType: "deleted",
      fieldChanged: "asset_record",
      oldValue: "Active",
      newValue: null,
      changedBy: "it-admin@company.com",
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      severity: "high",
      verificationHash: "f3b5c7d9e1a2..."
    }
  ];

  const changeLogs = mockChangeLogs;

  // Filter logs
  const filteredLogs = changeLogs.filter(log => {
    const matchesSearch = log.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.fieldChanged.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.changedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = changeTypeFilter === "all" || log.changeType === changeTypeFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  // Statistics
  const totalChanges = changeLogs.length;
  const criticalChanges = changeLogs.filter(l => l.severity === 'critical').length;
  const last24Hours = changeLogs.filter(l => 
    new Date(l.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  const integrityChecks = changeLogs.filter(l => l.changeType === 'integrity_check').length;

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case "created": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "updated": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "deleted": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "integrity_check": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("asset_change_log")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Immutable audit trail of all asset modifications and integrity checks
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Log
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Changes
            </CardTitle>
            <Activity className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChanges}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All tracked modifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Critical Changes
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalChanges}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Last 24 Hours
            </CardTitle>
            <FileText className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last24Hours}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Integrity Checks
            </CardTitle>
            <Shield className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrityChecks}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automated verifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by asset, field, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={changeTypeFilter} onValueChange={setChangeTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Change Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="integrity_check">Integrity Check</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Change Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Change Type</TableHead>
                <TableHead>Field Changed</TableHead>
                <TableHead>Old Value</TableHead>
                <TableHead>New Value</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    No change logs found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-medium">{log.assetName}</TableCell>
                    <TableCell>
                      <Badge className={getChangeTypeColor(log.changeType)}>
                        {log.changeType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.fieldChanged}</TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {log.oldValue || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {log.newValue || '-'}
                    </TableCell>
                    <TableCell className="text-sm">{log.changedBy}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {log.verificationHash}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
