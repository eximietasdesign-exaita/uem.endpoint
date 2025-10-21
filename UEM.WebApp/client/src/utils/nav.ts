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
  Cloud,
  ListChecks,
  CalendarClock,
  Activity,
  Settings2,
  Target,
  FileSearch,
  Package,
  GitBranch,
  AlertTriangle,
  ScrollText,
  Lock,
  Boxes,
  MoreHorizontal,
  Server,
  Calendar,
  FileCode,
  Store,
  Key,
  PlusCircle,
  Languages,
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
    id: "dashboard",
    path: "/",
    nameKey: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    searchable: true,
    tags: ["overview", "home", "main"],
    category: "main",
    order: 1,
  },
  {
    id: "discovery-group",
    path: null,
    nameKey: "discovery",
    name: "Discovery",
    icon: Search,
    searchable: false,
    tags: ["discovery", "overview"],
    category: "discovery",
    order: 2,
    children: [
      {
        id: "discovery-dashboard",
        path: "/discovery",
        nameKey: "discovery_dashboard",
        name: "Discovery Dashboard",
        icon: LayoutDashboard,
        searchable: true,
        tags: ["dashboard", "overview", "status"],
        category: "discovery",
        order: 1,
        parentId: "discovery-group",
      },
      {
        id: "discovery-profiles",
        path: "/credential-vault",
        nameKey: "discovery_profiles",
        name: "Discovery Profiles",
        icon: Shield,
        searchable: true,
        tags: ["profiles", "credentials", "vault"],
        category: "discovery",
        order: 2,
        parentId: "discovery-group",
      },
      {
        id: "discovery-jobs",
        path: "/agentless-jobs",
        nameKey: "agent_discovery_job",
        name: "Agent Discovery Job",
        icon: ListChecks,
        searchable: true,
        tags: ["jobs", "tasks", "queue"],
        category: "discovery",
        order: 3,
        parentId: "discovery-group",
      },
      {
        id: "agentless-job-details",
        path: null,
        nameKey: "job_details",
        name: "Job Details",
        icon: FileSearch,
        searchable: false,
        tags: ["details", "view"],
        category: "discovery",
        order: 4,
        parentId: "discovery-jobs",
        pattern: "/agentless-discovery/view/:id",
      },
      {
        id: "scheduler",
        path: "/agentless-discovery",
        nameKey: "agentless_discovery",
        name: "Agentless Discovery",
        icon: CalendarClock,
        searchable: true,
        tags: ["scheduler", "jobs", "time-discovery", "agentless"],
        category: "discovery",
        order: 5,
        parentId: "discovery-group",
      },
      {
        id: "scan-engine-management",
        path: "/discovery-probes",
        nameKey: "satellite_server",
        name: "Satellite Server",
        icon: Settings2,
        searchable: true,
        tags: ["scan", "engine", "probes", "collectors"],
        category: "discovery",
        order: 6,
        parentId: "discovery-group",
      },
      {
        id: "discovery-mode-config",
        path: "/agent-discovery",
        nameKey: "agent_discovery",
        name: "Agent Discovery",
        icon: Target,
        searchable: true,
        tags: ["configuration", "mode", "agentless", "agent", "cloud"],
        category: "discovery",
        order: 7,
        parentId: "discovery-group",
      },
      {
        id: "discovery-status-audit",
        path: "/agent-status-reports",
        nameKey: "agent_status_report",
        name: "Agent Status Report",
        icon: Activity,
        searchable: true,
        tags: ["status", "audit", "reports", "health"],
        category: "discovery",
        order: 8,
        parentId: "discovery-group",
      },
      {
        id: "cloud-discovery",
        path: "/cloud-discovery",
        nameKey: "cloud_discovery",
        name: "Cloud Discovery",
        icon: Cloud,
        searchable: true,
        tags: ["cloud", "aws", "azure", "gcp", "multi-cloud"],
        category: "discovery",
        order: 9,
        parentId: "discovery-group",
        badge: "New",
      },
    ],
  },
  {
    id: "inventory-group",
    path: null,
    nameKey: "inventory",
    name: "Inventory & Asset Management",
    icon: Database,
    searchable: false,
    tags: [],
    category: "inventory",
    order: 3,
    children: [
      {
        id: "central-asset-repository",
        path: "/central-asset-repository",
        nameKey: "central_asset_repository",
        name: "Central Asset Repository",
        icon: Database,
        searchable: true,
        tags: ["repository", "global", "inventory", "catalog"],
        category: "inventory",
        order: 1,
        parentId: "inventory-group",
      },
      {
        id: "unmanaged-asset-queue",
        path: "/unmanaged-asset-queue",
        nameKey: "unmanaged_asset_queue",
        name: "Unmanaged Asset Queue",
        icon: Package,
        searchable: true,
        tags: ["unmanaged", "queue", "detected", "unclassified"],
        category: "inventory",
        order: 2,
        parentId: "inventory-group",
      },
      {
        id: "data-normalization",
        path: "/data-normalization",
        nameKey: "data_normalization",
        name: "Data Normalization & Enrichment",
        icon: GitBranch,
        searchable: true,
        tags: ["normalization", "enrichment", "vendor", "sensing"],
        category: "inventory",
        order: 3,
        parentId: "inventory-group",
      },
      {
        id: "software-license-inventory",
        path: "/software-license-inventory",
        nameKey: "software_license_inventory",
        name: "Software & License Inventory",
        icon: Boxes,
        searchable: true,
        tags: ["software", "license", "compliance", "sam"],
        category: "inventory",
        order: 4,
        parentId: "inventory-group",
      },
    ],
  },
  {
    id: "automation-group",
    path: null,
    nameKey: "automation",
    name: "Automation & Scripts",
    icon: Code,
    searchable: false,
    tags: [],
    category: "automation",
    order: 4,
    children: [
      {
        id: "orchestration-repository",
        path: "/script-policies",
        nameKey: "orchestration_repository",
        name: "Orchestration Repository",
        icon: FileText,
        searchable: true,
        tags: ["orchestration", "policies", "execution", "workflow"],
        category: "automation",
        order: 1,
        parentId: "automation-group",
      },
      {
        id: "script-repository",
        path: "/scripts",
        nameKey: "script_repository",
        name: "Script Repository",
        icon: Code,
        searchable: true,
        tags: ["scripts", "templates", "code", "discovery"],
        category: "automation",
        order: 2,
        parentId: "automation-group",
      },
      {
        id: "enterprise-integrations",
        path: "/external-integrations",
        nameKey: "integrations",
        name: "Integrations",
        icon: ArrowRightLeft,
        searchable: true,
        tags: ["integrations", "external", "api", "connectors"],
        category: "automation",
        order: 3,
        parentId: "automation-group",
      },
    ],
  },
  {
    id: "security-group",
    path: null,
    nameKey: "security",
    name: "Security & Compliance",
    icon: Shield,
    searchable: false,
    tags: [],
    category: "security",
    order: 5,
    children: [
      {
        id: "asset-change-log",
        path: "/asset-change-log",
        nameKey: "asset_change_log",
        name: "Asset Change & Integrity Log",
        icon: Activity,
        searchable: true,
        tags: ["change", "integrity", "audit", "immutable"],
        category: "security",
        order: 1,
        parentId: "security-group",
      },
      {
        id: "system-security-audit",
        path: "/system-security-audit",
        nameKey: "system_security_audit",
        name: "System Security Audit Log",
        icon: ScrollText,
        searchable: true,
        tags: ["security", "audit", "logs", "compliance"],
        category: "security",
        order: 2,
        parentId: "security-group",
      },
      {
        id: "exclusion-rules",
        path: "/exclusion-access-rules",
        nameKey: "exclusion_rules",
        name: "Exclusion & Controlled Access Rules",
        icon: Lock,
        searchable: true,
        tags: ["exclusion", "access", "rules", "scalability"],
        category: "security",
        order: 3,
        parentId: "security-group",
      },
      {
        id: "enterprise-credential-vault",
        path: "/credential-profiles",
        nameKey: "enterprise_credential_vault",
        name: "Enterprise Credential Vault",
        icon: Shield,
        searchable: true,
        tags: ["credentials", "enterprise", "vault", "security"],
        category: "security",
        order: 4,
        parentId: "security-group",
      },
    ],
  },
  {
    id: "agent-lifecycle",
    path: "/remote-agent-deployment",
    nameKey: "agent_lifecycle",
    name: "Agent Lifecycle Management",
    icon: Zap,
    searchable: true,
    tags: ["deployment", "agents", "remote", "package", "lifecycle"],
    category: "deployment",
    order: 6,
  },
  {
    id: "management-group",
    path: null,
    nameKey: "management",
    name: "Platform Administration",
    icon: Globe,
    searchable: false,
    tags: [],
    category: "management",
    order: 7,
    children: [
      {
        id: "domain-management",
        path: "/domain-management",
        nameKey: "domain_management",
        name: "Domain Management",
        icon: Globe,
        searchable: true,
        tags: ["domains", "hierarchy", "organization"],
        category: "management",
        order: 1,
        parentId: "management-group",
      },
      {
        id: "tenant-management",
        path: "/tenant-management",
        nameKey: "tenant_management",
        name: "Tenant Management",
        icon: Building2,
        searchable: true,
        tags: ["tenants", "multi-tenant", "isolation"],
        category: "management",
        order: 2,
        parentId: "management-group",
      },
      {
        id: "user-access-control",
        path: "/user-management",
        nameKey: "user_access_control",
        name: "User & Access Control",
        icon: UserCheck,
        searchable: true,
        tags: ["users", "permissions", "roles", "rbac"],
        category: "management",
        order: 3,
        parentId: "management-group",
      },
    ],
  },
  {
    id: "others-group",
    path: null,
    nameKey: "others",
    name: "Others",
    icon: MoreHorizontal,
    searchable: false,
    tags: ["miscellaneous", "other"],
    category: "others",
    order: 8,
    children: [
      /*{
        id: "assets-page",
        path: "/assets",
        nameKey: "assets_page",
        name: "Assets Page",
        icon: Server,
        searchable: true,
        tags: ["assets", "endpoints"],
        category: "others",
        order: 1,
        parentId: "others-group",
      },
      {
        id: 'assets-agent-based',
        path: '/assets/agent-based',
        nameKey: 'assets_agent_based',
        name: 'Assets (Agent-Based)',
        icon: Server,
        searchable: true,
        tags: ['assets', 'agent-based'],
        category: 'others',
        order: 2,
        parentId: 'others-group'
      },
      {
        id: 'assets-agentless',
        path: '/assets/agentless',
        nameKey: 'assets_agentless',
        name: 'Assets (Agentless)',
        icon: Server,
        searchable: true,
        tags: ['assets', 'agentless'],
        category: 'others',
        order: 3,
        parentId: 'others-group'
      },
      {
        id: "discovery-scheduled",
        path: "/discovery/scheduled",
        nameKey: "discovery_scheduled",
        name: "Discovery (Scheduled)",
        icon: Calendar,
        searchable: true,
        tags: ["discovery", "scheduled"],
        category: "others",
        order: 4,
        parentId: "others-group",
      },*/
      /*{
        id: "discovery-scripts-alt",
        path: "/discovery/scripts",
        nameKey: "discovery_scripts_alt",
        name: "Discovery Scripts (Alt)",
        icon: FileCode,
        searchable: true,
        tags: ["scripts", "discovery"],
        category: "others",
        order: 5,
        parentId: "others-group",
      },
      {
        id: "discovery-scripts-main",
        path: "/discovery-scripts",
        nameKey: "discovery_scripts_main",
        name: "Discovery Scripts (Main)",
        icon: FileCode,
        searchable: true,
        tags: ["scripts", "discovery"],
        category: "others",
        order: 6,
        parentId: "others-group",
      },
      {
        id: "policies-alt",
        path: "/policies",
        nameKey: "policies_alt",
        name: "Policies (Alt)",
        icon: Shield,
        searchable: true,
        tags: ["policies", "scripts"],
        category: "others",
        order: 7,
        parentId: "others-group",
      },*/
      {
        id: "scripts-marketplace",
        path: "/discovery-scripts-marketplace",
        nameKey: "scripts_marketplace",
        name: "Scripts Marketplace",
        icon: Store,
        searchable: true,
        tags: ["marketplace", "scripts"],
        category: "others",
        order: 8,
        parentId: "others-group",
      },
      /*{
        id: "satellite-job-queue",
        path: "/satellite-job-queue",
        nameKey: "satellite_job_queue",
        name: "Satellite Job Queue",
        icon: ListChecks,
        searchable: true,
        tags: ["jobs", "queue", "satellite"],
        category: "others",
        order: 9,
        parentId: "others-group",
      },*/
      {
        id: "enterprise-cred-profiles",
        path: "/enterprise-credential-profiles",
        nameKey: "enterprise_cred_profiles",
        name: "Enterprise Credential Profiles",
        icon: Key,
        searchable: true,
        tags: ["credentials", "enterprise"],
        category: "others",
        order: 10,
        parentId: "others-group",
      },
      {
        id: "asset-inventory-page",
        path: "/asset-inventory",
        nameKey: "asset_inventory_page",
        name: "Asset Inventory Page",
        icon: Package,
        searchable: true,
        tags: ["assets", "inventory"],
        category: "others",
        order: 11,
        parentId: "others-group",
      },
      {
        id: "agentless-job-wizard",
        path: "/agentless-discovery/create",
        nameKey: "agentless_job_wizard",
        name: "Create Agentless Job",
        icon: PlusCircle,
        searchable: true,
        tags: ["create", "job", "wizard"],
        category: "others",
        order: 12,
        parentId: "others-group",
      },
      {
        id: "alerts-page",
        path: "/alerts",
        nameKey: "alerts_page",
        name: "Alerts & Notifications",
        icon: Bell,
        searchable: true,
        tags: ["alerts", "notifications"],
        category: "others",
        order: 13,
        parentId: "others-group",
      },
      /*{
        id: "reports-page",
        path: "/reports",
        nameKey: "reports_page",
        name: "Reports",
        icon: FileText,
        searchable: true,
        tags: ["reports", "analytics"],
        category: "others",
        order: 14,
        parentId: "others-group",
      },
      {
        id: "i18n-demo",
        path: "/i18n-demo",
        nameKey: "i18n_demo",
        name: "i18n Demo",
        icon: Languages,
        searchable: true,
        tags: ["demo", "i18n", "testing"],
        category: "others",
        order: 15,
        parentId: "others-group",
      },*/
      {
        id: "simple-i18n-demo",
        path: "/simple-i18n-demo",
        nameKey: "simple_i18n_demo",
        name: "Simple i18n Demo",
        icon: Languages,
        searchable: true,
        tags: ["demo", "i18n", "testing"],
        category: "others",
        order: 16,
        parentId: "others-group",
      },
    ],
  },
  {
    id: "settings",
    path: "/settings",
    nameKey: "settings",
    name: "System Configuration",
    icon: Settings,
    searchable: true,
    tags: ["settings", "preferences", "config", "system"],
    category: "system",
    order: 9,
  },
];

