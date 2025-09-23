// Common Types for the Enterprise Endpoint Management Application

// Base Entity
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: Language;
  theme: Theme;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  timeZone: string;
  dateFormat: string;
  itemsPerPage: number;
}

export type UserRole = 'administrator' | 'operator' | 'viewer';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'zh' | 'ja' | 'ko' | 'ru';
export type Theme = 'light' | 'dark' | 'system';

// Agent Types
export interface Agent extends BaseEntity {
  name: string;
  hostname: string;
  ipAddress: string;
  serialNumber: string;
  osName: string;
  osVersion: string;
  assetType: AssetType;
  location: string;
  probeSource: string;
  lastCommunicated: Date;
  agentVersion: string;
  status: AgentStatus;
  completionRate: number;
  policies: AppliedPolicy[];
  discoveredAssets: DiscoveredAssets;
  systemInfo: SystemInfo;
  issues: AgentIssue[];
}

export interface AppliedPolicy {
  id: string;
  name: string;
  status: PolicyStatus;
  lastRun: Date;
  success: boolean;
  discoveredCount: number;
  executionTime?: number;
  errorMessage?: string;
}

export interface DiscoveredAssets {
  networkDevices: number;
  securityFindings: number;
  softwareAssets: number;
  vulnerabilities: number;
  ports: number;
  services: number;
  certificates: number;
  users: number;
}

export interface SystemInfo {
  cpu: string;
  memory: string;
  storage: string;
  uptime: string;
  domain: string;
  architecture: string;
  kernelVersion?: string;
  installDate?: Date;
}

export interface AgentIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolutionNote?: string;
}

export type AgentStatus = 'Online' | 'Offline' | 'Warning' | 'Critical' | 'Maintenance';
export type AssetType = 'Domain Controller' | 'Web Server' | 'Database Server' | 'File Server' | 'Application Server' | 'Load Balancer' | 'Firewall' | 'Switch' | 'Router' | 'Workstation' | 'Laptop' | 'Mobile Device' | 'IoT Device' | 'Storage Device' | 'Virtualization Host' | 'Container Host';
export type PolicyStatus = 'Applied' | 'Failed' | 'Partial' | 'Pending' | 'Scheduled';
export type IssueType = 'critical' | 'warning' | 'info';
export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

// Discovery Types
export interface DiscoveryJob extends BaseEntity {
  name: string;
  description: string;
  jobType: DiscoveryJobType;
  status: JobStatus;
  progress: number;
  startTime?: Date;
  endTime?: Date;
  scheduleConfig?: ScheduleConfig;
  targetConfig: TargetConfig;
  credentialProfileIds: string[];
  probeId: string;
  discoveredEndpoints: number;
  totalTargets: number;
  errorCount: number;
  results: DiscoveryResult[];
}

export interface DiscoveryResult {
  id: string;
  jobId: string;
  targetAddress: string;
  status: DiscoveryStatus;
  discoveredAt: Date;
  responseTime: number;
  endpointInfo?: EndpointInfo;
  errorMessage?: string;
}

export interface EndpointInfo {
  hostname: string;
  ipAddress: string;
  macAddress?: string;
  osName: string;
  osVersion: string;
  assetType: AssetType;
  openPorts: number[];
  services: ServiceInfo[];
  vulnerabilities: VulnerabilityInfo[];
  software: SoftwareInfo[];
}

export interface ServiceInfo {
  name: string;
  port: number;
  protocol: string;
  version?: string;
  banner?: string;
}

export interface VulnerabilityInfo {
  id: string;
  cve: string;
  severity: VulnerabilitySeverity;
  description: string;
  score: number;
  solution?: string;
}

export interface SoftwareInfo {
  name: string;
  version: string;
  vendor: string;
  installDate?: Date;
  location: string;
}

export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  interval: number;
  startDate: Date;
  endDate?: Date;
  timeZone: string;
  businessHours: boolean;
  excludeWeekends: boolean;
}

