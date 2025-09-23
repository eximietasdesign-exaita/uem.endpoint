import React, { useState } from 'react';
import { BarChart3, TrendingUp, Shield, AlertTriangle, CheckCircle, Target, Brain, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AgentStatusInsights {
  overallHealth: number;
  performanceAnalysis: string[];
  securityInsights: string[];
  optimizationSuggestions: string[];
  anomalyDetection: string[];
  trendsAnalysis: string[];
  executiveSummary: string;
}

interface AIAnalyticsInsightsProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: any;
  title?: string;
}

export function AIAnalyticsInsights({ isOpen, onClose, agentData, title = "AI Analytics" }: AIAnalyticsInsightsProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AgentStatusInsights | null>(null);

  const analyzeAgentData = async () => {
    setIsAnalyzing(true);
    try {
      const result = await apiRequest('/api/ai/agent/analyze', {
        method: 'POST',
        body: JSON.stringify({ agentData })
      });

      setInsights(result);
      
      toast({
        title: "Analysis Complete",
        description: "AI has generated comprehensive insights for your agent ecosystem",
      });
    } catch (error) {
      console.error('Agent analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze agent data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 85) return 'text-green-600';
    if (health >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (health: number) => {
    if (health >= 90) return { variant: 'default' as const, label: 'Excellent', color: 'bg-green-500' };
    if (health >= 80) return { variant: 'secondary' as const, label: 'Good', color: 'bg-blue-500' };
    if (health >= 60) return { variant: 'outline' as const, label: 'Fair', color: 'bg-yellow-500' };
    return { variant: 'destructive' as const, label: 'Needs Attention', color: 'bg-red-500' };
  };

  const InsightSection = ({ title, items, icon: Icon, color, type }: {
    title: string;
    items: string[];
    icon: any;
    color: string;
    type: 'performance' | 'security' | 'optimization' | 'anomaly' | 'trends';
  }) => {
    const getItemIcon = () => {
      switch (type) {
        case 'performance': return Activity;
        case 'security': return Shield;
        case 'optimization': return TrendingUp;
        case 'anomaly': return AlertTriangle;
        case 'trends': return BarChart3;
        default: return CheckCircle;
      }
    };

    const ItemIcon = getItemIcon();
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className={`h-5 w-5 ${color}`} />
            {title}
            <Badge variant="secondary" className="ml-2">
              {items.length} insights
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                <ItemIcon className={`h-4 w-4 mt-0.5 ${color} flex-shrink-0`} />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Auto-analyze when dialog opens
  React.useEffect(() => {
    if (isOpen && !insights && !isAnalyzing && agentData) {
      analyzeAgentData();
    }
  }, [isOpen, agentData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            {title}
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
                <h3 className="text-lg font-semibold mb-2">AI Analysis in Progress</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Analyzing agent performance, security posture, and operational efficiency...
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing agent data...</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </div>
            </div>
          ) : insights ? (
            <div className="space-y-6">
              {/* Overall Health Score */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Activity className="h-6 w-6 text-blue-600" />
                      Overall Agent Ecosystem Health
                    </div>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {insights.overallHealth}/100
                    </div>
                    <Badge variant={getHealthBadge(insights.overallHealth).variant} className="text-base px-4 py-1">
                      <div className={`w-2 h-2 rounded-full ${getHealthBadge(insights.overallHealth).color} mr-2`}></div>
                      {getHealthBadge(insights.overallHealth).label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={insights.overallHealth} className="h-3" />
                </CardContent>
              </Card>

              <Tabs defaultValue="insights" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="insights">Detailed Insights</TabsTrigger>
                  <TabsTrigger value="executive">Executive Summary</TabsTrigger>
                  <TabsTrigger value="recommendations">Action Items</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InsightSection
                      title="Performance Analysis"
                      items={insights.performanceAnalysis}
                      icon={Activity}
                      color="text-blue-600"
                      type="performance"
                    />

                    <InsightSection
                      title="Security Insights"
                      items={insights.securityInsights}
                      icon={Shield}
                      color="text-red-600"
                      type="security"
                    />

                    <InsightSection
                      title="Optimization Opportunities"
                      items={insights.optimizationSuggestions}
                      icon={TrendingUp}
                      color="text-green-600"
                      type="optimization"
                    />

                    <InsightSection
                      title="Anomaly Detection"
                      items={insights.anomalyDetection}
                      icon={AlertTriangle}
                      color="text-yellow-600"
                      type="anomaly"
                    />
                  </div>

                  {insights.trendsAnalysis.length > 0 && (
                    <InsightSection
                      title="Trends Analysis"
                      items={insights.trendsAnalysis}
                      icon={BarChart3}
                      color="text-purple-600"
                      type="trends"
                    />
                  )}
                </TabsContent>

                <TabsContent value="executive" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        Executive Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose dark:prose-invert max-w-none">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
                            Agent Ecosystem Health Report
                          </h3>
                          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {insights.executiveSummary}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Priority Action Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* High Priority */}
                        {insights.securityInsights.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              High Priority (Security)
                            </h4>
                            <div className="space-y-2">
                              {insights.securityInsights.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                                  <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Medium Priority */}
                        {insights.optimizationSuggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Medium Priority (Optimization)
                            </h4>
                            <div className="space-y-2">
                              {insights.optimizationSuggestions.slice(0, 3).map((item, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                                  <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Low Priority */}
                        {insights.performanceAnalysis.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Low Priority (Performance)
                            </h4>
                            <div className="space-y-2">
                              {insights.performanceAnalysis.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setInsights(null)}>
                  Analyze Again
                </Button>
                <Button onClick={onClose}>
                  Export Report
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No analysis data available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}