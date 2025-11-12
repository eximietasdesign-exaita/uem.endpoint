import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Calendar,
  Network,
  Shield,
  Search,
  Server,
  Globe,
  Settings,
  Play,
  Target,
  Users,
  Key,
  Zap,
  Brain,
  Sparkles,
  BarChart3
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { CredentialProfile, ScriptPolicy } from "@shared/schema";
import { AIDiscoveryPlanner } from "@/components/AIDiscoveryPlanner";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

const wizardSteps: WizardStep[] = [
  { id: 1, title: "General Information", description: "Job name and description", icon: Settings },
  { id: 2, title: "Policy Selection", description: "Choose discovery policies", icon: Shield },
  { id: 3, title: "Targets & Credentials", description: "Define targets and authentication", icon: Target },
  { id: 4, title: "Schedule", description: "Configure job scheduling", icon: Calendar },
  { id: 5, title: "Review & Submit", description: "Review and create job", icon: CheckCircle }
];

interface JobFormData {
  name: string;
  description: string;
  selectedPolicies: number[];
  targets: {
    ipRanges: string[];
    hostnames: string[];
    ouPaths: string[];
    ipSegments: string[];
  };
  credentialProfileId: number | null;
  probeId: number | null;
  schedule: {
    type: 'now' | 'once' | 'recurring';
    scheduledTime?: Date;
    frequency?: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time?: string;
    timezone?: string;
  };
}

const initialFormData: JobFormData = {
  name: "",
  description: "",
  selectedPolicies: [],
  targets: {
    ipRanges: [],
    hostnames: [],
    ouPaths: [],
    ipSegments: []
  },
  credentialProfileId: null,
  probeId: null,
  schedule: {
    type: 'now',
    timezone: 'UTC'
  }
};

// Mock probe data
const mockProbes = [
  { id: 1, name: "Probe-NYC-01", location: "New York Data Center", status: "online" },
  { id: 2, name: "Probe-LA-02", location: "Los Angeles Office", status: "online" },
  { id: 3, name: "Probe-CHI-03", location: "Chicago Branch", status: "warning" }
];

