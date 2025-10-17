import { 
  LayoutDashboard, 
  Monitor, 
  Search, 
  Users, 
  Bell, 
  BarChart3, 
  Settings,
  Code,
  FileText,
  Radar,
  ShoppingCart,
  ArrowRightLeft,
  Globe,
  Building2,
  Database,
  Zap,
  Shield,
  LucideIcon,
  HardDrive,
  UserCheck,
  Cloud
} from "lucide-react";

export interface NavigationItem {
  id: string;
  path: string | null; // null for category/grouping nodes
  nameKey: string;
  name: string; // fallback for display
  icon: LucideIcon;
  children?: NavigationItem[];
  searchable: boolean;
  tags: string[];
  category: string;
  description?: string;
  badge?: string;
  order: number;
  hidden?: boolean;
  parentId?: string;
  pattern?: string; // for dynamic routes like "/agentless-discovery/view/:id"
  requiredPermission?: string;
  featureFlag?: string;
}

// Route registry for navigation, breadcrumbs, and search
export const navigationRegistry: NavigationItem[] = [
  {
    id: 'dashboard',
    path: '/',
    nameKey: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    searchable: true,
    tags: ['overview', 'home', 'main'],
    category: 'main',
    order: 1
  },
  {
    id: 'discovery-group',
    path: '/discovery', // Discovery landing page
    nameKey: 'discovery',
    name: 'Discovery',
    icon: Search,
    searchable: true,
    tags: ['discovery', 'overview'],
    category: 'discovery',
    order: 2,
    children: [
      {
        id: 'agentless-discovery',
        path: '/agentless-discovery',
        nameKey: 'agentless_discovery',
        name: 'Agentless Discovery',
        icon: Search,
        searchable: true,
        tags: ['agentless', 'scan', 'network'],
        category: 'discovery',
        order: 1,
        parentId: 'discovery-group'
      },
      {
        id: 'discovery-scripts',
        path: '/discovery/scripts',
        nameKey: 'discovery_scripts',
        name: 'Discovery Scripts',
        icon: Code,
        searchable: true,
        tags: ['scripts', 'templates', 'discovery'],
        category: 'discovery',
        order: 2,
        parentId: 'discovery-group'
      },
      {
        id: 'agentless-jobs',
        path: '/agentless-jobs',
        nameKey: 'agentless_jobs',
        name: 'Discovery Jobs',
        icon: BarChart3,
        searchable: true,
        tags: ['jobs', 'tasks', 'queue'],
        category: 'discovery',
        order: 3,
        parentId: 'discovery-group'
      },
      {
        id: 'agentless-job-details',
        path: null,
        nameKey: 'job_details',
        name: 'Job Details',
        icon: BarChart3,
        searchable: false,
        tags: ['details', 'view'],
        category: 'discovery',
        order: 4,
        parentId: 'agentless-jobs',
        pattern: '/agentless-discovery/view/:id'
      },
      {
        id: 'agent-discovery',
        path: '/agent-discovery',
        nameKey: 'agent_discovery', 
        name: 'Agent Based Discovery',
        icon: Monitor,
        searchable: true,
        tags: ['agent', 'endpoint', 'managed'],
        category: 'discovery',
        order: 3,
        parentId: 'discovery-group'
      },
      {
        id: 'agent-status-reports',
        path: '/agent-status-reports',
        nameKey: 'agent_status_reports',
        name: 'Agent Status Reports',
        icon: BarChart3,
        searchable: true,
        tags: ['reports', 'status', 'agents'],
        category: 'discovery',
        order: 5,
        parentId: 'discovery-group'
      },
      {
        id: 'discovery-probes',
        path: '/discovery-probes',
        nameKey: 'discovery_probes',
        name: 'Discovery Probes',
        icon: Radar,
        searchable: true,
        tags: ['probes', 'collectors', 'network'],
        category: 'discovery',
        order: 6,
        parentId: 'discovery-group'
      },
      {
        id: 'satellite-job-queue',
        path: '/satellite-job-queue',
        nameKey: 'satellite_job_queue',
        name: 'Satellite Job Queue',
        icon: BarChart3,
        searchable: true,
        tags: ['satellite', 'jobs', 'queue', 'server'],
        category: 'discovery',
        order: 7,
        parentId: 'discovery-group'
      },
      {
        id: 'cloud-discovery',
        path: '/cloud-discovery',
        nameKey: 'cloud_discovery',
        name: 'Cloud Discovery',
        icon: Cloud,
        searchable: true,
        tags: ['cloud', 'aws', 'azure', 'gcp', 'multi-cloud'],
        category: 'discovery',
        order: 8,
        parentId: 'discovery-group'
      }
    ]
  },
  {
    id: 'assets-group',
    path: null, // Category grouping node
    nameKey: 'assets',
    name: 'Assets',
    icon: Database,
    searchable: false,
    tags: [],
    category: 'assets',
    order: 3,
    children: [
      {
        id: 'asset-inventory',
        path: '/asset-inventory',
        nameKey: 'asset_inventory',
        name: 'Asset Inventory',
        icon: HardDrive,
        searchable: true,
        tags: ['inventory', 'catalog', 'devices'],
        category: 'assets',
        order: 1,
        parentId: 'assets-group'
      },
      {
        id: 'assets-legacy',
        path: '/assets',
        nameKey: 'assets_legacy',
        name: 'Legacy Assets',
        icon: Database,
        searchable: true,
        tags: ['legacy', 'assets', 'endpoints'],
        category: 'assets',
        order: 2,
        parentId: 'assets-group'
      }
    ]
  },
  {
    id: 'automation-group',
    path: null, // Category grouping node
    nameKey: 'automation',
    name: 'Automation',
    icon: Code,
    searchable: false,
    tags: [],
    category: 'automation',
    order: 4,
    children: [
      {
        id: 'scripts',
        path: '/scripts',
        nameKey: 'scripts',
        name: 'Discovery Scripts',
        icon: Code,
        searchable: true,
        tags: ['scripts', 'templates', 'code'],
        category: 'automation',
        order: 1,
        parentId: 'automation-group'
      },
      {
        id: 'script-policies',
        path: '/script-policies',
        nameKey: 'script_policies',
        name: 'Script Orchestrator',
        icon: FileText,
        searchable: true,
        tags: ['policies', 'orchestrator', 'execution'],
        category: 'automation',
        order: 2,
        parentId: 'automation-group'
      },
      {
        id: 'policies-alias',
        path: '/policies',
        nameKey: 'policies_alias',
        name: 'Script Orchestrator (Legacy)',
        icon: FileText,
        searchable: true,
        tags: ['policies', 'legacy'],
        category: 'automation',
        order: 3,
        parentId: 'automation-group'
      },
      {
        id: 'scripts-marketplace',
        path: '/discovery-scripts-marketplace',
        nameKey: 'scripts_marketplace',
        name: 'Scripts Marketplace',
        icon: ShoppingCart,
        searchable: true,
        tags: ['marketplace', 'templates', 'community'],
        category: 'automation',
        order: 4,
        parentId: 'automation-group'
      }
    ]
  },
  {
    id: 'deployment',
    path: '/remote-agent-deployment',
    nameKey: 'deployment',
    name: 'Agent Deployment',
    icon: Zap,
    searchable: true,
    tags: ['deployment', 'agents', 'remote'],
    category: 'deployment',
    order: 5
  },
  {
    id: 'credential-profiles',
    path: '/credential-profiles',
    nameKey: 'credential_profiles',
    name: 'Credential Vault',
    icon: Shield,
    searchable: true,
    tags: ['credentials', 'vault', 'passwords', 'security'],
    category: 'security',
    order: 6
  },
  {
    id: 'enterprise-credential-profiles', 
    path: '/enterprise-credential-profiles',
    nameKey: 'enterprise_credential_profiles',
    name: 'Enterprise Credential Profiles',
    icon: Shield,
    searchable: true,
    tags: ['credentials', 'enterprise', 'profiles'],
    category: 'security', 
    order: 7
  },
  {
    id: 'integrations',
    path: '/external-integrations',
    nameKey: 'integrations',
    name: 'External Integrations',
    icon: ArrowRightLeft,
    searchable: true,
    tags: ['integrations', 'external', 'api'],
    category: 'integrations',
    order: 7
  },
  {
    id: 'management-group',
    path: null, // Category grouping node
    nameKey: 'management',
    name: 'Management',
    icon: Globe,
    searchable: false,
    tags: [],
    category: 'management',
    order: 8,
    children: [
      {
        id: 'domain-management',
        path: '/domain-management',
        nameKey: 'domain_management',
        name: 'Domain Management',
        icon: Globe,
        searchable: true,
        tags: ['domains', 'hierarchy', 'organization'],
        category: 'management',
        order: 1,
        parentId: 'management-group'
      },
      {
        id: 'tenant-management',
        path: '/tenant-management',
        nameKey: 'tenant_management',
        name: 'Tenant Management',
        icon: Building2,
        searchable: true,
        tags: ['tenants', 'multi-tenant', 'isolation'],
        category: 'management',
        order: 2,
        parentId: 'management-group'
      },
      {
        id: 'user-management',
        path: '/user-management',
        nameKey: 'user_management',
        name: 'User Management',
        icon: UserCheck,
        searchable: true,
        tags: ['users', 'permissions', 'roles'],
        category: 'management',
        order: 3,
        parentId: 'management-group'
      }
    ]
  },
  {
    id: 'settings',
    path: '/settings',
    nameKey: 'settings',
    name: 'Settings',
    icon: Settings,
    searchable: true,
    tags: ['settings', 'preferences', 'config', 'system'],
    category: 'system',
    order: 9
  }
];

