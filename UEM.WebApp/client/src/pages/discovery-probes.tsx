import { useState } from "react";
import { useLocation } from 'wouter';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Play,
  Pause,
  Stop,
  Settings,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  BarChart3,
  Filter,
  Download,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Zap,
  List
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface SatelliteServer {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'warning';
  version: string;
  lastSeen: string;
  cpu: number;
  memory: number;
  jobQueue: number;
  uptime: string;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  region: string;
  datacenter: string;
  serverType: string;
  capabilities: string[];
  lastJobTime: string;
  nextScheduledJob: string;
}

// Mock data for demonstration
const mockProbes: SatelliteServer[] = [
  {
    id: "server-aws-us-east-1",
    name: "server-aws-us-east-1",
    location: "AWS US East 1",
    ipAddress: "172.31.45.23",
    status: "online",
    version: "v2.1.3",
    lastSeen: "2 min ago",
    cpu: 15,
    memory: 45,
    jobQueue: 0,
    uptime: "15d 4h 23m",
    totalJobs: 1247,
    successfulJobs: 1198,
    failedJobs: 49,
    region: "us-east-1",
    datacenter: "AWS",
    serverType: "Cloud",
    capabilities: ["Network Scan", "Port Discovery", "Service Detection"],
    lastJobTime: "5 min ago",
    nextScheduledJob: "in 10 min"
  },
  {
    id: "server-datacenter-london",
    name: "server-datacenter-london",
    location: "London Datacenter",
    ipAddress: "192.168.1.45",
    status: "online",
    version: "v2.1.3",
    lastSeen: "1 min ago",
    cpu: 25,
    memory: 60,
    jobQueue: 1,
    uptime: "8d 12h 45m",
    totalJobs: 856,
    successfulJobs: 834,
    failedJobs: 22,
    region: "eu-west-2",
    datacenter: "London DC",
    serverType: "On-Premise",
    capabilities: ["Network Scan", "Asset Discovery", "Vulnerability Assessment"],
    lastJobTime: "3 min ago",
    nextScheduledJob: "in 5 min"
  },
  {
    id: "server-azure-westeurope",
    name: "server-azure-westeurope",
    location: "Azure West Europe",
    ipAddress: "10.0.1.23",
    status: "offline",
    version: "v2.1.2",
    lastSeen: "2h 15m ago",
    cpu: 0,
    memory: 0,
    jobQueue: 0,
    uptime: "0d 0h 0m",
    totalJobs: 432,
    successfulJobs: 398,
    failedJobs: 34,
    region: "eu-west-1",
    datacenter: "Azure",
    serverType: "Cloud",
    capabilities: ["Network Scan", "Cloud Resource Discovery"],
    lastJobTime: "2h 30m ago",
    nextScheduledJob: "pending"
  },
  {
    id: "server-dev-k8s-cluster",
    name: "server-dev-k8s-cluster",
    location: "Development K8s Cluster",
    ipAddress: "172.17.0.45",
    status: "warning",
    version: "v2.1.3",
    lastSeen: "30 sec ago",
    cpu: 85,
    memory: 92,
    jobQueue: 5,
    uptime: "2d 8h 15m",
    totalJobs: 234,
    successfulJobs: 187,
    failedJobs: 47,
    region: "us-west-2",
    datacenter: "K8s",
    serverType: "Container",
    capabilities: ["Container Discovery", "Service Mesh Scan"],
    lastJobTime: "1 min ago",
    nextScheduledJob: "in 2 min"
  }
];

