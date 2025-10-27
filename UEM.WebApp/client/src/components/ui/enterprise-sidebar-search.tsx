import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EnterpriseSearchProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onSearchChange?: (query: string) => void;
  showStats?: boolean;
  statsCount?: number;
}

export function EnterpriseSearch({
  placeholder = 'Search navigation, features, pages...',
  className,
  value = '',
  onSearchChange,
  showStats = true,
  statsCount = 0
}: EnterpriseSearchProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Search Input - Controlled by parent */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-9 pr-8 text-sm"
          autoComplete="off"
          spellCheck="false"
          type="text"
        />
        {value && (
          <button
            onClick={() => onSearchChange?.('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            type="button"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Stats - Only show when searching */}
      {showStats && value.trim() && (
        <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
          {statsCount === 0 ? (
            'No results found'
          ) : (
            `${statsCount} result${statsCount !== 1 ? 's' : ''} found`
          )}
        </div>
      )}
    </div>
  );
}

export default EnterpriseSearch;