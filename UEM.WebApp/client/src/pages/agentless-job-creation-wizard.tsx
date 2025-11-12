import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  X,
  Check,
  Info,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Target,
  Shield,
  Settings,
  Play,
  HardDrive,
  Cpu,
  Network,
  Activity,
  Database,
  Monitor,
  Server,
  Wifi,
  Code,
  FileText,
  ChevronRight,
  AlertTriangle,
  Plus
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ScriptPolicy, CredentialProfile, DiscoveryProbe } from "@shared/schema";

interface WizardStep {
  id: number;
  title: string;
  icon: any;
  completed: boolean;
}

interface JobFormData {
  // Step 1: General Information
  name: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  environment?: 'development' | 'staging' | 'production' | 'testing';
  
  // Step 2: Policy Selection
  selectedPolicyIds: number[];
  
  // Step 3: Targets & Configuration
  targets: {
    ipRanges: string[];
    hostnames: string[];
    ouPaths: string[];
    ipSegments: string[];
  };
  credentialProfileId: number | null;
  probeId: number | null;
  
  // Step 4: Schedule
  scheduleType: 'now' | 'later';
  schedule: {
    type: 'once' | 'recurring';
    frequency?: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    timezone: string;
    startDate?: string;
    endDate?: string;
  };
}

const POLICY_CATEGORIES = {
  'Operating System': {
    icon: Monitor,
    policies: ['Hardware', 'Installed Software', 'Process', 'Registry', 'Storage', 'WMI', 'Linux/Unix Packages', 'Network Adapters', 'Windows Services']
  },
  'Network & Connectivity': {
    icon: Network,
    policies: ['SNMP', 'SSH']
  }
};

