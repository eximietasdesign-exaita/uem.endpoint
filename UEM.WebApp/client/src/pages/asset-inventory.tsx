import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  MapPin, 
  AlertTriangle, 
  Briefcase, 
  Users, 
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Table,
  Layout,
  FileText,
  BarChart3,
  Tag,
  Clock,
  Shield,
  RefreshCw,
  Import,
  ExternalLink,
  TreePine,
  Server,
  Laptop,
  Smartphone,
  Monitor,
  Printer,
  Router,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Globe,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Zap,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Activity,
  Database,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table as DataTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { AssetTableDesigner } from '@/components/asset/AssetTableDesigner';
import { AssetFormBuilder } from '@/components/asset/AssetFormBuilder';
import { AssetDetailsDialog } from '@/components/asset/AssetDetailsDialog';
import { AssetBulkActions } from '@/components/asset/AssetBulkActions';
import { AssetHierarchyView } from '@/components/asset/AssetHierarchyView';
import { AssetReportingEngine } from '@/components/asset/AssetReportingEngine';

interface Asset {
  id: number;
  name: string;
  ipAddress: string;
  macAddress: string;
  osType: string;
  osVersion: string;
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  discoveryMethod: 'agentless' | 'agent' | 'manual';
  lastSeen: string;
  location?: string;
  category?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  businessUnit?: string;
  project?: string;
  reportingManager?: string;
  customFields: Record<string, any>;
  tags: string[];
  vulnerabilities: number;
  complianceScore: number;
  assetValue?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  vendor?: string;
  model?: string;
  serialNumber?: string;
}

interface AssetField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'currency';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  category: 'basic' | 'location' | 'business' | 'technical' | 'financial' | 'compliance';
}

interface TableView {
  id: string;
  name: string;
  description: string;
  columns: string[];
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isDefault: boolean;
  permissions: string[];
}

