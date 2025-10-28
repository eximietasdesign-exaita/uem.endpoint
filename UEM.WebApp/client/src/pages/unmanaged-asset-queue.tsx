import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Search, Package, AlertCircle, CheckCircle, XCircle, Eye, UserPlus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface UnmanagedAsset {
  id: number;
  ipAddress: string;
  macAddress: string;
  hostname: string | null;
  detectedBy: 'network_scan' | 'dhcp_log' | 'firewall' | 'traffic_analysis';
  firstSeen: string;
  lastSeen: string;
  deviceType: string | null;
  manufacturer: string | null;
  openPorts: number[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  actionStatus: 'pending' | 'approved' | 'rejected' | 'investigating';
}

export default function UnmanagedAssetQueuePage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [detectionFilter, setDetectionFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("pending");

  // Mock unmanaged assets detected on network
  const mockUnmanagedAssets: UnmanagedAsset[] = [
    {
      id: 1,
      ipAddress: "192.168.1.157",
      macAddress: "AA:BB:CC:DD:EE:11",
      hostname: null,
      detectedBy: "network_scan",
      firstSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      deviceType: "Unknown",
      manufacturer: null,
      openPorts: [80, 443, 8080],
      riskLevel: "high",
      actionStatus: "pending"
    },
    {
      id: 2,
      ipAddress: "192.168.1.243",
      macAddress: "AA:BB:CC:DD:EE:22",
      hostname: "BYOD-iPhone-001",
      detectedBy: "dhcp_log",
      firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      deviceType: "Mobile Device",
      manufacturer: "Apple Inc.",
      openPorts: [],
      riskLevel: "medium",
      actionStatus: "approved"
    },
    {
      id: 3,
      ipAddress: "10.0.5.189",
      macAddress: "AA:BB:CC:DD:EE:33",
      hostname: "UNKNOWN-DEVICE",
      detectedBy: "firewall",
      firstSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      deviceType: "IoT Device",
      manufacturer: null,
      openPorts: [22, 23, 8000],
      riskLevel: "critical",
      actionStatus: "investigating"
    },
    {
      id: 4,
      ipAddress: "192.168.2.75",
      macAddress: "AA:BB:CC:DD:EE:44",
      hostname: "Visitor-Laptop-789",
      detectedBy: "traffic_analysis",
      firstSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      deviceType: "Laptop",
      manufacturer: "Dell Inc.",
      openPorts: [445, 3389],
      riskLevel: "medium",
      actionStatus: "rejected"
    },
    {
      id: 5,
      ipAddress: "10.0.3.112",
      macAddress: "AA:BB:CC:DD:EE:55",
      hostname: "Smart-TV-Conference",
      detectedBy: "network_scan",
      firstSeen: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      deviceType: "Smart TV",
      manufacturer: "Samsung",
      openPorts: [8001, 8002],
      riskLevel: "low",
      actionStatus: "pending"
    }
  ];

  const assets = mockUnmanagedAssets;

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.ipAddress.includes(searchQuery) ||
                         asset.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (asset.hostname || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDetection = detectionFilter === "all" || asset.detectedBy === detectionFilter;
    const matchesAction = actionFilter === "all" || asset.actionStatus === actionFilter;
    return matchesSearch && matchesDetection && matchesAction;
  });

  // Statistics
  const totalUnmanaged = assets.length;
  const pendingReview = assets.filter(a => a.actionStatus === 'pending').length;
  const criticalRisk = assets.filter(a => a.riskLevel === 'critical').length;
  const last24Hours = assets.filter(a => 
    new Date(a.firstSeen) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "investigating": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("unmanaged_asset_queue")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Detected devices awaiting classification, approval, and onboarding to managed inventory
          </p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Bulk Approve
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Unmanaged
            </CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnmanaged}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Detected devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Review
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReview}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Critical Risk
            </CardTitle>
            <XCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalRisk}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Last 24 Hours
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{last24Hours}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recently detected</p>
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
                placeholder="Search by IP, MAC address, or hostname..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={detectionFilter} onValueChange={setDetectionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Detection Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="network_scan">Network Scan</SelectItem>
                <SelectItem value="dhcp_log">DHCP Log</SelectItem>
                <SelectItem value="firewall">Firewall</SelectItem>
                <SelectItem value="traffic_analysis">Traffic Analysis</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Unmanaged Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unmanaged Devices ({filteredAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>Device Type</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Detected By</TableHead>
                <TableHead>First Seen</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Open Ports</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-gray-500 py-8">
                    No unmanaged assets found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {asset.ipAddress}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {asset.macAddress}
                    </TableCell>
                    <TableCell className="text-sm">
                      {asset.hostname || <span className="text-gray-400 italic">Unknown</span>}
                    </TableCell>
                    <TableCell>{asset.deviceType || '-'}</TableCell>
                    <TableCell>{asset.manufacturer || '-'}</TableCell>
                    <TableCell className="capitalize">
                      {asset.detectedBy.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(asset.firstSeen), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(asset.lastSeen), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="text-xs">
                      {asset.openPorts.length > 0 ? asset.openPorts.join(', ') : 'None'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(asset.riskLevel)}>
                        {asset.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionStatusColor(asset.actionStatus)}>
                        {asset.actionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
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
