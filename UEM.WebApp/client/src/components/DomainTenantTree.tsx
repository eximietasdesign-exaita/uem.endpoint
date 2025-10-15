import React, { useState } from "react";
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
    onChange({ domainId, tenantId: null });
  };

  const handleTenantSelect = (domainId: number, tenantId: number) => {
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
            const isDomainSelected = value?.domainId === domain.id && value?.tenantId === null;

            return (
              <div key={domain.id}>
                <div
                  className={`flex items-center space-x-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors ${
                    isDomainSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
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
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {domain.displayname}
                  </span>
                  {domainTenants.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {domainTenants.length} {domainTenants.length === 1 ? 'tenant' : 'tenants'}
                    </span>
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
                            isTenantSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                          }`}
                          onClick={() => handleTenantSelect(domain.id, tenant.id)}
                        >
                          <Users className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {tenant.displayname}
                          </span>
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
