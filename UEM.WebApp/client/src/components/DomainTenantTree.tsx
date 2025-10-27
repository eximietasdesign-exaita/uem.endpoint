import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Building2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { highlightText } from '@/utils/highlight';

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
}

interface DomainTenantTreeProps {
  domains: Domain[];
  tenants: Tenant[];
  value: { domainId: number | null; tenantId: number | null };
  onChange: (value: { domainId: number | null; tenantId: number | null }) => void;
  searchQuery?: string; // Add this prop for highlighting
}

export function DomainTenantTree({ domains, tenants, value, onChange, searchQuery }: DomainTenantTreeProps) {
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set());
  const [manuallyExpandedDomains, setManuallyExpandedDomains] = useState<Set<number>>(new Set());

  // Auto-expand domain when tenant is selected or when component receives initial value
  useEffect(() => {
    if (value?.tenantId && value?.domainId) {
      setExpandedDomains(prev => {
        const next = new Set<number>();
        prev.forEach(v => next.add(v));
        next.add(value.domainId!);
        return next;
      });
      // Also track this as manually expanded since user selected it
      setManuallyExpandedDomains(prev => {
        const next = new Set(prev);
        next.add(value.domainId!);
        return next;
      });
    } else if (value?.domainId && !value?.tenantId) {
      // Also expand when only domain is selected
      setExpandedDomains(prev => {
        const next = new Set<number>();
        prev.forEach(v => next.add(v));
        next.add(value.domainId!);
        return next;
      });
      // Track this as manually expanded
      setManuallyExpandedDomains(prev => {
        const next = new Set(prev);
        next.add(value.domainId!);
        return next;
      });
    }
  }, [value?.domainId, value?.tenantId]);

  // Auto-expand domains that have matching tenants when searching
  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      const domainsToExpand = new Set<number>();
      
      // Find all tenants that match the search query
      const matchingTenants = tenants.filter(tenant => {
        return tenant.displayname.toLowerCase().includes(searchQuery.toLowerCase());
      });
      
      // Get domain IDs for those matching tenants
      matchingTenants.forEach(tenant => {
        domainsToExpand.add(tenant.domainid);
      });
      
      // Auto-expand these domains (preserve manually expanded ones)
      setExpandedDomains(prev => {
        const next = new Set(manuallyExpandedDomains); // Start with manually expanded
        domainsToExpand.forEach(domainId => next.add(domainId)); // Add search results
        return next;
      });
    } else if (searchQuery === '' || !searchQuery) {
      // When search is cleared, collapse all domains except manually expanded ones
      setExpandedDomains(new Set(manuallyExpandedDomains));
    }
  }, [searchQuery, tenants, manuallyExpandedDomains]);

  const toggleDomain = (domainId: number) => {
    const newExpanded = new Set(expandedDomains);
    const newManuallyExpanded = new Set(manuallyExpandedDomains);
    
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
      newManuallyExpanded.delete(domainId); // Remove from manually expanded too
    } else {
      newExpanded.add(domainId);
      newManuallyExpanded.add(domainId); // Track as manually expanded
    }
    
    setExpandedDomains(newExpanded);
    setManuallyExpandedDomains(newManuallyExpanded);
  };
  
  const handleDomainSelect = (domainId: number) => {
    console.log('Domain selected:', domainId);
    onChange({ domainId, tenantId: null });
  };

  const handleTenantSelect = (domainId: number, tenantId: number) => {
    console.log('Tenant selected:', { domainId, tenantId });
    onChange({ domainId, tenantId });
  };

  const getTenantsByDomain = (domainId: number) => {
    return tenants.filter(t => t.domainid === domainId);
  };

  const getDisplayName = (domain: Domain) => {
    return searchQuery ? highlightText(domain.displayname, searchQuery) : domain.displayname;
  };

  // Add highlighting function for tenants
  const getTenantDisplayName = (tenant: Tenant) => {
    return searchQuery ? highlightText(tenant.displayname, searchQuery) : tenant.displayname;
  };

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-950 max-h-64 overflow-y-auto">
      {domains.length === 0 ? (
        <div className="p-4 text-sm text-gray-500 text-center">No domains available</div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {domains.map((domain) => {
            const domainTenants = getTenantsByDomain(domain.id);
            const isExpanded = expandedDomains.has(domain.id);
            
            // Enhanced selection logic: highlight domain if it's selected OR if one of its tenants is selected
            const isDomainSelected = value?.domainId === domain.id && value?.tenantId === null;
            const hasTenantSelected = value?.tenantId && value?.domainId === domain.id && domainTenants.some(t => t.id === value.tenantId);
            const isDomainHighlighted = isDomainSelected || hasTenantSelected;

            return (
              <div key={domain.id}>
                <div
                  className={`flex items-center space-x-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors ${
                    isDomainHighlighted 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                      : ''
                  }`}
                  onClick={() => handleDomainSelect(domain.id)}
                >
                  {domainTenants.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDomain(domain.id);
                      }}
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  )}
                  {domainTenants.length === 0 && <div className="w-5" />}
                  
                  <Building2 className={`w-4 h-4 ${
                    isDomainHighlighted 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  
                  <span className={`flex-1 text-sm font-medium ${
                    isDomainHighlighted 
                      ? 'text-blue-900 dark:text-blue-100 font-semibold' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {getDisplayName(domain)}
                  </span>
                  
                  {domainTenants.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isDomainHighlighted 
                        ? 'text-blue-700 bg-blue-100 dark:bg-blue-800 dark:text-blue-200' 
                        : 'text-gray-500 bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {domainTenants.length} {domainTenants.length === 1 ? 'tenant' : 'tenants'}
                    </span>
                  )}

                  {/* Selection indicator */}
                  {isDomainSelected && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                  )}
                  {hasTenantSelected && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                  )}
                </div>

                {isExpanded && domainTenants.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900/50">
                    {domainTenants.map((tenant) => {
                      const isTenantSelected = value?.domainId === domain.id && value?.tenantId === tenant.id;
                      
                      return (
                        <div
                          key={tenant.id}
                          className={`flex items-center space-x-2 p-3 pl-12 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                            isTenantSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 ml-4' 
                              : ''
                          }`}
                          onClick={() => handleTenantSelect(domain.id, tenant.id)}
                        >
                          <Users className={`w-3.5 h-3.5 ${
                            isTenantSelected 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`} />
                          
                          <span className={`text-sm flex-1 ${
                            isTenantSelected 
                              ? 'text-blue-900 dark:text-blue-100 font-medium' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {getTenantDisplayName(tenant)}
                          </span>

                          {/* Selection indicator for tenant */}
                          {isTenantSelected && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}