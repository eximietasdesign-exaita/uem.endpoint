import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  Square, 
  RefreshCw, 
  Settings, 
  Monitor, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Wrench,
  Zap,
  Plus,
  FileText,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Target,
  Layers
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

interface AgentDeploymentJob {
  id: number;
  name: string;
  description?: string;
  targetOs: string;
  deploymentMethod: string;
  agentVersion: string;
  status: string;
  progress?: {
    totalTargets: number;
    successfulDeployments: number;
    failedDeployments: number;
    pendingDeployments: number;
    currentTarget: string;
    estimatedTimeRemaining: number;
  };
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface AgentDeploymentTask {
  id: number;
  targetHost: string;
  targetIp?: string;
  targetOs: string;
  status: string;
  currentStep?: string;
  agentId?: string;
  errorMessage?: string;
  errorCode?: string;
  attemptCount: number;
  maxRetries: number;
  startedAt?: string;
  completedAt?: string;
}

interface DeploymentStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalTargets: number;
  successfulDeployments: number;
  failedDeployments: number;
  successRate: number;
}

// Form schema for creating deployment jobs
const createJobSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  targetOs: z.enum(["windows", "macos", "linux"]),
  deploymentMethod: z.enum(["group_policy", "sccm", "powershell", "manual", "ssh"]),
  agentVersion: z.string().min(1, "Agent version is required"),
  credentialProfileId: z.number().optional(),
  discoveryProbeId: z.number().optional(),
  targets: z.object({
    ipRanges: z.array(z.string()).optional(),
    hostnames: z.array(z.string()).optional(),
    ipSegments: z.array(z.string()).optional(),
    ouPaths: z.array(z.string()).optional(),
  }),
  configuration: z.object({
    installationPath: z.string().optional(),
    serviceAccount: z.string().optional(),
    autoUpdate: z.boolean().default(true),
    reportingInterval: z.number().default(300),
    logLevel: z.enum(["debug", "info", "warning", "error"]).default("info"),
  }).optional(),
  schedule: z.object({
    executeNow: z.boolean().default(true),
    scheduledAt: z.string().optional(),
    maintenanceWindow: z.boolean().default(false),
  }).optional(),
  domainId: z.number(),
  tenantId: z.number(),
});

type CreateJobFormData = z.infer<typeof createJobSchema>;

