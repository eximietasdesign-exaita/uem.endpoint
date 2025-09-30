import React from 'react';
import { useDomainTenant } from '@/contexts/DomainTenantContext';
import { DomainTenantTree } from '@/components/DomainTenantTree';
import { AlertCircle } from 'lucide-react';
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
        <div className="animate-pulse bg-muted h-32 w-full rounded" />
      </div>
    );
  }

  const handleChange = (value: { domainId: number | null; tenantId: number | null }) => {
    setSelectedDomain(value.domainId ? { id: value.domainId } as any : null);
    setSelectedTenant(value.tenantId ? { id: value.tenantId } as any : null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabels && (
        <label className="text-sm font-medium">Domain & Tenant</label>
      )}
      <DomainTenantTree
        value={{
          domainId: selectedDomain?.id || null,
          tenantId: selectedTenant?.id || null
        }}
        onChange={handleChange}
      />
      {!compact && selectedDomain && (
        <p className="text-xs text-muted-foreground mt-1">
          {selectedTenant 
            ? `Selected: ${selectedDomain.displayName || 'Domain'} / ${selectedTenant.displayName || 'Tenant'}`
            : `Selected: ${selectedDomain.displayName || 'Domain'} (All Tenants)`
          }
        </p>
      )}
    </div>
  );
}