export default function AgentlessJobCreationWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<JobFormData>({
    name: '',
    description: '',
    priority: 'medium',
    environment: 'production',
    selectedPolicyIds: [],
    targets: {
      ipRanges: [],
      hostnames: [],
      ouPaths: [],
      ipSegments: [],
    },
    credentialProfileId: null,
    probeId: null,
    scheduleType: 'now',
    schedule: {
      type: 'once',
      time: '02:00',
      timezone: 'UTC',
    },
  });

  const steps: WizardStep[] = [
    { id: 1, title: 'Info', icon: Info, completed: currentStep > 1 },
    { id: 2, title: 'Profiles', icon: Settings, completed: currentStep > 2 },
    { id: 3, title: 'Targets', icon: Target, completed: currentStep > 3 },
    { id: 4, title: 'Schedule', icon: Calendar, completed: currentStep > 4 },
    { id: 5, title: 'Review', icon: Check, completed: false },
  ];

  // Fetch policies
    const { data: policies = [], isLoading: policiesLoading } = useQuery<ScriptPolicy[], Error>({
      queryKey: ['/api/script-policies'],
      queryFn: async () => {
        const res = await apiRequest('GET', '/api/script-policies');
        return (res && typeof (res as Response).json === 'function') ? await (res as Response).json() as ScriptPolicy[] : (res as unknown as ScriptPolicy[]);
      },
      staleTime: 30_000,
    });

    // Fetch credential profiles
    const { data: credentialProfiles = [], isLoading: credentialsLoading } = useQuery<CredentialProfile[], Error>({
      queryKey: ['/api/credential-profiles'],
      queryFn: async () => {
        const res = await apiRequest('GET', '/api/credential-profiles');
        return (res && typeof (res as Response).json === 'function') ? await (res as Response).json() as CredentialProfile[] : (res as unknown as CredentialProfile[]);
      },
    });

    // Fetch discovery probes
    const { data: probes = [], isLoading: probesLoading } = useQuery<DiscoveryProbe[], Error>({
      queryKey: ['/api/discovery-probes'],
      queryFn: async () => {
        const res = await apiRequest('GET', '/api/discovery-probes');
        return (res && typeof (res as Response).json === 'function') ? await (res as Response).json() as DiscoveryProbe[] : (res as unknown as DiscoveryProbe[]);
      },
      staleTime: 30_000,
    });

  // normalize fields from backend: target OS may come as targetOS / targetOs / target_os
  const getTargetOS = (policy: any) =>
    policy?.targetOS ?? policy?.targetOs ?? policy?.target_os ?? policy?.TargetOs ?? 'Any';

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      console.log('Creating job with data:', jobData);
      return await apiRequest('POST','/api/agentless-discovery-jobs', jobData);
    },
    onSuccess: (data) => {
      console.log('Job created successfully:', data);
      toast({
        title: "Success",
        description: formData.scheduleType === 'now' 
          ? "Discovery job created and started successfully" 
          : "Discovery job created and scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agentless-discovery-jobs'] });
      setLocation('/agentless-discovery');
    },
    onError: (error: any) => {
      console.error('Failed to create job:', error);
      toast({
        title: "Error",
        description: `Failed to create job: ${error.details || error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (field: keyof JobFormData, subField: string, value: any) => {
    setFormData(prev => {
      const current = prev[field] as any;
      const next = (current && typeof current === 'object') ? { ...current } : {};
      next[subField] = value;
      return {
        ...prev,
        [field]: next
      } as JobFormData;
    });
  };

  const addTargetField = (type: 'ipRanges' | 'hostnames' | 'ouPaths' | 'ipSegments') => {
    setFormData(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [type]: [...prev.targets[type], '']
      }
    }));
  };

  const updateTargetField = (type: 'ipRanges' | 'hostnames' | 'ouPaths' | 'ipSegments', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [type]: prev.targets[type].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const removeTargetField = (type: 'ipRanges' | 'hostnames' | 'ouPaths' | 'ipSegments', index: number) => {
    setFormData(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [type]: prev.targets[type].filter((_, i) => i !== index)
      }
    }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        const hasName = formData.name.trim() !== '';
        console.log('Step 1 validation - has name:', hasName);
        return hasName;
      case 2:
        const hasSelection = formData.selectedPolicyIds.length > 0;
        console.log('Step 2 validation - selected policies:', formData.selectedPolicyIds.length, hasSelection);
        return hasSelection;
      case 3:
        const hasTargets = Object.values(formData.targets).some(arr => 
          arr.some(val => val && val.trim() !== '')
        );
        console.log('Step 3 validation - has targets:', hasTargets, 'targets:', formData.targets);
        return hasTargets;
      case 4:
        if (formData.scheduleType === 'later') {
          const hasTime = formData.schedule.time !== '';
          const hasTimezone = formData.schedule.timezone !== '';
          console.log('Step 4 validation - schedule later:', hasTime && hasTimezone);
          return hasTime && hasTimezone;
        }
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const cleanTargets = {
      ipRanges: formData.targets.ipRanges.filter(ip => ip.trim() !== ''),
      hostnames: formData.targets.hostnames.filter(host => host.trim() !== ''),
      ouPaths: formData.targets.ouPaths.filter(ou => ou.trim() !== ''),
      ipSegments: formData.targets.ipSegments.filter(segment => segment.trim() !== ''),
    };

    // ensure required JSONB fields included and startedAt is timestamp WITHOUT timezone string
    const startedAtDate = formData.scheduleType === 'now'
      ? new Date()
      : formData.schedule.startDate
        ? new Date(formData.schedule.startDate)
        : null;

    // Use ISO 8601 (UTC) so System.Text.Json can parse into DateTime on the server
    const startedAt = startedAtDate ? startedAtDate.toISOString() : null;
    
    const defaultProgress = {
      total: 0,
      failed: 0,
      discovered: 0,
      inProgress: 0,
      legacyPercent: 0
    };
    
    const defaultResults = {
      errors: [],
      newAssets: 0,
      totalAssets: 0,
      updatedAssets: 0
    };
    
    const jobData = {
      name: formData.name,
      description: formData.description,
      policyIds: formData.selectedPolicyIds,
      targets: cleanTargets,
      credentialProfileId: formData.credentialProfileId,
      probeId: formData.probeId,
      schedule: formData.schedule,
      status: formData.scheduleType === 'now' ? 'running' : 'scheduled',
      // pass progress/results explicitly so DB JSONB columns are populated
      progress: defaultProgress,
      results: defaultResults,
      // send ISO timestamp (server will convert to DB timestamp without timezone)
      startedAt: startedAt,
    };
    
    createJobMutation.mutate(jobData);
  };



  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>General Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="jobName" className="text-sm font-medium">Job Name *</Label>
          <Input
            id="jobName"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            placeholder="Enter a descriptive name for this discovery job"
            className={cn("mt-1", formData.name.trim() === '' && "border-red-300")}
          />
          {formData.name.trim() === '' && (
            <p className="text-xs text-red-500 mt-1">Job name is required</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="jobDescription" className="text-sm font-medium">Description</Label>
          <Textarea
            id="jobDescription"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            placeholder="Provide additional details about this discovery job (optional)"
            className="mt-1"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            Describe the purpose and scope of this discovery job to help with future management
          </p>
        </div>

        {/* Enterprise Features - Job Priority and Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Priority Level</Label>
            <Select
              value={formData.priority || 'medium'}
              onValueChange={(value) => updateFormData('priority', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Low Priority</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Medium Priority</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>High Priority</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Environment</Label>
            <Select
              value={formData.environment || 'production'}
              onValueChange={(value) => updateFormData('environment', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => {

    console.log('Available policies:', policies);
    console.log('Selected policy IDs:', formData.selectedPolicyIds);

    const selectAllPolicies = () => {
      const allIds = policies.map((policy: ScriptPolicy) => policy.id);
      setFormData(prev => ({
        ...prev,
        selectedPolicyIds: allIds
      }));
    };

    const clearAllPolicies = () => {
      setFormData(prev => ({
        ...prev,
        selectedPolicyIds: []
      }));
    };

    // Filter policies based on search and category
    const filteredPolicies = policies.filter((policy: ScriptPolicy) => {
      const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (policy.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || policy.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(policies.map((p: ScriptPolicy) => p.category)))];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Enterprise Discovery Profiles</span>
          </CardTitle>
          <CardDescription>
            Configure comprehensive data collection strategies for your enterprise environment with advanced filtering and selection capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading state */}
          {policiesLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600">Loading discovery profiles...</span>
            </div>
          )}

          {!policiesLoading && (
            <>
              {/* Enhanced Search and Filter Controls */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="policy-search" className="text-sm font-medium">Search Policies</Label>
                    <Input
                      id="policy-search"
                      placeholder="Search by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:w-48">
                    <Label htmlFor="category-filter" className="text-sm font-medium">Filter by Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enterprise Action Bar */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enterprise Actions:</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllPolicies}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 font-medium"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Select All ({policies.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Select recommended profiles
                        const recommendedPolicies = policies.filter((p: ScriptPolicy) => 
                          p.name.includes('Network') || p.name.includes('Hardware') || p.name.includes('Software')
                        );
                        setFormData(prev => ({
                          ...prev,
                          selectedPolicyIds: recommendedPolicies.map(p => p.id)
                        }));
                      }}
                      className="text-green-600 border-green-200 hover:bg-green-50 font-medium"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Recommended
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllPolicies}
                      disabled={formData.selectedPolicyIds.length === 0}
                      className="text-red-600 border-red-200 hover:bg-red-50 font-medium"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {formData.selectedPolicyIds.length} of {policies.length} selected
                  </div>
                </div>
              </div>

              {/* Enhanced Policy Grid */}
              <div className="space-y-6">
                {Array.from(new Set(filteredPolicies.map(p => p.category))).map(category => {
                  const categoryPolicies = filteredPolicies.filter(p => p.category === category);
                  const selectedInCategory = categoryPolicies.filter(p => formData.selectedPolicyIds.includes(p.id)).length;
                  
                  return (
                    <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {/* Category Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h3>
                            <Badge 
                              variant={selectedInCategory === categoryPolicies.length && categoryPolicies.length > 0 ? "default" : "outline"} 
                              className="text-xs font-medium"
                            >
                              {selectedInCategory}/{categoryPolicies.length} selected
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const categoryIds = categoryPolicies.map(p => p.id);
                                setFormData(prev => {
                                  const combined = prev.selectedPolicyIds.concat(categoryIds);
                                  const deduped = combined.filter((id, idx, arr) => arr.indexOf(id) === idx);
                                  return {
                                    ...prev,
                                    selectedPolicyIds: deduped
                                  };
                                });
                              }}
                              disabled={selectedInCategory === categoryPolicies.length}
                              className="text-xs"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const categoryIds = categoryPolicies.map(p => p.id);
                                setFormData(prev => ({
                                  ...prev,
                                  selectedPolicyIds: prev.selectedPolicyIds.filter(id => !categoryIds.includes(id))
                                }));
                              }}
                              disabled={selectedInCategory === 0}
                              className="text-xs"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Clear
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Policy Cards */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {categoryPolicies.map((policy: ScriptPolicy) => {
                            const isSelected = formData.selectedPolicyIds.includes(policy.id);
                            return (
                              <div
                                key={policy.id}
                                className={cn(
                                  "relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                                    : "border-gray-200 hover:border-blue-300 bg-white dark:bg-gray-800 hover:shadow-md"
                                )}
                                onClick={() => {
                                  const newSelected = isSelected
                                    ? formData.selectedPolicyIds.filter(id => id !== policy.id)
                                    : [...formData.selectedPolicyIds, policy.id];
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedPolicyIds: newSelected
                                  }));
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <Checkbox
                                    checked={isSelected}
                                    className="mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                      {policy.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                                      {policy.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1">
                                        <Badge variant="secondary" className="text-xs">
                                          {getTargetOS(policy)}
                                        </Badge>
                                        <Badge 
                                          variant={policy.publishStatus === 'published' ? 'default' : 'outline'} 
                                          className="text-xs"
                                        >
                                          {policy.publishStatus}
                                        </Badge>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                      )}
                                    </div>

                                    {/* Script Count */}
                                    {policy.availableScripts && policy.availableScripts.length > 0 && (
                                      <div className="mt-2 text-xs text-gray-500 flex items-center">
                                        <Code className="w-3 h-3 mr-1" />
                                        {policy.availableScripts.length} script{policy.availableScripts.length !== 1 ? 's' : ''}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Enhanced Selection Summary */}
              {formData.selectedPolicyIds.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                        Enterprise Discovery Configuration
                      </h4>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {formData.selectedPolicyIds.length} Profile{formData.selectedPolicyIds.length !== 1 ? 's' : ''} Active
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(policies.map(p => p.category))).map(category => {
                      const categoryPolicies = policies.filter((p: ScriptPolicy) => p.category === category);
                      const selectedInCategory = categoryPolicies.filter((p: ScriptPolicy) => 
                        formData.selectedPolicyIds.includes(p.id)
                      );
                      
                      if (selectedInCategory.length === 0) return null;
                      
                      return (
                        <div key={category} className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="flex items-center space-x-2 mb-2">
                            <Monitor className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{category}</span>
                            <Badge variant="outline" className="text-xs">
                              {selectedInCategory.length}/{categoryPolicies.length}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedInCategory.map(policy => (
                              <Badge key={policy.id} variant="secondary" className="text-xs">
                                {policy.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Results State */}
              {filteredPolicies.length === 0 && searchTerm && (
                <div className="text-center py-12 text-gray-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No policies found</h3>
                  <p className="text-sm mb-4">Try adjusting your search term or category filter</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}

          {/* No policies loaded */}
          {!policiesLoading && policies.length === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-800">No discovery profiles available. Please contact your administrator.</p>
              </div>
            </div>
          )}

          {/* Warning when no profiles selected */}
          {!policiesLoading && policies.length > 0 && formData.selectedPolicyIds.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">Please select at least one discovery profile to continue</p>
              </div>
            </div>
          )}

          {/* Quick Select Buttons */}
          {!policiesLoading && policies.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Select recommended profiles
                  const recommendedPolicies = policies.filter((p: ScriptPolicy) => 
                    p.name === 'Installed Software' || p.name === 'SNMP' || p.name === 'Hardware'
                  );
                  updateFormData('selectedPolicyIds', recommendedPolicies.map(p => p.id));
                }}
              >
                Select Recommended
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Select all policies
                  updateFormData('selectedPolicyIds', policies.map((p: ScriptPolicy) => p.id));
                }}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Clear all selections
                  updateFormData('selectedPolicyIds', []);
                }}
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Policy Categories */}
          {!policiesLoading && policies.length > 0 && Object.entries(POLICY_CATEGORIES).map(([category, config]) => {
            const Icon = config.icon;
            const categoryPolicies = config.policies
              .map(policyName => policies.find((p: ScriptPolicy) => p.name === policyName))
              .filter(Boolean) as ScriptPolicy[];
            const categoryPolicyIds = categoryPolicies.map(p => p.id);
            const selectedInCategory = categoryPolicyIds.filter(id => formData.selectedPolicyIds.includes(id)).length;
            
            if (categoryPolicies.length === 0) {
              return (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-500">{category}</h3>
                  </div>
                  <p className="text-sm text-gray-500">No profiles available in this category</p>
                </div>
              );
            }
            
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{category}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {selectedInCategory}/{categoryPolicyIds.length} selected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allSelected = categoryPolicyIds.every(id => formData.selectedPolicyIds.includes(id));
                        if (allSelected) {
                          // Deselect all in category
                          const newSelected = formData.selectedPolicyIds.filter(id => !categoryPolicyIds.includes(id));
                          updateFormData('selectedPolicyIds', newSelected);
                        } else {
                          // Select all in category - concat and dedupe without using Set spread
                          const combined = formData.selectedPolicyIds.concat(categoryPolicyIds);
                          const newSelected = combined.filter((id, idx) => combined.indexOf(id) === idx);
                          updateFormData('selectedPolicyIds', newSelected);
                        }
                      }}
                    >
                      {selectedInCategory === categoryPolicyIds.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryPolicies.map((policy) => {
                    const isSelected = formData.selectedPolicyIds.includes(policy.id);
                    const isRecommended = policy.name === 'Installed Software' || policy.name === 'SNMP' || policy.name === 'Hardware';
                    
                    return (
                      <div
                        key={policy.id}
                        onClick={() => {
                          console.log('Clicking policy:', policy.name, 'ID:', policy.id);
                          const newSelected = isSelected
                            ? formData.selectedPolicyIds.filter(id => id !== policy.id)
                            : [...formData.selectedPolicyIds, policy.id];
                          console.log('New selection:', newSelected);
                          updateFormData('selectedPolicyIds', newSelected);
                        }}
                        className={cn(
                          "relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md select-none",
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                        )}
                      >
                        {isRecommended && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                            Recommended
                          </Badge>
                        )}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">{policy.name}</span>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                            {policy.description && (
                              <p className="text-xs opacity-75 line-clamp-2">{policy.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Enterprise details */}
                        <div className="mt-2 pt-2 border-t border-current opacity-50">
                          <div className="flex items-center justify-between text-xs">
                            <span>Type: {category.split(' ')[0]}</span>
                            <span>ID: {policy.id}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {/* Selected Summary */}
          {formData.selectedPolicyIds.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Selected {formData.selectedPolicyIds.length} discovery profile{formData.selectedPolicyIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.selectedPolicyIds.map(id => {
                  const policy = policies.find((p: ScriptPolicy) => p.id === id);
                  return policy ? (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {policy.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTargetSection = (
    title: string,
    placeholder: string,
    type: 'ipRanges' | 'hostnames' | 'ouPaths' | 'ipSegments'
  ) => (
    <div>
      <Label className="text-sm font-medium">{title}</Label>
      <div className="space-y-2 mt-1">
        {formData.targets[type].length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">No {title.toLowerCase()} added yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTargetField(type)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {title.slice(0, -1)}
            </Button>
          </div>
        ) : (
          <>
            {formData.targets[type].map((value, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={value}
                  onChange={(e) => updateTargetField(type, index, e.target.value)}
                  placeholder={placeholder}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTargetField(type, index)}
                  className="px-2 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTargetField(type)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const addQuickTarget = (type: 'ipRanges' | 'hostnames' | 'ouPaths' | 'ipSegments', value: string) => {
    setFormData(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [type]: [...prev.targets[type], value]
      }
    }));
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Target Configuration</span>
          </CardTitle>
          <CardDescription>
            Define the targets for discovery. Add at least one target to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Start Actions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium mb-3 text-blue-900 dark:text-blue-100">Quick Start Templates</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuickTarget('ipRanges', '192.168.1.1-192.168.1.100')}
                className="text-xs"
              >
                + Local Range
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuickTarget('ipSegments', '192.168.1.0/24')}
                className="text-xs"
              >
                + Subnet /24
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuickTarget('hostnames', 'server.domain.com')}
                className="text-xs"
              >
                + Hostname
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuickTarget('ouPaths', 'OU=Servers,DC=company,DC=com')}
                className="text-xs"
              >
                + OU Path
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderTargetSection('IP Ranges', '192.168.1.1-192.168.1.50', 'ipRanges')}
            {renderTargetSection('Hostnames', 'server01.domain.com', 'hostnames')}
            {renderTargetSection('OU Paths', 'OU=Servers,DC=domain,DC=com', 'ouPaths')}
            {renderTargetSection('IP Segments', '192.168.1.0/24', 'ipSegments')}
          </div>

          {/* Target Summary */}
          {(formData.targets.ipRanges.some(ip => ip.trim()) || 
            formData.targets.hostnames.some(host => host.trim()) ||
            formData.targets.ouPaths.some(ou => ou.trim()) ||
            formData.targets.ipSegments.some(seg => seg.trim())) && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">Discovery Targets Configured</h4>
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
                {formData.targets.ipRanges.filter(ip => ip.trim()).length > 0 && 
                  <div>IP Ranges: {formData.targets.ipRanges.filter(ip => ip.trim()).length}</div>}
                {formData.targets.hostnames.filter(host => host.trim()).length > 0 && 
                  <div>Hostnames: {formData.targets.hostnames.filter(host => host.trim()).length}</div>}
                {formData.targets.ouPaths.filter(ou => ou.trim()).length > 0 && 
                  <div>OU Paths: {formData.targets.ouPaths.filter(ou => ou.trim()).length}</div>}
                {formData.targets.ipSegments.filter(seg => seg.trim()).length > 0 && 
                  <div>IP Segments: {formData.targets.ipSegments.filter(seg => seg.trim()).length}</div>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credential Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.credentialProfileId?.toString() || 'default'}
              onValueChange={(value) => updateFormData('credentialProfileId', value === 'default' ? null : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select credential profile (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Use Default Credentials</SelectItem>
                {credentialProfiles.map((profile: CredentialProfile) => (
                  <SelectItem key={profile.id} value={profile.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>{profile.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Default credentials will be used if none selected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satellite Server</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.probeId?.toString() || 'default'}
              onValueChange={(value) => updateFormData('probeId', value === 'default' ? null : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select satellite server (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Use Default Server</SelectItem>
                {probes.map((probe: DiscoveryProbe) => (
                  <SelectItem key={probe.id} value={probe.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4" />
                      <span>{probe.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {probe.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Default server will be used if none selected
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Execution Time</Label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="scheduleType"
                value="now"
                checked={formData.scheduleType === 'now'}
                onChange={(e) => updateFormData('scheduleType', e.target.value as 'now' | 'later')}
              />
              <span>Run Now</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="scheduleType"
                value="later"
                checked={formData.scheduleType === 'later'}
                onChange={(e) => updateFormData('scheduleType', e.target.value as 'now' | 'later')}
              />
              <span>Schedule for Later</span>
            </label>
          </div>
        </div>

        {formData.scheduleType === 'later' && (
          <div className="space-y-4">
            <div>
              <Label>Schedule Type</Label>
              <Select
                value={formData.schedule.type}
                onValueChange={(value) => updateNestedFormData('schedule', 'type', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Run Once</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.schedule.type === 'recurring' && (
              <div>
                <Label>Frequency</Label>
                <Select
                  value={formData.schedule.frequency}
                  onValueChange={(value) => updateNestedFormData('schedule', 'frequency', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={formData.schedule.time}
                  onChange={(e) => updateNestedFormData('schedule', 'time', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Timezone</Label>
                <Select
                  value={formData.schedule.timezone}
                  onValueChange={(value) => updateNestedFormData('schedule', 'timezone', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">General Information</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              <div><span className="font-medium">Name:</span> {formData.name}</div>
              <div><span className="font-medium">Description:</span> {formData.description || 'No description'}</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Discovery Profiles</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {formData.selectedPolicyIds.map(id => {
                  const policy = policies.find((p: ScriptPolicy) => p.id === id);
                  return policy ? (
                    <Badge key={id} variant="secondary">{policy.name}</Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Targets & Configuration</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
              {Object.entries(formData.targets).map(([key, values]) => {
                const filteredValues = values.filter(v => v.trim() !== '');
                if (filteredValues.length === 0) return null;
                return (
                  <div key={key}>
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="ml-2">{filteredValues.join(', ')}</span>
                  </div>
                );
              })}
              <div>
                <span className="font-medium">Credential Profile:</span>
                <span className="ml-2">
                  {credentialProfiles.find((p: CredentialProfile) => p.id === formData.credentialProfileId)?.name || 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium">Discovery Probe:</span>
                <span className="ml-2">
                  {probes.find((p: DiscoveryProbe) => p.id === formData.probeId)?.name || 'None'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Schedule</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {formData.scheduleType === 'now' ? (
                <span>Run immediately after creation</span>
              ) : (
                <div className="space-y-1">
                  <div><span className="font-medium">Type:</span> {formData.schedule.type}</div>
                  {formData.schedule.frequency && (
                    <div><span className="font-medium">Frequency:</span> {formData.schedule.frequency}</div>
                  )}
                  <div><span className="font-medium">Time:</span> {formData.schedule.time} ({formData.schedule.timezone})</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              step < currentStep
                ? "bg-green-500 text-white"
                : step === currentStep
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            )}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          <div className="ml-2 text-sm">
            {step === 1 && "General"}
            {step === 2 && "Profiles"}
            {step === 3 && "Targets"}
            {step === 4 && "Schedule"}
            {step === 5 && "Review"}
          </div>
          {step < 5 && <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />}
        </div>
      ))}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Discovery Job
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/agentless-discovery')}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {renderStepIndicator()}
        </div>

        {/* Content */}
        <div className="p-6">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <div className="flex items-center space-x-3">
            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createJobMutation.isPending}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                {createJobMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Create Job</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}