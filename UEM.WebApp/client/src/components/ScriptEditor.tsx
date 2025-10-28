import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DomainTenantTree } from "@/components/DomainTenantTree";
import { 
  Globe,
  ChevronDown,
  ChevronRight,
  Building2,
  Search
} from "lucide-react";
import {
  Save,
  X,
  Play,
  Copy,
  Download,
  Upload,
  Code2,
  FileText,
  Settings,
  Zap,
  Shield,
  Network,
  Monitor,
  Database,
  Server,
  Command,
  Terminal,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Lightbulb,
  GitBranch,
  Users,
  Activity,
  BarChart3,
  Loader2,
  RefreshCw,
  BookOpen,
  Sparkles,
  Target,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

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

interface ScriptEditorProps {
  script?: DiscoveryScript;
  onSave: (scriptData: any) => void;
  onCancel: () => void;
}

const scriptTypes = [
  { value: 'powershell', label: 'PowerShell', icon: Command, description: 'Windows PowerShell script' },
  { value: 'bash', label: 'Bash', icon: Terminal, description: 'Linux/Unix shell script' },
  { value: 'python', label: 'Python', icon: Code2, description: 'Cross-platform Python script' },
  { value: 'wmi', label: 'WMI Query', icon: Database, description: 'Windows Management Instrumentation' }
];

const osTargets = [
  { value: 'windows', label: 'Windows', icon: Monitor },
  { value: 'linux', label: 'Linux', icon: Terminal },
  { value: 'macos', label: 'macOS', icon: Monitor },
  { value: 'cross-platform', label: 'Cross-Platform', icon: Network }
];

const categories = [
  'Hardware Discovery',
  'Software Discovery',
  'Network Discovery',
  'Security Discovery',
  'Services Discovery',
  'Process Discovery',
  'Event Log Discovery',
  'Registry Discovery',
  'User Account Discovery',
  'Performance Discovery',
  'System Discovery',
  'Custom Discovery'
];

const complexityLevels = [
  { value: 'low', label: 'Low', description: 'Simple scripts with minimal dependencies', color: 'green' },
  { value: 'medium', label: 'Medium', description: 'Moderate complexity with some dependencies', color: 'yellow' },
  { value: 'high', label: 'High', description: 'Complex scripts requiring elevated permissions', color: 'red' }
];

const industryOptions = [
  'Healthcare', 'Finance', 'Government', 'Education', 'Manufacturing',
  'Retail', 'Technology', 'Energy', 'Transportation', 'General'
];

const complianceFrameworks = [
  'SOX', 'HIPAA', 'ISO 27001', 'NIST', 'PCI DSS', 'GDPR', 'FedRAMP', 'FISMA'
];

function getCodeTemplate(type: string, os: string): string {
  if (type === 'powershell') {
    return `# PowerShell Discovery Script
# Description: Add your description here

$ErrorActionPreference = "Stop"

try {
    # Your discovery logic here
    $result = Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, TotalPhysicalMemory
    
    # Output results in JSON format for consistent parsing
    $output = @{
        Status = "Success"
        Data = $result
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    Write-Output ($output | ConvertTo-Json -Depth 3)
}
catch {
    $errorOutput = @{
        Status = "Error"
        Message = $_.Exception.Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    Write-Output ($errorOutput | ConvertTo-Json -Depth 3)
    exit 1
}`;
  } else if (type === 'bash') {
    return `#!/bin/bash
# Bash Discovery Script
# Description: Add your description here

set -euo pipefail

# Your discovery logic here
hostname=$(hostname)
kernel=$(uname -r)
memory=$(free -h | grep '^Mem:' | awk '{print $2}')

# Output results in JSON format
cat << EOF
{
  "Status": "Success",
  "Data": {
    "Hostname": "$hostname",
    "Kernel": "$kernel",
    "Memory": "$memory"
  },
  "Timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF`;
  } else if (type === 'python') {
    return `#!/usr/bin/env python3
"""
Python Discovery Script
Description: Add your description here
"""

import json
import platform
import datetime

def main():
    try:
        # Your discovery logic here
        result = {
            "Hostname": platform.node(),
            "System": platform.system(),
            "Release": platform.release(),
            "Processor": platform.processor()
        }
        
        output = {
            "Status": "Success",
            "Data": result,
            "Timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        
        print(json.dumps(output, indent=2))
        
    except Exception as e:
        error_output = {
            "Status": "Error",
            "Message": str(e),
            "Timestamp": datetime.datetime.utcnow().isoformat() + "Z"
        }
        
        print(json.dumps(error_output, indent=2))
        exit(1)

if __name__ == "__main__":
    main()`;
  }

  return "// Add your script code here";
}

export function ScriptEditor({ script, onSave, onCancel }: ScriptEditorProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: script?.name || '',
    description: script?.description || '',
    category: script?.category || 'System Discovery',
    type: (script?.type as 'powershell' | 'bash' | 'python' | 'wmi') || 'powershell',
    os: script?.targetOs || 'windows',
    version: script?.version || '1.0',
    isActive: script?.isActive ?? true,
    tags: Array.isArray(script?.tags) ? script.tags.join(', ') : (script?.tags || ''),
    vendor: script?.vendor || 'Custom',
    complexity: script?.complexity || 'medium',
    estimatedRunTime: script?.estimatedRunTimeSeconds || 30,
    requiresElevation: script?.requiresElevation || false,
    requiresNetwork: script?.requiresNetwork || false,
    industries: Array.isArray(script?.industries) ? script.industries : (script?.industries || []),
    complianceFrameworks: Array.isArray(script?.complianceFrameworks) ? script.complianceFrameworks : (script?.complianceFrameworks || []),
    code: script?.template || ''
  });

  // Fix: Initialize domain/tenant selection from existing script data
  const [domainTenantSelection, setDomainTenantSelection] = useState<{ domainId: number | null; tenantId: number | null }>(() => {
    if (script) {
      try {
        // Try to get domain/tenant selection from the script's parameters
        if (script.parameters) {
          const params = typeof script.parameters === 'string'
            ? JSON.parse(script.parameters)
            : script.parameters;

          if (params.domainTenantSelection) {
            return {
              domainId: params.domainTenantSelection.domainId || null,
              tenantId: params.domainTenantSelection.tenantId || null
            };
          }
        }

        // Fallback to direct fields if they exist on the script object
        return {
          domainId: (script as any).domainId || null,
          tenantId: (script as any).tenantId || null
        };
      } catch (error) {
        console.warn('Failed to parse domain/tenant selection from script:', error);
      }
    }

    // Default to no selection for new scripts
    return {
      domainId: null,
      tenantId: null
    };
  });

  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'processing' | 'test' | 'enterprise'>('config');
  const [isDirty, setIsDirty] = useState(false);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);

  // Enhanced Output Processing Rules
  interface OutputRule {
    id: number;
    name: string;
    type: 'json_path' | 'regex' | 'transform' | string;
    pattern: string;
    action?: string;
    target: string;
    enabled: boolean;
    priority?: number;
    [key: string]: any;
  }

  const [outputRules, setOutputRules] = useState<OutputRule[]>(() => {
    if (script) {
      try {
        // First try to parse from the dedicated outputProcessing field
        if (script.outputProcessing) {
          const rules = typeof script.outputProcessing === 'string'
            ? JSON.parse(script.outputProcessing)
            : script.outputProcessing;
          if (Array.isArray(rules) && rules.length > 0) return rules as OutputRule[];
        }
        // Fallback to the parameters field for older scripts
        if (script.parameters) {
          const params = JSON.parse(script.parameters);
          if (Array.isArray(params.outputRules) && params.outputRules.length > 0) {
            return params.outputRules as OutputRule[];
          }
        }
      } catch (error) {
        console.warn("Could not parse existing output rules.", error);
      }
    }
    // Return default rules if creating a new script or if parsing fails
    return [{ id: 1, name: 'Default Rule', type: 'json_path', pattern: '$.Data', action: 'extract', target: 'default_output', enabled: true, priority: 1 }];
  });

  // Enterprise features state
  const [approvalWorkflow, setApprovalWorkflow] = useState({
    enabled: false,
    approvers: [] as string[],
    requiresTwoApprovals: false
  });

  const [versionControl, setVersionControl] = useState({
    enabled: true,
    autoIncrement: true,
    changeDescription: ''
  });

  const [auditSettings, setAuditSettings] = useState({
    enabled: true,
    logExecutions: true,
    logChanges: true
  });

  const selectedScriptType = scriptTypes.find(t => t.value === formData.type);
  const selectedOS = osTargets.find(o => o.value === formData.os);
  const selectedComplexity = complexityLevels.find(c => c.value === formData.complexity);

  // Fetch available templates
  // Fix the templates query - missing await
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/discovery-scripts/templates'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/discovery-scripts/templates');
      return response.json();
    }
  });


  // Update the validation mutation in ScriptEditor.tsx
  const validateMutation = useMutation({
    mutationFn: async (scriptId: number) => {
      const response = await apiRequest('POST', `/api/discovery-scripts/${scriptId}/validate`, {
        ValidateSyntax: true,
        ValidateSecurity: true,
        ValidatePerformance: true
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Validation response:', data); // Debug log to see actual structure

      // Handle different possible response structures
      let overallStatus = 'Unknown';
      let results = [];

      if (data) {
        overallStatus = data.OverallStatus ||
          data.overallStatus ||
          data.Status ||
          data.status ||
          (typeof data.IsValid === 'boolean' ? (data.IsValid ? 'Pass' : 'Fail') : undefined) ||
          'Unknown';

        // Try different possible property names for results
        results = data.Results ||
          data.results ||
          data.ValidationResults ||
          data.validationResults ||
          [];

        // If no explicit overall status, derive it from results
        if (overallStatus === 'Unknown' && Array.isArray(results)) {
          const hasErrors = results.some(r => r.Status === 'Fail' || r.status === 'Fail' || r.Status === 'Error' || r.status === 'Error');
          const hasWarnings = results.some(r => r.Status === 'Warning' || r.status === 'Warning');

          if (hasErrors) {
            overallStatus = 'Fail';
          } else if (hasWarnings) {
            overallStatus = 'Warning';
          } else if (results.length > 0) {
            overallStatus = 'Pass';
          }
        }
      }

      setValidationResults(results);

      toast({
        title: "Validation Complete",
        description: `Overall status: ${overallStatus}`,
        variant: overallStatus === 'Pass' ? 'default' : 'destructive'
      });
    },
    onError: (error) => {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Unable to validate script. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Also update the test mutation for consistency
  const testMutation = useMutation({
    mutationFn: async (scriptId: number) => {
      const response = await apiRequest('POST', `/api/discovery-scripts/${scriptId}/test`, {
        TestEnvironment: 'sandbox',
        TimeoutSeconds: 30
      });
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Test response:', data); // Debug log to see actual structure

      // Handle different possible response structures
      let status = 'Unknown';
      if (data) {
        status = data.Status ||
          data.status ||
          data.ExecutionStatus ||
          data.executionStatus ||
          (data.Success ? 'Success' : 'Failed') ||
          'Unknown';
      }

      setTestResults(data);

      toast({
        title: "Test Complete",
        description: `Execution status: ${status}`,
        variant: status === 'Success' ? 'default' : 'destructive'
      });
    },
    onError: (error) => {
      console.error('Test error:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unable to execute test. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add search state for script domain/tenant selection
  const [scriptDomainTenantSearchQuery, setScriptDomainTenantSearchQuery] = useState('');

  // Fetch domains and tenants specifically for script editor (isolated from header)
    const { data: scriptDomains = [], isLoading: scriptDomainsLoading } = useQuery({
      queryKey: ['script-editor-domains'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/domains');
        try {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        } catch (err) {
          console.error('Failed to parse domains JSON', err);
          return [];
        }
      },
      staleTime: 5 * 60 * 1000,
    });
  
    const { data: scriptTenants = [], isLoading: scriptTenantsLoading } = useQuery({
      queryKey: ['script-editor-tenants'],
      queryFn: async () => {
        const response = await apiRequest('GET', '/api/tenants');
        try {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        } catch (err) {
          console.error('Failed to parse tenants JSON', err);
          return [];
        }
      },
      staleTime: 5 * 60 * 1000,
    });

  useEffect(() => {
    setIsDirty(true);
  }, [formData, outputRules]);

  useEffect(() => {
    if (!formData.code && formData.type && formData.os) {
      const boilerplate = getCodeTemplate(formData.type, formData.os);
      setFormData(prev => ({ ...prev, code: boilerplate }));
    }
  }, [formData.type, formData.os]); // Remove formData.code dependency to prevent infinite loop

  const loadTemplate = (template: any) => {
    try {
      setFormData(prev => ({
        ...prev,
        code: template.template || '',
        category: template.category || prev.category,
        type: template.type || prev.type,
        os: template.targetOs || prev.os
      }));
      toast({
        title: "Template Loaded",
        description: `${template.name} template has been applied.`
      });
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Template Load Failed",
        description: "Failed to load the selected template.",
        variant: "destructive"
      });
    }
  };

  const handleValidate = () => {
    if (script?.id) {
      setIsValidating(true);
      validateMutation.mutate(script.id, {
        onSettled: () => setIsValidating(false)
      });
    } else {
      toast({
        title: "Save Required",
        description: "Please save the script before validating.",
        variant: "destructive"
      });
    }
  };

  const handleTest = () => {
    if (script?.id) {
      setIsTesting(true);
      testMutation.mutate(script.id, {
        onSettled: () => setIsTesting(false)
      });
    } else {
      toast({
        title: "Save Required",
        description: "Please save the script before testing.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowUnsavedChangesDialog(true);
    } else {
      onCancel();
    }
  };

  // Enhanced rule management functions
  const updateOutputRule = (ruleId: number, updates: any) => {
    setOutputRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
    setIsDirty(true); // Mark as dirty when rules change
  };

  const addOutputRule = () => {
    const newRule = {
      id: Math.max(...outputRules.map(r => r.id), 0) + 1,
      name: `Rule ${outputRules.length + 1}`,
      type: 'json_path',
      pattern: '$.Data',
      action: 'extract',
      target: `output_field_${outputRules.length + 1}`,
      enabled: true,
      priority: outputRules.length + 1
    };
    setOutputRules(prev => [...prev, newRule]);
    setIsDirty(true); // Mark as dirty when adding rules

    toast({
      title: "Rule Added",
      description: "New output processing rule added. Don't forget to save your changes."
    });
  };

  const removeOutputRule = (ruleId: number) => {
    setOutputRules(prev => prev.filter(rule => rule.id !== ruleId));
    setIsDirty(true); // Mark as dirty when removing rules

    toast({
      title: "Rule Removed",
      description: "Output processing rule removed. Don't forget to save your changes."
    });
  };

  const validateRules = () => {
    const invalidRules = outputRules.filter(rule =>
      !rule.name?.trim() ||
      !rule.pattern?.trim() ||
      !rule.target?.trim()
    );

    if (invalidRules.length > 0) {
      toast({
        title: "Validation Failed",
        description: `${invalidRules.length} rule(s) have missing required fields.`,
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Rules Validated",
      description: "All output processing rules are valid."
    });
    return true;
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Script name is required.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.code?.trim()) {
      toast({
        title: "Validation Error",
        description: "Script code cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    // Validate output rules
    const validRules = outputRules.filter(rule =>
      rule.name?.trim() &&
      rule.pattern?.trim() &&
      rule.target?.trim()
    );

    if (outputRules.length > 0 && validRules.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please complete or remove invalid output processing rules.",
        variant: "destructive"
      });
      return;
    }

    console.log('Saving script with output rules and domain/tenant selection:', {
      validRules,
      domainTenantSelection
    });

    const scriptPayload = {
      Name: formData.name.trim(),
      Description: formData.description?.trim() || "",
      Category: formData.category,
      Type: formData.type,
      TargetOs: formData.os,
      Template: formData.code.trim(),
      Version: formData.version || "1.0",
      IsActive: formData.isActive,
      Tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      Industries: formData.industries || [],
      ComplianceFrameworks: formData.complianceFrameworks || [],
      Vendor: formData.vendor || "Custom",
      Complexity: formData.complexity || "medium",
      EstimatedRunTimeSeconds: parseInt(formData.estimatedRunTime.toString()) || 30,
      RequiresElevation: formData.requiresElevation,
      RequiresNetwork: formData.requiresNetwork,
      IsStandard: false,
      DomainId: domainTenantSelection.domainId,
      TenantId: domainTenantSelection.tenantId,

      // Enhanced parameters with proper domain/tenant selection persistence
      Parameters: JSON.stringify({
        outputRules: validRules,
        approvalWorkflow: approvalWorkflow,
        auditSettings: auditSettings,
        versionControl: versionControl,
        domainTenantSelection: domainTenantSelection // Add this line to persist selection
      }),

      // Save output processing rules in both fields for compatibility
      OutputFormat: "json",
      OutputProcessing: JSON.stringify(validRules),
      CredentialRequirements: JSON.stringify({})
    };

    // If updating, add the ID to the payload
    const finalPayload = script?.id ? { ...scriptPayload, Id: script.id } : scriptPayload;

    console.log('Final payload being sent to API:', finalPayload);

    try {
      await onSave(finalPayload);
      setIsDirty(false);

      toast({
        title: "Script Saved",
        description: `Script saved successfully with ${validRules.length} output processing rules${domainTenantSelection.domainId ? ` for domain ${domainTenantSelection.domainId}` : ''
          }${domainTenantSelection.tenantId ? ` and tenant ${domainTenantSelection.tenantId}` : ''}.`,
      });
    } catch (error) {
      console.error("Save error details:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save script. Please check the console for details.",
        variant: "destructive"
      });
    }
  };

  // Add debugging effect to track domain/tenant selection changes
  useEffect(() => {
    console.log('Domain/Tenant selection changed:', domainTenantSelection);
    setIsDirty(true);
  }, [domainTenantSelection]);

  // Enhanced rule management functions

  // Watch for changes in output rules to mark as dirty
  useEffect(() => {
    if (outputRules.length > 0) {
      setIsDirty(true);
    }
  }, [outputRules]);

  const generateBoilerplate = () => {
    const boilerplate = getCodeTemplate(formData.type, formData.os);
    setFormData(prev => ({ ...prev, code: boilerplate }));
    toast({
      title: "Boilerplate Generated",
      description: "Basic script template has been generated."
    });
  };

  // Isolated Domain/Tenant Tree Component for Script Editor
  const ScriptDomainTenantTree = React.memo(function ScriptDomainTenantTree({
    value,
    onChange,
    domains,
    tenants,
    searchQuery = ""
  }: {
    value: { domainId: number | null; tenantId: number | null; domain?: any; tenant?: any };
    onChange: (selection: { domainId: number | null; tenantId: number | null; domain?: any; tenant?: any }) => void;
    domains: any[];
    tenants: any[];
    searchQuery?: string;
  }) {
    const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set());

    // Helper functions
    const getDisplayName = useCallback((item: any) => {
      return item.displayname || item.name || `Item ${item.id}`;
    }, []);

    const getTenantsForDomain = useCallback((domainId: number) => {
      return tenants.filter(t => t.domainid === domainId);
    }, [tenants]);

    const matchesSearch = useCallback((text: string, query: string) => {
      return text.toLowerCase().includes(query.toLowerCase());
    }, []);

    // Filter domains and tenants based on search
    const filteredData = useMemo(() => {
      const query = searchQuery.trim();

      if (!query) {
        return domains.map(domain => ({
          domain,
          tenants: getTenantsForDomain(domain.id),
          matches: false,
          hasMatchingTenants: false
        }));
      }

      return domains.map(domain => {
        const domainName = getDisplayName(domain);
        const domainMatches = matchesSearch(domainName, query) || 
                             matchesSearch(domain.description || '', query) ||
                             matchesSearch(domain.id.toString(), query);

        const domainTenants = getTenantsForDomain(domain.id);
        const matchingTenants = domainTenants.filter(tenant => {
          const tenantName = getDisplayName(tenant);
          return matchesSearch(tenantName, query) ||
                 matchesSearch(tenant.description || '', query) ||
                 matchesSearch(tenant.id.toString(), query);
        });

        if (domainMatches || matchingTenants.length > 0) {
          return {
            domain,
            tenants: matchingTenants,
            matches: domainMatches,
            hasMatchingTenants: matchingTenants.length > 0
          };
        }
        return null;
      }).filter(Boolean);
    }, [searchQuery, domains, tenants, getDisplayName, getTenantsForDomain, matchesSearch]);

    // Auto-expand domains with matching tenants
    useEffect(() => {
      if (searchQuery.trim()) {
        const domainsToExpand = new Set<number>();
        filteredData.forEach(item => {
          if (item && item.hasMatchingTenants) {
            domainsToExpand.add(item.domain.id);
          }
        });
        setExpandedDomains(domainsToExpand);
      }
    }, [searchQuery, filteredData]);

    // Auto-expand selected domain
    useEffect(() => {
      if (value.domainId) {
        setExpandedDomains(prev => {
          const next = new Set(prev);
          next.add(value.domainId!);
          return next;
        });
      }
    }, [value.domainId]);

    const toggleDomain = (domainId: number) => {
      setExpandedDomains(prev => {
        const next = new Set(prev);
        if (next.has(domainId)) {
          next.delete(domainId);
        } else {
          next.add(domainId);
        }
        return next;
      });
    };

    const handleDomainSelect = (domain: any) => {
      onChange({
        domainId: domain.id,
        tenantId: null,
        domain: domain,
        tenant: null
      });
    };

    const handleTenantSelect = (domain: any, tenant: any) => {
      onChange({
        domainId: domain.id,
        tenantId: tenant.id,
        domain: domain,
        tenant: tenant
      });
    };

    const highlightText = (text: string, query: string) => {
      if (!query.trim()) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.split(regex).map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
            {part}
          </mark>
        ) : part
      );
    };

    if (domains.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No domains available</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {filteredData.length === 0 && searchQuery.trim() ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No results found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredData.map((item) => {
              if (!item) return null;
              
              const { domain, tenants: domainTenants } = item;
              const isExpanded = expandedDomains.has(domain.id);
              const isDomainSelected = value.domainId === domain.id && !value.tenantId;
              const hasTenantSelected = value.tenantId && domainTenants.some(t => t.id === value.tenantId);
              const isDomainHighlighted = isDomainSelected || hasTenantSelected;

              return (
                <div key={domain.id}>
                  {/* Domain Row */}
                  <div
                    className={`flex items-center space-x-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors ${
                      isDomainHighlighted && 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                    }`}
                    onClick={() => handleDomainSelect(domain)}
                  >
                    {domainTenants.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDomain(domain.id);
                        }}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    )}
                    {domainTenants.length === 0 && <div className="w-5" />}

                    <Globe className={`w-4 h-4 ${
                      isDomainHighlighted ? "text-blue-600 dark:text-blue-400" : "text-blue-600 dark:text-blue-400"
                    }`} />

                    <span className={`flex-1 text-sm font-medium ${
                      isDomainHighlighted ? "text-blue-900 dark:text-blue-100" : "text-gray-900 dark:text-gray-100"
                    }`}>
                      {searchQuery ? highlightText(getDisplayName(domain), searchQuery) : getDisplayName(domain)}
                    </span>

                    {domainTenants.length > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isDomainHighlighted 
                          ? 'text-blue-700 bg-blue-100 dark:bg-blue-800 dark:text-blue-200' 
                          : 'text-gray-500 bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {domainTenants.length} {domainTenants.length === 1 ? 'tenant' : 'tenants'}
                      </span>
                    )}

                    {isDomainSelected && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                  </div>

                  {/* Tenants */}
                  {isExpanded && domainTenants.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900/50">
                      {domainTenants.map((tenant) => {
                        const isTenantSelected = value.domainId === domain.id && value.tenantId === tenant.id;
                        
                        return (
                          <div
                            key={tenant.id}
                            className={`flex items-center space-x-2 p-3 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                              isTenantSelected && 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 border-l-offset-8'
                            }`}
                            onClick={() => handleTenantSelect(domain, tenant)}
                          >
                            <Users className={`w-3.5 h-3.5 ${
                              isTenantSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                            }`} />

                            <span className={`text-sm flex-1 ${
                              isTenantSelected ? "text-blue-900 dark:text-blue-100 font-medium" : "text-gray-700 dark:text-gray-300"
                            }`}>
                              {searchQuery ? highlightText(getDisplayName(tenant), searchQuery) : getDisplayName(tenant)}
                            </span>

                            {isTenantSelected && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="flex flex-col bg-white dark:bg-gray-950 h-full">
      {/* Header (flex-shrink-0 is correct, it prevents this div from shrinking) */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {selectedScriptType && <selectedScriptType.icon className="w-6 h-6 text-primary" />}
            <div>
              <h2 className="text-xl font-semibold">
                {script ? `Edit Script: ${script.name}` : 'Create New Script'}
              </h2>
              <p className="text-sm text-gray-500">Enterprise-grade discovery script management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isDirty && (
            <Badge variant="secondary" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          <Badge variant="outline">v{formData.version}</Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'config'
            ? 'border-primary text-primary bg-white dark:bg-gray-950'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'code'
            ? 'border-primary text-primary bg-white dark:bg-gray-950'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Code2 className="w-4 h-4 inline mr-2" />
          Script Code
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'processing'
            ? 'border-primary text-primary bg-white dark:bg-gray-950'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Output Processing
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'test'
            ? 'border-primary text-primary bg-white dark:bg-gray-950'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Play className="w-4 h-4 inline mr-2" />
          Test & Validate
        </button>
        <button
          onClick={() => setActiveTab('enterprise')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'enterprise'
            ? 'border-primary text-primary bg-white dark:bg-gray-950'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Enterprise Features
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'config' && (
          <div className="space-y-8 max-w-4xl">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Script Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter script name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="1.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this script does and its purpose"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Script Type & Platform */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>Platform & Type</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Script Type</Label>
                    <Select value={formData.type} onValueChange={(value: 'powershell' | 'bash' | 'python' | 'wmi') => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scriptTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <type.icon className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="os">Target Operating System</Label>
                    <Select value={formData.os} onValueChange={(value) => setFormData(prev => ({ ...prev, os: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {osTargets.map((os) => (
                          <SelectItem key={os.value} value={os.value}>
                            <div className="flex items-center space-x-2">
                              <os.icon className="w-4 h-4" />
                              <span>{os.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Advanced Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                      placeholder="Custom, Microsoft, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complexity">Complexity Level</Label>
                    <Select value={formData.complexity} onValueChange={(value) => setFormData(prev => ({ ...prev, complexity: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {complexityLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center space-x-2">
                              <Badge variant={level.color === 'green' ? 'default' : level.color === 'yellow' ? 'secondary' : 'destructive'}>
                                {level.label}
                              </Badge>
                              <span className="text-sm">{level.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                
                <div className="space-y-2">
  <Label htmlFor="domainTenant">Script Domain & Tenant Assignment</Label>
  <p className="text-sm text-gray-600 dark:text-gray-400">
    Assign this script to specific domains and tenants. This is independent of your current session context.
  </p>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="domain">Domain</Label>
      <Select 
        value={domainTenantSelection.domainId?.toString() || "none"} 
        onValueChange={(value) => {
          const domainId = value === "none" ? null : parseInt(value);
          setDomainTenantSelection({
            domainId,
            tenantId: null // Reset tenant when domain changes
          });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select domain" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Domain (Global)</SelectItem>
          {scriptDomains.map((domain: any) => (
            <SelectItem key={domain.id} value={domain.id.toString()}>
              {domain.displayname || domain.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="tenant">Tenant</Label>
      <Select 
        value={domainTenantSelection.tenantId?.toString() || "none"}
        onValueChange={(value) => {
          const tenantId = value === "none" ? null : parseInt(value);
          setDomainTenantSelection(prev => ({
            ...prev,
            tenantId
          }));
        }}
        disabled={!domainTenantSelection.domainId}
      >
        <SelectTrigger>
          <SelectValue placeholder={domainTenantSelection.domainId ? "Select tenant" : "Select domain first"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">All Tenants</SelectItem>
          {scriptTenants
            .filter(tenant => tenant.domainid === domainTenantSelection.domainId)
            .map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id.toString()}>
                {tenant.displayname || tenant.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Current Selection Display */}
  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Script Assignment:
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {domainTenantSelection.tenantId ? (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Domain {domainTenantSelection.domainId} / Tenant {domainTenantSelection.tenantId}
            </span>
          ) : domainTenantSelection.domainId ? (
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              Domain {domainTenantSelection.domainId} (All Tenants)
            </span>
          ) : (
            <span className="text-gray-500">Global - Available to all domains and tenants</span>
          )}
        </p>
      </div>
      {(domainTenantSelection.domainId || domainTenantSelection.tenantId) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDomainTenantSelection({
            domainId: null,
            tenantId: null
          })}
          className="text-red-600 hover:text-red-700"
        >
          Clear Assignment
        </Button>
      )}
    </div>
  </div>
</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="windows, discovery, system, enterprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="runtime">Estimated Runtime (seconds)</Label>
                    <Input
                      id="runtime"
                      type="number"
                      value={formData.estimatedRunTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedRunTime: parseInt(e.target.value) || 30 }))}
                      min="1"
                      max="3600"
                    />
                  </div>
                </div>

                {/* Multi-select for industries and compliance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Target Industries</Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                      {industryOptions.map((industry) => (
                        <Badge
                          key={industry}
                          variant={formData.industries.includes(industry) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const updated = formData.industries.includes(industry)
                              ? formData.industries.filter(i => i !== industry)
                              : [...formData.industries, industry];
                            setFormData(prev => ({ ...prev, industries: updated }));
                          }}
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Compliance Frameworks</Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                      {complianceFrameworks.map((framework) => (
                        <Badge
                          key={framework}
                          variant={formData.complianceFrameworks.includes(framework) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const updated = formData.complianceFrameworks.includes(framework)
                              ? formData.complianceFrameworks.filter(f => f !== framework)
                              : [...formData.complianceFrameworks, framework];
                            setFormData(prev => ({ ...prev, complianceFrameworks: updated }));
                          }}
                        >
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Advanced Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="active">Active Script</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="elevation"
                          checked={formData.requiresElevation}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresElevation: checked }))}
                        />
                        <Label htmlFor="elevation">Requires Elevation</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="network"
                          checked={formData.requiresNetwork}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresNetwork: checked }))}
                        />
                        <Label htmlFor="network">Requires Network</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedScriptType && <selectedScriptType.icon className="w-5 h-5" />}
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedScriptType?.label} Script for {selectedOS?.label}
                  </h3>
                  <p className="text-sm text-gray-500">Complexity: {selectedComplexity?.label} | Runtime: ~{formData.estimatedRunTime}s</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={generateBoilerplate}>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Generate
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate boilerplate code for this script type</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>

                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Template Selection */}
            {templates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Enterprise Templates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.filter((t: any) => t.type === formData.type).map((template: any) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => loadTemplate(template)}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-2">
                            <Target className="w-4 h-4 text-primary mt-1" />
                            <div>
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className="text-xs">{template.category}</Badge>
                                <Badge variant="secondary" className="text-xs">{template.targetOs}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="script-code">Script Code</Label>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Code2 className="w-4 h-4" />
                  <span>Lines: {formData.code.split('\n').length}</span>
                  <span>Characters: {formData.code.length}</span>
                </div>
              </div>
              <Textarea
                id="script-code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="font-mono text-sm min-h-[500px] resize-y"
                placeholder="Enter your script code here..."
              />
            </div>

            {/* Enhanced Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Enterprise Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Security & Compliance</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Always validate input parameters</li>
                      <li>• Use least-privilege execution</li>
                      <li>• Implement proper error handling</li>
                      <li>• Log security-relevant events</li>
                      <li>• Follow compliance requirements</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Performance & Reliability</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Include timeout mechanisms</li>
                      <li>• Use structured JSON output</li>
                      <li>• Implement retry logic</li>
                      <li>• Monitor resource usage</li>
                      <li>• Test in isolated environments</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'processing' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Output Processing Rules</h3>
                <p className="text-sm text-gray-500">
                  Configure how script output is processed and extracted ({outputRules.length} rules)
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={validateRules}>
                  <Shield className="w-4 h-4 mr-2" />
                  Validate Rules
                </Button>
                <Button size="sm" onClick={addOutputRule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {outputRules.map((rule) => (
                <Card key={rule.id} className={`${!rule.enabled ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Rule Name *</Label>
                          <Input
                            value={rule.name || ''}
                            onChange={(e) => updateOutputRule(rule.id, { name: e.target.value })}
                            className="text-sm"
                            placeholder="Enter rule name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={rule.type}
                            onValueChange={(value) => updateOutputRule(rule.id, { type: value })}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="json_path">JSON Path</SelectItem>
                              <SelectItem value="regex">Regular Expression</SelectItem>
                              <SelectItem value="transform">Data Transform</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Pattern *</Label>
                          <Input
                            value={rule.pattern || ''}
                            onChange={(e) => updateOutputRule(rule.id, { pattern: e.target.value })}
                            className="text-sm font-mono"
                            placeholder={rule.type === 'json_path' ? '$.Data.Field' : rule.type === 'regex' ? '\\d+' : 'transform'}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Target Field *</Label>
                          <Input
                            value={rule.target || ''}
                            onChange={(e) => updateOutputRule(rule.id, { target: e.target.value })}
                            className="text-sm"
                            placeholder="output_field_name"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => updateOutputRule(rule.id, { enabled: checked })}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOutputRule(rule.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {outputRules.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Processing Rules Defined
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Add processing rules to extract and transform data from script output.
                  </p>
                  <Button onClick={addOutputRule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Rule
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Enterprise Testing & Validation</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={validateRules}>
                  <Zap className="w-4 h-4 mr-2" />
                  Validate Rules
                </Button>
                {script?.id && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleValidate}>
                      <Shield className="w-4 h-4 mr-2" />
                      Security Check
                    </Button>
                    <Button size="sm" onClick={handleTest}>
                      <Play className="w-4 h-4 mr-2" />
                      Run Test
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Validation Results */}
            {validationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Security & Performance Validation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {validationResults.map((result, index) => {
                      // Handle different possible property names in validation results
                      const status = result.Status || result.status || 'Unknown';
                      const type = result.Type || result.type || result.Category || result.category || 'Validation';
                      const message = result.Message || result.message || result.Description || result.description || 'No details available';

                      const isPass = status === 'Pass' || status === 'Success' || status === 'Valid';
                      const isWarning = status === 'Warning' || status === 'Warn';
                      const isFail = status === 'Fail' || status === 'Failed' || status === 'Error' || status === 'Invalid';

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-lg border ${isPass ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' :
                              isWarning ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800' :
                                isFail ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' :
                                  'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            {isPass ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : isWarning ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            ) : isFail ? (
                              <XCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-500" />
                            )}
                            <div>
                              <div className="font-medium text-sm">{type} Validation</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{message}</div>
                              {result.Details && (
                                <div className="text-xs text-gray-500 mt-1">{result.Details}</div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              isPass ? 'default' :
                                isWarning ? 'secondary' :
                                  isFail ? 'destructive' :
                                    'outline'
                            }
                          >
                            {status}
                          </Badge>
                        </div>
                      );
                    })}

                    {validationResults.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No validation results available</p>
                        <p className="text-xs mt-1">Run a security check to see validation results</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Execution Results */}
            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Test Execution Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center space-x-3">
                        {testResults.Status === 'Success' ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">Execution Status: {testResults.Status}</div>
                          <div className="text-sm text-gray-600">Runtime: {testResults.ExecutionTime}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(testResults.TestedAt).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <Label>Script Output</Label>
                      <Textarea
                        value={JSON.stringify(testResults.Output, null, 2)}
                        readOnly
                        className="font-mono text-sm min-h-32 bg-gray-50 dark:bg-gray-800 mt-2"
                      />
                    </div>

                    {testResults.Warnings?.length > 0 && (
                      <div>
                        <Label className="text-yellow-600">Warnings</Label>
                        <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
                          {testResults.Warnings.map((warning: string, index: number) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {testResults.Errors?.length > 0 && (
                      <div>
                        <Label className="text-red-600">Errors</Label>
                        <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                          {testResults.Errors.map((error: string, index: number) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'enterprise' && (
          <div className="space-y-6 max-w-4xl">
            {/* Version Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5" />
                  <span>Version Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={versionControl.enabled}
                    onCheckedChange={(checked) => setVersionControl(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label>Enable version control for this script</Label>
                </div>
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={versionControl.autoIncrement}
                    onCheckedChange={(checked) => setVersionControl(prev => ({ ...prev, autoIncrement: checked }))}
                  />
                  <Label>Automatically increment version on save</Label>
                </div>
                <div className="space-y-2">
                  <Label>Change Description</Label>
                  <Textarea
                    placeholder="Describe the changes made in this version..."
                    value={versionControl.changeDescription}
                    onChange={(e) => setVersionControl(prev => ({ ...prev, changeDescription: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Approval Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Approval Workflow</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={approvalWorkflow.enabled}
                    onCheckedChange={(checked) => setApprovalWorkflow(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label>Require approval before deployment</Label>
                </div>
                {approvalWorkflow.enabled && (
                  <>
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={approvalWorkflow.requiresTwoApprovals}
                        onCheckedChange={(checked) => setApprovalWorkflow(prev => ({ ...prev, requiresTwoApprovals: checked }))}
                      />
                      <Label>Require two approvals</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Approvers (email addresses)</Label>
                      <Input
                        placeholder="admin@company.com, security@company.com"
                        value={approvalWorkflow.approvers.join(', ')}
                        onChange={(e) => {
                          const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                          setApprovalWorkflow(prev => ({ ...prev, approvers: emails }));
                        }}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Audit & Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Audit & Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={auditSettings.enabled}
                    onCheckedChange={(checked) => setAuditSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                  <Label>Enable comprehensive auditing</Label>
                </div>
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={auditSettings.logExecutions}
                    onCheckedChange={(checked) => setAuditSettings(prev => ({ ...prev, logExecutions: checked }))}
                  />
                  <Label>Log all script executions</Label>
                </div>
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={auditSettings.logChanges}
                    onCheckedChange={(checked) => setAuditSettings(prev => ({ ...prev, logChanges: checked }))}
                  />
                  <Label>Log all script modifications</Label>
                </div>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Performance Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Cpu className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{formData.estimatedRunTime}s</div>
                    <div className="text-sm text-gray-600">Avg Runtime</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-sm text-gray-600">Executions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced Action Bar */}
      <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-900 border-t flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          {isDirty && (
            <Badge variant="secondary" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>

        <div className="flex space-x-2">
          {script?.id && (
            <>
              <Button
                variant="outline"
                onClick={handleValidate}
                disabled={isValidating}
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 mr-2" />
                )}
                Validate
              </Button>

              <Button
                variant="outline"
                onClick={handleTest}
                disabled={isTesting}
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Test
              </Button>
            </>
          )}

          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Script
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowUnsavedChangesDialog(false); onCancel(); }}>
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}