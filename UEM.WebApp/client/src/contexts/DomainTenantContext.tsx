import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
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

  // Fetch domains
  const { 
    data: domains = [], 
    isLoading: domainsLoading, 
    error: domainsError 
  } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
  });

  // Fetch tenants for selected domain
  const { 
    data: tenants = [], 
    isLoading: tenantsLoading, 
    error: tenantsError 
  } = useQuery<Tenant[]>({
    queryKey: [`/api/tenants/${selectedDomain?.id}`],
    enabled: !!selectedDomain,
  });

  const isLoading = domainsLoading || tenantsLoading;
  const error = domainsError?.message || tenantsError?.message || null;

  // Auto-select first domain and tenant when data loads
  useEffect(() => {
    if (Array.isArray(domains) && domains.length > 0 && !selectedDomain) {
      const defaultDomain = domains.find((d: Domain) => d.name === 'global-enterprise') || domains[0];
      setSelectedDomain(defaultDomain);
    }
  }, [domains, selectedDomain]);

  useEffect(() => {
    if (Array.isArray(tenants) && tenants.length > 0 && !selectedTenant) {
      const defaultTenant = tenants.find((t: Tenant) => t.name === 'headquarters') || tenants[0];
      setSelectedTenant(defaultTenant);
    }
  }, [tenants, selectedTenant]);

  // Clear tenant selection when domain changes
  useEffect(() => {
    setSelectedTenant(null);
  }, [selectedDomain]);

  // Store selections in localStorage for persistence
  useEffect(() => {
    if (selectedDomain) {
      localStorage.setItem('selectedDomainId', selectedDomain.id.toString());
    }
  }, [selectedDomain]);

  useEffect(() => {
    if (selectedTenant) {
      localStorage.setItem('selectedTenantId', selectedTenant.id.toString());
    }
  }, [selectedTenant]);

  // Restore selections from localStorage
  useEffect(() => {
    const savedDomainId = localStorage.getItem('selectedDomainId');
    const savedTenantId = localStorage.getItem('selectedTenantId');
    
    if (savedDomainId && Array.isArray(domains) && domains.length > 0) {
      const domain = domains.find((d: Domain) => d.id.toString() === savedDomainId);
      if (domain && !selectedDomain) {
        setSelectedDomain(domain);
      }
    }
    
    if (savedTenantId && Array.isArray(tenants) && tenants.length > 0) {
      const tenant = tenants.find((t: Tenant) => t.id.toString() === savedTenantId);
      if (tenant && !selectedTenant) {
        setSelectedTenant(tenant);
      }
    }
  }, [domains, tenants, selectedDomain, selectedTenant]);

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