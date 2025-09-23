import React, { useState } from 'react';
import { useDomainTenant } from '@/contexts/DomainTenantContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Domain, Tenant } from '@shared/schema';

interface EnterpriseHeaderProps {
  className?: string;
}

export function EnterpriseHeader({ className }: EnterpriseHeaderProps) {
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

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'inactive':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'suspended':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <CheckCircle2 className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
    } as const;
    
    return (
      <Badge 
        className={cn(
          "ml-2 text-xs font-medium border",
          variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200'
        )}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg",
        className
      )}>
        <div className="flex items-center space-x-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error loading domain/tenant data</span>
          <span className="text-sm text-red-600">({error})</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn(
        "flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg",
        className
      )}>
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600 font-medium">Loading enterprise context...</span>
        </div>
        <div className="flex space-x-2">
          <div className="animate-pulse bg-gray-300 h-8 w-48 rounded" />
          <div className="animate-pulse bg-gray-300 h-8 w-48 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm",
      className
    )}>
      {/* Enterprise Context Display */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
            <Globe className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Enterprise Domain</p>
            <p className="text-xs text-gray-500">
              {selectedDomain?.displayName || 'No domain selected'}
            </p>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
            <Building2 className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Active Tenant</p>
            <p className="text-xs text-gray-500">
              {selectedTenant?.displayName || 'No tenant selected'}
            </p>
          </div>
        </div>
      </div>

      {/* Domain/Tenant Selectors */}
      <div className="flex items-center space-x-3">
        {/* Domain Selector */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">Domain</label>
          <Select
            value={selectedDomain?.id.toString() || ''}
            onValueChange={(value) => {
              const domain = domains.find(d => d.id.toString() === value);
              if (domain) {
                setSelectedDomain(domain);
              }
            }}
          >
            <SelectTrigger className="w-64 h-9">
              <SelectValue placeholder="Select enterprise domain">
                {selectedDomain && (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedDomain.status)}
                      <span className="font-medium">{selectedDomain.displayName}</span>
                    </div>
                    {getStatusBadge(selectedDomain.status)}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(domains) && domains.length > 0 ? (
                domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(domain.status)}
                          <span className="font-medium">{domain.displayName}</span>
                        </div>
                        <span className="text-xs text-gray-500">{domain.name}</span>
                      </div>
                      {getStatusBadge(domain.status)}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-domains" disabled>
                  No domains available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Tenant Selector */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-gray-700">Tenant</label>
          <Select
            value={selectedTenant?.id.toString() || ''}
            onValueChange={(value) => {
              const tenant = tenants.find(t => t.id.toString() === value);
              if (tenant) {
                setSelectedTenant(tenant);
              }
            }}
            disabled={!selectedDomain}
          >
            <SelectTrigger className="w-64 h-9">
              <SelectValue placeholder="Select tenant">
                {selectedTenant && (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedTenant.status)}
                      <span className="font-medium">{selectedTenant.displayName}</span>
                    </div>
                    {getStatusBadge(selectedTenant.status)}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(tenants) && tenants.length > 0 ? (
                tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(tenant.status)}
                          <span className="font-medium">{tenant.displayName}</span>
                        </div>
                        <span className="text-xs text-gray-500">{tenant.name}</span>
                      </div>
                      {getStatusBadge(tenant.status)}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-tenants" disabled>
                  {selectedDomain ? 'No tenants available' : 'Select domain first'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-5 h-9"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}