// Precomputed search index for better performance
let _searchIndex: (NavigationItem & { searchableText: string; breadcrumbs: string })[] | null = null;

// Build and memoize search index
export function buildSearchIndex(): (NavigationItem & { searchableText: string; breadcrumbs: string })[] {
  if (_searchIndex) return _searchIndex;
  
  const flattened: (NavigationItem & { searchableText: string; breadcrumbs: string })[] = [];
  const pathMap = new Map<string, NavigationItem>();
  
  // First pass: build path map
  function mapPaths(items: NavigationItem[]) {
    for (const item of items) {
      if (item.path) {
        pathMap.set(item.path, item);
      }
      if (item.children) {
        mapPaths(item.children);
      }
    }
  }
  
  mapPaths(navigationRegistry);
  
  // Second pass: build searchable index with breadcrumbs
  function addItems(items: NavigationItem[], parentBreadcrumb = '') {
    for (const item of items) {
      if (item.searchable && item.path) {
        const breadcrumbs = parentBreadcrumb ? `${parentBreadcrumb} > ${item.name}` : item.name;
        const searchableText = [
          item.name,
          item.nameKey,
          ...item.tags,
          item.category,
          item.description || ''
        ].join(' ').toLowerCase();
        
        flattened.push({
          ...item,
          searchableText,
          breadcrumbs
        });
      }
      
      if (item.children) {
        const currentBreadcrumb = item.path ? item.name : (parentBreadcrumb ? `${parentBreadcrumb} > ${item.name}` : item.name);
        addItems(item.children, currentBreadcrumb);
      }
    }
  }
  
  addItems(navigationRegistry);
  
  // Dedupe by path
  const deduped = new Map();
  flattened.forEach(item => {
    if (!deduped.has(item.path)) {
      deduped.set(item.path, item);
    }
  });
  
  _searchIndex = Array.from(deduped.values());
  return _searchIndex;
}

