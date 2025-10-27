import React from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronDown,
  ChevronRight,
  Building2,
  ChevronLeft,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EnterpriseSearch } from "@/components/ui/enterprise-sidebar-search";
import { useLanguage } from "@/contexts/LanguageContext";
import { highlightText } from "@/utils/highlight";
import { cn } from "@/lib/utils";

interface SidebarContentProps {
  forMobile?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredNavigation: any[];
  expandedGroups: Set<string>;
  toggleGroup: (groupId: string) => void;
  isActive: (path: string | null) => boolean;
  isGroupActive: (group: any) => boolean;
}

export const SidebarContent = React.memo(function SidebarContent({
  forMobile = false,
  isCollapsed,
  onToggleCollapse,
  onClose,
  searchQuery,
  onSearchChange,
  filteredNavigation,
  expandedGroups,
  toggleGroup,
  isActive,
  isGroupActive
}: SidebarContentProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-gray-200 dark:border-gray-700",
        isCollapsed && !forMobile ? "justify-center p-3" : "justify-between p-4"
      )}>
        <div className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed && !forMobile ? "justify-center" : "space-x-3"
        )}>
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex-shrink-0">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          {(!isCollapsed || forMobile) && (
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                Enterprise Manager
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Navigation
              </p>
            </div>
          )}
        </div>
        
        {(!isCollapsed || forMobile) && (
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-8 w-8"
              data-testid="button-toggle-sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden h-8 w-8"
              data-testid="button-close-sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Search - Hidden in collapsed state */}
      {(!isCollapsed || forMobile) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <EnterpriseSearch
            placeholder="Search navigation, features, pages..."
            value={searchQuery}
            onSearchChange={onSearchChange}
            showStats={true}
            statsCount={filteredNavigation.length}
          />
        </div>
      )}

      {/* Navigation - Filtered in-place with instant updates */}
      <ScrollArea className={cn(
        "flex-1",
        isCollapsed && !forMobile ? "p-2" : "p-4"
      )}>
        <nav className={cn(
          isCollapsed && !forMobile ? "space-y-1" : "space-y-2"
        )}>
          {filteredNavigation.length === 0 && searchQuery.trim() ? (
            // No search results
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
              <p className="text-xs mt-1">Try searching with different keywords</p>
            </div>
          ) : (
            filteredNavigation
              .filter((item): item is NonNullable<any> => Boolean(item))
              .map((item) => (
                <div key={item.id}>
                {!item.children ? (
                  // Single navigation item with instant highlighting
                  <Link href={item.path || '#'}>
                    <div
                      className={cn(
                        'flex items-center rounded-lg transition-all duration-200 group relative',
                        isCollapsed && !forMobile 
                          ? 'justify-center w-12 h-12 mx-auto' 
                          : 'space-x-3 px-3 py-2.5',
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                      )}
                      data-testid={`nav-${item.id}`}
                      title={isCollapsed && !forMobile ? item.name : undefined}
                      onClick={onClose}
                    >
                      <div className="flex-shrink-0">
                        <item.icon className={cn(
                          'transition-colors h-5 w-5',
                          isActive(item.path)
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                        )} />
                      </div>
                      {(!isCollapsed || forMobile) && (
                        <>
                          <span className="font-medium text-sm flex-1 min-w-0 truncate">
                            {searchQuery ? highlightText(item.name, searchQuery) : item.name}
                          </span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                ) : (
                  // Grouped navigation section with instant highlighting
                  <Collapsible
                    open={expandedGroups.has(item.id) && (!isCollapsed || forMobile)}
                    onOpenChange={() => !isCollapsed && toggleGroup(item.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div
                        className={cn(
                          'flex items-center w-full rounded-lg transition-all duration-200 group cursor-pointer relative',
                          isCollapsed && !forMobile
                            ? 'justify-center w-12 h-12 mx-auto'
                            : 'justify-between px-3 py-2.5',
                          isGroupActive(item)
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                        )}
                        data-testid={`nav-group-${item.id}`}
                        title={isCollapsed && !forMobile ? item.name : undefined}
                      >
                        <div className={cn(
                          "flex items-center min-w-0",
                          isCollapsed && !forMobile ? "justify-center" : "space-x-3 flex-1"
                        )}>
                          <div className="flex-shrink-0">
                            <item.icon className={cn(
                              'transition-colors h-5 w-5',
                              isGroupActive(item)
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                            )} />
                          </div>
                          {(!isCollapsed || forMobile) && (
                            <span className="font-medium text-sm min-w-0 truncate">
                              {searchQuery ? highlightText(item.name, searchQuery) : item.name}
                            </span>
                          )}
                        </div>
                        {(!isCollapsed || forMobile) && (
                          <div className="flex-shrink-0">
                            {expandedGroups.has(item.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500 transition-transform" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500 transition-transform" />
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent className={cn(
                      "mt-1 space-y-1",
                      isCollapsed && !forMobile ? "hidden" : "ml-8"
                    )}>
                      {item.children
                        ?.filter((child: any) => child.searchable !== false && child.path)
                        .map((child: any) => (
                          <Link key={child.id} href={child.path || '#'}>
                            <div
                              className={cn(
                                'flex items-center rounded-md transition-all duration-200 group relative space-x-3 px-3 py-2',
                                isActive(child.path)
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
                              )}
                              data-testid={`nav-${child.id}`}
                              onClick={onClose}
                            >
                              <div className="flex-shrink-0">
                                <child.icon className={cn(
                                  'h-4 w-4 transition-colors',
                                  isActive(child.path)
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'
                                )} />
                              </div>
                              <span className="text-sm flex-1 min-w-0 truncate">
                                {searchQuery ? highlightText(child.name, searchQuery) : child.name}
                              </span>
                              {child.badge && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {child.badge}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className={cn(
        "border-t border-gray-200 dark:border-gray-700",
        isCollapsed && !forMobile ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "flex items-center text-xs text-gray-500 dark:text-gray-400",
          isCollapsed && !forMobile ? "justify-center" : "justify-between"
        )}>
          {(!isCollapsed || forMobile) ? (
            <>
              <span className="truncate flex-1 min-w-0">Enterprise Manager</span>
              <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                v2.1.4
              </Badge>
            </>
          ) : (
            <Badge variant="outline" className="text-xs px-1">
              v2.1
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});