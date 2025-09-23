import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTenantSchema, type Tenant, type InsertTenant, type Domain } from "@shared/schema";
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Database,
  Calendar,
  BarChart3,
  Settings,
  MoreVertical,
  ChevronRight,
  Search,
  Filter,
  User
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TenantManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tenants and domains
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["/api/tenants"],
  });

  const { data: domains = [] } = useQuery({
    queryKey: ["/api/domains"],
  });

  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: (data: InsertTenant) => apiRequest("/api/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "Tenant created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create tenant", variant: "destructive" });
    },
  });

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertTenant> }) => 
      apiRequest(`/api/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      setIsEditDialogOpen(false);
      setSelectedTenant(null);
      toast({ title: "Success", description: "Tenant updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update tenant", variant: "destructive" });
    },
  });

  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/tenants/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tenants"] });
      toast({ title: "Success", description: "Tenant deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete tenant", variant: "destructive" });
    },
  });

  // Create tenant form
  const createForm = useForm<InsertTenant>({
    resolver: zodResolver(insertTenantSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      domainId: 0,
      type: "standard",
      status: "active",
      settings: {
        maxUsers: 50,
        maxEndpoints: 1000,
        dataIsolation: "strict",
        allowGlobalPublishing: false,
        features: [],
      },
      quotas: {
        usedStorage: 0,
        maxStorage: 10240,
        usedBandwidth: 0,
        maxBandwidth: 100,
        usedQuota: 0,
        maxQuota: 1000,
      },
    },
  });

  // Edit tenant form
  const editForm = useForm<InsertTenant>({
    resolver: zodResolver(insertTenantSchema),
  });

  // Filter tenants
  const filteredTenants = tenants.filter((tenant: Tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === "all" || tenant.domainId.toString() === filterDomain;
    return matchesSearch && matchesDomain;
  });

  const onCreateSubmit = (data: InsertTenant) => {
    createTenantMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertTenant) => {
    if (selectedTenant) {
      updateTenantMutation.mutate({ id: selectedTenant.id, data });
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    editForm.reset({
      name: tenant.name,
      displayName: tenant.displayName,
      description: tenant.description || "",
      domainId: tenant.domainId,
      type: tenant.type,
      status: tenant.status,
      settings: tenant.settings || {
        maxUsers: 50,
        maxEndpoints: 1000,
        dataIsolation: "strict",
        allowGlobalPublishing: false,
        features: [],
      },
      quotas: tenant.quotas || {
        usedStorage: 0,
        maxStorage: 10240,
        usedBandwidth: 0,
        maxBandwidth: 100,
        usedQuota: 0,
        maxQuota: 1000,
      },
    });
    setIsEditDialogOpen(true);
  };

  const getDomainName = (domainId: number) => {
    const domain = domains.find((d: Domain) => d.id === domainId);
    return domain?.displayName || domain?.name || "Unknown Domain";
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const config = {
      standard: { color: "bg-blue-100 text-blue-800", icon: Building2 },
      premium: { color: "bg-purple-100 text-purple-800", icon: BarChart3 },
      enterprise: { color: "bg-gold-100 text-gold-800", icon: Settings },
    };
    const { color, icon: Icon } = config[type as keyof typeof config] || config.standard;
    
    return (
      <Badge variant="secondary" className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {type}
      </Badge>
    );
  };

  const getUsagePercent = (used: number, max: number) => {
    return max > 0 ? Math.round((used / max) * 100) : 0;
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return "text-red-600";
    if (percent >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenant Management</h1>
          <p className="text-muted-foreground">Manage multi-tenant configuration and resource allocation</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Create New Tenant
              </DialogTitle>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic" className="text-sm">Basic Info</TabsTrigger>
                    <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
                    <TabsTrigger value="quotas" className="text-sm">Quotas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tenant Name</FormLabel>
                            <FormControl>
                              <Input placeholder="tenant-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Tenant Display Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tenant description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={createForm.control}
                        name="domainId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domain</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select domain" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {domains.map((domain: Domain) => (
                                  <SelectItem key={domain.id} value={domain.id.toString()}>
                                    {domain.displayName || domain.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tenant Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={createForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Allow Global Publishing</Label>
                        <Switch />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Max Users</Label>
                          <Input type="number" placeholder="50" />
                        </div>
                        <div>
                          <Label>Max Endpoints</Label>
                          <Input type="number" placeholder="1000" />
                        </div>
                      </div>
                      <div>
                        <Label>Data Isolation</Label>
                        <Select defaultValue="strict">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strict">Strict Isolation</SelectItem>
                            <SelectItem value="shared">Shared Resources</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="quotas" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Max Storage (MB)</Label>
                        <Input type="number" placeholder="10240" />
                      </div>
                      <div>
                        <Label>Max Bandwidth (GB)</Label>
                        <Input type="number" placeholder="100" />
                      </div>
                      <div>
                        <Label>Max API Quota</Label>
                        <Input type="number" placeholder="1000" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTenantMutation.isPending}>
                    {createTenantMutation.isPending ? "Creating..." : "Create Tenant"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDomain} onValueChange={setFilterDomain}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domains.map((domain: Domain) => (
              <SelectItem key={domain.id} value={domain.id.toString()}>
                {domain.displayName || domain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tenant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant: Tenant) => (
          <Card key={tenant.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    {tenant.displayName}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {tenant.name}
                  </CardDescription>
                  <CardDescription className="text-xs text-blue-600">
                    {getDomainName(tenant.domainId)}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(tenant)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteTenantMutation.mutate(tenant.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex gap-2 mt-2">
                {getTypeBadge(tenant.type)}
                {getStatusBadge(tenant.status)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {tenant.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tenant.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">
                      {tenant.settings?.maxUsers || 0} Max Users
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      {tenant.settings?.maxEndpoints || 0} Endpoints
                    </span>
                  </div>
                </div>
                
                {/* Resource Usage */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-xs font-medium text-muted-foreground">Resource Usage</div>
                  <div className="space-y-1">
                    {tenant.quotas && (
                      <>
                        <div className="flex justify-between text-xs">
                          <span>Storage</span>
                          <span className={getUsageColor(getUsagePercent(tenant.quotas.usedStorage || 0, tenant.quotas.maxStorage || 1))}>
                            {getUsagePercent(tenant.quotas.usedStorage || 0, tenant.quotas.maxStorage || 1)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1">
                          <div 
                            className="bg-primary rounded-full h-1 transition-all"
                            style={{ width: `${getUsagePercent(tenant.quotas.usedStorage || 0, tenant.quotas.maxStorage || 1)}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {tenant.settings?.dataIsolation === "strict" ? "Strict Isolation" : "Shared Resources"}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No tenants found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterDomain !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by creating your first tenant"
            }
          </p>
          {!searchTerm && filterDomain === "all" && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Tenant
            </DialogTitle>
          </DialogHeader>
          
          {selectedTenant && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="quotas">Quotas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={editForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Allow Global Publishing</Label>
                        <Switch />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Max Users</Label>
                          <Input type="number" />
                        </div>
                        <div>
                          <Label>Max Endpoints</Label>
                          <Input type="number" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="quotas" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Max Storage (MB)</Label>
                        <Input type="number" />
                      </div>
                      <div>
                        <Label>Max Bandwidth (GB)</Label>
                        <Input type="number" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateTenantMutation.isPending}>
                    {updateTenantMutation.isPending ? "Updating..." : "Update Tenant"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}