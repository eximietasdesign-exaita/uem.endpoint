import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { cloudDiscoveryApi } from "@/lib/api/cloudDiscovery";
import { useDomainTenant } from "@/contexts/DomainTenantContext";

interface AddCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCredentialDialog({ open, onOpenChange }: AddCredentialDialogProps) {
  const queryClient = useQueryClient();
  const { selectedDomainId, selectedTenantId } = useDomainTenant();
  
  const [credentialName, setCredentialName] = useState("");
  const [providerId, setProviderId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  
  // AWS Credentials
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [awsRegion, setAwsRegion] = useState("us-east-1");
  
  // GCP Credentials
  const [gcpServiceAccountJson, setGcpServiceAccountJson] = useState("");
  
  // Azure Credentials
  const [azureTenantId, setAzureTenantId] = useState("");
  const [azureClientId, setAzureClientId] = useState("");
  const [azureClientSecret, setAzureClientSecret] = useState("");
  const [azureSubscriptionId, setAzureSubscriptionId] = useState("");

  const { data: providers } = useQuery({
    queryKey: ["cloud-providers"],
    queryFn: cloudDiscoveryApi.getProviders,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!providerId) throw new Error("Please select a provider");
      
      let credentials: Record<string, string> = {};
      
      if (selectedProvider === "aws") {
        credentials = {
          AccessKeyId: awsAccessKeyId,
          SecretAccessKey: awsSecretAccessKey,
          Region: awsRegion,
        };
      } else if (selectedProvider === "gcp") {
        credentials = {
          ServiceAccountJson: gcpServiceAccountJson,
        };
      } else if (selectedProvider === "azure") {
        credentials = {
          TenantId: azureTenantId,
          ClientId: azureClientId,
          ClientSecret: azureClientSecret,
          SubscriptionId: azureSubscriptionId,
        };
      }

      return cloudDiscoveryApi.createCredential({
        providerId,
        tenantId: selectedTenantId || undefined,
        domainId: selectedDomainId || undefined,
        credentialName,
        credentials,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cloud-credentials"] });
      queryClient.invalidateQueries({ queryKey: ["cloud-stats"] });
      resetForm();
      onOpenChange(false);
    },
  });

  const resetForm = () => {
    setCredentialName("");
    setProviderId(null);
    setSelectedProvider("");
    setAwsAccessKeyId("");
    setAwsSecretAccessKey("");
    setAwsRegion("us-east-1");
    setGcpServiceAccountJson("");
    setAzureTenantId("");
    setAzureClientId("");
    setAzureClientSecret("");
    setAzureSubscriptionId("");
  };

  const handleProviderChange = (value: string) => {
    const provider = providers?.find((p: any) => p.id.toString() === value);
    if (provider) {
      setProviderId(provider.id);
      setSelectedProvider(provider.providerType);
    }
  };

  const isFormValid = () => {
    if (!credentialName || !providerId) return false;
    
    if (selectedProvider === "aws") {
      return awsAccessKeyId && awsSecretAccessKey && awsRegion;
    } else if (selectedProvider === "gcp") {
      return gcpServiceAccountJson;
    } else if (selectedProvider === "azure") {
      return azureTenantId && azureClientId && azureClientSecret && azureSubscriptionId;
    }
    
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Cloud Credential</DialogTitle>
          <DialogDescription>
            Add credentials to connect to your cloud provider. All credentials are encrypted using AES-256.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="credential-name">Credential Name</Label>
            <Input
              id="credential-name"
              placeholder="e.g., Production AWS Account"
              value={credentialName}
              onChange={(e) => setCredentialName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Cloud Provider</Label>
            <Select value={providerId?.toString() || ""} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a cloud provider" />
              </SelectTrigger>
              <SelectContent>
                {providers?.map((provider: any) => (
                  <SelectItem key={provider.id} value={provider.id.toString()}>
                    {provider.providerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProvider === "aws" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="aws-access-key">Access Key ID</Label>
                <Input
                  id="aws-access-key"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={awsAccessKeyId}
                  onChange={(e) => setAwsAccessKeyId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aws-secret-key">Secret Access Key</Label>
                <Input
                  id="aws-secret-key"
                  type="password"
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  value={awsSecretAccessKey}
                  onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aws-region">Default Region</Label>
                <Select value={awsRegion} onValueChange={setAwsRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {selectedProvider === "gcp" && (
            <div className="space-y-2">
              <Label htmlFor="gcp-service-account">Service Account JSON</Label>
              <Textarea
                id="gcp-service-account"
                placeholder='{"type": "service_account", "project_id": "..."}'
                value={gcpServiceAccountJson}
                onChange={(e) => setGcpServiceAccountJson(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Paste the entire JSON key file from your GCP service account
              </p>
            </div>
          )}

          {selectedProvider === "azure" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="azure-tenant">Tenant ID</Label>
                <Input
                  id="azure-tenant"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  value={azureTenantId}
                  onChange={(e) => setAzureTenantId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="azure-client">Client ID</Label>
                <Input
                  id="azure-client"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  value={azureClientId}
                  onChange={(e) => setAzureClientId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="azure-secret">Client Secret</Label>
                <Input
                  id="azure-secret"
                  type="password"
                  placeholder="Enter client secret"
                  value={azureClientSecret}
                  onChange={(e) => setAzureClientSecret(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="azure-subscription">Subscription ID</Label>
                <Input
                  id="azure-subscription"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  value={azureSubscriptionId}
                  onChange={(e) => setAzureSubscriptionId(e.target.value)}
                />
              </div>
            </>
          )}

          {mutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mutation.error instanceof Error ? mutation.error.message : "Failed to add credential"}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!isFormValid() || mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Credential
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
