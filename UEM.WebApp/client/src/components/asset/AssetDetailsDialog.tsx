import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Building2,
  MapPin,
  AlertTriangle,
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Activity,
  Network,
  HardDrive,
  Cpu,
  Monitor,
  Edit,
  ExternalLink,
  Download,
  History
} from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  ipAddress: string;
  macAddress: string;
  osType: string;
  osVersion: string;
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  discoveryMethod: 'agentless' | 'agent' | 'manual';
  lastSeen: string;
  location?: string;
  category?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  businessUnit?: string;
  project?: string;
  reportingManager?: string;
  customFields: Record<string, any>;
  tags: string[];
  vulnerabilities: number;
  complianceScore: number;
  assetValue?: number;
  purchaseDate?: string;
  warrantyExpiry?: string;
  vendor?: string;
  model?: string;
  serialNumber?: string;
}

interface AssetField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'currency';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  category: 'basic' | 'location' | 'business' | 'technical' | 'financial' | 'compliance';
}

interface AssetDetailsDialogProps {
  asset: Asset;
  customFields: AssetField[];
}

export function AssetDetailsDialog({ asset, customFields }: AssetDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'decommissioned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderCustomFieldValue = (field: AssetField, value: any) => {
    if (!value) return '-';

    switch (field.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'multiselect':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value.toString();
    }
  };

  const customFieldsByCategory = customFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, AssetField[]>);

  // Mock data for additional tabs
  const networkInfo = {
    openPorts: [22, 80, 443, 3389],
    services: [
      { name: 'SSH', port: 22, status: 'running' },
      { name: 'HTTP', port: 80, status: 'running' },
      { name: 'HTTPS', port: 443, status: 'running' },
      { name: 'RDP', port: 3389, status: 'stopped' },
    ],
    dnsRecords: ['A: 192.168.1.100', 'PTR: server.domain.com']
  };

  const hardwareInfo = {
    cpu: { model: 'Intel Xeon E5-2680 v4', cores: 14, frequency: '2.40 GHz' },
    memory: { total: '32 GB', available: '18 GB', usage: '56%' },
    storage: [
      { drive: 'C:', total: '500 GB', free: '120 GB', usage: '76%' },
      { drive: 'D:', total: '1 TB', free: '450 GB', usage: '55%' }
    ]
  };

  const securityInfo = {
    vulnerabilities: [
      { id: 'CVE-2023-1234', severity: 'High', description: 'Remote Code Execution' },
      { id: 'CVE-2023-5678', severity: 'Medium', description: 'Privilege Escalation' },
      { id: 'CVE-2023-9012', severity: 'Low', description: 'Information Disclosure' }
    ],
    patches: [
      { id: 'KB5028166', installed: true, date: '2023-07-15' },
      { id: 'KB5028167', installed: false, date: 'Pending' }
    ],
    antivirusStatus: 'Active',
    firewallStatus: 'Enabled'
  };

  const auditLog = [
    { timestamp: '2023-07-20 14:30:00', action: 'Asset Updated', user: 'admin@company.com', details: 'Updated criticality level' },
    { timestamp: '2023-07-19 09:15:00', action: 'Discovery Scan', user: 'system', details: 'Automated agentless scan completed' },
    { timestamp: '2023-07-18 16:45:00', action: 'Asset Created', user: 'john.doe@company.com', details: 'Initial asset registration' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">{asset.name}</h2>
            <Badge className={getStatusColor(asset.status)}>
              {asset.status}
            </Badge>
            <Badge className={getCriticalityColor(asset.criticality)}>
              {asset.criticality}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="font-mono">{asset.ipAddress}</span>
            <span>•</span>
            <span>{asset.osType} {asset.osVersion}</span>
            <span>•</span>
            <span>Last seen: {new Date(asset.lastSeen).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Asset
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="custom">Custom Fields</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Asset Name</p>
                    <p className="font-medium">{asset.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">IP Address</p>
                    <p className="font-mono">{asset.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">MAC Address</p>
                    <p className="font-mono">{asset.macAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p>{asset.category || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Serial Number</p>
                    <p className="font-mono">{asset.serialNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Discovery Method</p>
                    <Badge variant="outline">{asset.discoveryMethod}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Business Context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Location & Business</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p>{asset.location || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Unit</p>
                    <p>{asset.businessUnit || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Project</p>
                    <p>{asset.project || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reporting Manager</p>
                    <p>{asset.reportingManager || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.length > 0 ? asset.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      )) : <span>-</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Financial Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Asset Value</p>
                    <p className="font-medium">{asset.assetValue ? `$${asset.assetValue.toLocaleString()}` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vendor</p>
                    <p>{asset.vendor || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Model</p>
                    <p>{asset.model || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                    <p>{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Warranty Expiry</p>
                    <p>{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Compliance & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Compliance Score</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          asset.complianceScore >= 80 ? 'bg-green-500' :
                          asset.complianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${asset.complianceScore}%` }}
                      />
                    </div>
                    <span className="font-medium">{asset.complianceScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vulnerabilities</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{asset.vulnerabilities} identified</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Open Ports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {networkInfo.openPorts.map((port) => (
                    <Badge key={port} variant="outline">{port}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {networkInfo.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{service.name} (:{service.port})</span>
                      <Badge className={service.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hardware Tab */}
        <TabsContent value="hardware" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>CPU</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><strong>Model:</strong> {hardwareInfo.cpu.model}</p>
                <p className="text-sm"><strong>Cores:</strong> {hardwareInfo.cpu.cores}</p>
                <p className="text-sm"><strong>Frequency:</strong> {hardwareInfo.cpu.frequency}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Memory</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm"><strong>Total:</strong> {hardwareInfo.memory.total}</p>
                <p className="text-sm"><strong>Available:</strong> {hardwareInfo.memory.available}</p>
                <p className="text-sm"><strong>Usage:</strong> {hardwareInfo.memory.usage}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5" />
                  <span>Storage</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hardwareInfo.storage.map((drive, index) => (
                  <div key={index} className="text-sm">
                    <strong>{drive.drive}</strong> {drive.free} free of {drive.total} ({drive.usage})
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vulnerabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityInfo.vulnerabilities.map((vuln, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{vuln.id}</span>
                        <Badge className={vuln.severity === 'High' ? getCriticalityColor('critical') : 
                                        vuln.severity === 'Medium' ? getCriticalityColor('medium') : 
                                        getCriticalityColor('low')}>
                          {vuln.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{vuln.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Antivirus Status</span>
                  <Badge className="bg-green-100 text-green-800">{securityInfo.antivirusStatus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Firewall Status</span>
                  <Badge className="bg-green-100 text-green-800">{securityInfo.firewallStatus}</Badge>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Patch Status</h4>
                  <div className="space-y-2">
                    {securityInfo.patches.map((patch, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{patch.id}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{patch.date}</span>
                          <Badge className={patch.installed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {patch.installed ? 'Installed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Fields Tab */}
        <TabsContent value="custom" className="space-y-6">
          {Object.entries(customFieldsByCategory).map(([category, fields]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="capitalize">{category.replace('_', ' ')} Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field.id}>
                      <p className="text-sm font-medium text-gray-500">{field.name}</p>
                      <p className="font-medium">
                        {renderCustomFieldValue(field, asset.customFields[field.id])}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Asset Audit Log</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLog.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{entry.action}</p>
                        <span className="text-sm text-gray-500">{entry.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                      <p className="text-xs text-gray-500 mt-1">by {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}