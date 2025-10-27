import React, { useState } from 'react';
import { Bot, Settings, Shield, Clock, Users, TrendingUp, Sparkles, CheckCircle, AlertTriangle, Target, ChevronRight, ChevronLeft, Save, Send, FileText, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PolicyDeploymentData {
  // Step 1: Policy Definition
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Step 2: Target Selection
  targetEnvironments: string[];
  policies: string[];
  
  // Step 3: Configuration
  businessHours: boolean;
  complianceRequirements: string[];
  resourceConstraints?: string[];
  
  // Step 4: Scheduling
  scheduleType: 'immediate' | 'scheduled' | 'maintenance_window';
  scheduledDate?: string;
  scheduledTime?: string;
  maintenanceWindow?: boolean;
  
  // Step 5: Review & Deploy
  approverEmail?: string;
  rollbackPlan: string;
  notifications: string[];
}

interface AgentDeploymentStrategy {
  optimalTargets: string[];
  deploymentOrder: string[];
  resourceRequirements: string[];
  riskAssessment: string[];
  expectedSuccess: number;
  timeline: string;
}

interface WizardStep {
  id: string;
  name: string;
  description: string;
  icon: any;
  completed: boolean;
}

interface AIAgentOrchestratorProps {
  isOpen: boolean;
  onClose: () => void;
  onStrategyGenerated?: (strategy: AgentDeploymentStrategy) => void;
}

export function AIAgentOrchestrator({ isOpen, onClose, onStrategyGenerated }: AIAgentOrchestratorProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [formData, setFormData] = useState<PolicyDeploymentData>({
    name: '',
    description: '',
    category: 'security',
    priority: 'medium',
    targetEnvironments: [],
    policies: [],
    businessHours: true,
    complianceRequirements: [],
    resourceConstraints: [],
    scheduleType: 'immediate',
    rollbackPlan: '',
    notifications: []
  });
  const [currentConstraint, setCurrentConstraint] = useState('');
  const [generatedStrategy, setGeneratedStrategy] = useState<AgentDeploymentStrategy | null>(null);

  const wizardSteps: WizardStep[] = [
    {
      id: 'definition',
      name: 'Policy Definition',
      description: 'Define the policy name, description, and priority',
      icon: FileText,
      completed: !!(formData.name && formData.description)
    },
    {
      id: 'targets',
      name: 'Target Selection',
      description: 'Select environments and policies to deploy',
      icon: Target,
      completed: formData.targetEnvironments.length > 0 && formData.policies.length > 0
    },
    {
      id: 'configuration',
      name: 'Configuration',
      description: 'Configure deployment settings and compliance',
      icon: Settings,
      completed: true // This step is always considered completed as it has defaults
    },
    {
      id: 'scheduling',
      name: 'Scheduling',
      description: 'Set deployment schedule and timing',
      icon: Calendar,
      completed: formData.scheduleType === 'immediate' || !!(formData.scheduledDate && formData.scheduledTime)
    },
    {
      id: 'review',
      name: 'Review & Deploy',
      description: 'Review configuration and deploy the policy',
      icon: CheckCircle,
      completed: !!formData.rollbackPlan
    }
  ];

  const environmentOptions = [
    'Production Servers',
    'Development Environment',
    'Testing Infrastructure',
    'User Workstations',
    'Network Devices',
    'Cloud Instances',
    'Virtual Machines',
    'Docker Containers',
    'Kubernetes Clusters',
    'Edge Devices'
  ];

  const policyOptions = [
    'Security Compliance',
    'Performance Monitoring',
    'Asset Discovery',
    'Vulnerability Assessment',
    'Configuration Management',
    'Log Collection',
    'Backup Verification',
    'Software Inventory',
    'Network Mapping',
    'Incident Response'
  ];

  const complianceOptions = [
    'SOX Compliance',
    'GDPR Requirements',
    'HIPAA Standards',
    'PCI-DSS',
    'ISO 27001',
    'NIST Framework',
    'FedRAMP',
    'SOC 2 Type II'
  ];

  const toggleEnvironment = (env: string) => {
    setFormData(prev => ({
      ...prev,
      targetEnvironments: prev.targetEnvironments.includes(env)
        ? prev.targetEnvironments.filter(e => e !== env)
        : [...prev.targetEnvironments, env]
    }));
  };

  const togglePolicy = (policy: string) => {
    setFormData(prev => ({
      ...prev,
      policies: prev.policies.includes(policy)
        ? prev.policies.filter(p => p !== policy)
        : [...prev.policies, policy]
    }));
  };

  const toggleCompliance = (compliance: string) => {
    setFormData(prev => ({
      ...prev,
      complianceRequirements: prev.complianceRequirements.includes(compliance)
        ? prev.complianceRequirements.filter(c => c !== compliance)
        : [...prev.complianceRequirements, compliance]
    }));
  };

  const addResourceConstraint = () => {
    if (currentConstraint.trim() && !formData.resourceConstraints?.includes(currentConstraint.trim())) {
      setFormData(prev => ({
        ...prev,
        resourceConstraints: [...(prev.resourceConstraints || []), currentConstraint.trim()]
      }));
      setCurrentConstraint('');
    }
  };

  const removeResourceConstraint = (constraint: string) => {
    setFormData(prev => ({
      ...prev,
      resourceConstraints: prev.resourceConstraints?.filter(c => c !== constraint) || []
    }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: return !!(formData.name && formData.description);
      case 1: return formData.targetEnvironments.length > 0 && formData.policies.length > 0;
      case 2: return true; // Configuration step has defaults
      case 3: return formData.scheduleType === 'immediate' || !!(formData.scheduledDate && formData.scheduledTime);
      case 4: return !!formData.rollbackPlan;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1 && canProceedToNextStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveAsDraft = async () => {
    setIsSaving(true);
    try {
      const result = await apiRequest('/api/policy-deployments/draft', {
        method: 'POST',
        body: {
          ...formData,
          status: 'draft',
          createdAt: new Date().toISOString()
        }
      });

      toast({
        title: "Draft Saved",
        description: "Your policy deployment has been saved as a draft",
      });
    } catch (error) {
      console.error('Save draft error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const publishImmediately = async () => {
    setIsPublishing(true);
    try {
      const result = await apiRequest('/api/policy-deployments/publish', {
        method: 'POST',
        body: {
          ...formData,
          status: 'published',
          publishedAt: new Date().toISOString()
        }
      });

      toast({
        title: "Policy Published",
        description: "Your policy deployment is now active and will execute as scheduled",
      });

      onClose();
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Publish Failed",
        description: "Failed to publish policy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const scheduleForLater = async () => {
    setIsSaving(true);
    try {
      const result = await apiRequest('/api/policy-deployments/schedule', {
        method: 'POST',
        body: {
          ...formData,
          status: 'scheduled',
          scheduledAt: formData.scheduleType === 'scheduled' ? 
            new Date(`${formData.scheduledDate} ${formData.scheduledTime}`).toISOString() : 
            null
        }
      });

      toast({
        title: "Policy Scheduled",
        description: "Your policy deployment has been scheduled for later execution",
      });

      onClose();
    } catch (error) {
      console.error('Schedule error:', error);
      toast({
        title: "Schedule Failed",
        description: "Failed to schedule policy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateStrategy = async () => {
    if (formData.targetEnvironments.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one target environment",
        variant: "destructive"
      });
      return;
    }

    if (formData.policies.length === 0) {
      toast({
        title: "Missing Policies",
        description: "Please select at least one policy to deploy",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiRequest('/api/ai/agent/orchestrate', {
        method: 'POST',
        body: formData
      });

      setGeneratedStrategy(result);
      onStrategyGenerated?.(result);
      
      toast({
        title: "Deployment Strategy Generated",
        description: "AI has created an optimal agent orchestration plan",
      });
    } catch (error) {
      console.error('Agent orchestration error:', error);
      toast({
        title: "Strategy Generation Failed",
        description: "Failed to generate deployment strategy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const StrategySection = ({ title, items, icon: Icon, color }: {
    title: string;
    items: string[];
    icon: any;
    color: string;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon className={`h-5 w-5 ${color}`} />
          {title}
          <Badge variant="secondary" className="ml-2">
            {items.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const StepIndicator = () => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-8 shadow-sm">
      {/* Progress Overview */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Configuration Progress</h3>
            <p className="text-sm text-muted-foreground">Enterprise Policy Deployment Setup</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(((currentStep + 1) / wizardSteps.length) * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Step {currentStep + 1} of {wizardSteps.length}</span>
          <span>{wizardSteps.filter(step => step.completed).length} steps completed</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Icons */}
      <div className="flex items-center justify-between">
        {wizardSteps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  index === currentStep
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg scale-110'
                    : step.completed
                    ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white border-green-600 shadow-md'
                    : 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                }`}
              >
                {step.completed && index !== currentStep ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <step.icon className="h-6 w-6" />
                )}
              </div>

              {/* Step Info */}
              <div className="text-center mt-3 max-w-24">
                <div className={`text-sm font-semibold ${
                  index === currentStep ? 'text-blue-600' : 
                  step.completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {step.description}
                </div>
                
                {/* Status Badge */}
                <div className="mt-2">
                  {index === currentStep ? (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                      In Progress
                    </Badge>
                  ) : step.completed ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Connection Line */}
            {index < wizardSteps.length - 1 && (
              <div className="flex-1 px-4">
                <div className={`h-1 rounded-full transition-all duration-300 ${
                  step.completed 
                    ? 'bg-gradient-to-r from-green-600 to-green-400' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Details */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          {React.createElement(wizardSteps[currentStep].icon, { className: "h-5 w-5 text-blue-600" })}
          <div>
            <div className="font-semibold text-blue-900 dark:text-blue-100">
              Currently: {wizardSteps[currentStep].name}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {wizardSteps[currentStep].description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Enterprise Policy Orchestration Platform
                </DialogTitle>
                <DialogDescription className="text-base font-medium text-muted-foreground mt-1">
                  Advanced Multi-Tenant Agent Policy Deployment & Compliance Management System
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Bot className="h-3 w-3 mr-1 text-blue-600" />
                AI-Powered
              </Badge>
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enterprise Ready
              </Badge>
              <div className="text-right">
                <div className="text-sm font-semibold text-blue-600">Step {currentStep + 1} of {wizardSteps.length}</div>
                <div className="text-xs text-muted-foreground">Configuration Wizard</div>
              </div>
            </div>
          </div>
          
          {/* Enterprise Features Banner */}
          <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Multi-Tenant</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>Global Deployment</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-orange-600" />
                  <span>AI-Optimized</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Session: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <StepIndicator />

        <div className="space-y-6">
          {!generatedStrategy ? (
            <div className="space-y-6">
              {/* Step 1: Policy Definition */}
              {currentStep === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Policy Definition</CardTitle>
                    <DialogDescription>
                      Define the basic information for your agent policy deployment
                    </DialogDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Policy Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="e.g., Security Compliance Q4 Rollout"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                            setFormData(prev => ({ ...prev, priority: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        placeholder="Describe the purpose and scope of this policy deployment..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                          <SelectItem value="monitoring">Monitoring</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Target Selection */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Target Environments */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Target Environments</CardTitle>
                      <DialogDescription>
                        Select the environments where this policy will be deployed
                      </DialogDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {environmentOptions.map((env) => (
                          <div
                            key={env}
                            onClick={() => toggleEnvironment(env)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              formData.targetEnvironments.includes(env)
                                ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                            }`}
                          >
                            <div className="text-sm font-medium">{env}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Policies to Deploy */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Policies to Deploy</CardTitle>
                      <DialogDescription>
                        Select the specific policies that will be deployed to the target environments
                      </DialogDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {policyOptions.map((policy) => (
                          <div
                            key={policy}
                            onClick={() => togglePolicy(policy)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              formData.policies.includes(policy)
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                            }`}
                          >
                            <div className="text-sm font-medium">{policy}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Configuration */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Deployment Configuration</CardTitle>
                      <DialogDescription>
                        Configure deployment settings and business rules
                      </DialogDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Business Hours */}
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Deploy During Business Hours</Label>
                          <p className="text-xs text-gray-500">
                            Enable to deploy agents during standard business hours for immediate support
                          </p>
                        </div>
                        <Switch
                          checked={formData.businessHours}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, businessHours: checked }))}
                        />
                      </div>

                      {/* Compliance Requirements */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Compliance Requirements</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {complianceOptions.map((compliance) => (
                            <div
                              key={compliance}
                              onClick={() => toggleCompliance(compliance)}
                              className={`p-2 border rounded-lg cursor-pointer transition-colors text-center ${
                                formData.complianceRequirements.includes(compliance)
                                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                  : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                              }`}
                            >
                              <div className="text-xs font-medium">{compliance}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resource Constraints */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Resource Constraints (Optional)</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add resource limitations or requirements..."
                            value={currentConstraint}
                            onChange={(e) => setCurrentConstraint(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addResourceConstraint()}
                          />
                          <Button onClick={addResourceConstraint} type="button" size="sm">
                            Add
                          </Button>
                        </div>

                        {formData.resourceConstraints && formData.resourceConstraints.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.resourceConstraints.map((constraint, index) => (
                              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeResourceConstraint(constraint)}>
                                {constraint} ×
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Scheduling */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deployment Schedule</CardTitle>
                    <DialogDescription>
                      Configure when and how this policy should be deployed
                    </DialogDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Schedule Type</Label>
                        <Select
                          value={formData.scheduleType}
                          onValueChange={(value: 'immediate' | 'scheduled' | 'maintenance_window') => 
                            setFormData(prev => ({ ...prev, scheduleType: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Deploy Immediately</SelectItem>
                            <SelectItem value="scheduled">Schedule for Later</SelectItem>
                            <SelectItem value="maintenance_window">During Maintenance Window</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.scheduleType === 'scheduled' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Date</Label>
                            <Input
                              type="date"
                              value={formData.scheduledDate || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Time</Label>
                            <Input
                              type="time"
                              value={formData.scheduledTime || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Review & Deploy */}
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review & Deploy</CardTitle>
                    <DialogDescription>
                      Review your configuration and prepare for deployment
                    </DialogDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Deployment Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Policy Name:</span>
                          <span className="font-medium">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <Badge variant="outline">{formData.priority}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Environments:</span>
                          <span className="font-medium">{formData.targetEnvironments.length} selected</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Policies:</span>
                          <span className="font-medium">{formData.policies.length} selected</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Schedule:</span>
                          <span className="font-medium">{formData.scheduleType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rollback Plan */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Rollback Plan <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        placeholder="Describe the steps to rollback this deployment if needed..."
                        value={formData.rollbackPlan}
                        onChange={(e) => setFormData(prev => ({ ...prev, rollbackPlan: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    {/* Approver Email */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Approver Email (Optional)</Label>
                      <Input
                        type="email"
                        placeholder="approver@company.com"
                        value={formData.approverEmail || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, approverEmail: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" onClick={prevStep}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {/* Save as Draft - available on all steps */}
                  <Button 
                    variant="outline" 
                    onClick={saveAsDraft} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save as Draft
                  </Button>

                  {currentStep < wizardSteps.length - 1 ? (
                    <Button 
                      onClick={nextStep} 
                      disabled={!canProceedToNextStep()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={scheduleForLater} 
                        disabled={isSaving || !canProceedToNextStep()}
                        variant="outline"
                      >
                        {isSaving ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Calendar className="h-4 w-4 mr-2" />
                        )}
                        Publish Later
                      </Button>
                      <Button 
                        onClick={publishImmediately} 
                        disabled={isPublishing || !canProceedToNextStep()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isPublishing ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Publish Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : generatedStrategy ? (
            <div className="space-y-6">
              {/* Strategy Overview */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-6 w-6 text-purple-600" />
                      Agent Deployment Strategy
                    </div>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{generatedStrategy.timeline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span>{generatedStrategy.expectedSuccess}% Success Rate</span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Expected Success Rate</span>
                      <span className="font-medium">{generatedStrategy.expectedSuccess}%</span>
                    </div>
                    <Progress value={generatedStrategy.expectedSuccess} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Strategy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StrategySection
                  title="Optimal Targets"
                  items={generatedStrategy.optimalTargets}
                  icon={Target}
                  color="text-purple-600"
                />

                <StrategySection
                  title="Deployment Order"
                  items={generatedStrategy.deploymentOrder}
                  icon={Users}
                  color="text-blue-600"
                />

                <StrategySection
                  title="Resource Requirements"
                  items={generatedStrategy.resourceRequirements}
                  icon={Settings}
                  color="text-green-600"
                />

                <StrategySection
                  title="Risk Assessment"
                  items={generatedStrategy.riskAssessment}
                  icon={Shield}
                  color="text-red-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setGeneratedStrategy(null)}>
                  Generate New Strategy
                </Button>
                <Button onClick={onClose}>
                  Execute Deployment
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}