import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useTenantData } from '@/hooks/useTenantData';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeploymentDetailDialog } from '@/components/DeploymentDetailDialog';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Play,
  Settings,
  Users,
  Server,
  Calendar,
  Monitor,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Network,
  Shield,
  Cpu,
  HardDrive,
  Activity,
  Target,
  User,
  Globe,
  Database,
  Zap,
  Brain,
  Sparkles,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Info,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { AIAgentOrchestrator } from '@/components/AIAgentOrchestrator';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

// interface DiscoveryProbe {
//   id: number;
//   name: string;
//   location?: string;
// }

// interface AgentPolicyDeployment {
//   id: number;
//   name: string;
//   description: string;
//   selectedPolicyIds: number[];
//   targets: {
//     ipRanges: string[];
//     hostnames: string[];
//     ouPaths: string[];
//     ipSegments: string[];
//   };
//   credentialProfileId: number;
//   selectedProbeIds: number[];
//   schedule: {
//     type: 'now' | 'later';
//     frequency?: 'daily' | 'weekly' | 'monthly';
//     time?: string;
//     businessHours?: boolean;
//   };
//   status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'scheduled';
//   createdAt: string;
//   deployedMachines: {
//     total: number;
//     applied: number;
//     inProgress: number;
//     pending: number;
//     failed: number;
//   };
//   errors?: string[];
// }

// interface ScriptPolicy {
//   id: number;
//   name: string;
//   description: string;
//   publishStatus: string;
//   targetOs: string;
// }

// interface CredentialProfile {
//   id: number;
//   name: string;
//   category: string;
// }

// interface DeploymentWizardData {
//   name: string;
//   description: string;
//   selectedPolicyIds: number[];
//   targets: {
//     ipRanges: string[];
//     hostnames: string[];
//     ouPaths: string[];
//     ipSegments: string[];
//   };
//   credentialProfileId: number | null;
//   selectedProbeIds: number[];
//   schedule: {
//     type: 'now' | 'later';
//     frequency?: 'daily' | 'weekly' | 'monthly';
//     time?: string;
//     businessHours?: boolean;
//   };
// }

import type { 
  DiscoveryProbeSummary,
  AgentPolicyDeployment,
  ScriptPolicy,
  CredentialProfileSummary,
  DeploymentWizardData
} from '../../../shared/types';

const DEPLOYMENT_STATUS_CONFIG = {
  pending: { color: 'bg-yellow-500', label: 'Pending', icon: Clock },
  in_progress: { color: 'bg-blue-500', label: 'In Progress', icon: Activity },
  completed: { color: 'bg-green-500', label: 'Completed', icon: CheckCircle },
  failed: { color: 'bg-red-500', label: 'Failed', icon: XCircle },
  scheduled: { color: 'bg-purple-500', label: 'Scheduled', icon: Calendar }
};

const parseJsonbArray = (value: any): number[] => {
  if (value == null) return [];
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return value.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
    }
  }
  return [];
};