export interface TargetConfig {
  ipRanges: string[];
  hostnames: string[];
  ouPaths: string[];
  ipSegments: string[];
  excludeList: string[];
}

export type DiscoveryJobType = 'agentless' | 'agent-based' | 'hybrid';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'scheduled';
export type DiscoveryStatus = 'discovered' | 'failed' | 'timeout' | 'unreachable';
export type ScheduleFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type VulnerabilitySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

// Script Types
export interface Script extends BaseEntity {
  name: string;
  description: string;
  category: ScriptCategory;
  type: ScriptType;
  os: OperatingSystem;
  author: string;
  version: string;
  content: string;
  parameters: ScriptParameter[];
  tags: string[];
  isActive: boolean;
  isFavorite: boolean;
  executionCount: number;
  lastExecuted?: Date;
  averageExecutionTime?: number;
}

export interface ScriptParameter {
  name: string;
  type: ParameterType;
  required: boolean;
  defaultValue?: string;
  description: string;
  validation?: ParameterValidation;
}

export interface ParameterValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  allowedValues?: string[];
}

export type ScriptCategory = 'Applications & Databases' | 'Cloud & Virtualization' | 'Network & Connectivity' | 'Operating System' | 'Security' | 'System Monitoring' | 'Hardware Information' | 'Performance Analysis' | 'Backup & Recovery' | 'Compliance & Auditing';
export type ScriptType = 'powershell' | 'bash' | 'python' | 'wmi' | 'sql' | 'registry' | 'custom';
export type OperatingSystem = 'windows' | 'linux' | 'macos' | 'unix' | 'cross-platform';
export type ParameterType = 'string' | 'number' | 'boolean' | 'date' | 'file' | 'array' | 'object';

// Policy Types
export interface Policy extends BaseEntity {
  name: string;
  description: string;
  status: PolicyPublishStatus;
  scriptIds: string[];
  executionFlow: ExecutionStep[];
  tags: string[];
  isActive: boolean;
  createdBy: string;
  lastModifiedBy: string;
  executionCount: number;
  successRate: number;
}

export interface ExecutionStep {
  id: string;
  name: string;
  scriptId: string;
  order: number;
  condition: ExecutionCondition;
  parameters: Record<string, any>;
  timeout: number;
  retryCount: number;
  continueOnError: boolean;
}

export type PolicyPublishStatus = 'draft' | 'published' | 'maintenance' | 'inactive';
export type ExecutionCondition = 'always' | 'on_success' | 'on_failure' | 'conditional';

// Credential Types
export interface CredentialProfile extends BaseEntity {
  name: string;
  description: string;
  type: CredentialType;
  domain?: string;
  username: string;
  encryptedPassword: string;
  keyFile?: string;
  certificateThumbprint?: string;
  additionalSettings: Record<string, any>;
  isActive: boolean;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
}

export type CredentialType = 'windows' | 'linux' | 'ssh_key' | 'certificate' | 'token' | 'custom';

// Probe Types
export interface DiscoveryProbe extends BaseEntity {
  name: string;
  description: string;
  ipAddress: string;
  port: number;
  status: ProbeStatus;
  version: string;
  capabilities: ProbeCapability[];
  lastHeartbeat: Date;
  metrics: ProbeMetrics;
  configuration: ProbeConfiguration;
  location: string;
  tags: string[];
}

export interface ProbeMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeJobs: number;
  queuedJobs: number;
  completedJobs: number;
  failedJobs: number;
  uptime: number;
}

export interface ProbeConfiguration {
  maxConcurrentJobs: number;
  jobTimeout: number;
  heartbeatInterval: number;
  logLevel: LogLevel;
  enableSsl: boolean;
  compressionEnabled: boolean;
  bufferSize: number;
}

export type ProbeStatus = 'online' | 'offline' | 'warning' | 'maintenance';
export type ProbeCapability = 'network_scan' | 'port_scan' | 'service_detection' | 'vulnerability_scan' | 'agent_deployment' | 'custom_scripts';
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

