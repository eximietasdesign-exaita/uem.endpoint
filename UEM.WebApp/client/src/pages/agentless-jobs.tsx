import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  Server,
  MapPin,
  SortAsc,
  SortDesc,
  Settings
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AgentlessDiscoveryJob } from "@shared/schema";

interface JobFilters {
  status: string;
  search: string;
  satelliteServer: string;
  region: string;
  createdBy: string;
  priority: string;
  timeRange: string;
}

const statusConfig = {
  scheduled: { color: "bg-blue-500", label: "Scheduled", icon: Calendar },
  running: { color: "bg-green-500", label: "Running", icon: RefreshCw },
  completed: { color: "bg-gray-500", label: "Completed", icon: CheckCircle },
  paused: { color: "bg-yellow-500", label: "Paused", icon: Pause },
  failed: { color: "bg-red-500", label: "Failed", icon: XCircle },
  disabled: { color: "bg-gray-400", label: "Disabled", icon: AlertTriangle }
};

export default function AgentlessJobsPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<JobFilters>({ 
    status: 'all', 
    search: '', 
    satelliteServer: 'all', 
    region: 'all', 
    createdBy: 'all', 
    priority: 'all', 
    timeRange: 'all' 
  });
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch agentless discovery jobs (from DB via backend controller)
  const { data: jobs = [], isLoading, refetch, isFetching } = useQuery<any[]>({
    queryKey: ['agentless-discovery-jobs'], // Use a consistent, simple key
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/agentless-discovery-jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const rawJobs: any[] = await res.json();

      // collect all discovery profile ids (support discoveryProfiles, discovery_profiles, policyIds)
      const allProfileIds = new Set<number>();
      const jobsWithProfiles = rawJobs.map(j => {
        const raw = j.discoveryProfiles ?? j.discovery_profiles ?? j.policyIds ?? j.policy_ids ?? null;
        let arr: any[] | null = null;
        try {
          if (typeof raw === 'string') arr = raw ? JSON.parse(raw) : null;
          else arr = Array.isArray(raw) ? raw : null;
        } catch { arr = null; }
        if (arr && arr.length) {
          arr.forEach((v: any) => {
            const n = Number(v);
            if (!isNaN(n)) allProfileIds.add(n);
          });
        }
        return { original: j, rawProfileArray: arr };
      });

      // if there are numeric ids, fetch policy names once
      const idList = Array.from(allProfileIds);
      let policyMap: Record<number, string> = {};
      if (idList.length > 0) {
        try {
          const policiesRes = await apiRequest('GET', `/api/script-policies?ids=${idList.join(',')}`);
          if (policiesRes.ok) {
            const policies = await policiesRes.json();
            (policies || []).forEach((p: any) => {
              const pid = Number(p.id);
              if (!isNaN(pid)) policyMap[pid] = (p.name ?? p.Name ?? `Policy ${pid}`).toString();
            });
          }
        } catch (e) {
          console.warn('Failed to fetch policy names for discovery_profiles', e);
        }
      }

      // produce normalized jobs where discoveryProfiles / policyIds are arrays of names (strings)
      const normalized = rawJobs.map((j, idx) => {
        const raw = j.discoveryProfiles ?? j.discovery_profiles ?? j.policyIds ?? j.policy_ids ?? null;
        let arr: any[] | null = null;
        try {
          if (typeof raw === 'string') arr = raw ? JSON.parse(raw) : null;
          else arr = Array.isArray(raw) ? raw : null;
        } catch { arr = null; }

        let profileNames: string[] | null = null;
        if (arr && arr.length) {
          profileNames = arr.map((v: any) => {
            const n = Number(v);
            if (!isNaN(n) && policyMap[n]) return policyMap[n];
            // if it's already a string, keep it
            if (typeof v === 'string') return v;
            // fallback to stringified value
            return String(v);
          });
        }

        return {
          ...j,
          discoveryProfiles: profileNames ?? arr ?? [],
          policyIds: profileNames ?? arr ?? [],
        };
      });

      return normalized;
    },
    staleTime: 15_000,
  });

  const handleRefresh = async () => {
    toast({ title: "Refreshing jobs..." });
    try {
      await refetch();
      toast({ title: "Refreshed", description: "Jobs list has been updated." });
    } catch (err: any) {
      toast({
        title: "Refresh failed",
        description: err.message || 'Unable to fetch latest jobs.',
        variant: "destructive",
      });
    }
  };

  // Job action mutations
  const runJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest('POST', `/api/agentless-discovery-jobs/${jobId}/run`);
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
      return await apiRequest('POST', `/api/agentless-discovery-jobs/${jobId}/pause`);
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
      return await apiRequest('POST', `/api/agentless-discovery-jobs/${jobId}/disable`);
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
      return await apiRequest('DELETE', `/api/agentless-discovery-jobs/${jobId}`);
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

  // Fetch real satellite servers (probes) from backend
  const { data: satelliteServers = [], isLoading: serversLoading } = useQuery<any[]>({
    queryKey: ['/api/discovery-probes'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/discovery-probes');
      if (!res.ok) return [];
      return await res.json();
    },
    staleTime: 30_000,
  });

  // derive regions from servers
  const regions = useMemo(() => {
    return Array.from(new Set((satelliteServers || []).map(s => s.region).filter(Boolean)));
  }, [satelliteServers]);

  // Fetch creators (users) from backend
  const { data: creators = [], isLoading: creatorsLoading } = useQuery<any[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/users');
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  // Fetch priorities from backend (fallback to sensible defaults)
  const { data: prioritiesFromApi = [] } = useQuery<string[]>({
    queryKey: ['/api/job-priorities'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/job-priorities');
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    },
    enabled: true,
    staleTime: 60_000,
  });
  const priorityOptions = (Array.isArray(prioritiesFromApi) && prioritiesFromApi.length > 0)
    ? prioritiesFromApi
    : ["High", "Medium", "Low", "Critical"];

  // Enhanced filtering logic
  const filteredJobs = jobs.filter((job: AgentlessDiscoveryJob) => {
    const matchesSearch = !filters.search || 
      job.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || !filters.status || job.status === filters.status;
    
    const matchesSatelliteServer = filters.satelliteServer === 'all' || !filters.satelliteServer || 
      job.probeId?.toString() === filters.satelliteServer;
    
    const matchesRegion = filters.region === 'all' || !filters.region || 
      satelliteServers.find(s => s.id === job.probeId)?.region === filters.region;
    
    const matchesCreatedBy = filters.createdBy === 'all' || !filters.createdBy || 
      job.createdBy?.toString() === filters.createdBy;
    
    const matchesPriority = filters.priority === 'all' || !filters.priority || 
      (job as any).priority === filters.priority;
    
    const matchesTimeRange = filters.timeRange === 'all' || !filters.timeRange || checkTimeRange(job, filters.timeRange);
    
    return matchesSearch && matchesStatus && matchesSatelliteServer && 
           matchesRegion && matchesCreatedBy && matchesPriority && matchesTimeRange;
  });

  // Sort filtered jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'createdAt':
        return multiplier * (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      case 'lastRun':
        return multiplier * (new Date(a.startedAt || 0).getTime() - new Date(b.startedAt || 0).getTime());
      default:
        return 0;
    }
  });

  const checkTimeRange = (job: AgentlessDiscoveryJob, timeRange: string) => {
    if (!job.createdAt) return true;
    
    const now = new Date();
    const jobDate = new Date(job.createdAt);
    const diffHours = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60);
    
    switch (timeRange) {
      case 'today':
        return diffHours <= 24;
      case 'week':
        return diffHours <= 168;
      case 'month':
        return diffHours <= 720;
      case 'quarter':
        return diffHours <= 2160;
      default:
        return true;
    }
  };

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

  const clearAllFilters = () => {
    setFilters({ 
      status: 'all', 
      search: '', 
      satelliteServer: 'all', 
      region: 'all', 
      createdBy: 'all', 
      priority: 'all', 
      timeRange: 'all' 
    });
  };

  const getJobStats = () => {
    const total = jobs.length;
    const running = jobs.filter((job: AgentlessDiscoveryJob) => job.status === 'running').length;
    const scheduled = jobs.filter((job: AgentlessDiscoveryJob) => job.status === 'scheduled').length;
    const failed = jobs.filter((job: AgentlessDiscoveryJob) => job.status === 'failed').length;

    return { total, running, scheduled, failed };
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Agentless Discovery Jobs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and monitor your automated network discovery and compliance scanning jobs
            </p>
          </div>
          <Button 
            onClick={() => setLocation('/agentless-discovery')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Job
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Advanced Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <span>Enterprise Advanced Filters</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showAdvancedFilters ? 'Hide Advanced' : 'Show Advanced'}
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isFetching || isLoading}
                >
                  {isFetching ? (
                    <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs, descriptions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.timeRange} onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    <Server className="w-4 h-4 inline mr-1" />
                    Satellite Server
                  </label>
                  <Select value={filters.satelliteServer} onValueChange={(value) => setFilters(prev => ({ ...prev, satelliteServer: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Servers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Servers</SelectItem>
                      {satelliteServers.map((server) => (
                        <SelectItem key={server.id} value={server.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <Server className="w-4 h-4" />
                            <span>{server.name}</span>
                            <Badge variant="outline" className="text-xs">{server.location}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Region/Location
                  </label>
                  <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{region}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Job Priority
                  </label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>{priority}</span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                priority === 'Critical' && "border-red-500 text-red-600",
                                priority === 'High' && "border-orange-500 text-orange-600",
                                priority === 'Medium' && "border-yellow-500 text-yellow-600",
                                priority === 'Low' && "border-green-500 text-green-600"
                              )}
                            >
                              {priority}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    <Target className="w-4 h-4 inline mr-1" />
                    Created By
                  </label>
                  <Select value={filters.createdBy} onValueChange={(value) => setFilters(prev => ({ ...prev, createdBy: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {creators.map((creator) => (
                        <SelectItem key={creator} value={creator}>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                              {creator.charAt(0).toUpperCase()}
                            </div>
                            <span>{creator}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {(filters.search || filters.status || filters.satelliteServer || filters.region || filters.createdBy || filters.priority || filters.timeRange) && (
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Filters:</span>
                {filters.search && <Badge variant="secondary">Search: {filters.search}</Badge>}
                {filters.status && <Badge variant="secondary">Status: {filters.status}</Badge>}
                {filters.satelliteServer && <Badge variant="secondary">Server: {satelliteServers.find(s => s.id.toString() === filters.satelliteServer)?.name}</Badge>}
                {filters.region && <Badge variant="secondary">Region: {filters.region}</Badge>}
                {filters.createdBy && <Badge variant="secondary">Creator: {filters.createdBy}</Badge>}
                {filters.priority && <Badge variant="secondary">Priority: {filters.priority}</Badge>}
                {filters.timeRange && <Badge variant="secondary">Time: {filters.timeRange}</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Discovery Jobs ({sortedJobs.length} of {jobs.length})</span>
              <div className="text-sm text-gray-500">
                Showing filtered results with enterprise-grade filtering and sorting
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {isFetching && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 dark:bg-gray-900/60">
                  <div className="flex items-center space-x-3">
                    <svg className="h-6 w-6 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Refreshing jobs…</span>
                  </div>
                </div>
              )}
              <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>
                     <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('name')}
                      className="font-medium flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span>Job Name</span>
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('status')}
                      className="font-medium flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span>Status</span>
                      {getSortIcon('status')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('lastRun')}
                      className="font-medium flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span>Last Run</span>
                      {getSortIcon('lastRun')}
                    </Button>
                  </TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Satellite Server</TableHead>
                  <TableHead>Targets</TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('createdAt')}
                      className="font-medium flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span>Created</span>
                      {getSortIcon('createdAt')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.map((job: AgentlessDiscoveryJob) => {
                  // targets may be a JSON string or already an object; normalize safely
                  let targets: Record<string, any> = {};
                  try {
                    if (typeof job.targets === 'string') {
                      targets = job.targets ? JSON.parse(job.targets) : {};
                    } else if (job.targets && typeof job.targets === 'object') {
                      targets = job.targets as Record<string, any>;
                    } else {
                      targets = {};
                    }
                  } catch (e) {
                    console.warn('Failed to parse job.targets for job', job.id, e);
                    targets = {};
                  }
                  const targetCount = Object.values(targets).flat().length;
                  // Compute success rate from available schema fields:
                  // Prefer progress.discovered / (discovered + failed) if present,
                  // otherwise fall back to runtime runCount/successCount if they exist.
                  const discovered = typeof job.progress?.discovered === 'number' ? job.progress.discovered : 0;
                  const failed = typeof job.progress?.failed === 'number' ? job.progress.failed : 0;
                  const totalAttempts = discovered + failed;
                  const successRate = totalAttempts > 0
                    ? Math.round((discovered / totalAttempts) * 100)
                    : (typeof (job as any).runCount === 'number' && (job as any).runCount > 0
                        ? Math.round(((job as any).successCount || 0) / (job as any).runCount * 100)
                        : 0);

                  // Derive display values safely because successCount/runCount are not part of the strict AgentlessDiscoveryJob type
                  const displaySuccessCount = typeof (job as any).successCount === 'number' ? (job as any).successCount : discovered;
                  const displayRunCount = typeof (job as any).runCount === 'number' ? (job as any).runCount : totalAttempts;

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
                        {job.startedAt ? (
                          <div className="text-sm">
                            <div>{format(new Date(job.startedAt), 'MMM dd, yyyy')}</div>
                            <div className="text-gray-500">{format(new Date(job.startedAt), 'HH:mm')}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(job as any).nextRun ? (
                          <div className="text-sm">
                            <div>{format(new Date((job as any).nextRun), 'MMM dd, yyyy')}</div>
                            <div className="text-gray-500">{format(new Date((job as any).nextRun), 'HH:mm')}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-500">
                          ({displaySuccessCount}/{displayRunCount})
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.probeId ? (
                          <div className="flex items-center space-x-2">
                            <Server className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className="text-sm font-medium">
                                {satelliteServers.find(s => s.id === job.probeId)?.name || `Server-${job.probeId}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {satelliteServers.find(s => s.id === job.probeId)?.location || 'Unknown Location'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Server className="w-4 h-4" />
                            <span className="text-sm">No server assigned</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{targetCount} targets</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{job.createdBy}</div>
                          {job.createdAt && (
                            <div className="text-xs text-gray-500">
                              {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
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
            </div>

            {sortedJobs.length === 0 && (
              <div className="text-center py-12">
                <Filter className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {jobs.length === 0 ? 'No discovery jobs found' : 'No jobs match your filters'}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {jobs.length === 0 ? 
                    'Get started by creating your first agentless discovery job with enterprise-grade filtering.' :
                    `Found ${jobs.length} total jobs, but none match your current filter criteria. Try adjusting your enterprise filters or search terms.`
                  }
                </p>
                <div className="mt-6 space-y-2">
                  {jobs.length > 0 && (
                    <Button variant="outline" onClick={clearAllFilters}>
                      <Filter className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                  <Button onClick={() => setLocation('/agentless-discovery')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Job
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}