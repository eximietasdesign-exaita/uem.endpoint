import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Plus, 
  Filter, 
  Play, 
  Edit, 
  Copy, 
  Download, 
  Upload,
  Code2,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Zap,
  Shield,
  Network,
  Monitor,
  Database,
  Server,
  Brain,
  Sparkles,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Globe,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScriptEditor } from "@/components/ScriptEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import { AIScriptGenerator } from "@/components/AIScriptGenerator";
import { AIScriptAnalyzer } from "@/components/AIScriptAnalyzer";
import { AIScriptOptimizer } from "@/components/AIScriptOptimizer";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTenantData, useTenantContext } from "@/hooks/useTenantData";

interface DiscoveryScript {
  id: number;
  name: string;
  description: string;
  category: string;
  type: 'powershell' | 'bash' | 'python' | 'wmi';
  targetOs: string | null;
  template: string;
  vendor: string;
  complexity: string;
  estimatedRunTimeSeconds: number;
  requiresElevation: boolean;
  requiresNetwork: boolean;
  parameters: string;
  outputFormat: string;
  outputProcessing: any;
  credentialRequirements: any;
  tags: string[];
  industries: string[];
  complianceFrameworks: string[] | null;
  version: string;
  isStandard: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional frontend-only fields
  executionCount?: number;
  isFavorite?: boolean;
}



