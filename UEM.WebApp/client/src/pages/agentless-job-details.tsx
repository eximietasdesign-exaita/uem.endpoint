import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { ChevronLeft, Play, Pause, Square, Edit, Copy, History, AlertTriangle, Trash2, Clock, Target, CheckCircle, XCircle, AlertCircle, Server, Monitor, HardDrive, Wifi, Shield, FileText, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AgentlessDiscoveryJob } from '@/shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DiscoveredAsset {
  hostname: string;
  ip: string;
  os: string;
  type: string;
  vlan?: string;
  compliance?: number;
}

interface ErrorLog {
  timestamp: string;
  level: string;
  message: string;
}

export default function AgentlessJobDetails() {
  const [, params] = useRoute('/agentless-discovery/view/:id');
  const jobId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery<AgentlessDiscoveryJob>({
    queryKey: ['/api/agentless-discovery-jobs', jobId],
    enabled: !!jobId,
  });

  // Action mutations
  const runJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest(`/api/agentless-discovery-jobs/${jobId}/run`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agentless-discovery-jobs'] });
    },
    onError: (error: any) => {
      console.error('Failed to start job:', error);
      toast({
        title: "Error",
        description: `Failed to start job: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const pauseJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest(`/api/agentless-discovery-jobs/${jobId}/pause`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job paused successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agentless-discovery-jobs'] });
    },
    onError: (error: any) => {
      console.error('Failed to pause job:', error);
      toast({
        title: "Error",
        description: `Failed to pause job: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const disableJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest(`/api/agentless-discovery-jobs/${jobId}/disable`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job disabled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agentless-discovery-jobs'] });
    },
    onError: (error: any) => {
      console.error('Failed to disable job:', error);
      toast({
        title: "Error",
        description: `Failed to disable job: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest(`/api/agentless-discovery-jobs/${jobId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agentless-discovery-jobs'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete job:', error);
      toast({
        title: "Error",
        description: `Failed to delete job: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleJobAction = (action: string) => {
    if (!jobId) return;
    
    console.log(`Executing action: ${action} on job: ${jobId}`);
    try {
      switch (action) {
        case 'run':
          runJobMutation.mutate(jobId);
          break;
        case 'pause':
          pauseJobMutation.mutate(jobId);
          break;
        case 'disable':
          disableJobMutation.mutate(jobId);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this job?')) {
            deleteJobMutation.mutate(jobId);
          }
          break;
        case 'edit':
          toast({
            title: "Info",
            description: "Edit functionality will be implemented soon",
          });
          break;
        case 'clone':
          toast({
            title: "Info", 
            description: "Clone functionality will be implemented soon",
          });
          break;
        case 'history':
          toast({
            title: "Info",
            description: "History view will be implemented soon",
          });
          break;
        default:
          console.warn(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error('Error in handleJobAction:', error);
      toast({
        title: "Error",
        description: `Failed to execute action: ${action}`,
        variant: "destructive",
      });
    }
  };

  if (!jobId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Invalid job ID provided.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Job not found.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusConfig = {
    scheduled: { color: 'bg-blue-500', label: 'Scheduled', icon: Clock, variant: 'default' as const },
    running: { color: 'bg-green-500', label: 'Running', icon: Play, variant: 'default' as const },
    completed: { color: 'bg-emerald-500', label: 'Completed', icon: CheckCircle, variant: 'secondary' as const },
    failed: { color: 'bg-red-500', label: 'Failed', icon: XCircle, variant: 'destructive' as const },
    paused: { color: 'bg-yellow-500', label: 'Paused', icon: Pause, variant: 'secondary' as const },
    disabled: { color: 'bg-gray-500', label: 'Disabled', icon: Square, variant: 'outline' as const },
  };

  const config = statusConfig[job.status as keyof typeof statusConfig];
  const Icon = config?.icon || Clock;

  // Parse discovered assets and error logs
  const discoveredAssets: DiscoveredAsset[] = job.discoveredAssets ? JSON.parse(job.discoveredAssets) : [];
  const errorLogs: ErrorLog[] = job.errorLogs ? JSON.parse(job.errorLogs) : [];
  const targets = job.targets ? JSON.parse(job.targets) : {};
  const schedule = job.schedule ? JSON.parse(job.schedule) : {};
  const policyIds = job.policyIds ? JSON.parse(job.policyIds) : [];

  // Group discovered assets by type
  const groupedAssets = discoveredAssets.reduce((acc, asset) => {
    const type = asset.type || 'Unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {} as Record<string, DiscoveredAsset[]>);

  const getAssetTypeIcon = (type: string) => {
    const typeIcons: Record<string, any> = {
      'Domain Controller': Server,
      'File Server': HardDrive,
      'Web Server': Monitor,
      'Database Server': HardDrive,
      'Workstation': Monitor,
      'Development Web Server': Monitor,
      'Development Database': HardDrive,
    };
    return typeIcons[type] || Server;
  };

  const successRate = job.runCount > 0 ? (job.successCount / job.runCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/agentless-jobs">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{job.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={config?.variant} className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${config?.color}`} />
              <span>{config?.label}</span>
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {job.status !== 'running' && job.status !== 'disabled' && (
                  <DropdownMenuItem onClick={() => handleJobAction('run')}>
                    <Play className="mr-2 h-4 w-4" />
                    Run Now
                  </DropdownMenuItem>
                )}
                {job.status === 'running' && (
                  <DropdownMenuItem onClick={() => handleJobAction('pause')}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleJobAction('edit')}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleJobAction('clone')}>
                  <Copy className="mr-2 h-4 w-4" />
                  Clone
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleJobAction('history')}>
                  <History className="mr-2 h-4 w-4" />
                  View History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {job.status !== 'disabled' && (
                  <DropdownMenuItem 
                    onClick={() => handleJobAction('disable')}
                    className="text-yellow-600"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Disable
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => handleJobAction('delete')}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Runs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{job.runCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{successRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assets Found</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{discoveredAssets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Run</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {job.lastRun ? new Date(job.lastRun).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="assets">Discovered Assets</TabsTrigger>
            <TabsTrigger value="errors">Error Logs</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Execution Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-medium">{successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">{job.successCount}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Successful</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">{job.errorCount}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Failed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-600">{job.runCount}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Schedule Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                    <span className="font-medium">{schedule.type || 'Manual'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Frequency</span>
                    <span className="font-medium">{schedule.frequency || 'N/A'}</span>
                  </div>
                  {schedule.time && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Time</span>
                      <span className="font-medium">{schedule.time}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Next Run</span>
                    <span className="font-medium">
                      {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'Not scheduled'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            {Object.keys(groupedAssets).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Server className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No assets discovered</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This job hasn't discovered any assets yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedAssets).map(([type, assets]) => {
                  const TypeIcon = getAssetTypeIcon(type);
                  return (
                    <Card key={type}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TypeIcon className="h-5 w-5" />
                          <span>{type}</span>
                          <Badge variant="secondary">{assets.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hostname</TableHead>
                              <TableHead>IP Address</TableHead>
                              <TableHead>Operating System</TableHead>
                              {assets.some(a => a.vlan) && <TableHead>VLAN</TableHead>}
                              {assets.some(a => a.compliance) && <TableHead>Compliance</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assets.map((asset, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{asset.hostname}</TableCell>
                                <TableCell>{asset.ip}</TableCell>
                                <TableCell>{asset.os}</TableCell>
                                {assets.some(a => a.vlan) && (
                                  <TableCell>{asset.vlan || '-'}</TableCell>
                                )}
                                {assets.some(a => a.compliance) && (
                                  <TableCell>
                                    {asset.compliance ? (
                                      <div className="flex items-center space-x-2">
                                        <Progress value={asset.compliance} className="h-2 w-16" />
                                        <span className="text-sm">{asset.compliance}%</span>
                                      </div>
                                    ) : '-'}
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            {errorLogs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No errors found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This job has run without any errors.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Error Logs</span>
                    <Badge variant="destructive">{errorLogs.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {errorLogs.map((log, index) => (
                      <Alert key={index} variant={log.level === 'error' ? 'destructive' : 'default'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex justify-between items-start">
                            <span>{log.message}</span>
                            <span className="text-xs text-gray-500 ml-4">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Target Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {targets.ipRanges && targets.ipRanges.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">IP Ranges</h4>
                      <div className="mt-1 space-y-1">
                        {targets.ipRanges.map((range: string, index: number) => (
                          <Badge key={index} variant="outline">{range}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {targets.hostnames && targets.hostnames.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">Hostnames</h4>
                      <div className="mt-1 space-y-1">
                        {targets.hostnames.map((hostname: string, index: number) => (
                          <Badge key={index} variant="outline">{hostname}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {targets.ipSegments && targets.ipSegments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">IP Segments</h4>
                      <div className="mt-1 space-y-1">
                        {targets.ipSegments.map((segment: string, index: number) => (
                          <Badge key={index} variant="outline">{segment}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created By</span>
                    <span className="font-medium">{job.createdBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created At</span>
                    <span className="font-medium">{new Date(job.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                    <span className="font-medium">{new Date(job.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Policies</span>
                    <span className="font-medium">{policyIds.length} selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credential Profile</span>
                    <span className="font-medium">{job.credentialProfileId || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Probe ID</span>
                    <span className="font-medium">{job.probeId || 'Not set'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}