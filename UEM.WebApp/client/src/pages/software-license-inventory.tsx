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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Boxes, AlertTriangle, CheckCircle, DollarSign, Download, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

interface SoftwareLicense {
  id: number;
  software: string;
  vendor: string;
  version: string;
  licenseType: 'perpetual' | 'subscription' | 'open_source' | 'trial';
  totalLicenses: number;
  usedLicenses: number;
  costPerLicense: number;
  expirationDate: string | null;
  complianceStatus: 'compliant' | 'over_deployed' | 'expiring_soon' | 'expired';
  maintenanceStatus: 'active' | 'expired' | 'not_applicable';
  lastAudit: string;
}

export default function SoftwareLicenseInventoryPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [licenseTypeFilter, setLicenseTypeFilter] = useState("all");
  const [complianceFilter, setComplianceFilter] = useState("all");

  // Mock software license data
  const mockLicenses: SoftwareLicense[] = [
    {
      id: 1,
      software: "Microsoft Office 365",
      vendor: "Microsoft",
      version: "E3",
      licenseType: "subscription",
      totalLicenses: 500,
      usedLicenses: 487,
      costPerLicense: 20,
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      complianceStatus: "compliant",
      maintenanceStatus: "active",
      lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      software: "Adobe Creative Cloud",
      vendor: "Adobe",
      version: "All Apps",
      licenseType: "subscription",
      totalLicenses: 50,
      usedLicenses: 53,
      costPerLicense: 54.99,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      complianceStatus: "over_deployed",
      maintenanceStatus: "active",
      lastAudit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      software: "VMware vSphere",
      vendor: "VMware",
      version: "8.0",
      licenseType: "perpetual",
      totalLicenses: 20,
      usedLicenses: 18,
      costPerLicense: 995,
      expirationDate: null,
      complianceStatus: "compliant",
      maintenanceStatus: "active",
      lastAudit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      software: "Atlassian Jira",
      vendor: "Atlassian",
      version: "Cloud Standard",
      licenseType: "subscription",
      totalLicenses: 200,
      usedLicenses: 156,
      costPerLicense: 7.75,
      expirationDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      complianceStatus: "expiring_soon",
      maintenanceStatus: "active",
      lastAudit: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      software: "Zoom Business",
      vendor: "Zoom",
      version: "Business",
      licenseType: "subscription",
      totalLicenses: 150,
      usedLicenses: 142,
      costPerLicense: 19.99,
      expirationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      complianceStatus: "expired",
      maintenanceStatus: "expired",
      lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 6,
      software: "Visual Studio Code",
      vendor: "Microsoft",
      version: "Latest",
      licenseType: "open_source",
      totalLicenses: 999,
      usedLicenses: 487,
      costPerLicense: 0,
      expirationDate: null,
      complianceStatus: "compliant",
      maintenanceStatus: "not_applicable",
      lastAudit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 7,
      software: "Salesforce CRM",
      vendor: "Salesforce",
      version: "Enterprise",
      licenseType: "subscription",
      totalLicenses: 100,
      usedLicenses: 89,
      costPerLicense: 150,
      expirationDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000).toISOString(),
      complianceStatus: "compliant",
      maintenanceStatus: "active",
      lastAudit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const licenses = mockLicenses;

  // Filter licenses
  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.software.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         license.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = licenseTypeFilter === "all" || license.licenseType === licenseTypeFilter;
    const matchesCompliance = complianceFilter === "all" || license.complianceStatus === complianceFilter;
    return matchesSearch && matchesType && matchesCompliance;
  });

  // Statistics
  const totalLicenses = licenses.reduce((sum, l) => sum + l.totalLicenses, 0);
  const usedLicenses = licenses.reduce((sum, l) => sum + l.usedLicenses, 0);
  const overDeployed = licenses.filter(l => l.complianceStatus === 'over_deployed').length;
  const totalAnnualCost = licenses.reduce((sum, l) => {
    if (l.licenseType === 'subscription') {
      return sum + (l.totalLicenses * l.costPerLicense * 12);
    }
    return sum;
  }, 0);

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "compliant": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "over_deployed": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "expiring_soon": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "expired": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case "perpetual": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "subscription": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "open_source": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "trial": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("software_license_inventory")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Software Asset Management (SAM) with compliance tracking and cost optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Boxes className="w-4 h-4 mr-2" />
            Add License
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Licenses
            </CardTitle>
            <Boxes className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLicenses.toLocaleString()}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {usedLicenses.toLocaleString()} in use ({Math.round((usedLicenses/totalLicenses) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Annual Cost
            </CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalAnnualCost / 1000).toFixed(0)}k</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Subscription licenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Over Deployed
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overDeployed}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Compliance risk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Compliance Rate
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(((licenses.length - overDeployed) / licenses.length) * 100)}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">License compliance</p>
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
                placeholder="Search by software name or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={licenseTypeFilter} onValueChange={setLicenseTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="License Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="perpetual">Perpetual</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="open_source">Open Source</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="over_deployed">Over Deployed</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Software License Table */}
      <Card>
        <CardHeader>
          <CardTitle>License Inventory ({filteredLicenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Software</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>Total / Used</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Cost Per License</TableHead>
                <TableHead>Annual Cost</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Expiration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                    No software licenses found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredLicenses.map((license) => {
                  const utilization = (license.usedLicenses / license.totalLicenses) * 100;
                  const annualCost = license.licenseType === 'subscription' 
                    ? license.totalLicenses * license.costPerLicense * 12 
                    : 0;

                  return (
                    <TableRow key={license.id}>
                      <TableCell className="font-medium">{license.software}</TableCell>
                      <TableCell>{license.vendor}</TableCell>
                      <TableCell className="text-sm">{license.version}</TableCell>
                      <TableCell>
                        <Badge className={getLicenseTypeColor(license.licenseType)}>
                          {license.licenseType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {license.totalLicenses} / {license.usedLicenses}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{utilization.toFixed(0)}%</span>
                          </div>
                          <Progress value={utilization} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {license.costPerLicense > 0 ? `$${license.costPerLicense}` : 'Free'}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {annualCost > 0 ? `$${annualCost.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getComplianceColor(license.complianceStatus)}>
                          {license.complianceStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {license.expirationDate 
                          ? new Date(license.expirationDate).toLocaleDateString() 
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cost Optimization Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Cost Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Unused Licenses</span>
                <Badge variant="outline" className="text-orange-600">
                  ${((totalLicenses - usedLicenses) * 15).toLocaleString()} potential savings
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Over-deployment</span>
                <Badge variant="outline" className="text-red-600">
                  {overDeployed} licenses need attention
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Subscription renewals</span>
                <Badge variant="outline" className="text-blue-600">
                  3 expiring in 30 days
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Compliance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Compliant Software</span>
                <Badge className="bg-green-100 text-green-800">
                  {licenses.filter(l => l.complianceStatus === 'compliant').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Audit</span>
                <span className="text-sm">7 days ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Next Scheduled Audit</span>
                <span className="text-sm">23 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
