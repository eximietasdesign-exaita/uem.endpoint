import React, { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/SidebarContent";
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
  
  // Search state - updates instantly
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to check if text matches search query
  const matchesSearch = useCallback((text: string, query: string) => {
    return text.toLowerCase().includes(query.toLowerCase());
  }, []);

  // Filter navigation based on search query - computed instantly
  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) {
      return navigationRegistry;
    }

    return navigationRegistry.map((item) => {
      // Check if main item matches
      const itemMatches = 
        matchesSearch(item.name, searchQuery) ||
        (item.description && matchesSearch(item.description, searchQuery));

      if (!item.children) {
        // Single item - return if it matches
        return itemMatches ? item : null;
      }

      // Group item - check children
      const matchingChildren = item.children?.filter((child: any) => {
        return matchesSearch(child.name, searchQuery) ||
               (child.description && matchesSearch(child.description, searchQuery));
      }) || [];

      // Include group if it matches OR has matching children
      if (itemMatches || matchingChildren.length > 0) {
        return {
          ...item,
          children: matchingChildren
        };
      }

      return null;
    }).filter(Boolean);
  }, [searchQuery, matchesSearch]);

  // Auto-expand groups that have matching children when searching - instant
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const groupsToExpand = new Set<string>();
      filteredNavigation.forEach(item => {
        if (item?.children && item.children.length > 0) {
          groupsToExpand.add(item.id);
        }
      });
      setExpandedGroups(prev => {
        const newSet = new Set<string>(prev);
        groupsToExpand.forEach(g => newSet.add(g));
        return newSet;
      });
    }
  }, [searchQuery, filteredNavigation]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return newExpanded;
    });
  }, []);

  const isActive = useCallback((path: string | null) => {
    if (!path) return false;
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  }, [location]);

  const isGroupActive = useCallback((group: any) => {
    if (group.path && isActive(group.path)) return true;
    return group.children?.some((child: any) => isActive(child.path)) || false;
  }, [isActive]);

  // Handle search change - instant update - STABLE REFERENCE
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:dark:bg-gray-900 lg:border-r lg:border-gray-200 lg:dark:border-gray-700 transition-all duration-300 relative",
        isCollapsed ? "lg:w-16" : "lg:w-80"
      )}>
        <SidebarContent
          forMobile={false}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onClose={onClose}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filteredNavigation={filteredNavigation}
          expandedGroups={expandedGroups}
          toggleGroup={toggleGroup}
          isActive={isActive}
          isGroupActive={isGroupActive}
        />
        
        {/* Expand button */}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="absolute -right-3 top-10 h-6 w-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl rounded-full transition-all duration-200 hover:scale-110 z-10"
            data-testid="button-expand-sidebar"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent
            forMobile={true}
            isCollapsed={false}
            onToggleCollapse={onToggleCollapse}
            onClose={onClose}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            filteredNavigation={filteredNavigation}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            isActive={isActive}
            isGroupActive={isGroupActive}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}