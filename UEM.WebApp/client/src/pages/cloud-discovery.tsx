import { useState } from "react";
import { Cloud, Plus, Settings, Play, Database, Key, Calendar, Loader2, Shield, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCloudProviders, useCloudStats, cloudDiscoveryApi } from "@/lib/api/cloudDiscovery";
import { useDomainTenant } from "@/contexts/DomainTenantContext";
import { AddCredentialDialog } from "@/components/cloud/AddCredentialDialog";
import { CreateDiscoveryJobDialog } from "@/components/cloud/CreateDiscoveryJobDialog";
import { DiscoveryJobsList } from "@/components/cloud/DiscoveryJobsList";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CloudDiscovery() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [addCredentialOpen, setAddCredentialOpen] = useState(false);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const { selectedTenant, selectedDomain } = useDomainTenant();
  const queryClient = useQueryClient();

  const selectedTenantId = selectedTenant?.id;
  const selectedDomainId = selectedDomain?.id;

  // Fetch real data from API
  const { data: providers = [], isLoading: providersLoading } = useCloudProviders();
  const { data: stats, isLoading: statsLoading } = useCloudStats(selectedTenantId || undefined, selectedDomainId || undefined);
  const { data: credentials = [], isLoading: credentialsLoading } = useQuery({
    queryKey: ["cloud-credentials", selectedTenantId, selectedDomainId],
    queryFn: () => cloudDiscoveryApi.getCredentials(selectedTenantId || undefined, selectedDomainId || undefined),
    enabled: !!selectedTenantId,
  });

  // Delete credential mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cloudDiscoveryApi.deleteCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloud-credentials"] });
      queryClient.invalidateQueries({ queryKey: ["cloud-stats"] });
    },
  });

  // Validate credential mutation
  const validateMutation = useMutation({
    mutationFn: (id: number) => cloudDiscoveryApi.validateCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloud-credentials"] });
    },
  });

  // Provider icon mapping
  const providerIcons: Record<string, string> = {
    aws: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    gcp: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
    azure: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg"
  };

  const statsCards = [
    { label: "Active Credentials", value: stats?.credentialsCount?.toString() || "0", icon: Key, color: "text-blue-600" },
    { label: "Discovery Jobs", value: stats?.jobsCount?.toString() || "0", icon: Calendar, color: "text-green-600" },
    { label: "Cloud Assets", value: stats?.assetsCount?.toString() || "0", icon: Database, color: "text-purple-600" },
    { label: "Providers", value: stats?.providersCount?.toString() || "0", icon: Cloud, color: "text-orange-600" }
  ];

  if (providersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          <Button onClick={() => setAddCredentialOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
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
                {providers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No cloud providers configured
                  </div>
                ) : (
                  providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-white p-2 flex items-center justify-center border">
                          <img
                            src={providerIcons[provider.providerType] || providerIcons['aws']}
                            alt={provider.name}
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {provider.description || `${provider.providerType.toUpperCase()} cloud provider`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={provider.isActive ? "default" : "secondary"}>
                            {provider.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Discover
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cloud Credentials</CardTitle>
                <CardDescription>
                  Manage your cloud provider credentials securely (AES-256 encrypted)
                </CardDescription>
              </div>
              <Button onClick={() => setAddCredentialOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            </CardHeader>
            <CardContent>
              {credentialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : credentials.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Credentials Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first cloud credential to start discovering resources
                  </p>
                  <Button onClick={() => setAddCredentialOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credential
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {credentials.map((cred: any) => {
                    const provider = providers.find((p) => p.id === cred.providerId);
                    return (
                      <div
                        key={cred.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-white p-2 flex items-center justify-center border">
                            <img
                              src={providerIcons[provider?.providerType || 'aws'] || providerIcons['aws']}
                              alt={provider?.name || 'Cloud Provider'}
                              className="h-6 w-6 object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{cred.credentialName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {provider?.name || 'Unknown Provider'}
                              {cred.lastValidatedAt && (
                                <span className="ml-2">
                                  • Last validated: {new Date(cred.lastValidatedAt).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="text-xs text-muted-foreground">Encrypted</span>
                          </div>
                          <Badge variant={
                            cred.validationStatus === 'valid' ? 'default' :
                            cred.validationStatus === 'invalid' ? 'destructive' :
                            'secondary'
                          }>
                            {cred.validationStatus === 'valid' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {cred.validationStatus === 'invalid' && <XCircle className="h-3 w-3 mr-1" />}
                            {cred.validationStatus || 'Pending'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => validateMutation.mutate(cred.id)}
                            disabled={validateMutation.isPending}
                          >
                            Test
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(cred.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Discovery Jobs</CardTitle>
                <CardDescription>
                  Schedule and manage automated cloud discovery jobs
                </CardDescription>
              </div>
              <Button onClick={() => setCreateJobOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </CardHeader>
            <CardContent>
              <DiscoveryJobsList tenantId={selectedTenantId || 1} />
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

      {/* Dialogs */}
      <AddCredentialDialog open={addCredentialOpen} onOpenChange={setAddCredentialOpen} />
      <CreateDiscoveryJobDialog
        open={createJobOpen}
        onOpenChange={setCreateJobOpen}
        tenantId={selectedTenantId || 1}
        domainId={selectedDomainId || 1}
      />
    </div>
  );
}