// Dashboard Types
export interface DashboardStats {
  totalEndpoints: number;
  onlineEndpoints: number;
  offlineEndpoints: number;
  warningEndpoints: number;
  criticalEndpoints: number;
  securityAlerts: number;
  complianceScore: number;
  totalDiscoveryJobs: number;
  activeDiscoveryJobs: number;
  completedDiscoveryJobs: number;
  failedDiscoveryJobs: number;
  totalAgents: number;
  onlineAgents: number;
  totalPolicies: number;
  activePolicies: number;
  totalScripts: number;
  recentActivities: Activity[];
}

export interface Activity extends BaseEntity {
  type: ActivityType;
  title: string;
  description: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
  severity: ActivitySeverity;
  read: boolean;
}

export type ActivityType = 'discovery' | 'agent' | 'policy' | 'script' | 'security' | 'system' | 'user';
export type ActivitySeverity = 'info' | 'warning' | 'error' | 'critical';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Filter and Sort Types
export interface FilterOptions {
  searchQuery?: string;
  status?: string;
  category?: string;
  type?: string;
  dateRange?: DateRange;
  tags?: string[];
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type SortOrder = 'asc' | 'desc';

// System Status Types
export interface SystemStatus {
  id: string;
  service: string;
  status: ServiceStatus;
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  version: string;
  dependencies: ServiceDependency[];
  metrics: ServiceMetrics;
}

export interface ServiceDependency {
  name: string;
  status: ServiceStatus;
  required: boolean;
}

export interface ServiceMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

export type ServiceStatus = 'running' | 'stopped' | 'warning' | 'error' | 'maintenance';

// Configuration Types
export interface AppConfiguration {
  name: string;
  version: string;
  environment: Environment;
  features: FeatureFlags;
  security: SecuritySettings;
  monitoring: MonitoringSettings;
  integrations: IntegrationSettings;
}

export interface FeatureFlags {
  multiTenant: boolean;
  advancedAnalytics: boolean;
  aiInsights: boolean;
  customReports: boolean;
  apiAccess: boolean;
  ssoIntegration: boolean;
  auditLogging: boolean;
  dataEncryption: boolean;
}

export interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordPolicy: PasswordPolicy;
  encryptionEnabled: boolean;
  auditEnabled: boolean;
  ipWhitelist: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number;
  historySize: number;
}

export interface MonitoringSettings {
  metricsEnabled: boolean;
  loggingLevel: LogLevel;
  alertingEnabled: boolean;
  performanceTrackingEnabled: boolean;
  healthCheckInterval: number;
}

export interface IntegrationSettings {
  emailProvider: string;
  smsProvider: string;
  ldapEnabled: boolean;
  ssoProvider: string;
  webhookUrl: string;
  apiRateLimit: number;
}

export type Environment = 'development' | 'staging' | 'production' | 'test';

// Utility Types
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Event Types
export interface AppEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  source: string;
  user?: string;
}

// WebSocket Types
export interface WebSocketMessage<T = any> {
  id: string;
  type: MessageType;
  event: string;
  data: T;
  timestamp: Date;
}

export type MessageType = 'event' | 'request' | 'response' | 'error' | 'heartbeat';

// Export utility functions for type guards
export const isAgent = (obj: any): obj is Agent => {
  return obj && typeof obj.name === 'string' && typeof obj.hostname === 'string';
};

export const isDiscoveryJob = (obj: any): obj is DiscoveryJob => {
  return obj && typeof obj.name === 'string' && typeof obj.jobType === 'string';
};

export const isScript = (obj: any): obj is Script => {
  return obj && typeof obj.name === 'string' && typeof obj.content === 'string';
};

export const isPolicy = (obj: any): obj is Policy => {
  return obj && typeof obj.name === 'string' && Array.isArray(obj.executionFlow);
};