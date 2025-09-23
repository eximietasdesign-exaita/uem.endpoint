import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Filter,
  Plus,
  Eye,
  Settings,
  Building2,
  MapPin,
  AlertTriangle,
  DollarSign,
  Shield
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface Asset {
  id: number;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  location?: string;
  businessUnit?: string;
  category?: string;
  vulnerabilities: number;
  complianceScore: number;
  assetValue?: number;
  lastSeen: string;
}

interface AssetField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'currency';
  category: 'basic' | 'location' | 'business' | 'technical' | 'financial' | 'compliance';
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'summary' | 'detailed' | 'custom';
  filters: Record<string, any>;
  groupBy: string[];
  metrics: string[];
  chartType: 'bar' | 'pie' | 'line' | 'area' | 'table';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

interface AssetReportingEngineProps {
  assets: Asset[];
  customFields: AssetField[];
}

export function AssetReportingEngine({ assets, customFields }: AssetReportingEngineProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportBuilder, setShowReportBuilder] = useState(false);

  // Sample reports
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Asset Status Overview',
      description: 'Summary of asset status across all locations',
      type: 'summary',
      filters: {},
      groupBy: ['status'],
      metrics: ['count'],
      chartType: 'pie'
    },
    {
      id: '2',
      name: 'Criticality by Business Unit',
      description: 'Asset criticality distribution by business unit',
      type: 'detailed',
      filters: {},
      groupBy: ['businessUnit', 'criticality'],
      metrics: ['count'],
      chartType: 'bar'
    },
    {
      id: '3',
      name: 'Compliance Trends',
      description: 'Compliance score trends over time',
      type: 'custom',
      filters: {},
      groupBy: ['lastSeen'],
      metrics: ['complianceScore'],
      chartType: 'line'
    }
  ]);

  // Chart color schemes
  const statusColors = ['#10b981', '#6b7280', '#f59e0b', '#ef4444'];
  const criticalityColors = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a'];

  // Generate dashboard data
  const dashboardData = useMemo(() => {
    // Status distribution
    const statusData = [
      { name: 'Active', value: assets.filter(a => a.status === 'active').length },
      { name: 'Inactive', value: assets.filter(a => a.status === 'inactive').length },
      { name: 'Maintenance', value: assets.filter(a => a.status === 'maintenance').length },
      { name: 'Decommissioned', value: assets.filter(a => a.status === 'decommissioned').length },
    ].filter(item => item.value > 0);

    // Criticality distribution
    const criticalityData = [
      { name: 'Critical', value: assets.filter(a => a.criticality === 'critical').length },
      { name: 'High', value: assets.filter(a => a.criticality === 'high').length },
      { name: 'Medium', value: assets.filter(a => a.criticality === 'medium').length },
      { name: 'Low', value: assets.filter(a => a.criticality === 'low').length },
    ].filter(item => item.value > 0);

    // Location distribution
    const locationData = Object.entries(
      assets.reduce((acc, asset) => {
        const location = asset.location || 'Unassigned';
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    // Business unit distribution
    const businessUnitData = Object.entries(
      assets.reduce((acc, asset) => {
        const bu = asset.businessUnit || 'Unassigned';
        acc[bu] = (acc[bu] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    // Vulnerability trends (simulated data)
    const vulnerabilityTrends = [
      { month: 'Jan', high: 45, medium: 120, low: 230 },
      { month: 'Feb', high: 38, medium: 115, low: 245 },
      { month: 'Mar', high: 42, medium: 108, low: 260 },
      { month: 'Apr', high: 35, medium: 102, low: 275 },
      { month: 'May', high: 31, medium: 98, low: 285 },
      { month: 'Jun', high: 28, medium: 95, low: 290 },
    ];

    // Compliance trends (simulated data)
    const complianceTrends = [
      { month: 'Jan', score: 72 },
      { month: 'Feb', score: 75 },
      { month: 'Mar', score: 78 },
      { month: 'Apr', score: 81 },
      { month: 'May', score: 84 },
      { month: 'Jun', score: 87 },
    ];

    // Asset value by category
    const assetValueData = Object.entries(
      assets.reduce((acc, asset) => {
        const category = asset.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + (asset.assetValue || 0);
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    return {
      statusData,
      criticalityData,
      locationData,
      businessUnitData,
      vulnerabilityTrends,
      complianceTrends,
      assetValueData
    };
  }, [assets]);

  const generateReport = (report: Report) => {
    // Here you would implement actual report generation logic
    console.log('Generating report:', report);
  };

  const exportReport = (report: Report, format: 'pdf' | 'excel' | 'csv') => {
    // Here you would implement export logic
    console.log('Exporting report:', report.name, 'as', format);
  };

  const renderChart = (data: any[], type: string, colors: string[]) => {
    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke={colors[0]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#dc2626" fill="#dc2626" />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="#ea580c" fill="#ea580c" />
              <Area type="monotone" dataKey="low" stackId="1" stroke="#ca8a04" fill="#ca8a04" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive reporting and data analysis for asset management</p>
        </div>
        <Button onClick={() => setShowReportBuilder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Asset Status Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(dashboardData.statusData, 'pie', statusColors)}
              </CardContent>
            </Card>

            {/* Criticality Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Criticality Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(dashboardData.criticalityData, 'pie', criticalityColors)}
              </CardContent>
            </Card>

            {/* Assets by Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Assets by Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(dashboardData.locationData, 'bar', ['#3b82f6'])}
              </CardContent>
            </Card>

            {/* Assets by Business Unit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Assets by Business Unit</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(dashboardData.businessUnitData, 'bar', ['#10b981'])}
              </CardContent>
            </Card>

            {/* Vulnerability Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Vulnerability Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(dashboardData.vulnerabilityTrends, 'area', ['#dc2626', '#ea580c', '#ca8a04'])}
              </CardContent>
            </Card>

            {/* Compliance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Compliance Score Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(dashboardData.complianceTrends, 'line', ['#059669'])}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge variant={report.type === 'custom' ? 'default' : 'secondary'}>
                      {report.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Chart Type:</span>
                      <Badge variant="outline">{report.chartType}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Group By:</span>
                      <span>{report.groupBy.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => generateReport(report)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportReport(report, 'pdf')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Metrics</h3>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        ${dashboardData.assetValueData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Total Asset Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round(assets.reduce((sum, asset) => sum + asset.complianceScore, 0) / assets.length)}%
                      </p>
                      <p className="text-sm text-gray-500">Avg Compliance Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {assets.reduce((sum, asset) => sum + asset.vulnerabilities, 0)}
                      </p>
                      <p className="text-sm text-gray-500">Total Vulnerabilities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Asset Value by Category */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Asset Value by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(dashboardData.assetValueData, 'bar', ['#8b5cf6'])}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No scheduled reports configured</p>
                <Button variant="outline" className="mt-3">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule a Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Builder Dialog */}
      <Dialog open={showReportBuilder} onOpenChange={setShowReportBuilder}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Custom Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input id="reportName" placeholder="Enter report name" />
            </div>
            <div>
              <Label htmlFor="reportDescription">Description</Label>
              <Textarea id="reportDescription" placeholder="Describe this report" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chartType">Chart Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="groupBy">Group By</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="criticality">Criticality</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="businessUnit">Business Unit</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportBuilder(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowReportBuilder(false)}>
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}