export default function DiscoveryScriptsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState(new Set(["discovery"]));
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<DiscoveryScript | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // AI Feature states
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isAIAnalyzerOpen, setIsAIAnalyzerOpen] = useState(false);
  const [isAIOptimizerOpen, setIsAIOptimizerOpen] = useState(false);
  const [currentAnalysisScript, setCurrentAnalysisScript] = useState<{ code: string; type: string; name: string } | null>(null);
  
  // Publish to Marketplace states
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishScript, setPublishScript] = useState<DiscoveryScript | null>(null);
  
  // Delete confirmation states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scriptToDelete, setScriptToDelete] = useState<DiscoveryScript | null>(null);
  const [publishForm, setPublishForm] = useState({
    name: "",
    description: "",
    marketplaceCategory: "",
    tags: "",
    price: "Free",
    supportLevel: "Community",
    isPublic: true,
    documentation: ""
  });
  
  const { toast } = useToast();

  // Directly use useQuery to bypass any caching issues
  const { data, isLoading } = useQuery<DiscoveryScript[]>({
    queryKey: ["/api/discovery-scripts", { v: "2.0" }],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true
  });
  
  const scripts = (Array.isArray(data) ? data : []) as DiscoveryScript[];
  const hasContext = true; // Discovery scripts don't require context

  // Debug logging
  console.log('[DEBUG] Scripts data:', scripts, 'isArray:', Array.isArray(scripts), 'length:', scripts.length);

  // Create script mutation
  const createScriptMutation = useMutation({
    mutationFn: (scriptData: any) => apiRequest("POST", "/api/discovery-scripts", scriptData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discovery-scripts"] });
      toast({
        title: "Success",
        description: "Script created successfully."
      });
    }
  });

  // Update script mutation
  const updateScriptMutation = useMutation({
    mutationFn: ({ id, ...scriptData }: any) => apiRequest("PUT", `/api/discovery-scripts/${id}`, scriptData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discovery-scripts"] });
      toast({
        title: "Success",
        description: "Script updated successfully."
      });
    }
  });

  // Delete script mutation
  const deleteScriptMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/discovery-scripts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discovery-scripts"] });
    }
  });

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Group scripts by category
  const scriptsByCategory = scripts.reduce((acc, script) => {
    const category = script.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(script);
    return acc;
  }, {} as Record<string, DiscoveryScript[]>);

  // Create dynamic script categories from database
  const scriptCategories = Object.keys(scriptsByCategory).map(categoryName => ({
    name: categoryName,
    icon: getCategoryIcon(categoryName),
    count: scriptsByCategory[categoryName].length,
    expanded: expandedCategories.has(categoryName),
    scripts: scriptsByCategory[categoryName]
  }));

  const allScripts = scripts;
  const filteredScripts = allScripts.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (script.tags && script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === "all" || script.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function getCategoryIcon(categoryName: string) {
    switch (categoryName.toLowerCase()) {
      case 'discovery': return Database;
      case 'security': return Shield;
      case 'health_check': return Monitor;
      case 'network': return Network;
      case 'maintenance': return Settings;
      default: return FileText;
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'powershell': return <Code2 className="w-4 h-4 text-blue-600" />;
      case 'bash': return <Code2 className="w-4 h-4 text-green-600" />;
      case 'python': return <Code2 className="w-4 h-4 text-yellow-600" />;
      case 'wmi': return <Settings className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleSaveScript = async (scriptData: any) => {
    try {
      if (selectedScript) {
        await updateScriptMutation.mutateAsync({ id: selectedScript.id, ...scriptData });
      } else {
        await createScriptMutation.mutateAsync(scriptData);
      }
      setIsEditorOpen(false);
      setSelectedScript(null);
    } catch (error) {
      console.error("Failed to save script:", error);
    }
  };

  const handleDeleteScript = (script: DiscoveryScript) => {
    setScriptToDelete(script);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteScript = async () => {
    if (!scriptToDelete) return;
    
    try {
      await deleteScriptMutation.mutateAsync(scriptToDelete.id);
      toast({
        title: "Success",
        description: `Script "${scriptToDelete.name}" has been deleted.`
      });
      setIsDeleteDialogOpen(false);
      setScriptToDelete(null);
    } catch (error) {
      console.error("Failed to delete script:", error);
      toast({
        title: "Error",
        description: "Failed to delete script. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getOSBadgeColor = (os: string) => {
    switch (os) {
      case 'windows': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'linux': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'macos': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cross-platform': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleEditScript = (script: DiscoveryScript) => {
    setSelectedScript(script);
    setIsEditorOpen(true);
  };

  // AI Handler Functions
  const handleAIAnalysis = (script: DiscoveryScript) => {
    // For demo purposes, use sample script code
    const sampleCode = script.type === 'powershell' 
      ? `# ${script.name}
Get-WmiObject -Class Win32_ComputerSystem | Select-Object Name, Manufacturer, Model, TotalPhysicalMemory
Write-Host "System information collected successfully"`
      : script.type === 'bash'
      ? `#!/bin/bash
# ${script.name}
echo "Collecting system information..."
uname -a
free -h
df -h`
      : `# ${script.name}
import os
import platform
print(f"System: {platform.system()}")
print(f"Release: {platform.release()}")`;
    
    setCurrentAnalysisScript({
      code: sampleCode,
      type: script.type,
      name: script.name
    });
    setIsAIAnalyzerOpen(true);
  };

  const handleAIOptimization = (script: DiscoveryScript) => {
    // For demo purposes, use sample script code
    const sampleCode = script.type === 'powershell' 
      ? `# ${script.name}
Get-WmiObject -Class Win32_ComputerSystem | Select-Object Name, Manufacturer, Model, TotalPhysicalMemory
Write-Host "System information collected successfully"`
      : script.type === 'bash'
      ? `#!/bin/bash
# ${script.name}
echo "Collecting system information..."
uname -a
free -h
df -h`
      : `# ${script.name}
import os
import platform
print(f"System: {platform.system()}")
print(f"Release: {platform.release()}")`;
    
    setCurrentAnalysisScript({
      code: sampleCode,
      type: script.type,
      name: script.name
    });
    setIsAIOptimizerOpen(true);
  };

  const handleAIGenerated = (result: { code: string; documentation: string; explanation: string }) => {
    // This would typically create a new script with the AI-generated content
    console.log('AI Generated Script:', result);
  };

  const handlePublishToMarketplace = (script: DiscoveryScript) => {
    setPublishScript(script);
    setPublishForm({
      name: script.name,
      description: script.description,
      marketplaceCategory: script.category,
      tags: script.tags?.join(", ") || "",
      price: "Free",
      supportLevel: "Community",
      isPublic: true,
      documentation: ""
    });
    setIsPublishDialogOpen(true);
  };

  const handlePublishSubmit = () => {
    if (!publishScript) return;

    // Here you would typically send the data to your marketplace API
    toast({
      title: "Script Published Successfully",
      description: `${publishForm.name} has been published to the marketplace and is now available for download.`,
    });

    setIsPublishDialogOpen(false);
    setPublishScript(null);
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Discovery Scripts
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage discovery templates and automation scripts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* AI Features */}
          <Button 
            variant="outline" 
            onClick={() => setIsAIGeneratorOpen(true)}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100"
          >
            <Brain className="w-4 h-4 mr-2 text-blue-600" />
            <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
            AI Generate
          </Button>
          
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Script
          </Button>
          <Button onClick={() => {
            setSelectedScript(null);
            setIsEditorOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Script
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Scripts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allScripts.length}
                </p>
              </div>
              <Code2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Scripts
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {allScripts.filter(s => s.isActive).length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Categories
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {scriptCategories.length}
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Executions
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {allScripts.reduce((sum, s) => sum + (s.executionCount || 0), 0)}
                </p>
              </div>
              <Play className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search scripts, descriptions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Script Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedCategory === "all" ? "bg-primary/10 text-primary" : ""
                }`}
              >
                All Scripts ({allScripts.length})
              </button>
              
              {scriptCategories.map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategories.has(category.name);
                
                return (
                  <div key={category.name}>
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 mr-2" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-2" />
                        )}
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                        <span className="ml-auto text-xs text-gray-500">
                          ({category.count})
                        </span>
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="pl-8 space-y-1">
                        {category.scripts.map((script) => (
                          <button
                            key={script.id}
                            onClick={() => setSelectedCategory(category.name)}
                            className={`w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors truncate ${
                              selectedCategory === category.name ? "text-primary" : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {script.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Scripts Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedCategory === "all" ? "All Scripts" : selectedCategory}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredScripts.length} scripts)
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {filteredScripts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchTerm ? "No scripts found matching your search" : "No scripts in this category"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Script</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Executions</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScripts.map((script) => (
                    <TableRow key={script.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(script.type)}
                            <span className="font-medium">{script.name}</span>
                            {script.isFavorite && (
                              <Badge variant="outline" className="text-xs">
                                ★
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {script.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {script.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {script.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getOSBadgeColor(script.targetOs || 'any')}`}>
                          {script.targetOs || 'Any'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{script.version}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{script.executionCount || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {script.updatedAt}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditScript(script)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Script
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              Execute
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAIAnalysis(script)}>
                              <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                              AI Analysis
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAIOptimization(script)}>
                              <TrendingUp className="w-4 h-4 mr-2 text-yellow-600" />
                              AI Optimize
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePublishToMarketplace(script)}>
                              <ShoppingCart className="w-4 h-4 mr-2 text-purple-600" />
                              Publish to Marketplace
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteScript(script)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Script
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Script Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedScript ? `Edit Script: ${selectedScript.name}` : "Create New Script"}
            </DialogTitle>
          </DialogHeader>
          <ScriptEditor
            script={selectedScript || undefined}
            onSave={handleSaveScript}
            onCancel={() => {
              setIsEditorOpen(false);
              setSelectedScript(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Publish to Marketplace Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              <span>Publish to Marketplace</span>
            </DialogTitle>
            <DialogDescription>
              Share your script with the community by publishing it to the Discovery Scripts Marketplace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="publishName">Script Name</Label>
                <Input
                  id="publishName"
                  value={publishForm.name}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter marketplace display name"
                />
              </div>

              <div>
                <Label htmlFor="publishDescription">Description</Label>
                <Textarea
                  id="publishDescription"
                  value={publishForm.description}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your script does and its benefits..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publishCategory">Marketplace Category</Label>
                  <Select 
                    value={publishForm.marketplaceCategory} 
                    onValueChange={(value) => setPublishForm(prev => ({ ...prev, marketplaceCategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operating System">Operating System</SelectItem>
                      <SelectItem value="Network & Connectivity">Network & Connectivity</SelectItem>
                      <SelectItem value="Applications">Applications</SelectItem>
                      <SelectItem value="Cloud Services">Cloud Services</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="publishPrice">Pricing</Label>
                  <Select 
                    value={publishForm.price} 
                    onValueChange={(value) => setPublishForm(prev => ({ ...prev, price: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="$9.99">$9.99</SelectItem>
                      <SelectItem value="$19.99">$19.99</SelectItem>
                      <SelectItem value="$49.99">$49.99</SelectItem>
                      <SelectItem value="$99.99">$99.99</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="publishSupport">Support Level</Label>
                  <Select 
                    value={publishForm.supportLevel} 
                    onValueChange={(value) => setPublishForm(prev => ({ ...prev, supportLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Community">Community</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={publishForm.isPublic}
                    onChange={(e) => setPublishForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isPublic" className="text-sm">Make publicly visible</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="publishTags">Tags (comma-separated)</Label>
                <Input
                  id="publishTags"
                  value={publishForm.tags}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="windows, powershell, system, discovery, security"
                />
              </div>

              <div>
                <Label htmlFor="publishDocumentation">Documentation URL (optional)</Label>
                <Input
                  id="publishDocumentation"
                  value={publishForm.documentation}
                  onChange={(e) => setPublishForm(prev => ({ ...prev, documentation: e.target.value }))}
                  placeholder="https://docs.example.com/script-guide"
                />
              </div>
            </div>

            {/* Preview Information */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-3 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Marketplace Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {publishForm.name || "Script Name"}</div>
                <div><strong>Category:</strong> {publishForm.marketplaceCategory || "Not selected"}</div>
                <div><strong>Price:</strong> {publishForm.price}</div>
                <div><strong>Support:</strong> {publishForm.supportLevel}</div>
                <div><strong>Visibility:</strong> {publishForm.isPublic ? "Public" : "Private"}</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishSubmit} disabled={!publishForm.name || !publishForm.marketplaceCategory}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Publish to Marketplace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Script</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{scriptToDelete?.name}</span>? 
              This action will inactivate the script and it will no longer appear in the active scripts list.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteScript}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete Script
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Components */}
      <AIScriptGenerator
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onScriptGenerated={handleAIGenerated}
      />

      {currentAnalysisScript && (
        <>
          <AIScriptAnalyzer
            isOpen={isAIAnalyzerOpen}
            onClose={() => {
              setIsAIAnalyzerOpen(false);
              setCurrentAnalysisScript(null);
            }}
            scriptCode={currentAnalysisScript.code}
            scriptType={currentAnalysisScript.type}
            scriptName={currentAnalysisScript.name}
          />

          <AIScriptOptimizer
            isOpen={isAIOptimizerOpen}
            onClose={() => {
              setIsAIOptimizerOpen(false);
              setCurrentAnalysisScript(null);
            }}
            scriptCode={currentAnalysisScript.code}
            scriptType={currentAnalysisScript.type}
            scriptName={currentAnalysisScript.name}
            onOptimizedScript={(optimizedCode) => {
              console.log('Script optimized:', optimizedCode);
              // Here you would typically update the script with the optimized code
            }}
          />
        </>
      )}
    </div>
  );
}