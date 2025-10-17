import { useState } from "react";
import { Cloud, Plus, Settings, Play, Database, Key, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CloudDiscovery() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data - will be replaced with API calls
  const providers = [
    {
      id: 1,
      name: "Amazon Web Services",
      type: "aws",
      icon: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
      isActive: true,
      credentialsCount: 2,
      assetsCount: 45,
      lastDiscovery: "2 hours ago"
    },
    {
      id: 2,
      name: "Google Cloud Platform",
      type: "gcp",
      icon: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
      isActive: true,
      credentialsCount: 1,
      assetsCount: 23,
      lastDiscovery: "5 hours ago"
    },
    {
      id: 3,
      name: "Microsoft Azure",
      type: "azure",
      icon: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg",
      isActive: true,
      credentialsCount: 1,
      assetsCount: 31,
      lastDiscovery: "1 hour ago"
    }
  ];

  const stats = [
    { label: "Active Credentials", value: "4", icon: Key, color: "text-blue-600" },
    { label: "Discovery Jobs", value: "6", icon: Calendar, color: "text-green-600" },
    { label: "Cloud Assets", value: "99", icon: Database, color: "text-purple-600" },
    { label: "Providers", value: "3", icon: Cloud, color: "text-orange-600" }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cloud className="h-8 w-8 text-blue-600" />
            Cloud Discovery
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and manage resources across AWS, GCP, and Azure
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="jobs">Discovery Jobs</TabsTrigger>
          <TabsTrigger value="assets">Cloud Assets</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cloud Providers</CardTitle>
              <CardDescription>
                Manage your cloud provider connections and credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-white p-2 flex items-center justify-center border">
                        <img
                          src={provider.icon}
                          alt={provider.name}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.credentialsCount} credential{provider.credentialsCount !== 1 ? 's' : ''} • {provider.assetsCount} assets
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last discovery: {provider.lastDiscovery}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Discover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-blue-600" />
                  Add Credentials
                </CardTitle>
                <CardDescription>
                  Configure AWS, GCP, or Azure credentials
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Schedule Discovery
                </CardTitle>
                <CardDescription>
                  Create automated discovery jobs
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  View Assets
                </CardTitle>
                <CardDescription>
                  Browse discovered cloud resources
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <Card>
            <CardHeader>
              <CardTitle>Cloud Credentials</CardTitle>
              <CardDescription>
                Manage your cloud provider credentials securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Credentials Management</h3>
                <p className="text-muted-foreground mb-4">
                  This feature is coming soon. You'll be able to securely store and manage
                  cloud credentials with AES-256 encryption.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Credential
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Jobs</CardTitle>
              <CardDescription>
                Schedule and manage automated cloud discovery jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Discovery Jobs</h3>
                <p className="text-muted-foreground mb-4">
                  Create scheduled jobs to automatically discover resources across your cloud providers.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Cloud Assets</CardTitle>
              <CardDescription>
                View and manage discovered cloud resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cloud Assets</h3>
                <p className="text-muted-foreground mb-4">
                  Discovered cloud resources will appear here, including EC2 instances, S3 buckets,
                  GCE VMs, and Azure resources.
                </p>
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Run Discovery
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
