import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Monitor, Plus, Filter, MoreHorizontal, Circle, Search, Play, Settings, Info, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useTenantData, useTenantContext } from "@/hooks/useTenantData";

export default function AssetsPage() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [agentDiscoveryForm, setAgentDiscoveryForm] = useState({
    targetCount: 5,
    deploymentMethod: 'group-policy'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine endpoint type from URL
  const getEndpointType = () => {
    if (location.includes("/agent-based")) return "agent-based";
    if (location.includes("/agentless")) return "agentless";
    return "";
  };

  const endpointType = getEndpointType();

  const { data: endpoints, isLoading, hasContext } = useTenantData({
    endpoint: "/api/endpoints",
    additionalParams: { type: endpointType },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "offline":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const filteredEndpoints = endpoints?.filter((endpoint: any) =>
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.ipAddress.includes(searchTerm) ||
    endpoint.operatingSystem.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getPageTitle = () => {
    if (location.includes("/agent-based")) return t("agent_based");
    if (location.includes("/agentless")) return t("agentless");
    return t("all_endpoints");
  };

  // Agent-based discovery simulation
  const agentDiscoveryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/discovery/agent-based/simulate", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Agent Discovery Started",
        description: "Agent-based discovery simulation has been initiated",
      });
      // Refresh endpoints after a delay to show discovered assets
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/endpoints"] });
      }, 5000);
    },
    onError: () => {
      toast({
        title: "Discovery Failed",
        description: "Failed to start agent-based discovery simulation",
        variant: "destructive",
      });
    },
  });

  const getDiscoveryMethodBadge = (method: string) => {
    switch (method) {
      case 'agentless-scan':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Agentless Scan</Badge>;
      case 'agent-deployment':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Agent Deployment</Badge>;
      case 'manual':
        return <Badge variant="outline">Manual</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderAssetDetails = (endpoint: any) => {
    try {
      const assetDetails = endpoint.assetDetails ? JSON.parse(endpoint.assetDetails) : null;
      const systemInfo = endpoint.systemInfo ? JSON.parse(endpoint.systemInfo) : null;
      const vulnerabilities = endpoint.vulnerabilities ? JSON.parse(endpoint.vulnerabilities) : [];
      const installedSoftware = endpoint.installedSoftware ? JSON.parse(endpoint.installedSoftware) : [];
      const networkPorts = endpoint.networkPorts ? JSON.parse(endpoint.networkPorts) : [];

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEndpoint(endpoint)}>
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                {endpoint.name}
              </DialogTitle>
              <DialogDescription>
                {endpoint.ipAddress} • {endpoint.operatingSystem}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(endpoint.status)}>
                      {endpoint.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Discovery Method</Label>
                  <div className="mt-1">
                    {getDiscoveryMethodBadge(endpoint.discoveryMethod)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Agent Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {endpoint.agentType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Compliance Score</Label>
                  <div className="mt-1">
                    <span className={`font-medium ${getComplianceColor(endpoint.complianceScore)}`}>
                      {endpoint.complianceScore}%
                    </span>
                  </div>
                </div>
              </div>

              {systemInfo && (
                <div>
                  <Label className="text-sm font-medium">System Information</Label>
                  <div className="mt-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {systemInfo.hostname && <div><span className="font-medium">Hostname:</span> {systemInfo.hostname}</div>}
                      {systemInfo.domain && <div><span className="font-medium">Domain:</span> {systemInfo.domain}</div>}
                      {systemInfo.totalMemory && <div><span className="font-medium">Memory:</span> {systemInfo.totalMemory} GB</div>}
                      {systemInfo.cpuCores && <div><span className="font-medium">CPU Cores:</span> {systemInfo.cpuCores}</div>}
                      {systemInfo.diskSpace && <div><span className="font-medium">Disk Space:</span> {systemInfo.diskSpace} GB</div>}
                      {systemInfo.architecture && <div><span className="font-medium">Architecture:</span> {systemInfo.architecture}</div>}
                    </div>
                  </div>
                </div>
              )}

              {vulnerabilities.length > 0 && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Vulnerabilities ({vulnerabilities.length})
                  </Label>
                  <div className="mt-2 space-y-2">
                    {vulnerabilities.slice(0, 3).map((vuln: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{vuln.id}</span>
                          <Badge 
                            variant={vuln.severity === 'Critical' ? 'destructive' : vuln.severity === 'High' ? 'destructive' : 'secondary'}
                          >
                            {vuln.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vuln.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Score: {vuln.score}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {networkPorts.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Network Ports ({networkPorts.length})</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {networkPorts.slice(0, 6).map((port: any, index: number) => (
                      <div key={index} className="text-sm border rounded p-2">
                        <div className="font-medium">{port.port}/{port.service}</div>
                        <div className="text-xs text-gray-500">{port.state}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {installedSoftware.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Installed Software ({installedSoftware.length})</Label>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <div className="space-y-1">
                      {installedSoftware.slice(0, 10).map((software: any, index: number) => (
                        <div key={index} className="text-sm border-b pb-1">
                          <div className="font-medium">{software.name}</div>
                          <div className="text-xs text-gray-500">{software.version} • {software.vendor}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    } catch (error) {
      return (
        <Button variant="ghost" size="sm">
          <Info className="h-4 w-4" />
        </Button>
      );
    }
  };

  if (!hasContext) {
    return (
      <div className="space-y-6">
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and monitor your network endpoints
          </p>
        </div>
        <div className="flex gap-2">
          {location.includes("/agent-based") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Simulate Discovery
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agent-Based Discovery Simulation</DialogTitle>
                  <DialogDescription>
                    Simulate deploying security agents to discover and monitor endpoints
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetCount">Number of Targets</Label>
                    <Input
                      id="targetCount"
                      type="number"
                      value={agentDiscoveryForm.targetCount}
                      onChange={(e) => setAgentDiscoveryForm(prev => ({ 
                        ...prev, 
                        targetCount: parseInt(e.target.value) || 5 
                      }))}
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deploymentMethod">Deployment Method</Label>
                    <Select
                      value={agentDiscoveryForm.deploymentMethod}
                      onValueChange={(value) => setAgentDiscoveryForm(prev => ({ 
                        ...prev, 
                        deploymentMethod: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group-policy">Group Policy</SelectItem>
                        <SelectItem value="sccm">SCCM</SelectItem>
                        <SelectItem value="manual-install">Manual Install</SelectItem>
                        <SelectItem value="powershell">PowerShell Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => agentDiscoveryMutation.mutate(agentDiscoveryForm)}
                    disabled={agentDiscoveryMutation.isPending}
                  >
                    {agentDiscoveryMutation.isPending ? "Starting..." : "Start Discovery"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t("add_endpoint")}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Endpoints
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredEndpoints.length}
                </p>
              </div>
              <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Online
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {filteredEndpoints.filter((e: any) => e.status === "online").length}
                </p>
              </div>
              <Circle className="w-8 h-8 text-green-600 dark:text-green-400 fill-current" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Compliance
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {filteredEndpoints.length > 0
                    ? Math.round(
                        filteredEndpoints.reduce((sum: number, e: any) => sum + e.complianceScore, 0) /
                        filteredEndpoints.length
                      )
                    : 0}%
                </p>
              </div>
              <Circle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 fill-current" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredEndpoints.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? "No endpoints found matching your search" : "No endpoints available"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discovery Method</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEndpoints.map((endpoint: any) => (
                  <TableRow key={endpoint.id}>
                    <TableCell className="font-medium">{endpoint.name}</TableCell>
                    <TableCell>{endpoint.ipAddress}</TableCell>
                    <TableCell>{endpoint.operatingSystem}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(endpoint.status)}>
                        {endpoint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{endpoint.agentType}</Badge>
                    </TableCell>
                    <TableCell>
                      {getDiscoveryMethodBadge(endpoint.discoveryMethod)}
                    </TableCell>
                    <TableCell>
                      <span className={getComplianceColor(endpoint.complianceScore)}>
                        {endpoint.complianceScore}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {endpoint.lastSeen
                        ? formatDistanceToNow(new Date(endpoint.lastSeen), { addSuffix: true })
                        : "Never"
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {renderAssetDetails(endpoint)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Run Scan</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
