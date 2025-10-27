import React, { useState, useMemo, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Domain {
  id: number;
  name: string;
  displayName?: string;
  displayname?: string;
  description?: string;
  status?: string;
  type?: string;
}

interface Tenant {
  id: number;
  name: string;
  displayName?: string;
  displayname?: string;
  description?: string;
  domainId?: number;
  domainid?: number;
  status?: string;
}

interface DomainTenantSearchProps {
  domains: Domain[];
  tenants: Tenant[];
  selectedDomainId: number | null;
  selectedTenantId: number | null;
  onSelect: (value: { domainId: number | null; tenantId: number | null }) => void;
  onSearchResults?: (results: { domains: Domain[]; tenants: Tenant[]; query: string }) => void;
  className?: string;
  placeholder?: string;
}

export function DomainTenantSearch({
  domains,
  tenants,
  selectedDomainId,
  selectedTenantId,
  onSelect,
  onSearchResults,
  className,
  placeholder = "Search domains and tenants..."
}: DomainTenantSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to get display name with fallback
  const getDisplayName = useCallback((item: Domain | Tenant) => {
    return (item as any).displayname || item.displayName || item.name || `Item ${item.id}`;
  }, []);

  // Helper function to check if text matches search query
  const matchesSearch = useCallback((text: string, query: string) => {
    return text.toLowerCase().includes(query.toLowerCase());
  }, []);

  // Filter results and notify parent component
  const searchResults = useMemo(() => {
    const query = searchQuery.trim();

    if (!query) {
      // No search - return all domains and tenants
      const results = { domains, tenants, query: '' };
      onSearchResults?.(results);
      return results;
    }

    // Filter domains that match the search
    const matchingDomains = domains.filter(domain => {
      const domainName = getDisplayName(domain);
      const domainDescription = domain.description || '';
      const domainId = domain.id.toString();
      
      return matchesSearch(domainName, query) ||
             matchesSearch(domainDescription, query) ||
             matchesSearch(domainId, query);
    });

    // Filter tenants that match the search
    const matchingTenants = tenants.filter(tenant => {
      const tenantName = getDisplayName(tenant);
      const tenantDescription = tenant.description || '';
      const tenantId = tenant.id.toString();
      
      return matchesSearch(tenantName, query) ||
             matchesSearch(tenantDescription, query) ||
             matchesSearch(tenantId, query);
    });

    // Also include domains that have matching tenants (but don't match themselves)
    const domainsWithMatchingTenants = domains.filter(domain => {
      // Check if this domain has any matching tenants
      const hasMatchingTenants = matchingTenants.some(tenant => 
        (tenant.domainId || tenant.domainid) === domain.id
      );
      
      // Only include if it has matching tenants AND doesn't already match itself
      return hasMatchingTenants && !matchingDomains.some(d => d.id === domain.id);
    });

    const results = {
      domains: [...matchingDomains, ...domainsWithMatchingTenants],
      tenants: matchingTenants,
      query
    };

    onSearchResults?.(results);
    return results;
  }, [searchQuery, domains, tenants, getDisplayName, matchesSearch, onSearchResults]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input Only */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-8 text-sm"
          autoComplete="off"
          spellCheck="false"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-3 w-3 text-gray-400" />
          </Button>
        )}
      </div>

      {/* Search Stats - Only show when searching */}
      {searchQuery.trim() && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
          <span>
            {searchResults.domains.length === 0 && searchResults.tenants.length === 0 ? (
              'No results found'
            ) : (
              `${searchResults.domains.length} domain${searchResults.domains.length !== 1 ? 's' : ''}, ${searchResults.tenants.length} tenant${searchResults.tenants.length !== 1 ? 's' : ''}`
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export default DomainTenantSearch;