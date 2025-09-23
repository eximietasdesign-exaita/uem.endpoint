import React, { useState } from 'react';
import { Brain, Target, Shield, Clock, TrendingUp, Zap, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface IntelligentDiscoveryRequest {
  networkRange: string;
  discoveryProfiles: string[];
  environment: 'enterprise' | 'smb' | 'datacenter' | 'cloud' | 'hybrid';
  riskTolerance: 'low' | 'medium' | 'high';
  priorityAssets?: string[];
}

interface DiscoveryPlan {
  scanStrategy: string[];
  priorityOrder: string[];
  securityConsiderations: string[];
  expectedResults: string[];
  timeEstimate: string;
  riskMitigation: string[];
}

interface AIDiscoveryPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated?: (plan: DiscoveryPlan) => void;
}

export function AIDiscoveryPlanner({ isOpen, onClose, onPlanGenerated }: AIDiscoveryPlannerProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<IntelligentDiscoveryRequest>({
    networkRange: '',
    discoveryProfiles: [],
    environment: 'enterprise',
    riskTolerance: 'medium',
    priorityAssets: []
  });
  const [currentAsset, setCurrentAsset] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<DiscoveryPlan | null>(null);

  const environmentOptions = [
    { value: 'enterprise', label: 'Enterprise', description: 'Large corporate environment' },
    { value: 'smb', label: 'SMB', description: 'Small to medium business' },
    { value: 'datacenter', label: 'Datacenter', description: 'High-density server environment' },
    { value: 'cloud', label: 'Cloud', description: 'Cloud-native infrastructure' },
    { value: 'hybrid', label: 'Hybrid', description: 'Mixed on-premises and cloud' }
  ];

  const riskToleranceOptions = [
    { value: 'low', label: 'Low Risk', description: 'Maximum security, minimal network impact' },
    { value: 'medium', label: 'Medium Risk', description: 'Balanced approach' },
    { value: 'high', label: 'High Risk', description: 'Aggressive scanning for maximum discovery' }
  ];

  const availableProfiles = [
    'Network & Connectivity',
    'Operating System',
    'Applications & Databases',
    'Security Assessment',
    'Performance Monitoring',
    'Compliance Scanning'
  ];

  const addPriorityAsset = () => {
    if (currentAsset.trim() && !formData.priorityAssets?.includes(currentAsset.trim())) {
      setFormData(prev => ({
        ...prev,
        priorityAssets: [...(prev.priorityAssets || []), currentAsset.trim()]
      }));
      setCurrentAsset('');
    }
  };

  const removePriorityAsset = (asset: string) => {
    setFormData(prev => ({
      ...prev,
      priorityAssets: prev.priorityAssets?.filter(a => a !== asset) || []
    }));
  };

  const toggleProfile = (profile: string) => {
    setFormData(prev => ({
      ...prev,
      discoveryProfiles: prev.discoveryProfiles.includes(profile)
        ? prev.discoveryProfiles.filter(p => p !== profile)
        : [...prev.discoveryProfiles, profile]
    }));
  };

  const generatePlan = async () => {
    if (!formData.networkRange.trim()) {
      toast({
        title: "Missing Information",
        description: "Please specify the network range to scan",
        variant: "destructive"
      });
      return;
    }

    if (formData.discoveryProfiles.length === 0) {
      toast({
        title: "Missing Profiles",
        description: "Please select at least one discovery profile",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiRequest('/api/ai/discovery/plan', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setGeneratedPlan(result);
      onPlanGenerated?.(result);
      
      toast({
        title: "Discovery Plan Generated",
        description: "AI has created an intelligent discovery strategy",
      });
    } catch (error) {
      console.error('Discovery plan generation error:', error);
      toast({
        title: "Plan Generation Failed",
        description: "Failed to generate discovery plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const PlanSection = ({ title, items, icon: Icon, color }: {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Discovery Planner
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Intelligent Strategy
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!generatedPlan ? (
            <div className="space-y-6">
              {/* Network Range */}
              <div className="space-y-2">
                <Label htmlFor="networkRange" className="text-sm font-medium">
                  Network Range <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="networkRange"
                  placeholder="e.g., 192.168.1.0/24, 10.0.0.0/16, or hostname ranges"
                  value={formData.networkRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, networkRange: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Specify IP ranges, CIDR blocks, or hostname patterns for discovery
                </p>
              </div>

              {/* Environment and Risk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Environment Type</Label>
                  <Select
                    value={formData.environment}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, environment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {environmentOptions.map((env) => (
                        <SelectItem key={env.value} value={env.value}>
                          <div>
                            <div className="font-medium">{env.label}</div>
                            <div className="text-xs text-gray-500">{env.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Risk Tolerance</Label>
                  <Select
                    value={formData.riskTolerance}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, riskTolerance: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {riskToleranceOptions.map((risk) => (
                        <SelectItem key={risk.value} value={risk.value}>
                          <div>
                            <div className="font-medium">{risk.label}</div>
                            <div className="text-xs text-gray-500">{risk.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Discovery Profiles */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Discovery Profiles <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableProfiles.map((profile) => (
                    <div
                      key={profile}
                      onClick={() => toggleProfile(profile)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.discoveryProfiles.includes(profile)
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                          : 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                      }`}
                    >
                      <div className="text-sm font-medium">{profile}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Assets */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority Assets (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add critical systems or hostnames..."
                    value={currentAsset}
                    onChange={(e) => setCurrentAsset(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPriorityAsset()}
                  />
                  <Button onClick={addPriorityAsset} type="button" size="sm">
                    Add
                  </Button>
                </div>

                {formData.priorityAssets && formData.priorityAssets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.priorityAssets.map((asset, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removePriorityAsset(asset)}>
                        {asset} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={generatePlan} 
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Plan Overview */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-6 w-6 text-blue-600" />
                      Intelligent Discovery Plan Generated
                    </div>
                    <div className="text-lg text-blue-600">
                      Estimated Time: {generatedPlan.timeEstimate}
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Plan Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlanSection
                  title="Scan Strategy"
                  items={generatedPlan.scanStrategy}
                  icon={Zap}
                  color="text-blue-600"
                />

                <PlanSection
                  title="Priority Order"
                  items={generatedPlan.priorityOrder}
                  icon={TrendingUp}
                  color="text-green-600"
                />

                <PlanSection
                  title="Security Considerations"
                  items={generatedPlan.securityConsiderations}
                  icon={Shield}
                  color="text-red-600"
                />

                <PlanSection
                  title="Expected Results"
                  items={generatedPlan.expectedResults}
                  icon={Target}
                  color="text-purple-600"
                />
              </div>

              {/* Risk Mitigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Risk Mitigation Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedPlan.riskMitigation.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setGeneratedPlan(null)}>
                  Generate New Plan
                </Button>
                <Button onClick={onClose}>
                  Use This Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}