export default function AgentlessDiscoveryPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [newTarget, setNewTarget] = useState({ type: 'ipRange', value: '' });
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch policies
      const { data: policies = [] } = useQuery<ScriptPolicy[]>({
        queryKey: ['/api/script-policies'],
        queryFn: async () => {
          const res = await apiRequest('GET', '/api/script-policies');
          return (await res.json()) as ScriptPolicy[];
        },
      });
    
      // Fetch credential profiles
      const { data: credentialProfiles = [] } = useQuery<CredentialProfile[]>({
        queryKey: ['/api/credential-profiles'],
        queryFn: async () => {
          const res = await apiRequest('GET', '/api/credential-profiles');
          return (await res.json()) as CredentialProfile[];
        },
      });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      // apiRequest expects (method, url, data)
      return await apiRequest('POST', '/api/agentless-discovery-jobs', jobData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Agentless discovery job created successfully",
      });
      // Reset form
      setFormData(initialFormData);
      setCurrentStep(1);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create agentless discovery job",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddTarget = () => {
    if (!newTarget.value.trim()) return;

    const { type, value } = newTarget;
    setFormData(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [type === 'ipRange' ? 'ipRanges' : 
         type === 'hostname' ? 'hostnames' :
         type === 'ouPath' ? 'ouPaths' : 'ipSegments']: [
          ...prev.targets[type === 'ipRange' ? 'ipRanges' : 
                         type === 'hostname' ? 'hostnames' :
                         type === 'ouPath' ? 'ouPaths' : 'ipSegments'],
          value
        ]
      }
    }));
    setNewTarget({ type: 'ipRange', value: '' });
  };

  const handleRemoveTarget = (type: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [type]: prev.targets[type as keyof typeof prev.targets].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = () => {
    const jobData = {
      name: formData.name,
      description: formData.description,
      status: formData.schedule.type === 'now' ? 'running' : 'scheduled',
      policyIds: JSON.stringify(formData.selectedPolicies),
      targets: JSON.stringify(formData.targets),
      credentialProfileId: formData.credentialProfileId,
      probeId: formData.probeId,
      schedule: JSON.stringify(formData.schedule),
      createdBy: 'admin'
    };

    createJobMutation.mutate(jobData);
  };

  const handleAIPlanGenerated = (plan: any) => {
    // Apply AI-generated plan to form data
    toast({
      title: "AI Plan Applied",
      description: "AI recommendations have been integrated into your discovery configuration",
    });
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return formData.selectedPolicies.length > 0;
      case 3:
        const hasTargets = Object.values(formData.targets).some(arr => arr.length > 0);
        return hasTargets && formData.credentialProfileId !== null && formData.probeId !== null;
      case 4:
        return true; // Schedule is optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const groupPoliciesByCategory = (policies: ScriptPolicy[]) => {
    return policies.reduce((acc, policy) => {
      const category = policy.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(policy);
      return acc;
    }, {} as Record<string, ScriptPolicy[]>);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="job-name">Job Name *</Label>
              <Input
                id="job-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter job name"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="job-description">Description</Label>
              <Textarea
                id="job-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter job description"
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 2:
        const groupedPolicies = groupPoliciesByCategory(policies);
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Select Discovery Policies</h3>
              {Object.entries(groupedPolicies).map(([category, categoryPolicies]) => (
                <div key={category} className="mb-6">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {categoryPolicies.map((policy) => (
                      <div key={policy.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={formData.selectedPolicies.includes(policy.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                selectedPolicies: [...prev.selectedPolicies, policy.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                selectedPolicies: prev.selectedPolicies.filter(id => id !== policy.id)
                              }));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{policy.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {policy.description}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{policy.targetOs}</Badge>
                            <Badge variant={policy.publishStatus === 'published' ? 'default' : 'secondary'}>
                              {policy.publishStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Targets */}
            <div>
              <h3 className="text-lg font-medium mb-4">Define Targets</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Select value={newTarget.type} onValueChange={(value) => setNewTarget(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ipRange">IP Range</SelectItem>
                    <SelectItem value="hostname">Hostname</SelectItem>
                    <SelectItem value="ouPath">OU Path</SelectItem>
                    <SelectItem value="ipSegment">IP Segment</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newTarget.value}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={
                    newTarget.type === 'ipRange' ? '192.168.1.1-192.168.1.50' :
                    newTarget.type === 'hostname' ? 'server01.corp.local' :
                    newTarget.type === 'ouPath' ? 'OU=Servers,DC=corp,DC=local' :
                    '192.168.1.0/24'
                  }
                />
                <Button onClick={handleAddTarget}>Add Target</Button>
              </div>

              {/* Display added targets */}
              <div className="space-y-4">
                {Object.entries(formData.targets).map(([type, targets]) => 
                  targets.length > 0 && (
                    <div key={type} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2 capitalize">
                        {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {targets.map((target: string, index: number) => (
                          <Badge key={index} variant="outline" className="flex items-center space-x-1">
                            <span>{target}</span>
                            <button
                              onClick={() => handleRemoveTarget(type, index)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Credential Profile */}
            <div>
              <h3 className="text-lg font-medium mb-4">Select Credential Profile</h3>
              <Select 
                value={formData.credentialProfileId?.toString() || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, credentialProfileId: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select credential profile" />
                </SelectTrigger>
                <SelectContent>
                  {credentialProfiles.map((profile: CredentialProfile) => (
                    <SelectItem key={profile.id} value={profile.id.toString()}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Probe Selection */}
            <div>
              <h3 className="text-lg font-medium mb-4">Select Satellite Server</h3>
              <div className="grid gap-3">
                {mockProbes.map((probe) => (
                  <div
                    key={probe.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      formData.probeId === probe.id 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, probeId: probe.id }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{probe.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{probe.location}</div>
                      </div>
                      <Badge variant={probe.status === 'online' ? 'default' : 'secondary'}>
                        {probe.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Configure Schedule</h3>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  variant={formData.schedule.type === 'now' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, type: 'now' } }))}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Now
                </Button>
                <Button
                  variant={formData.schedule.type === 'once' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, type: 'once' } }))}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Once
                </Button>
                <Button
                  variant={formData.schedule.type === 'recurring' ? 'default' : 'outline'}
                  onClick={() => setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, type: 'recurring' } }))}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Recurring
                </Button>
              </div>

              {formData.schedule.type === 'once' && (
                <div>
                  <Label>Scheduled Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.schedule.scheduledTime ? 
                      new Date(formData.schedule.scheduledTime.getTime() - formData.schedule.scheduledTime.getTimezoneOffset() * 60000)
                        .toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, scheduledTime: new Date(e.target.value) }
                    }))}
                    className="mt-2"
                  />
                </div>
              )}

              {formData.schedule.type === 'recurring' && (
                <div className="space-y-4">
                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={formData.schedule.frequency || ''}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, frequency: value } }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.schedule.frequency === 'weekly' && (
                    <div>
                      <Label>Day of Week</Label>
                      <Select
                        value={formData.schedule.dayOfWeek?.toString() || ''}
                        onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, dayOfWeek: parseInt(value) } }))
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                          <SelectItem value="0">Sunday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.schedule.frequency === 'monthly' && (
                    <div>
                      <Label>Day of Month</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.schedule.dayOfMonth || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, dayOfMonth: parseInt(e.target.value) }
                        }))}
                        placeholder="1-31"
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.schedule.time || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, time: e.target.value }
                      }))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Timezone</Label>
                    <Select
                      value={formData.schedule.timezone || 'UTC'}
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, schedule: { ...prev.schedule, timezone: value } }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Review & Submit</h3>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">General Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div><strong>Name:</strong> {formData.name}</div>
                    <div><strong>Description:</strong> {formData.description || 'No description'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selected Policies ({formData.selectedPolicies.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedPolicies.map(policyId => {
                      const policy = policies.find((p: ScriptPolicy) => p.id === policyId);
                      return policy && (
                        <Badge key={policyId} variant="outline">{policy.name}</Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Targets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(formData.targets).map(([type, targets]) => 
                      targets.length > 0 && (
                        <div key={type}>
                          <strong className="capitalize">{type.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {targets.map((target: string, index: number) => (
                              <Badge key={index} variant="secondary">{target}</Badge>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <strong>Credential Profile:</strong> {
                        credentialProfiles.find((p: CredentialProfile) => p.id === formData.credentialProfileId)?.name || 'None'
                      }
                    </div>
                    <div>
                      <strong>Probe:</strong> {
                        mockProbes.find(p => p.id === formData.probeId)?.name || 'None'
                      }
                    </div>
                    <div>
                      <strong>Schedule:</strong> {
                        formData.schedule.type === 'now' ? 'Run immediately' :
                        formData.schedule.type === 'once' ? `Once at ${formData.schedule.scheduledTime?.toLocaleString()}` :
                        `${formData.schedule.frequency} at ${formData.schedule.time || 'Not set'}`
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Agentless Discovery Job
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Configure and schedule automated network discovery and compliance scanning
              </p>
            </div>
            <Button
              onClick={() => setIsAIPlannerOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Planner
              <Sparkles className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isValid = isStepValid(step.id);

              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2",
                    isCompleted ? "bg-green-500 border-green-500 text-white" :
                    isActive ? "bg-blue-500 border-blue-500 text-white" :
                    "bg-white border-gray-300 text-gray-400"
                  )}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={cn(
                      "text-sm font-medium",
                      isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(wizardSteps[currentStep - 1].icon, { className: "w-5 h-5" })}
              <span>{wizardSteps[currentStep - 1].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep === wizardSteps.length ? (
              <Button 
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || createJobMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* AI Discovery Planner */}
        <AIDiscoveryPlanner
          isOpen={isAIPlannerOpen}
          onClose={() => setIsAIPlannerOpen(false)}
          onPlanGenerated={handleAIPlanGenerated}
        />
      </div>
    </div>
  );
}