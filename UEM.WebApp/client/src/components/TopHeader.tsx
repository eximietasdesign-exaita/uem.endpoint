import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Globe, Building2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocation } from "wouter";
import { useDomainTenant } from "@/contexts/DomainTenantContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
  getPageInfo: (pathname?: string) => { title: string; subtitle: string };
}

export function TopHeader({ setIsSidebarOpen, getPageInfo }: TopHeaderProps) {
  const [location] = useLocation();
  const { title, subtitle } = getPageInfo(location);

  const {
    selectedDomain,
    selectedTenant,
    domains,
    tenants,
    setSelectedDomain,
    setSelectedTenant,
    isLoading,
    error,
  } = useDomainTenant();

  const getStatusBadge = (status: string) => {
    const variants = {
      active:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200",
      inactive:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
      suspended:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200",
    } as const;

    return (
      <Badge
        className={cn(
          "ml-1 text-xs font-medium border",
          variants[status as keyof typeof variants] ||
            "bg-gray-100 text-gray-800 border-gray-200",
        )}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const showDomainTenant =
    !location.includes("/domain-management") &&
    !location.includes("/tenant-management");

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Domain/Tenant Selectors */}
          {showDomainTenant && !isLoading && !error && (
            <>
              {/* Domain Selector */}
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <Select
                  value={selectedDomain?.id.toString() || ""}
                  onValueChange={(value) => {
                    const domain = domains.find(
                      (d) => d.id.toString() === value,
                    );
                    if (domain) {
                      setSelectedDomain(domain);
                    }
                  }}
                >
                  <SelectTrigger className="w-48 h-8 text-sm">
                    <SelectValue placeholder="Select Domain">
                      {selectedDomain && (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium truncate">
                            {selectedDomain.displayName}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(domains) && domains.length > 0 ? (
                      domains.map((domain) => (
                        <SelectItem
                          key={domain.id}
                          value={domain.id.toString()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {domain.displayName}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-domains" disabled>
                        No domains available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Tenant Selector */}
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <Select
                  value={selectedTenant?.id.toString() || ""}
                  onValueChange={(value) => {
                    const tenant = tenants.find(
                      (t) => t.id.toString() === value,
                    );
                    if (tenant) {
                      setSelectedTenant(tenant);
                    }
                  }}
                  disabled={!selectedDomain}
                >
                  <SelectTrigger className="w-48 h-8 text-sm">
                    <SelectValue placeholder="Select Tenant">
                      {selectedTenant && (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium truncate">
                            {selectedTenant.displayName}
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(tenants) && tenants.length > 0 ? (
                      tenants.map((tenant) => (
                        <SelectItem
                          key={tenant.id}
                          value={tenant.id.toString()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {tenant.displayName}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-tenants" disabled>
                        {selectedDomain
                          ? "No tenants available"
                          : "Select domain first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
