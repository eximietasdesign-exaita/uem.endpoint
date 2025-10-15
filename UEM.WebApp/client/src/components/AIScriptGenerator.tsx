import React, { useState } from 'react';
import { Brain, Sparkles, Code, FileText, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ScriptGenerationRequest {
  purpose: string;
  targetOS: 'windows' | 'linux' | 'macos' | 'cross-platform';
  scriptType: 'powershell' | 'bash' | 'python' | 'wmi';
  requirements: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
}

interface AIScriptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onScriptGenerated?: (result: { code: string; documentation: string; explanation: string }) => void;
}

export function AIScriptGenerator({ isOpen, onClose, onScriptGenerated }: AIScriptGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<ScriptGenerationRequest>({
    purpose: '',
    targetOS: 'windows',
    scriptType: 'powershell',
    requirements: [],
    complexity: 'intermediate'
  });
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [generatedResult, setGeneratedResult] = useState<{
    code: string;
    documentation: string;
    explanation: string;
  } | null>(null);

  const osOptions = [
    { value: 'windows', label: 'Windows', icon: '🪟' },
    { value: 'linux', label: 'Linux', icon: '🐧' },
    { value: 'macos', label: 'macOS', icon: '🍎' },
    { value: 'cross-platform', label: 'Cross-Platform', icon: '🔄' }
  ];

  const scriptTypeOptions = [
    { value: 'powershell', label: 'PowerShell', description: 'Windows automation and management' },
    { value: 'bash', label: 'Bash', description: 'Unix/Linux shell scripting' },
    { value: 'python', label: 'Python', description: 'Cross-platform scripting' },
    { value: 'wmi', label: 'WMI', description: 'Windows Management Instrumentation' }
  ];

  const complexityOptions = [
    { value: 'basic', label: 'Basic', description: 'Simple, straightforward scripts' },
    { value: 'intermediate', label: 'Intermediate', description: 'Moderate complexity with error handling' },
    { value: 'advanced', label: 'Advanced', description: 'Enterprise-grade with full features' }
  ];

  const addRequirement = () => {
    if (currentRequirement.trim() && !formData.requirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirement)
    }));
  };

  const generateScript = async () => {
    if (!formData.purpose.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe the script purpose",
        variant: "destructive"
      });
      return;
    }

    if (formData.requirements.length === 0) {
      toast({
        title: "Missing Requirements",
        description: "Please add at least one requirement",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/ai/scripts/generate', formData);
      const result = await response.json();

      setGeneratedResult(result);
      onScriptGenerated?.(result);
      
      toast({
        title: "Script Generated Successfully",
        description: "AI has generated your script with documentation",
      });
    } catch (error) {
      console.error('Script generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestedRequirements = [
    'Error handling and logging',
    'Input validation',
    'Progress reporting',
    'Timeout handling',
    'Security compliance',
    'Performance optimization',
    'Cross-platform compatibility',
    'Output formatting (JSON/CSV)',
    'Configuration file support',
    'Email notifications'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Script Generator
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!generatedResult ? (
            <div className="space-y-6">
              {/* Script Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-sm font-medium">
                  Script Purpose <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe what this script should accomplish (e.g., 'Check disk space and send alerts when usage exceeds 80%')"
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              {/* OS and Script Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Target Operating System</Label>
                  <Select
                    value={formData.targetOS}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, targetOS: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {osOptions.map((os) => (
                        <SelectItem key={os.value} value={os.value}>
                          <div className="flex items-center gap-2">
                            <span>{os.icon}</span>
                            {os.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Script Type</Label>
                  <Select
                    value={formData.scriptType}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, scriptType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scriptTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Complexity Level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Complexity Level</Label>
                <Select
                  value={formData.complexity}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, complexity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityOptions.map((complexity) => (
                      <SelectItem key={complexity.value} value={complexity.value}>
                        <div>
                          <div className="font-medium">{complexity.label}</div>
                          <div className="text-xs text-gray-500">{complexity.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Requirements <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a specific requirement..."
                    value={currentRequirement}
                    onChange={(e) => setCurrentRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button onClick={addRequirement} type="button" size="sm">
                    Add
                  </Button>
                </div>

                {/* Current Requirements */}
                {formData.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement(req)}>
                        {req} ×
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Suggested Requirements */}
                <div className="mt-3">
                  <Label className="text-xs text-gray-500">Suggested Requirements (click to add):</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {suggestedRequirements
                      .filter(req => !formData.requirements.includes(req))
                      .map((req, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setFormData(prev => ({ ...prev, requirements: [...prev.requirements, req] }))}
                        >
                          + {req}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={generateScript} 
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Script
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Generated Code
                </TabsTrigger>
                <TabsTrigger value="docs" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentation
                </TabsTrigger>
                <TabsTrigger value="explanation" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Explanation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Generated Script Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
                      <code>{generatedResult.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="docs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap">{generatedResult.documentation}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="explanation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Technical Explanation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap">{generatedResult.explanation}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setGeneratedResult(null)}>
                  Generate Another
                </Button>
                <Button onClick={onClose}>
                  Use This Script
                </Button>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}