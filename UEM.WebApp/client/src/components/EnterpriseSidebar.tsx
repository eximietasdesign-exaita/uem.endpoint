import React, { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronDown,
  ChevronRight,
  Building2,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { EnterpriseSearch } from "@/components/ui/enterprise-sidebar-search";
import { navigationRegistry } from "@/utils/nav";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface EnterpriseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function EnterpriseSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: EnterpriseSidebarProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['discovery-group', 'assets-group', 'automation-group'])
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const isGroupActive = (group: any) => {
    if (group.path && isActive(group.path)) return true;
    return group.children?.some((child: any) => isActive(child.path)) || false;
  };

  const handleSearchResultSelect = (result: any) => {
    // Navigate to the selected result
    window.location.href = result.path;
  };

  const SidebarContent = ({ forMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed && !forMobile ? "justify-center w-full" : "space-x-2"
        )}>
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          {(!isCollapsed || forMobile) && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Enterprise Manager
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Navigation
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden lg:flex"
            data-testid="button-toggle-sidebar"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
            data-testid="button-close-sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search - Using the reusable component */}
      {(!isCollapsed || forMobile) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <EnterpriseSearch
            variant="inline"
            placeholder="Search navigation, features, pages..."
            onResultSelect={handleSearchResultSelect}
            showStats={true}
            highlightMatches={true}
            debounceMs={250}
          />
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {navigationRegistry.map((item) => (
            <div key={item.id}>
              {!item.children ? (
                // Single navigation item
                <Link href={item.path || '#'}>
                  <div
                    className={cn(
                      'flex items-center rounded-lg transition-all duration-200 group relative',
                      isCollapsed && !forMobile ? 'justify-center px-3 py-2.5' : 'space-x-3 px-3 py-2.5',
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    )}
                    data-testid={`nav-${item.id}`}
                    title={isCollapsed && !forMobile ? item.name : undefined}
                  >
                    <div className="flex-shrink-0">
                      <item.icon className={cn(
                        'h-5 w-5 transition-colors',
                        isActive(item.path)
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      )} />
                    </div>
                    {(!isCollapsed || forMobile) && (
                      <>
                        <span className="font-medium text-sm flex-1 min-w-0 truncate">
                          {item.name}
                        </span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {isCollapsed && !forMobile && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                // Grouped navigation section
                <Collapsible
                  open={expandedGroups.has(item.id) && (!isCollapsed || forMobile)}
                  onOpenChange={() => !isCollapsed && toggleGroup(item.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        'flex items-center w-full rounded-lg transition-all duration-200 group cursor-pointer relative',
                        isCollapsed && !forMobile
                          ? 'justify-center px-3 py-2.5'
                          : 'justify-between px-3 py-2.5',
                        isGroupActive(item)
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                      )}
                      data-testid={`nav-group-${item.id}`}
                      title={isCollapsed && !forMobile ? item.name : undefined}
                    >
                      <div className={cn(
                        "flex items-center",
                        isCollapsed && !forMobile ? "" : "space-x-3"
                      )}>
                        <div className="flex-shrink-0">
                          <item.icon className={cn(
                            'h-5 w-5 transition-colors',
                            isGroupActive(item)
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                          )} />
                        </div>
                        {(!isCollapsed || forMobile) && (
                          <span className="font-medium text-sm flex-1 min-w-0">
                            {item.name}
                          </span>
                        )}
                      </div>
                      {(!isCollapsed || forMobile) && (
                        expandedGroups.has(item.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500 transition-transform" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500 transition-transform" />
                        )
                      )}
                      {isCollapsed && !forMobile && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className={cn(
                    "mt-1 space-y-1",
                    isCollapsed && !forMobile ? "ml-0" : "ml-8"
                  )}>
                    {item.children
                      ?.filter((child: any) => child.searchable !== false && child.path)
                      .map((child: any) => (
                        <Link key={child.id} href={child.path || '#'}>
                          <div
                            className={cn(
                              'flex items-center rounded-md transition-all duration-200 group relative',
                              isCollapsed && !forMobile ? 'justify-center px-3 py-2' : 'space-x-3 px-3 py-2',
                              isActive(child.path)
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
                            )}
                            data-testid={`nav-${child.id}`}
                            title={isCollapsed && !forMobile ? child.name : undefined}
                          >
                            <div className="flex-shrink-0">
                              <child.icon className={cn(
                                'h-4 w-4 transition-colors',
                                isActive(child.path)
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'
                              )} />
                            </div>
                            {(!isCollapsed || forMobile) && (
                              <>
                                <span className="text-sm flex-1 min-w-0 truncate">
                                  {child.name}
                                </span>
                                {child.badge && (
                                  <Badge variant="outline" className="text-xs">
                                    {child.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                            {isCollapsed && !forMobile && (
                              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {child.name}
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className={cn(
          "flex items-center text-xs text-gray-500 dark:text-gray-400",
          isCollapsed && !forMobile ? "justify-center" : "justify-between"
        )}>
          {(!isCollapsed || forMobile) ? (
            <>
              <span>Enterprise Manager</span>
              <Badge variant="outline" className="text-xs">
                v2.1.4
              </Badge>
            </>
          ) : (
            <Badge variant="outline" className="text-xs">
              v2.1.4
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:dark:bg-gray-900 lg:border-r lg:border-gray-200 lg:dark:border-gray-700 transition-all duration-300",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <SidebarContent forMobile={false} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent forMobile={true} />
        </SheetContent>
      </Sheet>
    </>
  );
}