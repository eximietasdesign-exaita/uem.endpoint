import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { searchNavigation } from '@/utils/nav';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  path: string | null;
  category: string;
  breadcrumbs: string;
  icon: any;
  score: number;
}

interface EnterpriseSearchProps {
  // For inline search (sidebar)
  variant?: 'inline' | 'modal';
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
  
  // For modal search (top header)
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  
  // For both
  showStats?: boolean;
  highlightMatches?: boolean;
  debounceMs?: number;
}

export function EnterpriseSearch({
  variant = 'inline',
  placeholder = 'Search navigation, features, pages...',
  className,
  onResultSelect,
  isOpen = false,
  onOpenChange,
  showStats = true,
  highlightMatches = true,
  debounceMs = 250
}: EnterpriseSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(() => {
      const results = searchNavigation(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, debounceMs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k' && variant === 'modal') {
        event.preventDefault();
        onOpenChange?.(true);
      }
      if (event.key === 'Escape') {
        if (variant === 'modal') {
          onOpenChange?.(false);
        }
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [variant, onOpenChange]);

  const handleResultClick = useCallback((result: SearchResult) => {
    onResultSelect?.(result);
    if (variant === 'modal') {
      onOpenChange?.(false);
      // Navigate to the result if a path is available
      if (result.path) {
        window.location.href = result.path;
      }
    }
    setSearchQuery('');
    setSearchResults([]);
  }, [onResultSelect, variant, onOpenChange]);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim() || !highlightMatches) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, [highlightMatches]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  }, []);

  // Inline search for sidebar
  if (variant === 'inline') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="relative">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          )}
          <Input
            ref={searchInputRef}
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                clearSearch();
                searchInputRef.current?.blur();
              }
              if (e.key === 'Enter' && searchResults.length > 0) {
                handleResultClick(searchResults[0]);
              }
            }}
            className="pl-9 pr-8 text-sm"
            autoComplete="off"
            spellCheck="false"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Results Stats */}
        {showStats && searchQuery.trim() && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
            {searchResults.length > 0 ? (
              <span>{searchResults.length} results found</span>
            ) : isSearching ? (
              <span>Searching...</span>
            ) : (
              <span>No results found for "{searchQuery}"</span>
            )}
          </div>
        )}

        {/* Inline Results */}
        {searchQuery.trim() && searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-1">
            {searchResults.slice(0, 5).map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors text-sm"
              >
                <result.icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {highlightText(result.name, searchQuery)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {result.breadcrumbs}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {result.category}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Modal search for top header
  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenChange?.(true)}
        className="hidden md:flex items-center space-x-2 min-w-[240px] justify-between text-muted-foreground"
      >
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>Search...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      {/* Mobile search icon */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onOpenChange?.(true)}
        className="md:hidden"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>

      {/* Search Modal */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-4 py-3 border-b">
            <DialogTitle className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Global Search</span>
            </DialogTitle>
            <DialogDescription>
              Search across all pages, features, and content
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-4 py-2">
            <Input
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          
          <div className="px-4 pb-4">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            )}
            
            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <result.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{highlightText(result.name, searchQuery)}</p>
                        <p className="text-sm text-muted-foreground">{result.breadcrumbs}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.category}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            
            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EnterpriseSearch;