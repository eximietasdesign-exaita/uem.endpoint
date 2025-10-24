import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Building2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
  value?: { domainId: number | null; tenantId: number | null };
  onChange: (value: { domainId: number | null; tenantId: number | null }) => void;
}

export function DomainTenantTree({ value, onChange }: DomainTenantTreeProps) {
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set());

  const { data: domains = [] } = useQuery<Domain[]>({
    queryKey: ['/api/domains'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['/api/tenants'],
    staleTime: 5 * 60 * 1000,
  });

  // Auto-expand domain when tenant is selected or when component receives initial value
  useEffect(() => {
    if (value?.tenantId && value?.domainId) {
      setExpandedDomains(prev => {
        const next = new Set<number>();
        prev.forEach(v => next.add(v));
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
    }
  }, [value?.domainId, value?.tenantId]);

  const toggleDomain = (domainId: number) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
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
                    {domain.displayname}
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
                            {tenant.displayname}
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
