import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Search,
  Bell,
  HelpCircle,
  Settings,
  User,
  Menu,
  ChevronRight,
  Building2,
  Globe,
  Keyboard,
  FileText,
  ExternalLink,
  LogOut,
  UserCircle,
  Languages,
  Moon,
  Sun,
  Command,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { buildBreadcrumbs, searchNavigation } from '@/utils/nav';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDomainTenant } from '@/contexts/DomainTenantContext';
import { cn } from '@/lib/utils';

interface EnterpriseTopHeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
}

// Mock user data - replace with actual user context
const mockUser = {
  name: 'John Smith',
  email: 'john.smith@enterprise.com',
  avatar: '',
  role: 'Administrator',
  department: 'IT Operations'
};

// Language options with flags (matching LanguageContext)
const languageOptions = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' }
];

export function EnterpriseTopHeader({ setIsSidebarOpen }: EnterpriseTopHeaderProps) {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const {
    selectedDomain,
    selectedTenant,
    domains,
    tenants,
    setSelectedDomain,
    setSelectedTenant,
  } = useDomainTenant();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Build breadcrumbs from current location
  const breadcrumbs = buildBreadcrumbs(location);

  // Global search functionality
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search with debouncing
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
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSelect = (path: string) => {
    window.location.href = path;
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
      suspended: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
    } as const;

    return (
      <Badge
        className={cn(
          'ml-1 text-xs font-medium border',
          variants[status as keyof typeof variants] ||
            'bg-gray-100 text-gray-800 border-gray-200'
        )}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left section: Logo, Menu, Breadcrumbs */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>

            {/* Application Logo */}
            <Link href="/" className="flex items-center space-x-2" data-testid="link-logo">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Enterprise Manager
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Endpoint Management Platform
                </p>
              </div>
            </Link>

          </div>

          {/* Right section: Actions */}
          <div className="flex items-center space-x-2">

            {/* Global Search */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center space-x-2 min-w-[240px] justify-between text-muted-foreground"
              data-testid="button-global-search"
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
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden"
              data-testid="button-search-mobile"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-language">
                  <Languages className="h-4 w-4" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languageOptions.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn(
                      'flex items-center justify-between',
                      language === lang.code && 'bg-accent'
                    )}
                    data-testid={`language-${lang.code}`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    {language === lang.code && (
                      <div className="h-2 w-2 bg-blue-600 rounded-full" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              data-testid="button-theme-toggle"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            {/* Help Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-help">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Help & Support</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem data-testid="help-documentation">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Documentation</span>
                    <DropdownMenuShortcut>
                      <ExternalLink className="h-3 w-3" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="help-shortcuts">
                    <Keyboard className="mr-2 h-4 w-4" />
                    <span>Keyboard Shortcuts</span>
                    <DropdownMenuShortcut>?</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="help-support">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Contact Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                    Version 2.1.4
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full"
                  data-testid="button-user-profile"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                    <AvatarFallback>
                      {mockUser.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{mockUser.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {mockUser.email}
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <Badge variant="secondary" className="text-xs">
                        {mockUser.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {mockUser.department}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem data-testid="profile-account">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="profile-preferences">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" data-testid="profile-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
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
              data-testid="input-global-search"
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
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleSearchSelect(result.path)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    data-testid={`search-result-${result.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <result.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.breadcrumbs}
                        </p>
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