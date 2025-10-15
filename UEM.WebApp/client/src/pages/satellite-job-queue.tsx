import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Search, Filter, Clock, Play, Pause, X, MoreHorizontal, AlertCircle, CheckCircle, Calendar, Server, Activity, Users, Target, FileText, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useTenantData, useTenantContext } from '@/hooks/useTenantData';

interface QueueJob {
  id: string;
  name: string;
  type: 'network_scan' | 'asset_discovery' | 'vulnerability_assessment' | 'policy_deployment' | 'agent_deployment';
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  scheduledFor: string;
  estimatedDuration: string;
  progress: number;
  targetCount: number;
  completedTargets: number;
  failedTargets: number;
  createdBy: string;
  description?: string;
  lastActivity: string;
}

// Mock data for demonstration - in real app, this would come from API based on server ID
const mockQueueJobs: QueueJob[] = [
  {
    id: 'job-001',
    name: 'Network Discovery - Production Segment',
    type: 'network_scan',
    status: 'running',
    priority: 'high',
    createdAt: '2025-01-22T06:30:00Z',
    scheduledFor: '2025-01-22T07:00:00Z',
    estimatedDuration: '45 minutes',
    progress: 65,
    targetCount: 250,
    completedTargets: 163,
    failedTargets: 2,
    createdBy: 'admin',
    description: 'Comprehensive network scan of production infrastructure',
    lastActivity: '30 seconds ago'
  },
  {
    id: 'job-002',
    name: 'Vulnerability Assessment - Critical Servers',
    type: 'vulnerability_assessment',
    status: 'queued',
    priority: 'critical',
    createdAt: '2025-01-22T07:45:00Z',
    scheduledFor: '2025-01-22T08:00:00Z',
    estimatedDuration: '2 hours',
    progress: 0,
    targetCount: 50,
    completedTargets: 0,
    failedTargets: 0,
    createdBy: 'security.admin',
    description: 'Security vulnerability scan on critical database servers',
    lastActivity: 'Waiting to start'
  },
  {
    id: 'job-003',
    name: 'Agent Deployment - Windows Workstations',
    type: 'agent_deployment',
    status: 'paused',
    priority: 'medium',
    createdAt: '2025-01-22T05:15:00Z',
    scheduledFor: '2025-01-22T06:00:00Z',
    estimatedDuration: '1.5 hours',
    progress: 45,
    targetCount: 150,
    completedTargets: 68,
    failedTargets: 3,
    createdBy: 'it.operator',
    description: 'Deploy monitoring agents to Windows workstations',
    lastActivity: '15 minutes ago'
  },
  {
    id: 'job-004',
    name: 'Policy Deployment - Security Updates',
    type: 'policy_deployment',
    status: 'completed',
    priority: 'high',
    createdAt: '2025-01-22T04:00:00Z',
    scheduledFor: '2025-01-22T05:00:00Z',
    estimatedDuration: '30 minutes',
    progress: 100,
    targetCount: 100,
    completedTargets: 97,
    failedTargets: 3,
    createdBy: 'security.admin',
    description: 'Deploy latest security policy updates',
    lastActivity: '2 hours ago'
  },
  {
    id: 'job-005',
    name: 'Asset Discovery - Development Network',
    type: 'asset_discovery',
    status: 'failed',
    priority: 'low',
    createdAt: '2025-01-22T03:30:00Z',
    scheduledFor: '2025-01-22T04:00:00Z',
    estimatedDuration: '1 hour',
    progress: 25,
    targetCount: 80,
    completedTargets: 20,
    failedTargets: 15,
    createdBy: 'dev.team',
    description: 'Discover new assets in development environment',
    lastActivity: '3 hours ago'
  }
];

interface SatelliteJobQueueProps {
  serverId?: string;
  serverName?: string;
}

