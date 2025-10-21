import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Activity
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { CredentialProfile } from "@shared/schema";
import { useTenantData, useTenantContext } from "@/hooks/useTenantData";

// Helper function to parse credential data
const parseCredentials = (credentialsJson: string | null) => {
  if (!credentialsJson) return [];
  try {
    return JSON.parse(credentialsJson);
  } catch {
    return [];
  }
};

const credentialTypes = [
  { value: 'ssh', label: 'SSH', icon: Terminal, color: 'bg-blue-500' },
  { value: 'windows', label: 'Windows', icon: Server, color: 'bg-green-500' },
  { value: 'snmp', label: 'SNMP', icon: Wifi, color: 'bg-purple-500' },
  { value: 'aws', label: 'AWS', icon: Cloud, color: 'bg-orange-500' },
  { value: 'azure', label: 'Azure', icon: Cloud, color: 'bg-blue-600' },
  { value: 'gcp', label: 'GCP', icon: Cloud, color: 'bg-red-500' },
  { value: 'database', label: 'Database', icon: Database, color: 'bg-indigo-500' },
  { value: 'network', label: 'Network', icon: Wifi, color: 'bg-teal-500' },
  { value: 'service', label: 'Service', icon: Settings, color: 'bg-yellow-500' },
  { value: 'cloud', label: 'Cloud', icon: Cloud, color: 'bg-cyan-500' },
  { value: 'mainframe', label: 'Mainframe', icon: Server, color: 'bg-gray-500' },
  { value: 'legacy', label: 'Legacy', icon: Server, color: 'bg-stone-500' }
];

