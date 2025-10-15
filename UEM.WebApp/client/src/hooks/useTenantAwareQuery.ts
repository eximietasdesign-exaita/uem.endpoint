import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useDomainTenant } from '@/contexts/DomainTenantContext';

interface TenantAwareQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  queryKey?: any[];
  requiresContext?: boolean;
  fetchOptions?: RequestInit;
}

/**
 * Enterprise-grade hook for tenant-aware API queries
 * Automatically includes domain/tenant context in requests and query keys
 */
export function useTenantAwareQuery<TData = any>(
  options: TenantAwareQueryOptions<TData>
): UseQueryResult<TData> {
  const { 
    selectedDomain, 
    selectedTenant, 
    getContextHeaders, 
    isInitialized 
  } = useDomainTenant();

  const {
    endpoint,
    queryKey = [],
    requiresContext = true,
    fetchOptions = {},
    ...queryOptions
  } = options;

  // Build context-aware query key
  const contextualQueryKey = [
    endpoint,
    ...(Array.isArray(queryKey) ? queryKey : [queryKey]),
    {
      domainId: selectedDomain?.id,
      tenantId: selectedTenant?.id,
    }
  ];

  // Enhanced query configuration for enterprise use
  const enterpriseQueryConfig = {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    ...queryOptions,
  };

  return useQuery<TData>({
    queryKey: contextualQueryKey,
    queryFn: async () => {
      // Build URL with tenant context if needed
      let url = endpoint;
      const urlParams = new URLSearchParams();
      
      if (selectedDomain && requiresContext) {
        urlParams.append('domainId', selectedDomain.id.toString());
      }
      
      if (selectedTenant && requiresContext) {
        urlParams.append('tenantId', selectedTenant.id.toString());
      }
      
      if (urlParams.toString()) {
        url += (endpoint.includes('?') ? '&' : '?') + urlParams.toString();
      }

      // Merge headers with context information
      const headers = {
        ...getContextHeaders(),
        ...fetchOptions.headers,
      };

      const response = await fetch(url, {
        method: 'GET',
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    enabled: requiresContext ? (isInitialized && !!selectedDomain && !!selectedTenant) : true,
    ...enterpriseQueryConfig,
  });
}

/**
 * Hook for queries that don't require tenant context (like global settings)
 */
export function useGlobalQuery<TData = any>(
  endpoint: string,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData> {
  return useTenantAwareQuery<TData>({
    endpoint,
    requiresContext: false,
    ...options,
  });
}

/**
 * Hook for domain-only queries (like tenant listing)
 */
export function useDomainQuery<TData = any>(
  endpoint: string,
  options?: TenantAwareQueryOptions<TData>
): UseQueryResult<TData> {
  const { selectedDomain, isInitialized } = useDomainTenant();
  
  return useTenantAwareQuery<TData>({
    endpoint,
    ...options,
    enabled: isInitialized && !!selectedDomain && (options?.enabled !== false),
  });
}