export default function AssetInventoryPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCriticality, setFilterCriticality] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [currentView, setCurrentView] = useState<TableView | null>(null);
  const [showTableDesigner, setShowTableDesigner] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'hierarchy'>('table');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name', 'ipAddress', 'status', 'category', 'location', 'criticality', 'lastSeen'
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setIsRefreshing(true);
      queryClient.invalidateQueries({ queryKey: ['/api/assets/inventory'] });
      setTimeout(() => setIsRefreshing(false), 1000);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, queryClient]);

  // Fetch assets with tenant context
  const { data: assets = [], isLoading, error, refetch } = useQuery<Asset[]>({
    queryKey: ['/api/assets/inventory'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Fetch custom fields configuration
  const { data: customFields = [] } = useQuery<AssetField[]>({
    queryKey: ['/api/assets/custom-fields'],
  });

  // Fetch table views
  const { data: tableViews = [] } = useQuery<TableView[]>({
    queryKey: ['/api/assets/table-views'],
  });

  // Statistics
  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    critical: assets.filter(a => a.criticality === 'critical').length,
    highVulnerabilities: assets.filter(a => a.vulnerabilities > 10).length,
    lowCompliance: assets.filter(a => a.complianceScore < 70).length,
    categories: [...new Set(assets.map(a => a.category).filter(Boolean))].length,
    locations: [...new Set(assets.map(a => a.location).filter(Boolean))].length,
    businessUnits: [...new Set(assets.map(a => a.businessUnit).filter(Boolean))].length,
  };

  // Enhanced filtering and sorting
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = !searchQuery || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.ipAddress.includes(searchQuery) ||
        asset.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.businessUnit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
      const matchesCriticality = filterCriticality === 'all' || asset.criticality === filterCriticality;
      const matchesLocation = filterLocation === 'all' || asset.location === filterLocation;

      return matchesSearch && matchesCategory && matchesStatus && matchesCriticality && matchesLocation;
    });

    // Sort assets
    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof Asset];
      const bVal = b[sortField as keyof Asset];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    return filtered;
  }, [assets, searchQuery, filterCategory, filterStatus, filterCriticality, filterLocation, sortField, sortDirection]);

  const handleAssetSelect = (assetId: number) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAll = () => {
    setSelectedAssets(
      selectedAssets.length === filteredAndSortedAssets.length 
        ? [] 
        : filteredAndSortedAssets.map(asset => asset.id)
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getAssetIcon = (asset: Asset) => {
    const category = asset.category?.toLowerCase();
    switch (category) {
      case 'server': return Server;
      case 'laptop': return Laptop;
      case 'desktop': return Monitor;
      case 'mobile': return Smartphone;
      case 'printer': return Printer;
      case 'router': return Router;
      case 'storage': return HardDrive;
      default: return Database;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'decommissioned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics Dashboard with Real-time Updates */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total Assets</p>
                      </div>
                    </div>
                    {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />}
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total number of assets in inventory</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        <p className="text-xs text-gray-500">Active</p>
                      </div>
                    </div>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assets currently active and operational</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                        <p className="text-xs text-gray-500">Critical</p>
                      </div>
                    </div>
                    <Zap className="h-3 w-3 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assets with critical priority requiring immediate attention</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.locations}</p>
                <p className="text-xs text-gray-500">Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{stats.businessUnits}</p>
                <p className="text-xs text-gray-500">Business Units</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-pink-500" />
              <div>
                <p className="text-2xl font-bold">{stats.categories}</p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.highVulnerabilities}</p>
                <p className="text-xs text-gray-500">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-cyan-500" />
              <div>
                <p className="text-2xl font-bold">{stats.lowCompliance}</p>
                <p className="text-xs text-gray-500">Low Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-5">
            <TabsTrigger value="inventory">Asset Inventory</TabsTrigger>
            <TabsTrigger value="hierarchy">Asset Hierarchy</TabsTrigger>
            <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
            <TabsTrigger value="configuration">Field Configuration</TabsTrigger>
            <TabsTrigger value="views">Table Views</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTableDesigner(true)}
            >
              <Table className="h-4 w-4 mr-2" />
              Table Designer
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFormBuilder(true)}
            >
              <Layout className="h-4 w-4 mr-2" />
              Form Builder
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Asset Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Enhanced Search and Filters Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Advanced Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search assets, IPs, locations, vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Filter Dropdowns */}
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="decommissioned">Decommissioned</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="server">Server</SelectItem>
                        <SelectItem value="laptop">Laptop</SelectItem>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="printer">Printer</SelectItem>
                        <SelectItem value="router">Network</SelectItem>
                        <SelectItem value="storage">Storage</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterCriticality} onValueChange={setFilterCriticality}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterLocation} onValueChange={setFilterLocation}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        {[...new Set(assets.map(a => a.location).filter(Boolean))].map(location => (
                          <SelectItem key={location} value={location!}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Layout className="h-4 w-4 mr-2" />
                        {viewMode === 'table' ? 'Table' : viewMode === 'grid' ? 'Grid' : 'Hierarchy'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setViewMode('table')}>
                        <Table className="h-4 w-4 mr-2" />
                        Table View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode('grid')}>
                        <Layout className="h-4 w-4 mr-2" />
                        Grid View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setViewMode('hierarchy')}>
                        <TreePine className="h-4 w-4 mr-2" />
                        Hierarchy View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Column Visibility */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      {['name', 'ipAddress', 'status', 'category', 'location', 'criticality', 'lastSeen', 'vulnerabilities', 'complianceScore'].map((column) => (
                        <DropdownMenuCheckboxItem
                          key={column}
                          checked={visibleColumns.includes(column)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setVisibleColumns([...visibleColumns, column]);
                            } else {
                              setVisibleColumns(visibleColumns.filter(c => c !== column));
                            }
                          }}
                        >
                          {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Auto Refresh Toggle */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={autoRefresh ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                          <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{autoRefresh ? 'Disable' : 'Enable'} auto-refresh (30s)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Manual Refresh */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Import className="h-4 w-4 mr-2" />
                        Import Assets
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Export Data
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Filter Summary */}
              {(searchQuery || filterStatus !== 'all' || filterCategory !== 'all' || filterCriticality !== 'all' || filterLocation !== 'all') && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="h-4 w-4" />
                    <span>Showing {filteredAndSortedAssets.length} of {stats.total} assets</span>
                    {selectedAssets.length > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{selectedAssets.length} selected</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBulkActionsOpen(true)}
                        >
                          Bulk Actions
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Asset Display based on view mode */}
          {viewMode === 'table' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Asset Inventory ({filteredAndSortedAssets.length})</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Asset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <DataTable>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedAssets.length === filteredAndSortedAssets.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        {visibleColumns.includes('name') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Asset Name</span>
                              {sortField === 'name' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        {visibleColumns.includes('ipAddress') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('ipAddress')}
                          >
                            <div className="flex items-center space-x-1">
                              <Network className="h-3 w-3" />
                              <span>IP Address</span>
                              {sortField === 'ipAddress' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        {visibleColumns.includes('status') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center space-x-1">
                              <Activity className="h-3 w-3" />
                              <span>Status</span>
                              {sortField === 'status' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        {visibleColumns.includes('category') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('category')}
                          >
                            <div className="flex items-center space-x-1">
                              <Tag className="h-3 w-3" />
                              <span>Category</span>
                              {sortField === 'category' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        {visibleColumns.includes('location') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('location')}
                          >
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>Location</span>
                              {sortField === 'location' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        {visibleColumns.includes('criticality') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('criticality')}
                          >
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Priority</span>
                              {sortField === 'criticality' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        {visibleColumns.includes('vulnerabilities') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('vulnerabilities')}
                          >
                            <div className="flex items-center space-x-1">
                              <Shield className="h-3 w-3" />
                              <span>Vulnerabilities</span>
                              {sortField === 'vulnerabilities' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        {visibleColumns.includes('complianceScore') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('complianceScore')}
                          >
                            <div className="flex items-center space-x-1">
                              <BarChart3 className="h-3 w-3" />
                              <span>Compliance</span>
                              {sortField === 'complianceScore' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        {visibleColumns.includes('lastSeen') && (
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSort('lastSeen')}
                          >
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Last Seen</span>
                              {sortField === 'lastSeen' && (
                                <TrendingUp className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </TableHead>
                        )}
                        <TableHead className="w-16">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={visibleColumns.length + 2} className="text-center py-8">
                            <div className="flex items-center justify-center space-x-2">
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>Loading assets...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredAndSortedAssets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={visibleColumns.length + 2} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2 text-gray-500">
                              <Database className="h-8 w-8" />
                              <span>No assets found</span>
                              {(searchQuery || filterStatus !== 'all' || filterCategory !== 'all') && (
                                <span className="text-sm">Try adjusting your search or filters</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAndSortedAssets.map((asset) => {
                          const AssetIcon = getAssetIcon(asset);
                          return (
                            <TableRow key={asset.id} className="hover:bg-gray-50">
                              <TableCell>
                                <Checkbox
                                  checked={selectedAssets.includes(asset.id)}
                                  onCheckedChange={() => handleAssetSelect(asset.id)}
                                />
                              </TableCell>
                              {visibleColumns.includes('name') && (
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <div className="p-1 bg-gray-100 rounded">
                                      <AssetIcon className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{asset.name}</div>
                                      <div className="text-sm text-gray-500">{asset.macAddress}</div>
                                    </div>
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.includes('ipAddress') && (
                                <TableCell>
                                  <div className="flex items-center space-x-1">
                                    <span className="font-mono text-sm">{asset.ipAddress}</span>
                                    {asset.ipAddress.includes('192.168') ? (
                                      <Wifi className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <Globe className="h-3 w-3 text-blue-500" />
                                    )}
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.includes('status') && (
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline" className={getStatusColor(asset.status)}>
                                          {asset.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                                          {asset.status === 'inactive' && <XCircle className="h-3 w-3 mr-1" />}
                                          {asset.status === 'maintenance' && <Clock className="h-3 w-3 mr-1" />}
                                          {asset.status === 'decommissioned' && <XCircle className="h-3 w-3 mr-1" />}
                                          {asset.status}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Asset is currently {asset.status}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                              )}
                              {visibleColumns.includes('category') && (
                                <TableCell>
                                  <Badge variant="secondary">{asset.category}</Badge>
                                </TableCell>
                              )}
                              {visibleColumns.includes('location') && (
                                <TableCell>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{asset.location || 'Unknown'}</span>
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.includes('criticality') && (
                                <TableCell>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline" className={getCriticalityColor(asset.criticality)}>
                                          {asset.criticality === 'critical' && <Zap className="h-3 w-3 mr-1" />}
                                          {asset.criticality === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                          {asset.criticality === 'medium' && <Activity className="h-3 w-3 mr-1" />}
                                          {asset.criticality === 'low' && <CheckCircle className="h-3 w-3 mr-1" />}
                                          {asset.criticality}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{asset.criticality.charAt(0).toUpperCase() + asset.criticality.slice(1)} priority asset</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </TableCell>
                              )}
                              {visibleColumns.includes('vulnerabilities') && (
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-medium ${asset.vulnerabilities > 10 ? 'text-red-600' : asset.vulnerabilities > 5 ? 'text-orange-600' : 'text-green-600'}`}>
                                      {asset.vulnerabilities}
                                    </span>
                                    {asset.vulnerabilities > 10 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.includes('complianceScore') && (
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Progress value={asset.complianceScore} className="w-16" />
                                    <span className={`text-sm font-medium ${asset.complianceScore < 70 ? 'text-red-600' : asset.complianceScore < 85 ? 'text-orange-600' : 'text-green-600'}`}>
                                      {asset.complianceScore}%
                                    </span>
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.includes('lastSeen') && (
                                <TableCell>
                                  <span className="text-sm text-gray-500">{asset.lastSeen}</span>
                                </TableCell>
                              )}
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedAsset(asset);
                                      setShowAssetDetails(true);
                                    }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Asset
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Asset
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </DataTable>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedAssets.map((asset) => {
                const AssetIcon = getAssetIcon(asset);
                return (
                  <Card key={asset.id} className="hover:shadow-md transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <AssetIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{asset.name}</h3>
                            <p className="text-xs text-gray-500 font-mono">{asset.ipAddress}</p>
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedAssets.includes(asset.id)}
                          onCheckedChange={() => handleAssetSelect(asset.id)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                          <Badge variant="outline" className={getCriticalityColor(asset.criticality)}>
                            {asset.criticality}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{asset.location || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3 text-gray-400" />
                            <span>{asset.vulnerabilities} vulns</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3 text-gray-400" />
                            <span>{asset.complianceScore}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-gray-500">{asset.lastSeen}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedAsset(asset);
                            setShowAssetDetails(true);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Hierarchy View */}
          {viewMode === 'hierarchy' && (
            <AssetHierarchyView assets={filteredAndSortedAssets} />
          )}
        </TabsContent>

        {/* Asset Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-4">
          <AssetHierarchyView assets={filteredAndSortedAssets} />
        </TabsContent>

        {/* Reports & Analytics Tab */}
        <TabsContent value="reports" className="space-y-4">
          <AssetReportingEngine assets={filteredAndSortedAssets} />
        </TabsContent>

        {/* Field Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <AssetFormBuilder 
            customFields={customFields}
            onFieldsChange={() => queryClient.invalidateQueries({ queryKey: ['/api/assets/custom-fields'] })}
          />
        </TabsContent>

        {/* Table Views Tab */}
        <TabsContent value="views" className="space-y-4">
          <AssetTableDesigner 
            tableViews={tableViews}
            onViewsChange={() => queryClient.invalidateQueries({ queryKey: ['/api/assets/table-views'] })}
          />
        </TabsContent>
      </Tabs>

      {/* Asset Details Dialog */}
      {selectedAsset && (
        <AssetDetailsDialog
          asset={selectedAsset}
          open={showAssetDetails}
          onOpenChange={setShowAssetDetails}
          onAssetUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/assets/inventory'] });
            setShowAssetDetails(false);
          }}
        />
      )}

      {/* Table Designer Dialog */}
      <Dialog open={showTableDesigner} onOpenChange={setShowTableDesigner}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Table Designer</DialogTitle>
          </DialogHeader>
          <AssetTableDesigner 
            tableViews={tableViews}
            onViewsChange={() => queryClient.invalidateQueries({ queryKey: ['/api/assets/table-views'] })}
          />
        </DialogContent>
      </Dialog>

      {/* Form Builder Dialog */}
      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Custom Field Builder</DialogTitle>
          </DialogHeader>
          <AssetFormBuilder 
            customFields={customFields}
            onFieldsChange={() => queryClient.invalidateQueries({ queryKey: ['/api/assets/custom-fields'] })}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      {selectedAssets.length > 0 && (
        <AssetBulkActions 
          selectedAssets={selectedAssets}
          onClearSelection={() => setSelectedAssets([])}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/assets/inventory'] });
            setSelectedAssets([]);
          }}
        />
      )}
    </div>
  );
}
