import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Building2,
  Zap,
  ChevronLeft,
  Menu,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { navigationRegistry, getLeafNavigationItems } from "@/utils/nav";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface EnterpriseSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function EnterpriseSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: EnterpriseSidebarProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['discovery-group', 'assets-group', 'automation-group'])
  );

  // Debounce search query with 300ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
    if (group.children) {
      return group.children.some((child: any) => isActive(child.path));
    }
    return false;
  };

  // Handle search state changes
  useEffect(() => {
    if (searchQuery.trim() && !debouncedSearchQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  // Advanced search functionality with scoring and highlighting
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return { 
        filteredItems: navigationRegistry, 
        hasResults: true,
        searchStats: null 
      };
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    const results: Array<{
      item: any;
      score: number;
      matchType: 'exact' | 'starts' | 'contains';
      matchedChildren?: any[];
    }> = [];

    navigationRegistry.forEach(item => {
      let score = 0;
      let matchType: 'exact' | 'starts' | 'contains' = 'contains';
      const matchedChildren: any[] = [];

      // Score main item
      const itemName = item.name.toLowerCase();
      if (itemName === query) {
        score += 100;
        matchType = 'exact';
      } else if (itemName.startsWith(query)) {
        score += 50;
        matchType = 'starts';
      } else if (itemName.includes(query)) {
        score += 20;
      }

      // Score tags
      item.tags.forEach((tag: string) => {
        const tagLower = tag.toLowerCase();
        if (tagLower === query) score += 80;
        else if (tagLower.startsWith(query)) score += 40;
        else if (tagLower.includes(query)) score += 15;
      });

      // Score children
      if (item.children) {
        item.children.forEach((child: any) => {
          let childScore = 0;
          const childName = child.name.toLowerCase();
          
          if (childName === query) childScore = 90;
          else if (childName.startsWith(query)) childScore = 45;
          else if (childName.includes(query)) childScore = 18;

          child.tags.forEach((tag: string) => {
            const tagLower = tag.toLowerCase();
            if (tagLower === query) childScore += 70;
            else if (tagLower.startsWith(query)) childScore += 35;
            else if (tagLower.includes(query)) childScore += 12;
          });

          if (childScore > 0) {
            matchedChildren.push({ ...child, searchScore: childScore });
            score += childScore * 0.7; // Children contribute to parent score
          }
        });
      }

      if (score > 0) {
        results.push({
          item: { ...item, matchedChildren },
          score,
          matchType,
          matchedChildren
        });
      }
    });

    // Sort by score (highest first), then by match type
    results.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const typeOrder = { exact: 0, starts: 1, contains: 2 };
      return typeOrder[a.matchType] - typeOrder[b.matchType];
    });

    const filteredItems = results.map(r => r.item);
    const totalMatches = results.length + results.reduce((acc, r) => acc + (r.matchedChildren?.length || 0), 0);

    return {
      filteredItems,
      hasResults: filteredItems.length > 0,
      searchStats: {
        totalItems: filteredItems.length,
        totalMatches,
        query: debouncedSearchQuery
      }
    };
  }, [debouncedSearchQuery]);

  // Auto-expand groups when searching
  useEffect(() => {
    if (debouncedSearchQuery.trim() && searchResults.hasResults) {
      const groupsToExpand = new Set<string>();
      searchResults.filteredItems.forEach((item: any) => {
        if (item.children && item.matchedChildren?.length > 0) {
          groupsToExpand.add(item.id);
        }
      });
      setExpandedGroups(prev => new Set([...Array.from(prev), ...Array.from(groupsToExpand)]));
    }
  }, [debouncedSearchQuery, searchResults]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-current font-medium rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
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
          {/* Collapse toggle for desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden lg:flex"
            data-testid="button-toggle-sidebar"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
            data-testid="button-close-sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      {(!isCollapsed || forMobile) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <Input
                placeholder="Search navigation, features, pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 text-sm"
                data-testid="input-sidebar-search"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  data-testid="button-clear-search"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Search Results Stats */}
            {debouncedSearchQuery.trim() && searchResults.searchStats && (
              <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                {searchResults.hasResults ? (
                  <span>
                    {searchResults.searchStats.totalMatches} results found
                    {searchResults.searchStats.totalItems !== searchResults.searchStats.totalMatches && 
                      ` in ${searchResults.searchStats.totalItems} sections`
                    }
                  </span>
                ) : (
                  <span>No results found for "{searchResults.searchStats.query}"</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {searchResults.filteredItems.map((item) => (
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
                          {highlightText(item.name, debouncedSearchQuery)}
                        </span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {/* Tooltip for collapsed state */}
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
                            {highlightText(item.name, debouncedSearchQuery)}
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
                      {/* Tooltip for collapsed state */}
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
                    {(debouncedSearchQuery.trim() ? (item.matchedChildren || item.children) : item.children)
                      ?.filter((child: any) => child.searchable && child.path) // Only show searchable items with paths
                      .sort((a: any, b: any) => {
                        // When searching, sort by search score, otherwise by order
                        if (debouncedSearchQuery.trim() && a.searchScore && b.searchScore) {
                          return b.searchScore - a.searchScore;
                        }
                        return a.order - b.order;
                      })
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
                                  {highlightText(child.name, debouncedSearchQuery)}
                                </span>
                                {child.badge && (
                                  <Badge variant="outline" className="text-xs">
                                    {child.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                            {/* Tooltip for collapsed state */}
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