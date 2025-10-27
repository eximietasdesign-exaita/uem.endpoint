import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Domain {
  id: number;
  name: string;
  displayname: string;
  parentdomainid?: number;
}

interface Tenant {
  id: number;
  name: string;
  displayname: string;
  domainid: number;
  domainId?: number; // Handle both formats
}

interface DomainTenantContextType {
  domains: Domain[];
  tenants: Tenant[];
  selectedDomain: Domain | null;
  selectedTenant: Tenant | null;
  setSelectedDomain: (domain: Domain | null) => void;
  setSelectedTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  error: string | null;
}

const DomainTenantContext = createContext<DomainTenantContextType | undefined>(undefined);

const STORAGE_KEY = 'enterprise-domain-tenant-selection';

interface DomainTenantProviderProps {
  children: ReactNode;
}

export function DomainTenantProvider({ children }: DomainTenantProviderProps) {
  // Initialize from localStorage
  const [selectedDomain, setSelectedDomainState] = useState<Domain | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.domain || null;
      }
    } catch (error) {
      console.warn('Failed to parse stored domain/tenant selection:', error);
    }
    return null;
  });

  const [selectedTenant, setSelectedTenantState] = useState<Tenant | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.tenant || null;
      }
    } catch (error) {
      console.warn('Failed to parse stored domain/tenant selection:', error);
    }
    return null;
  });

  // Fetch domains
  const { data: domains = [], isLoading: domainsLoading, error: domainsError } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Fetch tenants
  const { data: tenants = [], isLoading: tenantsLoading, error: tenantsError } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Persist to localStorage whenever selection changes
  useEffect(() => {
    try {
      const selection = {
        domain: selectedDomain,
        tenant: selectedTenant,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
      console.log('Persisted domain/tenant selection:', selection);
    } catch (error) {
      console.warn('Failed to persist domain/tenant selection:', error);
    }
  }, [selectedDomain, selectedTenant]);

  // Validate and restore selection when data is loaded
  useEffect(() => {
    if (domains.length > 0 && selectedDomain) {
      // Verify that the selected domain still exists
      const domainExists = domains.find(d => d.id === selectedDomain.id);
      if (!domainExists) {
        console.log('Selected domain no longer exists, clearing selection');
        setSelectedDomainState(null);
        setSelectedTenantState(null);
        return;
      }
      
      // Update the domain object with fresh data
      setSelectedDomainState(domainExists);
    }
  }, [domains, selectedDomain?.id]);

  useEffect(() => {
    if (tenants.length > 0 && selectedTenant) {
      // Verify that the selected tenant still exists
      const tenantExists = tenants.find(t => t.id === selectedTenant.id);
      if (!tenantExists) {
        console.log('Selected tenant no longer exists, clearing tenant selection');
        setSelectedTenantState(null);
        return;
      }
      
      // Update the tenant object with fresh data
      setSelectedTenantState(tenantExists);
      
      // Also verify that the tenant belongs to the selected domain
      if (selectedDomain) {
        const tenantDomainId = tenantExists.domainid || tenantExists.domainId;
        if (tenantDomainId !== selectedDomain.id) {
          console.log('Selected tenant does not belong to selected domain, clearing tenant selection');
          setSelectedTenantState(null);
        }
      }
    }
  }, [tenants, selectedTenant?.id, selectedDomain?.id]);

  // Enhanced setters with validation
  const setSelectedDomain = (domain: Domain | null) => {
    console.log('Setting selected domain:', domain);
    setSelectedDomainState(domain);
    
    // Clear tenant if it doesn't belong to the new domain
    if (domain && selectedTenant) {
      const tenantDomainId = selectedTenant.domainid || selectedTenant.domainId;
      if (tenantDomainId !== domain.id) {
        console.log('Clearing tenant selection as it does not belong to new domain');
        setSelectedTenantState(null);
      }
    } else if (!domain) {
      // Clear tenant when domain is cleared
      setSelectedTenantState(null);
    }
  };

  const setSelectedTenant = (tenant: Tenant | null) => {
    console.log('Setting selected tenant:', tenant);
    setSelectedTenantState(tenant);
    
    // Auto-select domain if tenant is selected but no domain is set
    if (tenant && !selectedDomain) {
      const tenantDomainId = tenant.domainid || tenant.domainId;
      const domain = domains.find(d => d.id === tenantDomainId);
      if (domain) {
        console.log('Auto-selecting domain for tenant:', domain);
        setSelectedDomainState(domain);
      }
    }
  };

  const isLoading = domainsLoading || tenantsLoading;
  const error = domainsError?.message || tenantsError?.message || null;

  const contextValue: DomainTenantContextType = {
    domains,
    tenants,
    selectedDomain,
    selectedTenant,
    setSelectedDomain,
    setSelectedTenant,
    isLoading,
    error
  };

  return (
    <DomainTenantContext.Provider value={contextValue}>
      {children}
    </DomainTenantContext.Provider>
  );
}

export function useDomainTenant() {
  const context = useContext(DomainTenantContext);
  if (context === undefined) {
    throw new Error('useDomainTenant must be used within a DomainTenantProvider');
  }
  return context;
}

// Helper hook for getting current selection in a format compatible with DomainTenantTree
export function useDomainTenantSelection() {
  const { selectedDomain, selectedTenant, setSelectedDomain, setSelectedTenant } = useDomainTenant();
  
  const value = {
    domainId: selectedDomain?.id || null,
    tenantId: selectedTenant?.id || null
  };
  
  const onChange = (newValue: { domainId: number | null; tenantId: number | null }) => {
    // This is handled by the EnterpriseTopHeader component
    console.log('DomainTenantSelection onChange called with:', newValue);
  };
  
  return { value, onChange };
}