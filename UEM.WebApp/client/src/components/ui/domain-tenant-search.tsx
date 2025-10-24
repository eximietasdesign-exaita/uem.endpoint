import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Building2, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Domain {
  id: number;
  displayName?: string;
  displayname?: string;
  status?: string;
}

interface Tenant {
  id: number;
  domainId?: number;
  domainid?: number;
  displayName?: string;
  displayname?: string;
  status?: string;
}

interface DomainTenantSearchProps {
  domains: Domain[];
  tenants: Tenant[];
  selectedDomainId: number | null;
  selectedTenantId: number | null;
  onSelect: (value: { domainId: number | null; tenantId: number | null }) => void;
  className?: string;
}

interface SearchResult {
  type: 'domain' | 'tenant';
  id: number;
  name: string;
  domainId?: number;
  domainName?: string;
  status?: string;
}

export function DomainTenantSearch({
  domains,
  tenants,
  selectedDomainId,
  selectedTenantId,
  onSelect,
  className
}: DomainTenantSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to get display name
  const getDisplayName = (item: Domain | Tenant) => {
    return (item as any).displayname || item.displayName || `Item ${item.id}`;
  };

  // Helper function to get tenants for a domain
  const getTenantsForDomain = (domainId: number) => {
    return tenants.filter(t => t.domainId === domainId || (t as any).domainid === domainId);
  };

  // Create search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search domains
    domains.forEach(domain => {
      const domainName = getDisplayName(domain).toLowerCase();
      if (domainName.includes(query) || domain.id.toString().includes(query)) {
        results.push({
          type: 'domain',
          id: domain.id,
          name: getDisplayName(domain),
          status: domain.status
        });
      }
    });

    // Search tenants
    tenants.forEach(tenant => {
      const tenantName = getDisplayName(tenant).toLowerCase();
      const domainId = tenant.domainId || (tenant as any).domainid;
      const domain = domains.find(d => d.id === domainId);
      const domainName = domain ? getDisplayName(domain) : 'Unknown Domain';

      if (tenantName.includes(query) || tenant.id.toString().includes(query)) {
        results.push({
          type: 'tenant',
          id: tenant.id,
          name: getDisplayName(tenant),
          domainId: domainId,
          domainName: domainName,
          status: tenant.status
        });
      }
    });

    // Sort results: domains first, then tenants, then by name
    return results.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'domain' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, domains, tenants]);

  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'domain') {
      onSelect({ domainId: result.id, tenantId: null });
    } else {
      onSelect({ domainId: result.domainId || null, tenantId: result.id });
    }
    setSearchQuery(''); // Clear search after selection
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
      suspended: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
    } as const;

    return (
      <Badge
        className={cn(
          'text-xs font-medium border',
          variants[status as keyof typeof variants] ||
            'bg-gray-100 text-gray-800 border-gray-200'
        )}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search domains and tenants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-8 text-sm"
          autoComplete="off"
          spellCheck="false"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-1">
          {searchResults.length > 0 ? (
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {/* Results count */}
              <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </div>

              {searchResults.map((result) => {
                const isSelected = 
                  (result.type === 'domain' && result.id === selectedDomainId) ||
                  (result.type === 'tenant' && result.id === selectedTenantId);

                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultSelect(result)}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border text-sm',
                      isSelected 
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                    )}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {result.type === 'domain' ? (
                        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm truncate">
                            {highlightText(result.name, searchQuery)}
                          </span>
                          {isSelected && (
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        {result.type === 'tenant' && result.domainName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.domainName}
                          </div>
                        )}
                        
                        {result.type === 'domain' && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {getTenantsForDomain(result.id).length} tenant{getTenantsForDomain(result.id).length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {getStatusBadge(result.status)}
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {result.type === 'domain' ? 'Domain' : 'Tenant'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for "{searchQuery}"</p>
              <p className="text-xs mt-1">Try searching by name or ID</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DomainTenantSearch;