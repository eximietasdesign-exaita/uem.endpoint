import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2,
  Play,
  Pause,
  Filter,
  ArrowUp,
  ArrowDown,
  X,
  Database,
  Server,
  Network,
  Monitor,
  Shield,
  Zap,
  Square
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ScriptPolicy, Script } from "@shared/schema";
import { useTenantData, useTenantContext } from "@/hooks/useTenantData";

interface PolicyCategory {
  name: string;
  count: number;
  policies: ScriptPolicy[];
  isOpen: boolean;
}

export default function ScriptPoliciesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [osFilter, setOsFilter] = useState("All OS");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryStates, setCategoryStates] = useState<Record<string, boolean>>({});
  const [selectedPolicy, setSelectedPolicy] = useState<ScriptPolicy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Use tenant-aware data fetching
  const { data: policies = [], isLoading, hasContext } = useTenantData({
    endpoint: "/api/script-policies",
  });

  const { data: scripts = [] } = useTenantData({
    endpoint: "/api/discovery-scripts",
    requiresContext: false,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/script-policies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/script-policies"] });
      toast({ title: "Policy deleted successfully" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (policy: ScriptPolicy) => 
      apiRequest("PATCH", `/api/script-policies/${policy.id}`, { isActive: !policy.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/script-policies"] });
      toast({ title: "Policy status updated" });
    },
  });

  // Group policies by category
  const groupedPolicies = policies.reduce((acc: Record<string, ScriptPolicy[]>, policy: ScriptPolicy) => {
    if (!acc[policy.category]) {
      acc[policy.category] = [];
    }
    acc[policy.category].push(policy);
    return acc;
  }, {});

  // Filter policies based on search, OS filter, and status
  const filteredPolicies = Object.entries(groupedPolicies).map(([category, categoryPolicies]) => {
    const filtered = categoryPolicies.filter(policy => {
      const matchesSearch = policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           policy.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOS = osFilter === "All OS" || policy.targetOS === osFilter;
      const matchesStatus = statusFilter === "All Status" || policy.publishStatus === statusFilter.toLowerCase();
      return matchesSearch && matchesOS && matchesStatus;
    });

    return {
      name: category,
      count: filtered.length,
      policies: filtered,
      isOpen: categoryStates[category] ?? true,
    };
  }).filter(category => category.count > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "draft": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "maintenance": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "inactive": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const toggleCategory = (categoryName: string) => {
    setCategoryStates(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setIsEditing(true);
  };

  const handleEditPolicy = (policy: ScriptPolicy) => {
    setSelectedPolicy(policy);
    setIsEditing(true);
  };

  const handleDeletePolicy = (policy: ScriptPolicy) => {
    if (confirm(`Are you sure you want to delete "${policy.name}"?`)) {
      deleteMutation.mutate(policy.id);
    }
  };

  const handleToggleActive = (policy: ScriptPolicy) => {
    toggleActiveMutation.mutate(policy);
  };

  if (isEditing) {
    return <ScriptPolicyEditor policy={selectedPolicy} onClose={() => setIsEditing(false)} />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading policies...</div>;
  }

  if (!hasContext) {
    return (
      <div className="space-y-6">
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("orchestration_repository")}</h1>
          <p className="text-gray-600 dark:text-gray-400">Group script into policies for streamlined deployment</p>
        </div>
        <Button onClick={handleCreatePolicy} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          {t("create_policy")}
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t("search_policies")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-700"
          />
        </div>
        <Select value={osFilter} onValueChange={setOsFilter}>
          <SelectTrigger className="w-40 bg-white dark:bg-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All OS">{t("all_os")}</SelectItem>
            <SelectItem value="Windows">{t("windows")}</SelectItem>
            <SelectItem value="Linux">{t("linux")}</SelectItem>
            <SelectItem value="macOS">{t("macos")}</SelectItem>
            <SelectItem value="Cross-platform">{t("cross_platform")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white dark:bg-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Status">All Status</SelectItem>
            <SelectItem value="Published">{t("published")}</SelectItem>
            <SelectItem value="Draft">{t("draft")}</SelectItem>
            <SelectItem value="Maintenance">{t("maintenance")}</SelectItem>
            <SelectItem value="Inactive">{t("inactive")}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Policy Categories */}
      <div className="space-y-4">
        {filteredPolicies.map((category) => (
          <Card key={category.name} className="border border-gray-200 dark:border-gray-700">
            <Collapsible
              open={category.isOpen}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                    {category.isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {category.policies.map((policy) => (
                      <div
                        key={policy.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {policy.name}
                              </h3>
                              <Badge 
                                variant={policy.isActive ? "default" : "secondary"}
                                className={policy.isActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""}
                              >
                                {policy.isActive ? t("activate") : t("inactive")}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(policy.publishStatus)}`}>
                                {t(policy.publishStatus)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {policy.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Target OS:</span>
                                <Badge variant="outline" className="text-xs">
                                  {policy.targetOS}
                                </Badge>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium">Scripts:</span>
                                <span>{Array.isArray(policy.availableScripts) ? policy.availableScripts.length : 0}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-medium">{t("execution_order")}:</span>
                                <span>{policy.executionOrder || 0}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(policy)}
                            disabled={toggleActiveMutation.isPending}
                          >
                            {policy.isActive ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPolicy(policy)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePolicy(policy)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {filteredPolicies.length === 0 && (
          <Card className="p-8 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">No policies found</p>
              <p className="text-sm">Try adjusting your search criteria or create a new policy.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Script Policy Editor Component
interface ScriptPolicyEditorProps {
  policy: ScriptPolicy | null;
  onClose: () => void;
}

interface ExecutionStep {
  id: string;
  stepName: string;
  scriptId: number;
  runCondition: "always" | "on_success" | "on_failure";
  previousStepId?: string;
  order: number;
}

function ScriptPolicyEditor({ policy, onClose }: ScriptPolicyEditorProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: policy?.name || "",
    description: policy?.description || "",
    category: policy?.category || "Discovery",
    targetOS: policy?.targetOS || "Linux",
    publishStatus: policy?.publishStatus || "draft",
    executionOrder: policy?.executionOrder || 0,
    isActive: policy?.isActive || true,
  });
  
  const [executionFlow, setExecutionFlow] = useState<ExecutionStep[]>(() => {
    if (policy?.executionFlow) {
      try {
        let parsed;
        if (typeof policy.executionFlow === 'string') {
          parsed = JSON.parse(policy.executionFlow);
        } else if (Array.isArray(policy.executionFlow)) {
          parsed = policy.executionFlow;
        } else {
          return [];
        }
        
        // Clean and normalize the execution flow data
        return parsed.map((step: any, index: number) => ({
          id: step.id || `step_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          stepName: step.stepName || "",
          scriptId: Number(step.scriptId) || 0,
          runCondition: step.runCondition || "always",
          previousStepId: step.previousStepId || undefined,
          order: step.order || (index + 1),
        } as ExecutionStep));
      } catch (error) {
        console.error('Error parsing execution flow:', error);
        return [];
      }
    }
    return [];
  });

  // Remove script search and selection as it's not needed anymore
  
  const { data: scripts = [] } = useTenantData({
    endpoint: "/api/discovery-scripts",
    requiresContext: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/script-policies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/script-policies"] });
      toast({ title: t("policy_created") });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', `/api/script-policies/${policy?.id}`, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/script-policies"] });
      toast({ title: t("policy_updated") });
      onClose();
    },
  });

  const { toast } = useToast();

  const getScriptIcon = (category: string) => {
    switch (category) {
      case "Applications & Databases": return <Database className="w-4 h-4" />;
      case "Network & Connectivity": return <Network className="w-4 h-4" />;
      case "Security": return <Shield className="w-4 h-4" />;
      case "System Monitoring": return <Monitor className="w-4 h-4" />;
      case "Hardware Information": return <Server className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  // Remove script filtering and grouping as it's no longer needed

  const addExecutionStep = () => {
    const newStep: ExecutionStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stepName: "",
      scriptId: 0,
      runCondition: "always",
      order: executionFlow.length + 1,
    };
    setExecutionFlow(prev => [...prev, newStep]);
  };

  const updateExecutionStep = (id: string, updates: Partial<ExecutionStep>) => {
    setExecutionFlow(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const removeExecutionStep = (id: string) => {
    if (!id) {
      console.error('Cannot delete step: ID is null or undefined');
      return;
    }
    
    setExecutionFlow(prev => {
      const filtered = prev.filter(step => step.id !== id);
      const reordered = filtered.map((step, index) => ({
        ...step,
        order: index + 1
      }));
      
      return reordered;
    });
  };

  const moveStep = (id: string, direction: 'up' | 'down') => {
    const currentIndex = executionFlow.findIndex(step => step.id === id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= executionFlow.length) return;
    
    const newFlow = [...executionFlow];
    [newFlow[currentIndex], newFlow[newIndex]] = [newFlow[newIndex], newFlow[currentIndex]];
    
    // Update order numbers
    const updatedFlow = newFlow.map((step, index) => ({
      ...step,
      order: index + 1
    }));
    
    setExecutionFlow(updatedFlow);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      availableScripts: executionFlow.map(step => step.scriptId.toString()).filter(id => id !== "0"),
      executionFlow: JSON.stringify(executionFlow),
    };

    if (policy) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {policy ? t("edit_policy") : t("create_policy")}
        </h1>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          {t("cancel")}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Policy Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Policy Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("policy_name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">{t("policy_description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">{t("script_category")}</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Discovery">{t("discovery")}</SelectItem>
                      <SelectItem value="Health Checks">{t("health_checks")}</SelectItem>
                      <SelectItem value="Onboarding">{t("onboarding")}</SelectItem>
                      <SelectItem value="Security">{t("security")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="targetOS">{t("target_os")}</Label>
                  <Select value={formData.targetOS} onValueChange={(value) => setFormData(prev => ({ ...prev, targetOS: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Windows">{t("windows")}</SelectItem>
                      <SelectItem value="Linux">{t("linux")}</SelectItem>
                      <SelectItem value="macOS">{t("macos")}</SelectItem>
                      <SelectItem value="Cross-platform">{t("cross_platform")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="publishStatus">{t("publish_status")}</Label>
                  <Select value={formData.publishStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, publishStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t("draft")}</SelectItem>
                      <SelectItem value="published">{t("published")}</SelectItem>
                      <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
                      <SelectItem value="inactive">{t("inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="executionOrder">{t("execution_order")}</Label>
                  <Input
                    id="executionOrder"
                    type="number"
                    value={formData.executionOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, executionOrder: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Execution Flow - Enterprise Visual Flow */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Execution Flow Designer
                      </CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Drag, connect, and configure your workflow steps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={addExecutionStep}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 min-h-[600px] relative overflow-hidden">
                  {/* Grid Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <svg width="100%" height="100%" className="text-gray-300 dark:text-gray-600">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Flow Container */}
                  <div className="relative p-6 space-y-6">
                    {/* Start Node */}
                    <div className="flex justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">START</span>
                        {executionFlow.length > 0 && (
                          <div className="w-px h-6 bg-gradient-to-b from-green-500 to-blue-500 mt-2"></div>
                        )}
                      </div>
                    </div>

                    {/* Execution Steps */}
                    {executionFlow.map((step, index) => {
                      const selectedScript = scripts.find((s: Script) => s.id === step.scriptId);
                      const isConditional = step.runCondition !== "always";
                      
                      return (
                        <div key={step.id} className="flex justify-center">
                          <div className="relative flex flex-col items-center max-w-sm w-full">
                            {/* Connection Line from Previous Step */}
                            {index > 0 && (
                              <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-purple-500 -mt-6"></div>
                            )}
                            
                            {/* Step Card */}
                            <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-full hover:shadow-xl transition-all duration-200 group">
                              {/* Step Number Badge */}
                              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                {index + 1}
                              </div>
                              
                              {/* Conditional Badge */}
                              {isConditional && (
                                <div className="absolute -top-2 -right-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-md shadow-md">
                                  {step.runCondition === "on_success" ? "✓" : "✗"}
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveStep(step.id, 'up')}
                                  disabled={index === 0}
                                  className="p-1 h-6 w-6 hover:bg-blue-100 dark:hover:bg-blue-900"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveStep(step.id, 'down')}
                                  disabled={index === executionFlow.length - 1}
                                  className="p-1 h-6 w-6 hover:bg-blue-100 dark:hover:bg-blue-900"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExecutionStep(step.id)}
                                  className="p-1 h-6 w-6 hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Step Content */}
                              <div className="space-y-3 mt-2">
                                {/* Step Name */}
                                <div>
                                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Step Name</Label>
                                  <Input
                                    value={step.stepName}
                                    onChange={(e) => updateExecutionStep(step.id, { stepName: e.target.value })}
                                    placeholder="Enter step name"
                                    className="mt-1 text-sm"
                                  />
                                </div>

                                {/* Script Selection */}
                                <div>
                                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Script</Label>
                                  <Select
                                    value={step.scriptId > 0 ? step.scriptId.toString() : ""}
                                    onValueChange={(value) => updateExecutionStep(step.id, { scriptId: parseInt(value) || 0 })}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Choose script">
                                        {selectedScript && (
                                          <div className="flex items-center gap-2">
                                            {getScriptIcon(selectedScript.category)}
                                            <span className="text-sm">{selectedScript.name}</span>
                                          </div>
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {scripts.map((script: Script) => (
                                        <SelectItem key={script.id} value={script.id.toString()}>
                                          <div className="flex items-center gap-2">
                                            {getScriptIcon(script.category)}
                                            <div>
                                              <div className="font-medium text-sm">{script.name}</div>
                                              <div className="text-xs text-gray-500">{script.category}</div>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Run Condition */}
                                <div>
                                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Execution Condition</Label>
                                  <Select
                                    value={step.runCondition}
                                    onValueChange={(value: "always" | "on_success" | "on_failure") => 
                                      updateExecutionStep(step.id, { runCondition: value })
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="always">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          Always Execute
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="on_success">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          On Success Only
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="on_failure">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          On Failure Only
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Previous Step Selection for Conditional Execution */}
                                {step.runCondition !== "always" && (
                                  <div>
                                    <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Previous Step Reference</Label>
                                    <Select
                                      value={step.previousStepId || ""}
                                      onValueChange={(value) => updateExecutionStep(step.id, { previousStepId: value })}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select previous step" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {executionFlow.slice(0, index).map((prevStep) => (
                                          <SelectItem key={prevStep.id} value={prevStep.id}>
                                            <div className="flex items-center gap-2">
                                              <div className="w-4 h-4 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs">
                                                {executionFlow.findIndex(s => s.id === prevStep.id) + 1}
                                              </div>
                                              {prevStep.stepName || `Step ${prevStep.order}`}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                              
                              {/* Step Status Indicator */}
                              <div className="absolute bottom-2 left-4 flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  selectedScript ? 'bg-green-500' : 'bg-gray-400'
                                }`}></div>
                                <span className="text-xs text-gray-500">
                                  {selectedScript ? 'Configured' : 'Incomplete'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Connection Line to Next Step */}
                            {index < executionFlow.length - 1 && (
                              <div className="w-px h-6 bg-gradient-to-b from-purple-500 to-blue-500 mt-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* End Node */}
                    {executionFlow.length > 0 && (
                      <div className="flex justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-px h-6 bg-gradient-to-b from-purple-500 to-red-500 -mt-6"></div>
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                            <Square className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">END</span>
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {executionFlow.length === 0 && (
                      <div className="text-center py-16 px-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Design Your Execution Flow
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
                          Create a visual workflow by adding execution steps that will run in sequence with conditional logic
                        </p>
                        <Button 
                          type="button" 
                          onClick={addExecutionStep} 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Step
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {createMutation.isPending || updateMutation.isPending ? t("loading") : t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}