export default function SatelliteJobQueuePage({ serverId, serverName }: SatelliteJobQueueProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get serverId and serverName from URL params if not provided as props
  const urlParams = new URLSearchParams(window.location.search);
  const currentServerId = serverId || urlParams.get('serverId') || 'server-aws-us-east-1';
  const currentServerName = serverName || urlParams.get('serverName') || 'server-aws-us-east-1';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredJobs = mockQueueJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'queued':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Running</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Paused</Badge>;
      case 'queued':
        return <Badge variant="outline">Queued</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'network_scan':
        return <Activity className="w-4 h-4" />;
      case 'asset_discovery':
        return <Target className="w-4 h-4" />;
      case 'vulnerability_assessment':
        return <AlertCircle className="w-4 h-4" />;
      case 'policy_deployment':
        return <FileText className="w-4 h-4" />;
      case 'agent_deployment':
        return <Users className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'network_scan':
        return 'Network Scan';
      case 'asset_discovery':
        return 'Asset Discovery';
      case 'vulnerability_assessment':
        return 'Vulnerability Assessment';
      case 'policy_deployment':
        return 'Policy Deployment';
      case 'agent_deployment':
        return 'Agent Deployment';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const handleJobAction = (jobId: string, action: string) => {
    toast({
      title: `Job ${action}`,
      description: `Action ${action} performed on job ${jobId}`,
    });
  };

  const formatDuration = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const queueStats = {
    total: mockQueueJobs.length,
    running: mockQueueJobs.filter(j => j.status === 'running').length,
    queued: mockQueueJobs.filter(j => j.status === 'queued').length,
    completed: mockQueueJobs.filter(j => j.status === 'completed').length,
    failed: mockQueueJobs.filter(j => j.status === 'failed').length
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/discovery-probes')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Satellite Servers</span>
          </Button>
          <div className="border-l h-6 border-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Queue</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Server className="w-4 h-4" />
              <span>{currentServerName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{queueStats.total}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                <p className="text-2xl font-bold text-blue-600">{queueStats.running}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Queued</p>
                <p className="text-2xl font-bold text-yellow-600">{queueStats.queued}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{queueStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600">{queueStats.failed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Job Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs, descriptions, or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="network_scan">Network Scan</SelectItem>
                <SelectItem value="asset_discovery">Asset Discovery</SelectItem>
                <SelectItem value="vulnerability_assessment">Vulnerability Assessment</SelectItem>
                <SelectItem value="policy_deployment">Policy Deployment</SelectItem>
                <SelectItem value="agent_deployment">Agent Deployment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Jobs ({filteredJobs.length} of {mockQueueJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Targets</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{job.name}</div>
                      {job.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {job.description}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Est. {job.estimatedDuration}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(job.type)}
                      <span className="text-sm">{getTypeLabel(job.type)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      {getStatusBadge(job.status)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getPriorityBadge(job.priority)}
                  </TableCell>
                  
                  <TableCell>
                    {job.status === 'running' || job.status === 'paused' ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{job.progress}%</span>
                          <span>{job.completedTargets}/{job.targetCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all duration-300",
                              job.status === 'running' ? "bg-blue-500" : "bg-yellow-500"
                            )}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : job.status === 'completed' ? (
                      <div className="text-sm text-green-600 dark:text-green-400">100% Complete</div>
                    ) : job.status === 'failed' ? (
                      <div className="text-sm text-red-600 dark:text-red-400">{job.progress}% Before Failure</div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">Not Started</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center space-x-2">
                        <Target className="w-3 h-3" />
                        <span>{job.targetCount} total</span>
                      </div>
                      {job.completedTargets > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {job.completedTargets} completed
                        </div>
                      )}
                      {job.failedTargets > 0 && (
                        <div className="text-xs text-red-500">
                          {job.failedTargets} failed
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>{formatDuration(job.createdAt)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        by {job.createdBy}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {job.lastActivity}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {job.status === 'running' && (
                          <DropdownMenuItem onClick={() => handleJobAction(job.id, 'pause')}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause Job
                          </DropdownMenuItem>
                        )}
                        {job.status === 'paused' && (
                          <DropdownMenuItem onClick={() => handleJobAction(job.id, 'resume')}>
                            <Play className="w-4 h-4 mr-2" />
                            Resume Job
                          </DropdownMenuItem>
                        )}
                        {(job.status === 'queued' || job.status === 'paused') && (
                          <DropdownMenuItem onClick={() => handleJobAction(job.id, 'cancel')}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel Job
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleJobAction(job.id, 'view_details')}>
                          <FileText className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleJobAction(job.id, 'view_logs')}>
                          <Activity className="w-4 h-4 mr-2" />
                          View Logs
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}