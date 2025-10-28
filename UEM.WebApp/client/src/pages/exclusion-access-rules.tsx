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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Lock, Unlock, Shield, Edit, Trash2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";

interface AccessRule {
  id: number;
  name: string;
  ruleType: 'allow' | 'deny' | 'exclusion';
  resourceType: 'endpoint' | 'user' | 'group' | 'ip_range' | 'application';
  resourcePattern: string;
  action: string;
  priority: number;
  enabled: boolean;
  description: string;
  createdBy: string;
  createdAt: string;
}

export default function ExclusionAccessRulesPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [ruleTypeFilter, setRuleTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    ruleType: "deny" as 'allow' | 'deny' | 'exclusion',
    resourceType: "endpoint" as 'endpoint' | 'user' | 'group' | 'ip_range' | 'application',
    resourcePattern: "",
    action: "",
    priority: 5,
    description: ""
  });

  // Mock access rules
  const mockRules: AccessRule[] = [
    {
      id: 1,
      name: "Block External IPs",
      ruleType: "deny",
      resourceType: "ip_range",
      resourcePattern: "0.0.0.0/0",
      action: "Block all external connections",
      priority: 1,
      enabled: true,
      description: "Prevent access from any external IP addresses",
      createdBy: "security@company.com",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: "Allow Internal Network",
      ruleType: "allow",
      resourceType: "ip_range",
      resourcePattern: "10.0.0.0/8",
      action: "Permit internal network access",
      priority: 2,
      enabled: true,
      description: "Allow all connections from internal network range",
      createdBy: "admin@company.com",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      name: "Exclude Test Endpoints",
      ruleType: "exclusion",
      resourceType: "endpoint",
      resourcePattern: "TEST-*",
      action: "Exclude from monitoring and compliance",
      priority: 3,
      enabled: true,
      description: "Test and development endpoints excluded from security scans",
      createdBy: "devops@company.com",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      name: "Restrict Privileged Users",
      ruleType: "deny",
      resourceType: "user",
      resourcePattern: "*@external.com",
      action: "Deny admin access to external users",
      priority: 1,
      enabled: true,
      description: "External email domains cannot have administrative privileges",
      createdBy: "security@company.com",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      name: "Allow Remote Desktop",
      ruleType: "allow",
      resourceType: "application",
      resourcePattern: "RDP:3389",
      action: "Permit Remote Desktop connections",
      priority: 4,
      enabled: false,
      description: "Allow RDP for authorized administrators only",
      createdBy: "admin@company.com",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const rules = mockRules;

  // Filter rules
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.resourcePattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = ruleTypeFilter === "all" || rule.ruleType === ruleTypeFilter;
    return matchesSearch && matchesType;
  });

  // Statistics
  const totalRules = rules.length;
  const activeRules = rules.filter(r => r.enabled).length;
  const denyRules = rules.filter(r => r.ruleType === 'deny').length;
  const exclusionRules = rules.filter(r => r.ruleType === 'exclusion').length;

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case "allow": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "deny": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "exclusion": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getRuleTypeIcon = (type: string) => {
    switch (type) {
      case "allow": return <Unlock className="w-4 h-4" />;
      case "deny": return <Lock className="w-4 h-4" />;
      case "exclusion": return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("exclusion_rules")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Define access control policies and exclusion rules for scalable security management
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Access Rule</DialogTitle>
              <DialogDescription>
                Define a new access control or exclusion rule
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Block External Access"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Rule Type</Label>
                  <Select value={newRule.ruleType} onValueChange={(value: any) => setNewRule({ ...newRule, ruleType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                      <SelectItem value="exclusion">Exclusion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Resource Type</Label>
                  <Select value={newRule.resourceType} onValueChange={(value: any) => setNewRule({ ...newRule, resourceType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="endpoint">Endpoint</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="ip_range">IP Range</SelectItem>
                      <SelectItem value="application">Application</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resource-pattern">Resource Pattern</Label>
                <Input
                  id="resource-pattern"
                  value={newRule.resourcePattern}
                  onChange={(e) => setNewRule({ ...newRule, resourcePattern: e.target.value })}
                  placeholder="e.g., 10.0.0.0/8 or USER-* or admin@*"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="action">Action</Label>
                <Input
                  id="action"
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  placeholder="Describe what this rule does"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Additional details about this rule"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Rules
            </CardTitle>
            <Shield className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All configured rules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Rules
            </CardTitle>
            <Unlock className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently enforced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Deny Rules
            </CardTitle>
            <Lock className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{denyRules}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Blocking access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Exclusions
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exclusionRules}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Excluded resources</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, pattern, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={ruleTypeFilter} onValueChange={setRuleTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Rule Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="deny">Deny</SelectItem>
                <SelectItem value="exclusion">Exclusion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Resource Type</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    No access rules found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge className={getRuleTypeColor(rule.ruleType)}>
                        <div className="flex items-center gap-1">
                          {getRuleTypeIcon(rule.ruleType)}
                          <span className="capitalize">{rule.ruleType}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {rule.resourceType.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {rule.resourcePattern}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {rule.action}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={rule.enabled} />
                    </TableCell>
                    <TableCell className="text-sm">{rule.createdBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
