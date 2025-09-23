import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Monitor,
  AlertTriangle,
  Download,
  RefreshCw,
  Database,
  Eye,
  Server,
  Wifi,
  Clock,
  MapPin,
  HardDrive,
  Network,
  Cpu,
  MemoryStick,
  Activity,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Brain,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { AIAnalyticsInsights } from '@/components/AIAnalyticsInsights';
import { useToast } from '@/hooks/use-toast';
import { TenantContextBanner } from '@/components/TenantContextBanner';
import { useTenantData, useTenantContext } from '@/hooks/useTenantData';

export default function AgentStatusReports() {
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [reportPeriod, setReportPeriod] = useState<string>('7d');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [serverFilter, setServerFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<any>(null);
  const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
  const { toast } = useToast();

  // Enhanced agent data with detailed information
  const agentStatusData = [
    {
      id: 'agent-001',
      name: 'CORP-DC-01',
      hostname: 'corp-dc-01.enterprise.local',
      ipAddress: '192.168.1.10',
      serialNumber: 'DC01-SN-789456123',
      osName: 'Windows Server 2022 Datacenter',
      assetType: 'Domain Controller',
      location: 'Primary Data Center - Rack A14',
      serverSource: 'Enterprise-Server-01',
      lastCommunicated: '2025-07-18T08:45:12Z',
      agentVersion: 'v2.4.1',
      status: 'Online',
      policies: [
        { name: 'Network Device Discovery', status: 'Applied', lastRun: '2025-07-18T08:30:00Z', success: true, discoveredCount: 23 },
        { name: 'Security Compliance Scan', status: 'Applied', lastRun: '2025-07-18T08:25:00Z', success: true, discoveredCount: 8 },
        { name: 'Software Inventory', status: 'Applied', lastRun: '2025-07-18T08:20:00Z', success: true, discoveredCount: 47 },
        { name: 'Vulnerability Assessment', status: 'Partial', lastRun: '2025-07-18T08:15:00Z', success: false, discoveredCount: 3 },
        { name: 'Performance Monitoring', status: 'Applied', lastRun: '2025-07-18T08:40:00Z', success: true, discoveredCount: 15 }
      ],
      discoveredAssets: {
        networkDevices: 23,
        securityFindings: 8,
        softwareAssets: 47,
        vulnerabilities: 3,
        ports: 15
      },
      systemInfo: {
        cpu: 'Intel Xeon Gold 6248R @ 3.00GHz',
        memory: '64 GB DDR4',
        storage: '2TB SSD RAID 1',
        uptime: '45 days, 12 hours',
        domain: 'ENTERPRISE.LOCAL'
      },
      completionRate: 96.8,
      issues: [
        { type: 'warning', message: 'Authentication timeout on vulnerability assessment', severity: 'Medium' }
      ]
    },
    {
      id: 'agent-002',
      name: 'CORP-WEB-02',
      hostname: 'corp-web-02.enterprise.local',
      ipAddress: '192.168.1.25',
      serialNumber: 'WEB02-SN-456789012',
      osName: 'Windows Server 2019 Standard',
      assetType: 'Web Server',
      location: 'Secondary Data Center - Rack B07',
      serverSource: 'Enterprise-Server-02',
      lastCommunicated: '2025-07-18T08:43:28Z',
      agentVersion: 'v2.4.1',
      status: 'Online',
      policies: [
        { name: 'Network Device Discovery', status: 'Applied', lastRun: '2025-07-18T08:35:00Z', success: true, discoveredCount: 18 },
        { name: 'Security Compliance Scan', status: 'Applied', lastRun: '2025-07-18T08:30:00Z', success: true, discoveredCount: 5 },
        { name: 'Software Inventory', status: 'Applied', lastRun: '2025-07-18T08:25:00Z', success: true, discoveredCount: 32 },
        { name: 'Performance Monitoring', status: 'Applied', lastRun: '2025-07-18T08:40:00Z', success: true, discoveredCount: 12 }
      ],
      discoveredAssets: {
        networkDevices: 18,
        securityFindings: 5,
        softwareAssets: 32,
        vulnerabilities: 1,
        ports: 12
      },
      systemInfo: {
        cpu: 'Intel Xeon Silver 4214 @ 2.20GHz',
        memory: '32 GB DDR4',
        storage: '1TB SSD',
        uptime: '23 days, 8 hours',
        domain: 'ENTERPRISE.LOCAL'
      },
      completionRate: 92.1,
      issues: []
    },
    {
      id: 'agent-003',
      name: 'CORP-DB-03',
      hostname: 'corp-db-03.enterprise.local',
      ipAddress: '192.168.1.35',
      serialNumber: 'DB03-SN-123456789',
      osName: 'Windows Server 2022 Standard',
      assetType: 'Database Server',
      location: 'Primary Data Center - Rack A16',
      serverSource: 'Enterprise-Server-01',
      lastCommunicated: '2025-07-18T08:41:15Z',
      agentVersion: 'v2.3.8',
      status: 'Warning',
      policies: [
        { name: 'Network Device Discovery', status: 'Applied', lastRun: '2025-07-18T08:30:00Z', success: true, discoveredCount: 31 },
        { name: 'Security Compliance Scan', status: 'Failed', lastRun: '2025-07-18T08:25:00Z', success: false, discoveredCount: 0 },
        { name: 'Software Inventory', status: 'Applied', lastRun: '2025-07-18T08:20:00Z', success: true, discoveredCount: 68 },
        { name: 'Vulnerability Assessment', status: 'Failed', lastRun: '2025-07-18T08:15:00Z', success: false, discoveredCount: 0 },
        { name: 'Performance Monitoring', status: 'Applied', lastRun: '2025-07-18T08:40:00Z', success: true, discoveredCount: 18 },
        { name: 'Database Health Check', status: 'Applied', lastRun: '2025-07-18T08:38:00Z', success: true, discoveredCount: 8 }
      ],
      discoveredAssets: {
        networkDevices: 31,
        securityFindings: 12,
        softwareAssets: 68,
        vulnerabilities: 8,
        ports: 18
      },
      systemInfo: {
        cpu: 'Intel Xeon Platinum 8270 @ 2.70GHz',
        memory: '128 GB DDR4',
        storage: '4TB NVMe SSD RAID 10',
        uptime: '67 days, 15 hours',
        domain: 'ENTERPRISE.LOCAL'
      },
      completionRate: 88.7,
      issues: [
        { type: 'critical', message: 'Security compliance scan failed - credential expired', severity: 'High' },
        { type: 'critical', message: 'Vulnerability assessment timeout - network issues', severity: 'High' }
      ]
    }
  ];

  const formatLastCommunicated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / 1440)} days ago`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Online':
        return <Badge className="bg-green-600">Online</Badge>;
      case 'Warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Warning</Badge>;
      case 'Offline':
        return <Badge variant="outline" className="border-red-500 text-red-600">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPolicyStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  // Filter and sort agents
  const filteredAndSortedAgents = agentStatusData
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           agent.ipAddress.includes(searchQuery) ||
                           agent.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || agent.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesAssetType = assetTypeFilter === 'all' || agent.assetType === assetTypeFilter;
      const matchesServer = serverFilter === 'all' || agent.serverSource === serverFilter;
      
      return matchesSearch && matchesStatus && matchesAssetType && matchesServer;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'status':
          return multiplier * a.status.localeCompare(b.status);
        case 'lastCommunicated':
          return multiplier * (new Date(a.lastCommunicated).getTime() - new Date(b.lastCommunicated).getTime());
        case 'completionRate':
          return multiplier * (a.completionRate - b.completionRate);
        case 'assetType':
          return multiplier * a.assetType.localeCompare(b.assetType);
        case 'osName':
          return multiplier * a.osName.localeCompare(b.osName);
        default:
          return 0;
      }
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const handleAIInsightGenerated = (insight: any) => {
    toast({
      title: "AI Insights Generated",
      description: "New analytics insights and recommendations are available for your review",
    });
  };

  return (
    <div className="space-y-6">
      <TenantContextBanner />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Status Reports</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Comprehensive agent status summary with detailed asset information
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => setIsAIInsightsOpen(true)} 
            variant="outline"
            className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
          >
            <Brain className="w-4 h-4 mr-2 text-purple-600" />
            AI Analytics
            <Sparkles className="w-3 h-3 ml-1 text-purple-600" />
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>Advanced Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Asset Types</SelectItem>
                <SelectItem value="Domain Controller">Domain Controller</SelectItem>
                <SelectItem value="Web Server">Web Server</SelectItem>
                <SelectItem value="Database Server">Database Server</SelectItem>
                <SelectItem value="File Server">File Server</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={serverFilter} onValueChange={setServerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Server" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Servers</SelectItem>
                <SelectItem value="Enterprise-Server-01">Enterprise-Server-01</SelectItem>
                <SelectItem value="Enterprise-Server-02">Enterprise-Server-02</SelectItem>
                <SelectItem value="Enterprise-Server-03">Enterprise-Server-03</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setAssetTypeFilter('all');
                  setServerFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent List View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span>Agent Status Summary ({filteredAndSortedAgents.length} agents)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export List
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('name')}
                      className="font-medium flex items-center space-x-1"
                    >
                      <span>Agent Name</span>
                      {getSortIcon('name')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('status')}
                      className="font-medium flex items-center space-x-1"
                    >
                      <span>Status</span>
                      {getSortIcon('status')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('assetType')}
                      className="font-medium flex items-center space-x-1"
                    >
                      <span>Asset Type</span>
                      {getSortIcon('assetType')}
                    </Button>
                  </th>
                  <th className="text-left p-3">IP Address</th>
                  <th className="text-left p-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('osName')}
                      className="font-medium flex items-center space-x-1"
                    >
                      <span>OS Name</span>
                      {getSortIcon('osName')}
                    </Button>
                  </th>
                  <th className="text-left p-3">Server Source</th>
                  <th className="text-left p-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('lastCommunicated')}
                      className="font-medium flex items-center space-x-1"
                    >
                      <span>Last Communicated</span>
                      {getSortIcon('lastCommunicated')}
                    </Button>
                  </th>
                  <th className="text-left p-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('completionRate')}
                      className="font-medium flex items-center space-x-1"
                    >
                      <span>Completion %</span>
                      {getSortIcon('completionRate')}
                    </Button>
                  </th>
                  <th className="text-left p-3">Applied Policies</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedAgents.map((agent) => (
                  <tr key={agent.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{agent.name}</p>
                        <p className="text-sm text-gray-500">{agent.hostname}</p>
                        <p className="text-xs text-gray-400">S/N: {agent.serialNumber}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(agent.status)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{agent.assetType}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Network className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-mono">{agent.ipAddress}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{agent.osName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{agent.serverSource}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm">{formatLastCommunicated(agent.lastCommunicated)}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(agent.lastCommunicated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{agent.completionRate}%</span>
                        <Badge 
                          variant={agent.completionRate >= 95 ? 'default' : agent.completionRate >= 90 ? 'outline' : 'outline'} 
                          className={
                            agent.completionRate >= 95 
                              ? 'bg-green-600' 
                              : agent.completionRate >= 90 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-yellow-500 text-yellow-600'
                          }
                        >
                          {agent.completionRate >= 95 ? 'Excellent' : agent.completionRate >= 90 ? 'Good' : 'Fair'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {agent.policies.slice(0, 2).map((policy, index) => (
                          <Badge 
                            key={index}
                            variant={policy.success ? 'default' : 'outline'}
                            className={policy.success ? 'bg-green-600 text-xs' : 'border-red-500 text-red-600 text-xs'}
                          >
                            {policy.name.split(' ')[0]}
                          </Badge>
                        ))}
                        {agent.policies.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.policies.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAgentDetail(agent)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Agent Details - {agent.name}</DialogTitle>
                            <DialogDescription>
                              Comprehensive information about {agent.name} including system details, policies, and discovered assets
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="policies">Policies & Discovery</TabsTrigger>
                              <TabsTrigger value="assets">Discovered Assets</TabsTrigger>
                              <TabsTrigger value="system">System Information</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Basic Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Agent Name</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{agent.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                                        {getStatusBadge(agent.status)}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hostname</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{agent.hostname}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IP Address</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{agent.ipAddress}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Serial Number</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{agent.serialNumber}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Asset Type</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{agent.assetType}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">OS Name</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{agent.osName}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{agent.location}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Communication</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Server Source</p>
                                      <p className="text-sm text-gray-900 dark:text-white">{agent.serverSource}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Communicated</p>
                                      <p className="text-sm text-gray-900 dark:text-white">
                                        {formatLastCommunicated(agent.lastCommunicated)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(agent.lastCommunicated).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Agent Version</p>
                                      <p className="text-sm text-gray-900 dark:text-white">{agent.agentVersion}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                                      <div className="flex items-center space-x-2">
                                        <p className="text-sm text-gray-900 dark:text-white">{agent.completionRate}%</p>
                                        <Badge 
                                          variant={agent.completionRate >= 95 ? 'default' : 'outline'}
                                          className={agent.completionRate >= 95 ? 'bg-green-600' : 'border-yellow-500 text-yellow-600'}
                                        >
                                          {agent.completionRate >= 95 ? 'Excellent' : agent.completionRate >= 90 ? 'Good' : 'Needs Attention'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                              
                              {/* Issues Section */}
                              {agent.issues.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300">Active Issues</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {agent.issues.map((issue, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                                                {issue.severity} Priority Issue
                                              </p>
                                              <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                                {issue.severity}
                                              </Badge>
                                            </div>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                              {issue.message}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="policies" className="space-y-4">
                              <div className="space-y-4">
                                {agent.policies.map((policy, index) => (
                                  <Card key={index}>
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          {getPolicyStatusIcon(policy.success)}
                                          <div>
                                            <p className="font-medium">{policy.name}</p>
                                            <p className="text-sm text-gray-600">
                                              Last run: {new Date(policy.lastRun).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <Badge 
                                            variant={policy.success ? 'default' : 'outline'} 
                                            className={policy.success ? 'bg-green-600' : 'border-red-500 text-red-600'}
                                          >
                                            {policy.status}
                                          </Badge>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {policy.discoveredCount} items discovered
                                          </p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="assets" className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Network className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{agent.discoveredAssets.networkDevices}</p>
                                    <p className="text-sm text-gray-600">Network Devices</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{agent.discoveredAssets.securityFindings}</p>
                                    <p className="text-sm text-gray-600">Security Findings</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{agent.discoveredAssets.softwareAssets}</p>
                                    <p className="text-sm text-gray-600">Software Assets</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{agent.discoveredAssets.vulnerabilities}</p>
                                    <p className="text-sm text-gray-600">Vulnerabilities</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-4 text-center">
                                    <Network className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold">{agent.discoveredAssets.ports}</p>
                                    <p className="text-sm text-gray-600">Open Ports</p>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="system" className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Hardware Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                      <Cpu className="w-5 h-5 text-blue-600" />
                                      <div>
                                        <p className="font-medium">Processor</p>
                                        <p className="text-sm text-gray-600">{agent.systemInfo.cpu}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <MemoryStick className="w-5 h-5 text-green-600" />
                                      <div>
                                        <p className="font-medium">Memory</p>
                                        <p className="text-sm text-gray-600">{agent.systemInfo.memory}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <HardDrive className="w-5 h-5 text-purple-600" />
                                      <div>
                                        <p className="font-medium">Storage</p>
                                        <p className="text-sm text-gray-600">{agent.systemInfo.storage}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Network Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <p className="font-medium">Domain</p>
                                      <p className="text-sm text-gray-600">{agent.systemInfo.domain}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Uptime</p>
                                      <p className="text-sm text-gray-600">{agent.systemInfo.uptime}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAndSortedAgents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No agents match the current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Analytics Insights */}
      <AIAnalyticsInsights
        isOpen={isAIInsightsOpen}
        onClose={() => setIsAIInsightsOpen(false)}
        onInsightGenerated={handleAIInsightGenerated}
      />
    </div>
  );
}