import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, GitBranch, CheckCircle, AlertCircle, RefreshCw, TrendingUp, Database, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

interface NormalizationRule {
  id: number;
  fieldName: string;
  ruleType: 'standardize' | 'enrich' | 'validate' | 'transform';
  source: string;
  transformation: string;
  priority: number;
  status: 'active' | 'inactive' | 'testing';
  processedRecords: number;
  successRate: number;
  lastRun: string;
}

export default function DataNormalizationPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock normalization rules
  const mockRules: NormalizationRule[] = [
    {
      id: 1,
      fieldName: "manufacturer",
      ruleType: "standardize",
      source: "Asset Discovery",
      transformation: "Microsoft Corp → Microsoft | MSFT → Microsoft | MS → Microsoft",
      priority: 1,
      status: "active",
      processedRecords: 1247,
      successRate: 98.5,
      lastRun: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      fieldName: "os_version",
      ruleType: "enrich",
      source: "Multiple Sources",
      transformation: "Add EOL date, support status, vulnerability count from vendor APIs",
      priority: 2,
      status: "active",
      processedRecords: 892,
      successRate: 95.2,
      lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      fieldName: "ip_address",
      ruleType: "validate",
      source: "Network Scan",
      transformation: "Verify IPv4/IPv6 format, check private vs public ranges",
      priority: 1,
      status: "active",
      processedRecords: 2134,
      successRate: 99.8,
      lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      fieldName: "serial_number",
      ruleType: "transform",
      source: "Agent Data",
      transformation: "Remove spaces, convert to uppercase, apply checksum validation",
      priority: 3,
      status: "active",
      processedRecords: 1456,
      successRate: 97.3,
      lastRun: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      fieldName: "software_version",
      ruleType: "enrich",
      source: "Software Inventory",
      transformation: "Match to CVE database, add security advisory links",
      priority: 2,
      status: "testing",
      processedRecords: 543,
      successRate: 87.4,
      lastRun: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    },
    {
      id: 6,
      fieldName: "location",
      ruleType: "standardize",
      source: "Asset Records",
      transformation: "Normalize building codes, floor numbers, room formats",
      priority: 3,
      status: "active",
      processedRecords: 789,
      successRate: 96.1,
      lastRun: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  ];

  const rules = mockRules;

  // Filter rules
  const filteredRules = rules.filter(rule =>
    rule.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.transformation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalRules = rules.length;
  const activeRules = rules.filter(r => r.status === 'active').length;
  const totalProcessed = rules.reduce((sum, r) => sum + r.processedRecords, 0);
  const avgSuccessRate = rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length;

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case "standardize": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "enrich": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "validate": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "transform": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "testing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("data_normalization")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Automated data quality assurance with vendor sensing, standardization, and enrichment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run All Rules
          </Button>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Rules
            </CardTitle>
            <GitBranch className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active transformations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Rules
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Records Processed
            </CardTitle>
            <Database className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalProcessed / 1000).toFixed(1)}k</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total transformations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Success Rate
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average across all rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by field name or transformation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Normalization Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Rules ({filteredRules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field Name</TableHead>
                <TableHead>Rule Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Transformation Logic</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    No normalization rules found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {rule.fieldName}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRuleTypeColor(rule.ruleType)}>
                        {rule.ruleType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{rule.source}</TableCell>
                    <TableCell className="text-sm max-w-md truncate">
                      {rule.transformation}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">P{rule.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {rule.processedRecords.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{rule.successRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={rule.successRate} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(rule.status)}>
                        {rule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Data Quality Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vendor Sensing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Microsoft Variations</span>
                <Badge>234 standardized</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cisco Formats</span>
                <Badge>189 normalized</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Dell Models</span>
                <Badge>156 matched</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrichment Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">CVE Database</span>
                <Badge variant="outline" className="text-green-600">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Vendor APIs</span>
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Asset Intelligence</span>
                <Badge variant="outline" className="text-green-600">Synced</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
