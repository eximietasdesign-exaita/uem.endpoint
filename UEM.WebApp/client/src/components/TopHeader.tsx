import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Globe, Building2, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocation } from "wouter";
import { useDomainTenant } from "@/contexts/DomainTenantContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DomainTenantTree } from "@/components/DomainTenantTree";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
  getPageInfo: (pathname?: string) => { title: string; subtitle: string };
}

export function TopHeader({ setIsSidebarOpen, getPageInfo }: TopHeaderProps) {
  const [location] = useLocation();
  const { title, subtitle } = getPageInfo(location);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const {
    selectedDomain,
    selectedTenant,
    setSelectedDomain,
    setSelectedTenant,
    isLoading,
    error,
  } = useDomainTenant();

  const showDomainTenant =
    !location.includes("/domain-management") &&
    !location.includes("/tenant-management");

  const handleTreeChange = (value: { domainId: number | null; tenantId: number | null }) => {
    setSelectedDomain(value.domainId ? { id: value.domainId } as any : null);
    setSelectedTenant(value.tenantId ? { id: value.tenantId } as any : null);
    setPopoverOpen(false);
  };

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
          {/* Domain/Tenant Selector */}
          {showDomainTenant && !isLoading && !error && (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 justify-between min-w-[200px]"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {selectedDomain ? (
                      <>
                        <Globe className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">
                          {selectedDomain.displayName}
                          {selectedTenant && ` / ${selectedTenant.displayName}`}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Select domain & tenant
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-3 w-3 ml-2 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" align="end">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Select Domain & Tenant</div>
                  <DomainTenantTree
                    value={{
                      domainId: selectedDomain?.id || null,
                      tenantId: selectedTenant?.id || null
                    }}
                    onChange={handleTreeChange}
                  />
                </div>
              </PopoverContent>
            </Popover>
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
