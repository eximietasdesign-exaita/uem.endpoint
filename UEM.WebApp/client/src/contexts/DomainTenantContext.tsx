import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Domain, Tenant } from '@shared/schema';

interface DomainTenantContextType {
  selectedDomain: Domain | null;
  selectedTenant: Tenant | null;
  domains: Domain[];
  tenants: Tenant[];
  setSelectedDomain: (domain: Domain | null) => void;
  setSelectedTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  retryCount: number;
  refreshContext: () => void;
  getContextHeaders: () => Record<string, string>;
  invalidateAllQueries: () => void;
}

const DomainTenantContext = createContext<DomainTenantContextType | undefined>(undefined);

export function useDomainTenant() {
  const context = useContext(DomainTenantContext);
  if (context === undefined) {
    throw new Error('useDomainTenant must be used within a DomainTenantProvider');
  }
  return context;
}

interface DomainTenantProviderProps {
  children: ReactNode;
}

export function DomainTenantProvider({ children }: DomainTenantProviderProps) {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const queryClient = useQueryClient();

  // Enterprise query configuration with retry logic
  const queryConfig = {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  };

  // Fetch domains with enterprise configuration
  const { 
    data: domains = [], 
    isLoading: domainsLoading, 
    error: domainsError,
    refetch: refetchDomains 
  } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    queryFn: async () => {
      const response = await fetch('/api/domains', {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch domains: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    ...queryConfig,
  });

  // Fetch all tenants with enterprise configuration
  const { 
    data: tenants = [], 
    isLoading: tenantsLoading, 
    error: tenantsError,
    refetch: refetchTenants 
  } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
    queryFn: async () => {
      const response = await fetch('/api/tenants', {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch tenants: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    ...queryConfig,
  });

  const isLoading = domainsLoading || tenantsLoading;
  const error = domainsError?.message || tenantsError?.message || null;

  // Enterprise utility functions
  const getContextHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (selectedDomain) {
      headers['X-Domain-ID'] = selectedDomain.id.toString();
      headers['X-Domain-Name'] = selectedDomain.name;
    }
    
    if (selectedTenant) {
      headers['X-Tenant-ID'] = selectedTenant.id.toString();
      headers['X-Tenant-Name'] = selectedTenant.name;
    }
    
    return headers;
  }, [selectedDomain, selectedTenant]);

  const invalidateAllQueries = useCallback(() => {
    // Comprehensive list of all tenant-aware endpoints
    const tenantAwareQueryKeys = [
      '/api/dashboard/stats',
      '/api/assets',
      '/api/endpoints',
      '/api/activities',
      '/api/discovery-jobs', 
      '/api/discovery-policies',
      '/api/discovery-scripts',
      '/api/scripts',
      '/api/policies', 
      '/api/users',
      '/api/audit-logs',
      '/api/reports',
      '/api/settings',
      '/api/notifications',
      '/api/alerts',
    ];

    tenantAwareQueryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    });

    // Also invalidate any queries that might have domain/tenant parameters
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey as any[];
        return queryKey.some(key => 
          typeof key === 'object' && 
          (key?.domainId !== undefined || key?.tenantId !== undefined)
        );
      }
    });
  }, [queryClient]);

  const refreshContext = useCallback(() => {
    refetchDomains();
    refetchTenants();
    setRetryCount(0);
  }, [refetchDomains, refetchTenants]);

  // Enhanced enterprise-grade persistence and query invalidation
  useEffect(() => {
    if (selectedDomain) {
      localStorage.setItem('selectedDomainId', selectedDomain.id.toString());
      invalidateAllQueries();
    }
  }, [selectedDomain, invalidateAllQueries]);

  useEffect(() => {
    if (selectedTenant) {
      localStorage.setItem('selectedTenantId', selectedTenant.id.toString());
      invalidateAllQueries();
    }
  }, [selectedTenant, invalidateAllQueries]);

  // Clear tenant selection and localStorage when domain changes
  useEffect(() => {
    if (selectedDomain) {
      setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
  }, [selectedDomain?.id]);

  // Initialize selections (restore from localStorage or auto-select defaults)
  useEffect(() => {
    if (!Array.isArray(domains) || domains.length === 0) return;
    
    // Don't override if already selected
    if (selectedDomain) return;
    
    const savedDomainId = localStorage.getItem('selectedDomainId');
    let domainToSelect: Domain | null = null;
    
    if (savedDomainId) {
      domainToSelect = domains.find((d: Domain) => d.id.toString() === savedDomainId) || null;
    }
    
    // If no saved domain or saved domain not found, use default
    if (!domainToSelect) {
      domainToSelect = domains.find((d: Domain) => d.name === 'global-enterprise') || domains[0];
    }
    
    if (domainToSelect) {
      setSelectedDomain(domainToSelect);
    }
  }, [domains, selectedDomain]);

  // Initialize tenant selection with enterprise validation
  useEffect(() => {
    if (!Array.isArray(tenants) || tenants.length === 0) return;
    
    // Don't override if already selected and the tenant exists in current tenants list
    if (selectedTenant && tenants.find(t => t.id === selectedTenant.id)) return;
    
    const savedTenantId = localStorage.getItem('selectedTenantId');
    let tenantToSelect: Tenant | null = null;
    
    if (savedTenantId) {
      tenantToSelect = tenants.find((t: Tenant) => t.id.toString() === savedTenantId) || null;
    }
    
    // If no saved tenant or saved tenant not found, use default
    if (!tenantToSelect) {
      tenantToSelect = tenants.find((t: Tenant) => t.name === 'headquarters') || tenants[0];
    }
    
    if (tenantToSelect) {
      setSelectedTenant(tenantToSelect);
    }
  }, [tenants]); // Removed selectedTenant dependency to avoid race condition

  // Track initialization status
  useEffect(() => {
    if (selectedDomain && selectedTenant && !isInitialized) {
      setIsInitialized(true);
    }
  }, [selectedDomain, selectedTenant, isInitialized]);

  // Handle errors and retry logic
  useEffect(() => {
    if (domainsError || tenantsError) {
      setRetryCount(prev => prev + 1);
    }
  }, [domainsError, tenantsError]);

  const value: DomainTenantContextType = {
    selectedDomain,
    selectedTenant,
    domains: Array.isArray(domains) ? domains : [],
    tenants: Array.isArray(tenants) ? tenants : [],
    setSelectedDomain,
    setSelectedTenant,
    isLoading,
    isInitialized,
    error,
    retryCount,
    refreshContext,
    getContextHeaders,
    invalidateAllQueries,
  };

  return (
    <DomainTenantContext.Provider value={value}>
      {children}
    </DomainTenantContext.Provider>
  );
}