export default function SatelliteServersPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedProbe, setSelectedProbe] = useState<SatelliteServer | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Filter probes based on search and filters
  const filteredProbes = mockProbes.filter(probe => {
    const matchesSearch = probe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         probe.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         probe.ipAddress.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || probe.status === statusFilter;
    const matchesRegion = regionFilter === "all" || probe.region === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Warning</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleProbeAction = (probe: SatelliteServer, action: string) => {
    toast({
      title: `${action} server`,
      description: `Action ${action} performed on ${probe.name}`,
    });
  };

  const handleViewDetails = (probe: SatelliteServer) => {
    setSelectedProbe(probe);
    setShowDetailsDialog(true);
  };

  const handleViewLogs = (probe: SatelliteServer) => {
    toast({
      title: "View Logs",
      description: `Opening logs for ${probe.name}`,
    });
  };

  const handleRestart = (probe: SatelliteServer) => {
    toast({
      title: "Restarting Server",
      description: `Restarting ${probe.name}...`,
    });
  };

  const handleViewJobQueue = (probe: SatelliteServer) => {
    setLocation(`/satellite-job-queue?serverId=${probe.id}&serverName=${probe.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search satellite servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="us-east-1">US East 1</SelectItem>
              <SelectItem value="us-west-2">US West 2</SelectItem>
              <SelectItem value="eu-west-1">EU West 1</SelectItem>
              <SelectItem value="eu-west-2">EU West 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Deploy New Server
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deploy New Satellite Server</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Server Name</Label>
                  <Input placeholder="server-name" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input placeholder="Datacenter location" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>IP Address</Label>
                  <Input placeholder="192.168.1.100" />
                </div>
                <div>
                  <Label>Region</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East 1</SelectItem>
                      <SelectItem value="us-west-2">US West 2</SelectItem>
                      <SelectItem value="eu-west-1">EU West 1</SelectItem>
                      <SelectItem value="eu-west-2">EU West 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Server Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select server type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloud">Cloud</SelectItem>
                    <SelectItem value="on-premise">On-Premise</SelectItem>
                    <SelectItem value="container">Container</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Configuration</Label>
                <Textarea placeholder="Additional configuration parameters..." rows={4} />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>
                  Deploy Server
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Servers</p>
                <p className="text-2xl font-bold">{mockProbes.length}</p>
              </div>
              <Server className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
                <p className="text-2xl font-bold text-green-600">{mockProbes.filter(p => p.status === 'online').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{mockProbes.filter(p => p.status === 'warning').length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Offline</p>
                <p className="text-2xl font-bold text-red-600">{mockProbes.filter(p => p.status === 'offline').length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Probes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProbes.map((probe) => (
          <Card key={probe.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(probe.status)}
                  <div>
                    <CardTitle className="text-lg">{probe.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{probe.location}</p>
                  </div>
                </div>
                {getStatusBadge(probe.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* System Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Cpu className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <div className="text-lg font-bold">{probe.cpu}%</div>
                  <Progress value={probe.cpu} className="h-1" />
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <HardDrive className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <div className="text-lg font-bold">{probe.memory}%</div>
                  <Progress value={probe.memory} className="h-1" />
                </div>
                
                <div 
                  className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
                  onClick={() => handleViewJobQueue(probe)}
                  title="Click to view job queue details"
                >
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm font-medium">Job Queue</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600 hover:text-purple-700">
                    {probe.jobQueue}
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    <List className="w-3 h-3 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Version:</span>
                  <span>{probe.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Seen:</span>
                  <span>{probe.lastSeen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                  <span>{probe.uptime}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(probe)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewLogs(probe)}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestart(probe)}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewJobQueue(probe)}
                    title="View Job Queue"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    onClick={() => handleViewJobQueue(probe)}
                  >
                    <List className="w-4 h-4 mr-1" />
                    Job Queue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Probe Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedProbe && getStatusIcon(selectedProbe.status)}
              <span>{selectedProbe?.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedProbe && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Location:</span>
                      <span>{selectedProbe.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                      <span>{selectedProbe.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Region:</span>
                      <span>{selectedProbe.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Datacenter:</span>
                      <span>{selectedProbe.datacenter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Probe Type:</span>
                      <span>{selectedProbe.probeType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Version:</span>
                      <span>{selectedProbe.version}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm">{selectedProbe.cpu}%</span>
                      </div>
                      <Progress value={selectedProbe.cpu} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Memory Usage</span>
                        <span className="text-sm">{selectedProbe.memory}%</span>
                      </div>
                      <Progress value={selectedProbe.memory} />
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                        <span>{selectedProbe.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Job Queue:</span>
                        <span>{selectedProbe.jobQueue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Statistics */}
              <div>
                <h3 className="font-semibold mb-3">Job Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedProbe.totalJobs}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedProbe.successfulJobs}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedProbe.failedJobs}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="font-semibold mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProbe.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Scheduling */}
              <div>
                <h3 className="font-semibold mb-3">Scheduling</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Job:</span>
                    <span>{selectedProbe.lastJobTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Next Scheduled:</span>
                    <span>{selectedProbe.nextScheduledJob}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
                <Button>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}