export default function AgentBasedDiscovery() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeploymentWizard, setShowDeploymentWizard] = useState(false);
  const [isAIOrchestratorOpen, setIsAIOrchestratorOpen] = useState(false);
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDeployment, setSelectedDeployment] = useState<AgentPolicyDeployment | null>(null);
  const { toast } = useToast();

  const [wizardData, setWizardData] = useState<DeploymentWizardData>({
    name: '',
    description: '',
    selectedPolicyIds: [],
    targets: {
      ipRanges: [],
      hostnames: [],
      ouPaths: [],
      ipSegments: []
    },
    credentialProfileId: null,
    selectedProbeIds: [],
    schedule: {
      type: 'now'
    }
  });

  // toast() returns an object (id + helpers) — allow storing that shape instead of only a string id
  const savingToastRef = React.useRef<{ id: string; dismiss?: () => void; update?: (props: any) => void } | null>(null);

  // API calls
  const { data: policiesData, isLoading: policiesLoading } = useTenantData<ScriptPolicy[]>({
    endpoint: "/api/policy/script-policies",
  });

  const effectivePolicies: ScriptPolicy[] = Array.isArray(policiesData) ? policiesData : [];

  const { data: credentialProfiles = [], isLoading: credentialsLoading } = useQuery({
    queryKey: ['/api/credential-profiles'],
  });

  // Load satellite servers (tenant-aware)
  const { data: probes = [], isLoading: probesLoading } = useTenantData({
    endpoint: '/api/discovery-probes'
  });

  const effectiveProbes: DiscoveryProbeSummary[] = Array.isArray(probes) ? probes : [];

  // load real deployments from backend & normalize to UI model
  const {
    data: rawDeployments = [],
    isLoading: deploymentsLoading,
  } = useQuery<any[]>({
    queryKey: ['agent-deployment-jobs'], // A unique key for this query
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/policy-deployments');
      if (!response.ok) throw new Error('Failed to fetch deployments');
      return response.json();
    },
  });
  
  // log raw backend rows for debugging in dev console
  useEffect(() => {
    console.debug('rawDeployments changed', { deploymentsLoading, rawDeployments });
  }, [deploymentsLoading, rawDeployments]);

  const normalizeDeployment = (dbRow: any): AgentPolicyDeployment => {
    // Safely parse JSON columns, defaulting to empty objects/arrays
    const targets = dbRow.targets ?? {};
    const schedule = dbRow.schedule ?? {};
    const progress = dbRow.progress ?? {};
    const results = dbRow.deployment_results ?? {};
    //const policyIds = Array.isArray(dbRow.policy_ids) ? dbRow.policy_ids : [];
     const policyIds = parseJsonbArray(dbRow.policy_ids);

    // Calculate machine stats from the progress and results columns
    const total = progress.total ?? results.total ?? 0;
    const applied = progress.applied ?? results.successfulDeployments ?? 0;
    const failed = progress.failed ?? results.failedDeployments ?? 0;
    const inProgress = progress.inProgress ?? 0;
    const pending = Math.max(0, total - (applied + failed + inProgress));
    
    // Map database status 'running' to UI status 'in_progress'
    const dbStatus = (dbRow.status || 'pending').toLowerCase();

    return {
      id: dbRow.id,
      name: dbRow.name || 'Untitled Deployment',
      description: dbRow.description || '',
      status: dbStatus === 'running' ? 'in_progress' : dbStatus,
      createdAt: dbRow.created_at || new Date().toISOString(),
      
      // Extract data from the JSON columns
      selectedPolicyIds: policyIds,
      targets: {
        // Handle inconsistent casing from your DB data (e.g., OuPaths vs ipRanges)
        ipRanges: targets.ipRanges || targets.IpRanges || [],
        hostnames: targets.Hostnames || targets.hostnames || [],
        ouPaths: targets.OuPaths || targets.ouPaths || [],
        ipSegments: targets.IpSegments || targets.ipSegments || [],
      },
      credentialProfileId: dbRow.credential_profile_id || null,
      selectedProbeIds: dbRow.probe_id ? [dbRow.probe_id] : [], // probe_id is a single int, UI expects an array
      schedule: {
        // Handle inconsistent casing (e.g., Type vs type)
        type: (schedule.Type || schedule.type)?.toLowerCase() || 'now',
        frequency: schedule.Frequency || schedule.frequency,
        time: schedule.Time || schedule.time,
        businessHours: schedule.BusinessHours ?? schedule.businessHours,
      },
      
      // Assign calculated stats
      deployedMachines: { total, applied, inProgress, pending, failed },
      
      errors: results.errors || [],
    };
  };

  const deployments: AgentPolicyDeployment[] = useMemo(() => {
    if (deploymentsLoading || !Array.isArray(rawDeployments)) {
      return []; // Return an empty array while loading or if data is invalid
    }
    return rawDeployments.map(normalizeDeployment);
  }, [rawDeployments, deploymentsLoading]);

  // // Mock deployments data for demonstration
  // const mockDeployments: AgentPolicyDeployment[] = [
  //   {
  //     id: 1,
  //     name: 'Enterprise Security Assessment',
  //     description: 'Comprehensive security and compliance deployment across enterprise network',
  //     selectedPolicyIds: [1, 3, 5],
  //     targets: {
  //       ipRanges: ['10.0.0.1-10.0.0.100', '192.168.1.1-192.168.1.50'],
  //       hostnames: ['server01.company.com', 'server02.company.com'],
  //       ouPaths: ['OU=Servers,DC=company,DC=com'],
  //       ipSegments: ['10.0.1.0/24']
  //     },
  //     credentialProfileId: 1,
  //     selectedProbeIds: [1, 2],
  //     schedule: { type: 'later', frequency: 'daily', time: '02:00', businessHours: false },
  //     status: 'in_progress',
  //     createdAt: '2025-07-18T08:00:00Z',
  //     deployedMachines: {
  //       total: 150,
  //       applied: 89,
  //       inProgress: 35,
  //       pending: 20,
  //       failed: 6
  //     },
  //     errors: ['Authentication failed on server03.company.com', 'Network timeout on 192.168.1.45']
  //   },
  //   {
  //     id: 2,
  //     name: 'Network Infrastructure Discovery',
  //     description: 'Discovery and inventory of network devices and infrastructure',
  //     selectedPolicyIds: [1, 2],
  //     targets: {
  //       ipRanges: ['172.16.0.1-172.16.0.200'],
  //       hostnames: [],
  //       ouPaths: ['OU=Network,DC=company,DC=com'],
  //       ipSegments: []
  //     },
  //     credentialProfileId: 2,
  //     selectedProbeIds: [1],
  //     schedule: { type: 'now' },
  //     status: 'completed',
  //     createdAt: '2025-07-17T14:30:00Z',
  //     deployedMachines: {
  //       total: 75,
  //       applied: 75,
  //       inProgress: 0,
  //       pending: 0,
  //       failed: 0
  //     }
  //   },
  //   {
  //     id: 3,
  //     name: 'Development Environment Scan',
  //     description: 'Security and compliance scan for development servers',
  //     selectedPolicyIds: [4, 6],
  //     targets: {
  //       ipRanges: ['10.1.0.1-10.1.0.50'],
  //       hostnames: ['dev01.company.com', 'dev02.company.com'],
  //       ouPaths: [],
  //       ipSegments: ['10.1.1.0/24']
  //     },
  //     credentialProfileId: 3,
  //     selectedProbeIds: [2, 3],
  //     schedule: { type: 'later', frequency: 'weekly', time: '22:00', businessHours: false },
  //     status: 'scheduled',
  //     createdAt: '2025-07-18T10:15:00Z',
  //     deployedMachines: {
  //       total: 25,
  //       applied: 0,
  //       inProgress: 0,
  //       pending: 25,
  //       failed: 0
  //     }
  //   }
  // ];

  const createDeploymentMutation = useMutation({
    mutationFn: async (data: DeploymentWizardData) => {
      const payload: any = {
        name: data.name,
        description: data.description,
        policyIds: data.selectedPolicyIds,
        deploymentTargets: data.targets,
        agentConfiguration: {
          credentialProfileId: data.credentialProfileId,
          probeIds: data.selectedProbeIds,
          triggerType: data.schedule.type === 'now' ? 'manual' : 'scheduled',
        },
        schedule: data.schedule,
        createdBy: 'ui',
      };

      const newScripts = (data.selectedPolicyIds || []).map(id => {
        const p = effectivePolicies.find(x => x.id === id);
        return {
          Name: p?.name ?? `policy-${id}`,
          Description: p?.description ?? '',
          Category: 'discovery',
          Type: 'script',
          TargetOs: p?.targetOs ?? null,
          Template: null,
          Vendor: null,
          Complexity: null,
          EstimatedRunTimeSeconds: null,
          RequiresElevation: false,
          RequiresNetwork: false,
          Parameters: null,
          OutputFormat: null,
          OutputProcessing: null,
          CredentialRequirements: null,
          Tags: [],
          Industries: [],
          ComplianceFrameworks: [],
          Version: '1.0',
          IsStandard: false,
          IsActive: true,
          PublishStatus: 'published'
        };
      });
      payload.NewScripts = newScripts;

      // call backend and return parsed JSON (controller returns job info)
      const res = await apiRequest('POST', '/api/policy-deployments/publish', payload);
      // if apiRequest returns Response-like object, parse JSON; otherwise return value directly
      if (res && typeof (res as any).json === 'function') {
        return (await (res as Response).json());
      }
      return res;
    },
    onMutate: () => {
      // show an immediate saving toast and save its id for updates
      const id = toast({
        title: "Saving deployment",
        description: "Saving deployment job...",
      });
      savingToastRef.current = id;
    },
    onSuccess: (response: any) => {
      const details = response ?? {};
      if (savingToastRef.current && typeof savingToastRef.current.update === 'function') {
        savingToastRef.current.update({
          title: "Deployment Saved",
          description: `Job #${details.id ?? 'unknown'} created – ${details.totalTargets ?? 0} targets queued.`,
        });
      } else {
        toast({
          title: "Deployment Saved",
          description: `Job #${details.id ?? 'unknown'} created – ${details.totalTargets ?? 0} targets queued.`,
        });
      }

      setShowDeploymentWizard(false);
      setCurrentWizardStep(1);
      setWizardData({
        name: '',
        description: '',
        selectedPolicyIds: [],
        targets: { ipRanges: [], hostnames: [], ouPaths: [], ipSegments: [] },
        credentialProfileId: null,
        selectedProbeIds: [],
        schedule: { type: 'now' }
      });

      // refresh job list
      queryClient.invalidateQueries({ queryKey: ['/api/policy-deployments'] });
      savingToastRef.current = null;
    },
    onError: (err: any) => {
      const details = err?.response?.data?.details ?? err?.message ?? 'Unknown error';
      if (savingToastRef.current && typeof savingToastRef.current.update === 'function') {
        savingToastRef.current.update({
          title: "Save Failed",
          description: details,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Save Failed",
          description: details,
          variant: "destructive",
        });
      }
      savingToastRef.current = null;
    }
  });

  const updateWizardData = (field: keyof DeploymentWizardData, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentWizardStep) {
      case 1:
        return wizardData.name.trim() !== '' && wizardData.description.trim() !== '';
      case 2:
        return wizardData.selectedPolicyIds.length > 0;
      case 3:
        const hasTargets = Object.values(wizardData.targets).some(arr => arr.length > 0);
        return hasTargets;
      case 4:
        return wizardData.credentialProfileId !== null && wizardData.selectedProbeIds.length > 0;
      case 5:
        return true; // Schedule is always valid as 'now' is default
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentWizardStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePreviousStep = () => {
    setCurrentWizardStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmitDeployment = () => {
    if (validateCurrentStep()) {
      createDeploymentMutation.mutate(wizardData);
    }
  };

  const handleAIStrategyGenerated = (strategy: any) => {
    toast({
      title: "AI Strategy Applied",
      description: "AI orchestration recommendations have been integrated into your deployment strategy",
    });
  };

  // Filter deployments
   const filteredDeployments = useMemo(() => {
    return deployments.filter(deployment => {
      const matchesSearch = (deployment.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (deployment.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || deployment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deployments, searchTerm, statusFilter]);

  // Update summary stats to use the new `deployments` array
  const totalMachines = useMemo(() => deployments.reduce((sum, d) => sum + d.deployedMachines.total, 0), [deployments]);
  const successfulDeployments = useMemo(() => deployments.reduce((sum, d) => sum + d.deployedMachines.applied, 0), [deployments]);
  const failedDeployments = useMemo(() => deployments.reduce((sum, d) => sum + d.deployedMachines.failed, 0), [deployments]);
  const inProgressDeployments = useMemo(() => deployments.reduce((sum, d) => sum + d.deployedMachines.inProgress, 0), [deployments]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent-Based Discovery</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Deploy and manage discovery policies across your enterprise infrastructure
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAIOrchestratorOpen(true)} 
            variant="outline"
            className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20"
          >
            <Brain className="w-4 h-4 mr-2 text-purple-600" />
            AI Orchestrator
            <Sparkles className="w-3 h-3 ml-1 text-purple-600" />
          </Button>
          <Button onClick={() => setShowDeploymentWizard(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Policy Deployment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Machines</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMachines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successfully Deployed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{successfulDeployments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{inProgressDeployments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{failedDeployments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Deployment Overview</TabsTrigger>
          <TabsTrigger value="deployments">Active Deployments</TabsTrigger>
          <TabsTrigger value="policies">Policy Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Deployments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Recent Deployments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deployments.slice(0, 3).map(deployment => {
                  const statusConfig = DEPLOYMENT_STATUS_CONFIG[deployment.status];
                  const StatusIcon = statusConfig.icon;
                  const progress = (deployment as any).progress ??
                    (deployment.deployedMachines.total > 0
                      ? (deployment.deployedMachines.applied / deployment.deployedMachines.total) * 100
                      : 0);

                  return (
                    <div key={deployment.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-white">{deployment.name}</h4>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusConfig.label}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{deployment.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{deployment.deployedMachines.applied}/{deployment.deployedMachines.total}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Agent Connectivity</span>
                    <Badge variant="default" className="bg-green-600">98.5%</Badge>
                  </div>
                  <Progress value={98.5} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Policy Success Rate</span>
                    <Badge variant="default" className="bg-blue-600">94.2%</Badge>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Probe Performance</span>
                    <Badge variant="default" className="bg-purple-600">96.8%</Badge>
                  </div>
                  <Progress value={96.8} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search deployments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Deployments List */}
          <div className="space-y-4">
            {filteredDeployments.map(deployment => {
              const statusConfig = DEPLOYMENT_STATUS_CONFIG[deployment.status];
              const StatusIcon = statusConfig.icon;
              const progress = deployment.deployedMachines.total > 0 
                ? (deployment.deployedMachines.applied / deployment.deployedMachines.total) * 100 
                : 0;

              return (
                <Card key={deployment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {deployment.name}
                          </h3>
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusConfig.label}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{deployment.description}</p>
                        
                        {/* Deployment Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {deployment.deployedMachines.total}
                            </p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {deployment.deployedMachines.applied}
                            </p>
                            <p className="text-xs text-gray-500">Applied</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {deployment.deployedMachines.inProgress}
                            </p>
                            <p className="text-xs text-gray-500">In Progress</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                              {deployment.deployedMachines.pending}
                            </p>
                            <p className="text-xs text-gray-500">Pending</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                              {deployment.deployedMachines.failed}
                            </p>
                            <p className="text-xs text-gray-500">Failed</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Deployment Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {/* Errors */}
                        {deployment.errors && deployment.errors.length > 0 && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <h4 className="text-sm font-medium text-red-800">Deployment Errors</h4>
                            </div>
                            <ul className="text-sm text-red-700 space-y-1">
                              {deployment.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDeployment(deployment)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredDeployments.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No deployments found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search criteria or create a new deployment.
                  </p>
                  <Button onClick={() => setShowDeploymentWizard(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Deployment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Available Policies for Agent Deployment</span>
              </CardTitle>
              <CardDescription>
                Manage and deploy discovery policies to agent-based endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2">Loading policies...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(effectivePolicies as ScriptPolicy[]).map(policy => (
                    <Card key={policy.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">{policy.name}</h4>
                          <Badge variant={policy.publishStatus === 'published' ? 'default' : 'outline'}>
                            {policy.publishStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{policy.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{policy.targetOs}</Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deployment Wizard Dialog */}
      <Dialog open={showDeploymentWizard} onOpenChange={setShowDeploymentWizard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Agent Policy Deployment Wizard</span>
            </DialogTitle>
            <DialogDescription>
              Deploy discovery policies to agent-based endpoints with comprehensive configuration
            </DialogDescription>
          </DialogHeader>

          {/* Wizard Steps Progress */}
          <div className="flex items-center justify-between mb-6 px-4">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    currentWizardStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {currentWizardStep > step ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
                {step < 6 && (
                  <div
                    className={cn(
                      "w-16 h-0.5 mx-2",
                      currentWizardStep > step ? "bg-blue-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentWizardStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Discovery Policy Information</CardTitle>
                  <CardDescription>
                    Provide basic information for your agent deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="deployment-name">Deployment Name *</Label>
                    <Input
                      id="deployment-name"
                      placeholder="Enter deployment name..."
                      value={wizardData.name}  
                      onChange={(e) => updateWizardData('name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deployment-description">Description *</Label>
                    <Textarea
                      id="deployment-description"
                      placeholder="Describe the purpose and scope of this deployment..."
                      value={wizardData.description}
                      onChange={(e) => updateWizardData('description', e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Policy Selection */}
            {currentWizardStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Select Discovery Policies</CardTitle>
                  <CardDescription>
                    Choose the policies to deploy to agent-based endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {policiesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2">Loading policies...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(effectivePolicies as ScriptPolicy[]).map(policy => (
                        <div
                          key={policy.id}
                          className={cn(
                            "border-2 rounded-lg p-4 cursor-pointer transition-all",
                            wizardData.selectedPolicyIds.includes(policy.id)
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 hover:border-blue-300"
                          )}
                          onClick={() => {
                            const newIds = wizardData.selectedPolicyIds.includes(policy.id)
                              ? wizardData.selectedPolicyIds.filter(id => id !== policy.id)
                              : [...wizardData.selectedPolicyIds, policy.id];
                            updateWizardData('selectedPolicyIds', newIds);
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={wizardData.selectedPolicyIds.includes(policy.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{policy.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{policy.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="secondary" className="text-xs">{policy.targetOs}</Badge>
                                <Badge variant="outline" className="text-xs">{policy.publishStatus}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {wizardData.selectedPolicyIds.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        Selected {wizardData.selectedPolicyIds.length} policies for deployment
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Target Configuration */}
            {currentWizardStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Define Targets</CardTitle>
                  <CardDescription>
                    Specify the target systems for agent deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* IP Ranges */}
                    <div>
                      <Label className="text-sm font-medium">IP Ranges</Label>
                      <div className="space-y-2 mt-2">
                        {wizardData.targets.ipRanges.map((range, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={range}
                              onChange={(e) => {
                                const newRanges = [...wizardData.targets.ipRanges];
                                newRanges[index] = e.target.value;
                                updateWizardData('targets', { ...wizardData.targets, ipRanges: newRanges });
                              }}
                              placeholder="192.168.1.1-192.168.1.100"
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newRanges = wizardData.targets.ipRanges.filter((_, i) => i !== index);
                                updateWizardData('targets', { ...wizardData.targets, ipRanges: newRanges });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateWizardData('targets', {
                              ...wizardData.targets,
                              ipRanges: [...wizardData.targets.ipRanges, '']
                            });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add IP Range
                        </Button>
                      </div>
                    </div>

                    {/* Hostnames */}
                    <div>
                      <Label className="text-sm font-medium">Hostnames</Label>
                      <div className="space-y-2 mt-2">
                        {wizardData.targets.hostnames.map((hostname, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={hostname}
                              onChange={(e) => {
                                const newHostnames = [...wizardData.targets.hostnames];
                                newHostnames[index] = e.target.value;
                                updateWizardData('targets', { ...wizardData.targets, hostnames: newHostnames });
                              }}
                              placeholder="server01.company.com"
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newHostnames = wizardData.targets.hostnames.filter((_, i) => i !== index);
                                updateWizardData('targets', { ...wizardData.targets, hostnames: newHostnames });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateWizardData('targets', {
                              ...wizardData.targets,
                              hostnames: [...wizardData.targets.hostnames, '']
                            });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Hostname
                        </Button>
                      </div>
                    </div>

                    {/* OU Paths */}
                    <div>
                      <Label className="text-sm font-medium">Active Directory OU Paths</Label>
                      <div className="space-y-2 mt-2">
                        {wizardData.targets.ouPaths.map((path, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={path}
                              onChange={(e) => {
                                const newPaths = [...wizardData.targets.ouPaths];
                                newPaths[index] = e.target.value;
                                updateWizardData('targets', { ...wizardData.targets, ouPaths: newPaths });
                              }}
                              placeholder="OU=Servers,DC=company,DC=com"
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newPaths = wizardData.targets.ouPaths.filter((_, i) => i !== index);
                                updateWizardData('targets', { ...wizardData.targets, ouPaths: newPaths });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateWizardData('targets', {
                              ...wizardData.targets,
                              ouPaths: [...wizardData.targets.ouPaths, '']
                            });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add OU Path
                        </Button>
                      </div>
                    </div>

                    {/* IP Segments */}
                    <div>
                      <Label className="text-sm font-medium">IP Segments (CIDR)</Label>
                      <div className="space-y-2 mt-2">
                        {wizardData.targets.ipSegments.map((segment, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={segment}
                              onChange={(e) => {
                                const newSegments = [...wizardData.targets.ipSegments];
                                newSegments[index] = e.target.value;
                                updateWizardData('targets', { ...wizardData.targets, ipSegments: newSegments });
                              }}
                              placeholder="10.0.1.0/24"
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newSegments = wizardData.targets.ipSegments.filter((_, i) => i !== index);
                                updateWizardData('targets', { ...wizardData.targets, ipSegments: newSegments });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateWizardData('targets', {
                              ...wizardData.targets,
                              ipSegments: [...wizardData.targets.ipSegments, '']
                            });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add IP Segment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Credentials & Probes */}
            {currentWizardStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 4: Credentials & Probe Selection</CardTitle>
                  <CardDescription>
                    Configure authentication and select discovery probes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Credential Profile Selection */}
                  <div>
                    <Label className="text-sm font-medium">Credential Profile *</Label>
                    <Select
                      value={wizardData.credentialProfileId?.toString() || ""}
                      onValueChange={(value) => updateWizardData('credentialProfileId', parseInt(value))}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select credential profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {(credentialProfiles as CredentialProfileSummary[]).map(profile => (
                          <SelectItem key={profile.id} value={profile.id.toString()}>
                            {profile.name} - {profile.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Probe Selection */}
                  <div>
                    <Label className="text-sm font-medium">Satellite Servers *</Label>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allProbeIds = effectiveProbes.map((probe) => probe.id);
                            updateWizardData("selectedProbeIds", allProbeIds);
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateWizardData("selectedProbeIds", [])}
                        >
                          Clear All
                        </Button>
                      </div>

                      <Select
                        // keep the dropdown for adding/removing a single probe at a time;
                        // value left empty so Select doesn't force a single visible choice
                        value={""}
                        onValueChange={(value) => {
                          const selectedId = parseInt(value);
                          if (Number.isNaN(selectedId)) return;
                          const updatedProbeIds = wizardData.selectedProbeIds.includes(selectedId)
                            ? wizardData.selectedProbeIds.filter((id) => id !== selectedId)
                            : [...wizardData.selectedProbeIds, selectedId];
                          updateWizardData("selectedProbeIds", updatedProbeIds);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select satellite server (use dropdown to add)" />
                        </SelectTrigger>
                        <SelectContent>
                          {effectiveProbes.map((probe) => (
                            <SelectItem key={probe.id} value={probe.id.toString()}>
                              {probe.name} {probe.location && `(${probe.location})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* show all selected probes as badges so Select All appears to work */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {wizardData.selectedProbeIds.length === 0 ? (
                          <div className="text-sm text-muted">No satellite server selected</div>
                        ) : (
                          wizardData.selectedProbeIds.map((id) => {
                            const p = effectiveProbes.find((pr) => pr.id === id);
                            return p ? (
                              <Badge
                                key={id}
                                variant="secondary"
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() =>
                                  updateWizardData(
                                    "selectedProbeIds",
                                    wizardData.selectedProbeIds.filter((pid) => pid !== id)
                                  )
                                }
                              >
                                <span>{p.name}</span>
                                <span className="text-xs font-bold">×</span>
                              </Badge>
                            ) : null;
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Scheduling */}
            {currentWizardStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 5: Deployment Schedule</CardTitle>
                  <CardDescription>
                    Configure when and how often to run the deployment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={wizardData.schedule.type === 'now'}
                        onCheckedChange={(checked) => {
                          if (checked) updateWizardData('schedule', { ...wizardData.schedule, type: 'now' });
                        }}
                      />
                      <Label className="text-sm">Run Now</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={wizardData.schedule.type === 'later'}
                        onCheckedChange={(checked) => {
                          if (checked) updateWizardData('schedule', { 
                            ...wizardData.schedule, 
                            type: 'later',
                            frequency: wizardData.schedule.frequency ?? 'daily',
                            time: wizardData.schedule.time ?? '02:00'
                          });
                        }}
                      />
                      <Label className="text-sm">Schedule for Later</Label>
                    </div>
                  </div>

                  {wizardData.schedule.type === 'later' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
                      <div>
                        <Label className="text-sm font-medium">Frequency</Label>
                        <Select
                          value={wizardData.schedule.frequency || 'daily'}
                          onValueChange={(value: 'daily' | 'weekly' | 'monthly') => {
                            updateWizardData('schedule', { ...wizardData.schedule, frequency: value });
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select> 
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Time</Label>
                        <Input
                          type="time"
                          value={wizardData.schedule.time || '02:00'}
                          onChange={(e) => updateWizardData('schedule', { ...wizardData.schedule, time: e.target.value })}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Business Hours</Label>
                        <div className="mt-2 flex flex-col space-y-2">
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={wizardData.schedule.businessHours === true}
                              onCheckedChange={(checked) => updateWizardData('schedule', { ...wizardData.schedule, businessHours: checked ?? true })}
                            />
                            <span className="text-sm">During Business Hours (9 AM - 5 PM)</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <Checkbox
                              checked={wizardData.schedule.businessHours === false}
                              onCheckedChange={(checked) => updateWizardData('schedule', { ...wizardData.schedule, businessHours: checked === true ? false : wizardData.schedule.businessHours })}
                            />
                            <span className="text-sm">After Business Hours</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 6: Review & Submit */}
            {currentWizardStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step 6: Review & Submit</CardTitle>
                  <CardDescription>
                    Review your deployment configuration and submit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Basic Information</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Name:</span> {wizardData.name}</p>
                        <p><span className="font-medium">Description:</span> {wizardData.description}</p>
                      </div>
                    </div>

                    {/* Selected Policies */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Selected Policies</h4>
                      <div className="flex flex-wrap gap-1">
                        {wizardData.selectedPolicyIds.map(id => {
                          const policy = (effectivePolicies as ScriptPolicy[]).find(p => p.id === id);
                          return policy ? (
                            <Badge key={id} variant="secondary" className="text-xs">
                              {policy.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Targets */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Targets</h4>
                      <div className="text-sm space-y-1">
                        {wizardData.targets.ipRanges.length > 0 && (
                          <p><span className="font-medium">IP Ranges:</span> {wizardData.targets.ipRanges.join(', ')}</p>
                        )}
                        {wizardData.targets.hostnames.length > 0 && (
                          <p><span className="font-medium">Hostnames:</span> {wizardData.targets.hostnames.join(', ')}</p>
                        )}
                        {wizardData.targets.ouPaths.length > 0 && (
                          <p><span className="font-medium">OU Paths:</span> {wizardData.targets.ouPaths.join(', ')}</p>
                        )}
                        {wizardData.targets.ipSegments.length > 0 && (
                          <p><span className="font-medium">IP Segments:</span> {wizardData.targets.ipSegments.join(', ')}</p>
                        )}
                      </div>
                    </div>

                    {/* Credentials & Probes */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Configuration</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Credential Profile:</span>{' '}
                          {(credentialProfiles as CredentialProfileSummary[]).find(p => p.id === wizardData.credentialProfileId)?.name}
                        </p>
                        <p>
                          <span className="font-medium">Selected Probes:</span>{' '}
                          {wizardData.selectedProbeIds.length} probe{wizardData.selectedProbeIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-3 md:col-span-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">Schedule</h4>
                      <div className="text-sm">
                        {wizardData.schedule.type === 'now' ? (
                          <p>Execute immediately after submission</p>
                        ) : (
                          <p>
                            Execute {wizardData.schedule.frequency} at {wizardData.schedule.time}{' '}
                            {wizardData.schedule.businessHours ? 'during business hours' : 'after business hours'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSubmitDeployment}
                      disabled={createDeploymentMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {createDeploymentMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating Deployment...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Deploy Agent Policies
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Wizard Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentWizardStep === 1}
            >
              Previous
            </Button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentWizardStep} of 6
            </div>

            {currentWizardStep < 6 ? (
              <Button
                onClick={handleNextStep}
                disabled={!validateCurrentStep()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setShowDeploymentWizard(false)}>
                Cancel
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Agent Orchestrator */}
      <AIAgentOrchestrator
        isOpen={isAIOrchestratorOpen}
        onClose={() => setIsAIOrchestratorOpen(false)}
        onStrategyGenerated={handleAIStrategyGenerated}
      />

      {/* Deployment detail dialog */}
      <DeploymentDetailDialog
        deployment={selectedDeployment}
        onClose={() => setSelectedDeployment(null)}
      />
    </div>
  );
}