export default function RemoteAgentDeployment() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [osFilter, setOsFilter] = useState<string>("all");
  const { domainId, tenantId } = { domainId: 1, tenantId: 1 }; // Simplified for demo
  const queryClient = useQueryClient();

  // Form setup for job creation
  const form = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      domainId: domainId,
      tenantId: tenantId,
      targetOs: "windows",
      deploymentMethod: "powershell",
      agentVersion: "2.1.0",
      targets: {
        ipRanges: [],
        hostnames: [],
        ipSegments: [],
        ouPaths: [],
      },
      configuration: {
        autoUpdate: true,
        reportingInterval: 300,
        logLevel: "info",
      },
      schedule: {
        executeNow: true,
        maintenanceWindow: false,
      },
    },
  });

  // Fetch deployment jobs
  const { data: allJobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/agent-deployment-jobs', domainId, tenantId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (domainId) params.append('domainId', domainId.toString());
      if (tenantId) params.append('tenantId', tenantId.toString());
      
      const response = await fetch(`/api/agent-deployment-jobs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch deployment jobs');
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Filter jobs based on current filters
  const jobs = allJobs.filter((job: AgentDeploymentJob) => {
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    if (osFilter !== "all" && job.targetOs !== osFilter) return false;
    return true;
  });

  // Fetch credential profiles for job creation
  const { data: credentialProfiles = [] } = useQuery({
    queryKey: ['/api/credential-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/credential-profiles');
      if (!response.ok) throw new Error('Failed to fetch credential profiles');
      return response.json();
    },
  });

  // Fetch discovery probes for job creation
  const { data: discoveryProbes = [] } = useQuery({
    queryKey: ['/api/discovery-probes'],
    queryFn: async () => {
      const response = await fetch('/api/discovery-probes');
      if (!response.ok) throw new Error('Failed to fetch discovery probes');
      return response.json();
    },
  });

  // Fetch deployment statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/agent-deployment-stats', domainId, tenantId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (domainId) params.append('domainId', domainId.toString());
      if (tenantId) params.append('tenantId', tenantId.toString());
      
      const response = await fetch(`/api/agent-deployment-stats?${params}`);
      if (!response.ok) throw new Error('Failed to fetch deployment stats');
      return response.json();
    },
  });

  // Fetch deployment tasks for selected job
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/agent-deployment-jobs', selectedJobId, 'tasks'],
    queryFn: async () => {
      if (!selectedJobId) return [];
      const response = await fetch(`/api/agent-deployment-jobs/${selectedJobId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch deployment tasks');
      return response.json();
    },
    enabled: !!selectedJobId,
    refetchInterval: 3000,
  });

  // Create deployment job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData: CreateJobFormData) => {
      return apiRequest('/api/agent-deployment-jobs', {
        method: 'POST',
        body: jobData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-deployment-jobs'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
  });

  // Start deployment job mutation
  const startJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest(`/api/agent-deployment-jobs/${jobId}/start`, {
        method: 'POST',
        body: { userId: 1 }, // Current user ID
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-deployment-jobs'] });
    },
  });

  // Cancel deployment job mutation
  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest(`/api/agent-deployment-jobs/${jobId}/cancel`, {
        method: 'POST',
        body: { userId: 1 },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-deployment-jobs'] });
    },
  });

  // Retry deployment task mutation
  const retryTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest(`/api/agent-deployment-tasks/${taskId}/retry`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-deployment-jobs', selectedJobId, 'tasks'] });
    },
  });

  // Repair agent mutation
  const repairAgentMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest(`/api/agent-deployment-tasks/${taskId}/repair`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agent-deployment-jobs', selectedJobId, 'tasks'] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      in_progress: { variant: "default", icon: RefreshCw },
      completed: { variant: "default", icon: CheckCircle },
      failed: { variant: "destructive", icon: XCircle },
      cancelled: { variant: "secondary", icon: Square },
      partially_completed: { variant: "outline", icon: AlertCircle },
      connecting: { variant: "default", icon: Zap },
      downloading: { variant: "default", icon: Download },
      installing: { variant: "default", icon: Settings },
      configuring: { variant: "default", icon: Settings },
      verifying: { variant: "default", icon: CheckCircle },
    };

    const config = variants[status] || { variant: "outline" as const, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Remote Agent Deployment
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enterprise-grade remote agent deployment with multi-OS support and comprehensive monitoring
        </p>
      </div>

      {/* Deployment Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobs} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.successfulDeployments} / {stats.totalTargets} targets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.failedJobs} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Deployments</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedDeployments}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="jobs">Deployment Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="tasks" disabled={!selectedJobId}>
              Job Details {selectedJobId ? `(#${selectedJobId})` : ''}
            </TabsTrigger>
            <TabsTrigger value="templates">Deployment Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3">
            {/* Job Creation Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Deployment Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Agent Deployment Job</DialogTitle>
                  <DialogDescription>
                    Configure a new enterprise agent deployment across your infrastructure
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deployment Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Windows Workstation Rollout Q4" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="agentVersion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agent Version *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select version" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="2.1.0">v2.1.0 (Latest Stable)</SelectItem>
                                    <SelectItem value="2.0.5">v2.0.5 (LTS)</SelectItem>
                                    <SelectItem value="2.2.0-beta">v2.2.0-beta (Preview)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the purpose and scope of this deployment..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    {/* Target Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Target Configuration</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="targetOs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Operating System *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select OS" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="windows">Windows</SelectItem>
                                    <SelectItem value="macos">macOS</SelectItem>
                                    <SelectItem value="linux">Linux</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="deploymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deployment Method *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="group_policy">Group Policy (AD)</SelectItem>
                                    <SelectItem value="sccm">SCCM</SelectItem>
                                    <SelectItem value="powershell">PowerShell DSC</SelectItem>
                                    <SelectItem value="ssh">SSH (Linux/macOS)</SelectItem>
                                    <SelectItem value="manual">Manual Installation</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="credentialProfileId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credential Profile</FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select credential profile" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {credentialProfiles.map((profile: any) => (
                                      <SelectItem key={profile.id} value={profile.id.toString()}>
                                        {profile.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Authentication credentials for deployment
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="discoveryProbeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Satellite Server</FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select satellite server" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {discoveryProbes.map((probe: any) => (
                                      <SelectItem key={probe.id} value={probe.id.toString()}>
                                        {probe.name} ({probe.location})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormDescription>
                                Satellite server for deployment orchestration
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Targeting Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Target Selection</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="targets.ipRanges"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IP Ranges</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="192.168.1.0/24&#10;10.0.0.1-10.0.0.100&#10;172.16.0.0/16"
                                  value={field.value?.join('\n') || ''}
                                  onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim()))}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter IP ranges, CIDR blocks, or IP ranges (one per line)
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="targets.hostnames"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specific Hostnames</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="server01.domain.com&#10;workstation-123&#10;db-server"
                                    value={field.value?.join('\n') || ''}
                                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim()))}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Specific hostnames (one per line)
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="targets.ouPaths"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Organizational Units</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="OU=Workstations,DC=company,DC=com&#10;OU=Servers,DC=company,DC=com"
                                    value={field.value?.join('\n') || ''}
                                    onChange={(e) => field.onChange(e.target.value.split('\n').filter(line => line.trim()))}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Active Directory OUs (one per line)
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Agent Configuration */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Agent Configuration</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="configuration.installationPath"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Installation Path</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="C:\Program Files\Agent (Windows default)"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Custom installation directory (optional)
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="configuration.serviceAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Account</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="DOMAIN\ServiceAccount"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Account for agent service (optional)
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="configuration.reportingInterval"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reporting Interval (seconds)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="60"
                                  max="3600"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="configuration.logLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Log Level</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="debug">Debug</SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="configuration.autoUpdate"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Auto Update</FormLabel>
                                <FormDescription>
                                  Enable automatic agent updates
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Scheduling */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Deployment Schedule</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="schedule.executeNow"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Execute Immediately</FormLabel>
                                <FormDescription>
                                  Start deployment as soon as the job is created
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {!form.watch('schedule.executeNow') && (
                          <FormField
                            control={form.control}
                            name="schedule.scheduledAt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Scheduled Start Time</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  When to start the deployment
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        )}
                        
                        <FormField
                          control={form.control}
                          name="schedule.maintenanceWindow"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Respect Maintenance Windows</FormLabel>
                                <FormDescription>
                                  Only deploy during configured maintenance windows
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createJobMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createJobMutation.isPending && (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Create Deployment Job
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Deployment Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          {/* Advanced Filtering */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Agent Deployment Jobs</span>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={osFilter} onValueChange={setOsFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter by OS" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All OS</SelectItem>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="macos">macOS</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage enterprise-grade remote agent deployments across Windows, Mac, and Linux systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No deployment jobs found</h3>
                  <p className="mb-4">
                    {statusFilter !== "all" || osFilter !== "all" 
                      ? "No jobs match your current filters. Try adjusting your search criteria."
                      : "Create your first deployment job to start managing agents across your infrastructure."
                    }
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Deployment Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job: AgentDeploymentJob) => (
                    <Card key={job.id} className="cursor-pointer hover:bg-accent/50 transition-all duration-200" onClick={() => {
                      setSelectedJobId(job.id);
                      setActiveTab('tasks');
                    }}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{job.name}</h3>
                              {getStatusBadge(job.status)}
                              <Badge variant="outline" className="text-xs">
                                #{job.id}
                              </Badge>
                            </div>
                            
                            {job.description && (
                              <p className="text-sm text-muted-foreground">{job.description}</p>
                            )}
                            
                            <div className="flex items-center gap-6 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Monitor className="h-3 w-3" />
                                {job.targetOs.charAt(0).toUpperCase() + job.targetOs.slice(1)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Settings className="h-3 w-3" />
                                {job.deploymentMethod.replace(/_/g, ' ')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                v{job.agentVersion}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {job.progress && (
                              <div className="flex items-center gap-4 text-sm">
                                <div className="text-muted-foreground">
                                  Progress: {job.progress.successfulDeployments} / {job.progress.totalTargets} targets
                                </div>
                                {job.progress.currentTarget && (
                                  <div className="text-muted-foreground">
                                    Current: {job.progress.currentTarget}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-3 ml-6">
                            <div className="flex gap-2">
                              {job.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startJobMutation.mutate(job.id);
                                  }}
                                  disabled={startJobMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Start
                                </Button>
                              )}
                              
                              {job.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelJobMutation.mutate(job.id);
                                  }}
                                  disabled={cancelJobMutation.isPending}
                                >
                                  <Square className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedJobId(job.id);
                                  setActiveTab('tasks');
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </div>
                            
                            {job.progress && (
                              <div className="text-right w-48">
                                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                  <span>Progress</span>
                                  <span>
                                    {Math.round(((job.progress.successfulDeployments + job.progress.failedDeployments) / job.progress.totalTargets) * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(job.progress.successfulDeployments + job.progress.failedDeployments) / job.progress.totalTargets * 100} 
                                  className="h-2 mb-2" 
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span className="text-green-600">{job.progress.successfulDeployments} success</span>
                                  <span className="text-red-600">{job.progress.failedDeployments} failed</span>
                                </div>
                                {job.progress.estimatedTimeRemaining > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    ETA: {formatDuration(job.progress.estimatedTimeRemaining)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Details Tab */}
        <TabsContent value="tasks" className="space-y-4">
          {selectedJobId && (
            <Card>
              <CardHeader>
                <CardTitle>Deployment Tasks - Job #{selectedJobId}</CardTitle>
                <CardDescription>
                  Individual deployment tasks and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Target Host</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>OS</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Step</TableHead>
                        <TableHead>Agent ID</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task: AgentDeploymentTask) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.targetHost}</TableCell>
                          <TableCell>{task.targetIp}</TableCell>
                          <TableCell>{task.targetOs}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{task.currentStep || '-'}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {task.agentId ? task.agentId.substring(0, 12) + '...' : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={task.attemptCount > 1 ? 'text-orange-600' : ''}>
                              {task.attemptCount} / {task.maxRetries}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {task.status === 'failed' && task.attemptCount < task.maxRetries && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => retryTaskMutation.mutate(task.id)}
                                  disabled={retryTaskMutation.isPending}
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              )}
                              {(task.status === 'failed' || task.status === 'completed') && task.agentId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => repairAgentMutation.mutate(task.id)}
                                  disabled={repairAgentMutation.isPending}
                                >
                                  <Wrench className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Deployment Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Windows Template */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Windows Enterprise Template
                </CardTitle>
                <CardDescription>
                  Optimized for Windows workstations and servers with Group Policy integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Target OS:</span>
                    <Badge variant="outline">Windows</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Method:</span>
                    <span>Group Policy + SCCM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className="text-green-600">96%</span>
                  </div>
                  <Button className="w-full mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Linux Template */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Linux Server Template
                </CardTitle>
                <CardDescription>
                  SSH-based deployment for Linux servers with package management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Target OS:</span>
                    <Badge variant="outline">Linux</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Method:</span>
                    <span>SSH + Package Manager</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className="text-green-600">94%</span>
                  </div>
                  <Button className="w-full mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* macOS Template */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  macOS Endpoint Template
                </CardTitle>
                <CardDescription>
                  MDM-integrated deployment for macOS endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Target OS:</span>
                    <Badge variant="outline">macOS</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Method:</span>
                    <span>MDM + SSH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className="text-green-600">91%</span>
                  </div>
                  <Button className="w-full mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Template Creation */}
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Template</CardTitle>
              <CardDescription>
                Design a reusable deployment template for your specific environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics & Reports Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Deployment Trends
                </CardTitle>
                <CardDescription>
                  Success rates and deployment volume over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Analytics visualization would appear here</p>
                    <p className="text-sm">Charts showing deployment success rates, volumes, and trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OS Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  OS Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of deployment targets by operating system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>OS distribution chart would appear here</p>
                    <p className="text-sm">Pie chart showing Windows, Linux, and macOS targets</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Key performance indicators for deployment operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Deployment Time</span>
                    <span className="text-sm text-muted-foreground">4.2 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Success Rate (30 days)</span>
                    <span className="text-sm text-green-600">94.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Agent Health Score</span>
                    <span className="text-sm text-green-600">98.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Network Efficiency</span>
                    <span className="text-sm text-blue-600">87.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Issues
                </CardTitle>
                <CardDescription>
                  Common deployment failures and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Credential Authentication</div>
                      <div className="text-xs text-muted-foreground">12 failures in last 24h</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Network Timeouts</div>
                      <div className="text-xs text-muted-foreground">8 failures in last 24h</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Disk Space Issues</div>
                      <div className="text-xs text-muted-foreground">5 failures in last 24h</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>
                Generate comprehensive reports for compliance and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Deployment Summary (PDF)
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Compliance Report (Excel)
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Performance Metrics (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}