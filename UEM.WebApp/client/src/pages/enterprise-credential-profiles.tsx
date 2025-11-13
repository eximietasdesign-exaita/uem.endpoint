import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Key,
  Shield,
  Server,
  Database,
  Wifi,
  Cloud,
  Terminal,
  Settings,
  Lock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Activity,
  Eye,
  EyeOff,
  RotateCw,
  Download,
  Upload,
  FileText,
  Zap,
  Globe,
  Users,
  Clock,
  AlertTriangle,
  Vault,
  HardDrive,
  RefreshCw,
  UserCheck,
  Star,
  TrendingUp,
  Layers,
  Filter,
  SortAsc,
  MoreHorizontal
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { CredentialProfile } from "@shared/schema";

// Enterprise-grade credential categories and types
const credentialCategories = [
  { value: 'general', label: 'General', icon: Key, color: 'bg-slate-500' },
  { value: 'system', label: 'System', icon: Server, color: 'bg-blue-500' },
  { value: 'network', label: 'Network', icon: Wifi, color: 'bg-green-500' },
  { value: 'cloud', label: 'Cloud', icon: Cloud, color: 'bg-purple-500' },
  { value: 'database', label: 'Database', icon: Database, color: 'bg-indigo-500' },
  { value: 'security', label: 'Security', icon: Shield, color: 'bg-red-500' }
];

const credentialTypes = [
  { value: 'ssh', label: 'SSH', icon: Terminal, category: 'system' },
  { value: 'rdp', label: 'RDP', icon: Server, category: 'system' },
  { value: 'winrm', label: 'WinRM', icon: Server, category: 'system' },
  { value: 'snmp', label: 'SNMP', icon: Wifi, category: 'network' },
  { value: 'api_key', label: 'API Key', icon: Key, category: 'general' },
  { value: 'certificate', label: 'Certificate', icon: Shield, category: 'security' },
  { value: 'token', label: 'Token', icon: Lock, category: 'security' },
  { value: 'database', label: 'Database', icon: Database, category: 'database' },
  { value: 'cloud', label: 'Cloud Service', icon: Cloud, category: 'cloud' },
  { value: 'service_account', label: 'Service Account', icon: UserCheck, category: 'security' }
];

const vaultProviders = [
  { value: 'internal', label: 'Internal Vault', icon: HardDrive },
  { value: 'hashicorp', label: 'HashiCorp Vault', icon: Vault },
  { value: 'azure', label: 'Azure Key Vault', icon: Cloud },
  { value: 'aws', label: 'AWS Secrets Manager', icon: Cloud },
  { value: 'cyberark', label: 'CyberArk', icon: Shield },
];

const complianceLevels = [
  { value: 'standard', label: 'Standard', color: 'bg-blue-500' },
  { value: 'sox', label: 'SOX Compliant', color: 'bg-purple-500' },
  { value: 'pci', label: 'PCI DSS', color: 'bg-green-500' },
  { value: 'hipaa', label: 'HIPAA', color: 'bg-orange-500' },
  { value: 'iso27001', label: 'ISO 27001', color: 'bg-red-500' }
];

const accessLevels = [
  { value: 'restricted', label: 'Restricted', color: 'bg-red-600' },
  { value: 'standard', label: 'Standard', color: 'bg-blue-500' },
  { value: 'elevated', label: 'Elevated', color: 'bg-orange-500' },
  { value: 'administrative', label: 'Administrative', color: 'bg-purple-600' }
];

export default function EnterpriseCredentialProfilesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // vault provider specific config state
      type InternalConfig = {
        baseApiUrl: string;
        secretPath: string;
        authToken: string;
        environmentContext: string;
        responseFormat: 'json' | 'text';
      };
  
      type HashicorpConfig = {
        vaultUrl: string;
        secretEnginePath: string;
        authMethod: 'Token' | 'AppRole' | 'Kubernetes';
        token: string;
        roleId: string;
        secretId: string;
        k8sRole: string;
        serviceAccountTokenPath: string;
        fieldSelector: string;
      };
  
      type AzureConfig = {
        vaultName: string;
        vaultUrl: string;
        secretName: string;
        tenantId: string;
        clientId: string;
        clientSecret: string;
        apiVersion: string;
        secretVersion: string;
      };
  
      type AwsConfig = {
        secretNameOrArn: string;
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken: string;
        versionStage: string;
        decryptionOption: string;
      };
  
      type CyberarkConfig = {
        apiEndpoint: string;
        safeName: string;
        objectName: string;
        appId: string;
        authType: string;
        policyId: string;
        returnFormat: string;
      };
  
      type VaultConfig = {
        internal: InternalConfig;
        hashicorp: HashicorpConfig;
        azure: AzureConfig;
        aws: AwsConfig;
        cyberark: CyberarkConfig;
      };
  
      const [vaultConfig, setVaultConfig] = useState<VaultConfig>({
        internal: { baseApiUrl: "", secretPath: "", authToken: "", environmentContext: "", responseFormat: "json" },
        hashicorp: { vaultUrl: "", secretEnginePath: "", authMethod: "Token", token: "", roleId: "", secretId: "", k8sRole: "", serviceAccountTokenPath: "", fieldSelector: "" },
        azure: { vaultName: "", vaultUrl: "", secretName: "", tenantId: "", clientId: "", clientSecret: "", apiVersion: "7.3", secretVersion: "" },
        aws: { secretNameOrArn: "", region: "us-east-1", accessKeyId: "", secretAccessKey: "", sessionToken: "", versionStage: "AWSCURRENT", decryptionOption: "default" },
        cyberark: { apiEndpoint: "", safeName: "", objectName: "", appId: "", authType: "CyberArk User", policyId: "", returnFormat: "text" }
      });
    
    // Move newProfile state above currentVaultErrors so it can be referenced safely
    const [newProfile, setNewProfile] = useState({
      name: '',
      description: '',
      category: 'general',
      encryptionLevel: 'aes256',
      complianceLevel: 'standard',
      accessLevel: 'standard',
      vaultProvider: 'internal',
      storageType: 'encrypted',
      localEncryption: true,
      monitoringEnabled: true,
      alertingEnabled: false,
      tags: [] as string[],
      environments: [] as string[],
      rotationPolicy: {
        enabled: false,
        intervalDays: 90,
        autoRotate: false,
        notifyBefore: 7,
        backupPrevious: true
      },
      accessRestrictions: {
        ipWhitelist: [] as string[],
        timeRestrictions: {
          allowedHours: '9-17',
          timezone: 'UTC'
        },
        maxConcurrentUsers: 10,
        requireApproval: false,
        approvers: [] as string[]
      }
    });
  
  // Compute validation errors for the selected vault provider configuration
  const currentVaultErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    const provider = newProfile.vaultProvider;

    if (provider === "internal") {
      if (!vaultConfig.internal.baseApiUrl) errors.baseApiUrl = "Base API URL is required";
      if (!vaultConfig.internal.secretPath) errors.secretPath = "Secret Path is required";
      if (!vaultConfig.internal.authToken) errors.authToken = "Auth Token is required";
      if (!vaultConfig.internal.environmentContext) errors.environmentContext = "Environment Context is required";
      if (!['json','text'].includes((vaultConfig.internal.responseFormat || '').toLowerCase())) errors.responseFormat = "Response format must be 'json' or 'text'";
    }

    if (provider === "hashicorp") {
      if (!vaultConfig.hashicorp.vaultUrl) errors.vaultUrl = "Vault URL is required";
      if (!vaultConfig.hashicorp.secretEnginePath) errors.secretEnginePath = "Secret Engine Path is required";
      if (vaultConfig.hashicorp.authMethod === "Token" && !vaultConfig.hashicorp.token) errors.token = "Token is required";
      if (vaultConfig.hashicorp.authMethod === "AppRole") {
        if (!vaultConfig.hashicorp.roleId) errors.roleId = "Role ID is required";
        if (!vaultConfig.hashicorp.secretId) errors.secretId = "Secret ID is required";
      }
      if (vaultConfig.hashicorp.authMethod === "Kubernetes" && !vaultConfig.hashicorp.k8sRole) errors.k8sRole = "K8s Role is required";
    }

    if (provider === "azure") {
      if (!vaultConfig.azure.vaultName) errors.vaultName = "Vault Name is required";
      if (!vaultConfig.azure.vaultUrl) errors.azureVaultUrl = "Vault URL is required";
      if (!vaultConfig.azure.secretName) errors.secretName = "Secret Name is required";
      if (!vaultConfig.azure.tenantId) errors.tenantId = "Tenant ID is required";
      if (!vaultConfig.azure.clientId) errors.clientId = "Client ID is required";
      if (!vaultConfig.azure.clientSecret) errors.clientSecret = "Client Secret is required";
    }

    if (provider === "aws") {
      if (!vaultConfig.aws.secretNameOrArn) errors.secretNameOrArn = "Secret Name/ARN is required";
      if (!vaultConfig.aws.region) errors.region = "Region is required";
      if (!vaultConfig.aws.accessKeyId) errors.accessKeyId = "Access Key ID is required";
      if (!vaultConfig.aws.secretAccessKey) errors.secretAccessKey = "Secret Access Key is required";
      if (!vaultConfig.aws.versionStage) errors.versionStage = "Version Stage is required";
    }

    if (provider === "cyberark") {
      if (!vaultConfig.cyberark.apiEndpoint) errors.apiEndpoint = "API Endpoint is required";
      if (!vaultConfig.cyberark.safeName) errors.safeName = "Safe Name is required";
      if (!vaultConfig.cyberark.objectName) errors.objectName = "Object/Secret Name is required";
      if (!vaultConfig.cyberark.appId) errors.appId = "App ID is required";
    }

    return errors;
  }, [vaultConfig, newProfile]);

  const hasVaultErrors = Object.keys(currentVaultErrors).length > 0;

  // Helper to render a Label with a red superscript star when validation error exists for the field
  const fieldDisplayNames: Record<string,string> = {
    // Internal
    baseApiUrl: "Base API URL",
    secretPath: "Secret Path / Key",
    authToken: "Auth Token / API Key",
    environmentContext: "Environment Context",
    responseFormat: "Response Format",
    // Hashicorp
    vaultUrl: "Vault URL",
    secretEnginePath: "Secret Engine Path",
    authMethod: "Authentication Method",
    token: "Token",
    roleId: "Role ID",
    secretId: "Secret ID",
    k8sRole: "K8s Role",
    serviceAccountTokenPath: "Service Account Token Path",
    // Azure
    vaultName: "Vault Name",
    azureVaultUrl: "Vault URL",
    secretName: "Secret Name",
    tenantId: "Tenant ID",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    // AWS
    secretNameOrArn: "Secret Name / ARN",
    region: "Region",
    accessKeyId: "Access Key ID",
    secretAccessKey: "Secret Access Key",
    versionStage: "Version Stage",
    // CyberArk
    apiEndpoint: "API Endpoint",
    safeName: "Safe Name",
    objectName: "Object / Secret Name",
    appId: "App ID / Client ID",
    returnFormat: "Return Format"
  };

  const FieldLabel = ({ field, children }: { field: string; children: React.ReactNode }) => {
    const error = currentVaultErrors[field];
    return (
      <Label>
        {children}
        {error && (
          <sup
            className="text-red-500 ml-1"
            aria-hidden="true"
            title={error}
          >
            *
          </sup>
        )}
      </Label>
    );
  };
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<CredentialProfile | null>(null);

  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch credential profiles (use apiRequest so requests go to configured backend + tenant headers)
  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['/api/credential-profiles'],
    queryFn: async () => {
  const res = await apiRequest('GET', '/api/credential-profiles');
  const data = await res.json();
  return data;
 },
    staleTime: 30_000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (profile: any) => {
  const res = await apiRequest('POST', '/api/credential-profiles', profile);
  return await res.json();
},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credential-profiles'] });
      toast({
        title: "Success",
        description: "Enterprise credential profile created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create credential profile",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & any) => {
  const res = await apiRequest('PATCH', `/api/credential-profiles/${id}`, updates);
  return await res.json();
},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credential-profiles'] });
      toast({
        title: "Success",
        description: "Credential profile updated successfully",
      });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update credential profile",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
  const res = await apiRequest('DELETE', `/api/credential-profiles/${id}`);
  return await res.json();
},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credential-profiles'] });
      toast({
        title: "Success",
        description: "Credential profile deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete credential profile",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewProfile({
      name: '',
      description: '',
      category: 'general',
      encryptionLevel: 'aes256',
      complianceLevel: 'standard',
      accessLevel: 'standard',
      vaultProvider: 'internal',
      storageType: 'encrypted',
      localEncryption: true,
      monitoringEnabled: true,
      alertingEnabled: false,
      tags: [],
      environments: [],
      rotationPolicy: {
        enabled: false,
        intervalDays: 90,
        autoRotate: false,
        notifyBefore: 7,
        backupPrevious: true
      },
      accessRestrictions: {
        ipWhitelist: [],
        timeRestrictions: {
          allowedHours: '9-17',
          timezone: 'UTC'
        },
        maxConcurrentUsers: 10,
        requireApproval: false,
        approvers: []
      }
    });
  };

  // Filter profiles based on search and category
  const filteredProfiles = profiles.filter((profile: CredentialProfile) => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || profile.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProfile = () => {
    if (!newProfile.name.trim()) {
      toast({
        title: "Error",
        description: "Profile name is required",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(newProfile);
  };

  const handleEditProfile = (profile: CredentialProfile) => {
    setSelectedProfile(profile);
    setNewProfile({
      name: profile.name,
      description: profile.description || '',
      category: profile.category || 'general',
      encryptionLevel: profile.encryptionLevel || 'aes256',
      complianceLevel: profile.complianceLevel || 'standard',
      accessLevel: profile.accessLevel || 'standard',
      vaultProvider: profile.vaultProvider || 'internal',
      storageType: profile.storageType || 'encrypted',
      localEncryption: profile.localEncryption || true,
      monitoringEnabled: profile.monitoringEnabled || true,
      alertingEnabled: profile.alertingEnabled || false,
      tags: profile.tags || [],
      environments: profile.environments || [],
      rotationPolicy: profile.rotationPolicy || {
        enabled: false,
        intervalDays: 90,
        autoRotate: false,
        notifyBefore: 7,
        backupPrevious: true
      },
      accessRestrictions: profile.accessRestrictions || {
        ipWhitelist: [],
        timeRestrictions: {
          allowedHours: '9-17',
          timezone: 'UTC'
        },
        maxConcurrentUsers: 10,
        requireApproval: false,
        approvers: []
      }
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProfile = () => {
    if (!selectedProfile || !newProfile.name.trim()) {
      toast({
        title: "Error",
        description: "Profile name is required",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      id: selectedProfile.id,
      ...newProfile
    });
  };

  const handleDeleteProfile = (profileId: number) => {
    if (confirm('Are you sure you want to delete this credential profile? This action cannot be undone.')) {
      deleteMutation.mutate(profileId);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = credentialCategories.find(c => c.value === category);
    return cat ? cat.icon : Key;
  };

  const getCategoryColor = (category: string) => {
    const cat = credentialCategories.find(c => c.value === category);
    return cat ? cat.color : 'bg-slate-500';
  };

  const getComplianceColor = (compliance: string) => {
    const comp = complianceLevels.find(c => c.value === compliance);
    return comp ? comp.color : 'bg-blue-500';
  };

  const getAccessLevelColor = (accessLevel: string) => {
    const level = accessLevels.find(l => l.value === accessLevel);
    return level ? level.color : 'bg-blue-500';
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-muted-foreground">Loading enterprise credential vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading credential profiles</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      
      {/* Enterprise Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Enterprise Credential Vault
              </h1>
              <p className="text-muted-foreground">
                Advanced credential management with enterprise-grade security, compliance, and audit capabilities
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <Vault className="w-3 h-3 mr-1" />
              Multi-Vault Integration
            </Badge>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              SOC 2 Compliant
            </Badge>
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200">
              <Lock className="w-3 h-3 mr-1" />
              Zero-Trust Architecture
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New Credential Profile
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profiles</p>
                <p className="text-2xl font-bold text-blue-600">{profiles.length}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Credentials</p>
                <p className="text-2xl font-bold text-green-600">
                  {profiles.filter((p: CredentialProfile) => p.isActive).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">3</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Issues</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filters and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search credential profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {credentialCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center gap-2">
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <SortAsc className="w-4 h-4 mr-2" />
            Sort
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Credential Profiles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-muted rounded-full">
                <Vault className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No credential profiles found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first enterprise credential profile to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              </div>
            </div>
          </div>
        ) : (
          filteredProfiles.map((profile: CredentialProfile) => {
            const CategoryIcon = getCategoryIcon(profile.category || 'general');
            
            return (
              <Card key={profile.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", getCategoryColor(profile.category || 'general'))}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {profile.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {profile.category && credentialCategories.find(c => c.value === profile.category)?.label} Profile
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={profile.isActive ? "default" : "secondary"} className="text-xs">
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {profile.description || "No description provided"}
                  </p>

                  {/* Security & Compliance Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn("text-xs", getComplianceColor(profile.complianceLevel || 'standard'))}>
                      <Shield className="w-3 h-3 mr-1" />
                      {complianceLevels.find(c => c.value === (profile.complianceLevel || 'standard'))?.label}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", getAccessLevelColor(profile.accessLevel || 'standard'))}>
                      <Lock className="w-3 h-3 mr-1" />
                      {accessLevels.find(l => l.value === (profile.accessLevel || 'standard'))?.label}
                    </Badge>
                    {profile.vaultProvider && profile.vaultProvider !== 'internal' && (
                      <Badge variant="outline" className="text-xs">
                        <Vault className="w-3 h-3 mr-1" />
                        {vaultProviders.find(v => v.value === profile.vaultProvider)?.label}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Uses:</span>
                      <span className="font-medium">{profile.usageCount || 0}</span>
                    </div>
                    {profile.lastUsed && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last:</span>
                        <span className="font-medium">{formatDate(profile.lastUsed)}</span>
                      </div>
                    )}
                  </div>

                  {/* Rotation Status */}
                  {profile.rotationPolicy?.enabled && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <RotateCw className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-300">
                        Auto-rotation enabled ({profile.rotationPolicy.intervalDays}d interval)
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setIsViewDialogOpen(true);
                        }}
                        className="text-muted-foreground hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                        className="text-muted-foreground hover:text-green-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button variant="outline" size="sm" className="group-hover:bg-blue-50 group-hover:border-blue-200">
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Profile Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open && isCreateDialogOpen);
        setIsEditDialogOpen(open && isEditDialogOpen);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              {isCreateDialogOpen ? 'Create Enterprise Credential Profile' : 'Edit Credential Profile'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="access">Access Control</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-name">Profile Name *</Label>
                  <Input
                    id="profile-name"
                    value={newProfile.name}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter profile name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="profile-category">Category</Label>
                  <Select value={newProfile.category} onValueChange={(value) => setNewProfile(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {credentialCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="profile-description">Description</Label>
                <Textarea
                  id="profile-description"
                  value={newProfile.description}
                  onChange={(e) => setNewProfile(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and scope of this credential profile"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Environments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['production', 'staging', 'development', 'test'].map((env) => (
                      <Badge
                        key={env}
                        variant={newProfile.environments.includes(env) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const envs = newProfile.environments.includes(env)
                            ? newProfile.environments.filter(e => e !== env)
                            : [...newProfile.environments, env];
                          setNewProfile(prev => ({ ...prev, environments: envs }));
                        }}
                      >
                        {env}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Tags</Label>
                  <Input
                    placeholder="Add tags (comma-separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value && !newProfile.tags.includes(value)) {
                          setNewProfile(prev => ({ ...prev, tags: [...prev.tags, value] }));
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newProfile.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs cursor-pointer" onClick={() => {
                        setNewProfile(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
                      }}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Encryption Level</Label>
                  <Select value={newProfile.encryptionLevel} onValueChange={(value) => setNewProfile(prev => ({ ...prev, encryptionLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes256">AES-256</SelectItem>
                      <SelectItem value="rsa2048">RSA-2048</SelectItem>
                      <SelectItem value="ecc">ECC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Compliance Level</Label>
                  <Select value={newProfile.complianceLevel} onValueChange={(value) => setNewProfile(prev => ({ ...prev, complianceLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {complianceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vault Provider</Label>
                  <Select value={newProfile.vaultProvider} onValueChange={(value) => {
                    setNewProfile(prev => ({ ...prev, vaultProvider: value }));
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vaultProviders.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <div className="flex items-center gap-2">
                            <provider.icon className="w-4 h-4" />
                            {provider.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Storage Type</Label>
                  <Select value={newProfile.storageType} onValueChange={(value) => setNewProfile(prev => ({ ...prev, storageType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="encrypted">Encrypted Local</SelectItem>
                      <SelectItem value="vault">External Vault</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Provider-specific security configuration */}
              <div className="mt-4 p-4 border rounded-lg bg-surface">
                {newProfile.vaultProvider === "internal" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <FieldLabel field="baseApiUrl">Base API URL</FieldLabel>
                      <Input value={vaultConfig.internal.baseApiUrl} onChange={(e) => setVaultConfig(prev => ({ ...prev, internal: { ...prev.internal, baseApiUrl: e.target.value } }))} placeholder="https://internal-vault/api/v1/" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="secretPath">Secret Path / Key</FieldLabel>
                      <Input value={vaultConfig.internal.secretPath} onChange={(e) => setVaultConfig(prev => ({ ...prev, internal: { ...prev.internal, secretPath: e.target.value } }))} placeholder="app/config/db_password" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="authToken">Auth Token / API Key</FieldLabel>
                      <Input value={vaultConfig.internal.authToken} onChange={(e) => setVaultConfig(prev => ({ ...prev, internal: { ...prev.internal, authToken: e.target.value } }))} placeholder="abc123xyz890" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="environmentContext">Environment Context</FieldLabel>
                      <Input value={vaultConfig.internal.environmentContext} onChange={(e) => setVaultConfig(prev => ({ ...prev, internal: { ...prev.internal, environmentContext: e.target.value } }))} placeholder="production" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="responseFormat">Response Format</FieldLabel>
                      <Select value={vaultConfig.internal.responseFormat} onValueChange={(value) => setVaultConfig(prev => ({ ...prev, internal: { ...prev.internal, responseFormat: value as InternalConfig['responseFormat'] } }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {newProfile.vaultProvider === "hashicorp" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <FieldLabel field="vaultUrl">Vault URL</FieldLabel>
                      <Input value={vaultConfig.hashicorp.vaultUrl} onChange={(e) => setVaultConfig(prev => ({ ...prev, hashicorp: { ...prev.hashicorp, vaultUrl: e.target.value } }))} placeholder="https://vault.company.com:8200/v1" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="secretEnginePath">Secret Engine Path</FieldLabel>
                      <Input value={vaultConfig.hashicorp.secretEnginePath} onChange={(e) => setVaultConfig(prev => ({ ...prev, hashicorp: { ...prev.hashicorp, secretEnginePath: e.target.value } }))} placeholder="secret/data/application/config" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="authMethod">Authentication Method</FieldLabel>
                      <Select value={vaultConfig.hashicorp.authMethod} onValueChange={(value) => setVaultConfig(prev => ({ ...prev, hashicorp: { ...prev.hashicorp, authMethod: value as HashicorpConfig['authMethod'] } }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Token">Token</SelectItem>
                          <SelectItem value="AppRole">AppRole</SelectItem>
                          <SelectItem value="Kubernetes">Kubernetes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {vaultConfig.hashicorp.authMethod === "Token" && (
                      <div className="space-y-1">
                        <FieldLabel field="token">Token</FieldLabel>
                        <Input value={vaultConfig.hashicorp.token} onChange={(e) => setVaultConfig(prev => ({ ...prev, hashicorp: { ...prev.hashicorp, token: e.target.value } }))} placeholder="s.123456789abcdef" />
                      </div>
                    )}

                    {vaultConfig.hashicorp.authMethod === "AppRole" && (
                      <div className="space-y-1">
                        <FieldLabel field="roleId">Role ID</FieldLabel>
                        <Input value={vaultConfig.hashicorp.roleId} onChange={(e) => setVaultConfig(prev => ({ ...prev, hashicorp: { ...prev.hashicorp, roleId: e.target.value } }))} placeholder="abcd1234-efgh5678" />
                        <FieldLabel field="secretId">Secret ID</FieldLabel>
                        <Input value={vaultConfig.hashicorp.secretId} onChange={(e) => setVaultConfig(prev => ({ ...prev, hashicorp: { ...prev.hashicorp, secretId: e.target.value } }))} placeholder="xyz9876-lmn5432" />
                      </div>
                    )}

                    {vaultConfig.hashicorp.authMethod === "Kubernetes" && (
                      <div className="space-y-1">
                        <FieldLabel field="k8sRole">K8s Role</FieldLabel>
                        <Input value={vaultConfig.hashicorp.k8sRole} onChange={(e) => setVaultConfig(prev => ({ ...prev, hashicorp: { ...prev.hashicorp, k8sRole: e.target.value } }))} placeholder="vault-reader-role" />
                        <FieldLabel field="serviceAccountTokenPath">Service Account Token Path</FieldLabel>
                        <Input value={vaultConfig.hashicorp.serviceAccountTokenPath} onChange={(e) => setVaultConfig(prev => ({ ...prev, hashicorp: { ...prev.hashicorp, serviceAccountTokenPath: e.target.value } }))} placeholder="/var/run/secrets/kubernetes.io/serviceaccount/token" />
                      </div>
                    )}
                  </div>
                )}

                {newProfile.vaultProvider === "azure" && (
                  <div className="space-y-4">

                    <div className="space-y-1">
                      <FieldLabel field="vaultName">Vault Name</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.azure.vaultName} onChange={(e) => setVaultConfig(prev => ({ ...prev, azure: { ...prev.azure, vaultName: e.target.value } }))} placeholder="myapp-kv-prod" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="azureVaultUrl">Vault URL</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.azure.vaultUrl} onChange={(e) => setVaultConfig(prev => ({ ...prev, azure: { ...prev.azure, vaultUrl: e.target.value } }))} placeholder="https://myapp-kv-prod.vault.azure.net/" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="secretName">Secret Name</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.azure.secretName} onChange={(e) => setVaultConfig(prev => ({ ...prev, azure: { ...prev.azure, secretName: e.target.value } }))} placeholder="DbConnectionString" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="tenantId">Tenant ID</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.azure.tenantId} onChange={(e) => setVaultConfig(prev => ({ ...prev, azure: { ...prev.azure, tenantId: e.target.value } }))} placeholder="00000000-0000-0000-0000-000000000000" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="clientId">Client ID</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.azure.clientId} onChange={(e) => setVaultConfig(prev => ({ ...prev, azure: { ...prev.azure, clientId: e.target.value } }))} placeholder="11111111-1111-1111-1111-111111111111" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="clientSecret">Client Secret</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.azure.clientSecret} onChange={(e) => setVaultConfig(prev => ({ ...prev, azure: { ...prev.azure, clientSecret: e.target.value } }))} placeholder="••••••••" type="password" />
                    </div>
                  </div>
                )}
 
                {newProfile.vaultProvider === "aws" && (
                  <div className="space-y-4">

                    <div className="space-y-1">
                      <FieldLabel field="secretNameOrArn">Secret Name / ARN</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.aws.secretNameOrArn} onChange={(e) => setVaultConfig(prev => ({ ...prev, aws: { ...prev.aws, secretNameOrArn: e.target.value } }))} placeholder="arn:aws:secretsmanager:us-east-1:1234567890:secret:myapp/dbpass-abc123" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="region">Region</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.aws.region} onChange={(e) => setVaultConfig(prev => ({ ...prev, aws: { ...prev.aws, region: e.target.value } }))} placeholder="us-east-1" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="accessKeyId">Access Key ID</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.aws.accessKeyId} onChange={(e) => setVaultConfig(prev => ({ ...prev, aws: { ...prev.aws, accessKeyId: e.target.value } }))} placeholder="AKIAIOSFODNN7EXAMPLE" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="secretAccessKey">Secret Access Key</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.aws.secretAccessKey} onChange={(e) => setVaultConfig(prev => ({ ...prev, aws: { ...prev.aws, secretAccessKey: e.target.value } }))} placeholder="••••••••" type="password" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="versionStage">Version Stage</FieldLabel>
                      <Select value={vaultConfig.aws.versionStage} onValueChange={(value) => setVaultConfig(prev => ({ ...prev, aws: { ...prev.aws, versionStage: value } }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AWSCURRENT">AWSCURRENT</SelectItem>
                          <SelectItem value="AWSPREVIOUS">AWSPREVIOUS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
 
                {newProfile.vaultProvider === "cyberark" && (
                  <div className="space-y-4">

                    <div className="space-y-1">
                      <FieldLabel field="apiEndpoint">API Endpoint</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.cyberark.apiEndpoint} onChange={(e) => setVaultConfig(prev => ({ ...prev, cyberark: { ...prev.cyberark, apiEndpoint: e.target.value } }))} placeholder="https://cyberark.company.com/AIMWebService/api/Accounts" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="safeName">Safe Name</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.cyberark.safeName} onChange={(e) => setVaultConfig(prev => ({ ...prev, cyberark: { ...prev.cyberark, safeName: e.target.value } }))} placeholder="ProdAppSecrets" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="objectName">Object / Secret Name</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.cyberark.objectName} onChange={(e) => setVaultConfig(prev => ({ ...prev, cyberark: { ...prev.cyberark, objectName: e.target.value } }))} placeholder="DatabaseAdminPassword" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="appId">App ID / Client ID</FieldLabel>
                      <Input required aria-required="true" value={vaultConfig.cyberark.appId} onChange={(e) => setVaultConfig(prev => ({ ...prev, cyberark: { ...prev.cyberark, appId: e.target.value } }))} placeholder="myapp-prod" />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel field="returnFormat">Return Format</FieldLabel>
                      <Select value={vaultConfig.cyberark.returnFormat} onValueChange={(value) => setVaultConfig(prev => ({ ...prev, cyberark: { ...prev.cyberark, returnFormat: value } }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
 
                {/* show summary of missing/invalid fields - friendly names + messages, consistent spacing */}
                {hasVaultErrors && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded">
                    <p className="text-sm font-medium text-red-700 mb-3">Vault configuration has issues:</p>
                    <ul className="text-sm text-red-600 list-disc ml-5 space-y-3">
                      {Object.keys(currentVaultErrors).map((k) => (
                        <li key={k}>
                          <div className="font-medium text-red-700">{fieldDisplayNames[k] ?? k}</div>
                          <div className="text-xs text-red-600 mt-1">{currentVaultErrors[k]}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* end provider-specific */}
            </TabsContent>
            
            <TabsContent value="access" className="space-y-4">
              <div>
                <Label>Access Level</Label>
                <Select value={newProfile.accessLevel} onValueChange={(value) => setNewProfile(prev => ({ ...prev, accessLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Concurrent Users</Label>
                  <Input
                    type="number"
                    value={newProfile.accessRestrictions.maxConcurrentUsers}
                    onChange={(e) => setNewProfile(prev => ({
                      ...prev,
                      accessRestrictions: {
                        ...prev.accessRestrictions,
                        maxConcurrentUsers: parseInt(e.target.value) || 10
                      }
                    }))}
                  />
                </div>
                
                <div>
                  <Label>Allowed Hours</Label>
                  <Input
                    value={newProfile.accessRestrictions.timeRestrictions.allowedHours}
                    onChange={(e) => setNewProfile(prev => ({
                      ...prev,
                      accessRestrictions: {
                        ...prev.accessRestrictions,
                        timeRestrictions: {
                          ...prev.accessRestrictions.timeRestrictions,
                          allowedHours: e.target.value
                        }
                      }
                    }))}
                    placeholder="9-17"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Require Approval</Label>
                  <p className="text-sm text-muted-foreground">Require approval before credential access</p>
                </div>
                <Switch
                  checked={newProfile.accessRestrictions.requireApproval}
                  onCheckedChange={(requireApproval) => setNewProfile(prev => ({
                    ...prev,
                    accessRestrictions: { ...prev.accessRestrictions, requireApproval }
                  }))}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Enable access monitoring</p>
                  </div>
                  <Switch
                    checked={newProfile.monitoringEnabled}
                    onCheckedChange={(monitoringEnabled) => setNewProfile(prev => ({ ...prev, monitoringEnabled }))}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Alerting</Label>
                    <p className="text-sm text-muted-foreground">Enable security alerts</p>
                  </div>
                  <Switch
                    checked={newProfile.alertingEnabled}
                    onCheckedChange={(alertingEnabled) => setNewProfile(prev => ({ ...prev, alertingEnabled }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={isCreateDialogOpen ? handleCreateProfile : handleUpdateProfile}
              disabled={createMutation.isPending || updateMutation.isPending || hasVaultErrors}
               className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
             >
               {createMutation.isPending || updateMutation.isPending ? (
                 <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
               ) : (
                 <Shield className="w-4 h-4 mr-2" />
               )}
               {isCreateDialogOpen ? 'Create Profile' : 'Update Profile'}
             </Button>
           </div>
         </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Credential Profile Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center", getCategoryColor(selectedProfile.category || 'general'))}>
                  {React.createElement(getCategoryIcon(selectedProfile.category || 'general'), { className: "w-8 h-8 text-white" })}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedProfile.name}</h3>
                  <p className="text-muted-foreground">{selectedProfile.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={selectedProfile.isActive ? "default" : "secondary"}>
                      {selectedProfile.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {credentialCategories.find(c => c.value === selectedProfile.category)?.label || 'General'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                  <TabsTrigger value="audit">Audit</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Compliance Level</Label>
                      <p className="font-medium">{complianceLevels.find(c => c.value === selectedProfile.complianceLevel)?.label}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Access Level</Label>
                      <p className="font-medium">{accessLevels.find(l => l.value === selectedProfile.accessLevel)?.label}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Vault Provider</Label>
                      <p className="font-medium">{vaultProviders.find(v => v.value === selectedProfile.vaultProvider)?.label}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Storage Type</Label>
                      <p className="font-medium capitalize">{selectedProfile.storageType}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Encryption Level</Label>
                      <p className="font-medium">{selectedProfile.encryptionLevel}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Local Encryption</Label>
                      <p className="font-medium">{selectedProfile.localEncryption ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Monitoring</Label>
                      <p className="font-medium">{selectedProfile.monitoringEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Alerting</Label>
                      <p className="font-medium">{selectedProfile.alertingEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="usage" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Usage Count</Label>
                      <p className="text-2xl font-bold text-blue-600">{selectedProfile.usageCount || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Used</Label>
                      <p className="font-medium">
                        {selectedProfile.lastUsed ? formatDate(selectedProfile.lastUsed) : 'Never'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="audit" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="font-medium">{formatDate(selectedProfile.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Modified</Label>
                      <p className="font-medium">{formatDate(selectedProfile.updatedAt)}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}