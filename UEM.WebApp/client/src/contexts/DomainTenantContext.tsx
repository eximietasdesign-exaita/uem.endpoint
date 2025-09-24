import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  error: string | null;
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
  const queryClient = useQueryClient();

  // Fetch domains
  const { 
    data: domains = [], 
    isLoading: domainsLoading, 
    error: domainsError 
  } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    queryFn: async () => {
      const response = await fetch('/api/domains');
      if (!response.ok) throw new Error('Failed to fetch domains');
      return response.json();
    },
  });

  // Fetch tenants for selected domain
  const { 
    data: tenants = [], 
    isLoading: tenantsLoading, 
    error: tenantsError 
  } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants', { domainId: selectedDomain?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/tenants?domainId=${selectedDomain?.id}`);
      if (!response.ok) throw new Error('Failed to fetch tenants');
      return response.json();
    },
    enabled: !!selectedDomain,
  });

  const isLoading = domainsLoading || tenantsLoading;
  const error = domainsError?.message || tenantsError?.message || null;

  // Store selections in localStorage for persistence and invalidate queries
  useEffect(() => {
    if (selectedDomain) {
      localStorage.setItem('selectedDomainId', selectedDomain.id.toString());
      // Invalidate all queries that depend on domain context
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/endpoints'] });
    }
  }, [selectedDomain, queryClient]);

  useEffect(() => {
    if (selectedTenant) {
      localStorage.setItem('selectedTenantId', selectedTenant.id.toString());
      // Invalidate all queries that depend on tenant context
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/endpoints'] });
    }
  }, [selectedTenant, queryClient]);

  // Clear tenant selection and localStorage when domain changes
  useEffect(() => {
    if (selectedDomain) {
      setSelectedTenant(null);
      // Clear saved tenant since it's not valid for the new domain
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

  // Initialize tenant selection
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

  const value: DomainTenantContextType = {
    selectedDomain,
    selectedTenant,
    domains: Array.isArray(domains) ? domains : [],
    tenants: Array.isArray(tenants) ? tenants : [],
    setSelectedDomain,
    setSelectedTenant,
    isLoading,
    error,
  };

  return (
    <DomainTenantContext.Provider value={value}>
      {children}
    </DomainTenantContext.Provider>
  );
}