import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTenantData, useTenantContext } from "@/hooks/useTenantData";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus,
  Settings,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Shield,
  Network,
  MoreHorizontal,
  Edit,
  Trash2,
  TestTube,
  AlertTriangle,
  Info,
  Globe,
  Webhook,
  Database,
  RefreshCw,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ExternalSystem {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  authType: 'bearer' | 'api-key' | 'basic';
  enabled: boolean;
  syncDirection: 'inbound' | 'outbound' | 'bidirectional';
  webhookUrl?: string;
  rateLimitPerMinute: number;
  retryAttempts: number;
  timeoutMs: number;
  lastSyncTime?: string;
  totalSyncCount: number;
  failureCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationLog {
  id: number;
  assetId?: number;
  systemId: string;
  action: string;
  direction: 'inbound' | 'outbound';
  success: boolean;
  errorMessage?: string;
  processingTimeMs?: number;
  timestamp: string;
}

export default function ExternalIntegrationsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<ExternalSystem | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    baseUrl: '',
    authType: 'bearer' as 'bearer' | 'api-key' | 'basic',
    apiKey: '',
    enabled: true,
    syncDirection: 'bidirectional' as 'inbound' | 'outbound' | 'bidirectional',
    webhookUrl: '',
    rateLimitPerMinute: 60,
    retryAttempts: 3,
    timeoutMs: 30000
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch external systems
  const { data: systems = [], isLoading: systemsLoading } = useQuery({
    queryKey: ['/api/external-systems'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/external-systems');
      return response.json();
    }
  });

  // Fetch integration logs
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/integration-logs'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/integration-logs?limit=100');
      return response.json();
    }
  });

  // Create system mutation
  const createSystemMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/external-systems', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-systems'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "External System Created",
        description: "The external system has been configured successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create external system.",
        variant: "destructive",
      });
    }
  });

  // Update system mutation
  const updateSystemMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      apiRequest('PUT', `/api/external-systems/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-systems'] });
      setIsEditDialogOpen(false);
      setSelectedSystem(null);
      resetForm();
      toast({
        title: "External System Updated",
        description: "The external system configuration has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update external system.",
        variant: "destructive",
      });
    }
  });

  // Delete system mutation
  const deleteSystemMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/external-systems/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-systems'] });
      toast({
        title: "External System Deleted",
        description: "The external system has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete external system.",
        variant: "destructive",
      });
    }
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('POST', `/api/external-systems/${id}/test`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test Successful",
        description: data.message || "Connection to external system verified.",
      });
    },
    onError: () => {
      toast({
        title: "Connection Test Failed",
        description: "Unable to connect to the external system.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      baseUrl: '',
      authType: 'bearer' as 'bearer' | 'api-key' | 'basic',
      apiKey: '',
      enabled: true,
      syncDirection: 'bidirectional' as 'inbound' | 'outbound' | 'bidirectional',
      webhookUrl: '',
      rateLimitPerMinute: 60,
      retryAttempts: 3,
      timeoutMs: 30000
    });
  };

  const handleCreate = () => {
    createSystemMutation.mutate(formData);
  };

  const handleEdit = (system: ExternalSystem) => {
    setSelectedSystem(system);
    setFormData({
      id: system.id,
      name: system.name,
      description: system.description || '',
      baseUrl: system.baseUrl,
      authType: system.authType,
      apiKey: '',
      enabled: system.enabled,
      syncDirection: system.syncDirection,
      webhookUrl: system.webhookUrl || '',
      rateLimitPerMinute: system.rateLimitPerMinute,
      retryAttempts: system.retryAttempts,
      timeoutMs: system.timeoutMs
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (selectedSystem) {
      updateSystemMutation.mutate({
        id: selectedSystem.id,
        updates: formData
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this external system?')) {
      deleteSystemMutation.mutate(id);
    }
  };

  const handleTestConnection = (id: string) => {
    testConnectionMutation.mutate(id);
  };

  const getSyncDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'inbound': return <ArrowRightLeft className="w-4 h-4 rotate-180" />;
      case 'outbound': return <ArrowRightLeft className="w-4 h-4" />;
      case 'bidirectional': return <ArrowRightLeft className="w-4 h-4" />;
      default: return <ArrowRightLeft className="w-4 h-4" />;
    }
  };

  const getSyncDirectionColor = (direction: string) => {
    switch (direction) {
      case 'inbound': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'outbound': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'bidirectional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (enabled: boolean, isActive: boolean) => {
    if (enabled && isActive) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (enabled && !isActive) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integrations
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage bidirectional integrations with external systems
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Systems
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systems.length}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Systems
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systems.filter((s: ExternalSystem) => s.enabled && s.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Syncs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systems.reduce((sum: number, s: ExternalSystem) => sum + s.totalSyncCount, 0)}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {logs.length > 0 ? Math.round((logs.filter((l: IntegrationLog) => l.success).length / logs.length) * 100) : 0}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="systems">External Systems</TabsTrigger>
          <TabsTrigger value="logs">Integration Logs</TabsTrigger>
          <TabsTrigger value="rules">Sync Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="systems">
          <Card>
            <CardHeader>
              <CardTitle>External Systems</CardTitle>
              <CardDescription>
                Configure and manage connections to external systems for bidirectional asset synchronization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>System</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sync Direction</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systems.map((system: ExternalSystem) => (
                      <TableRow key={system.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{system.name}</div>
                            <div className="text-sm text-gray-500">{system.baseUrl}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(system.enabled, system.isActive)}
                            <span className="text-sm">
                              {system.enabled ? (system.isActive ? 'Active' : 'Inactive') : 'Disabled'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getSyncDirectionColor(system.syncDirection)}`}>
                            <div className="flex items-center space-x-1">
                              {getSyncDirectionIcon(system.syncDirection)}
                              <span>{system.syncDirection}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {system.lastSyncTime ? new Date(system.lastSyncTime).toLocaleDateString() : 'Never'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {system.totalSyncCount > 0 
                              ? Math.round(((system.totalSyncCount - system.failureCount) / system.totalSyncCount) * 100)
                              : 0}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(system)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTestConnection(system.id)}>
                                <TestTube className="w-4 h-4 mr-2" />
                                Test Connection
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(system.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Integration Logs</CardTitle>
              <CardDescription>
                Monitor real-time synchronization activity and troubleshoot integration issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>System</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processing Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: IntegrationLog) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{log.systemId}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getSyncDirectionColor(log.direction)}`}>
                            {log.direction}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {log.success ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm">
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {log.processingTimeMs ? `${log.processingTimeMs}ms` : 'N/A'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Integration Rules</CardTitle>
              <CardDescription>
                Configure automatic synchronization rules and triggers for asset data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Integration rules configuration coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={() => {
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedSystem(null);
        resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? 'Edit External System' : 'Add External System'}
            </DialogTitle>
            <DialogDescription>
              Configure connection settings for bidirectional asset synchronization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="systemId">System ID</Label>
                <Input
                  id="systemId"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="unique-system-id"
                  disabled={isEditDialogOpen}
                />
              </div>
              <div>
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="External System Name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the external system and its purpose"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.external-system.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authType">Authentication Type</Label>
                <Select 
                  value={formData.authType} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, authType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="api-key">API Key</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="syncDirection">Sync Direction</Label>
                <Select 
                  value={formData.syncDirection} 
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, syncDirection: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound Only</SelectItem>
                    <SelectItem value="outbound">Outbound Only</SelectItem>
                    <SelectItem value="bidirectional">Bidirectional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="apiKey">API Key / Token</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter authentication credentials"
              />
            </div>

            <div>
              <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
              <Input
                id="webhookUrl"
                value={formData.webhookUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://your-system.com/webhook/endpoint"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rateLimit">Rate Limit (per min)</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={formData.rateLimitPerMinute}
                  onChange={(e) => setFormData(prev => ({ ...prev, rateLimitPerMinute: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  value={formData.retryAttempts}
                  onChange={(e) => setFormData(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={formData.timeoutMs}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeoutMs: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedSystem(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={isEditDialogOpen ? handleUpdate : handleCreate}
              disabled={createSystemMutation.isPending || updateSystemMutation.isPending}
            >
              {isEditDialogOpen ? 'Update' : 'Create'} System
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}