export default function CredentialProfilesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<CredentialProfile | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCredentialDialogOpen, setIsAddCredentialDialogOpen] = useState(false);
  const [editingCredentials, setEditingCredentials] = useState<any[]>([]);
  const [newProfile, setNewProfile] = useState({ name: '', description: '', credentials: '[]' });
  const [newCredential, setNewCredential] = useState({
    type: 'windows',
    storage: 'vault',
    username: '',
    password: '',
    domain: '',
    protocol: '',
    vaultPath: ''
  });
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch credential profiles from API
  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['/api/credential-profiles'],
    queryFn: async () => {
      const response = await fetch('/api/credential-profiles');
      if (!response.ok) throw new Error('Failed to fetch credential profiles');
      return response.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (profile: { name: string; description: string; credentials: string }) => {
      const response = await fetch('/api/credential-profiles', {
        method: 'POST',
        body: JSON.stringify(profile),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credential-profiles'] });
      toast({
        title: "Success",
        description: "Credential profile created successfully",
      });
      setIsCreateDialogOpen(false);
      setNewProfile({ name: '', description: '', credentials: '[]' });
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
    mutationFn: async ({ id, ...updates }: { id: number; name?: string; description?: string; credentials?: string }) => {
      const response = await fetch(`/api/credential-profiles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
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
      const response = await fetch(`/api/credential-profiles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete profile');
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

  // Filter profiles based on search
  const filteredProfiles = profiles.filter((profile: CredentialProfile) =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (profile.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    const credData = profile.credentialsLegacy ? JSON.stringify(profile.credentialsLegacy) : '[]';
    setNewProfile({
      name: profile.name,
      description: profile.description || '',
      credentials: credData
    });
    setEditingCredentials(parseCredentials(credData));
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
      name: newProfile.name,
      description: newProfile.description,
      credentials: JSON.stringify(editingCredentials)
    });
  };

  const handleDeleteProfile = (profileId: number) => {
    if (confirm('Are you sure you want to delete this credential profile?')) {
      deleteMutation.mutate(profileId);
    }
  };

  const handleAddCredential = () => {
    if (!newCredential.type) {
      toast({
        title: "Error",
        description: "Credential type is required",
        variant: "destructive",
      });
      return;
    }

    const credential = {
      ...newCredential,
      id: Date.now().toString(), // Simple ID generation
    };

    setEditingCredentials(prev => [...prev, credential]);
    setNewCredential({
      type: 'windows',
      storage: 'vault',
      username: '',
      password: '',
      domain: '',
      protocol: '',
      vaultPath: ''
    });
    setIsAddCredentialDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Credential added to profile",
    });
  };

  const handleRemoveCredential = (credentialId: string) => {
    setEditingCredentials(prev => prev.filter(cred => cred.id !== credentialId));
    toast({
      title: "Success",
      description: "Credential removed from profile",
    });
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCredentialIcon = (type: string) => {
    const credType = credentialTypes.find(ct => ct.value === type);
    if (credType) {
      return credType.icon;
    }
    return Key;
  };

  const getCredentialColor = (type: string) => {
    const credType = credentialTypes.find(ct => ct.value === type);
    if (credType) {
      return credType.color;
    }
    return 'bg-gray-500';
  };

  const renderCredentialIcon = (type: string) => {
    const Icon = getCredentialIcon(type);
    const color = getCredentialColor(type);
    return (
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Credential Profiles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage credential profiles for secure access to enterprise systems
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Profile
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search credential profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No credential profiles found.</p>
          </div>
        ) : (
          filteredProfiles.map((profile: CredentialProfile) => {
            const credData = profile.credentialsLegacy ? JSON.stringify(profile.credentialsLegacy) : '[]';
            const credentials = parseCredentials(credData);
            const credentialTypesSummary = credentials.reduce((acc: any, cred: any) => {
              acc[cred.type] = (acc[cred.type] || 0) + 1;
              return acc;
            }, {});

            return (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant={profile.isActive ? "default" : "secondary"}>
                        {profile.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {profile.description || "No description provided"}
                    </p>

                    {/* Credential Types */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(credentialTypesSummary).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex items-center space-x-1">
                          {renderCredentialIcon(type)}
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Activity className="w-4 h-4" />
                          <span>{profile.usageCount || 0} uses</span>
                        </div>
                        {profile.lastUsed && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(profile.lastUsed)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Profile Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Credential Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="profile-name">Profile Name</Label>
              <Input
                id="profile-name"
                value={newProfile.name}
                onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter profile name"
              />
            </div>
            
            <div>
              <Label htmlFor="profile-description">Description</Label>
              <Textarea
                id="profile-description"
                value={newProfile.description}
                onChange={(e) => setNewProfile(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter profile description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProfile}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Credential Profile</DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-6 py-4">
              {/* Profile Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-profile-name">Profile Name</Label>
                  <Input
                    id="edit-profile-name"
                    value={newProfile.name}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter profile name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-profile-description">Description</Label>
                  <Textarea
                    id="edit-profile-description"
                    value={newProfile.description}
                    onChange={(e) => setNewProfile(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter profile description"
                    rows={1}
                  />
                </div>
              </div>

              {/* Credentials Management */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Credentials ({editingCredentials.length})</Label>
                  <Button
                    size="sm"
                    onClick={() => setIsAddCredentialDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Credential
                  </Button>
                </div>

                <div className="space-y-3">
                  {editingCredentials.map((credential: any) => (
                    <div
                      key={credential.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {renderCredentialIcon(credential.type)}
                        <div>
                          <div className="font-medium">{credential.type.charAt(0).toUpperCase() + credential.type.slice(1)}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {credential.username && `Username: ${credential.username}`}
                            {credential.domain && ` • Domain: ${credential.domain}`}
                            {credential.protocol && ` • Protocol: ${credential.protocol}`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={credential.storage === 'vault' ? 'default' : 'outline'}>
                          {credential.storage === 'vault' ? (
                            <><Lock className="w-3 h-3 mr-1" /> Vault</>
                          ) : (
                            'Local'
                          )}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCredential(credential.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {editingCredentials.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No credentials in this profile. Click "Add Credential" to get started.
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Credential Dialog */}
      <Dialog open={isAddCredentialDialogOpen} onOpenChange={setIsAddCredentialDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Credential</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Credential Type Selection */}
            <div>
              <Label>Credential Type</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {credentialTypes.slice(0, 8).map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={newCredential.type === type.value ? "default" : "outline"}
                      className="h-16 flex-col"
                      onClick={() => setNewCredential(prev => ({ ...prev, type: type.value }))}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Storage Type */}
            <div>
              <Label>Storage Type</Label>
              <div className="flex space-x-4 mt-2">
                <Button
                  variant={newCredential.storage === 'vault' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewCredential(prev => ({ ...prev, storage: 'vault' }))}
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Vault
                </Button>
                <Button
                  variant={newCredential.storage === 'local' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNewCredential(prev => ({ ...prev, storage: 'local' }))}
                >
                  Local
                </Button>
              </div>
            </div>

            {/* Credential Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cred-username">Username</Label>
                <Input
                  id="cred-username"
                  value={newCredential.username}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="cred-domain">Domain (optional)</Label>
                <Input
                  id="cred-domain"
                  value={newCredential.domain}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="Enter domain"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cred-protocol">Protocol</Label>
                <Input
                  id="cred-protocol"
                  value={newCredential.protocol}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, protocol: e.target.value }))}
                  placeholder="e.g., NTLM, SSH, HTTPS"
                />
              </div>
              {newCredential.storage === 'vault' && (
                <div>
                  <Label htmlFor="cred-vault-path">Vault Path</Label>
                  <Input
                    id="cred-vault-path"
                    value={newCredential.vaultPath}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, vaultPath: e.target.value }))}
                    placeholder="/path/to/credential"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsAddCredentialDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddCredential}>
                Add Credential
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}