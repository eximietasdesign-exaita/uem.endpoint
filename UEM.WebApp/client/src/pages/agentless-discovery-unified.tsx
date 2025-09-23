import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  History, 
  Trash2,
  Calendar,
  Clock,
  Target,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Settings,
  Activity,
  BarChart3
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AgentlessDiscoveryJob } from "@shared/schema";
import { TenantContextBanner } from "@/components/TenantContextBanner";
import { useTenantData, useTenantContext } from "@/hooks/useTenantData";

interface JobFilters {
  status: string;
  search: string;
}

const statusConfig = {
  scheduled: { color: "bg-blue-500", label: "Scheduled", icon: Calendar },
  running: { color: "bg-green-500", label: "Running", icon: RefreshCw },
  completed: { color: "bg-gray-500", label: "Completed", icon: CheckCircle },
  paused: { color: "bg-yellow-500", label: "Paused", icon: Pause },
  failed: { color: "bg-red-500", label: "Failed", icon: XCircle },
  disabled: { color: "bg-gray-400", label: "Disabled", icon: AlertTriangle }
};

export default function AgentlessDiscoveryPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<JobFilters>({ status: '', search: '' });
  const { toast } = useToast();
  const { t } = useLanguage();

  // Use tenant-aware data fetching
  const { data: jobs = [], isLoading, refetch, hasContext } = useTenantData({
    endpoint: '/api/agentless-discovery-jobs',
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

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter((job: AgentlessDiscoveryJob) => {
    const matchesSearch = !filters.search || 
      job.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || job.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const getJobStats = () => {
    const total = jobs.length;
    const running = jobs.filter((job: AgentlessDiscoveryJob) => job.status === 'running').length;
    const scheduled = jobs.filter((job: AgentlessDiscoveryJob) => job.status === 'scheduled').length;
    const failed = jobs.filter((job: AgentlessDiscoveryJob) => job.status === 'failed').length;
    const completed = jobs.filter((job: AgentlessDiscoveryJob) => job.status === 'completed').length;

    return { total, running, scheduled, failed, completed };
  };

  const handleJobAction = (action: string, jobId: number) => {
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
        case 'view':
          setLocation(`/agentless-discovery/view/${jobId}`);
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

  const stats = getJobStats();

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;

    const Icon = config.icon;
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span>{config.label}</span>
      </Badge>
    );
  };

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

  if (!hasContext) {
    return (
      <div className="space-y-6">
        <TenantContextBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <TenantContextBanner />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agentless Discovery</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage automated network discovery and compliance scanning</p>
          </div>
          <Button onClick={() => setActiveTab("create")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Job
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <Target className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                  <p className="text-2xl font-bold text-green-600">{stats.running}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Jobs ({filteredJobs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Job</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.slice(0, 5).map((job: AgentlessDiscoveryJob) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <StatusBadge status={job.status} />
                          <div>
                            <p className="font-medium text-sm">{job.name}</p>
                            <p className="text-xs text-gray-500">
                              {job.lastRun ? `Last run: ${format(new Date(job.lastRun), 'MMM dd, HH:mm')}` : 'Never run'}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLocation(`/agentless-discovery/view/${job.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Discovery Service</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Credential Vault</span>
                      <Badge variant="default" className="bg-green-500">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Policy Engine</span>
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Probe Network</span>
                      <Badge variant="default" className="bg-yellow-500">3 of 4 Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search jobs..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                  
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="failed">Failed</option>
                    <option value="disabled">Disabled</option>
                  </select>
                  
                  <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Discovery Jobs ({filteredJobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Targets</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job: AgentlessDiscoveryJob) => {
                      const targets = JSON.parse(job.targets || '{}');
                      const targetCount = Object.values(targets).flat().length;
                      const successRate = job.runCount > 0 ? Math.round((job.successCount / job.runCount) * 100) : 0;

                      return (
                        <TableRow key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell>
                            <div>
                              <button
                                onClick={() => setLocation(`/agentless-discovery/view/${job.id}`)}
                                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-left"
                              >
                                {job.name}
                              </button>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {job.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={job.status} />
                          </TableCell>
                          <TableCell>
                            {job.lastRun ? (
                              <div className="text-sm">
                                <div>{format(new Date(job.lastRun), 'MMM dd, yyyy')}</div>
                                <div className="text-gray-500">{format(new Date(job.lastRun), 'HH:mm')}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {job.nextRun ? (
                              <div className="text-sm">
                                <div>{format(new Date(job.nextRun), 'MMM dd, yyyy')}</div>
                                <div className="text-gray-500">{format(new Date(job.nextRun), 'HH:mm')}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Not scheduled</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium">
                                {successRate}%
                              </div>
                              <div className="text-xs text-gray-500">
                                ({job.successCount}/{job.runCount})
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{targetCount} targets</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{job.createdBy}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Job Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleJobAction('view', job.id)}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {(job.status === 'scheduled' || job.status === 'paused') && (
                                  <DropdownMenuItem onClick={() => handleJobAction('run', job.id)}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Run Now
                                  </DropdownMenuItem>
                                )}
                                {job.status === 'running' && (
                                  <DropdownMenuItem onClick={() => handleJobAction('pause', job.id)}>
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleJobAction('edit', job.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleJobAction('clone', job.id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Clone
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleJobAction('history', job.id)}>
                                  <History className="mr-2 h-4 w-4" />
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {job.status !== 'disabled' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleJobAction('disable', job.id)}
                                    className="text-yellow-600"
                                  >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Disable
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onClick={() => handleJobAction('delete', job.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {filters.search || filters.status ? 
                        'Try adjusting your filters or search terms.' :
                        'Get started by creating your first agentless discovery job.'
                      }
                    </p>
                    {!filters.search && !filters.status && (
                      <div className="mt-6">
                        <Button onClick={() => setActiveTab("create")}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Job
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardContent className="p-12 text-center">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Create New Discovery Job</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Use the comprehensive 5-step wizard to configure automated network discovery and compliance scanning with enterprise-grade options.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => setLocation('/agentless-discovery/create')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Launch Creation Wizard
                  </Button>
                </div>
                
                <div className="mt-8 text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Wizard Steps:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</div>
                      <div>
                        <div className="font-medium">General Information</div>
                        <div className="text-gray-500">Job name and description</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</div>
                      <div>
                        <div className="font-medium">Discovery Profiles</div>
                        <div className="text-gray-500">Select policies by category</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</div>
                      <div>
                        <div className="font-medium">Targets & Configuration</div>
                        <div className="text-gray-500">IP ranges, credentials, probes</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</div>
                      <div>
                        <div className="font-medium">Scheduling</div>
                        <div className="text-gray-500">Run now or schedule for later</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg md:col-span-2">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">5</div>
                      <div>
                        <div className="font-medium">Review & Submit</div>
                        <div className="text-gray-500">Verify configuration and create the discovery job</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discovery Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Default Configuration</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Configure default settings for new discovery jobs.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Default Timeout (minutes)</label>
                        <Input type="number" defaultValue="30" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Default Retry Count</label>
                        <Input type="number" defaultValue="3" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Notification Settings</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Configure notifications for job completion and failures.
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Email notifications for failed jobs</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm">Email notifications for completed jobs</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">SMS notifications for critical failures</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}