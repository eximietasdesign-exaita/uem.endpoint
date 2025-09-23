import React, { useState } from 'react';
import { BarChart3, Shield, Zap, FileText, CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ScriptAnalysisResult {
  quality: number;
  security: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  performance: {
    score: number;
    suggestions: string[];
  };
  maintainability: {
    score: number;
    improvements: string[];
  };
  documentation: {
    completeness: number;
    suggestions: string[];
  };
  overallRecommendations: string[];
}

interface AIScriptAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  scriptCode: string;
  scriptType: string;
  scriptName?: string;
}

export function AIScriptAnalyzer({ isOpen, onClose, scriptCode, scriptType, scriptName }: AIScriptAnalyzerProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ScriptAnalysisResult | null>(null);

  const analyzeScript = async () => {
    if (!scriptCode.trim()) {
      toast({
        title: "No Script Content",
        description: "Please provide script code to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await apiRequest('/api/ai/scripts/analyze', {
        method: 'POST',
        body: JSON.stringify({
          scriptCode,
          scriptType
        })
      });

      setAnalysis(result);
      
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your script and provided insights",
      });
    } catch (error) {
      console.error('Script analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return { variant: 'default' as const, label: 'Excellent', color: 'bg-green-500' };
    if (score >= 3.5) return { variant: 'secondary' as const, label: 'Good', color: 'bg-blue-500' };
    if (score >= 2.5) return { variant: 'outline' as const, label: 'Fair', color: 'bg-yellow-500' };
    return { variant: 'destructive' as const, label: 'Needs Work', color: 'bg-red-500' };
  };

  const ScoreSection = ({ title, score, icon: Icon, items, type }: {
    title: string;
    score: number;
    icon: any;
    items: string[];
    type: 'issues' | 'suggestions' | 'improvements' | 'recommendations';
  }) => {
    const badge = getScoreBadge(score);
    const itemIcon = type === 'issues' ? XCircle : 
                    type === 'suggestions' ? TrendingUp :
                    type === 'improvements' ? CheckCircle : AlertTriangle;
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
            </CardTitle>
            <Badge variant={badge.variant} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${badge.color}`}></div>
              {badge.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={score * 20} className="flex-1" />
            <span className={`font-bold ${getScoreColor(score)}`}>
              {score.toFixed(1)}/5.0
            </span>
          </div>
        </CardHeader>
        {items.length > 0 && (
          <CardContent>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <itemIcon className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            AI Script Analysis
            {scriptName && <span className="text-gray-500">- {scriptName}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!analysis ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium mb-2">What will be analyzed:</h3>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Code quality and structure</li>
                  <li>• Security vulnerabilities and best practices</li>
                  <li>• Performance optimization opportunities</li>
                  <li>• Code maintainability and readability</li>
                  <li>• Documentation completeness</li>
                  <li>• Enterprise compliance standards</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={analyzeScript} 
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Quality Score */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      Overall Quality Score
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {analysis.quality.toFixed(1)}/5.0
                    </div>
                    <Badge variant={getScoreBadge(analysis.quality).variant} className="mt-2">
                      {getScoreBadge(analysis.quality).label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Detailed Analysis Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScoreSection
                  title="Security Analysis"
                  score={analysis.security.score}
                  icon={Shield}
                  items={[...analysis.security.issues, ...analysis.security.recommendations]}
                  type="issues"
                />

                <ScoreSection
                  title="Performance"
                  score={analysis.performance.score}
                  icon={Zap}
                  items={analysis.performance.suggestions}
                  type="suggestions"
                />

                <ScoreSection
                  title="Maintainability"
                  score={analysis.maintainability.score}
                  icon={CheckCircle}
                  items={analysis.maintainability.improvements}
                  type="improvements"
                />

                <ScoreSection
                  title="Documentation"
                  score={analysis.documentation.completeness}
                  icon={FileText}
                  items={analysis.documentation.suggestions}
                  type="suggestions"
                />
              </div>

              {/* Overall Recommendations */}
              {analysis.overallRecommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Top Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.overallRecommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setAnalysis(null)}>
                  Analyze Again
                </Button>
                <Button onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}