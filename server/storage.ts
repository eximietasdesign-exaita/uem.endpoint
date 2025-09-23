import { eq, desc, and, gte, lte, asc, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  domains,
  tenants,
  endpoints,
  credentialProfiles,
  discoveryProbes,
  scripts,
  policies,
  discoveryJobs,
  agentDeployments,
  agents,
  activityLogs,
  systemStatus,
  dashboardStats,
  standardScriptTemplates,
  scriptOrchestratorProfiles,
  agentStatusReports,
  type User,
  type InsertUser,
  type Domain,
  type InsertDomain,
  type Tenant,
  type InsertTenant,
  type Endpoint,
  type InsertEndpoint,
  type CredentialProfile,
  type InsertCredentialProfile,
  type DiscoveryProbe,
  type InsertDiscoveryProbe,
  type Script,
  type InsertScript,
  type Policy,
  type InsertPolicy,
  type DiscoveryJob,
  type InsertDiscoveryJob,
  type AgentDeployment,
  type InsertAgentDeployment,
  type Agent,
  type InsertAgent,
  type ActivityLog,
  type InsertActivityLog,
  type SystemStatus,
  type InsertSystemStatus,
  type DashboardStats,
  type InsertDashboardStats,
  type StandardScriptTemplate,
  type InsertStandardScriptTemplate,
  type ScriptOrchestratorProfile,
  type InsertScriptOrchestratorProfile,
  type AgentStatusReport,
  type InsertAgentStatusReport,
  assetCustomFields,
  assetTableViews,
  assetInventory,
  assetAuditLogs,
  agentDeploymentJobs,
  agentDeploymentTasks,
  type AssetCustomField,
  type InsertAssetCustomField,
  type AssetTableView,
  type InsertAssetTableView,
  type AssetInventory,
  type InsertAssetInventory,
  type AssetAuditLog,
  type InsertAssetAuditLog,
  type AgentDeploymentJob,
  type InsertAgentDeploymentJob,
  type AgentDeploymentTask,
  type InsertAgentDeploymentTask,
  // Settings Management imports
  settingsCategories,
  globalSettings,
  domainSettings,
  tenantSettings,
  userPreferences,
  settingsValidationRules,
  settingsAuditLogs,
  settingsTemplates,
  type SettingsCategory,
  type InsertSettingsCategory,
  type GlobalSetting,
  type InsertGlobalSetting,
  type DomainSetting,
  type InsertDomainSetting,
  type TenantSetting,
  type InsertTenantSetting,
  type UserPreference,
  type InsertUserPreference,
  type SettingsValidationRule,
  type InsertSettingsValidationRule,
  type SettingsAuditLog,
  type InsertSettingsAuditLog,
  type SettingsTemplate,
  type InsertSettingsTemplate,
  // AI Services imports
  aiConversations,
  aiScriptGenerations,
  aiAnalysisReports,
  aiRecommendations,
  aiFeedback,
  aiUsageLogs,
  aiModelConfigurations,
  type AiConversation,
  type InsertAiConversation,
  type AiScriptGeneration,
  type InsertAiScriptGeneration,
  type AiAnalysisReport,
  type InsertAiAnalysisReport,
  type AiRecommendation,
  type InsertAiRecommendation,
  type AiFeedback,
  type InsertAiFeedback,
  type AiUsageLog,
  type InsertAiUsageLog,
  type AiModelConfiguration,
  type InsertAiModelConfiguration,
} from "@shared/schema";