// Route aliases for dynamic segments
const routeAliases: Record<string, string> = {
  'view': 'Job Details',
  'edit': 'Edit',
  'create': 'Create New',
  'id': 'Details'
};

// Precomputed maps for faster lookups
let _pathMap: Map<string, NavigationItem> | null = null;
let _parentMap: Map<string, NavigationItem> | null = null;
let _itemsById: Map<string, NavigationItem> | null = null;
let _patternRoutes: { pattern: RegExp; item: NavigationItem }[] | null = null;

function buildMaps() {
  if (_pathMap && _parentMap && _itemsById && _patternRoutes) {
    return { pathMap: _pathMap, parentMap: _parentMap, itemsById: _itemsById, patternRoutes: _patternRoutes };
  }
  
  _pathMap = new Map();
  _parentMap = new Map();
  _itemsById = new Map();
  _patternRoutes = [];
  
  function processItems(items: NavigationItem[], parent?: NavigationItem) {
    for (const item of items) {
      // Store item by ID
      _itemsById!.set(item.id, item);
      
      // Store exact path mapping
      if (item.path) {
        _pathMap!.set(item.path, item);
      }
      
      // Store parent relationship (corrected)
      if (parent) {
        _parentMap!.set(item.id, parent);
      }
      
      // Store pattern routes for dynamic matching
      if (item.pattern) {
        try {
          const pattern = new RegExp('^' + item.pattern.replace(/:([^/]+)/g, '([^/]+)') + '$');
          _patternRoutes!.push({ pattern, item });
        } catch (e) {
          console.warn(`Invalid pattern for ${item.id}: ${item.pattern}`);
        }
      }
      
      if (item.children) {
        processItems(item.children, item);
      }
    }
  }
  
  processItems(navigationRegistry);
  return { pathMap: _pathMap, parentMap: _parentMap, itemsById: _itemsById, patternRoutes: _patternRoutes };
}

