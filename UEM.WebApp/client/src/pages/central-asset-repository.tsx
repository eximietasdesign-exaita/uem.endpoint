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
import { Search, Database, Server, Monitor, Smartphone, Printer, Network, Download, Plus, Eye, Edit } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface Asset {
  id: number;
  assetTag: string;
  name: string;
  type: 'server' | 'workstation' | 'laptop' | 'mobile' | 'network' | 'printer' | 'other';
  manufacturer: string;
  model: string;
  serialNumber: string;
  ipAddress: string;
  location: string;
  owner: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  lastSeen: string;
  os: string;
  cpuModel: string;
  ramGB: number;
  diskGB: number;
}

export default function CentralAssetRepositoryPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock comprehensive asset data
  const mockAssets: Asset[] = [
    {
      id: 1,
      assetTag: "SRV-DC-001",
      name: "Primary Domain Controller",
      type: "server",
      manufacturer: "Dell",
      model: "PowerEdge R740",
      serialNumber: "JXYZ123456",
      ipAddress: "10.0.1.10",
      location: "Data Center - Rack A1",
      owner: "IT Infrastructure",
      status: "active",
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      os: "Windows Server 2022",
      cpuModel: "Intel Xeon Gold 6248",
      ramGB: 128,
      diskGB: 2000
    },
    {
      id: 2,
      assetTag: "WS-HR-042",
      name: "HR-WORKSTATION-01",
      type: "workstation",
      manufacturer: "HP",
      model: "EliteDesk 800 G6",
      serialNumber: "HP9876543",
      ipAddress: "10.0.2.42",
      location: "Building A - Floor 2 - HR Dept",
      owner: "Jane Smith",
      status: "active",
      lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      os: "Windows 10 Pro 22H2",
      cpuModel: "Intel Core i7-10700",
      ramGB: 32,
      diskGB: 512
    },
    {
      id: 3,
      assetTag: "LAP-SALES-015",
      name: "Sales-Laptop-John",
      type: "laptop",
      manufacturer: "Lenovo",
      model: "ThinkPad X1 Carbon Gen 9",
      serialNumber: "LN2024XYZ",
      ipAddress: "10.0.3.15",
      location: "Remote - Sales Team",
      owner: "John Doe",
      status: "active",
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      os: "Windows 11 Pro",
      cpuModel: "Intel Core i7-1185G7",
      ramGB: 16,
      diskGB: 1000
    },
    {
      id: 4,
      assetTag: "MOB-EXEC-008",
      name: "iPhone 15 Pro - CEO",
      type: "mobile",
      manufacturer: "Apple",
      model: "iPhone 15 Pro",
      serialNumber: "FMDN3456789",
      ipAddress: "10.0.4.8",
      location: "Executive Office",
      owner: "CEO",
      status: "active",
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      os: "iOS 17.2",
      cpuModel: "Apple A17 Pro",
      ramGB: 8,
      diskGB: 512
    },
    {
      id: 5,
      assetTag: "NET-SW-CORE-01",
      name: "Core Switch",
      type: "network",
      manufacturer: "Cisco",
      model: "Catalyst 9300-48U",
      serialNumber: "CSC987654321",
      ipAddress: "10.0.0.1",
      location: "Data Center - Network Rack",
      owner: "Network Operations",
      status: "active",
      lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      os: "Cisco IOS XE 17.9.1",
      cpuModel: "N/A",
      ramGB: 8,
      diskGB: 32
    },
    {
      id: 6,
      assetTag: "PRT-FIN-003",
      name: "Finance Printer",
      type: "printer",
      manufacturer: "HP",
      model: "LaserJet Enterprise M507",
      serialNumber: "HP456789LJ",
      ipAddress: "10.0.5.23",
      location: "Building B - Finance Department",
      owner: "Finance Team",
      status: "maintenance",
      lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      os: "Printer Firmware 2.76",
      cpuModel: "N/A",
      ramGB: 0.5,
      diskGB: 0
    }
  ];

  const assets = mockAssets;

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Statistics
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const assetTypes = [...new Set(assets.map(a => a.type))].length;
  const totalValue = assets.length * 1500; // Simplified value calculation

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "server": return <Server className="w-4 h-4" />;
      case "workstation": return <Monitor className="w-4 h-4" />;
      case "laptop": return <Monitor className="w-4 h-4" />;
      case "mobile": return <Smartphone className="w-4 h-4" />;
      case "network": return <Network className="w-4 h-4" />;
      case "printer": return <Printer className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "maintenance": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "retired": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("central_asset_repository")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Comprehensive enterprise asset catalog with detailed specifications and lifecycle tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Assets
            </CardTitle>
            <Database className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Assets
            </CardTitle>
            <Server className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssets}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Math.round((activeAssets / totalAssets) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Asset Types
            </CardTitle>
            <Monitor className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetTypes}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unique categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Value
            </CardTitle>
            <Database className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}k</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Estimated hardware value</p>
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
                placeholder="Search by tag, name, manufacturer, model, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="workstation">Workstation</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="printer">Printer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Asset Repository Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Inventory ({filteredAssets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-gray-500 py-8">
                    No assets found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {asset.assetTag}
                    </TableCell>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(asset.type)}
                        <span className="capitalize">{asset.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{asset.manufacturer}</TableCell>
                    <TableCell>{asset.model}</TableCell>
                    <TableCell className="font-mono text-xs">{asset.ipAddress}</TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {asset.location}
                    </TableCell>
                    <TableCell className="text-sm">{asset.owner}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                      {format(new Date(asset.lastSeen), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
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
