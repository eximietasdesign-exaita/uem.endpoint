import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronRight,
  Globe,
  Building2,
  ChevronDown
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { buildBreadcrumbs } from '@/utils/nav';
import { useDomainTenant } from '@/contexts/DomainTenantContext';
import { cn } from '@/lib/utils';

export function EnterpriseContextBar() {
  const [location] = useLocation();
  const {
    selectedDomain,
    selectedTenant,
  } = useDomainTenant();

  // Build breadcrumbs from current location
  const breadcrumbs = buildBreadcrumbs(location);


  return (
    <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-2">
      <div className="flex items-center justify-between">
        {/* Left section: Breadcrumbs */}
        <div className="flex items-center flex-1 min-w-0">
          <Breadcrumb className="flex-1 min-w-0">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 || crumb.path === '#' ? (
                      <BreadcrumbPage 
                        className="max-w-32 truncate font-medium text-gray-900 dark:text-gray-100"
                        data-testid={`breadcrumb-current-${crumb.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {crumb.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={crumb.path}
                        className="max-w-32 truncate text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        data-testid={`breadcrumb-${crumb.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {crumb.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right section: Enterprise Context */}
        <div className="flex items-center space-x-4">
          {/* Viewing data for label */}
          <div className="hidden lg:block text-xs text-gray-600 dark:text-gray-400 font-medium">
            Viewing data for:
          </div>

          {/* Domain Context */}
          {selectedDomain && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  data-testid="dropdown-domain-selector"
                >
                  <div className="flex items-center space-x-1.5">
                    <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {selectedDomain.displayName}
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <div className="flex items-center space-x-2 w-full">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">{selectedDomain.displayName}</div>
                      <div className="text-xs text-gray-500">{selectedDomain.name}</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Tenant Context */}
          {selectedTenant && (
            <>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    data-testid="dropdown-tenant-selector"
                  >
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {selectedTenant.displayName}
                      </span>
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <div className="flex items-center space-x-2 w-full">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <div className="flex-1">
                        <div className="font-medium">{selectedTenant.displayName}</div>
                        <div className="text-xs text-gray-500">{selectedTenant.name}</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* Mobile context indicator */}
          <div className="lg:hidden flex items-center space-x-1">
            {selectedDomain && (
              <Button variant="outline" size="sm" className="h-6 px-2">
                <Globe className="h-3 w-3 text-blue-600 mr-1" />
                <span className="text-xs max-w-16 truncate">
                  {selectedDomain.displayName}
                </span>
              </Button>
            )}
            {selectedTenant && (
              <>
                <ChevronRight className="h-3 w-3 text-gray-400" />
                <Button variant="outline" size="sm" className="h-6 px-2">
                  <Building2 className="h-3 w-3 text-purple-600 mr-1" />
                  <span className="text-xs max-w-16 truncate">
                    {selectedTenant.displayName}
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}