// Precomputed search index for better performance
let _searchIndex:
  | (NavigationItem & { searchableText: string; breadcrumbs: string })[]
  | null = null;

// Build and memoize search index
export function buildSearchIndex(): (NavigationItem & {
  searchableText: string;
  breadcrumbs: string;
})[] {
  if (_searchIndex) return _searchIndex;

  const flattened: (NavigationItem & {
    searchableText: string;
    breadcrumbs: string;
  })[] = [];
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
  function addItems(items: NavigationItem[], parentBreadcrumb = "") {
    for (const item of items) {
      if (item.searchable && item.path) {
        const breadcrumbs = parentBreadcrumb
          ? `${parentBreadcrumb} > ${item.name}`
          : item.name;
        const searchableText = [
          item.name,
          item.nameKey,
          ...item.tags,
          item.category,
          item.description || "",
        ]
          .join(" ")
          .toLowerCase();

        flattened.push({
          ...item,
          searchableText,
          breadcrumbs,
        });
      }

      if (item.children) {
        const currentBreadcrumb = item.path
          ? item.name
          : parentBreadcrumb
            ? `${parentBreadcrumb} > ${item.name}`
            : item.name;
        addItems(item.children, currentBreadcrumb);
      }
    }
  }

  addItems(navigationRegistry);

  // Dedupe by path
  const deduped = new Map();
  flattened.forEach((item) => {
    if (!deduped.has(item.path)) {
      deduped.set(item.path, item);
    }
  });

  _searchIndex = Array.from(deduped.values());
  return _searchIndex;
}

