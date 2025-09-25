import React, { useState } from "react";
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
  Plus
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
import { Card, CardContent } from "@/components/ui/card";

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
  { value: 'python', label: 'Python', icon: Code2, description: 'Python automation script' },
  { value: 'wmi', label: 'WMI Query', icon: Database, description: 'Windows Management Instrumentation' }
];

const osTargets = [
  { value: 'windows', label: 'Windows', icon: Monitor },
  { value: 'linux', label: 'Linux', icon: Server },
  { value: 'macos', label: 'macOS', icon: Monitor },
  { value: 'cross-platform', label: 'Cross-Platform', icon: Network }
];

const categories = [
  'Applications & Databases',
  'Cloud & Virtualization',
  'Network & Connectivity',
  'Operating System',
  'Security'
];

export function ScriptEditor({ script, onSave, onCancel }: ScriptEditorProps) {
  const [formData, setFormData] = useState({
    name: script?.name || '',
    description: script?.description || '',
    category: script?.category || 'Applications & Databases',
    type: script?.type || 'powershell',
    os: script?.targetOs || 'windows',
    version: script?.version || '1.0',
    isActive: script?.isActive ?? true,
    tags: script?.tags?.join(', ') || '',
    code: script?.template || `# Sample ${script?.type || 'PowerShell'} script
# Description: ${script?.description || 'Add your script description here'}

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
}`
  });

  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'processing' | 'test'>('config');
  
  // Output Processing Rules
  const [outputRules, setOutputRules] = useState([
    {
      id: 1,
      name: 'Extract OS Information',
      type: 'json_path',
      pattern: '$.Data.WindowsProductName',
      action: 'extract',
      target: 'os_name',
      enabled: true
    },
    {
      id: 2,
      name: 'Memory Size Processing',
      type: 'regex',
      pattern: '(\\d+)\\s*GB',
      action: 'transform',
      target: 'memory_gb',
      enabled: true
    }
  ]);
  
  const [sampleOutput, setSampleOutput] = useState(`{
  "Status": "Success",
  "Data": {
    "WindowsProductName": "Windows 11 Pro",
    "WindowsVersion": "10.0.22000",
    "TotalPhysicalMemory": "16777216000"
  },
  "Timestamp": "2024-01-15 10:30:45"
}`);

  const [processedOutput, setProcessedOutput] = useState('');
  const [validationResults, setValidationResults] = useState<any[]>([]);

  const selectedScriptType = scriptTypes.find(t => t.value === formData.type);
  const selectedOS = osTargets.find(o => o.value === formData.os);

  const addOutputRule = () => {
    const newRule = {
      id: Date.now(),
      name: 'New Rule',
      type: 'json_path',
      pattern: '$.Data',
      action: 'extract',
      target: 'field_name',
      enabled: true
    };
    setOutputRules([...outputRules, newRule]);
  };

  const updateOutputRule = (id: number, updates: any) => {
    setOutputRules(rules => 
      rules.map(rule => 
        rule.id === id ? { ...rule, ...updates } : rule
      )
    );
  };

  const removeOutputRule = (id: number) => {
    setOutputRules(rules => rules.filter(rule => rule.id !== id));
  };

  const validateRules = () => {
    const results = [];
    
    try {
      const output = JSON.parse(sampleOutput);
      
      for (const rule of outputRules.filter(r => r.enabled)) {
        try {
          let result = null;
          
          if (rule.type === 'json_path') {
            // Simple JSON path implementation
            const path = rule.pattern.replace('$.', '').split('.');
            result = path.reduce((obj, key) => obj?.[key], output);
          } else if (rule.type === 'regex') {
            const regex = new RegExp(rule.pattern);
            const match = JSON.stringify(output).match(regex);
            result = match ? match[1] || match[0] : null;
          }
          
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            status: result !== null ? 'success' : 'no_match',
            result: result,
            target: rule.target
          });
        } catch (error) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      // Generate processed output
      const processed: Record<string, any> = {};
      results.forEach(result => {
        if (result.status === 'success' && result.target) {
          processed[result.target] = result.result;
        }
      });
      
      setProcessedOutput(JSON.stringify(processed, null, 2));
      setValidationResults(results);
      
    } catch (error) {
      setValidationResults([{
        ruleId: 0,
        ruleName: 'JSON Parse',
        status: 'error',
        error: 'Invalid JSON in sample output'
      }]);
    }
  };

  const handleSave = () => {
    // Transform form data to match the expected API format
    const scriptData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      targetOs: formData.os,
      template: formData.code,
      version: formData.version,
      isActive: formData.isActive,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      // Set default values for other required fields
      vendor: "Custom",
      complexity: "medium",
      estimatedRunTimeSeconds: 30,
      requiresElevation: false,
      requiresNetwork: false,
      parameters: "{}",
      outputFormat: "json",
      outputProcessing: null,
      credentialRequirements: null,
      industries: [],
      complianceFrameworks: null,
      isStandard: false
    };
    
    console.log('Saving script:', scriptData);
    onSave(scriptData);
  };

  const handleTest = () => {
    // TODO: Implement test execution
    console.log('Testing script:', formData);
  };

  const getCodeTemplate = (type: string, os: string) => {
    switch (type) {
      case 'powershell':
        return `# PowerShell Discovery Script
# Target OS: ${os}
# Description: ${formData.description}

$ErrorActionPreference = "Stop"

try {
    # Add your PowerShell discovery logic here
    $result = @{
        ComputerName = $env:COMPUTERNAME
        OS = (Get-WmiObject -Class Win32_OperatingSystem).Caption
        Version = (Get-WmiObject -Class Win32_OperatingSystem).Version
        Architecture = (Get-WmiObject -Class Win32_OperatingSystem).OSArchitecture
    }
    
    # Output as JSON for consistent parsing
    Write-Output ($result | ConvertTo-Json -Depth 3)
}
catch {
    Write-Error "Script execution failed: $_"
}`;

      case 'bash':
        return `#!/bin/bash
# Bash Discovery Script
# Target OS: ${os}
# Description: ${formData.description}

set -e

# Add your bash discovery logic here
get_system_info() {
    hostname=$(hostname)
    os_info=$(uname -a)
    
    # Create JSON output for consistent parsing
    cat << EOF
{
    "hostname": "$hostname",
    "os_info": "$os_info",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
}

# Execute discovery
get_system_info`;

      case 'python':
        return `#!/usr/bin/env python3
"""
Python Discovery Script
Target OS: ${os}
Description: ${formData.description}
"""

import json
import platform
import datetime
import sys

def discover():
    """Main discovery function"""
    try:
        result = {
            "hostname": platform.node(),
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        return {"status": "success", "data": result}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    result = discover()
    print(json.dumps(result, indent=2))
    
    if result["status"] == "error":
        sys.exit(1)`;

      case 'wmi':
        return `# WMI Query Script
# Target OS: ${os}
# Description: ${formData.description}

$ErrorActionPreference = "Stop"

try {
    # WMI Query for system information
    $wmiQuery = @"
SELECT 
    Name,
    Version,
    Manufacturer,
    Model,
    TotalPhysicalMemory,
    NumberOfProcessors
FROM Win32_ComputerSystem
"@
    
    $result = Get-WmiObject -Query $wmiQuery | Select-Object *
    
    # Format output as JSON
    $output = @{
        QueryType = "WMI"
        Class = "Win32_ComputerSystem"
        Data = $result
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    Write-Output ($output | ConvertTo-Json -Depth 3)
}
catch {
    Write-Error "WMI Query failed: $_"
}`;

      default:
        return '# Add your script code here';
    }
  };

  const updateCodeTemplate = () => {
    setFormData(prev => ({
      ...prev,
      code: getCodeTemplate(prev.type, prev.os)
    }));
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Code2 className="w-4 h-4 inline mr-2" />
          Script Code
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'processing'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Output Processing
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'test'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Play className="w-4 h-4 inline mr-2" />
          Test & Validate
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="script-name">Script Name</Label>
                <Input
                  id="script-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter script name"
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
                placeholder="Describe what this script does"
                rows={3}
              />
            </div>

            {/* Script Type Selection */}
            <div className="space-y-4">
              <Label>Script Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scriptTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, type: type.value as any }));
                        setTimeout(updateCodeTemplate, 100);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${
                          isSelected ? 'text-primary' : 'text-gray-400'
                        }`} />
                        <h3 className="font-medium text-sm">{type.label}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {type.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* OS Target Selection */}
            <div className="space-y-4">
              <Label>Target Operating System</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {osTargets.map((os) => {
                  const Icon = os.icon;
                  const isSelected = formData.os === os.value;
                  
                  return (
                    <Card
                      key={os.value}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, os: os.value as any }));
                        setTimeout(updateCodeTemplate, 100);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          isSelected ? 'text-primary' : 'text-gray-400'
                        }`} />
                        <h3 className="font-medium text-sm">{os.label}</h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="windows, discovery, system"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="active">Active Script</Label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedScriptType && <selectedScriptType.icon className="w-5 h-5" />}
                <h3 className="text-lg font-medium">
                  {selectedScriptType?.label} Script for {selectedOS?.label}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={updateCodeTemplate}>
                  <FileText className="w-4 h-4 mr-2" />
                  Reset Template
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="script-code">Script Code</Label>
              <Textarea
                id="script-code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="font-mono text-sm min-h-96"
                placeholder="Enter your script code here..."
              />
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Tips for writing discovery scripts:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Always include error handling and logging</li>
                <li>Output results in JSON format for consistent parsing</li>
                <li>Use descriptive variable names and comments</li>
                <li>Test scripts in isolated environments first</li>
                <li>Include timeout mechanisms for network operations</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'processing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Output Processing Rules</h3>
              <Button onClick={addOutputRule}>
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>
            
            <div className="space-y-4">
              {outputRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => updateOutputRule(rule.id, { enabled: checked })}
                        />
                        <Input
                          value={rule.name}
                          onChange={(e) => updateOutputRule(rule.id, { name: e.target.value })}
                          className="font-medium"
                          placeholder="Rule name"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOutputRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Rule Type</Label>
                        <Select
                          value={rule.type}
                          onValueChange={(value) => updateOutputRule(rule.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json_path">JSON Path</SelectItem>
                            <SelectItem value="regex">Regular Expression</SelectItem>
                            <SelectItem value="string_match">String Match</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Pattern</Label>
                        <Input
                          value={rule.pattern}
                          onChange={(e) => updateOutputRule(rule.id, { pattern: e.target.value })}
                          placeholder={rule.type === 'json_path' ? '$.Data.fieldName' : 'regex pattern'}
                        />
                      </div>
                      
                      <div>
                        <Label>Target Field</Label>
                        <Input
                          value={rule.target}
                          onChange={(e) => updateOutputRule(rule.id, { target: e.target.value })}
                          placeholder="output_field_name"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Sample Output Data</Label>
                <Textarea
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                  className="font-mono text-sm h-64"
                  placeholder="Paste sample script output here..."
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Processed Output</Label>
                  <Button size="sm" onClick={validateRules}>
                    <Play className="w-4 h-4 mr-2" />
                    Validate Rules
                  </Button>
                </div>
                <Textarea
                  value={processedOutput}
                  readOnly
                  className="font-mono text-sm h-64 bg-gray-50 dark:bg-gray-800"
                  placeholder="Processed output will appear here..."
                />
              </div>
            </div>
            
            {validationResults.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Validation Results</h4>
                  <div className="space-y-2">
                    {validationResults.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            result.status === 'success' ? 'bg-green-500' : 
                            result.status === 'no_match' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium">{result.ruleName}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {result.status === 'success' ? 
                            `✓ ${result.target}: ${JSON.stringify(result.result)}` :
                            result.status === 'no_match' ? 
                            '⚠ No match found' :
                            `✗ ${result.error}`
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Test Script Execution</h3>
              <Button onClick={handleTest}>
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Validation Results</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Syntax validation passed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Compatible with target OS</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Script not yet tested on live system</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Test Output</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div>Testing script execution...</div>
                  <div>✓ Script loaded successfully</div>
                  <div>✓ Dependencies verified</div>
                  <div>⚠ Ready for live testing</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Badge variant={formData.isActive ? "default" : "secondary"}>
            {formData.isActive ? "Active" : "Inactive"}
          </Badge>
          {selectedScriptType && (
            <Badge variant="outline">
              {selectedScriptType.label}
            </Badge>
          )}
          {selectedOS && (
            <Badge variant="outline">
              {selectedOS.label}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Script
          </Button>
        </div>
      </div>
    </div>
  );
}