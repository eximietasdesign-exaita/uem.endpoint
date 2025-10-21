import { useState } from "react";
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
import { Search, Shield, AlertCircle, CheckCircle, XCircle, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface SecurityAuditLog {
  id: number;
  timestamp: string;
  eventType: 'login' | 'logout' | 'permission_change' | 'failed_auth' | 'data_access' | 'config_change' | 'security_scan';
  username: string;
  sourceIp: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  userAgent: string;
}

export default function SystemSecurityAuditPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  // Mock security audit logs
  const mockAuditLogs: SecurityAuditLog[] = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      eventType: 'failed_auth',
      username: 'unknown',
      sourceIp: '192.168.1.247',
      resource: '/api/auth/login',
      action: 'Login Attempt',
      result: 'blocked',
      riskLevel: 'high',
      details: 'Multiple failed login attempts from same IP',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      eventType: 'login',
      username: 'admin@company.com',
      sourceIp: '10.0.0.15',
      resource: '/dashboard',
      action: 'User Login',
      result: 'success',
      riskLevel: 'low',
      details: 'Successful authentication with MFA',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      eventType: 'permission_change',
      username: 'security@company.com',
      sourceIp: '10.0.0.22',
      resource: '/api/users/roles',
      action: 'Role Modification',
      result: 'success',
      riskLevel: 'critical',
      details: 'Changed user role from operator to administrator',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      eventType: 'data_access',
      username: 'user@company.com',
      sourceIp: '10.0.0.45',
      resource: '/api/credentials',
      action: 'Credential Access',
      result: 'success',
      riskLevel: 'medium',
      details: 'Accessed cloud credential vault',
      userAgent: 'Mozilla/5.0 (Linux; Android)'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      eventType: 'config_change',
      username: 'sysadmin@company.com',
      sourceIp: '10.0.0.10',
      resource: '/api/settings/security',
      action: 'Security Policy Update',
      result: 'success',
      riskLevel: 'high',
      details: 'Modified password complexity requirements',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)'
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      eventType: 'security_scan',
      username: 'system',
      sourceIp: '127.0.0.1',
      resource: '/security/vulnerability-scan',
      action: 'Automated Security Scan',
      result: 'success',
      riskLevel: 'low',
      details: 'Scheduled vulnerability scan completed',
      userAgent: 'Security Scanner v2.1'
    },
    {
      id: 7,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      eventType: 'failed_auth',
      username: 'user@company.com',
      sourceIp: '10.0.0.45',
      resource: '/api/auth/login',
      action: 'Failed Login',
      result: 'failure',
      riskLevel: 'medium',
      details: 'Incorrect password entered',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)'
    }
  ];

  const auditLogs = mockAuditLogs;

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.sourceIp.includes(searchQuery) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = eventTypeFilter === "all" || log.eventType === eventTypeFilter;
    const matchesResult = resultFilter === "all" || log.result === resultFilter;
    return matchesSearch && matchesType && matchesResult;
  });

  // Statistics
  const totalEvents = auditLogs.length;
  const criticalEvents = auditLogs.filter(l => l.riskLevel === 'critical').length;
  const failedAuth = auditLogs.filter(l => l.eventType === 'failed_auth').length;
  const blockedEvents = auditLogs.filter(l => l.result === 'blocked').length;

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "login": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "logout": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "permission_change": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "failed_auth": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "data_access": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "config_change": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "security_scan": return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failure": return <XCircle className="w-4 h-4 text-red-600" />;
      case "blocked": return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return null;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
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
            {t("system_security_audit")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Comprehensive security event monitoring and compliance logging
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Audit Log
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Events
            </CardTitle>
            <Shield className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Critical Events
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalEvents}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">High priority alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Failed Auth
            </CardTitle>
            <XCircle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedAuth}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Authentication failures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Blocked Events
            </CardTitle>
            <Shield className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedEvents}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Prevented threats</p>
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
                placeholder="Search by user, IP, resource, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="permission_change">Permission Change</SelectItem>
                <SelectItem value="failed_auth">Failed Auth</SelectItem>
                <SelectItem value="data_access">Data Access</SelectItem>
                <SelectItem value="config_change">Config Change</SelectItem>
                <SelectItem value="security_scan">Security Scan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Source IP</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    No security events found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getEventTypeColor(log.eventType)}>
                        {log.eventType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.username}</TableCell>
                    <TableCell className="font-mono text-xs">{log.sourceIp}</TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {log.resource}
                    </TableCell>
                    <TableCell className="text-sm">{log.action}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getResultIcon(log.result)}
                        <span className="text-sm capitalize">{log.result}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(log.riskLevel)}>
                        {log.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {log.details}
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