// Route aliases for dynamic segments
const routeAliases: Record<string, string> = {
  view: "Job Details",
  edit: "Edit",
  create: "Create New",
  id: "Details",
};

// Precomputed maps for faster lookups
let _pathMap: Map<string, NavigationItem> | null = null;
let _parentMap: Map<string, NavigationItem> | null = null;
let _itemsById: Map<string, NavigationItem> | null = null;
let _patternRoutes: { pattern: RegExp; item: NavigationItem }[] | null = null;

function buildMaps() {
  if (_pathMap && _parentMap && _itemsById && _patternRoutes) {
    return {
      pathMap: _pathMap,
      parentMap: _parentMap,
      itemsById: _itemsById,
      patternRoutes: _patternRoutes,
    };
  }

  _pathMap = new Map();
  _parentMap = new Map();
  _itemsById = new Map();
  _patternRoutes = [];

  function processItems(items: NavigationItem[], parent?: NavigationItem) {
    for (const item of items) {
      _itemsById!.set(item.id, item);

      if (item.path) {
        _pathMap!.set(item.path, item);
      }

      if (parent) {
        _parentMap!.set(item.id, parent);
      }

      if (item.pattern) {
        try {
          const pattern = new RegExp(
            "^" + item.pattern.replace(/:([^/]+)/g, "([^/]+)") + "$",
          );
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
  return {
    pathMap: _pathMap,
    parentMap: _parentMap,
    itemsById: _itemsById,
    patternRoutes: _patternRoutes,
  };
}

// Build breadcrumbs with proper hierarchy and pattern support
export function buildBreadcrumbs(
  pathname: string,
): { name: string; path: string; nameKey?: string }[] {
  const { pathMap, parentMap, patternRoutes } = buildMaps();
  const breadcrumbs: { name: string; path: string; nameKey?: string }[] = [
    { name: "Home", path: "/", nameKey: "home" },
  ];

  if (pathname === "/") return [breadcrumbs[0]];

  let matchedItem: NavigationItem | null = null;

  matchedItem = pathMap.get(pathname) || null;

  if (!matchedItem && patternRoutes) {
    for (const { pattern, item } of patternRoutes) {
      if (pattern.test(pathname)) {
        matchedItem = item;
        break;
      }
    }
  }

  if (!matchedItem) {
    let longestMatch = "";
    pathMap.forEach((item, path) => {
      if (pathname.startsWith(path) && path.length > longestMatch.length) {
        longestMatch = path;
        matchedItem = item;
      }
    });
  }

  if (matchedItem) {
    const chain: NavigationItem[] = [];
    let current: NavigationItem | undefined = matchedItem;

    while (current) {
      chain.unshift(current);
      const parent = parentMap.get(current.id);
      current = parent || undefined;
    }

    for (const item of chain) {
      if (item.path && item.path !== "/") {
        breadcrumbs.push({
          name: item.name,
          path: item.path,
          nameKey: item.nameKey,
        });
      } else if (!item.path && item.id !== "root") {
        breadcrumbs.push({
          name: item.name,
          path: "#",
          nameKey: item.nameKey,
        });
      }
    }

    if (
      matchedItem.path &&
      pathname !== matchedItem.path &&
      pathname.startsWith(matchedItem.path)
    ) {
      const segments = pathname.split("/").filter(Boolean);
      const matchedSegments = matchedItem.path.split("/").filter(Boolean);

      for (let i = matchedSegments.length; i < segments.length; i++) {
        const segment = segments[i];
        const displayName =
          routeAliases[segment] ||
          segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/[-_]/g, " ");

        breadcrumbs.push({
          name: displayName,
          path: `/${segments.slice(0, i + 1).join("/")}`,
        });
      }
    }
  } else {
    const segments = pathname.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
      currentPath += `/${segment}`;
      const displayName =
        routeAliases[segment] ||
        segment.charAt(0).toUpperCase() +
          segment.slice(1).replace(/[-_]/g, " ");

      breadcrumbs.push({
        name: displayName,
        path: currentPath,
      });
    }
  }

  return breadcrumbs;
}

// Enhanced search with scoring and context
export function searchNavigation(query: string): (NavigationItem & {
  searchableText: string;
  breadcrumbs: string;
  score: number;
})[] {
  if (!query.trim()) return [];

  const searchIndex = buildSearchIndex();
  const lowercaseQuery = query.toLowerCase();
  const queryWords = lowercaseQuery
    .split(" ")
    .filter((word) => word.length > 0);

  const results = searchIndex
    .map((item) => {
      let score = 0;
      const searchText = item.searchableText;

      if (item.name.toLowerCase() === lowercaseQuery) {
        score += 100;
      } else if (item.name.toLowerCase().startsWith(lowercaseQuery)) {
        score += 80;
      } else if (item.name.toLowerCase().includes(lowercaseQuery)) {
        score += 60;
      }

      for (const tag of item.tags) {
        if (tag.toLowerCase() === lowercaseQuery) {
          score += 40;
        } else if (tag.toLowerCase().includes(lowercaseQuery)) {
          score += 20;
        }
      }

      if (item.category.toLowerCase().includes(lowercaseQuery)) {
        score += 30;
      }

      for (const word of queryWords) {
        if (searchText.includes(word)) {
          score += 10;
        }
      }

      return { ...item, score };
    })
    .filter((item) => item.score > 0)
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