export interface IStorage {
  // Domain methods
  getAllDomains(): Promise<Domain[]>;
  getDomainById(id: number): Promise<Domain | undefined>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: number, domain: Partial<InsertDomain>): Promise<Domain | undefined>;
  deleteDomain(id: number): Promise<boolean>;

  // Tenant methods
  getAllTenants(domainId?: number): Promise<Tenant[]>;
  getTenantById(id: number): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  deleteTenant(id: number): Promise<boolean>;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  updateUserPreferences(id: number, preferences: any): Promise<User | undefined>;
  getAllUsers(options?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    globalRole?: string;
    domainId?: number;
    tenantId?: number;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }>;
  getUsersByRole(role: string, domainId?: number, tenantId?: number): Promise<User[]>;
  getUsersByGlobalRole(globalRole: string): Promise<User[]>;
  getUsersByDomain(domainId: number): Promise<User[]>;
  getUsersByTenant(tenantId: number): Promise<User[]>;
  searchUsers(searchTerm: string, options?: { domainId?: number; tenantId?: number }): Promise<User[]>;
  bulkUpdateUsers(userIds: number[], updates: Partial<InsertUser>): Promise<User[]>;
  bulkCreateUsers(users: InsertUser[]): Promise<User[]>;
  deactivateUser(id: number): Promise<User | undefined>;
  activateUser(id: number): Promise<User | undefined>;
  resetUserPreferences(id: number): Promise<User | undefined>;
  
  // User Activity and Session methods
  getUserActivityLogs(userId: number, options?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ activities: ActivityLog[]; total: number; page: number; limit: number; totalPages: number }>;
  getUserActiveSessions(userId: number): Promise<any[]>;
  terminateUserSession(userId: number, sessionId: string): Promise<boolean>;
  terminateAllUserSessions(userId: number): Promise<number>;
  logUserActivity(activityData: any): Promise<ActivityLog>;
  getSystemActivityLogs(options?: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ activities: ActivityLog[]; total: number; page: number; limit: number; totalPages: number }>;
  
  // Endpoint/Asset methods
  getAllEndpoints(): Promise<Endpoint[]>;
  getEndpoint(id: number): Promise<Endpoint | undefined>;
  createEndpoint(endpoint: InsertEndpoint): Promise<Endpoint>;
  updateEndpoint(id: number, endpoint: Partial<InsertEndpoint>): Promise<Endpoint | undefined>;
  deleteEndpoint(id: number): Promise<boolean>;
  createDiscoveredEndpoints(endpoints: InsertEndpoint[]): Promise<Endpoint[]>;
  getEndpointsByDiscoveryJob(jobId: number): Promise<Endpoint[]>;
  
  // Credential Profile methods
  getAllCredentialProfiles(): Promise<CredentialProfile[]>;
  getCredentialProfile(id: number): Promise<CredentialProfile | undefined>;
  createCredentialProfile(profile: InsertCredentialProfile): Promise<CredentialProfile>;
  updateCredentialProfile(id: number, profile: Partial<InsertCredentialProfile>): Promise<CredentialProfile | undefined>;
  deleteCredentialProfile(id: number): Promise<boolean>;
  
  // Discovery Probe methods
  getAllDiscoveryProbes(): Promise<DiscoveryProbe[]>;
  getDiscoveryProbe(id: number): Promise<DiscoveryProbe | undefined>;
  createDiscoveryProbe(probe: InsertDiscoveryProbe): Promise<DiscoveryProbe>;
  updateDiscoveryProbe(id: number, probe: Partial<InsertDiscoveryProbe>): Promise<DiscoveryProbe | undefined>;
  deleteDiscoveryProbe(id: number): Promise<boolean>;
  
  // Script methods
  getAllScripts(): Promise<Script[]>;
  getScript(id: number): Promise<Script | undefined>;
  createScript(script: InsertScript): Promise<Script>;
  updateScript(id: number, script: Partial<InsertScript>): Promise<Script | undefined>;
  deleteScript(id: number): Promise<boolean>;
  
  // Policy methods
  getAllPolicies(): Promise<Policy[]>;
  getPolicy(id: number): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: number, policy: Partial<InsertPolicy>): Promise<Policy | undefined>;
  deletePolicy(id: number): Promise<boolean>;
  
  // Discovery Job methods (Enhanced Enterprise)
  getAllDiscoveryJobs(): Promise<DiscoveryJob[]>;
  getDiscoveryJob(id: number): Promise<DiscoveryJob | undefined>;
  createDiscoveryJob(job: InsertDiscoveryJob): Promise<DiscoveryJob>;
  updateDiscoveryJob(id: number, job: Partial<InsertDiscoveryJob>): Promise<DiscoveryJob | undefined>;
  deleteDiscoveryJob(id: number): Promise<boolean>;
  
  // Enhanced Discovery Jobs with enterprise features
  getAllDiscoveryJobsWithFilters(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    domainId?: number;
    tenantId?: number;
    createdBy?: number;
    probeId?: number;
    credentialProfileId?: number;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ jobs: DiscoveryJob[]; total: number; page: number; limit: number; totalPages: number }>;
  
  getDiscoveryJobsByStatus(status: string, domainId?: number, tenantId?: number): Promise<DiscoveryJob[]>;
  getDiscoveryJobsByType(type: string, domainId?: number, tenantId?: number): Promise<DiscoveryJob[]>;
  getDiscoveryJobsByProbe(probeId: number): Promise<DiscoveryJob[]>;
  getDiscoveryJobsByCredentialProfile(credentialProfileId: number): Promise<DiscoveryJob[]>;
  getDiscoveryJobsByDomain(domainId: number): Promise<DiscoveryJob[]>;
  getDiscoveryJobsByTenant(tenantId: number): Promise<DiscoveryJob[]>;
  getDiscoveryJobsByUser(userId: number): Promise<DiscoveryJob[]>;
  getDiscoveryJobHistory(jobId: number): Promise<DiscoveryJob[]>;
  
  // Discovery Job Execution Control
  startDiscoveryJob(jobId: number, userId: number): Promise<DiscoveryJob | undefined>;
  pauseDiscoveryJob(jobId: number, userId: number): Promise<DiscoveryJob | undefined>;
  cancelDiscoveryJob(jobId: number, userId: number, reason?: string): Promise<DiscoveryJob | undefined>;
  resumeDiscoveryJob(jobId: number, userId: number): Promise<DiscoveryJob | undefined>;
  updateDiscoveryJobProgress(jobId: number, progress: any): Promise<DiscoveryJob | undefined>;
  updateDiscoveryJobResults(jobId: number, results: any): Promise<DiscoveryJob | undefined>;
  
  // Discovery Job Scheduling
  getScheduledDiscoveryJobs(): Promise<DiscoveryJob[]>;
  getDiscoveryJobsReadyForExecution(): Promise<DiscoveryJob[]>;
  scheduleDiscoveryJob(jobId: number, schedule: any): Promise<DiscoveryJob | undefined>;
  unscheduleDiscoveryJob(jobId: number): Promise<DiscoveryJob | undefined>;
  triggerScheduledJob(jobId: number, userId: number): Promise<DiscoveryJob | undefined>;
  
  // Discovery Results Management
  getDiscoveryJobResults(jobId: number, options?: {
    page?: number;
    limit?: number;
    status?: string;
    assetType?: string;
  }): Promise<{ endpoints: Endpoint[]; total: number; page: number; limit: number; totalPages: number }>;
  
  bulkUpdateDiscoveryResults(jobId: number, endpointIds: number[], updates: Partial<InsertEndpoint>): Promise<Endpoint[]>;
  bulkApproveDiscoveryResults(jobId: number, endpointIds: number[], userId: number): Promise<boolean>;
  bulkIgnoreDiscoveryResults(jobId: number, endpointIds: number[], userId: number): Promise<boolean>;
  convertDiscoveryResultToAsset(endpointId: number, userId: number): Promise<Endpoint | undefined>;
  
  // Discovery Analytics
  getDiscoveryJobStatistics(domainId?: number, tenantId?: number): Promise<any>;
  getDiscoveryTrends(startDate: Date, endDate: Date, domainId?: number, tenantId?: number): Promise<any[]>;
  getDiscoveryCoverage(domainId?: number, tenantId?: number): Promise<any>;
  getDiscoveryPerformanceMetrics(domainId?: number, tenantId?: number): Promise<any>;
  
  // Discovery Job Templates and Cloning
  cloneDiscoveryJob(jobId: number, newName: string, userId: number): Promise<DiscoveryJob>;
  createDiscoveryJobFromTemplate(templateId: number, name: string, userId: number): Promise<DiscoveryJob>;
  
  // Discovery Job Validation
  validateDiscoveryTargets(targets: any, probeId?: number): Promise<{ valid: boolean; errors: string[] }>;
  validateDiscoveryCredentials(credentialProfileId: number, targets?: any): Promise<{ valid: boolean; errors: string[] }>;
  
  // Bulk Operations
  bulkUpdateDiscoveryJobs(jobIds: number[], updates: Partial<InsertDiscoveryJob>, userId: number): Promise<DiscoveryJob[]>;
  bulkDeleteDiscoveryJobs(jobIds: number[], userId: number): Promise<boolean>;
  bulkStartDiscoveryJobs(jobIds: number[], userId: number): Promise<DiscoveryJob[]>;
  bulkCancelDiscoveryJobs(jobIds: number[], userId: number, reason?: string): Promise<DiscoveryJob[]>;
  
  // Agent Deployment methods (Agent-Based)
  getAllAgentDeployments(): Promise<AgentDeployment[]>;
  getAgentDeployment(id: number): Promise<AgentDeployment | undefined>;
  createAgentDeployment(deployment: InsertAgentDeployment): Promise<AgentDeployment>;
  updateAgentDeployment(id: number, deployment: Partial<InsertAgentDeployment>): Promise<AgentDeployment | undefined>;
  deleteAgentDeployment(id: number): Promise<boolean>;
  
  // Agent methods
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;
  getAllAgentsWithFilters(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    operatingSystem?: string;
    domainId?: number;
    tenantId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ agents: Agent[]; total: number; page: number; limit: number; totalPages: number }>;
  getAgentsByStatus(status: string, domainId?: number, tenantId?: number): Promise<Agent[]>;
  getAgentsByDomain(domainId: number): Promise<Agent[]>;
  getAgentsByTenant(tenantId: number): Promise<Agent[]>;
  bulkUpdateAgents(agentIds: string[], updates: Partial<InsertAgent>): Promise<Agent[]>;
  getAgentStatistics(domainId?: number, tenantId?: number): Promise<any>;
  
  // Activity Log methods
  getRecentActivities(limit?: number): Promise<ActivityLog[]>;
  createActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivitiesByType(type: string): Promise<ActivityLog[]>;
  
  // System Status methods
  getSystemStatus(): Promise<SystemStatus[]>;
  updateSystemStatus(service: string, status: string, metrics?: any): Promise<SystemStatus | undefined>;
  
  // Dashboard Statistics methods
  getDashboardStats(): Promise<DashboardStats | undefined>;
  updateDashboardStats(stats: InsertDashboardStats): Promise<DashboardStats>;
  getDashboardStatsByDateRange(startDate: Date, endDate: Date): Promise<DashboardStats[]>;
  
  // Asset Inventory methods
  getAllAssetInventory(): Promise<AssetInventory[]>;
  getAssetInventoryById(id: number): Promise<AssetInventory | undefined>;
  createAssetInventory(asset: InsertAssetInventory): Promise<AssetInventory>;
  updateAssetInventory(id: number, asset: Partial<InsertAssetInventory>): Promise<AssetInventory | undefined>;
  deleteAssetInventory(id: number): Promise<boolean>;
  bulkUpdateAssetInventory(assetIds: number[], updates: Partial<InsertAssetInventory>): Promise<AssetInventory[]>;
  bulkDeleteAssetInventory(assetIds: number[]): Promise<boolean>;

  // Asset Custom Fields methods
  getAllAssetCustomFields(): Promise<AssetCustomField[]>;
  getAssetCustomFieldById(id: number): Promise<AssetCustomField | undefined>;
  createAssetCustomField(field: InsertAssetCustomField): Promise<AssetCustomField>;
  updateAssetCustomField(id: number, field: Partial<InsertAssetCustomField>): Promise<AssetCustomField | undefined>;
  deleteAssetCustomField(id: number): Promise<boolean>;

  // Asset Table Views methods
  getAllAssetTableViews(): Promise<AssetTableView[]>;
  getAssetTableViewById(id: number): Promise<AssetTableView | undefined>;
  createAssetTableView(view: InsertAssetTableView): Promise<AssetTableView>;
  updateAssetTableView(id: number, view: Partial<InsertAssetTableView>): Promise<AssetTableView | undefined>;
  deleteAssetTableView(id: number): Promise<boolean>;

  // Enhanced Asset Inventory methods with enterprise features
  getAssetInventoryWithFilters(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    category?: string;
    criticality?: string;
    domainId?: number;
    tenantId?: number;
    search?: string;
  }): Promise<{
    assets: AssetInventory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  getAssetInventoryByTenant(tenantId: number): Promise<AssetInventory[]>;
  getAssetInventoryByDomain(domainId: number): Promise<AssetInventory[]>;
  
  // Enhanced Custom Fields methods with tenant scoping
  getAssetCustomFieldsByTenant(tenantId?: number): Promise<AssetCustomField[]>;
  getAssetCustomFieldsByDomain(domainId?: number): Promise<AssetCustomField[]>;
  
  // Enhanced Table Views methods with user scoping
  getAssetTableViewsByUser(userId: number): Promise<AssetTableView[]>;
  getAssetTableViewsByTenant(tenantId?: number): Promise<AssetTableView[]>;
  
  // Asset Audit Logs methods
  getAssetAuditLogs(assetId: number): Promise<AssetAuditLog[]>;
  getAllAssetAuditLogs(options?: {
    page?: number;
    limit?: number;
    userId?: number;
    assetId?: number;
    action?: string;
  }): Promise<{
    logs: AssetAuditLog[];
    total: number;
    page: number;
    limit: number;
  }>;
  createAssetAuditLog(log: InsertAssetAuditLog): Promise<AssetAuditLog>;

  // External Integration methods
  getAllExternalSystems(): Promise<any[]>;
  createExternalSystem(system: any): Promise<any>;
  updateExternalSystem(id: string, system: any): Promise<any>;
  deleteExternalSystem(id: string): Promise<boolean>;
  testExternalSystemConnection(id: string): Promise<any>;
  getIntegrationLogs(limit?: number): Promise<any[]>;
  getIntegrationLogsByAsset(assetId: number): Promise<any[]>;
  getAllIntegrationRules(): Promise<any[]>;
  createIntegrationRule(rule: any): Promise<any>;
  updateIntegrationRule(id: number, rule: any): Promise<any>;
  deleteIntegrationRule(id: number): Promise<boolean>;

  // Agent Deployment Job methods (Enterprise Remote Deployment)
  getAgentDeploymentJobs(domainId?: number, tenantId?: number): Promise<AgentDeploymentJob[]>;
  getAgentDeploymentJobById(id: number): Promise<AgentDeploymentJob | undefined>;
  createAgentDeploymentJob(job: InsertAgentDeploymentJob): Promise<AgentDeploymentJob>;
  updateAgentDeploymentJob(id: number, job: Partial<InsertAgentDeploymentJob>): Promise<AgentDeploymentJob | undefined>;
  startAgentDeploymentJob(id: number): Promise<AgentDeploymentJob | undefined>;
  cancelAgentDeploymentJob(id: number): Promise<AgentDeploymentJob | undefined>;
  updateDeploymentProgress(id: number, progress: any): Promise<AgentDeploymentJob | undefined>;
  getDeploymentStatusSummary(jobId: number): Promise<any>;
  getDeploymentErrorLogs(jobId: number): Promise<any[]>;
  getAgentDeploymentStats(domainId?: number, tenantId?: number): Promise<any>;
  getAllAgentDeploymentJobsWithFilters(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    domainId?: number;
    tenantId?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ jobs: AgentDeploymentJob[]; total: number; page: number; limit: number; totalPages: number }>;
  pauseAgentDeploymentJob(id: number): Promise<AgentDeploymentJob | undefined>;
  resumeAgentDeploymentJob(id: number): Promise<AgentDeploymentJob | undefined>;
  getDeploymentJobLogs(jobId: number, options?: { page?: number; limit?: number; level?: string }): Promise<{ logs: any[]; total: number; page: number; limit: number }>;

  // Agent Deployment Task methods (Individual Deployment Tasks)
  getAgentDeploymentTasks(jobId: number): Promise<AgentDeploymentTask[]>;
  getAgentDeploymentTaskById(id: number): Promise<AgentDeploymentTask | undefined>;
  createAgentDeploymentTask(task: InsertAgentDeploymentTask): Promise<AgentDeploymentTask>;
  updateAgentDeploymentTask(id: number, task: Partial<InsertAgentDeploymentTask>): Promise<AgentDeploymentTask | undefined>;
  retryAgentDeploymentTask(id: number): Promise<AgentDeploymentTask | undefined>;
  repairAgentInstallation(id: number): Promise<AgentDeploymentTask | undefined>;
  getAllAgentDeploymentTasksWithFilters(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    jobId?: number;
    targetOs?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ tasks: AgentDeploymentTask[]; total: number; page: number; limit: number; totalPages: number }>;
  deleteAgentDeploymentTask(id: number): Promise<boolean>;
  bulkRetryFailedTasks(jobId: number): Promise<AgentDeploymentTask[]>;
  getTaskExecutionLogs(taskId: number): Promise<any[]>;

  // Activity Log methods extension
  createActivityLog(activity: InsertActivityLog): Promise<ActivityLog>;

  // Standard Script Template methods
  getAllStandardScriptTemplates(): Promise<StandardScriptTemplate[]>;
  getStandardScriptTemplateById(id: number): Promise<StandardScriptTemplate | undefined>;
  getStandardScriptTemplatesByCategory(category: string): Promise<StandardScriptTemplate[]>;
  getStandardScriptTemplatesByType(type: string): Promise<StandardScriptTemplate[]>;
  createStandardScriptTemplate(template: InsertStandardScriptTemplate): Promise<StandardScriptTemplate>;
  updateStandardScriptTemplate(id: number, template: Partial<InsertStandardScriptTemplate>): Promise<StandardScriptTemplate | undefined>;
  deleteStandardScriptTemplate(id: number): Promise<boolean>;

  // Script Orchestrator Profile methods
  getAllScriptOrchestratorProfiles(): Promise<ScriptOrchestratorProfile[]>;
  getScriptOrchestratorProfileById(id: number): Promise<ScriptOrchestratorProfile | undefined>;
  createScriptOrchestratorProfile(profile: InsertScriptOrchestratorProfile): Promise<ScriptOrchestratorProfile>;
  updateScriptOrchestratorProfile(id: number, profile: Partial<InsertScriptOrchestratorProfile>): Promise<ScriptOrchestratorProfile | undefined>;
  deleteScriptOrchestratorProfile(id: number): Promise<boolean>;

  // Agent Status Report methods
  getAllAgentStatusReports(): Promise<AgentStatusReport[]>;
  getAgentStatusReportById(id: number): Promise<AgentStatusReport | undefined>;
  getAgentStatusReportByAgentId(agentId: string): Promise<AgentStatusReport | undefined>;
  createAgentStatusReport(report: InsertAgentStatusReport): Promise<AgentStatusReport>;
  updateAgentStatusReport(id: number, report: Partial<InsertAgentStatusReport>): Promise<AgentStatusReport | undefined>;
  upsertAgentStatusReport(agentId: string, report: Partial<InsertAgentStatusReport>): Promise<AgentStatusReport>;
  deleteAgentStatusReport(id: number): Promise<boolean>;
  getAgentStatusByDomain(domainId: number): Promise<AgentStatusReport[]>;
  getAgentStatusByTenant(tenantId: number): Promise<AgentStatusReport[]>;

  // Agent Orchestration methods
  validateDeploymentTargets(targets: any): Promise<{ valid: any[]; invalid: any[]; warnings: any[] }>;
  getDeploymentStrategies(): Promise<any[]>;
  orchestrateDeployment(request: any): Promise<any>;
  getAgentDeploymentHealth(): Promise<any>;

  // ===== COMPREHENSIVE SETTINGS MANAGEMENT METHODS =====

  // Settings Categories methods
  getAllSettingsCategories(): Promise<SettingsCategory[]>;
  getSettingsCategoryById(id: number): Promise<SettingsCategory | undefined>;
  getSettingsCategoryByName(name: string): Promise<SettingsCategory | undefined>;
  createSettingsCategory(category: InsertSettingsCategory): Promise<SettingsCategory>;
  updateSettingsCategory(id: number, category: Partial<InsertSettingsCategory>): Promise<SettingsCategory | undefined>;
  deleteSettingsCategory(id: number): Promise<boolean>;

  // Global Settings methods
  getAllGlobalSettings(options?: {
    category?: string;
    accessLevel?: string;
    isInheritable?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ settings: GlobalSetting[]; total: number; page: number; limit: number; totalPages: number }>;
  getGlobalSettingById(id: number): Promise<GlobalSetting | undefined>;
  getGlobalSettingByKey(key: string): Promise<GlobalSetting | undefined>;
  getGlobalSettingsByCategory(category: string): Promise<GlobalSetting[]>;
  createGlobalSetting(setting: InsertGlobalSetting): Promise<GlobalSetting>;
  updateGlobalSetting(id: number, setting: Partial<InsertGlobalSetting>, userId?: number): Promise<GlobalSetting | undefined>;
  updateGlobalSettingByKey(key: string, value: any, userId?: number): Promise<GlobalSetting | undefined>;
  deleteGlobalSetting(id: number): Promise<boolean>;
  bulkUpdateGlobalSettings(updates: Array<{ key: string; value: any }>, userId?: number): Promise<GlobalSetting[]>;
  resetGlobalSettingsToDefaults(category?: string): Promise<GlobalSetting[]>;
  getGlobalSettingsSchema(): Promise<any>;

  // Domain Settings methods
  getDomainSettings(domainId: number, options?: {
    includeInherited?: boolean;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ settings: any[]; total: number; page: number; limit: number; totalPages: number }>;
  getDomainSettingByKey(domainId: number, key: string): Promise<DomainSetting | undefined>;
  createDomainSetting(setting: InsertDomainSetting): Promise<DomainSetting>;
  updateDomainSetting(domainId: number, key: string, value: any, overrideReason?: string, userId?: number): Promise<DomainSetting | undefined>;
  deleteDomainSetting(domainId: number, key: string): Promise<boolean>;
  inheritDomainSettingFromGlobal(domainId: number, key: string, userId?: number): Promise<DomainSetting | undefined>;
  overrideDomainSetting(domainId: number, key: string, value: any, reason?: string, userId?: number): Promise<DomainSetting | undefined>;
  getDomainSettingsInheritanceMap(domainId: number): Promise<any>;

  // Tenant Settings methods
  getTenantSettings(tenantId: number, options?: {
    includeInherited?: boolean;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ settings: any[]; total: number; page: number; limit: number; totalPages: number }>;
  getTenantEffectiveSettings(tenantId: number, category?: string): Promise<any>;
  getTenantSettingByKey(tenantId: number, key: string): Promise<TenantSetting | undefined>;
  createTenantSetting(setting: InsertTenantSetting): Promise<TenantSetting>;
  updateTenantSetting(tenantId: number, key: string, value: any, overrideReason?: string, userId?: number): Promise<TenantSetting | undefined>;
  deleteTenantSetting(tenantId: number, key: string): Promise<boolean>;
  resetTenantSettingsCategory(tenantId: number, category: string, userId?: number): Promise<TenantSetting[]>;
  getTenantSettingsInheritanceSource(tenantId: number): Promise<any>;

  // User Preferences methods
  getUserPreferences(userId: number, options?: {
    category?: string;
    includeDefaults?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ preferences: UserPreference[]; total: number; page: number; limit: number; totalPages: number }>;
  getUserPreferenceByKey(userId: number, key: string): Promise<UserPreference | undefined>;
  createUserPreference(preference: InsertUserPreference): Promise<UserPreference>;
  updateUserPreference(userId: number, key: string, value: any): Promise<UserPreference | undefined>;
  updateUserPreferences(userId: number, preferences: Array<{ key: string; value: any; category?: string }>): Promise<UserPreference[]>;
  deleteUserPreference(userId: number, key: string): Promise<boolean>;
  resetUserPreferences(userId: number, category?: string): Promise<UserPreference[]>;
  getUserPreferenceDefaults(userId: number): Promise<any>;
  getUserAvailablePreferences(): Promise<any>;

  // Settings Validation methods
  getSettingsValidationRules(settingKey?: string): Promise<SettingsValidationRule[]>;
  validateSettingValue(key: string, value: any, scope?: string, scopeId?: number): Promise<{ valid: boolean; errors: string[]; warnings: string[] }>;
  bulkValidateSettings(settings: Array<{ key: string; value: any }>): Promise<Array<{ key: string; valid: boolean; errors: string[]; warnings: string[] }>>;
  createSettingsValidationRule(rule: InsertSettingsValidationRule): Promise<SettingsValidationRule>;
  updateSettingsValidationRule(id: number, rule: Partial<InsertSettingsValidationRule>): Promise<SettingsValidationRule | undefined>;
  deleteSettingsValidationRule(id: number): Promise<boolean>;

  // Settings Audit methods
  getSettingsAuditLogs(options?: {
    settingKey?: string;
    settingScope?: string;
    scopeId?: number;
    userId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: SettingsAuditLog[]; total: number; page: number; limit: number; totalPages: number }>;
  createSettingsAuditLog(log: InsertSettingsAuditLog): Promise<SettingsAuditLog>;
  rollbackSettingChange(auditLogId: number, userId: number, reason: string): Promise<boolean>;

  // Settings Templates methods
  getAllSettingsTemplates(options?: {
    scope?: string;
    category?: string;
    templateType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ templates: SettingsTemplate[]; total: number; page: number; limit: number; totalPages: number }>;
  getSettingsTemplateById(id: number): Promise<SettingsTemplate | undefined>;
  getSettingsTemplateByName(name: string): Promise<SettingsTemplate | undefined>;
  createSettingsTemplate(template: InsertSettingsTemplate): Promise<SettingsTemplate>;
  updateSettingsTemplate(id: number, template: Partial<InsertSettingsTemplate>): Promise<SettingsTemplate | undefined>;
  deleteSettingsTemplate(id: number): Promise<boolean>;
  applySettingsTemplate(templateId: number, scope: string, scopeId?: number, userId?: number): Promise<any>;

  // Settings Export/Import methods
  exportSettings(options?: {
    scope?: string;
    scopeId?: number;
    categories?: string[];
    includeDefaults?: boolean;
  }): Promise<any>;
  importSettings(settingsData: any, scope?: string, scopeId?: number, userId?: number): Promise<{
    imported: number;
    skipped: number;
    errors: Array<{ key: string; error: string }>;
  }>;
  validateSettingsImport(settingsData: any): Promise<{
    valid: boolean;
    warnings: string[];
    errors: string[];
  }>;

  // ===== AI SERVICES METHODS =====
  
  // AI Conversations methods
  getAllAiConversations(userId?: number, options?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    domainId?: number;
    tenantId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ conversations: AiConversation[]; total: number; page: number; limit: number; totalPages: number }>;
  getAiConversationById(id: number): Promise<AiConversation | undefined>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateAiConversation(id: number, conversation: Partial<InsertAiConversation>): Promise<AiConversation | undefined>;
  deleteAiConversation(id: number): Promise<boolean>;
  addMessageToConversation(conversationId: number, message: any): Promise<AiConversation | undefined>;
  getConversationsBySession(sessionId: string): Promise<AiConversation[]>;
  getUserConversationHistory(userId: number, options?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ conversations: AiConversation[]; total: number; page: number; limit: number; totalPages: number }>;
  clearUserConversationHistory(userId: number): Promise<boolean>;
  updateConversationUsage(id: number, tokensUsed: number, cost: number, responseTime: number): Promise<boolean>;
  
  // AI Script Generations methods
  getAllAiScriptGenerations(userId?: number, options?: {
    page?: number;
    limit?: number;
    requestType?: string;
    scriptType?: string;
    targetOS?: string;
    domainId?: number;
    tenantId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ scripts: AiScriptGeneration[]; total: number; page: number; limit: number; totalPages: number }>;
  getAiScriptGenerationById(id: number): Promise<AiScriptGeneration | undefined>;
  createAiScriptGeneration(script: InsertAiScriptGeneration): Promise<AiScriptGeneration>;
  updateAiScriptGeneration(id: number, script: Partial<InsertAiScriptGeneration>): Promise<AiScriptGeneration | undefined>;
  deleteAiScriptGeneration(id: number): Promise<boolean>;
  getUserScriptGenerations(userId: number, options?: {
    page?: number;
    limit?: number;
    requestType?: string;
  }): Promise<{ scripts: AiScriptGeneration[]; total: number; page: number; limit: number; totalPages: number }>;
  getBookmarkedScriptGenerations(userId: number): Promise<AiScriptGeneration[]>;
  updateScriptGenerationUsage(id: number): Promise<boolean>;
  addScriptGenerationFeedback(id: number, rating: number, feedback: string): Promise<boolean>;
  getTopRatedScriptGenerations(limit?: number): Promise<AiScriptGeneration[]>;
  
  // AI Analysis Reports methods
  getAllAiAnalysisReports(userId?: number, options?: {
    page?: number;
    limit?: number;
    analysisType?: string;
    status?: string;
    domainId?: number;
    tenantId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ reports: AiAnalysisReport[]; total: number; page: number; limit: number; totalPages: number }>;
  getAiAnalysisReportById(id: number): Promise<AiAnalysisReport | undefined>;
  createAiAnalysisReport(report: InsertAiAnalysisReport): Promise<AiAnalysisReport>;
  updateAiAnalysisReport(id: number, report: Partial<InsertAiAnalysisReport>): Promise<AiAnalysisReport | undefined>;
  deleteAiAnalysisReport(id: number): Promise<boolean>;
  startAnalysisReport(id: number): Promise<boolean>;
  completeAnalysisReport(id: number, results: any, processingTime: number): Promise<boolean>;
  getAnalysisReportsByType(analysisType: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<{ reports: AiAnalysisReport[]; total: number; page: number; limit: number; totalPages: number }>;
  getSharedAnalysisReports(domainId?: number, tenantId?: number): Promise<AiAnalysisReport[]>;
  
  // AI Recommendations methods
  getAllAiRecommendations(userId?: number, options?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    priority?: string;
    status?: string;
    domainId?: number;
    tenantId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ recommendations: AiRecommendation[]; total: number; page: number; limit: number; totalPages: number }>;
  getAiRecommendationById(id: number): Promise<AiRecommendation | undefined>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  updateAiRecommendation(id: number, recommendation: Partial<InsertAiRecommendation>): Promise<AiRecommendation | undefined>;
  deleteAiRecommendation(id: number): Promise<boolean>;
  getPersonalizedRecommendations(userId: number, limit?: number): Promise<AiRecommendation[]>;
  getTrendingRecommendations(limit?: number): Promise<AiRecommendation[]>;
  getDashboardRecommendations(userId: number, domainId?: number, tenantId?: number): Promise<AiRecommendation[]>;
  implementRecommendation(id: number): Promise<boolean>;
  dismissRecommendation(id: number): Promise<boolean>;
  trackRecommendationInteraction(id: number, interactionType: string): Promise<boolean>;
  refreshRecommendations(userId: number, type?: string): Promise<AiRecommendation[]>;
  
  // AI Feedback methods
  getAllAiFeedback(options?: {
    page?: number;
    limit?: number;
    feedbackType?: string;
    targetType?: string;
    rating?: number;
    processed?: boolean;
    domainId?: number;
    tenantId?: number;
  }): Promise<{ feedback: AiFeedback[]; total: number; page: number; limit: number; totalPages: number }>;
  getAiFeedbackById(id: number): Promise<AiFeedback | undefined>;
  createAiFeedback(feedback: InsertAiFeedback): Promise<AiFeedback>;
  updateAiFeedback(id: number, feedback: Partial<InsertAiFeedback>): Promise<AiFeedback | undefined>;
  deleteAiFeedback(id: number): Promise<boolean>;
  getFeedbackForTarget(targetType: string, targetId: number): Promise<AiFeedback[]>;
  processFeedback(id: number, notes?: string): Promise<boolean>;
  getUnprocessedFeedback(limit?: number): Promise<AiFeedback[]>;
  getFeedbackAnalytics(options?: {
    targetType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any>;
  
  // AI Usage Logs methods
  getAllAiUsageLogs(options?: {
    page?: number;
    limit?: number;
    userId?: number;
    endpoint?: string;
    aiModel?: string;
    success?: boolean;
    startDate?: string;
    endDate?: string;
    domainId?: number;
    tenantId?: number;
  }): Promise<{ logs: AiUsageLog[]; total: number; page: number; limit: number; totalPages: number }>;
  createAiUsageLog(usageLog: InsertAiUsageLog): Promise<AiUsageLog>;
  getAiUsageLogsByDateRange(userId: number, startDate: Date, endDate: Date, tenantId?: number): Promise<AiUsageLog[]>;
  getUsageLogsByUser(userId: number, options?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: AiUsageLog[]; total: number; page: number; limit: number; totalPages: number }>;
  getUserUsageMetrics(userId: number, period?: string): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    successRate: number;
  }>;
  getSystemUsageMetrics(period?: string, domainId?: number, tenantId?: number): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    successRate: number;
    topUsers: Array<{ userId: number; requests: number; cost: number }>;
    topEndpoints: Array<{ endpoint: string; requests: number; cost: number }>;
  }>;
  getCostAnalytics(options?: {
    period?: string;
    userId?: number;
    domainId?: number;
    tenantId?: number;
  }): Promise<{
    totalCost: number;
    costByModel: Record<string, number>;
    costByEndpoint: Record<string, number>;
    costTrend: Array<{ date: string; cost: number }>;
  }>;
  
  // AI Model Configurations methods
  getAllAiModelConfigurations(domainId?: number, tenantId?: number): Promise<AiModelConfiguration[]>;
  getAiModelConfigurationById(id: number): Promise<AiModelConfiguration | undefined>;
  getAiModelConfigurationByName(name: string): Promise<AiModelConfiguration | undefined>;
  createAiModelConfiguration(config: InsertAiModelConfiguration): Promise<AiModelConfiguration>;
  updateAiModelConfiguration(id: number, config: Partial<InsertAiModelConfiguration>): Promise<AiModelConfiguration | undefined>;
  deleteAiModelConfiguration(id: number): Promise<boolean>;
  getDefaultAiModelConfiguration(scope?: string): Promise<AiModelConfiguration | undefined>;
  setDefaultAiModelConfiguration(id: number, scope?: string): Promise<boolean>;
  getModelConfigurationForUseCase(useCase: string, domainId?: number, tenantId?: number): Promise<AiModelConfiguration | undefined>;
  updateModelUsageStats(id: number, tokensUsed: number, cost: number): Promise<boolean>;
  validateModelConfiguration(config: any): Promise<{ valid: boolean; errors: string[] }>;
}

export class DatabaseStorage implements IStorage {
  // ===== DOMAIN METHODS =====
  async getAllDomains(): Promise<Domain[]> {
    return await db.select().from(domains).orderBy(desc(domains.createdAt));
  }

  async getDomainById(id: number): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain || undefined;
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const [newDomain] = await db.insert(domains).values(domain).returning();
    return newDomain;
  }

  async updateDomain(id: number, domain: Partial<InsertDomain>): Promise<Domain | undefined> {
    const [updatedDomain] = await db
      .update(domains)
      .set({ ...domain, updatedAt: new Date() })
      .where(eq(domains.id, id))
      .returning();
    return updatedDomain || undefined;
  }

  async deleteDomain(id: number): Promise<boolean> {
    const result = await db.delete(domains).where(eq(domains.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ===== TENANT METHODS =====
  async getAllTenants(domainId?: number): Promise<Tenant[]> {
    if (domainId) {
      return await db.select().from(tenants).where(eq(tenants.domainId, domainId)).orderBy(desc(tenants.createdAt));
    }
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }

  async getTenantById(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || undefined;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values([tenant]).returning();
    return newTenant;
  }

  async updateTenant(id: number, tenant: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [updatedTenant] = await db
      .update(tenants)
      .set({ ...tenant, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return updatedTenant || undefined;
  }

  async deleteTenant(id: number): Promise<boolean> {
    const result = await db.delete(tenants).where(eq(tenants.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateUserPreferences(id: number, preferences: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ preferences, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(options?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    globalRole?: string;
    domainId?: number;
    tenantId?: number;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'desc';

    let query = db.select().from(users);
    let countQuery = db.select({ count: sql`count(*)` }).from(users);

    // Apply filters
    const conditions = [];
    
    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      conditions.push(
        or(
          sql`${users.firstName} ILIKE ${searchTerm}`,
          sql`${users.lastName} ILIKE ${searchTerm}`,
          sql`${users.username} ILIKE ${searchTerm}`,
          sql`${users.email} ILIKE ${searchTerm}`
        )
      );
    }
    
    if (options?.role) {
      conditions.push(eq(users.role, options.role));
    }
    
    if (options?.globalRole) {
      conditions.push(eq(users.globalRole, options.globalRole));
    }
    
    if (options?.domainId) {
      conditions.push(eq(users.domainId, options.domainId));
    }
    
    if (options?.tenantId) {
      conditions.push(eq(users.tenantId, options.tenantId));
    }
    
    if (options?.isActive !== undefined) {
      conditions.push(eq(users.isActive, options.isActive));
    }

    if (conditions.length > 0) {
      const whereCondition = and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }

    // Apply sorting
    const sortColumn = sortBy === 'firstName' ? users.firstName :
                      sortBy === 'lastName' ? users.lastName :
                      sortBy === 'email' ? users.email :
                      sortBy === 'username' ? users.username :
                      sortBy === 'role' ? users.role :
                      users.createdAt;
                      
    query = sortOrder === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));

    // Apply pagination
    const userList = await query.limit(limit).offset(offset);
    const [{ count }] = await countQuery;
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    return {
      users: userList,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getUsersByRole(role: string, domainId?: number, tenantId?: number): Promise<User[]> {
    let query = db.select().from(users).where(eq(users.role, role));
    
    const conditions = [eq(users.role, role)];
    if (domainId) conditions.push(eq(users.domainId, domainId));
    if (tenantId) conditions.push(eq(users.tenantId, tenantId));
    
    return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
  }

  async getUsersByGlobalRole(globalRole: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.globalRole, globalRole)).orderBy(desc(users.createdAt));
  }

  async getUsersByDomain(domainId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.domainId, domainId)).orderBy(desc(users.createdAt));
  }

  async getUsersByTenant(tenantId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.tenantId, tenantId)).orderBy(desc(users.createdAt));
  }

  async searchUsers(searchTerm: string, options?: { domainId?: number; tenantId?: number }): Promise<User[]> {
    const searchPattern = `%${searchTerm}%`;
    const conditions = [
      or(
        sql`${users.firstName} ILIKE ${searchPattern}`,
        sql`${users.lastName} ILIKE ${searchPattern}`,
        sql`${users.username} ILIKE ${searchPattern}`,
        sql`${users.email} ILIKE ${searchPattern}`
      )
    ];
    
    if (options?.domainId) conditions.push(eq(users.domainId, options.domainId));
    if (options?.tenantId) conditions.push(eq(users.tenantId, options.tenantId));
    
    return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
  }

  async bulkUpdateUsers(userIds: number[], updates: Partial<InsertUser>): Promise<User[]> {
    return await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(sql`${users.id} = ANY(${userIds})`)
      .returning();
  }

  async bulkCreateUsers(userList: InsertUser[]): Promise<User[]> {
    return await db.insert(users).values(userList).returning();
  }

  async deactivateUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async activateUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async resetUserPreferences(id: number): Promise<User | undefined> {
    const defaultPreferences = {
      theme: "light" as const,
      language: "en" as const,
      notifications: true
    };
    
    const [user] = await db
      .update(users)
      .set({ preferences: defaultPreferences, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // User Activity and Session methods
  async getUserActivityLogs(userId: number, options?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ activities: ActivityLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(activityLogs).where(eq(activityLogs.userId, userId));
    let countQuery = db.select({ count: sql`count(*)` }).from(activityLogs).where(eq(activityLogs.userId, userId));
    
    const conditions = [eq(activityLogs.userId, userId)];
    
    if (options?.type) {
      conditions.push(eq(activityLogs.type, options.type));
    }
    
    if (options?.startDate) {
      conditions.push(gte(activityLogs.createdAt, new Date(options.startDate)));
    }
    
    if (options?.endDate) {
      conditions.push(lte(activityLogs.createdAt, new Date(options.endDate)));
    }
    
    if (conditions.length > 1) {
      const whereCondition = and(...conditions);
      query = db.select().from(activityLogs).where(whereCondition);
      countQuery = db.select({ count: sql`count(*)` }).from(activityLogs).where(whereCondition);
    }
    
    const activities = await query.orderBy(desc(activityLogs.createdAt)).limit(limit).offset(offset);
    const [{ count }] = await countQuery;
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);
    
    return {
      activities,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getUserActiveSessions(userId: number): Promise<any[]> {
    // In a real implementation, this would query a sessions table
    // For now, we'll return recent credential access logs as a proxy for sessions
    const recentSessions = await db
      .select()
      .from(credentialAccessLogs)
      .where(eq(credentialAccessLogs.userId, userId))
      .orderBy(desc(credentialAccessLogs.accessedAt))
      .limit(10);
    
    return recentSessions.map(session => ({
      sessionId: session.sessionId || `session_${session.id}`,
      startTime: session.accessedAt,
      ipAddress: session.sourceIp,
      userAgent: session.userAgent,
      lastActivity: session.accessedAt,
      duration: session.sessionDuration || 0
    }));
  }

  async terminateUserSession(userId: number, sessionId: string): Promise<boolean> {
    // In a real implementation, this would update/delete from a sessions table
    // For now, we'll simulate by checking if the session exists in credential access logs
    const session = await db
      .select()
      .from(credentialAccessLogs)
      .where(and(
        eq(credentialAccessLogs.userId, userId),
        or(
          eq(credentialAccessLogs.sessionId, sessionId),
          eq(sql`'session_' || ${credentialAccessLogs.id}`, sessionId)
        )
      ))
      .limit(1);
    
    return session.length > 0;
  }

  async terminateAllUserSessions(userId: number): Promise<number> {
    // In a real implementation, this would update/delete all sessions for the user
    // For now, we'll count recent sessions from credential access logs
    const sessions = await db
      .select()
      .from(credentialAccessLogs)
      .where(eq(credentialAccessLogs.userId, userId));
    
    return sessions.length;
  }

  async logUserActivity(activityData: any): Promise<ActivityLog> {
    const [activity] = await db
      .insert(activityLogs)
      .values([{
        userId: activityData.userId,
        type: activityData.type,
        details: activityData.details,
        targetType: activityData.targetType,
        targetId: activityData.targetId,
        ipAddress: activityData.ipAddress,
        userAgent: activityData.userAgent
      }])
      .returning();
    
    return activity;
  }

  async getSystemActivityLogs(options?: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ activities: ActivityLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(activityLogs);
    let countQuery = db.select({ count: sql`count(*)` }).from(activityLogs);
    
    const conditions = [];
    
    if (options?.userId) {
      conditions.push(eq(activityLogs.userId, options.userId));
    }
    
    if (options?.type) {
      conditions.push(eq(activityLogs.type, options.type));
    }
    
    if (options?.startDate) {
      conditions.push(gte(activityLogs.createdAt, new Date(options.startDate)));
    }
    
    if (options?.endDate) {
      conditions.push(lte(activityLogs.createdAt, new Date(options.endDate)));
    }
    
    if (conditions.length > 0) {
      const whereCondition = and(...conditions);
      query = db.select().from(activityLogs).where(whereCondition);
      countQuery = db.select({ count: sql`count(*)` }).from(activityLogs).where(whereCondition);
    }
    
    const activities = await query.orderBy(desc(activityLogs.createdAt)).limit(limit).offset(offset);
    const [{ count }] = await countQuery;
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);
    
    return {
      activities,
      total,
      page,
      limit,
      totalPages
    };
  }

  // Endpoint/Asset methods
  async getAllEndpoints(): Promise<Endpoint[]> {
    return await db.select().from(endpoints).orderBy(desc(endpoints.createdAt));
  }

  async getEndpoint(id: number): Promise<Endpoint | undefined> {
    const [endpoint] = await db.select().from(endpoints).where(eq(endpoints.id, id));
    return endpoint || undefined;
  }

  async createEndpoint(insertEndpoint: InsertEndpoint): Promise<Endpoint> {
    const [endpoint] = await db.insert(endpoints).values([insertEndpoint]).returning();
    return endpoint;
  }

  async updateEndpoint(id: number, endpointData: Partial<InsertEndpoint>): Promise<Endpoint | undefined> {
    const [endpoint] = await db
      .update(endpoints)
      .set({ ...endpointData, updatedAt: new Date() })
      .where(eq(endpoints.id, id))
      .returning();
    return endpoint || undefined;
  }

  async deleteEndpoint(id: number): Promise<boolean> {
    const result = await db.delete(endpoints).where(eq(endpoints.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createDiscoveredEndpoints(endpointsList: InsertEndpoint[]): Promise<Endpoint[]> {
    return await db.insert(endpoints).values(endpointsList).returning();
  }

  async getEndpointsByDiscoveryJob(jobId: number): Promise<Endpoint[]> {
    return await db.select().from(endpoints).where(eq(endpoints.discoveryJobId, jobId));
  }

  // Credential Profile methods
  async getAllCredentialProfiles(): Promise<CredentialProfile[]> {
    return await db.select().from(credentialProfiles).orderBy(desc(credentialProfiles.createdAt));
  }

  async getCredentialProfile(id: number): Promise<CredentialProfile | undefined> {
    const [profile] = await db.select().from(credentialProfiles).where(eq(credentialProfiles.id, id));
    return profile || undefined;
  }

  async createCredentialProfile(insertProfile: InsertCredentialProfile): Promise<CredentialProfile> {
    const [profile] = await db.insert(credentialProfiles).values(insertProfile).returning();
    return profile;
  }

  async updateCredentialProfile(id: number, profileData: Partial<InsertCredentialProfile>): Promise<CredentialProfile | undefined> {
    const [profile] = await db
      .update(credentialProfiles)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(credentialProfiles.id, id))
      .returning();
    return profile || undefined;
  }

  async deleteCredentialProfile(id: number): Promise<boolean> {
    const result = await db.delete(credentialProfiles).where(eq(credentialProfiles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Discovery Probe methods
  async getAllDiscoveryProbes(): Promise<DiscoveryProbe[]> {
    return await db.select().from(discoveryProbes).orderBy(desc(discoveryProbes.createdAt));
  }

  async getDiscoveryProbe(id: number): Promise<DiscoveryProbe | undefined> {
    const [probe] = await db.select().from(discoveryProbes).where(eq(discoveryProbes.id, id));
    return probe || undefined;
  }

  async createDiscoveryProbe(insertProbe: InsertDiscoveryProbe): Promise<DiscoveryProbe> {
    const [probe] = await db.insert(discoveryProbes).values(insertProbe).returning();
    return probe;
  }

  async updateDiscoveryProbe(id: number, probeData: Partial<InsertDiscoveryProbe>): Promise<DiscoveryProbe | undefined> {
    const [probe] = await db
      .update(discoveryProbes)
      .set({ ...probeData, updatedAt: new Date() })
      .where(eq(discoveryProbes.id, id))
      .returning();
    return probe || undefined;
  }

  async deleteDiscoveryProbe(id: number): Promise<boolean> {
    const result = await db.delete(discoveryProbes).where(eq(discoveryProbes.id, id));
    return result.rowCount > 0;
  }

  // Script methods
  async getAllScripts(): Promise<Script[]> {
    return await db.select().from(scripts).orderBy(desc(scripts.createdAt));
  }

  async getScript(id: number): Promise<Script | undefined> {
    const [script] = await db.select().from(scripts).where(eq(scripts.id, id));
    return script || undefined;
  }

  async createScript(insertScript: InsertScript): Promise<Script> {
    const [script] = await db.insert(scripts).values(insertScript).returning();
    return script;
  }

  async updateScript(id: number, scriptData: Partial<InsertScript>): Promise<Script | undefined> {
    const [script] = await db
      .update(scripts)
      .set({ ...scriptData, updatedAt: new Date() })
      .where(eq(scripts.id, id))
      .returning();
    return script || undefined;
  }

  async deleteScript(id: number): Promise<boolean> {
    const result = await db.delete(scripts).where(eq(scripts.id, id));
    return result.rowCount > 0;
  }

  // Policy methods
  async getAllPolicies(): Promise<Policy[]> {
    return await db.select().from(policies).orderBy(desc(policies.createdAt));
  }

  async getPolicy(id: number): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy || undefined;
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const [policy] = await db.insert(policies).values(insertPolicy).returning();
    return policy;
  }

  async updatePolicy(id: number, policyData: Partial<InsertPolicy>): Promise<Policy | undefined> {
    const [policy] = await db
      .update(policies)
      .set({ ...policyData, updatedAt: new Date() })
      .where(eq(policies.id, id))
      .returning();
    return policy || undefined;
  }

  async deletePolicy(id: number): Promise<boolean> {
    const result = await db.delete(policies).where(eq(policies.id, id));
    return result.rowCount > 0;
  }

  // Discovery Job methods (Agentless)
  async getAllDiscoveryJobs(): Promise<DiscoveryJob[]> {
    return await db.select().from(discoveryJobs).orderBy(desc(discoveryJobs.createdAt));
  }

  async getDiscoveryJob(id: number): Promise<DiscoveryJob | undefined> {
    const [job] = await db.select().from(discoveryJobs).where(eq(discoveryJobs.id, id));
    return job || undefined;
  }

  async createDiscoveryJob(insertJob: InsertDiscoveryJob): Promise<DiscoveryJob> {
    const [job] = await db.insert(discoveryJobs).values(insertJob).returning();
    return job;
  }

  async updateDiscoveryJob(id: number, jobData: Partial<InsertDiscoveryJob>): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({ ...jobData, updatedAt: new Date() })
      .where(eq(discoveryJobs.id, id))
      .returning();
    return job || undefined;
  }

  async deleteDiscoveryJob(id: number): Promise<boolean> {
    const result = await db.delete(discoveryJobs).where(eq(discoveryJobs.id, id));
    return result.rowCount > 0;
  }

  // Enhanced Discovery Jobs with enterprise features
  async getAllDiscoveryJobsWithFilters(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    domainId?: number;
    tenantId?: number;
    createdBy?: number;
    probeId?: number;
    credentialProfileId?: number;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ jobs: DiscoveryJob[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      type,
      domainId,
      tenantId,
      createdBy,
      probeId,
      credentialProfileId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any[] = [];

    if (search) {
      whereConditions.push(
        or(
          sql`${discoveryJobs.name} ILIKE ${`%${search}%`}`,
          sql`${discoveryJobs.description} ILIKE ${`%${search}%`}`
        )
      );
    }

    if (status) whereConditions.push(eq(discoveryJobs.status, status));
    if (type) whereConditions.push(eq(discoveryJobs.type, type));
    if (domainId) whereConditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) whereConditions.push(eq(discoveryJobs.tenantId, tenantId));
    if (createdBy) whereConditions.push(eq(discoveryJobs.createdBy, createdBy));
    if (probeId) whereConditions.push(eq(discoveryJobs.probeId, probeId));
    if (credentialProfileId) whereConditions.push(eq(discoveryJobs.credentialProfileId, credentialProfileId));
    if (startDate) whereConditions.push(gte(discoveryJobs.createdAt, startDate));
    if (endDate) whereConditions.push(lte(discoveryJobs.createdAt, endDate));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(discoveryJobs)
      .where(whereClause);

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const orderByColumn = sortBy === 'name' ? discoveryJobs.name :
                         sortBy === 'status' ? discoveryJobs.status :
                         sortBy === 'type' ? discoveryJobs.type :
                         sortBy === 'updatedAt' ? discoveryJobs.updatedAt :
                         discoveryJobs.createdAt;

    const jobs = await db
      .select()
      .from(discoveryJobs)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn))
      .limit(limit)
      .offset(offset);

    return { jobs, total, page, limit, totalPages };
  }

  async getDiscoveryJobsByStatus(status: string, domainId?: number, tenantId?: number): Promise<DiscoveryJob[]> {
    const conditions = [eq(discoveryJobs.status, status)];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));

    return await db
      .select()
      .from(discoveryJobs)
      .where(and(...conditions))
      .orderBy(desc(discoveryJobs.createdAt));
  }

  async getDiscoveryJobsByType(type: string, domainId?: number, tenantId?: number): Promise<DiscoveryJob[]> {
    const conditions = [eq(discoveryJobs.type, type)];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));

    return await db
      .select()
      .from(discoveryJobs)
      .where(and(...conditions))
      .orderBy(desc(discoveryJobs.createdAt));
  }

  async getDiscoveryJobsByProbe(probeId: number): Promise<DiscoveryJob[]> {
    return await db
      .select()
      .from(discoveryJobs)
      .where(eq(discoveryJobs.probeId, probeId))
      .orderBy(desc(discoveryJobs.createdAt));
  }

  async getDiscoveryJobsByCredentialProfile(credentialProfileId: number): Promise<DiscoveryJob[]> {
    return await db
      .select()
      .from(discoveryJobs)
      .where(eq(discoveryJobs.credentialProfileId, credentialProfileId))
      .orderBy(desc(discoveryJobs.createdAt));
  }

  async getDiscoveryJobsByDomain(domainId: number): Promise<DiscoveryJob[]> {
    return await db
      .select()
      .from(discoveryJobs)
      .where(eq(discoveryJobs.domainId, domainId))
      .orderBy(desc(discoveryJobs.createdAt));
  }

  async getDiscoveryJobsByTenant(tenantId: number): Promise<DiscoveryJob[]> {
    return await db
      .select()
      .from(discoveryJobs)
      .where(eq(discoveryJobs.tenantId, tenantId))
      .orderBy(desc(discoveryJobs.createdAt));
  }

  async getDiscoveryJobsByUser(userId: number): Promise<DiscoveryJob[]> {
    return await db
      .select()
      .from(discoveryJobs)
      .where(eq(discoveryJobs.createdBy, userId))
      .orderBy(desc(discoveryJobs.createdAt));
  }

  async getDiscoveryJobHistory(jobId: number): Promise<DiscoveryJob[]> {
    // For now, return the job itself. In a full implementation, this would return
    // historical versions of the job from a job history table
    const job = await this.getDiscoveryJob(jobId);
    return job ? [job] : [];
  }

  // Discovery Job Execution Control
  async startDiscoveryJob(jobId: number, userId: number): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        status: 'running',
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    if (job) {
      // Log the activity
      await this.createActivity({
        type: 'discovery_job_started',
        description: `Discovery job "${job.name}" was started`,
        userId,
        metadata: { jobId, action: 'start' }
      });
    }

    return job || undefined;
  }

  async pauseDiscoveryJob(jobId: number, userId: number): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        status: 'paused',
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    if (job) {
      await this.createActivity({
        type: 'discovery_job_paused',
        description: `Discovery job "${job.name}" was paused`,
        userId,
        metadata: { jobId, action: 'pause' }
      });
    }

    return job || undefined;
  }

  async cancelDiscoveryJob(jobId: number, userId: number, reason?: string): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        status: 'cancelled',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    if (job) {
      await this.createActivity({
        type: 'discovery_job_cancelled',
        description: `Discovery job "${job.name}" was cancelled${reason ? `: ${reason}` : ''}`,
        userId,
        metadata: { jobId, action: 'cancel', reason }
      });
    }

    return job || undefined;
  }

  async resumeDiscoveryJob(jobId: number, userId: number): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        status: 'running',
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    if (job) {
      await this.createActivity({
        type: 'discovery_job_resumed',
        description: `Discovery job "${job.name}" was resumed`,
        userId,
        metadata: { jobId, action: 'resume' }
      });
    }

    return job || undefined;
  }

  async updateDiscoveryJobProgress(jobId: number, progress: any): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        progress,
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    return job || undefined;
  }

  async updateDiscoveryJobResults(jobId: number, results: any): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        results,
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    return job || undefined;
  }

  // Discovery Job Scheduling
  async getScheduledDiscoveryJobs(): Promise<DiscoveryJob[]> {
    return await db
      .select()
      .from(discoveryJobs)
      .where(
        and(
          eq(discoveryJobs.status, 'pending'),
          sql`${discoveryJobs.schedule}->>'type' IN ('scheduled', 'recurring')`
        )
      )
      .orderBy(asc(discoveryJobs.createdAt));
  }

  async getDiscoveryJobsReadyForExecution(): Promise<DiscoveryJob[]> {
    const now = new Date();
    return await db
      .select()
      .from(discoveryJobs)
      .where(
        and(
          eq(discoveryJobs.status, 'pending'),
          or(
            sql`${discoveryJobs.schedule}->>'type' = 'now'`,
            and(
              sql`${discoveryJobs.schedule}->>'type' = 'scheduled'`,
              sql`CAST(${discoveryJobs.schedule}->>'startTime' AS TIMESTAMP) <= ${now}`
            )
          )
        )
      )
      .orderBy(asc(discoveryJobs.createdAt));
  }

  async scheduleDiscoveryJob(jobId: number, schedule: any): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        schedule,
        status: schedule.type === 'now' ? 'pending' : 'scheduled',
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    return job || undefined;
  }

  async unscheduleDiscoveryJob(jobId: number): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        schedule: null,
        status: 'pending',
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    return job || undefined;
  }

  async triggerScheduledJob(jobId: number, userId: number): Promise<DiscoveryJob | undefined> {
    const [job] = await db
      .update(discoveryJobs)
      .set({
        status: 'running',
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(discoveryJobs.id, jobId))
      .returning();

    if (job) {
      await this.createActivity({
        type: 'discovery_job_triggered',
        description: `Scheduled discovery job "${job.name}" was triggered`,
        userId,
        metadata: { jobId, action: 'trigger' }
      });
    }

    return job || undefined;
  }

  // Discovery Results Management
  async getDiscoveryJobResults(jobId: number, options: {
    page?: number;
    limit?: number;
    status?: string;
    assetType?: string;
  } = {}): Promise<{ endpoints: Endpoint[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 50, status, assetType } = options;
    const offset = (page - 1) * limit;

    const whereConditions = [eq(endpoints.discoveryJobId, jobId)];
    if (status) whereConditions.push(eq(endpoints.status, status));
    if (assetType) whereConditions.push(eq(endpoints.assetType, assetType));

    const whereClause = and(...whereConditions);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(endpoints)
      .where(whereClause);

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const results = await db
      .select()
      .from(endpoints)
      .where(whereClause)
      .orderBy(desc(endpoints.lastSeen))
      .limit(limit)
      .offset(offset);

    return { endpoints: results, total, page, limit, totalPages };
  }

  async bulkUpdateDiscoveryResults(jobId: number, endpointIds: number[], updates: Partial<InsertEndpoint>): Promise<Endpoint[]> {
    return await db
      .update(endpoints)
      .set({ ...updates, updatedAt: new Date() })
      .where(
        and(
          eq(endpoints.discoveryJobId, jobId),
          sql`${endpoints.id} = ANY(${endpointIds})`
        )
      )
      .returning();
  }

  async bulkApproveDiscoveryResults(jobId: number, endpointIds: number[], userId: number): Promise<boolean> {
    const result = await db
      .update(endpoints)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(
        and(
          eq(endpoints.discoveryJobId, jobId),
          sql`${endpoints.id} = ANY(${endpointIds})`
        )
      );

    await this.createActivity({
      type: 'discovery_results_approved',
      description: `Approved ${endpointIds.length} discovery results`,
      userId,
      metadata: { jobId, endpointIds, action: 'bulk_approve' }
    });

    return result.rowCount > 0;
  }

  async bulkIgnoreDiscoveryResults(jobId: number, endpointIds: number[], userId: number): Promise<boolean> {
    const result = await db
      .update(endpoints)
      .set({ status: 'ignored', updatedAt: new Date() })
      .where(
        and(
          eq(endpoints.discoveryJobId, jobId),
          sql`${endpoints.id} = ANY(${endpointIds})`
        )
      );

    await this.createActivity({
      type: 'discovery_results_ignored',
      description: `Ignored ${endpointIds.length} discovery results`,
      userId,
      metadata: { jobId, endpointIds, action: 'bulk_ignore' }
    });

    return result.rowCount > 0;
  }

  async convertDiscoveryResultToAsset(endpointId: number, userId: number): Promise<Endpoint | undefined> {
    const [endpoint] = await db
      .update(endpoints)
      .set({ 
        status: 'managed',
        discoveryMethod: 'converted_from_discovery',
        updatedAt: new Date()
      })
      .where(eq(endpoints.id, endpointId))
      .returning();

    if (endpoint) {
      await this.createActivity({
        type: 'discovery_result_converted',
        description: `Converted discovery result "${endpoint.hostname}" to managed asset`,
        userId,
        metadata: { endpointId, hostname: endpoint.hostname, action: 'convert_to_asset' }
      });
    }

    return endpoint || undefined;
  }

  // Discovery Analytics
  async getDiscoveryJobStatistics(domainId?: number, tenantId?: number): Promise<any> {
    const conditions: any[] = [];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        running: sql<number>`count(*) filter (where status = 'running')`,
        completed: sql<number>`count(*) filter (where status = 'completed')`,
        failed: sql<number>`count(*) filter (where status = 'failed')`,
        cancelled: sql<number>`count(*) filter (where status = 'cancelled')`,
        scheduled: sql<number>`count(*) filter (where status = 'scheduled')`,
        agentless: sql<number>`count(*) filter (where type = 'agentless')`,
        agentBased: sql<number>`count(*) filter (where type = 'agent_based')`
      })
      .from(discoveryJobs)
      .where(whereClause);

    return stats[0] || {};
  }

  async getDiscoveryTrends(startDate: Date, endDate: Date, domainId?: number, tenantId?: number): Promise<any[]> {
    const conditions = [
      gte(discoveryJobs.createdAt, startDate),
      lte(discoveryJobs.createdAt, endDate)
    ];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));

    return await db
      .select({
        date: sql<string>`DATE(created_at)`,
        total: sql<number>`count(*)`,
        completed: sql<number>`count(*) filter (where status = 'completed')`,
        failed: sql<number>`count(*) filter (where status = 'failed')`
      })
      .from(discoveryJobs)
      .where(and(...conditions))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);
  }

  async getDiscoveryCoverage(domainId?: number, tenantId?: number): Promise<any> {
    const conditions: any[] = [];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // This would require more complex queries in a real implementation
    // For now, return basic coverage metrics
    const coverage = await db
      .select({
        totalJobs: sql<number>`count(*)`,
        totalAssets: sql<number>`sum((results->>'totalAssets')::integer)`,
        newAssets: sql<number>`sum((results->>'newAssets')::integer)`,
        updatedAssets: sql<number>`sum((results->>'updatedAssets')::integer)`
      })
      .from(discoveryJobs)
      .where(whereClause);

    return coverage[0] || {};
  }

  async getDiscoveryPerformanceMetrics(domainId?: number, tenantId?: number): Promise<any> {
    const conditions: any[] = [];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const metrics = await db
      .select({
        avgDuration: sql<number>`avg(EXTRACT(EPOCH FROM (completed_at - started_at))) filter (where completed_at is not null and started_at is not null)`,
        successRate: sql<number>`(count(*) filter (where status = 'completed')::float / count(*) * 100)`,
        failureRate: sql<number>`(count(*) filter (where status = 'failed')::float / count(*) * 100)`,
        avgAssetsDiscovered: sql<number>`avg((results->>'totalAssets')::integer) filter (where results is not null)`
      })
      .from(discoveryJobs)
      .where(whereClause);

    return metrics[0] || {};
  }

  // Discovery Job Templates and Cloning
  async cloneDiscoveryJob(jobId: number, newName: string, userId: number): Promise<DiscoveryJob> {
    const originalJob = await this.getDiscoveryJob(jobId);
    if (!originalJob) {
      throw new Error('Original discovery job not found');
    }

    const clonedJob = await this.createDiscoveryJob({
      name: newName,
      description: `Clone of: ${originalJob.description || originalJob.name}`,
      type: originalJob.type,
      domainId: originalJob.domainId,
      tenantId: originalJob.tenantId,
      targets: originalJob.targets,
      discoveryProfiles: originalJob.discoveryProfiles,
      schedule: originalJob.schedule,
      probeId: originalJob.probeId,
      credentialProfileId: originalJob.credentialProfileId,
      createdBy: userId
    });

    await this.createActivity({
      type: 'discovery_job_cloned',
      description: `Cloned discovery job "${originalJob.name}" to "${newName}"`,
      userId,
      metadata: { originalJobId: jobId, newJobId: clonedJob.id, action: 'clone' }
    });

    return clonedJob;
  }

  async createDiscoveryJobFromTemplate(templateId: number, name: string, userId: number): Promise<DiscoveryJob> {
    // In a full implementation, this would use a templates table
    // For now, we'll simulate by cloning an existing job
    return await this.cloneDiscoveryJob(templateId, name, userId);
  }

  // Discovery Job Validation
  async validateDiscoveryTargets(targets: any, probeId?: number): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!targets) {
      errors.push('Targets configuration is required');
      return { valid: false, errors };
    }

    // Validate IP ranges
    if (targets.ipRanges && Array.isArray(targets.ipRanges)) {
      targets.ipRanges.forEach((range: string, index: number) => {
        if (!this.isValidIpRange(range)) {
          errors.push(`Invalid IP range at index ${index}: ${range}`);
        }
      });
    }

    // Validate hostnames
    if (targets.hostnames && Array.isArray(targets.hostnames)) {
      targets.hostnames.forEach((hostname: string, index: number) => {
        if (!this.isValidHostname(hostname)) {
          errors.push(`Invalid hostname at index ${index}: ${hostname}`);
        }
      });
    }

    // Validate probe availability if specified
    if (probeId) {
      const probe = await db.select().from(discoveryProbes).where(eq(discoveryProbes.id, probeId)).limit(1);
      if (probe.length === 0) {
        errors.push(`Discovery probe with ID ${probeId} not found`);
      } else if (probe[0].status !== 'online') {
        errors.push(`Discovery probe "${probe[0].name}" is not online`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async validateDiscoveryCredentials(credentialProfileId: number, targets?: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if credential profile exists
    const profile = await db
      .select()
      .from(credentialProfiles)
      .where(eq(credentialProfiles.id, credentialProfileId))
      .limit(1);

    if (profile.length === 0) {
      errors.push(`Credential profile with ID ${credentialProfileId} not found`);
      return { valid: false, errors };
    }

    const cred = profile[0];
    
    if (!cred.isActive) {
      errors.push(`Credential profile "${cred.name}" is not active`);
    }

    if (cred.expiresAt && cred.expiresAt < new Date()) {
      errors.push(`Credential profile "${cred.name}" has expired`);
    }

    return { valid: errors.length === 0, errors };
  }

  // Bulk Operations
  async bulkUpdateDiscoveryJobs(jobIds: number[], updates: Partial<InsertDiscoveryJob>, userId: number): Promise<DiscoveryJob[]> {
    const jobs = await db
      .update(discoveryJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(sql`${discoveryJobs.id} = ANY(${jobIds})`)
      .returning();

    await this.createActivity({
      type: 'discovery_jobs_bulk_updated',
      description: `Bulk updated ${jobIds.length} discovery jobs`,
      userId,
      metadata: { jobIds, updates, action: 'bulk_update' }
    });

    return jobs;
  }

  async bulkDeleteDiscoveryJobs(jobIds: number[], userId: number): Promise<boolean> {
    const result = await db
      .delete(discoveryJobs)
      .where(sql`${discoveryJobs.id} = ANY(${jobIds})`);

    await this.createActivity({
      type: 'discovery_jobs_bulk_deleted',
      description: `Bulk deleted ${jobIds.length} discovery jobs`,
      userId,
      metadata: { jobIds, action: 'bulk_delete' }
    });

    return result.rowCount > 0;
  }

  async bulkStartDiscoveryJobs(jobIds: number[], userId: number): Promise<DiscoveryJob[]> {
    const jobs = await db
      .update(discoveryJobs)
      .set({
        status: 'running',
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(sql`${discoveryJobs.id} = ANY(${jobIds})`)
      .returning();

    await this.createActivity({
      type: 'discovery_jobs_bulk_started',
      description: `Bulk started ${jobIds.length} discovery jobs`,
      userId,
      metadata: { jobIds, action: 'bulk_start' }
    });

    return jobs;
  }

  async bulkCancelDiscoveryJobs(jobIds: number[], userId: number, reason?: string): Promise<DiscoveryJob[]> {
    const jobs = await db
      .update(discoveryJobs)
      .set({
        status: 'cancelled',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(sql`${discoveryJobs.id} = ANY(${jobIds})`)
      .returning();

    await this.createActivity({
      type: 'discovery_jobs_bulk_cancelled',
      description: `Bulk cancelled ${jobIds.length} discovery jobs${reason ? `: ${reason}` : ''}`,
      userId,
      metadata: { jobIds, reason, action: 'bulk_cancel' }
    });

    return jobs;
  }

  // Helper methods for validation
  private isValidIpRange(ipRange: string): boolean {
    // Basic IP range validation - in production this would be more robust
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
    const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    return ipv4Regex.test(ipRange) || cidrRegex.test(ipRange);
  }

  private isValidHostname(hostname: string): boolean {
    // Basic hostname validation
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?))*$/;
    return hostnameRegex.test(hostname) && hostname.length <= 253;
  }

  // Agent Deployment methods (Agent-Based)
  async getAllAgentDeployments(): Promise<AgentDeployment[]> {
    return await db.select().from(agentDeployments).orderBy(desc(agentDeployments.createdAt));
  }

  async getAgentDeployment(id: number): Promise<AgentDeployment | undefined> {
    const [deployment] = await db.select().from(agentDeployments).where(eq(agentDeployments.id, id));
    return deployment || undefined;
  }

  async createAgentDeployment(insertDeployment: InsertAgentDeployment): Promise<AgentDeployment> {
    const [deployment] = await db.insert(agentDeployments).values(insertDeployment).returning();
    return deployment;
  }

  async updateAgentDeployment(id: number, deploymentData: Partial<InsertAgentDeployment>): Promise<AgentDeployment | undefined> {
    const [deployment] = await db
      .update(agentDeployments)
      .set({ ...deploymentData, updatedAt: new Date() })
      .where(eq(agentDeployments.id, id))
      .returning();
    return deployment || undefined;
  }

  async deleteAgentDeployment(id: number): Promise<boolean> {
    const result = await db.delete(agentDeployments).where(eq(agentDeployments.id, id));
    return result.rowCount > 0;
  }

  // Agent methods
  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents).orderBy(desc(agents.createdAt));
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }

  async updateAgent(id: string, agentData: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [agent] = await db
      .update(agents)
      .set({ ...agentData, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return agent || undefined;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return result.rowCount > 0;
  }

  // Enhanced Agent Management Methods
  async getAllAgentsWithFilters(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    operatingSystem?: string;
    domainId?: number;
    tenantId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ agents: Agent[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'desc';

    let query = db.select().from(agents);
    let countQuery = db.select({ count: sql`count(*)` }).from(agents);

    // Apply filters
    const conditions = [];
    
    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      conditions.push(
        or(
          sql`${agents.hostname} ILIKE ${searchTerm}`,
          sql`${agents.ipAddress} ILIKE ${searchTerm}`,
          sql`${agents.id} ILIKE ${searchTerm}`
        )
      );
    }
    
    if (options?.status) {
      conditions.push(eq(agents.status, options.status));
    }
    
    if (options?.operatingSystem) {
      conditions.push(eq(agents.operatingSystem, options.operatingSystem));
    }
    
    if (options?.domainId) {
      conditions.push(eq(agents.domainId, options.domainId));
    }
    
    if (options?.tenantId) {
      conditions.push(eq(agents.tenantId, options.tenantId));
    }

    if (conditions.length > 0) {
      const whereCondition = and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }

    // Apply sorting
    const sortColumn = sortBy === 'hostname' ? agents.hostname :
                      sortBy === 'ipAddress' ? agents.ipAddress :
                      sortBy === 'status' ? agents.status :
                      sortBy === 'lastHeartbeat' ? agents.lastHeartbeat :
                      agents.createdAt;
                      
    query = sortOrder === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));

    // Apply pagination
    const agentsList = await query.limit(limit).offset(offset);
    const [{ count }] = await countQuery;
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    return {
      agents: agentsList,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getAgentsByStatus(status: string, domainId?: number, tenantId?: number): Promise<Agent[]> {
    const conditions = [eq(agents.status, status)];
    if (domainId) conditions.push(eq(agents.domainId, domainId));
    if (tenantId) conditions.push(eq(agents.tenantId, tenantId));
    
    return await db.select().from(agents).where(and(...conditions)).orderBy(desc(agents.lastHeartbeat));
  }

  async getAgentsByDomain(domainId: number): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.domainId, domainId)).orderBy(desc(agents.createdAt));
  }

  async getAgentsByTenant(tenantId: number): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.tenantId, tenantId)).orderBy(desc(agents.createdAt));
  }

  async bulkUpdateAgents(agentIds: string[], updates: Partial<InsertAgent>): Promise<Agent[]> {
    const results = [];
    for (const id of agentIds) {
      const [updatedAgent] = await db
        .update(agents)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(agents.id, id))
        .returning();
      if (updatedAgent) {
        results.push(updatedAgent);
      }
    }
    return results;
  }

  async getAgentStatistics(domainId?: number, tenantId?: number): Promise<any> {
    let query = db.select().from(agents);
    
    if (domainId && tenantId) {
      query = query.where(and(
        eq(agents.domainId, domainId),
        eq(agents.tenantId, tenantId)
      ));
    } else if (domainId) {
      query = query.where(eq(agents.domainId, domainId));
    }
    
    const agentsList = await query;
    
    return {
      totalAgents: agentsList.length,
      onlineAgents: agentsList.filter(a => a.status === 'online').length,
      offlineAgents: agentsList.filter(a => a.status === 'offline').length,
      errorAgents: agentsList.filter(a => a.status === 'error').length,
      updatingAgents: agentsList.filter(a => a.status === 'updating').length,
      windowsAgents: agentsList.filter(a => a.operatingSystem.toLowerCase().includes('windows')).length,
      linuxAgents: agentsList.filter(a => a.operatingSystem.toLowerCase().includes('linux')).length,
      macosAgents: agentsList.filter(a => a.operatingSystem.toLowerCase().includes('mac')).length,
      averageHeartbeatAge: this.calculateAverageHeartbeatAge(agentsList),
    };
  }

  private calculateAverageHeartbeatAge(agents: Agent[]): number {
    const now = Date.now();
    const validHeartbeats = agents
      .filter(a => a.lastHeartbeat)
      .map(a => now - new Date(a.lastHeartbeat!).getTime());
    
    return validHeartbeats.length > 0 
      ? Math.round(validHeartbeats.reduce((sum, age) => sum + age, 0) / validHeartbeats.length / 1000)
      : 0;
  }

  // Enhanced Agent Deployment Job Methods
  async getAllAgentDeploymentJobsWithFilters(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    domainId?: number;
    tenantId?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ jobs: AgentDeploymentJob[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'desc';

    let query = db.select().from(agentDeploymentJobs);
    let countQuery = db.select({ count: sql`count(*)` }).from(agentDeploymentJobs);

    // Apply filters
    const conditions = [];
    
    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      conditions.push(
        or(
          sql`${agentDeploymentJobs.name} ILIKE ${searchTerm}`,
          sql`${agentDeploymentJobs.description} ILIKE ${searchTerm}`
        )
      );
    }
    
    if (options?.status) {
      conditions.push(eq(agentDeploymentJobs.status, options.status));
    }
    
    if (options?.domainId) {
      conditions.push(eq(agentDeploymentJobs.domainId, options.domainId));
    }
    
    if (options?.tenantId) {
      conditions.push(eq(agentDeploymentJobs.tenantId, options.tenantId));
    }
    
    if (options?.startDate) {
      conditions.push(gte(agentDeploymentJobs.createdAt, new Date(options.startDate)));
    }
    
    if (options?.endDate) {
      conditions.push(lte(agentDeploymentJobs.createdAt, new Date(options.endDate)));
    }

    if (conditions.length > 0) {
      const whereCondition = and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }

    // Apply sorting
    const sortColumn = sortBy === 'name' ? agentDeploymentJobs.name :
                      sortBy === 'status' ? agentDeploymentJobs.status :
                      sortBy === 'startedAt' ? agentDeploymentJobs.startedAt :
                      sortBy === 'completedAt' ? agentDeploymentJobs.completedAt :
                      agentDeploymentJobs.createdAt;
                      
    query = sortOrder === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));

    // Apply pagination
    const jobsList = await query.limit(limit).offset(offset);
    const [{ count }] = await countQuery;
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    return {
      jobs: jobsList,
      total,
      page,
      limit,
      totalPages
    };
  }

  async pauseAgentDeploymentJob(id: number): Promise<AgentDeploymentJob | undefined> {
    const [job] = await db
      .update(agentDeploymentJobs)
      .set({ 
        status: 'paused',
        updatedAt: new Date(),
      })
      .where(eq(agentDeploymentJobs.id, id))
      .returning();
    
    // Pause all in-progress deployment tasks
    await db
      .update(agentDeploymentTasks)
      .set({ 
        status: 'paused',
        updatedAt: new Date(),
      })
      .where(and(
        eq(agentDeploymentTasks.deploymentJobId, id),
        or(
          eq(agentDeploymentTasks.status, 'connecting'),
          eq(agentDeploymentTasks.status, 'downloading'),
          eq(agentDeploymentTasks.status, 'installing'),
          eq(agentDeploymentTasks.status, 'configuring')
        )
      ));
    
    return job || undefined;
  }

  async resumeAgentDeploymentJob(id: number): Promise<AgentDeploymentJob | undefined> {
    const [job] = await db
      .update(agentDeploymentJobs)
      .set({ 
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(agentDeploymentJobs.id, id))
      .returning();
    
    // Resume paused deployment tasks
    await db
      .update(agentDeploymentTasks)
      .set({ 
        status: 'pending',
        updatedAt: new Date(),
      })
      .where(and(
        eq(agentDeploymentTasks.deploymentJobId, id),
        eq(agentDeploymentTasks.status, 'paused')
      ));
    
    if (job) {
      // Restart processing of paused tasks
      this.processDeploymentTasks(id);
    }
    
    return job || undefined;
  }

  async getDeploymentJobLogs(jobId: number, options?: { page?: number; limit?: number; level?: string }): Promise<{ logs: any[]; total: number; page: number; limit: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 100;
    const offset = (page - 1) * limit;
    
    // Get all tasks for the job
    const tasks = await db
      .select()
      .from(agentDeploymentTasks)
      .where(eq(agentDeploymentTasks.deploymentJobId, jobId));
    
    // Collect all logs from all tasks
    let allLogs: any[] = [];
    
    for (const task of tasks) {
      if (task.deploymentLogs && Array.isArray(task.deploymentLogs)) {
        const taskLogs = task.deploymentLogs.map(log => ({
          ...log,
          taskId: task.id,
          targetHost: task.targetHost,
          targetIp: task.targetIp
        }));
        allLogs = allLogs.concat(taskLogs);
      }
    }
    
    // Filter by level if specified
    if (options?.level) {
      allLogs = allLogs.filter(log => log.level === options.level);
    }
    
    // Sort by timestamp
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const total = allLogs.length;
    const paginatedLogs = allLogs.slice(offset, offset + limit);
    
    return {
      logs: paginatedLogs,
      total,
      page,
      limit
    };
  }

  // Activity Log methods
  async getRecentActivities(limit: number = 50): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  async createActivity(insertActivity: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db.insert(activityLogs).values(insertActivity).returning();
    return activity;
  }

  async getActivitiesByType(type: string): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).where(eq(activityLogs.type, type)).orderBy(desc(activityLogs.createdAt));
  }

  // System Status methods
  async getSystemStatus(): Promise<SystemStatus[]> {
    return await db.select().from(systemStatus).orderBy(desc(systemStatus.updatedAt));
  }

  async updateSystemStatus(service: string, status: string, metrics?: any): Promise<SystemStatus | undefined> {
    const [existingStatus] = await db.select().from(systemStatus).where(eq(systemStatus.service, service));
    
    if (existingStatus) {
      const [updatedStatus] = await db
        .update(systemStatus)
        .set({ 
          status, 
          metrics: metrics || existingStatus.metrics,
          lastCheck: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(systemStatus.service, service))
        .returning();
      return updatedStatus || undefined;
    } else {
      const [newStatus] = await db
        .insert(systemStatus)
        .values({ 
          service, 
          status, 
          metrics: metrics || {},
          lastCheck: new Date() 
        })
        .returning();
      return newStatus;
    }
  }

  // Dashboard Statistics methods
  async getDashboardStats(): Promise<DashboardStats | undefined> {
    const [stats] = await db.select().from(dashboardStats).orderBy(desc(dashboardStats.createdAt)).limit(1);
    return stats || undefined;
  }

  async updateDashboardStats(insertStats: InsertDashboardStats): Promise<DashboardStats> {
    const [stats] = await db.insert(dashboardStats).values(insertStats).returning();
    return stats;
  }

  async getDashboardStatsByDateRange(startDate: Date, endDate: Date): Promise<DashboardStats[]> {
    return await db
      .select()
      .from(dashboardStats)
      .where(
        and(
          gte(dashboardStats.date, startDate),
          lte(dashboardStats.date, endDate)
        )
      )
      .orderBy(desc(dashboardStats.date));
  }

  // ===== ASSET INVENTORY METHODS =====
  async getAllAssetInventory(): Promise<AssetInventory[]> {
    return await db.select().from(assetInventory).orderBy(desc(assetInventory.createdAt));
  }

  async getAssetInventoryById(id: number): Promise<AssetInventory | undefined> {
    const [asset] = await db.select().from(assetInventory).where(eq(assetInventory.id, id));
    return asset || undefined;
  }

  async createAssetInventory(asset: InsertAssetInventory): Promise<AssetInventory> {
    const [newAsset] = await db.insert(assetInventory).values(asset).returning();
    return newAsset;
  }

  async updateAssetInventory(id: number, asset: Partial<InsertAssetInventory>): Promise<AssetInventory | undefined> {
    const [updatedAsset] = await db
      .update(assetInventory)
      .set({ ...asset, updatedAt: new Date() })
      .where(eq(assetInventory.id, id))
      .returning();
    return updatedAsset || undefined;
  }

  async deleteAssetInventory(id: number): Promise<boolean> {
    const result = await db.delete(assetInventory).where(eq(assetInventory.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async bulkUpdateAssetInventory(assetIds: number[], updates: Partial<InsertAssetInventory>): Promise<AssetInventory[]> {
    const results = [];
    for (const id of assetIds) {
      const [updatedAsset] = await db
        .update(assetInventory)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(assetInventory.id, id))
        .returning();
      if (updatedAsset) {
        results.push(updatedAsset);
      }
    }
    return results;
  }

  async bulkDeleteAssetInventory(assetIds: number[]): Promise<boolean> {
    let deletedCount = 0;
    for (const id of assetIds) {
      const result = await db.delete(assetInventory).where(eq(assetInventory.id, id));
      if ((result.rowCount ?? 0) > 0) {
        deletedCount++;
      }
    }
    return deletedCount === assetIds.length;
  }

  // ===== ENHANCED ENTERPRISE ASSET INVENTORY METHODS =====
  async getAssetInventoryWithFilters(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    category?: string;
    criticality?: string;
    domainId?: number;
    tenantId?: number;
    search?: string;
  }): Promise<{
    assets: AssetInventory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    // Build the base query
    let query = db.select().from(assetInventory);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(assetInventory);

    // Build WHERE conditions
    const conditions = [];
    
    if (options.status) {
      conditions.push(eq(assetInventory.status, options.status));
    }
    
    if (options.category) {
      conditions.push(eq(assetInventory.category, options.category));
    }
    
    if (options.criticality) {
      conditions.push(eq(assetInventory.criticality, options.criticality));
    }
    
    if (options.domainId) {
      conditions.push(eq(assetInventory.domainId, options.domainId));
    }
    
    if (options.tenantId) {
      conditions.push(eq(assetInventory.tenantId, options.tenantId));
    }
    
    if (options.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          sql`${assetInventory.name} ILIKE ${searchPattern}`,
          sql`${assetInventory.hostname} ILIKE ${searchPattern}`,
          sql`${assetInventory.ipAddress} ILIKE ${searchPattern}`,
          sql`${assetInventory.description} ILIKE ${searchPattern}`
        )
      );
    }

    // Apply WHERE conditions
    if (conditions.length > 0) {
      const whereClause = and(...conditions);
      query = query.where(whereClause);
      countQuery = countQuery.where(whereClause);
    }

    // Apply sorting
    const sortColumn = assetInventory[sortBy as keyof typeof assetInventory] || assetInventory.createdAt;
    query = query.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn));

    // Apply pagination
    query = query.limit(limit).offset(offset);

    // Execute queries
    const [assets, totalResult] = await Promise.all([
      query,
      countQuery
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      assets,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getAssetInventoryByTenant(tenantId: number): Promise<AssetInventory[]> {
    return await db.select().from(assetInventory)
      .where(eq(assetInventory.tenantId, tenantId))
      .orderBy(desc(assetInventory.createdAt));
  }

  async getAssetInventoryByDomain(domainId: number): Promise<AssetInventory[]> {
    return await db.select().from(assetInventory)
      .where(eq(assetInventory.domainId, domainId))
      .orderBy(desc(assetInventory.createdAt));
  }

  // ===== ASSET CUSTOM FIELDS METHODS =====
  async getAllAssetCustomFields(): Promise<AssetCustomField[]> {
    return await db.select().from(assetCustomFields).orderBy(assetCustomFields.displayOrder);
  }

  async getAssetCustomFieldById(id: number): Promise<AssetCustomField | undefined> {
    const [field] = await db.select().from(assetCustomFields).where(eq(assetCustomFields.id, id));
    return field || undefined;
  }

  async createAssetCustomField(field: InsertAssetCustomField): Promise<AssetCustomField> {
    const [newField] = await db.insert(assetCustomFields).values(field).returning();
    return newField;
  }

  async updateAssetCustomField(id: number, field: Partial<InsertAssetCustomField>): Promise<AssetCustomField | undefined> {
    const [updatedField] = await db
      .update(assetCustomFields)
      .set({ ...field, updatedAt: new Date() })
      .where(eq(assetCustomFields.id, id))
      .returning();
    return updatedField || undefined;
  }

  async deleteAssetCustomField(id: number): Promise<boolean> {
    const result = await db.delete(assetCustomFields).where(eq(assetCustomFields.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Enhanced Custom Fields methods with tenant scoping
  async getAssetCustomFieldsByTenant(tenantId?: number): Promise<AssetCustomField[]> {
    if (tenantId) {
      return await db.select().from(assetCustomFields)
        .where(eq(assetCustomFields.tenantId, tenantId))
        .orderBy(assetCustomFields.displayOrder);
    }
    return await this.getAllAssetCustomFields();
  }

  async getAssetCustomFieldsByDomain(domainId?: number): Promise<AssetCustomField[]> {
    if (domainId) {
      return await db.select().from(assetCustomFields)
        .where(eq(assetCustomFields.domainId, domainId))
        .orderBy(assetCustomFields.displayOrder);
    }
    return await this.getAllAssetCustomFields();
  }

  // ===== ASSET TABLE VIEWS METHODS =====
  async getAllAssetTableViews(): Promise<AssetTableView[]> {
    return await db.select().from(assetTableViews).orderBy(desc(assetTableViews.createdAt));
  }

  async getAssetTableViewById(id: number): Promise<AssetTableView | undefined> {
    const [view] = await db.select().from(assetTableViews).where(eq(assetTableViews.id, id));
    return view || undefined;
  }

  async createAssetTableView(view: InsertAssetTableView): Promise<AssetTableView> {
    const [newView] = await db.insert(assetTableViews).values(view).returning();
    return newView;
  }

  async updateAssetTableView(id: number, view: Partial<InsertAssetTableView>): Promise<AssetTableView | undefined> {
    const [updatedView] = await db
      .update(assetTableViews)
      .set({ ...view, updatedAt: new Date() })
      .where(eq(assetTableViews.id, id))
      .returning();
    return updatedView || undefined;
  }

  async deleteAssetTableView(id: number): Promise<boolean> {
    const result = await db.delete(assetTableViews).where(eq(assetTableViews.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Enhanced Table Views methods with user scoping
  async getAssetTableViewsByUser(userId: number): Promise<AssetTableView[]> {
    return await db.select().from(assetTableViews)
      .where(eq(assetTableViews.createdBy, userId))
      .orderBy(desc(assetTableViews.createdAt));
  }

  async getAssetTableViewsByTenant(tenantId?: number): Promise<AssetTableView[]> {
    if (tenantId) {
      return await db.select().from(assetTableViews)
        .where(eq(assetTableViews.tenantId, tenantId))
        .orderBy(desc(assetTableViews.createdAt));
    }
    return await this.getAllAssetTableViews();
  }

  // ===== ASSET AUDIT LOGS METHODS =====
  async getAssetAuditLogs(assetId: number): Promise<AssetAuditLog[]> {
    return await db.select().from(assetAuditLogs)
      .where(eq(assetAuditLogs.assetId, assetId))
      .orderBy(desc(assetAuditLogs.timestamp));
  }

  async createAssetAuditLog(log: InsertAssetAuditLog): Promise<AssetAuditLog> {
    const [newLog] = await db.insert(assetAuditLogs).values(log).returning();
    return newLog;
  }

  // Enhanced Asset Audit Logs with pagination and filtering
  async getAllAssetAuditLogs(options?: {
    page?: number;
    limit?: number;
    userId?: number;
    assetId?: number;
    action?: string;
  }): Promise<{
    logs: AssetAuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;

    // Build the base query
    let query = db.select().from(assetAuditLogs);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(assetAuditLogs);

    // Build WHERE conditions
    const conditions = [];
    
    if (options?.userId) {
      conditions.push(eq(assetAuditLogs.userId, options.userId));
    }
    
    if (options?.assetId) {
      conditions.push(eq(assetAuditLogs.assetId, options.assetId));
    }
    
    if (options?.action) {
      conditions.push(eq(assetAuditLogs.action, options.action));
    }

    // Apply WHERE conditions
    if (conditions.length > 0) {
      const whereClause = and(...conditions);
      query = query.where(whereClause);
      countQuery = countQuery.where(whereClause);
    }

    // Apply sorting and pagination
    query = query.orderBy(desc(assetAuditLogs.timestamp)).limit(limit).offset(offset);

    // Execute queries
    const [logs, totalResult] = await Promise.all([
      query,
      countQuery
    ]);

    const total = totalResult[0]?.count || 0;

    return {
      logs,
      total,
      page,
      limit
    };
  }

  // External Integration methods
  async getAllExternalSystems(): Promise<any[]> {
    // Placeholder implementation - would return external systems from database
    return [];
  }

  async createExternalSystem(system: any): Promise<any> {
    // Placeholder implementation
    return system;
  }

  async updateExternalSystem(id: string, system: any): Promise<any> {
    // Placeholder implementation
    return system;
  }

  async deleteExternalSystem(id: string): Promise<boolean> {
    // Placeholder implementation
    return true;
  }

  async testExternalSystemConnection(id: string): Promise<any> {
    // Placeholder implementation
    return { success: true, message: "Connection test successful" };
  }

  async getIntegrationLogs(limit?: number): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async getIntegrationLogsByAsset(assetId: number): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async getAllIntegrationRules(): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  async createIntegrationRule(rule: any): Promise<any> {
    // Placeholder implementation
    return rule;
  }

  async updateIntegrationRule(id: number, rule: any): Promise<any> {
    // Placeholder implementation
    return rule;
  }

  async deleteIntegrationRule(id: number): Promise<boolean> {
    // Placeholder implementation
    return true;
  }

  // ===== AGENT DEPLOYMENT JOB METHODS =====
  
  async getAgentDeploymentJobs(domainId?: number, tenantId?: number): Promise<AgentDeploymentJob[]> {
    let query = db.select().from(agentDeploymentJobs);
    
    if (domainId && tenantId) {
      query = query.where(and(
        eq(agentDeploymentJobs.domainId, domainId),
        eq(agentDeploymentJobs.tenantId, tenantId)
      ));
    } else if (domainId) {
      query = query.where(eq(agentDeploymentJobs.domainId, domainId));
    }
    
    return await query.orderBy(desc(agentDeploymentJobs.createdAt));
  }

  async getAgentDeploymentJobById(id: number): Promise<AgentDeploymentJob | undefined> {
    const [job] = await db.select().from(agentDeploymentJobs).where(eq(agentDeploymentJobs.id, id));
    return job || undefined;
  }

  async createAgentDeploymentJob(job: InsertAgentDeploymentJob): Promise<AgentDeploymentJob> {
    const [newJob] = await db.insert(agentDeploymentJobs).values(job).returning();
    
    // Create initial deployment tasks based on targets
    if (newJob.targets) {
      const tasks: InsertAgentDeploymentTask[] = [];
      
      // Process IP ranges
      if (newJob.targets.ipRanges) {
        for (const range of newJob.targets.ipRanges) {
          // Simulate IP range expansion (in production, use proper IP range parsing)
          const ipCount = Math.floor(Math.random() * 10) + 2; // 2-11 IPs per range
          for (let i = 0; i < ipCount; i++) {
            const baseIp = range.split('-')[0] || range.split('/')[0] || range;
            const targetIp = baseIp.replace(/\d+$/, String(Math.floor(Math.random() * 254) + 1));
            tasks.push({
              deploymentJobId: newJob.id,
              targetHost: `host-${targetIp.replace(/\./g, '-')}`,
              targetIp: targetIp,
              targetOs: newJob.targetOs,
              status: 'pending',
              attemptCount: 0,
              maxRetries: 3,
            });
          }
        }
      }
      
      // Process hostnames
      if (newJob.targets.hostnames) {
        for (const hostname of newJob.targets.hostnames) {
          tasks.push({
            deploymentJobId: newJob.id,
            targetHost: hostname,
            targetIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
            targetOs: newJob.targetOs,
            status: 'pending',
            attemptCount: 0,
            maxRetries: 3,
          });
        }
      }
      
      // Process IP segments
      if (newJob.targets.ipSegments) {
        for (const segment of newJob.targets.ipSegments) {
          const segmentCount = Math.floor(Math.random() * 8) + 3; // 3-10 IPs per segment
          for (let i = 0; i < segmentCount; i++) {
            const targetIp = segment.replace(/\d+\/\d+$/, `${Math.floor(Math.random() * 254) + 1}`);
            tasks.push({
              deploymentJobId: newJob.id,
              targetHost: `host-${targetIp.replace(/\./g, '-')}`,
              targetIp: targetIp,
              targetOs: newJob.targetOs,
              status: 'pending',
              attemptCount: 0,
              maxRetries: 3,
            });
          }
        }
      }
      
      // Create deployment tasks
      if (tasks.length > 0) {
        await db.insert(agentDeploymentTasks).values(tasks);
      }
      
      // Update job progress
      await db.update(agentDeploymentJobs)
        .set({
          progress: {
            totalTargets: tasks.length,
            successfulDeployments: 0,
            failedDeployments: 0,
            pendingDeployments: tasks.length,
            currentTarget: '',
            estimatedTimeRemaining: tasks.length * 30, // 30 seconds per target estimate
          },
          updatedAt: new Date(),
        })
        .where(eq(agentDeploymentJobs.id, newJob.id));
    }
    
    return newJob;
  }

  async updateAgentDeploymentJob(id: number, job: Partial<InsertAgentDeploymentJob>): Promise<AgentDeploymentJob | undefined> {
    const [updatedJob] = await db
      .update(agentDeploymentJobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(agentDeploymentJobs.id, id))
      .returning();
    return updatedJob || undefined;
  }

  async startAgentDeploymentJob(id: number): Promise<AgentDeploymentJob | undefined> {
    const [job] = await db
      .update(agentDeploymentJobs)
      .set({ 
        status: 'in_progress',
        startedAt: new Date(),
        lastHeartbeat: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentDeploymentJobs.id, id))
      .returning();
    
    if (job) {
      // Start processing deployment tasks asynchronously
      this.processDeploymentTasks(id);
    }
    
    return job || undefined;
  }

  async cancelAgentDeploymentJob(id: number): Promise<AgentDeploymentJob | undefined> {
    const [job] = await db
      .update(agentDeploymentJobs)
      .set({ 
        status: 'cancelled',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentDeploymentJobs.id, id))
      .returning();
    
    // Cancel all pending deployment tasks
    await db
      .update(agentDeploymentTasks)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(and(
        eq(agentDeploymentTasks.deploymentJobId, id),
        eq(agentDeploymentTasks.status, 'pending')
      ));
    
    return job || undefined;
  }

  async updateDeploymentProgress(id: number, progress: any): Promise<AgentDeploymentJob | undefined> {
    const [job] = await db
      .update(agentDeploymentJobs)
      .set({ 
        progress: progress,
        lastHeartbeat: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentDeploymentJobs.id, id))
      .returning();
    return job || undefined;
  }

  async getDeploymentStatusSummary(jobId: number): Promise<any> {
    const job = await this.getAgentDeploymentJobById(jobId);
    if (!job) return null;
    
    const tasks = await db
      .select()
      .from(agentDeploymentTasks)
      .where(eq(agentDeploymentTasks.deploymentJobId, jobId));
    
    const summary = {
      jobId: jobId,
      status: job.status,
      totalTargets: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'connecting' || t.status === 'downloading' || t.status === 'installing').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      estimatedTimeRemaining: job.progress?.estimatedTimeRemaining || 0,
    };
    
    return summary;
  }

  async getDeploymentErrorLogs(jobId: number): Promise<any[]> {
    const tasks = await db
      .select()
      .from(agentDeploymentTasks)
      .where(and(
        eq(agentDeploymentTasks.deploymentJobId, jobId),
        eq(agentDeploymentTasks.status, 'failed')
      ));
    
    return tasks.map(task => ({
      taskId: task.id,
      targetHost: task.targetHost,
      targetIp: task.targetIp,
      errorMessage: task.errorMessage,
      errorCode: task.errorCode,
      errorDetails: task.errorDetails,
      attemptCount: task.attemptCount,
      lastAttempt: task.updatedAt,
    }));
  }

  async getAgentDeploymentStats(domainId?: number, tenantId?: number): Promise<any> {
    let jobsQuery = db.select().from(agentDeploymentJobs);
    
    if (domainId && tenantId) {
      jobsQuery = jobsQuery.where(and(
        eq(agentDeploymentJobs.domainId, domainId),
        eq(agentDeploymentJobs.tenantId, tenantId)
      ));
    } else if (domainId) {
      jobsQuery = jobsQuery.where(eq(agentDeploymentJobs.domainId, domainId));
    }
    
    const jobs = await jobsQuery;
    const tasks = await db.select().from(agentDeploymentTasks);
    
    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'in_progress').length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      totalTargets: tasks.length,
      successfulDeployments: tasks.filter(t => t.status === 'completed').length,
      failedDeployments: tasks.filter(t => t.status === 'failed').length,
      averageDeploymentTime: 45, // seconds (simulated)
      successRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length * 100) : 0,
    };
  }

  // ===== AGENT DEPLOYMENT TASK METHODS =====
  
  async getAgentDeploymentTasks(jobId: number): Promise<AgentDeploymentTask[]> {
    return await db
      .select()
      .from(agentDeploymentTasks)
      .where(eq(agentDeploymentTasks.deploymentJobId, jobId))
      .orderBy(desc(agentDeploymentTasks.createdAt));
  }

  async getAgentDeploymentTaskById(id: number): Promise<AgentDeploymentTask | undefined> {
    const [task] = await db.select().from(agentDeploymentTasks).where(eq(agentDeploymentTasks.id, id));
    return task || undefined;
  }

  async createAgentDeploymentTask(task: InsertAgentDeploymentTask): Promise<AgentDeploymentTask> {
    const [newTask] = await db.insert(agentDeploymentTasks).values(task).returning();
    return newTask;
  }

  async updateAgentDeploymentTask(id: number, task: Partial<InsertAgentDeploymentTask>): Promise<AgentDeploymentTask | undefined> {
    const [updatedTask] = await db
      .update(agentDeploymentTasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(agentDeploymentTasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async retryAgentDeploymentTask(id: number): Promise<AgentDeploymentTask | undefined> {
    const task = await this.getAgentDeploymentTaskById(id);
    if (!task || task.attemptCount >= task.maxRetries) {
      return undefined;
    }
    
    const [retryTask] = await db
      .update(agentDeploymentTasks)
      .set({ 
        status: 'pending',
        attemptCount: task.attemptCount + 1,
        errorMessage: null,
        errorCode: null,
        updatedAt: new Date(),
      })
      .where(eq(agentDeploymentTasks.id, id))
      .returning();
    
    // Trigger deployment processing
    if (retryTask) {
      setTimeout(() => this.processIndividualDeploymentTask(id), 1000);
    }
    
    return retryTask || undefined;
  }

  async repairAgentInstallation(id: number): Promise<AgentDeploymentTask | undefined> {
    const task = await this.getAgentDeploymentTaskById(id);
    if (!task) return undefined;
    
    const [repairedTask] = await db
      .update(agentDeploymentTasks)
      .set({ 
        status: 'pending',
        currentStep: 'repair',
        errorMessage: null,
        errorCode: null,
        updatedAt: new Date(),
      })
      .where(eq(agentDeploymentTasks.id, id))
      .returning();
    
    // Trigger repair process
    if (repairedTask) {
      setTimeout(() => this.processAgentRepair(id), 1000);
    }
    
    return repairedTask || undefined;
  }

  async createActivityLog(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLogs).values(activity).returning();
    return newActivity;
  }

  // ===== PRIVATE HELPER METHODS =====
  
  private async processDeploymentTasks(jobId: number): Promise<void> {
    // Simulate asynchronous deployment processing
    const tasks = await this.getAgentDeploymentTasks(jobId);
    
    for (const task of tasks.filter(t => t.status === 'pending')) {
      setTimeout(() => this.processIndividualDeploymentTask(task.id), Math.random() * 5000);
    }
  }

  private async processIndividualDeploymentTask(taskId: number): Promise<void> {
    const task = await this.getAgentDeploymentTaskById(taskId);
    if (!task || task.status !== 'pending') return;
    
    try {
      // Simulate deployment steps
      const steps = ['connecting', 'downloading', 'installing', 'configuring', 'verifying'];
      
      for (const step of steps) {
        await this.updateAgentDeploymentTask(taskId, {
          status: step as any,
          currentStep: step,
        });
        
        // Simulate step duration
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        
        // Simulate random failures (10% failure rate)
        if (Math.random() < 0.1) {
          await this.updateAgentDeploymentTask(taskId, {
            status: 'failed',
            errorMessage: `Failed during ${step} phase`,
            errorCode: `ERR_${step.toUpperCase()}_FAILED`,
            errorDetails: {
              phase: step,
              originalError: `Network timeout during ${step}`,
              systemInfo: { os: task.targetOs, architecture: 'x64' },
              networkInfo: { latency: Math.random() * 100 + 50 },
              suggestedFix: `Check network connectivity and retry`,
            },
          });
          return;
        }
      }
      
      // Successful completion
      await this.updateAgentDeploymentTask(taskId, {
        status: 'completed',
        currentStep: 'completed',
        agentId: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        installedVersion: '2.1.0',
        installationPath: task.targetOs === 'windows' ? 'C:\\Program Files\\Agent' : '/opt/agent',
        serviceStatus: 'running',
        completedAt: new Date(),
        lastContactAt: new Date(),
      });
      
      // Update job progress
      await this.updateJobProgress(task.deploymentJobId);
      
    } catch (error) {
      await this.updateAgentDeploymentTask(taskId, {
        status: 'failed',
        errorMessage: 'Unexpected deployment error',
        errorCode: 'ERR_DEPLOYMENT_FAILED',
      });
    }
  }

  private async processAgentRepair(taskId: number): Promise<void> {
    // Simulate agent repair process
    setTimeout(async () => {
      const repairSuccess = Math.random() > 0.3; // 70% repair success rate
      
      if (repairSuccess) {
        await this.updateAgentDeploymentTask(taskId, {
          status: 'completed',
          currentStep: 'repaired',
          serviceStatus: 'running',
          errorMessage: null,
          errorCode: null,
          lastContactAt: new Date(),
        });
      } else {
        await this.updateAgentDeploymentTask(taskId, {
          status: 'failed',
          errorMessage: 'Agent repair failed - manual intervention required',
          errorCode: 'ERR_REPAIR_FAILED',
        });
      }
    }, Math.random() * 3000 + 1000);
  }

  private async updateJobProgress(jobId: number): Promise<void> {
    const tasks = await this.getAgentDeploymentTasks(jobId);
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => ['connecting', 'downloading', 'installing', 'configuring', 'verifying'].includes(t.status)).length;
    
    const progress = {
      totalTargets: tasks.length,
      successfulDeployments: completed,
      failedDeployments: failed,
      pendingDeployments: pending + inProgress,
      currentTarget: inProgress > 0 ? tasks.find(t => ['connecting', 'downloading', 'installing', 'configuring', 'verifying'].includes(t.status))?.targetHost || '' : '',
      estimatedTimeRemaining: (pending + inProgress) * 30,
    };
    
    let status = 'in_progress';
    if (pending + inProgress === 0) {
      status = failed > 0 ? (completed > 0 ? 'partially_completed' : 'failed') : 'completed';
    }
    
    await db.update(agentDeploymentJobs)
      .set({
        status: status as any,
        progress: progress,
        completedAt: status !== 'in_progress' ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(agentDeploymentJobs.id, jobId));
  }

  // ===== STANDARD SCRIPT TEMPLATE METHODS =====
  async getAllStandardScriptTemplates(): Promise<StandardScriptTemplate[]> {
    return await db.select().from(standardScriptTemplates).orderBy(desc(standardScriptTemplates.createdAt));
  }

  async getStandardScriptTemplateById(id: number): Promise<StandardScriptTemplate | undefined> {
    const [template] = await db.select().from(standardScriptTemplates).where(eq(standardScriptTemplates.id, id));
    return template || undefined;
  }

  async getStandardScriptTemplatesByCategory(category: string): Promise<StandardScriptTemplate[]> {
    return await db.select().from(standardScriptTemplates)
      .where(eq(standardScriptTemplates.category, category))
      .orderBy(desc(standardScriptTemplates.createdAt));
  }

  async getStandardScriptTemplatesByType(type: string): Promise<StandardScriptTemplate[]> {
    return await db.select().from(standardScriptTemplates)
      .where(eq(standardScriptTemplates.type, type))
      .orderBy(desc(standardScriptTemplates.createdAt));
  }

  async createStandardScriptTemplate(template: InsertStandardScriptTemplate): Promise<StandardScriptTemplate> {
    const [created] = await db.insert(standardScriptTemplates).values(template).returning();
    return created;
  }

  async updateStandardScriptTemplate(id: number, template: Partial<InsertStandardScriptTemplate>): Promise<StandardScriptTemplate | undefined> {
    const [updated] = await db.update(standardScriptTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(standardScriptTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStandardScriptTemplate(id: number): Promise<boolean> {
    const result = await db.delete(standardScriptTemplates).where(eq(standardScriptTemplates.id, id));
    return result.rowCount > 0;
  }

  // ===== SCRIPT ORCHESTRATOR PROFILE METHODS =====
  async getAllScriptOrchestratorProfiles(): Promise<ScriptOrchestratorProfile[]> {
    return await db.select().from(scriptOrchestratorProfiles).orderBy(desc(scriptOrchestratorProfiles.createdAt));
  }

  async getScriptOrchestratorProfileById(id: number): Promise<ScriptOrchestratorProfile | undefined> {
    const [profile] = await db.select().from(scriptOrchestratorProfiles).where(eq(scriptOrchestratorProfiles.id, id));
    return profile || undefined;
  }

  async createScriptOrchestratorProfile(profile: InsertScriptOrchestratorProfile): Promise<ScriptOrchestratorProfile> {
    const [created] = await db.insert(scriptOrchestratorProfiles).values(profile).returning();
    return created;
  }

  async updateScriptOrchestratorProfile(id: number, profile: Partial<InsertScriptOrchestratorProfile>): Promise<ScriptOrchestratorProfile | undefined> {
    const [updated] = await db.update(scriptOrchestratorProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(scriptOrchestratorProfiles.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteScriptOrchestratorProfile(id: number): Promise<boolean> {
    const result = await db.delete(scriptOrchestratorProfiles).where(eq(scriptOrchestratorProfiles.id, id));
    return result.rowCount > 0;
  }

  // ===== AGENT STATUS REPORT METHODS =====
  async getAllAgentStatusReports(): Promise<AgentStatusReport[]> {
    return await db.select().from(agentStatusReports).orderBy(desc(agentStatusReports.lastHeartbeat));
  }

  async getAgentStatusReportById(id: number): Promise<AgentStatusReport | undefined> {
    const [report] = await db.select().from(agentStatusReports).where(eq(agentStatusReports.id, id));
    return report || undefined;
  }

  async getAgentStatusReportByAgentId(agentId: string): Promise<AgentStatusReport | undefined> {
    const [report] = await db.select().from(agentStatusReports).where(eq(agentStatusReports.agentId, agentId));
    return report || undefined;
  }

  async createAgentStatusReport(report: InsertAgentStatusReport): Promise<AgentStatusReport> {
    const [created] = await db.insert(agentStatusReports).values(report).returning();
    return created;
  }

  async updateAgentStatusReport(id: number, report: Partial<InsertAgentStatusReport>): Promise<AgentStatusReport | undefined> {
    const [updated] = await db.update(agentStatusReports)
      .set({ ...report, updatedAt: new Date() })
      .where(eq(agentStatusReports.id, id))
      .returning();
    return updated || undefined;
  }

  async upsertAgentStatusReport(agentId: string, report: Partial<InsertAgentStatusReport>): Promise<AgentStatusReport> {
    const existing = await this.getAgentStatusReportByAgentId(agentId);
    if (existing) {
      const updated = await this.updateAgentStatusReport(existing.id, report);
      return updated!;
    } else {
      const newReport = { ...report, agentId } as InsertAgentStatusReport;
      return await this.createAgentStatusReport(newReport);
    }
  }

  async deleteAgentStatusReport(id: number): Promise<boolean> {
    const result = await db.delete(agentStatusReports).where(eq(agentStatusReports.id, id));
    return result.rowCount > 0;
  }

  async getAgentStatusByDomain(domainId: number): Promise<AgentStatusReport[]> {
    return await db.select().from(agentStatusReports)
      .where(eq(agentStatusReports.domainId, domainId))
      .orderBy(desc(agentStatusReports.lastHeartbeat));
  }

  async getAgentStatusByTenant(tenantId: number): Promise<AgentStatusReport[]> {
    return await db.select().from(agentStatusReports)
      .where(eq(agentStatusReports.tenantId, tenantId))
      .orderBy(desc(agentStatusReports.lastHeartbeat));
  }

  // ===== COMPREHENSIVE SETTINGS MANAGEMENT IMPLEMENTATION =====

  // ===== SETTINGS CATEGORIES METHODS =====
  async getAllSettingsCategories(): Promise<SettingsCategory[]> {
    return await db.select().from(settingsCategories)
      .orderBy(asc(settingsCategories.orderIndex), asc(settingsCategories.displayName));
  }

  async getSettingsCategoryById(id: number): Promise<SettingsCategory | undefined> {
    const [category] = await db.select().from(settingsCategories).where(eq(settingsCategories.id, id));
    return category || undefined;
  }

  async getSettingsCategoryByName(name: string): Promise<SettingsCategory | undefined> {
    const [category] = await db.select().from(settingsCategories).where(eq(settingsCategories.name, name));
    return category || undefined;
  }

  async createSettingsCategory(category: InsertSettingsCategory): Promise<SettingsCategory> {
    const [newCategory] = await db.insert(settingsCategories).values(category).returning();
    return newCategory;
  }

  async updateSettingsCategory(id: number, category: Partial<InsertSettingsCategory>): Promise<SettingsCategory | undefined> {
    const [updated] = await db.update(settingsCategories)
      .set({ ...category, updatedAt: new Date() })
      .where(eq(settingsCategories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSettingsCategory(id: number): Promise<boolean> {
    // Prevent deletion of system categories
    const category = await this.getSettingsCategoryById(id);
    if (category?.isSystem) {
      throw new Error('Cannot delete system category');
    }
    const result = await db.delete(settingsCategories).where(eq(settingsCategories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ===== GLOBAL SETTINGS METHODS =====
  async getAllGlobalSettings(options: {
    category?: string;
    accessLevel?: string;
    isInheritable?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ settings: GlobalSetting[]; total: number; page: number; limit: number; totalPages: number }> {
    const { category, accessLevel, isInheritable, page = 1, limit = 100 } = options;
    
    let query = db.select().from(globalSettings);
    const conditions = [];

    if (category) {
      conditions.push(eq(globalSettings.category, category));
    }
    if (accessLevel) {
      conditions.push(eq(globalSettings.accessLevel, accessLevel));
    }
    if (isInheritable !== undefined) {
      conditions.push(eq(globalSettings.isInheritable, isInheritable));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Get total count
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(globalSettings);
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const [{ count }] = await countQuery;

    // Get paginated results
    const settings = await query
      .orderBy(asc(globalSettings.category), asc(globalSettings.key))
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      settings,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async getGlobalSettingById(id: number): Promise<GlobalSetting | undefined> {
    const [setting] = await db.select().from(globalSettings).where(eq(globalSettings.id, id));
    return setting || undefined;
  }

  async getGlobalSettingByKey(key: string): Promise<GlobalSetting | undefined> {
    const [setting] = await db.select().from(globalSettings).where(eq(globalSettings.key, key));
    return setting || undefined;
  }

  async getGlobalSettingsByCategory(category: string): Promise<GlobalSetting[]> {
    return await db.select().from(globalSettings)
      .where(eq(globalSettings.category, category))
      .orderBy(asc(globalSettings.key));
  }

  async createGlobalSetting(setting: InsertGlobalSetting): Promise<GlobalSetting> {
    const [newSetting] = await db.insert(globalSettings).values(setting).returning();
    
    // Create audit log
    await this.createSettingsAuditLog({
      settingKey: newSetting.key,
      settingScope: 'global',
      scopeId: null,
      globalSettingId: newSetting.id,
      action: 'create',
      oldValue: null,
      newValue: newSetting.value,
      userId: setting.lastModifiedBy || null,
      userName: null,
      userRole: null,
    });

    return newSetting;
  }

  async updateGlobalSetting(id: number, setting: Partial<InsertGlobalSetting>, userId?: number): Promise<GlobalSetting | undefined> {
    const existing = await this.getGlobalSettingById(id);
    if (!existing) return undefined;

    const [updated] = await db.update(globalSettings)
      .set({ 
        ...setting, 
        lastModifiedBy: userId,
        lastModifiedAt: new Date(),
        version: (existing.version || 1) + 1,
        updatedAt: new Date()
      })
      .where(eq(globalSettings.id, id))
      .returning();

    if (updated && setting.value !== undefined) {
      // Create audit log
      await this.createSettingsAuditLog({
        settingKey: updated.key,
        settingScope: 'global',
        scopeId: null,
        globalSettingId: updated.id,
        action: 'update',
        oldValue: existing.value,
        newValue: updated.value,
        userId: userId || null,
        userName: null,
        userRole: null,
      });
    }

    return updated || undefined;
  }

  async updateGlobalSettingByKey(key: string, value: any, userId?: number): Promise<GlobalSetting | undefined> {
    const existing = await this.getGlobalSettingByKey(key);
    if (!existing) return undefined;

    return await this.updateGlobalSetting(existing.id, { value }, userId);
  }

  async deleteGlobalSetting(id: number): Promise<boolean> {
    const setting = await this.getGlobalSettingById(id);
    if (!setting) return false;

    const result = await db.delete(globalSettings).where(eq(globalSettings.id, id));
    
    if ((result.rowCount ?? 0) > 0) {
      // Create audit log
      await this.createSettingsAuditLog({
        settingKey: setting.key,
        settingScope: 'global',
        scopeId: null,
        globalSettingId: setting.id,
        action: 'delete',
        oldValue: setting.value,
        newValue: null,
        userId: null,
        userName: null,
        userRole: null,
      });
    }

    return (result.rowCount ?? 0) > 0;
  }

  async bulkUpdateGlobalSettings(updates: Array<{ key: string; value: any }>, userId?: number): Promise<GlobalSetting[]> {
    const results: GlobalSetting[] = [];
    
    for (const update of updates) {
      const result = await this.updateGlobalSettingByKey(update.key, update.value, userId);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  async resetGlobalSettingsToDefaults(category?: string): Promise<GlobalSetting[]> {
    let query = db.select().from(globalSettings);
    if (category) {
      query = query.where(eq(globalSettings.category, category));
    }
    
    const settings = await query;
    const results: GlobalSetting[] = [];
    
    for (const setting of settings) {
      if (setting.defaultValue !== null) {
        const updated = await this.updateGlobalSetting(setting.id, { 
          value: setting.defaultValue 
        });
        if (updated) {
          results.push(updated);
        }
      }
    }
    
    return results;
  }

  async getGlobalSettingsSchema(): Promise<any> {
    const settings = await this.getAllGlobalSettings();
    const schema: any = {};
    
    for (const setting of settings.settings) {
      schema[setting.key] = {
        displayName: setting.displayName,
        description: setting.description,
        dataType: setting.dataType,
        defaultValue: setting.defaultValue,
        validationRules: setting.validationRules,
        uiHints: setting.uiHints,
        isInheritable: setting.isInheritable,
        requiresRestart: setting.requiresRestart,
        accessLevel: setting.accessLevel,
        securityLevel: setting.securityLevel,
        category: setting.category,
      };
    }
    
    return schema;
  }

  // ===== DOMAIN SETTINGS METHODS =====
  async getDomainSettings(domainId: number, options: {
    includeInherited?: boolean;
    category?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ settings: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const { includeInherited = true, category, page = 1, limit = 100 } = options;
    
    // Get domain-specific settings
    let domainQuery = db.select().from(domainSettings).where(eq(domainSettings.domainId, domainId));
    
    if (category) {
      // Join with global settings to filter by category
      domainQuery = domainQuery
        .innerJoin(globalSettings, eq(domainSettings.globalSettingId, globalSettings.id))
        .where(and(
          eq(domainSettings.domainId, domainId),
          eq(globalSettings.category, category)
        )) as any;
    }

    const domainSettingsResult = await domainQuery;
    let results: any[] = domainSettingsResult;

    if (includeInherited) {
      // Get global settings that don't have domain overrides
      let globalQuery = db.select().from(globalSettings);
      
      if (category) {
        globalQuery = globalQuery.where(eq(globalSettings.category, category));
      }
      
      const globalSettingsResult = await globalQuery;
      const overriddenKeys = new Set(domainSettingsResult.map(ds => ds.settingKey));
      
      // Add inherited global settings
      for (const globalSetting of globalSettingsResult) {
        if (!overriddenKeys.has(globalSetting.key)) {
          results.push({
            ...globalSetting,
            isInherited: true,
            inheritanceSource: 'global',
            effectiveValue: globalSetting.value,
          });
        }
      }
    }

    // Apply pagination
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
      settings: paginatedResults,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getDomainSettingByKey(domainId: number, key: string): Promise<DomainSetting | undefined> {
    const [setting] = await db.select().from(domainSettings)
      .where(and(
        eq(domainSettings.domainId, domainId),
        eq(domainSettings.settingKey, key)
      ));
    return setting || undefined;
  }

  async createDomainSetting(setting: InsertDomainSetting): Promise<DomainSetting> {
    const [newSetting] = await db.insert(domainSettings).values(setting).returning();
    
    // Create audit log
    await this.createSettingsAuditLog({
      settingKey: newSetting.settingKey,
      settingScope: 'domain',
      scopeId: newSetting.domainId,
      globalSettingId: newSetting.globalSettingId,
      action: 'create',
      oldValue: null,
      newValue: newSetting.value,
      userId: setting.createdBy || null,
      userName: null,
      userRole: null,
    });

    return newSetting;
  }

  async updateDomainSetting(domainId: number, key: string, value: any, overrideReason?: string, userId?: number): Promise<DomainSetting | undefined> {
    const existing = await this.getDomainSettingByKey(domainId, key);
    
    if (existing) {
      const [updated] = await db.update(domainSettings)
        .set({ 
          value, 
          overrideReason,
          updatedBy: userId,
          updatedAt: new Date()
        })
        .where(and(
          eq(domainSettings.domainId, domainId),
          eq(domainSettings.settingKey, key)
        ))
        .returning();

      if (updated) {
        // Create audit log
        await this.createSettingsAuditLog({
          settingKey: key,
          settingScope: 'domain',
          scopeId: domainId,
          globalSettingId: updated.globalSettingId,
          action: 'update',
          oldValue: existing.value,
          newValue: value,
          changeReason: overrideReason,
          userId: userId || null,
          userName: null,
          userRole: null,
        });
      }

      return updated || undefined;
    } else {
      // Create new domain setting
      const globalSetting = await this.getGlobalSettingByKey(key);
      if (!globalSetting) {
        throw new Error(`Global setting '${key}' not found`);
      }

      return await this.createDomainSetting({
        domainId,
        settingKey: key,
        globalSettingId: globalSetting.id,
        value,
        overrideReason,
        createdBy: userId,
        updatedBy: userId,
      });
    }
  }

  async deleteDomainSetting(domainId: number, key: string): Promise<boolean> {
    const existing = await this.getDomainSettingByKey(domainId, key);
    if (!existing) return false;

    const result = await db.delete(domainSettings)
      .where(and(
        eq(domainSettings.domainId, domainId),
        eq(domainSettings.settingKey, key)
      ));

    if ((result.rowCount ?? 0) > 0) {
      // Create audit log
      await this.createSettingsAuditLog({
        settingKey: key,
        settingScope: 'domain',
        scopeId: domainId,
        globalSettingId: existing.globalSettingId,
        action: 'delete',
        oldValue: existing.value,
        newValue: null,
        userId: null,
        userName: null,
        userRole: null,
      });
    }

    return (result.rowCount ?? 0) > 0;
  }

  async inheritDomainSettingFromGlobal(domainId: number, key: string, userId?: number): Promise<DomainSetting | undefined> {
    // Delete existing domain setting to inherit from global
    await this.deleteDomainSetting(domainId, key);
    return undefined; // Now inherits from global
  }

  async overrideDomainSetting(domainId: number, key: string, value: any, reason?: string, userId?: number): Promise<DomainSetting | undefined> {
    return await this.updateDomainSetting(domainId, key, value, reason, userId);
  }

  async getDomainSettingsInheritanceMap(domainId: number): Promise<any> {
    const domainSettings = await this.getDomainSettings(domainId, { includeInherited: true });
    const inheritanceMap: any = {};
    
    for (const setting of domainSettings.settings) {
      inheritanceMap[setting.settingKey || setting.key] = {
        value: setting.value || setting.effectiveValue,
        source: setting.isInherited ? 'global' : 'domain',
        isOverridden: !setting.isInherited,
        overrideReason: setting.overrideReason || null,
      };
    }
    
    return inheritanceMap;
  }

  // ===== TENANT SETTINGS METHODS =====
  async getTenantSettings(tenantId: number, options: {
    includeInherited?: boolean;
    category?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ settings: any[]; total: number; page: number; limit: number; totalPages: number }> {
    const { includeInherited = true, category, page = 1, limit = 100 } = options;
    
    // Get tenant-specific settings
    let tenantQuery = db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId));
    
    const tenantSettingsResult = await tenantQuery;
    let results: any[] = tenantSettingsResult;

    if (includeInherited) {
      // Get tenant info to find domain
      const tenant = await this.getTenantById(tenantId);
      if (tenant) {
        // Get domain and global settings that aren't overridden
        const domainSettings = await this.getDomainSettings(tenant.domainId, { includeInherited: true, category });
        const overriddenKeys = new Set(tenantSettingsResult.map(ts => ts.settingKey));
        
        // Add inherited settings from domain/global
        for (const setting of domainSettings.settings) {
          const key = setting.settingKey || setting.key;
          if (!overriddenKeys.has(key)) {
            results.push({
              ...setting,
              isInherited: true,
              inheritanceSource: setting.isInherited ? 'global' : 'domain',
            });
          }
        }
      }
    }

    // Apply pagination
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
      settings: paginatedResults,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getTenantEffectiveSettings(tenantId: number, category?: string): Promise<any> {
    const settings = await this.getTenantSettings(tenantId, { includeInherited: true, category });
    const effective: any = {};
    
    for (const setting of settings.settings) {
      const key = setting.settingKey || setting.key;
      effective[key] = {
        value: setting.value || setting.effectiveValue,
        source: setting.inheritanceSource || 'tenant',
        category: setting.category,
        dataType: setting.dataType,
      };
    }
    
    return effective;
  }

  async getTenantSettingByKey(tenantId: number, key: string): Promise<TenantSetting | undefined> {
    const [setting] = await db.select().from(tenantSettings)
      .where(and(
        eq(tenantSettings.tenantId, tenantId),
        eq(tenantSettings.settingKey, key)
      ));
    return setting || undefined;
  }

  async createTenantSetting(setting: InsertTenantSetting): Promise<TenantSetting> {
    const [newSetting] = await db.insert(tenantSettings).values(setting).returning();
    
    // Create audit log
    await this.createSettingsAuditLog({
      settingKey: newSetting.settingKey,
      settingScope: 'tenant',
      scopeId: newSetting.tenantId,
      globalSettingId: newSetting.globalSettingId,
      action: 'create',
      oldValue: null,
      newValue: newSetting.value,
      userId: setting.createdBy || null,
      userName: null,
      userRole: null,
    });

    return newSetting;
  }

  async updateTenantSetting(tenantId: number, key: string, value: any, overrideReason?: string, userId?: number): Promise<TenantSetting | undefined> {
    const existing = await this.getTenantSettingByKey(tenantId, key);
    
    if (existing) {
      const [updated] = await db.update(tenantSettings)
        .set({ 
          value, 
          overrideReason,
          effectiveValue: value,
          updatedBy: userId,
          updatedAt: new Date()
        })
        .where(and(
          eq(tenantSettings.tenantId, tenantId),
          eq(tenantSettings.settingKey, key)
        ))
        .returning();

      if (updated) {
        // Create audit log
        await this.createSettingsAuditLog({
          settingKey: key,
          settingScope: 'tenant',
          scopeId: tenantId,
          globalSettingId: updated.globalSettingId,
          action: 'update',
          oldValue: existing.value,
          newValue: value,
          changeReason: overrideReason,
          userId: userId || null,
          userName: null,
          userRole: null,
        });
      }

      return updated || undefined;
    } else {
      // Create new tenant setting
      const globalSetting = await this.getGlobalSettingByKey(key);
      if (!globalSetting) {
        throw new Error(`Global setting '${key}' not found`);
      }

      return await this.createTenantSetting({
        tenantId,
        settingKey: key,
        globalSettingId: globalSetting.id,
        value,
        effectiveValue: value,
        overrideReason,
        createdBy: userId,
        updatedBy: userId,
      });
    }
  }

  async deleteTenantSetting(tenantId: number, key: string): Promise<boolean> {
    const existing = await this.getTenantSettingByKey(tenantId, key);
    if (!existing) return false;

    const result = await db.delete(tenantSettings)
      .where(and(
        eq(tenantSettings.tenantId, tenantId),
        eq(tenantSettings.settingKey, key)
      ));

    if ((result.rowCount ?? 0) > 0) {
      // Create audit log
      await this.createSettingsAuditLog({
        settingKey: key,
        settingScope: 'tenant',
        scopeId: tenantId,
        globalSettingId: existing.globalSettingId,
        action: 'delete',
        oldValue: existing.value,
        newValue: null,
        userId: null,
        userName: null,
        userRole: null,
      });
    }

    return (result.rowCount ?? 0) > 0;
  }

  async resetTenantSettingsCategory(tenantId: number, category: string, userId?: number): Promise<TenantSetting[]> {
    // Get all tenant settings in the category
    const globalSettingsInCategory = await this.getGlobalSettingsByCategory(category);
    const results: TenantSetting[] = [];

    for (const globalSetting of globalSettingsInCategory) {
      // Delete tenant override to inherit from domain/global
      await this.deleteTenantSetting(tenantId, globalSetting.key);
    }

    return results;
  }

  async getTenantSettingsInheritanceSource(tenantId: number): Promise<any> {
    const settings = await this.getTenantSettings(tenantId, { includeInherited: true });
    const inheritanceMap: any = {};
    
    for (const setting of settings.settings) {
      const key = setting.settingKey || setting.key;
      inheritanceMap[key] = {
        value: setting.value || setting.effectiveValue,
        source: setting.inheritanceSource || 'tenant',
        isOverridden: !setting.isInherited,
      };
    }
    
    return inheritanceMap;
  }

  // ===== USER PREFERENCES METHODS =====
  async getUserPreferences(userId: number, options: {
    category?: string;
    includeDefaults?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ preferences: UserPreference[]; total: number; page: number; limit: number; totalPages: number }> {
    const { category, page = 1, limit = 100 } = options;
    
    let query = db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    
    if (category) {
      query = query.where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.category, category)
      )) as any;
    }

    // Get total count
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(userPreferences).where(eq(userPreferences.userId, userId));
    if (category) {
      countQuery.where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.category, category)
      ));
    }
    const [{ count }] = await countQuery;

    // Get paginated results
    const preferences = await query
      .orderBy(asc(userPreferences.category), asc(userPreferences.key))
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      preferences,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async getUserPreferenceByKey(userId: number, key: string): Promise<UserPreference | undefined> {
    const [preference] = await db.select().from(userPreferences)
      .where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.key, key)
      ));
    return preference || undefined;
  }

  async createUserPreference(preference: InsertUserPreference): Promise<UserPreference> {
    const [newPreference] = await db.insert(userPreferences).values(preference).returning();
    return newPreference;
  }

  async updateUserPreference(userId: number, key: string, value: any): Promise<UserPreference | undefined> {
    const existing = await this.getUserPreferenceByKey(userId, key);
    
    if (existing) {
      const [updated] = await db.update(userPreferences)
        .set({ 
          value,
          isCustomized: true,
          useSystemDefault: false,
          updatedAt: new Date()
        })
        .where(and(
          eq(userPreferences.userId, userId),
          eq(userPreferences.key, key)
        ))
        .returning();

      return updated || undefined;
    } else {
      // Create new user preference
      return await this.createUserPreference({
        userId,
        key,
        value,
        category: 'ui', // default category
        dataType: typeof value,
        isCustomized: true,
        useSystemDefault: false,
      });
    }
  }

  async updateUserPreferences(userId: number, preferences: Array<{ key: string; value: any; category?: string }>): Promise<UserPreference[]> {
    const results: UserPreference[] = [];
    
    for (const pref of preferences) {
      const result = await this.updateUserPreference(userId, pref.key, pref.value);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  async deleteUserPreference(userId: number, key: string): Promise<boolean> {
    const result = await db.delete(userPreferences)
      .where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.key, key)
      ));

    return (result.rowCount ?? 0) > 0;
  }

  async resetUserPreferences(userId: number, category?: string): Promise<UserPreference[]> {
    let query = db.delete(userPreferences).where(eq(userPreferences.userId, userId));
    
    if (category) {
      query = query.where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.category, category)
      ));
    }

    await query;
    
    // Return remaining preferences
    return await this.getUserPreferences(userId, { category }).then(result => result.preferences);
  }

  async getUserPreferenceDefaults(userId: number): Promise<any> {
    // Return default user preferences based on system settings
    return {
      theme: 'light',
      language: 'en',
      notifications: true,
      itemsPerPage: 25,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'UTC',
    };
  }

  async getUserAvailablePreferences(): Promise<any> {
    return {
      ui: {
        theme: { type: 'select', options: ['light', 'dark', 'auto'], default: 'light' },
        language: { type: 'select', options: ['en', 'es', 'fr', 'de', 'zh', 'ja'], default: 'en' },
        itemsPerPage: { type: 'number', min: 10, max: 100, default: 25 },
        dateFormat: { type: 'select', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], default: 'MM/DD/YYYY' },
        timeFormat: { type: 'select', options: ['12h', '24h'], default: '12h' },
      },
      notifications: {
        email: { type: 'boolean', default: true },
        browser: { type: 'boolean', default: true },
        mobile: { type: 'boolean', default: true },
        digest: { type: 'select', options: ['never', 'daily', 'weekly'], default: 'daily' },
      },
      security: {
        sessionTimeout: { type: 'number', min: 5, max: 480, default: 60 },
        requireMfa: { type: 'boolean', default: false },
      },
    };
  }

  // ===== SETTINGS VALIDATION METHODS =====
  async getSettingsValidationRules(settingKey?: string): Promise<SettingsValidationRule[]> {
    let query = db.select().from(settingsValidationRules).where(eq(settingsValidationRules.isActive, true));
    
    if (settingKey) {
      query = query.where(and(
        eq(settingsValidationRules.isActive, true),
        eq(settingsValidationRules.settingKey, settingKey)
      )) as any;
    }

    return await query.orderBy(asc(settingsValidationRules.priority));
  }

  async validateSettingValue(key: string, value: any, scope?: string, scopeId?: number): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const rules = await this.getSettingsValidationRules(key);
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const rule of rules) {
      // Check if rule applies to this scope
      if (rule.applicableScope !== 'all' && rule.applicableScope !== scope) {
        continue;
      }

      // Apply validation logic based on rule type
      switch (rule.ruleType) {
        case 'required':
          if (value === null || value === undefined || value === '') {
            if (rule.severity === 'error') {
              errors.push(rule.errorMessage);
            } else {
              warnings.push(rule.errorMessage);
            }
          }
          break;
          
        case 'pattern':
          if (typeof value === 'string' && rule.ruleValue.pattern) {
            const regex = new RegExp(rule.ruleValue.pattern);
            if (!regex.test(value)) {
              if (rule.severity === 'error') {
                errors.push(rule.errorMessage);
              } else {
                warnings.push(rule.errorMessage);
              }
            }
          }
          break;
          
        case 'range':
          if (typeof value === 'number') {
            if (rule.ruleValue.min !== undefined && value < rule.ruleValue.min) {
              if (rule.severity === 'error') {
                errors.push(rule.errorMessage);
              } else {
                warnings.push(rule.errorMessage);
              }
            }
            if (rule.ruleValue.max !== undefined && value > rule.ruleValue.max) {
              if (rule.severity === 'error') {
                errors.push(rule.errorMessage);
              } else {
                warnings.push(rule.errorMessage);
              }
            }
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async bulkValidateSettings(settings: Array<{ key: string; value: any }>): Promise<Array<{ key: string; valid: boolean; errors: string[]; warnings: string[] }>> {
    const results = [];
    
    for (const setting of settings) {
      const validation = await this.validateSettingValue(setting.key, setting.value);
      results.push({
        key: setting.key,
        ...validation
      });
    }
    
    return results;
  }

  async createSettingsValidationRule(rule: InsertSettingsValidationRule): Promise<SettingsValidationRule> {
    const [newRule] = await db.insert(settingsValidationRules).values(rule).returning();
    return newRule;
  }

  async updateSettingsValidationRule(id: number, rule: Partial<InsertSettingsValidationRule>): Promise<SettingsValidationRule | undefined> {
    const [updated] = await db.update(settingsValidationRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(settingsValidationRules.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSettingsValidationRule(id: number): Promise<boolean> {
    const result = await db.delete(settingsValidationRules).where(eq(settingsValidationRules.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ===== SETTINGS AUDIT METHODS =====
  async getSettingsAuditLogs(options: {
    settingKey?: string;
    settingScope?: string;
    scopeId?: number;
    userId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ logs: SettingsAuditLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 100 } = options;
    const conditions = [];

    if (options.settingKey) {
      conditions.push(eq(settingsAuditLogs.settingKey, options.settingKey));
    }
    if (options.settingScope) {
      conditions.push(eq(settingsAuditLogs.settingScope, options.settingScope));
    }
    if (options.scopeId) {
      conditions.push(eq(settingsAuditLogs.scopeId, options.scopeId));
    }
    if (options.userId) {
      conditions.push(eq(settingsAuditLogs.userId, options.userId));
    }
    if (options.action) {
      conditions.push(eq(settingsAuditLogs.action, options.action));
    }
    if (options.startDate) {
      conditions.push(gte(settingsAuditLogs.createdAt, new Date(options.startDate)));
    }
    if (options.endDate) {
      conditions.push(lte(settingsAuditLogs.createdAt, new Date(options.endDate)));
    }

    let query = db.select().from(settingsAuditLogs);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(settingsAuditLogs);
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const [{ count }] = await countQuery;

    // Get paginated results
    const logs = await query
      .orderBy(desc(settingsAuditLogs.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      logs,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async createSettingsAuditLog(log: InsertSettingsAuditLog): Promise<SettingsAuditLog> {
    const [newLog] = await db.insert(settingsAuditLogs).values(log).returning();
    return newLog;
  }

  async rollbackSettingChange(auditLogId: number, userId: number, reason: string): Promise<boolean> {
    const auditLog = await db.select().from(settingsAuditLogs).where(eq(settingsAuditLogs.id, auditLogId));
    if (!auditLog.length || !auditLog[0].canRollback) {
      return false;
    }

    const log = auditLog[0];
    
    try {
      // Perform rollback based on scope
      switch (log.settingScope) {
        case 'global':
          if (log.oldValue !== null) {
            await this.updateGlobalSettingByKey(log.settingKey, log.oldValue, userId);
          }
          break;
        case 'domain':
          if (log.scopeId && log.oldValue !== null) {
            await this.updateDomainSetting(log.scopeId, log.settingKey, log.oldValue, reason, userId);
          }
          break;
        case 'tenant':
          if (log.scopeId && log.oldValue !== null) {
            await this.updateTenantSetting(log.scopeId, log.settingKey, log.oldValue, reason, userId);
          }
          break;
      }

      // Update audit log to mark as rolled back
      await db.update(settingsAuditLogs)
        .set({
          rolledBackAt: new Date(),
          rolledBackBy: userId,
          rollbackReason: reason,
        })
        .where(eq(settingsAuditLogs.id, auditLogId));

      return true;
    } catch (error) {
      return false;
    }
  }

  // ===== SETTINGS TEMPLATES METHODS =====
  async getAllSettingsTemplates(options: {
    scope?: string;
    category?: string;
    templateType?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ templates: SettingsTemplate[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 50 } = options;
    const conditions = [];

    if (options.scope) {
      conditions.push(eq(settingsTemplates.scope, options.scope));
    }
    if (options.category) {
      conditions.push(eq(settingsTemplates.category, options.category));
    }
    if (options.templateType) {
      conditions.push(eq(settingsTemplates.templateType, options.templateType));
    }

    let query = db.select().from(settingsTemplates);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Get total count
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(settingsTemplates);
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const [{ count }] = await countQuery;

    // Get paginated results
    const templates = await query
      .orderBy(desc(settingsTemplates.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      templates,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async getSettingsTemplateById(id: number): Promise<SettingsTemplate | undefined> {
    const [template] = await db.select().from(settingsTemplates).where(eq(settingsTemplates.id, id));
    return template || undefined;
  }

  async getSettingsTemplateByName(name: string): Promise<SettingsTemplate | undefined> {
    const [template] = await db.select().from(settingsTemplates).where(eq(settingsTemplates.name, name));
    return template || undefined;
  }

  async createSettingsTemplate(template: InsertSettingsTemplate): Promise<SettingsTemplate> {
    const [newTemplate] = await db.insert(settingsTemplates).values(template).returning();
    return newTemplate;
  }

  async updateSettingsTemplate(id: number, template: Partial<InsertSettingsTemplate>): Promise<SettingsTemplate | undefined> {
    const [updated] = await db.update(settingsTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(settingsTemplates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSettingsTemplate(id: number): Promise<boolean> {
    // Prevent deletion of read-only templates
    const template = await this.getSettingsTemplateById(id);
    if (template?.isReadOnly) {
      throw new Error('Cannot delete read-only template');
    }

    const result = await db.delete(settingsTemplates).where(eq(settingsTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async applySettingsTemplate(templateId: number, scope: string, scopeId?: number, userId?: number): Promise<any> {
    const template = await this.getSettingsTemplateById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const results = { applied: 0, skipped: 0, errors: [] as Array<{ key: string; error: string }> };
    const settingsData = template.settingsData as any;

    for (const [key, value] of Object.entries(settingsData)) {
      try {
        switch (scope) {
          case 'global':
            await this.updateGlobalSettingByKey(key, value, userId);
            break;
          case 'domain':
            if (scopeId) {
              await this.updateDomainSetting(scopeId, key, value, `Applied from template: ${template.name}`, userId);
            }
            break;
          case 'tenant':
            if (scopeId) {
              await this.updateTenantSetting(scopeId, key, value, `Applied from template: ${template.name}`, userId);
            }
            break;
          default:
            throw new Error(`Unsupported scope: ${scope}`);
        }
        results.applied++;
      } catch (error) {
        results.errors.push({
          key,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update template usage tracking
    await db.update(settingsTemplates)
      .set({
        usageCount: (template.usageCount || 0) + 1,
        lastUsed: new Date(),
      })
      .where(eq(settingsTemplates.id, templateId));

    return results;
  }

  // ===== SETTINGS EXPORT/IMPORT METHODS =====
  async exportSettings(options: {
    scope?: string;
    scopeId?: number;
    categories?: string[];
    includeDefaults?: boolean;
  } = {}): Promise<any> {
    const exportData: any = {
      exportedAt: new Date().toISOString(),
      scope: options.scope,
      scopeId: options.scopeId,
      categories: options.categories,
      settings: {}
    };

    let settings: any[] = [];

    switch (options.scope) {
      case 'global':
        const globalResult = await this.getAllGlobalSettings();
        settings = globalResult.settings;
        break;
      case 'domain':
        if (options.scopeId) {
          const domainResult = await this.getDomainSettings(options.scopeId);
          settings = domainResult.settings;
        }
        break;
      case 'tenant':
        if (options.scopeId) {
          const tenantResult = await this.getTenantSettings(options.scopeId);
          settings = tenantResult.settings;
        }
        break;
      default:
        // Export all global settings
        const allResult = await this.getAllGlobalSettings();
        settings = allResult.settings;
    }

    // Filter by categories if specified
    if (options.categories?.length) {
      settings = settings.filter(s => options.categories!.includes(s.category));
    }

    // Build settings export
    for (const setting of settings) {
      const key = setting.settingKey || setting.key;
      exportData.settings[key] = {
        value: setting.value,
        category: setting.category,
        dataType: setting.dataType,
        displayName: setting.displayName,
        description: setting.description,
      };

      if (options.includeDefaults && setting.defaultValue !== undefined) {
        exportData.settings[key].defaultValue = setting.defaultValue;
      }
    }

    return exportData;
  }

  async importSettings(settingsData: any, scope?: string, scopeId?: number, userId?: number): Promise<{
    imported: number;
    skipped: number;
    errors: Array<{ key: string; error: string }>;
  }> {
    const results = { imported: 0, skipped: 0, errors: [] as Array<{ key: string; error: string }> };

    if (!settingsData.settings) {
      throw new Error('Invalid settings data format');
    }

    for (const [key, settingData] of Object.entries(settingsData.settings) as any[]) {
      try {
        // Validate setting value
        const validation = await this.validateSettingValue(key, settingData.value, scope, scopeId);
        if (!validation.valid) {
          results.errors.push({
            key,
            error: `Validation failed: ${validation.errors.join(', ')}`
          });
          continue;
        }

        // Apply setting based on scope
        switch (scope) {
          case 'global':
            await this.updateGlobalSettingByKey(key, settingData.value, userId);
            break;
          case 'domain':
            if (scopeId) {
              await this.updateDomainSetting(scopeId, key, settingData.value, 'Imported from configuration', userId);
            }
            break;
          case 'tenant':
            if (scopeId) {
              await this.updateTenantSetting(scopeId, key, settingData.value, 'Imported from configuration', userId);
            }
            break;
          default:
            // Default to global scope
            await this.updateGlobalSettingByKey(key, settingData.value, userId);
        }

        results.imported++;
      } catch (error) {
        results.errors.push({
          key,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async validateSettingsImport(settingsData: any): Promise<{
    valid: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!settingsData || typeof settingsData !== 'object') {
      errors.push('Invalid settings data format');
      return { valid: false, warnings, errors };
    }

    if (!settingsData.settings) {
      errors.push('Missing settings object in import data');
      return { valid: false, warnings, errors };
    }

    // Validate each setting
    for (const [key, settingData] of Object.entries(settingsData.settings) as any[]) {
      if (!settingData || typeof settingData !== 'object') {
        warnings.push(`Setting '${key}' has invalid format`);
        continue;
      }

      if (settingData.value === undefined) {
        warnings.push(`Setting '${key}' is missing value`);
        continue;
      }

      // Check if setting exists in schema
      const globalSetting = await this.getGlobalSettingByKey(key);
      if (!globalSetting) {
        warnings.push(`Setting '${key}' not found in system schema`);
        continue;
      }

      // Validate data type
      if (settingData.dataType && settingData.dataType !== globalSetting.dataType) {
        warnings.push(`Setting '${key}' data type mismatch (expected ${globalSetting.dataType}, got ${settingData.dataType})`);
      }

      // Validate value
      const validation = await this.validateSettingValue(key, settingData.value);
      if (!validation.valid) {
        errors.push(`Setting '${key}': ${validation.errors.join(', ')}`);
      }
      if (validation.warnings.length > 0) {
        warnings.push(`Setting '${key}': ${validation.warnings.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }

  // ===== AI SERVICES IMPLEMENTATIONS =====
  
  // AI Conversations
  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [newConversation] = await db.insert(aiConversations).values(conversation).returning();
    return newConversation;
  }

  // AI Script Generations
  async createAiScriptGeneration(script: InsertAiScriptGeneration): Promise<AiScriptGeneration> {
    const [newScript] = await db.insert(aiScriptGenerations).values(script).returning();
    return newScript;
  }

  // AI Analysis Reports
  async createAiAnalysisReport(report: InsertAiAnalysisReport): Promise<AiAnalysisReport> {
    const [newReport] = await db.insert(aiAnalysisReports).values(report).returning();
    return newReport;
  }

  // AI Recommendations
  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const [newRecommendation] = await db.insert(aiRecommendations).values(recommendation).returning();
    return newRecommendation;
  }

  // AI Feedback
  async createAiFeedback(feedback: InsertAiFeedback): Promise<AiFeedback> {
    const [newFeedback] = await db.insert(aiFeedback).values(feedback).returning();
    return newFeedback;
  }

  // AI Usage Logs
  async createAiUsageLog(usageLog: InsertAiUsageLog): Promise<AiUsageLog> {
    const [newLog] = await db.insert(aiUsageLogs).values(usageLog).returning();
    return newLog;
  }

  async getAiUsageLogsByDateRange(userId: number, startDate: Date, endDate: Date, tenantId?: number): Promise<AiUsageLog[]> {
    const logs = await db.select()
      .from(aiUsageLogs)
      .where(
        and(
          eq(aiUsageLogs.userId, userId),
          gte(aiUsageLogs.requestStartTime, startDate),
          lte(aiUsageLogs.requestStartTime, endDate),
          tenantId ? eq(aiUsageLogs.tenantId, tenantId) : undefined
        )
      )
      .orderBy(desc(aiUsageLogs.requestStartTime));
    return logs;
  }

  // AI Model Configurations
  async createAiModelConfiguration(config: InsertAiModelConfiguration): Promise<AiModelConfiguration> {
    const [newConfig] = await db.insert(aiModelConfigurations).values(config).returning();
    return newConfig;
  }

  // Placeholder methods for unimplemented interfaces
  async validateDeploymentTargets(targets: any): Promise<{ valid: any[]; invalid: any[]; warnings: any[] }> {
    return { valid: [], invalid: [], warnings: [] };
  }

  async getDeploymentStrategies(): Promise<any[]> {
    return [];
  }

  async orchestrateDeployment(request: any): Promise<any> {
    return {};
  }

  async getAgentDeploymentHealth(): Promise<any> {
    return {};
  }
}

export const storage = new DatabaseStorage();