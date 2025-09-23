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
import { insertDomainSchema, type Domain, type InsertDomain } from "@shared/schema";
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Building,
  Users,
  Network,
  Shield,
  Palette,
  FileText,
  MoreVertical,
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function DomainManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch domains
  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["/api/domains"],
  });

  // Create domain mutation
  const createDomainMutation = useMutation({
    mutationFn: (data: InsertDomain) => apiRequest("/api/domains", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "Domain created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create domain", variant: "destructive" });
    },
  });

  // Update domain mutation
  const updateDomainMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertDomain> }) => 
      apiRequest(`/api/domains/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      setIsEditDialogOpen(false);
      setSelectedDomain(null);
      toast({ title: "Success", description: "Domain updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update domain", variant: "destructive" });
    },
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/domains/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      toast({ title: "Success", description: "Domain deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete domain", variant: "destructive" });
    },
  });

  // Create domain form
  const createForm = useForm<InsertDomain>({
    resolver: zodResolver(insertDomainSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      type: "standard",
      status: "active",
      settings: {
        allowSubdomains: true,
        maxTenants: 10,
        customBranding: false,
        dataRetentionDays: 365,
        features: [],
      },
      branding: {
        primaryColor: "#0ea5e9",
        secondaryColor: "#64748b",
        logo: "",
        favicon: "",
        companyName: "",
      },
    },
  });

  // Edit domain form
  const editForm = useForm<InsertDomain>({
    resolver: zodResolver(insertDomainSchema),
  });

  // Filter domains
  const filteredDomains = domains.filter((domain: Domain) => {
    const matchesSearch = domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || domain.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const onCreateSubmit = (data: InsertDomain) => {
    createDomainMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertDomain) => {
    if (selectedDomain) {
      updateDomainMutation.mutate({ id: selectedDomain.id, data });
    }
  };

  const handleEdit = (domain: Domain) => {
    setSelectedDomain(domain);
    editForm.reset({
      name: domain.name,
      displayName: domain.displayName,
      description: domain.description || "",
      type: domain.type,
      status: domain.status,
      settings: domain.settings || {
        allowSubdomains: true,
        maxTenants: 10,
        customBranding: false,
        dataRetentionDays: 365,
        features: [],
      },
      branding: domain.branding || {
        primaryColor: "#0ea5e9",
        secondaryColor: "#64748b",
        logo: "",
        favicon: "",
        companyName: "",
      },
    });
    setIsEditDialogOpen(true);
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
      root: { color: "bg-purple-100 text-purple-800", icon: Globe },
      standard: { color: "bg-blue-100 text-blue-800", icon: Building },
      subdomain: { color: "bg-green-100 text-green-800", icon: Network },
    };
    const { color, icon: Icon } = config[type as keyof typeof config] || config.standard;
    
    return (
      <Badge variant="secondary" className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-foreground">Domain Management</h1>
          <p className="text-muted-foreground">Manage multi-domain configuration and hierarchical relationships</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Create New Domain
              </DialogTitle>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic" className="text-sm">Basic Info</TabsTrigger>
                    <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
                    <TabsTrigger value="branding" className="text-sm">Branding</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domain Name</FormLabel>
                            <FormControl>
                              <Input placeholder="enterprise-domain" {...field} />
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
                              <Input placeholder="Enterprise Domain" {...field} />
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
                            <Textarea placeholder="Domain description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domain Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="root">Root Domain</SelectItem>
                                <SelectItem value="standard">Standard Domain</SelectItem>
                                <SelectItem value="subdomain">Subdomain</SelectItem>
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
                        <Label>Allow Subdomains</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Custom Branding</Label>
                        <Switch />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Max Tenants</Label>
                          <Input type="number" placeholder="10" />
                        </div>
                        <div>
                          <Label>Data Retention (Days)</Label>
                          <Input type="number" placeholder="365" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="branding" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Color</Label>
                        <Input type="color" />
                      </div>
                      <div>
                        <Label>Secondary Color</Label>
                        <Input type="color" />
                      </div>
                    </div>
                    <div>
                      <Label>Company Name</Label>
                      <Input placeholder="Company Name" />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDomainMutation.isPending}>
                    {createDomainMutation.isPending ? "Creating..." : "Create Domain"}
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
            placeholder="Search domains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="root">Root Domains</SelectItem>
            <SelectItem value="standard">Standard Domains</SelectItem>
            <SelectItem value="subdomain">Subdomains</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDomains.map((domain: Domain) => (
          <Card key={domain.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    {domain.displayName}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {domain.name}
                  </CardDescription>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(domain)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteDomainMutation.mutate(domain.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex gap-2 mt-2">
                {getTypeBadge(domain.type)}
                {getStatusBadge(domain.status)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {domain.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {domain.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">
                      {domain.settings?.maxTenants || 0} Max Tenants
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      {domain.settings?.dataRetentionDays || 365}d Retention
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    {domain.settings?.allowSubdomains ? "Subdomains Allowed" : "No Subdomains"}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDomains.length === 0 && (
        <div className="text-center py-12">
          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No domains found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Get started by creating your first domain"
            }
          </p>
          {!searchTerm && filterType === "all" && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Domain
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
              Edit Domain
            </DialogTitle>
          </DialogHeader>
          
          {selectedDomain && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="branding">Branding</TabsTrigger>
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
                        <Label>Allow Subdomains</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Custom Branding</Label>
                        <Switch />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="branding" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Primary Color</Label>
                        <Input type="color" />
                      </div>
                      <div>
                        <Label>Secondary Color</Label>
                        <Input type="color" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateDomainMutation.isPending}>
                    {updateDomainMutation.isPending ? "Updating..." : "Update Domain"}
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