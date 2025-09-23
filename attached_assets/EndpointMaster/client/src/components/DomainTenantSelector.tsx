import React from 'react';
import { useDomainTenant } from '@/contexts/DomainTenantContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Building2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DomainTenantSelectorProps {
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
}

export function DomainTenantSelector({ 
  showLabels = true, 
  compact = false, 
  className 
}: DomainTenantSelectorProps) {
  const {
    selectedDomain,
    selectedTenant,
    domains,
    tenants,
    setSelectedDomain,
    setSelectedTenant,
    isLoading,
    error,
  } = useDomainTenant();

  if (error) {
    return (
      <div className={cn("flex items-center space-x-2 text-destructive", className)}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Error loading domains</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="animate-pulse bg-muted h-8 w-32 rounded" />
        <div className="animate-pulse bg-muted h-8 w-32 rounded" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="ml-2">
        {status}
      </Badge>
    );
  };

  return (
    <div className={cn(
      "flex items-center space-x-4",
      compact && "space-x-2",
      className
    )}>
      {/* Domain Selector */}
      <div className={cn("flex items-center space-x-2", compact && "space-x-1")}>
        {showLabels && (
          <div className="flex items-center space-x-1 text-sm font-medium text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Domain:</span>
          </div>
        )}
        <Select
          value={selectedDomain?.id.toString() || ''}
          onValueChange={(value) => {
            const domain = Array.isArray(domains) ? domains.find(d => d.id.toString() === value) : null;
            setSelectedDomain(domain || null);
          }}
        >
          <SelectTrigger className={cn("w-[200px]", compact && "w-[150px]")}>
            <SelectValue placeholder="Select domain" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(domains) && domains.length > 0 ? (
              domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{domain.displayName}</span>
                      <span className="text-xs text-muted-foreground">{domain.name}</span>
                    </div>
                    {getStatusBadge(domain.status)}
                  </div>
                </SelectItem>
              ))
            ) : null}
          </SelectContent>
        </Select>
      </div>

      {/* Tenant Selector */}
      <div className={cn("flex items-center space-x-2", compact && "space-x-1")}>
        {showLabels && (
          <div className="flex items-center space-x-1 text-sm font-medium text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Tenant:</span>
          </div>
        )}
        <Select
          value={selectedTenant?.id.toString() || ''}
          onValueChange={(value) => {
            const tenant = Array.isArray(tenants) ? tenants.find(t => t.id.toString() === value) : null;
            setSelectedTenant(tenant || null);
          }}
          disabled={!selectedDomain || !Array.isArray(tenants) || tenants.length === 0}
        >
          <SelectTrigger className={cn("w-[200px]", compact && "w-[150px]")}>
            <SelectValue placeholder="Select tenant" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(tenants) && tenants.length > 0 ? (
              tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{tenant.displayName}</span>
                      <span className="text-xs text-muted-foreground">{tenant.name}</span>
                    </div>
                    {getStatusBadge(tenant.status)}
                  </div>
                </SelectItem>
              ))
            ) : null}
          </SelectContent>
        </Select>
      </div>

      {/* Current Context Info */}
      {!compact && selectedDomain && selectedTenant && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">
          <span>Context:</span>
          <span className="font-medium text-foreground">
            {selectedDomain.displayName} / {selectedTenant.displayName}
          </span>
        </div>
      )}
    </div>
  );
}