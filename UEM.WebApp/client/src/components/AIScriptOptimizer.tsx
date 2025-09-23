import React, { useState } from 'react';
import { Zap, Code, TrendingUp, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ScriptOptimizationResult {
  optimizedCode: string;
  improvements: string[];
  performanceGains: string[];
  securityEnhancements: string[];
}

interface AIScriptOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  scriptCode: string;
  scriptType: string;
  scriptName?: string;
  onOptimizedScript?: (optimizedCode: string) => void;
}

export function AIScriptOptimizer({ 
  isOpen, 
  onClose, 
  scriptCode, 
  scriptType, 
  scriptName,
  onOptimizedScript 
}: AIScriptOptimizerProps) {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<ScriptOptimizationResult | null>(null);

  const optimizeScript = async () => {
    if (!scriptCode.trim()) {
      toast({
        title: "No Script Content",
        description: "Please provide script code to optimize",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await apiRequest('/api/ai/scripts/optimize', {
        method: 'POST',
        body: JSON.stringify({
          scriptCode,
          scriptType
        })
      });

      setOptimization(result);
      
      toast({
        title: "Optimization Complete",
        description: "AI has optimized your script with improvements",
      });
    } catch (error) {
      console.error('Script optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const useOptimizedScript = () => {
    if (optimization?.optimizedCode) {
      onOptimizedScript?.(optimization.optimizedCode);
      onClose();
    }
  };

  const ImprovementSection = ({ title, items, icon: Icon, color }: {
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
            {items.length} improvements
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI Script Optimizer
            {scriptName && <span className="text-gray-500">- {scriptName}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!optimization ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Optimization Areas:</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Performance bottlenecks and resource usage</li>
                  <li>• Security vulnerabilities and hardening</li>
                  <li>• Error handling and resilience</li>
                  <li>• Code structure and readability</li>
                  <li>• Best practices compliance</li>
                  <li>• Enterprise-grade features</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={optimizeScript} 
                  disabled={isOptimizing}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isOptimizing ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Optimize Script
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Code Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5 text-gray-500" />
                      Original Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-auto">
                      <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm">
                        <code>{scriptCode}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Optimized Code
                      <ArrowRight className="h-4 w-4 text-green-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-auto">
                      <pre className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-sm">
                        <code>{optimization.optimizedCode}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Improvement Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Optimization Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ImprovementSection
                    title="General Improvements"
                    items={optimization.improvements}
                    icon={CheckCircle}
                    color="text-blue-500"
                  />

                  <ImprovementSection
                    title="Performance Gains"
                    items={optimization.performanceGains}
                    icon={Zap}
                    color="text-yellow-500"
                  />

                  <ImprovementSection
                    title="Security Enhancements"
                    items={optimization.securityEnhancements}
                    icon={Shield}
                    color="text-green-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-2 pt-4">
                <Button variant="outline" onClick={() => setOptimization(null)}>
                  Optimize Again
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Keep Original
                  </Button>
                  <Button 
                    onClick={useOptimizedScript}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Use Optimized Version
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}