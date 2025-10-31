import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDomainTenant } from '@/contexts/DomainTenantContext';

interface UseTenantDataOptions {
  endpoint: string;
  enabled?: boolean;
  additionalParams?: Record<string, any>;
  requiresContext?: boolean; // New option to bypass tenant requirements for global endpoints
}

/**
 * Hook to fetch data with domain/tenant context automatically applied
 */
export function useTenantData<T>({ endpoint, enabled = true, additionalParams = {}, requiresContext = true }: UseTenantDataOptions) {
  const { selectedDomain, selectedTenant } = useDomainTenant();

  const queryKey = useMemo(() => {
    const params = {
      domainId: selectedDomain?.id,
      tenantId: selectedTenant?.id,
      ...additionalParams,
    };
    return [endpoint, params];
  }, [endpoint, selectedDomain?.id, selectedTenant?.id, additionalParams]);

  const query = useQuery<T>({
    queryKey,
    enabled: enabled && (requiresContext ? !!selectedDomain && !!selectedTenant : true),
  });

  return {
    ...query,
    domainContext: selectedDomain,
    tenantContext: selectedTenant,
    hasContext: requiresContext ? !!selectedDomain && !!selectedTenant : true,
  };
}

/**
 * Hook to get tenant context information
 */
export function useTenantContext() {
  const { selectedDomain, selectedTenant, isLoading, error } = useDomainTenant();

  return {
    domain: selectedDomain,
    tenant: selectedTenant,
    isLoading,
    error,
    hasContext: !!selectedDomain && !!selectedTenant,
    contextDisplay: selectedDomain && selectedTenant 
      ? `${selectedDomain.displayname} / ${selectedTenant.displayname}`
      : 'No context selected',
  };
}