// Build breadcrumbs with proper hierarchy and pattern support
export function buildBreadcrumbs(pathname: string): { name: string; path: string; nameKey?: string }[] {
  const { pathMap, parentMap, patternRoutes } = buildMaps();
  const breadcrumbs: { name: string; path: string; nameKey?: string }[] = [
    { name: 'Home', path: '/', nameKey: 'home' }
  ];

  if (pathname === '/') return [breadcrumbs[0]];

  let matchedItem: NavigationItem | null = null;
  
  // 1. Try exact path match
  matchedItem = pathMap.get(pathname) || null;
  
  // 2. Try pattern matching for dynamic routes
  if (!matchedItem && patternRoutes) {
    for (const { pattern, item } of patternRoutes) {
      if (pattern.test(pathname)) {
        matchedItem = item;
        break;
      }
    }
  }
  
  // 3. Try prefix matching (longest match first)
  if (!matchedItem) {
    let longestMatch = '';
    pathMap.forEach((item, path) => {
      if (pathname.startsWith(path) && path.length > longestMatch.length) {
        longestMatch = path;
        matchedItem = item;
      }
    });
  }
  
  if (matchedItem) {
    // Build parent chain - FIXED: use item.id to get parent
    const chain: NavigationItem[] = [];
    let current: NavigationItem | undefined = matchedItem;
    
    while (current) {
      chain.unshift(current);
      const parent = parentMap.get(current.id);
      current = parent || undefined;
    }
    
    // Add parent breadcrumbs (excluding root)
    for (const item of chain) {
      if (item.path && item.path !== '/') {
        breadcrumbs.push({
          name: item.name,
          path: item.path,
          nameKey: item.nameKey
        });
      } else if (!item.path && item.id !== 'root') {
        // Category node - add to breadcrumb trail but not clickable
        breadcrumbs.push({
          name: item.name,
          path: '#',
          nameKey: item.nameKey
        });
      }
    }
    
    // Handle dynamic segments beyond the matched item
    if (matchedItem.path && pathname !== matchedItem.path && pathname.startsWith(matchedItem.path)) {
      const segments = pathname.split('/').filter(Boolean);
      const matchedSegments = matchedItem.path.split('/').filter(Boolean);
      
      // Add remaining segments as breadcrumbs
      for (let i = matchedSegments.length; i < segments.length; i++) {
        const segment = segments[i];
        const displayName = routeAliases[segment] || 
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/[-_]/g, ' ');
        
        breadcrumbs.push({
          name: displayName,
          path: `/${segments.slice(0, i + 1).join('/')}`
        });
      }
    }
  } else {
    // Fallback: create breadcrumbs from URL segments
    const segments = pathname.split('/').filter(Boolean);
    let currentPath = '';
    
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const displayName = routeAliases[segment] || 
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/[-_]/g, ' ');
      
      breadcrumbs.push({
        name: displayName,
        path: currentPath
      });
    }
  }

  return breadcrumbs;
}

// Enhanced search with scoring and context
export function searchNavigation(query: string): (NavigationItem & { searchableText: string; breadcrumbs: string; score: number })[] {
  if (!query.trim()) return [];
  
  const searchIndex = buildSearchIndex();
  const lowercaseQuery = query.toLowerCase();
  const queryWords = lowercaseQuery.split(' ').filter(word => word.length > 0);
  
  const results = searchIndex
    .map(item => {
      let score = 0;
      const searchText = item.searchableText;
      
      // Exact name match gets highest score
      if (item.name.toLowerCase() === lowercaseQuery) {
        score += 100;
      } else if (item.name.toLowerCase().startsWith(lowercaseQuery)) {
        score += 80;
      } else if (item.name.toLowerCase().includes(lowercaseQuery)) {
        score += 60;
      }
      
      // Tag matches
      for (const tag of item.tags) {
        if (tag.toLowerCase() === lowercaseQuery) {
          score += 40;
        } else if (tag.toLowerCase().includes(lowercaseQuery)) {
          score += 20;
        }
      }
      
      // Category match
      if (item.category.toLowerCase().includes(lowercaseQuery)) {
        score += 30;
      }
      
      // Word-based matching
      for (const word of queryWords) {
        if (searchText.includes(word)) {
          score += 10;
        }
      }
      
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  return results;
}

// Get navigation item by path with memoization
export function getNavigationItem(path: string): NavigationItem | null {
  const { pathMap } = buildMaps();
  const item = pathMap.get(path);
  return item !== undefined ? item : null;
}

// Get all leaf navigation items (with paths)
export function getLeafNavigationItems(): NavigationItem[] {
  const leaves: NavigationItem[] = [];
  
  function addLeaves(items: NavigationItem[]) {
    for (const item of items) {
      if (item.path && item.searchable) {
        leaves.push(item);
      }
      if (item.children) {
        addLeaves(item.children);
      }
    }
  }
  
  addLeaves(navigationRegistry);
  return leaves.sort((a, b) => a.order - b.order);
}

// Clear memoization cache (useful for tests or dynamic updates)
export function clearNavigationCache() {
  _searchIndex = null;
  _pathMap = null;
  _parentMap = null;
  _itemsById = null;
  _patternRoutes = null;
}