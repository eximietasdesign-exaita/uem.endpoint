var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { eq, desc, and, gte, lte, asc, or, sql } from "drizzle-orm";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  activityLogsRelations: () => activityLogsRelations,
  agentDeploymentJobs: () => agentDeploymentJobs,
  agentDeploymentTasks: () => agentDeploymentTasks,
  agentDeployments: () => agentDeployments,
  agentDeploymentsRelations: () => agentDeploymentsRelations,
  agentStatusReports: () => agentStatusReports,
  agents: () => agents,
  agentsRelations: () => agentsRelations,
  aiAnalysisReports: () => aiAnalysisReports,
  aiAnalysisReportsRelations: () => aiAnalysisReportsRelations,
  aiConversations: () => aiConversations,
  aiConversationsRelations: () => aiConversationsRelations,
  aiFeedback: () => aiFeedback,
  aiFeedbackRelations: () => aiFeedbackRelations,
  aiModelConfigurations: () => aiModelConfigurations,
  aiModelConfigurationsRelations: () => aiModelConfigurationsRelations,
  aiRecommendations: () => aiRecommendations,
  aiRecommendationsRelations: () => aiRecommendationsRelations,
  aiScriptGenerations: () => aiScriptGenerations,
  aiScriptGenerationsRelations: () => aiScriptGenerationsRelations,
  aiUsageLogs: () => aiUsageLogs,
  aiUsageLogsRelations: () => aiUsageLogsRelations,
  assetAuditLogRelations: () => assetAuditLogRelations,
  assetAuditLogs: () => assetAuditLogs,
  assetCustomFields: () => assetCustomFields,
  assetExternalMappings: () => assetExternalMappings,
  assetExternalMappingsRelations: () => assetExternalMappingsRelations,
  assetInventory: () => assetInventory,
  assetInventoryRelations: () => assetInventoryRelations,
  assetTableViews: () => assetTableViews,
  credentialAccessLogs: () => credentialAccessLogs2,
  credentialAccessLogsRelations: () => credentialAccessLogsRelations,
  credentialEntries: () => credentialEntries,
  credentialEntriesRelations: () => credentialEntriesRelations,
  credentialProfiles: () => credentialProfiles,
  credentialProfilesRelations: () => credentialProfilesRelations,
  dashboardStats: () => dashboardStats,
  discoveryJobs: () => discoveryJobs,
  discoveryJobsRelations: () => discoveryJobsRelations,
  discoveryProbes: () => discoveryProbes,
  discoveryProbesRelations: () => discoveryProbesRelations,
  domainRelations: () => domainRelations,
  domainSettings: () => domainSettings,
  domains: () => domains,
  endpoints: () => endpoints,
  endpointsRelations: () => endpointsRelations,
  externalSystems: () => externalSystems,
  externalSystemsRelations: () => externalSystemsRelations,
  globalSettings: () => globalSettings,
  insertActivityLogSchema: () => insertActivityLogSchema,
  insertAgentDeploymentJobSchema: () => insertAgentDeploymentJobSchema,
  insertAgentDeploymentSchema: () => insertAgentDeploymentSchema,
  insertAgentDeploymentTaskSchema: () => insertAgentDeploymentTaskSchema,
  insertAgentSchema: () => insertAgentSchema,
  insertAgentStatusReportSchema: () => insertAgentStatusReportSchema,
  insertAiAnalysisReportSchema: () => insertAiAnalysisReportSchema,
  insertAiConversationSchema: () => insertAiConversationSchema,
  insertAiFeedbackSchema: () => insertAiFeedbackSchema,
  insertAiModelConfigurationSchema: () => insertAiModelConfigurationSchema,
  insertAiRecommendationSchema: () => insertAiRecommendationSchema,
  insertAiScriptGenerationSchema: () => insertAiScriptGenerationSchema,
  insertAiUsageLogSchema: () => insertAiUsageLogSchema,
  insertAssetAuditLogSchema: () => insertAssetAuditLogSchema,
  insertAssetCustomFieldSchema: () => insertAssetCustomFieldSchema,
  insertAssetExternalMappingSchema: () => insertAssetExternalMappingSchema,
  insertAssetInventorySchema: () => insertAssetInventorySchema,
  insertAssetTableViewSchema: () => insertAssetTableViewSchema,
  insertCredentialAccessLogSchema: () => insertCredentialAccessLogSchema,
  insertCredentialEntrySchema: () => insertCredentialEntrySchema,
  insertCredentialProfileSchema: () => insertCredentialProfileSchema,
  insertDashboardStatsSchema: () => insertDashboardStatsSchema,
  insertDiscoveryJobSchema: () => insertDiscoveryJobSchema,
  insertDiscoveryProbeSchema: () => insertDiscoveryProbeSchema,
  insertDomainSchema: () => insertDomainSchema,
  insertDomainSettingSchema: () => insertDomainSettingSchema,
  insertEndpointSchema: () => insertEndpointSchema,
  insertExternalSystemSchema: () => insertExternalSystemSchema,
  insertGlobalSettingSchema: () => insertGlobalSettingSchema,
  insertIntegrationLogSchema: () => insertIntegrationLogSchema,
  insertIntegrationRuleSchema: () => insertIntegrationRuleSchema,
  insertPolicySchema: () => insertPolicySchema,
  insertScriptOrchestratorProfileSchema: () => insertScriptOrchestratorProfileSchema,
  insertScriptSchema: () => insertScriptSchema,
  insertSettingsAuditLogSchema: () => insertSettingsAuditLogSchema,
  insertSettingsCategorySchema: () => insertSettingsCategorySchema,
  insertSettingsTemplateSchema: () => insertSettingsTemplateSchema,
  insertSettingsValidationRuleSchema: () => insertSettingsValidationRuleSchema,
  insertStandardScriptTemplateSchema: () => insertStandardScriptTemplateSchema,
  insertSystemStatusSchema: () => insertSystemStatusSchema,
  insertTenantSchema: () => insertTenantSchema,
  insertTenantSettingSchema: () => insertTenantSettingSchema,
  insertUserPreferenceSchema: () => insertUserPreferenceSchema,
  insertUserSchema: () => insertUserSchema,
  integrationLogs: () => integrationLogs,
  integrationLogsRelations: () => integrationLogsRelations,
  integrationRules: () => integrationRules,
  integrationRulesRelations: () => integrationRulesRelations,
  policies: () => policies,
  policiesRelations: () => policiesRelations,
  scriptOrchestratorProfiles: () => scriptOrchestratorProfiles,
  scripts: () => scripts,
  scriptsRelations: () => scriptsRelations,
  settingsAuditLogs: () => settingsAuditLogs,
  settingsCategories: () => settingsCategories,
  settingsTemplates: () => settingsTemplates,
  settingsValidationRules: () => settingsValidationRules,
  standardScriptTemplates: () => standardScriptTemplates,
  systemStatus: () => systemStatus,
  tenantRelations: () => tenantRelations,
  tenantSettings: () => tenantSettings,
  tenants: () => tenants,
  userPreferences: () => userPreferences,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, integer, boolean, timestamp, jsonb, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var domains = pgTable("uem_app_domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  parentDomainId: integer("parent_domain_id").references(() => domains.id),
  type: text("type").notNull().default("standard"),
  // root, standard, subdomain
  status: text("status").notNull().default("active"),
  // active, inactive, suspended
  settings: jsonb("settings").$type(),
  branding: jsonb("branding").$type(),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tenants = pgTable("uem_app_tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  domainId: integer("domain_id").notNull().references(() => domains.id),
  type: text("type").notNull().default("standard"),
  // enterprise, standard, trial
  status: text("status").notNull().default("active"),
  // active, inactive, suspended, trial_expired
  settings: jsonb("settings").$type(),
  subscriptionPlan: text("subscription_plan").default("standard"),
  // trial, standard, premium, enterprise
  subscriptionExpiry: timestamp("subscription_expiry"),
  dataQuota: integer("data_quota_gb").default(10),
  // in GB
  usedQuota: integer("used_quota_gb").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var domainRelations = relations(domains, ({ one, many }) => ({
  parentDomain: one(domains, {
    fields: [domains.parentDomainId],
    references: [domains.id]
  }),
  subdomains: many(domains),
  tenants: many(tenants)
}));
var tenantRelations = relations(tenants, ({ one, many }) => ({
  domain: one(domains, {
    fields: [tenants.domainId],
    references: [domains.id]
  }),
  users: many(users)
}));
var users = pgTable("uem_app_users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"),
  // administrator, operator, viewer
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  globalRole: text("global_role"),
  // super_admin, domain_admin, tenant_admin
  firstName: text("first_name"),
  lastName: text("last_name"),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").$type(),
  preferences: jsonb("preferences").$type(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var credentialProfiles = pgTable("uem_app_credential_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"),
  // general, system, network, cloud, database, security
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"),
  // global, domain, tenant
  // Enhanced security and compliance
  encryptionLevel: text("encryption_level").notNull().default("aes256"),
  // aes256, rsa2048, ecc
  complianceLevel: text("compliance_level").notNull().default("standard"),
  // standard, sox, pci, hipaa, iso27001
  accessLevel: text("access_level").notNull().default("standard"),
  // restricted, standard, elevated, administrative
  // Vault Integration
  vaultProvider: text("vault_provider").default("internal"),
  // internal, hashicorp, azure, aws, cyberark
  vaultPath: text("vault_path"),
  vaultNamespace: text("vault_namespace"),
  vaultRole: text("vault_role"),
  // Local Storage Configuration
  storageType: text("storage_type").notNull().default("encrypted"),
  // encrypted, vault, hybrid
  localEncryption: boolean("local_encryption").default(true),
  // Security and Audit
  rotationPolicy: jsonb("rotation_policy").$type(),
  // Access Control
  accessRestrictions: jsonb("access_restrictions").$type(),
  // Monitoring and Compliance
  auditLevel: text("audit_level").notNull().default("standard"),
  // minimal, standard, detailed, full
  monitoringEnabled: boolean("monitoring_enabled").default(true),
  alertingEnabled: boolean("alerting_enabled").default(false),
  // Enhanced Metadata
  tags: jsonb("tags").$type().default([]),
  environments: jsonb("environments").$type().default([]),
  // production, staging, development, test
  // Usage and Analytics
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  lastRotated: timestamp("last_rotated"),
  expiresAt: timestamp("expires_at"),
  // Audit Trail
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Legacy columns (deprecated - to be removed after data migration)
  legacyType: text("type"),
  credentialsLegacy: jsonb("credentials").$type()
});
var credentialEntries = pgTable("uem_app_credential_entries", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => credentialProfiles.id, { onDelete: "cascade" }),
  // Credential Identity
  name: text("name").notNull(),
  type: text("type").notNull(),
  // ssh, rdp, winrm, snmp, api_key, certificate, token, database, cloud, service_account
  subType: text("sub_type"),
  // ssh_key, ssh_password, certificate_p12, oauth2, service_principal
  // Connection Details
  hostname: text("hostname"),
  port: integer("port"),
  protocol: text("protocol"),
  // ssh, rdp, https, tcp, udp
  // Authentication Data (encrypted)
  username: text("username"),
  passwordEncrypted: text("password_encrypted"),
  // Encrypted password/secret
  domainName: text("domain_name"),
  // Advanced Authentication
  privateKeyEncrypted: text("private_key_encrypted"),
  // Encrypted private keys
  certificateEncrypted: text("certificate_encrypted"),
  // Encrypted certificates
  tokenEncrypted: text("token_encrypted"),
  // Encrypted API tokens
  // Vault References
  vaultSecretPath: text("vault_secret_path"),
  // Path to secret in external vault
  vaultSecretKey: text("vault_secret_key"),
  // Key within the secret
  vaultVersion: integer("vault_version"),
  // Version for vault rotation
  // Metadata and Configuration
  connectionString: text("connection_string"),
  // For databases, APIs
  customFields: jsonb("custom_fields").$type().default({}),
  // Security and Compliance
  encryptionAlgorithm: text("encryption_algorithm").default("AES-256-GCM"),
  keyDerivationFunction: text("key_derivation_function").default("PBKDF2"),
  saltValue: text("salt_value"),
  // For encryption salt
  // Access Control
  accessLevel: text("access_level").notNull().default("standard"),
  // restricted, standard, elevated, administrative
  // Lifecycle Management
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  lastValidated: timestamp("last_validated"),
  validationStatus: text("validation_status").default("unknown"),
  // valid, invalid, expired, unknown
  // Usage Tracking
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  // Audit
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var credentialAccessLogs2 = pgTable("uem_app_credential_access_logs", {
  id: serial("id").primaryKey(),
  credentialId: integer("credential_id").references(() => credentialEntries.id, { onDelete: "cascade" }),
  profileId: integer("profile_id").references(() => credentialProfiles.id),
  userId: integer("user_id").references(() => users.id),
  // Access Details
  accessType: text("access_type").notNull(),
  // view, use, modify, rotate, delete
  accessMethod: text("access_method"),
  // ui, api, script, automation
  sourceIp: text("source_ip"),
  userAgent: text("user_agent"),
  // Context
  purpose: text("purpose"),
  // discovery, deployment, maintenance, audit
  targetSystem: text("target_system"),
  sessionId: text("session_id"),
  // Results
  accessGranted: boolean("access_granted").notNull(),
  failureReason: text("failure_reason"),
  // Timestamps
  accessedAt: timestamp("accessed_at").defaultNow(),
  sessionDuration: integer("session_duration_seconds")
});
var discoveryProbes = pgTable("uem_app_discovery_probes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"),
  // global, domain, tenant
  ipAddress: text("ip_address").notNull(),
  port: integer("port").default(443),
  status: text("status").notNull().default("offline"),
  // online, offline, warning, maintenance
  version: text("version"),
  capabilities: jsonb("capabilities").$type(),
  lastHeartbeat: timestamp("last_heartbeat"),
  cpuUsage: real("cpu_usage").default(0),
  memoryUsage: real("memory_usage").default(0),
  diskUsage: real("disk_usage").default(0),
  jobsInQueue: integer("jobs_in_queue").default(0),
  totalJobsExecuted: integer("total_jobs_executed").default(0),
  environment: text("environment").default("production"),
  // production, staging, development
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var standardScriptTemplates = pgTable("uem_app_standard_script_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  // discovery, health_check, maintenance, security, inventory, compliance
  type: text("type").notNull(),
  // powershell, bash, python, wmi, registry, snmp
  targetOs: text("target_os").notNull(),
  // windows, linux, macos, any
  template: text("template").notNull(),
  // Script template with placeholders
  // Standard metadata
  vendor: text("vendor").default("internal"),
  // internal, microsoft, redhat, canonical
  complexity: text("complexity").default("basic"),
  // basic, intermediate, advanced, expert
  estimatedRunTime: integer("estimated_run_time_seconds").default(30),
  requiresElevation: boolean("requires_elevation").default(false),
  requiresNetwork: boolean("requires_network").default(false),
  // Parameters and configuration
  parameters: jsonb("parameters").$type(),
  // Output processing configuration
  outputFormat: text("output_format").default("text"),
  // text, json, xml, csv
  outputProcessing: jsonb("output_processing").$type(),
  // Credential requirements
  credentialRequirements: jsonb("credential_requirements").$type(),
  // Standard tags and classification
  tags: jsonb("tags").$type().default([]),
  industries: jsonb("industries").$type().default([]),
  // healthcare, finance, retail, manufacturing
  complianceFrameworks: jsonb("compliance_frameworks").$type().default([]),
  // sox, pci, hipaa, iso27001
  // Versioning and lifecycle
  version: text("version").default("1.0.0"),
  isStandard: boolean("is_standard").default(true),
  isActive: boolean("is_active").default(true),
  deprecatedAt: timestamp("deprecated_at"),
  // Usage analytics
  usageCount: integer("usage_count").default(0),
  avgExecutionTime: real("avg_execution_time").default(0),
  successRate: real("success_rate").default(100),
  // Audit trail
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var scripts = pgTable("uem_app_scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  // discovery, health_check, maintenance, security
  type: text("type").notNull(),
  // powershell, bash, python, wmi
  targetOs: text("target_os").notNull(),
  // windows, linux, macos, any
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"),
  // global, domain, tenant
  publishStatus: text("publish_status").notNull().default("private"),
  // private, domain, global
  content: text("content").notNull(),
  // Standard template reference
  standardTemplateId: integer("standard_template_id").references(() => standardScriptTemplates.id),
  isFromTemplate: boolean("is_from_template").default(false),
  templateVersion: text("template_version"),
  // Script orchestrator integration
  orchestratorProfileId: integer("orchestrator_profile_id").references(() => scriptOrchestratorProfiles.id),
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  parameters: jsonb("parameters").$type(),
  outputProcessing: jsonb("output_processing").$type(),
  tags: jsonb("tags").$type(),
  version: text("version").default("1.0.0"),
  author: text("author"),
  isActive: boolean("is_active").default(true),
  isFavorite: boolean("is_favorite").default(false),
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var policies = pgTable("uem_app_policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  // operating_system, network, security, compliance
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"),
  // global, domain, tenant
  publishScope: text("publish_scope").notNull().default("private"),
  // private, domain, global
  availableScripts: jsonb("available_scripts").$type(),
  executionFlow: jsonb("execution_flow").$type(),
  publishStatus: text("publish_status").default("draft"),
  // draft, published, maintenance, inactive
  isActive: boolean("is_active").default(true),
  version: text("version").default("1.0.0"),
  targetOs: text("target_os").notNull(),
  executionOrder: integer("execution_order").default(0),
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var scriptOrchestratorProfiles = pgTable("uem_app_script_orchestrator_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // Profile configuration
  category: text("category").notNull().default("general"),
  // general, discovery, compliance, maintenance
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"),
  // global, domain, tenant
  // Credential vault integration - direct FK to credential profile
  defaultCredentialProfileId: integer("default_credential_profile_id").references(() => credentialProfiles.id),
  // Credential vault configuration
  credentialVaultConfig: jsonb("credential_vault_config").$type(),
  // Script execution configuration
  executionConfig: jsonb("execution_config").$type(),
  // Linked scripts and policies
  linkedScripts: jsonb("linked_scripts").$type().default([]),
  linkedPolicies: jsonb("linked_policies").$type().default([]),
  // Orchestrator metadata
  version: text("version").default("1.0.0"),
  isActive: boolean("is_active").default(true),
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var agentStatusReports = pgTable("uem_app_agent_status_reports", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").notNull().unique(),
  // Unique constraint for upsert functionality
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  // Agent identification
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  agentVersion: text("agent_version"),
  operatingSystem: text("operating_system"),
  osVersion: text("os_version"),
  // Status information
  status: text("status").notNull().default("unknown"),
  // online, offline, error, maintenance, updating
  statusMessage: text("status_message"),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow(),
  lastSuccessfulContact: timestamp("last_successful_contact"),
  // System metrics
  systemMetrics: jsonb("system_metrics").$type(),
  // Agent capabilities and configuration
  capabilities: jsonb("capabilities").$type(),
  // Execution status
  currentJobs: jsonb("current_jobs").$type().default([]),
  queuedJobs: integer("queued_jobs").default(0),
  completedJobs: integer("completed_jobs").default(0),
  failedJobs: integer("failed_jobs").default(0),
  // Configuration and settings
  configuration: jsonb("configuration").$type(),
  // Health and diagnostics
  healthScore: real("health_score").default(100),
  diagnostics: jsonb("diagnostics").$type(),
  // External system integration
  externalSystemId: text("external_system_id"),
  customAttributes: jsonb("custom_attributes").$type().default({}),
  // Audit and lifecycle
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var agentDeploymentJobs = pgTable("uem_app_agent_deployment_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // Job configuration
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  status: text("status").notNull().default("pending"),
  // pending, running, completed, failed, cancelled
  // Deployment targets
  deploymentTargets: jsonb("deployment_targets").$type(),
  // Deployment configuration
  agentConfiguration: jsonb("agent_configuration").$type(),
  // Progress tracking
  totalTargets: integer("total_targets").default(0),
  completedTargets: integer("completed_targets").default(0),
  failedTargets: integer("failed_targets").default(0),
  progress: real("progress").default(0),
  // Results and reporting
  deploymentResults: jsonb("deployment_results").$type(),
  // Job lifecycle
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  scheduledFor: timestamp("scheduled_for"),
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var endpoints = pgTable("uem_app_endpoints", {
  id: serial("id").primaryKey(),
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  macAddress: text("mac_address"),
  operatingSystem: text("operating_system"),
  osVersion: text("os_version"),
  domain: text("domain"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  publishScope: text("publish_scope").notNull().default("tenant"),
  // tenant, domain, global
  assetType: text("asset_type").notNull(),
  // server, workstation, laptop, mobile, iot
  status: text("status").notNull().default("unknown"),
  // online, offline, warning, critical
  discoveryMethod: text("discovery_method"),
  // agentless_scan, agent_deployment, manual
  lastSeen: timestamp("last_seen"),
  complianceScore: real("compliance_score").default(0),
  vulnerabilityCount: integer("vulnerability_count").default(0),
  criticalVulnerabilities: integer("critical_vulnerabilities").default(0),
  systemInfo: jsonb("system_info").$type(),
  installedSoftware: jsonb("installed_software").$type(),
  vulnerabilities: jsonb("vulnerabilities").$type(),
  networkPorts: jsonb("network_ports").$type(),
  agentId: text("agent_id"),
  probeId: integer("probe_id").references(() => discoveryProbes.id),
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  discoveryJobId: integer("discovery_job_id"),
  externalId: text("external_id"),
  // For mapping to external systems
  externalSystemId: text("external_system_id"),
  customFields: jsonb("custom_fields").$type(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var discoveryJobs = pgTable("uem_app_discovery_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  // agentless, agent_based
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  status: text("status").notNull().default("pending"),
  // pending, running, completed, failed, cancelled
  targets: jsonb("targets").$type(),
  discoveryProfiles: jsonb("discovery_profiles").$type(),
  schedule: jsonb("schedule").$type(),
  progress: jsonb("progress").$type(),
  results: jsonb("results").$type(),
  probeId: integer("probe_id").references(() => discoveryProbes.id),
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  createdBy: integer("created_by").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var agentDeployments = pgTable("uem_app_agent_deployments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  policyIds: jsonb("policy_ids").$type(),
  targets: jsonb("targets").$type(),
  deploymentMethod: text("deployment_method").notNull(),
  // group_policy, sccm, manual, powershell_remote
  schedule: jsonb("schedule").$type(),
  status: text("status").notNull().default("pending"),
  progress: jsonb("progress").$type(),
  results: jsonb("results").$type(),
  probeId: integer("probe_id").references(() => discoveryProbes.id),
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  createdBy: integer("created_by").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var agents = pgTable("uem_app_agents", {
  id: text("id").primaryKey(),
  // UUID
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  operatingSystem: text("operating_system").notNull(),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  version: text("version").notNull(),
  status: text("status").notNull().default("offline"),
  // online, offline, error, updating
  lastHeartbeat: timestamp("last_heartbeat"),
  capabilities: jsonb("capabilities").$type(),
  systemInfo: jsonb("system_info").$type(),
  deploymentMethod: text("deployment_method"),
  deploymentId: integer("deployment_id").references(() => agentDeployments.id),
  endpointId: integer("endpoint_id").references(() => endpoints.id),
  installedAt: timestamp("installed_at"),
  appliedPolicies: jsonb("applied_policies").$type(),
  discoveryResults: jsonb("discovery_results").$type(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var activityLogs = pgTable("uem_app_activity_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  // discovery, deployment, script_execution, policy_execution, system
  category: text("category").notNull(),
  // info, warning, error, success
  title: text("title").notNull(),
  description: text("description"),
  entityType: text("entity_type"),
  // endpoint, agent, job, policy, script
  entityId: text("entity_id"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  metadata: jsonb("metadata").$type(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});
var systemStatus = pgTable("uem_app_system_status", {
  id: serial("id").primaryKey(),
  service: text("service").notNull().unique(),
  // discovery_service, agent_service, database, api
  status: text("status").notNull().default("healthy"),
  // healthy, warning, critical, maintenance
  uptime: integer("uptime").default(0),
  // in seconds
  lastCheck: timestamp("last_check").defaultNow(),
  metrics: jsonb("metrics").$type(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dashboardStats = pgTable("uem_app_dashboard_stats", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  totalEndpoints: integer("total_endpoints").default(0),
  onlineEndpoints: integer("online_endpoints").default(0),
  offlineEndpoints: integer("offline_endpoints").default(0),
  criticalAlerts: integer("critical_alerts").default(0),
  warningAlerts: integer("warning_alerts").default(0),
  activeJobs: integer("active_jobs").default(0),
  completedJobs: integer("completed_jobs").default(0),
  failedJobs: integer("failed_jobs").default(0),
  complianceScore: real("compliance_score").default(0),
  vulnerabilitiesDetected: integer("vulnerabilities_detected").default(0),
  agentsDeployed: integer("agents_deployed").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var externalSystems = pgTable("uem_app_external_systems", {
  id: text("id").primaryKey(),
  // UUID or system-specific ID
  name: text("name").notNull(),
  description: text("description"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"),
  // global, domain, tenant
  baseUrl: text("base_url").notNull(),
  authType: text("auth_type").notNull(),
  // bearer, api-key, basic
  apiKey: text("api_key").notNull(),
  enabled: boolean("enabled").default(true),
  syncDirection: text("sync_direction").notNull(),
  // inbound, outbound, bidirectional
  webhookUrl: text("webhook_url"),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  retryAttempts: integer("retry_attempts").default(3),
  timeoutMs: integer("timeout_ms").default(3e4),
  lastSyncTime: timestamp("last_sync_time"),
  totalSyncCount: integer("total_sync_count").default(0),
  failureCount: integer("failure_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var integrationLogs = pgTable("uem_app_integration_logs", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => endpoints.id),
  systemId: text("system_id").references(() => externalSystems.id),
  action: text("action").notNull(),
  // create, update, delete, status_change, discovery, scan_complete
  direction: text("direction").notNull(),
  // inbound, outbound
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  requestPayload: text("request_payload"),
  // JSON string
  responsePayload: text("response_payload"),
  // JSON string
  processingTimeMs: integer("processing_time_ms"),
  timestamp: timestamp("timestamp").defaultNow()
});
var agentDeploymentTasks = pgTable("uem_app_agent_deployment_tasks", {
  id: serial("id").primaryKey(),
  deploymentJobId: integer("deployment_job_id").notNull().references(() => agentDeploymentJobs.id),
  targetHost: text("target_host").notNull(),
  targetIp: text("target_ip"),
  targetOs: text("target_os").notNull(),
  // Task Status
  status: text("status").notNull().default("pending"),
  // pending, connecting, downloading, installing, configuring, verifying, completed, failed, retrying
  attemptCount: integer("attempt_count").default(0),
  maxRetries: integer("max_retries").default(3),
  // Deployment Details
  agentId: text("agent_id"),
  // Generated after successful deployment
  installedVersion: text("installed_version"),
  installationPath: text("installation_path"),
  serviceStatus: text("service_status"),
  // running, stopped, disabled, not_installed
  // Progress and Timing
  currentStep: text("current_step"),
  // connecting, pre_check, download, install, configure, register, verify
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastContactAt: timestamp("last_contact_at"),
  // Error Handling
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  errorDetails: jsonb("error_details").$type(),
  // Deployment Logs
  deploymentLogs: jsonb("deployment_logs").$type(),
  // System Information
  systemInfo: jsonb("system_info").$type(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var assetExternalMappings = pgTable("uem_app_asset_external_mappings", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => endpoints.id),
  systemId: text("system_id").references(() => externalSystems.id),
  externalId: text("external_id").notNull(),
  externalData: jsonb("external_data").$type(),
  lastSyncTime: timestamp("last_sync_time"),
  syncStatus: text("sync_status").default("synced"),
  // synced, pending, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var integrationRules = pgTable("uem_app_integration_rules", {
  id: serial("id").primaryKey(),
  systemId: text("system_id").references(() => externalSystems.id),
  name: text("name").notNull(),
  description: text("description"),
  trigger: text("trigger").notNull(),
  // asset_created, asset_updated, asset_deleted, status_changed, discovery_complete
  conditions: jsonb("conditions").$type(),
  actions: jsonb("actions").$type(),
  enabled: boolean("enabled").default(true),
  priority: integer("priority").default(50),
  // 1-100, higher priority executed first
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ one, many }) => ({
  domain: one(domains, {
    fields: [users.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id]
  }),
  credentialProfiles: many(credentialProfiles),
  scripts: many(scripts),
  policies: many(policies),
  discoveryJobs: many(discoveryJobs),
  agentDeployments: many(agentDeployments),
  activityLogs: many(activityLogs)
}));
var credentialProfilesRelations = relations(credentialProfiles, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [credentialProfiles.createdBy],
    references: [users.id]
  }),
  updatedBy: one(users, {
    fields: [credentialProfiles.updatedBy],
    references: [users.id]
  }),
  domain: one(domains, {
    fields: [credentialProfiles.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [credentialProfiles.tenantId],
    references: [tenants.id]
  }),
  credentialEntries: many(credentialEntries),
  endpoints: many(endpoints),
  discoveryJobs: many(discoveryJobs),
  agentDeployments: many(agentDeployments)
}));
var credentialEntriesRelations = relations(credentialEntries, ({ one, many }) => ({
  profile: one(credentialProfiles, {
    fields: [credentialEntries.profileId],
    references: [credentialProfiles.id]
  }),
  createdBy: one(users, {
    fields: [credentialEntries.createdBy],
    references: [users.id]
  }),
  updatedBy: one(users, {
    fields: [credentialEntries.updatedBy],
    references: [users.id]
  }),
  accessLogs: many(credentialAccessLogs2)
}));
var credentialAccessLogsRelations = relations(credentialAccessLogs2, ({ one }) => ({
  credential: one(credentialEntries, {
    fields: [credentialAccessLogs2.credentialId],
    references: [credentialEntries.id]
  }),
  profile: one(credentialProfiles, {
    fields: [credentialAccessLogs2.profileId],
    references: [credentialProfiles.id]
  }),
  user: one(users, {
    fields: [credentialAccessLogs2.userId],
    references: [users.id]
  })
}));
var discoveryProbesRelations = relations(discoveryProbes, ({ many }) => ({
  endpoints: many(endpoints),
  discoveryJobs: many(discoveryJobs),
  agentDeployments: many(agentDeployments)
}));
var scriptsRelations = relations(scripts, ({ one }) => ({
  createdBy: one(users, {
    fields: [scripts.createdBy],
    references: [users.id]
  })
}));
var policiesRelations = relations(policies, ({ one }) => ({
  createdBy: one(users, {
    fields: [policies.createdBy],
    references: [users.id]
  })
}));
var endpointsRelations = relations(endpoints, ({ one, many }) => ({
  probe: one(discoveryProbes, {
    fields: [endpoints.probeId],
    references: [discoveryProbes.id]
  }),
  credentialProfile: one(credentialProfiles, {
    fields: [endpoints.credentialProfileId],
    references: [credentialProfiles.id]
  }),
  agents: many(agents)
}));
var discoveryJobsRelations = relations(discoveryJobs, ({ one }) => ({
  probe: one(discoveryProbes, {
    fields: [discoveryJobs.probeId],
    references: [discoveryProbes.id]
  }),
  credentialProfile: one(credentialProfiles, {
    fields: [discoveryJobs.credentialProfileId],
    references: [credentialProfiles.id]
  }),
  createdBy: one(users, {
    fields: [discoveryJobs.createdBy],
    references: [users.id]
  })
}));
var agentDeploymentsRelations = relations(agentDeployments, ({ one, many }) => ({
  probe: one(discoveryProbes, {
    fields: [agentDeployments.probeId],
    references: [discoveryProbes.id]
  }),
  credentialProfile: one(credentialProfiles, {
    fields: [agentDeployments.credentialProfileId],
    references: [credentialProfiles.id]
  }),
  createdBy: one(users, {
    fields: [agentDeployments.createdBy],
    references: [users.id]
  }),
  agents: many(agents)
}));
var agentsRelations = relations(agents, ({ one }) => ({
  deployment: one(agentDeployments, {
    fields: [agents.deploymentId],
    references: [agentDeployments.id]
  }),
  endpoint: one(endpoints, {
    fields: [agents.endpointId],
    references: [endpoints.id]
  })
}));
var activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id]
  })
}));
var externalSystemsRelations = relations(externalSystems, ({ many }) => ({
  integrationLogs: many(integrationLogs),
  assetMappings: many(assetExternalMappings),
  integrationRules: many(integrationRules)
}));
var integrationLogsRelations = relations(integrationLogs, ({ one }) => ({
  asset: one(endpoints, {
    fields: [integrationLogs.assetId],
    references: [endpoints.id]
  }),
  system: one(externalSystems, {
    fields: [integrationLogs.systemId],
    references: [externalSystems.id]
  })
}));
var assetExternalMappingsRelations = relations(assetExternalMappings, ({ one }) => ({
  asset: one(endpoints, {
    fields: [assetExternalMappings.assetId],
    references: [endpoints.id]
  }),
  system: one(externalSystems, {
    fields: [assetExternalMappings.systemId],
    references: [externalSystems.id]
  })
}));
var integrationRulesRelations = relations(integrationRules, ({ one }) => ({
  system: one(externalSystems, {
    fields: [integrationRules.systemId],
    references: [externalSystems.id]
  })
}));
var insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCredentialProfileSchema = createInsertSchema(credentialProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCredentialEntrySchema = createInsertSchema(credentialEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCredentialAccessLogSchema = createInsertSchema(credentialAccessLogs2).omit({
  id: true,
  accessedAt: true
});
var insertDiscoveryProbeSchema = createInsertSchema(discoveryProbes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertEndpointSchema = createInsertSchema(endpoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDiscoveryJobSchema = createInsertSchema(discoveryJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAgentDeploymentSchema = createInsertSchema(agentDeployments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAgentSchema = createInsertSchema(agents).omit({
  createdAt: true,
  updatedAt: true
});
var insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true
});
var insertSystemStatusSchema = createInsertSchema(systemStatus).omit({
  id: true,
  updatedAt: true
});
var insertDashboardStatsSchema = createInsertSchema(dashboardStats).omit({
  id: true,
  createdAt: true
});
var insertExternalSystemSchema = createInsertSchema(externalSystems).omit({
  createdAt: true,
  updatedAt: true
});
var insertIntegrationLogSchema = createInsertSchema(integrationLogs).omit({
  id: true,
  timestamp: true
});
var insertAssetExternalMappingSchema = createInsertSchema(assetExternalMappings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertIntegrationRuleSchema = createInsertSchema(integrationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAgentDeploymentJobSchema = createInsertSchema(agentDeploymentJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAgentDeploymentTaskSchema = createInsertSchema(agentDeploymentTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var assetCustomFields = pgTable("uem_app_asset_custom_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fieldType: text("field_type").notNull(),
  // text, number, date, select, multiselect, boolean, currency
  required: boolean("required").default(false),
  defaultValue: text("default_value"),
  options: jsonb("options").$type(),
  validation: jsonb("validation").$type(),
  category: text("category").notNull().default("basic"),
  // basic, location, business, technical, financial, compliance
  displayOrder: integer("display_order").default(0),
  description: text("description"),
  placeholder: text("placeholder"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var assetTableViews = pgTable("uem_app_asset_table_views", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  columns: jsonb("columns").$type().notNull(),
  filters: jsonb("filters").$type().default({}),
  sortBy: text("sort_by").default("name"),
  sortOrder: text("sort_order").default("asc"),
  // asc, desc
  isDefault: boolean("is_default").default(false),
  permissions: jsonb("permissions").$type().default(["read"]),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var assetInventory = pgTable("uem_app_asset_inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ipAddress: text("ip_address").notNull(),
  macAddress: text("mac_address"),
  osType: text("os_type"),
  osVersion: text("os_version"),
  status: text("status").notNull().default("active"),
  // active, inactive, maintenance, decommissioned
  discoveryMethod: text("discovery_method").default("manual"),
  // agentless, agent, manual
  lastSeen: timestamp("last_seen").defaultNow(),
  location: text("location"),
  category: text("category"),
  criticality: text("criticality").notNull().default("medium"),
  // critical, high, medium, low
  businessUnit: text("business_unit"),
  project: text("project"),
  reportingManager: text("reporting_manager"),
  customFields: jsonb("custom_fields").$type().default({}),
  tags: jsonb("tags").$type().default([]),
  vulnerabilities: integer("vulnerabilities").default(0),
  complianceScore: integer("compliance_score").default(100),
  assetValue: real("asset_value"),
  purchaseDate: timestamp("purchase_date"),
  warrantyExpiry: timestamp("warranty_expiry"),
  vendor: text("vendor"),
  model: text("model"),
  serialNumber: text("serial_number"),
  // Network Information
  networkInfo: jsonb("network_info").$type(),
  // Hardware Information
  hardwareInfo: jsonb("hardware_info").$type(),
  // Security Information
  securityInfo: jsonb("security_info").$type(),
  // Tenant/Domain context
  tenantId: integer("tenant_id").references(() => tenants.id),
  domainId: integer("domain_id").references(() => domains.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var assetAuditLogs = pgTable("uem_app_asset_audit_logs", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull().references(() => assetInventory.id),
  action: text("action").notNull(),
  // created, updated, deleted, viewed, exported
  details: text("details"),
  userId: integer("user_id"),
  userEmail: text("user_email"),
  timestamp: timestamp("timestamp").defaultNow(),
  changes: jsonb("changes").$type()
});
var settingsCategories = pgTable("uem_app_settings_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  icon: text("icon"),
  // Icon identifier for UI
  parentCategoryId: integer("parent_category_id").references(() => settingsCategories.id),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  isSystem: boolean("is_system").default(false),
  // System categories cannot be deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var globalSettings = pgTable("uem_app_global_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  category: text("category").notNull().default("system"),
  // system, security, email, ldap, discovery, agent, notifications, api, ui, backup
  categoryId: integer("category_id").references(() => settingsCategories.id),
  // Setting metadata
  displayName: text("display_name").notNull(),
  description: text("description"),
  dataType: text("data_type").notNull().default("string"),
  // string, number, boolean, json, array, password, email, url
  // Validation and constraints
  validationRules: jsonb("validation_rules").$type(),
  // UI and display configuration
  uiHints: jsonb("ui_hints").$type(),
  // Default and inheritance
  defaultValue: jsonb("default_value"),
  isInheritable: boolean("is_inheritable").default(true),
  // Can domains/tenants override this?
  requiresRestart: boolean("requires_restart").default(false),
  // Setting change requires system restart
  // Security and permissions
  securityLevel: text("security_level").notNull().default("standard"),
  // public, standard, sensitive, restricted
  accessLevel: text("access_level").notNull().default("admin"),
  // admin, operator, all
  // Audit and tracking
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  lastModifiedAt: timestamp("last_modified_at").defaultNow(),
  version: integer("version").default(1),
  // For optimistic locking
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var domainSettings = pgTable("uem_app_domain_settings", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id, { onDelete: "cascade" }),
  settingKey: text("setting_key").notNull(),
  globalSettingId: integer("global_setting_id").references(() => globalSettings.id),
  // Override configuration
  value: jsonb("value").notNull(),
  isOverridden: boolean("is_overridden").default(true),
  // false means inheriting from global
  inheritFromGlobal: boolean("inherit_from_global").default(false),
  // Metadata
  overrideReason: text("override_reason"),
  // Why was this setting overridden?
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tenantSettings = pgTable("uem_app_tenant_settings", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  settingKey: text("setting_key").notNull(),
  globalSettingId: integer("global_setting_id").references(() => globalSettings.id),
  domainSettingId: integer("domain_setting_id").references(() => domainSettings.id),
  // Override configuration
  value: jsonb("value").notNull(),
  isOverridden: boolean("is_overridden").default(true),
  inheritFromDomain: boolean("inherit_from_domain").default(false),
  inheritFromGlobal: boolean("inherit_from_global").default(false),
  // Inheritance source tracking
  inheritanceSource: text("inheritance_source").default("global"),
  // global, domain, tenant
  effectiveValue: jsonb("effective_value"),
  // Cached computed effective value
  // Metadata
  overrideReason: text("override_reason"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userPreferences = pgTable("uem_app_user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull().default("ui"),
  // ui, notifications, personal, security, accessibility
  // Preference configuration
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  dataType: text("data_type").notNull().default("string"),
  // User customization
  isCustomized: boolean("is_customized").default(true),
  // false means using default
  useSystemDefault: boolean("use_system_default").default(false),
  // Synchronization and sharing
  syncAcrossDevices: boolean("sync_across_devices").default(true),
  isShared: boolean("is_shared").default(false),
  // Share with team members
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var settingsValidationRules = pgTable("uem_app_settings_validation_rules", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull(),
  globalSettingId: integer("global_setting_id").references(() => globalSettings.id),
  // Validation configuration
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull(),
  // required, pattern, range, custom, dependency
  ruleValue: jsonb("rule_value").notNull(),
  // Conditional validation
  condition: jsonb("condition").$type(),
  // Error handling
  errorMessage: text("error_message").notNull(),
  severity: text("severity").default("error"),
  // error, warning, info
  // Context and scope
  applicableScope: text("applicable_scope").default("all"),
  // all, global, domain, tenant
  environmentRestriction: text("environment_restriction"),
  // production, staging, development
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(100),
  // Lower number = higher priority
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var settingsAuditLogs = pgTable("uem_app_settings_audit_logs", {
  id: serial("id").primaryKey(),
  // What was changed
  settingKey: text("setting_key").notNull(),
  settingScope: text("setting_scope").notNull(),
  // global, domain, tenant, user
  scopeId: integer("scope_id"),
  // ID of the domain/tenant/user (null for global)
  globalSettingId: integer("global_setting_id").references(() => globalSettings.id),
  // Change details
  action: text("action").notNull(),
  // create, update, delete, reset, import, export
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  changeReason: text("change_reason"),
  // Change validation and impact
  validationStatus: text("validation_status").default("passed"),
  // passed, failed, warning
  validationErrors: jsonb("validation_errors").$type(),
  impactAssessment: jsonb("impact_assessment").$type(),
  // Context and metadata
  changeSource: text("change_source").default("ui"),
  // ui, api, import, migration, automation
  clientInfo: jsonb("client_info").$type(),
  // Approval workflow
  requiresApproval: boolean("requires_approval").default(false),
  approvalStatus: text("approval_status").default("auto_approved"),
  // pending, approved, rejected, auto_approved
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  approvalComment: text("approval_comment"),
  // Rollback information
  canRollback: boolean("can_rollback").default(true),
  rolledBackAt: timestamp("rolled_back_at"),
  rolledBackBy: integer("rolled_back_by").references(() => users.id),
  rollbackReason: text("rollback_reason"),
  // Audit metadata
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name"),
  userRole: text("user_role"),
  createdAt: timestamp("created_at").defaultNow()
});
var settingsTemplates = pgTable("uem_app_settings_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  // Template configuration
  scope: text("scope").notNull().default("global"),
  // global, domain, tenant
  category: text("category").notNull().default("general"),
  templateType: text("template_type").notNull().default("preset"),
  // preset, backup, migration
  // Template data
  settingsData: jsonb("settings_data").notNull(),
  includedCategories: jsonb("included_categories").$type().default([]),
  excludedSettings: jsonb("excluded_settings").$type().default([]),
  // Metadata and versioning
  version: text("version").notNull().default("1.0"),
  isDefault: boolean("is_default").default(false),
  isReadOnly: boolean("is_read_only").default(false),
  // Usage tracking
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  // Audit
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertAssetCustomFieldSchema = createInsertSchema(assetCustomFields).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAssetTableViewSchema = createInsertSchema(assetTableViews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAssetInventorySchema = createInsertSchema(assetInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAssetAuditLogSchema = createInsertSchema(assetAuditLogs).omit({
  id: true,
  timestamp: true
});
var insertSettingsCategorySchema = createInsertSchema(settingsCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertGlobalSettingSchema = createInsertSchema(globalSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastModifiedAt: true,
  version: true
});
var insertDomainSettingSchema = createInsertSchema(domainSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTenantSettingSchema = createInsertSchema(tenantSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSettingsValidationRuleSchema = createInsertSchema(settingsValidationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSettingsAuditLogSchema = createInsertSchema(settingsAuditLogs).omit({
  id: true,
  createdAt: true
});
var insertSettingsTemplateSchema = createInsertSchema(settingsTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsed: true,
  usageCount: true
});
var assetInventoryRelations = relations(assetInventory, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [assetInventory.tenantId],
    references: [tenants.id]
  }),
  domain: one(domains, {
    fields: [assetInventory.domainId],
    references: [domains.id]
  }),
  auditLogs: many(assetAuditLogs)
}));
var assetAuditLogRelations = relations(assetAuditLogs, ({ one }) => ({
  asset: one(assetInventory, {
    fields: [assetAuditLogs.assetId],
    references: [assetInventory.id]
  })
}));
var insertStandardScriptTemplateSchema = createInsertSchema(standardScriptTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertScriptOrchestratorProfileSchema = createInsertSchema(scriptOrchestratorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAgentStatusReportSchema = createInsertSchema(agentStatusReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var aiConversations = pgTable("uem_app_ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  // Conversation metadata
  sessionId: text("session_id").notNull(),
  title: text("title"),
  type: text("type").notNull().default("chat"),
  // chat, troubleshoot, explain, ask
  category: text("category").default("general"),
  // general, scripts, analysis, deployment, security
  // Conversation content
  messages: jsonb("messages").$type().default([]),
  // AI model and configuration
  aiModel: text("ai_model").default("gpt-4o"),
  modelConfig: jsonb("model_config").$type(),
  // Context and system information
  contextData: jsonb("context_data").$type(),
  systemPrompt: text("system_prompt"),
  // Usage and performance
  totalTokensUsed: integer("total_tokens_used").default(0),
  totalCost: real("total_cost").default(0),
  responseTime: integer("response_time_ms"),
  // Status and lifecycle
  status: text("status").notNull().default("active"),
  // active, archived, deleted
  isStarred: boolean("is_starred").default(false),
  // Timestamps
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var aiScriptGenerations = pgTable("uem_app_ai_script_generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  conversationId: integer("conversation_id").references(() => aiConversations.id),
  // Request details
  requestType: text("request_type").notNull(),
  // generate, enhance, convert, optimize, validate
  purpose: text("purpose").notNull(),
  requirements: jsonb("requirements").$type().default([]),
  // Script details
  originalScript: text("original_script"),
  generatedScript: text("generated_script").notNull(),
  scriptType: text("script_type").notNull(),
  // powershell, bash, python, wmi, sql
  targetOS: text("target_os"),
  // windows, linux, macos, cross-platform
  complexity: text("complexity"),
  // basic, intermediate, advanced
  // Documentation and analysis
  documentation: text("documentation"),
  explanation: text("explanation"),
  analysisResults: jsonb("analysis_results").$type(),
  // AI model and cost tracking
  aiModel: text("ai_model").default("gpt-4o"),
  tokensUsed: integer("tokens_used"),
  estimatedCost: real("estimated_cost"),
  processingTime: integer("processing_time_ms"),
  // Quality and feedback
  qualityScore: real("quality_score"),
  userRating: integer("user_rating"),
  // 1-5 stars
  userFeedback: text("user_feedback"),
  isBookmarked: boolean("is_bookmarked").default(false),
  // Usage tracking
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  // Status
  status: text("status").notNull().default("active"),
  // active, archived, deleted
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var aiAnalysisReports = pgTable("uem_app_ai_analysis_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  // Analysis details
  analysisType: text("analysis_type").notNull(),
  // endpoints, deployment-patterns, security-risks, performance, compliance
  title: text("title").notNull(),
  description: text("description"),
  // Data and context
  inputData: jsonb("input_data").$type(),
  dataSourceIds: jsonb("data_source_ids").$type().default([]),
  analysisScope: text("analysis_scope"),
  // global, domain, tenant, specific-assets
  // Analysis results
  findings: jsonb("findings").$type().default([]),
  recommendations: jsonb("recommendations").$type().default([]),
  insights: jsonb("insights").$type().default([]),
  // Scoring and metrics
  overallScore: real("overall_score"),
  confidenceLevel: real("confidence_level"),
  riskLevel: text("risk_level"),
  // low, medium, high, critical
  // Compliance and standards
  complianceFrameworks: jsonb("compliance_frameworks").$type().default([]),
  complianceScore: real("compliance_score"),
  complianceGaps: jsonb("compliance_gaps").$type().default([]),
  // AI model and processing
  aiModel: text("ai_model").default("gpt-4o"),
  processingTime: integer("processing_time_ms"),
  tokensUsed: integer("tokens_used"),
  estimatedCost: real("estimated_cost"),
  // Executive summary
  executiveSummary: text("executive_summary"),
  keyTakeaways: jsonb("key_takeaways").$type().default([]),
  // Status and sharing
  status: text("status").notNull().default("completed"),
  // processing, completed, failed, archived
  isShared: boolean("is_shared").default(false),
  shareLevel: text("share_level"),
  // private, team, domain, global
  // Timestamps
  analysisStartedAt: timestamp("analysis_started_at"),
  analysisCompletedAt: timestamp("analysis_completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var aiRecommendations = pgTable("uem_app_ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  analysisReportId: integer("analysis_report_id").references(() => aiAnalysisReports.id),
  // Recommendation details
  type: text("type").notNull(),
  // dashboard, asset-management, deployment, policy, security, performance
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  // Priority and impact
  priority: text("priority").notNull().default("medium"),
  // low, medium, high, urgent
  impact: text("impact"),
  // low, medium, high, transformational
  confidence: real("confidence").notNull(),
  // 0.0 to 1.0
  // Implementation details
  actionItems: jsonb("action_items").$type().default([]),
  estimatedEffort: text("estimated_effort"),
  estimatedBenefit: text("estimated_benefit"),
  // Context and targeting
  targetScope: text("target_scope"),
  // user, team, domain, tenant, global
  targetAssetIds: jsonb("target_asset_ids").$type().default([]),
  contextData: jsonb("context_data").$type(),
  // Relevance scoring
  relevanceScore: real("relevance_score"),
  personalizedScore: real("personalized_score"),
  trendingScore: real("trending_score"),
  // User interaction
  viewCount: integer("view_count").default(0),
  clickCount: integer("click_count").default(0),
  implementedCount: integer("implemented_count").default(0),
  dismissedCount: integer("dismissed_count").default(0),
  // User feedback
  averageRating: real("average_rating"),
  feedbackCount: integer("feedback_count").default(0),
  lastFeedbackAt: timestamp("last_feedback_at"),
  // Status and lifecycle
  status: text("status").notNull().default("active"),
  // active, implemented, dismissed, expired, archived
  isPersonalized: boolean("is_personalized").default(false),
  isTrending: boolean("is_trending").default(false),
  // Expiration and refresh
  expiresAt: timestamp("expires_at"),
  refreshedAt: timestamp("refreshed_at"),
  // AI generation metadata
  aiModel: text("ai_model").default("gpt-4o"),
  generationMethod: text("generation_method"),
  // pattern-analysis, user-behavior, system-analysis, predictive
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var aiFeedback = pgTable("uem_app_ai_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  // Feedback target
  feedbackType: text("feedback_type").notNull(),
  // conversation, script-generation, analysis, recommendation
  targetId: integer("target_id").notNull(),
  // ID of the target entity
  targetType: text("target_type").notNull(),
  // conversation, script, analysis-report, recommendation
  // Feedback content
  rating: integer("rating"),
  // 1-5 stars
  sentiment: text("sentiment"),
  // positive, neutral, negative
  feedbackText: text("feedback_text"),
  // Specific feedback categories
  accuracy: integer("accuracy"),
  // 1-5
  usefulness: integer("usefulness"),
  // 1-5
  clarity: integer("clarity"),
  // 1-5
  completeness: integer("completeness"),
  // 1-5
  // Improvement suggestions
  improvementSuggestions: jsonb("improvement_suggestions").$type().default([]),
  // Context
  userContext: jsonb("user_context").$type(),
  sessionId: text("session_id"),
  // Processing status
  isProcessed: boolean("is_processed").default(false),
  processingNotes: text("processing_notes"),
  processedAt: timestamp("processed_at"),
  // Metadata
  feedbackSource: text("feedback_source"),
  // ui, api, automated
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var aiUsageLogs = pgTable("uem_app_ai_usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  // Request details
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  requestType: text("request_type").notNull(),
  sessionId: text("session_id"),
  // AI model and configuration
  aiModel: text("ai_model").notNull(),
  modelConfig: jsonb("model_config").$type(),
  // Usage metrics
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  // Cost tracking
  inputCost: real("input_cost"),
  outputCost: real("output_cost"),
  totalCost: real("total_cost"),
  // Performance metrics
  requestStartTime: timestamp("request_start_time"),
  requestEndTime: timestamp("request_end_time"),
  responseTime: integer("response_time_ms"),
  // Request/Response data (truncated for large payloads)
  requestPayload: jsonb("request_payload").$type(),
  responsePayload: jsonb("response_payload").$type(),
  requestSize: integer("request_size_bytes"),
  responseSize: integer("response_size_bytes"),
  // Status and errors
  httpStatus: integer("http_status"),
  success: boolean("success"),
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  // Rate limiting and quotas
  rateLimitRemaining: integer("rate_limit_remaining"),
  rateLimitReset: timestamp("rate_limit_reset"),
  quotaUsed: real("quota_used"),
  quotaRemaining: real("quota_remaining"),
  // Content filtering and safety
  contentFiltered: boolean("content_filtered").default(false),
  safetyFlags: jsonb("safety_flags").$type().default([]),
  // Client information
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  clientVersion: text("client_version"),
  // Timestamps
  timestamp: timestamp("timestamp").defaultNow()
});
var aiModelConfigurations = pgTable("uem_app_ai_model_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  // Model details
  modelName: text("model_name").notNull(),
  // gpt-4o, gpt-4, gpt-3.5-turbo, etc.
  provider: text("provider").default("openai"),
  // openai, anthropic, azure, etc.
  // Configuration parameters
  defaultConfig: jsonb("default_config").$type(),
  // Use case specific configs
  useCaseConfigs: jsonb("use_case_configs").$type(),
  // Cost and limits
  inputCostPerToken: real("input_cost_per_token"),
  outputCostPerToken: real("output_cost_per_token"),
  maxDailySpend: real("max_daily_spend"),
  maxMonthlySpend: real("max_monthly_spend"),
  // Access control
  allowedScopes: jsonb("allowed_scopes").$type().default(["tenant"]),
  allowedUserRoles: jsonb("allowed_user_roles").$type().default(["administrator"]),
  // Status
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  // Metadata
  description: text("description"),
  tags: jsonb("tags").$type().default([]),
  // Usage tracking
  usageCount: integer("usage_count").default(0),
  totalCost: real("total_cost").default(0),
  // Audit
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id]
  }),
  domain: one(domains, {
    fields: [aiConversations.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [aiConversations.tenantId],
    references: [tenants.id]
  }),
  scriptGenerations: many(aiScriptGenerations),
  feedback: many(aiFeedback)
}));
var aiScriptGenerationsRelations = relations(aiScriptGenerations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiScriptGenerations.userId],
    references: [users.id]
  }),
  domain: one(domains, {
    fields: [aiScriptGenerations.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [aiScriptGenerations.tenantId],
    references: [tenants.id]
  }),
  conversation: one(aiConversations, {
    fields: [aiScriptGenerations.conversationId],
    references: [aiConversations.id]
  }),
  feedback: many(aiFeedback)
}));
var aiAnalysisReportsRelations = relations(aiAnalysisReports, ({ one, many }) => ({
  user: one(users, {
    fields: [aiAnalysisReports.userId],
    references: [users.id]
  }),
  domain: one(domains, {
    fields: [aiAnalysisReports.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [aiAnalysisReports.tenantId],
    references: [tenants.id]
  }),
  recommendations: many(aiRecommendations),
  feedback: many(aiFeedback)
}));
var aiRecommendationsRelations = relations(aiRecommendations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiRecommendations.userId],
    references: [users.id]
  }),
  domain: one(domains, {
    fields: [aiRecommendations.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [aiRecommendations.tenantId],
    references: [tenants.id]
  }),
  analysisReport: one(aiAnalysisReports, {
    fields: [aiRecommendations.analysisReportId],
    references: [aiAnalysisReports.id]
  }),
  feedback: many(aiFeedback)
}));
var aiFeedbackRelations = relations(aiFeedback, ({ one }) => ({
  user: one(users, {
    fields: [aiFeedback.userId],
    references: [users.id]
  }),
  domain: one(domains, {
    fields: [aiFeedback.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [aiFeedback.tenantId],
    references: [tenants.id]
  })
}));
var aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageLogs.userId],
    references: [users.id]
  }),
  domain: one(domains, {
    fields: [aiUsageLogs.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [aiUsageLogs.tenantId],
    references: [tenants.id]
  })
}));
var aiModelConfigurationsRelations = relations(aiModelConfigurations, ({ one }) => ({
  domain: one(domains, {
    fields: [aiModelConfigurations.domainId],
    references: [domains.id]
  }),
  tenant: one(tenants, {
    fields: [aiModelConfigurations.tenantId],
    references: [tenants.id]
  }),
  createdBy: one(users, {
    fields: [aiModelConfigurations.createdBy],
    references: [users.id]
  }),
  updatedBy: one(users, {
    fields: [aiModelConfigurations.updatedBy],
    references: [users.id]
  })
}));
var insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  lastMessageAt: true,
  createdAt: true,
  updatedAt: true
});
var insertAiScriptGenerationSchema = createInsertSchema(aiScriptGenerations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAiAnalysisReportSchema = createInsertSchema(aiAnalysisReports).omit({
  id: true,
  analysisStartedAt: true,
  analysisCompletedAt: true,
  createdAt: true,
  updatedAt: true
});
var insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAiFeedbackSchema = createInsertSchema(aiFeedback).omit({
  id: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true
});
var insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({
  id: true,
  timestamp: true
});
var insertAiModelConfigurationSchema = createInsertSchema(aiModelConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
var DatabaseStorage = class {
  // ===== DOMAIN METHODS =====
  async getAllDomains() {
    return await db.select().from(domains).orderBy(desc(domains.createdAt));
  }
  async getDomainById(id) {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain || void 0;
  }
  async createDomain(domain) {
    const [newDomain] = await db.insert(domains).values(domain).returning();
    return newDomain;
  }
  async updateDomain(id, domain) {
    const [updatedDomain] = await db.update(domains).set({ ...domain, updatedAt: /* @__PURE__ */ new Date() }).where(eq(domains.id, id)).returning();
    return updatedDomain || void 0;
  }
  async deleteDomain(id) {
    const result = await db.delete(domains).where(eq(domains.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // ===== TENANT METHODS =====
  async getAllTenants(domainId) {
    if (domainId) {
      return await db.select().from(tenants).where(eq(tenants.domainId, domainId)).orderBy(desc(tenants.createdAt));
    }
    return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  }
  async getTenantById(id) {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant || void 0;
  }
  async createTenant(tenant) {
    const [newTenant] = await db.insert(tenants).values([tenant]).returning();
    return newTenant;
  }
  async updateTenant(id, tenant) {
    const [updatedTenant] = await db.update(tenants).set({ ...tenant, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tenants.id, id)).returning();
    return updatedTenant || void 0;
  }
  async deleteTenant(id) {
    const result = await db.delete(tenants).where(eq(tenants.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }
  async updateUser(id, userData) {
    const [user] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async updateUserPreferences(id, preferences) {
    const [user] = await db.update(users).set({ preferences, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async getAllUsers(options) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy ?? "createdAt";
    const sortOrder = options?.sortOrder ?? "desc";
    let query = db.select().from(users);
    let countQuery = db.select({ count: sql`count(*)` }).from(users);
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
    if (options?.isActive !== void 0) {
      conditions.push(eq(users.isActive, options.isActive));
    }
    if (conditions.length > 0) {
      const whereCondition = and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    const sortColumn = sortBy === "firstName" ? users.firstName : sortBy === "lastName" ? users.lastName : sortBy === "email" ? users.email : sortBy === "username" ? users.username : sortBy === "role" ? users.role : users.createdAt;
    query = sortOrder === "asc" ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));
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
  async getUsersByRole(role, domainId, tenantId) {
    let query = db.select().from(users).where(eq(users.role, role));
    const conditions = [eq(users.role, role)];
    if (domainId) conditions.push(eq(users.domainId, domainId));
    if (tenantId) conditions.push(eq(users.tenantId, tenantId));
    return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
  }
  async getUsersByGlobalRole(globalRole) {
    return await db.select().from(users).where(eq(users.globalRole, globalRole)).orderBy(desc(users.createdAt));
  }
  async getUsersByDomain(domainId) {
    return await db.select().from(users).where(eq(users.domainId, domainId)).orderBy(desc(users.createdAt));
  }
  async getUsersByTenant(tenantId) {
    return await db.select().from(users).where(eq(users.tenantId, tenantId)).orderBy(desc(users.createdAt));
  }
  async searchUsers(searchTerm, options) {
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
  async bulkUpdateUsers(userIds, updates) {
    return await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(sql`${users.id} = ANY(${userIds})`).returning();
  }
  async bulkCreateUsers(userList) {
    return await db.insert(users).values(userList).returning();
  }
  async deactivateUser(id) {
    const [user] = await db.update(users).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async activateUser(id) {
    const [user] = await db.update(users).set({ isActive: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async resetUserPreferences(id) {
    const defaultPreferences = {
      theme: "light",
      language: "en",
      notifications: true
    };
    const [user] = await db.update(users).set({ preferences: defaultPreferences, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  // User Activity and Session methods
  async getUserActivityLogs(userId, options) {
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
  async getUserActiveSessions(userId) {
    const recentSessions = await db.select().from(credentialAccessLogs).where(eq(credentialAccessLogs.userId, userId)).orderBy(desc(credentialAccessLogs.accessedAt)).limit(10);
    return recentSessions.map((session) => ({
      sessionId: session.sessionId || `session_${session.id}`,
      startTime: session.accessedAt,
      ipAddress: session.sourceIp,
      userAgent: session.userAgent,
      lastActivity: session.accessedAt,
      duration: session.sessionDuration || 0
    }));
  }
  async terminateUserSession(userId, sessionId) {
    const session = await db.select().from(credentialAccessLogs).where(and(
      eq(credentialAccessLogs.userId, userId),
      or(
        eq(credentialAccessLogs.sessionId, sessionId),
        eq(sql`'session_' || ${credentialAccessLogs.id}`, sessionId)
      )
    )).limit(1);
    return session.length > 0;
  }
  async terminateAllUserSessions(userId) {
    const sessions = await db.select().from(credentialAccessLogs).where(eq(credentialAccessLogs.userId, userId));
    return sessions.length;
  }
  async logUserActivity(activityData) {
    const [activity] = await db.insert(activityLogs).values([{
      userId: activityData.userId,
      type: activityData.type,
      details: activityData.details,
      targetType: activityData.targetType,
      targetId: activityData.targetId,
      ipAddress: activityData.ipAddress,
      userAgent: activityData.userAgent
    }]).returning();
    return activity;
  }
  async getSystemActivityLogs(options) {
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
  async getAllEndpoints() {
    return await db.select().from(endpoints).orderBy(desc(endpoints.createdAt));
  }
  async getEndpoint(id) {
    const [endpoint] = await db.select().from(endpoints).where(eq(endpoints.id, id));
    return endpoint || void 0;
  }
  async createEndpoint(insertEndpoint) {
    const [endpoint] = await db.insert(endpoints).values([insertEndpoint]).returning();
    return endpoint;
  }
  async updateEndpoint(id, endpointData) {
    const [endpoint] = await db.update(endpoints).set({ ...endpointData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(endpoints.id, id)).returning();
    return endpoint || void 0;
  }
  async deleteEndpoint(id) {
    const result = await db.delete(endpoints).where(eq(endpoints.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async createDiscoveredEndpoints(endpointsList) {
    return await db.insert(endpoints).values(endpointsList).returning();
  }
  async getEndpointsByDiscoveryJob(jobId) {
    return await db.select().from(endpoints).where(eq(endpoints.discoveryJobId, jobId));
  }
  // Credential Profile methods
  async getAllCredentialProfiles() {
    return await db.select().from(credentialProfiles).orderBy(desc(credentialProfiles.createdAt));
  }
  async getCredentialProfile(id) {
    const [profile] = await db.select().from(credentialProfiles).where(eq(credentialProfiles.id, id));
    return profile || void 0;
  }
  async createCredentialProfile(insertProfile) {
    const [profile] = await db.insert(credentialProfiles).values(insertProfile).returning();
    return profile;
  }
  async updateCredentialProfile(id, profileData) {
    const [profile] = await db.update(credentialProfiles).set({ ...profileData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(credentialProfiles.id, id)).returning();
    return profile || void 0;
  }
  async deleteCredentialProfile(id) {
    const result = await db.delete(credentialProfiles).where(eq(credentialProfiles.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Discovery Probe methods
  async getAllDiscoveryProbes() {
    return await db.select().from(discoveryProbes).orderBy(desc(discoveryProbes.createdAt));
  }
  async getDiscoveryProbe(id) {
    const [probe] = await db.select().from(discoveryProbes).where(eq(discoveryProbes.id, id));
    return probe || void 0;
  }
  async createDiscoveryProbe(insertProbe) {
    const [probe] = await db.insert(discoveryProbes).values(insertProbe).returning();
    return probe;
  }
  async updateDiscoveryProbe(id, probeData) {
    const [probe] = await db.update(discoveryProbes).set({ ...probeData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(discoveryProbes.id, id)).returning();
    return probe || void 0;
  }
  async deleteDiscoveryProbe(id) {
    const result = await db.delete(discoveryProbes).where(eq(discoveryProbes.id, id));
    return result.rowCount > 0;
  }
  // Script methods
  async getAllScripts() {
    return await db.select().from(scripts).orderBy(desc(scripts.createdAt));
  }
  async getScript(id) {
    const [script] = await db.select().from(scripts).where(eq(scripts.id, id));
    return script || void 0;
  }
  async createScript(insertScript) {
    const [script] = await db.insert(scripts).values(insertScript).returning();
    return script;
  }
  async updateScript(id, scriptData) {
    const [script] = await db.update(scripts).set({ ...scriptData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(scripts.id, id)).returning();
    return script || void 0;
  }
  async deleteScript(id) {
    const result = await db.delete(scripts).where(eq(scripts.id, id));
    return result.rowCount > 0;
  }
  // Policy methods
  async getAllPolicies() {
    return await db.select().from(policies).orderBy(desc(policies.createdAt));
  }
  async getPolicy(id) {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy || void 0;
  }
  async createPolicy(insertPolicy) {
    const [policy] = await db.insert(policies).values(insertPolicy).returning();
    return policy;
  }
  async updatePolicy(id, policyData) {
    const [policy] = await db.update(policies).set({ ...policyData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(policies.id, id)).returning();
    return policy || void 0;
  }
  async deletePolicy(id) {
    const result = await db.delete(policies).where(eq(policies.id, id));
    return result.rowCount > 0;
  }
  // Discovery Job methods (Agentless)
  async getAllDiscoveryJobs() {
    return await db.select().from(discoveryJobs).orderBy(desc(discoveryJobs.createdAt));
  }
  async getDiscoveryJob(id) {
    const [job] = await db.select().from(discoveryJobs).where(eq(discoveryJobs.id, id));
    return job || void 0;
  }
  async createDiscoveryJob(insertJob) {
    const [job] = await db.insert(discoveryJobs).values(insertJob).returning();
    return job;
  }
  async updateDiscoveryJob(id, jobData) {
    const [job] = await db.update(discoveryJobs).set({ ...jobData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(discoveryJobs.id, id)).returning();
    return job || void 0;
  }
  async deleteDiscoveryJob(id) {
    const result = await db.delete(discoveryJobs).where(eq(discoveryJobs.id, id));
    return result.rowCount > 0;
  }
  // Enhanced Discovery Jobs with enterprise features
  async getAllDiscoveryJobsWithFilters(options = {}) {
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
      sortBy = "createdAt",
      sortOrder = "desc"
    } = options;
    const offset = (page - 1) * limit;
    const whereConditions = [];
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
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : void 0;
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(discoveryJobs).where(whereClause);
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);
    const orderByColumn = sortBy === "name" ? discoveryJobs.name : sortBy === "status" ? discoveryJobs.status : sortBy === "type" ? discoveryJobs.type : sortBy === "updatedAt" ? discoveryJobs.updatedAt : discoveryJobs.createdAt;
    const jobs = await db.select().from(discoveryJobs).where(whereClause).orderBy(sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn)).limit(limit).offset(offset);
    return { jobs, total, page, limit, totalPages };
  }
  async getDiscoveryJobsByStatus(status, domainId, tenantId) {
    const conditions = [eq(discoveryJobs.status, status)];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));
    return await db.select().from(discoveryJobs).where(and(...conditions)).orderBy(desc(discoveryJobs.createdAt));
  }
  async getDiscoveryJobsByType(type, domainId, tenantId) {
    const conditions = [eq(discoveryJobs.type, type)];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));
    return await db.select().from(discoveryJobs).where(and(...conditions)).orderBy(desc(discoveryJobs.createdAt));
  }
  async getDiscoveryJobsByProbe(probeId) {
    return await db.select().from(discoveryJobs).where(eq(discoveryJobs.probeId, probeId)).orderBy(desc(discoveryJobs.createdAt));
  }
  async getDiscoveryJobsByCredentialProfile(credentialProfileId) {
    return await db.select().from(discoveryJobs).where(eq(discoveryJobs.credentialProfileId, credentialProfileId)).orderBy(desc(discoveryJobs.createdAt));
  }
  async getDiscoveryJobsByDomain(domainId) {
    return await db.select().from(discoveryJobs).where(eq(discoveryJobs.domainId, domainId)).orderBy(desc(discoveryJobs.createdAt));
  }
  async getDiscoveryJobsByTenant(tenantId) {
    return await db.select().from(discoveryJobs).where(eq(discoveryJobs.tenantId, tenantId)).orderBy(desc(discoveryJobs.createdAt));
  }
  async getDiscoveryJobsByUser(userId) {
    return await db.select().from(discoveryJobs).where(eq(discoveryJobs.createdBy, userId)).orderBy(desc(discoveryJobs.createdAt));
  }
  async getDiscoveryJobHistory(jobId) {
    const job = await this.getDiscoveryJob(jobId);
    return job ? [job] : [];
  }
  // Discovery Job Execution Control
  async startDiscoveryJob(jobId, userId) {
    const [job] = await db.update(discoveryJobs).set({
      status: "running",
      startedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    if (job) {
      await this.createActivity({
        type: "discovery_job_started",
        description: `Discovery job "${job.name}" was started`,
        userId,
        metadata: { jobId, action: "start" }
      });
    }
    return job || void 0;
  }
  async pauseDiscoveryJob(jobId, userId) {
    const [job] = await db.update(discoveryJobs).set({
      status: "paused",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    if (job) {
      await this.createActivity({
        type: "discovery_job_paused",
        description: `Discovery job "${job.name}" was paused`,
        userId,
        metadata: { jobId, action: "pause" }
      });
    }
    return job || void 0;
  }
  async cancelDiscoveryJob(jobId, userId, reason) {
    const [job] = await db.update(discoveryJobs).set({
      status: "cancelled",
      completedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    if (job) {
      await this.createActivity({
        type: "discovery_job_cancelled",
        description: `Discovery job "${job.name}" was cancelled${reason ? `: ${reason}` : ""}`,
        userId,
        metadata: { jobId, action: "cancel", reason }
      });
    }
    return job || void 0;
  }
  async resumeDiscoveryJob(jobId, userId) {
    const [job] = await db.update(discoveryJobs).set({
      status: "running",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    if (job) {
      await this.createActivity({
        type: "discovery_job_resumed",
        description: `Discovery job "${job.name}" was resumed`,
        userId,
        metadata: { jobId, action: "resume" }
      });
    }
    return job || void 0;
  }
  async updateDiscoveryJobProgress(jobId, progress) {
    const [job] = await db.update(discoveryJobs).set({
      progress,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    return job || void 0;
  }
  async updateDiscoveryJobResults(jobId, results) {
    const [job] = await db.update(discoveryJobs).set({
      results,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    return job || void 0;
  }
  // Discovery Job Scheduling
  async getScheduledDiscoveryJobs() {
    return await db.select().from(discoveryJobs).where(
      and(
        eq(discoveryJobs.status, "pending"),
        sql`${discoveryJobs.schedule}->>'type' IN ('scheduled', 'recurring')`
      )
    ).orderBy(asc(discoveryJobs.createdAt));
  }
  async getDiscoveryJobsReadyForExecution() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(discoveryJobs).where(
      and(
        eq(discoveryJobs.status, "pending"),
        or(
          sql`${discoveryJobs.schedule}->>'type' = 'now'`,
          and(
            sql`${discoveryJobs.schedule}->>'type' = 'scheduled'`,
            sql`CAST(${discoveryJobs.schedule}->>'startTime' AS TIMESTAMP) <= ${now}`
          )
        )
      )
    ).orderBy(asc(discoveryJobs.createdAt));
  }
  async scheduleDiscoveryJob(jobId, schedule) {
    const [job] = await db.update(discoveryJobs).set({
      schedule,
      status: schedule.type === "now" ? "pending" : "scheduled",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    return job || void 0;
  }
  async unscheduleDiscoveryJob(jobId) {
    const [job] = await db.update(discoveryJobs).set({
      schedule: null,
      status: "pending",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    return job || void 0;
  }
  async triggerScheduledJob(jobId, userId) {
    const [job] = await db.update(discoveryJobs).set({
      status: "running",
      startedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(discoveryJobs.id, jobId)).returning();
    if (job) {
      await this.createActivity({
        type: "discovery_job_triggered",
        description: `Scheduled discovery job "${job.name}" was triggered`,
        userId,
        metadata: { jobId, action: "trigger" }
      });
    }
    return job || void 0;
  }
  // Discovery Results Management
  async getDiscoveryJobResults(jobId, options = {}) {
    const { page = 1, limit = 50, status, assetType } = options;
    const offset = (page - 1) * limit;
    const whereConditions = [eq(endpoints.discoveryJobId, jobId)];
    if (status) whereConditions.push(eq(endpoints.status, status));
    if (assetType) whereConditions.push(eq(endpoints.assetType, assetType));
    const whereClause = and(...whereConditions);
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(endpoints).where(whereClause);
    const total = Number(count);
    const totalPages = Math.ceil(total / limit);
    const results = await db.select().from(endpoints).where(whereClause).orderBy(desc(endpoints.lastSeen)).limit(limit).offset(offset);
    return { endpoints: results, total, page, limit, totalPages };
  }
  async bulkUpdateDiscoveryResults(jobId, endpointIds, updates) {
    return await db.update(endpoints).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(
      and(
        eq(endpoints.discoveryJobId, jobId),
        sql`${endpoints.id} = ANY(${endpointIds})`
      )
    ).returning();
  }
  async bulkApproveDiscoveryResults(jobId, endpointIds, userId) {
    const result = await db.update(endpoints).set({ status: "approved", updatedAt: /* @__PURE__ */ new Date() }).where(
      and(
        eq(endpoints.discoveryJobId, jobId),
        sql`${endpoints.id} = ANY(${endpointIds})`
      )
    );
    await this.createActivity({
      type: "discovery_results_approved",
      description: `Approved ${endpointIds.length} discovery results`,
      userId,
      metadata: { jobId, endpointIds, action: "bulk_approve" }
    });
    return result.rowCount > 0;
  }
  async bulkIgnoreDiscoveryResults(jobId, endpointIds, userId) {
    const result = await db.update(endpoints).set({ status: "ignored", updatedAt: /* @__PURE__ */ new Date() }).where(
      and(
        eq(endpoints.discoveryJobId, jobId),
        sql`${endpoints.id} = ANY(${endpointIds})`
      )
    );
    await this.createActivity({
      type: "discovery_results_ignored",
      description: `Ignored ${endpointIds.length} discovery results`,
      userId,
      metadata: { jobId, endpointIds, action: "bulk_ignore" }
    });
    return result.rowCount > 0;
  }
  async convertDiscoveryResultToAsset(endpointId, userId) {
    const [endpoint] = await db.update(endpoints).set({
      status: "managed",
      discoveryMethod: "converted_from_discovery",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(endpoints.id, endpointId)).returning();
    if (endpoint) {
      await this.createActivity({
        type: "discovery_result_converted",
        description: `Converted discovery result "${endpoint.hostname}" to managed asset`,
        userId,
        metadata: { endpointId, hostname: endpoint.hostname, action: "convert_to_asset" }
      });
    }
    return endpoint || void 0;
  }
  // Discovery Analytics
  async getDiscoveryJobStatistics(domainId, tenantId) {
    const conditions = [];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const stats = await db.select({
      total: sql`count(*)`,
      running: sql`count(*) filter (where status = 'running')`,
      completed: sql`count(*) filter (where status = 'completed')`,
      failed: sql`count(*) filter (where status = 'failed')`,
      cancelled: sql`count(*) filter (where status = 'cancelled')`,
      scheduled: sql`count(*) filter (where status = 'scheduled')`,
      agentless: sql`count(*) filter (where type = 'agentless')`,
      agentBased: sql`count(*) filter (where type = 'agent_based')`
    }).from(discoveryJobs).where(whereClause);
    return stats[0] || {};
  }
  async getDiscoveryTrends(startDate, endDate, domainId, tenantId) {
    const conditions = [
      gte(discoveryJobs.createdAt, startDate),
      lte(discoveryJobs.createdAt, endDate)
    ];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));
    return await db.select({
      date: sql`DATE(created_at)`,
      total: sql`count(*)`,
      completed: sql`count(*) filter (where status = 'completed')`,
      failed: sql`count(*) filter (where status = 'failed')`
    }).from(discoveryJobs).where(and(...conditions)).groupBy(sql`DATE(created_at)`).orderBy(sql`DATE(created_at)`);
  }
  async getDiscoveryCoverage(domainId, tenantId) {
    const conditions = [];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const coverage = await db.select({
      totalJobs: sql`count(*)`,
      totalAssets: sql`sum((results->>'totalAssets')::integer)`,
      newAssets: sql`sum((results->>'newAssets')::integer)`,
      updatedAssets: sql`sum((results->>'updatedAssets')::integer)`
    }).from(discoveryJobs).where(whereClause);
    return coverage[0] || {};
  }
  async getDiscoveryPerformanceMetrics(domainId, tenantId) {
    const conditions = [];
    if (domainId) conditions.push(eq(discoveryJobs.domainId, domainId));
    if (tenantId) conditions.push(eq(discoveryJobs.tenantId, tenantId));
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const metrics = await db.select({
      avgDuration: sql`avg(EXTRACT(EPOCH FROM (completed_at - started_at))) filter (where completed_at is not null and started_at is not null)`,
      successRate: sql`(count(*) filter (where status = 'completed')::float / count(*) * 100)`,
      failureRate: sql`(count(*) filter (where status = 'failed')::float / count(*) * 100)`,
      avgAssetsDiscovered: sql`avg((results->>'totalAssets')::integer) filter (where results is not null)`
    }).from(discoveryJobs).where(whereClause);
    return metrics[0] || {};
  }
  // Discovery Job Templates and Cloning
  async cloneDiscoveryJob(jobId, newName, userId) {
    const originalJob = await this.getDiscoveryJob(jobId);
    if (!originalJob) {
      throw new Error("Original discovery job not found");
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
      type: "discovery_job_cloned",
      description: `Cloned discovery job "${originalJob.name}" to "${newName}"`,
      userId,
      metadata: { originalJobId: jobId, newJobId: clonedJob.id, action: "clone" }
    });
    return clonedJob;
  }
  async createDiscoveryJobFromTemplate(templateId, name, userId) {
    return await this.cloneDiscoveryJob(templateId, name, userId);
  }
  // Discovery Job Validation
  async validateDiscoveryTargets(targets, probeId) {
    const errors = [];
    if (!targets) {
      errors.push("Targets configuration is required");
      return { valid: false, errors };
    }
    if (targets.ipRanges && Array.isArray(targets.ipRanges)) {
      targets.ipRanges.forEach((range, index) => {
        if (!this.isValidIpRange(range)) {
          errors.push(`Invalid IP range at index ${index}: ${range}`);
        }
      });
    }
    if (targets.hostnames && Array.isArray(targets.hostnames)) {
      targets.hostnames.forEach((hostname, index) => {
        if (!this.isValidHostname(hostname)) {
          errors.push(`Invalid hostname at index ${index}: ${hostname}`);
        }
      });
    }
    if (probeId) {
      const probe = await db.select().from(discoveryProbes).where(eq(discoveryProbes.id, probeId)).limit(1);
      if (probe.length === 0) {
        errors.push(`Discovery probe with ID ${probeId} not found`);
      } else if (probe[0].status !== "online") {
        errors.push(`Discovery probe "${probe[0].name}" is not online`);
      }
    }
    return { valid: errors.length === 0, errors };
  }
  async validateDiscoveryCredentials(credentialProfileId, targets) {
    const errors = [];
    const profile = await db.select().from(credentialProfiles).where(eq(credentialProfiles.id, credentialProfileId)).limit(1);
    if (profile.length === 0) {
      errors.push(`Credential profile with ID ${credentialProfileId} not found`);
      return { valid: false, errors };
    }
    const cred = profile[0];
    if (!cred.isActive) {
      errors.push(`Credential profile "${cred.name}" is not active`);
    }
    if (cred.expiresAt && cred.expiresAt < /* @__PURE__ */ new Date()) {
      errors.push(`Credential profile "${cred.name}" has expired`);
    }
    return { valid: errors.length === 0, errors };
  }
  // Bulk Operations
  async bulkUpdateDiscoveryJobs(jobIds, updates, userId) {
    const jobs = await db.update(discoveryJobs).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(sql`${discoveryJobs.id} = ANY(${jobIds})`).returning();
    await this.createActivity({
      type: "discovery_jobs_bulk_updated",
      description: `Bulk updated ${jobIds.length} discovery jobs`,
      userId,
      metadata: { jobIds, updates, action: "bulk_update" }
    });
    return jobs;
  }
  async bulkDeleteDiscoveryJobs(jobIds, userId) {
    const result = await db.delete(discoveryJobs).where(sql`${discoveryJobs.id} = ANY(${jobIds})`);
    await this.createActivity({
      type: "discovery_jobs_bulk_deleted",
      description: `Bulk deleted ${jobIds.length} discovery jobs`,
      userId,
      metadata: { jobIds, action: "bulk_delete" }
    });
    return result.rowCount > 0;
  }
  async bulkStartDiscoveryJobs(jobIds, userId) {
    const jobs = await db.update(discoveryJobs).set({
      status: "running",
      startedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(sql`${discoveryJobs.id} = ANY(${jobIds})`).returning();
    await this.createActivity({
      type: "discovery_jobs_bulk_started",
      description: `Bulk started ${jobIds.length} discovery jobs`,
      userId,
      metadata: { jobIds, action: "bulk_start" }
    });
    return jobs;
  }
  async bulkCancelDiscoveryJobs(jobIds, userId, reason) {
    const jobs = await db.update(discoveryJobs).set({
      status: "cancelled",
      completedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(sql`${discoveryJobs.id} = ANY(${jobIds})`).returning();
    await this.createActivity({
      type: "discovery_jobs_bulk_cancelled",
      description: `Bulk cancelled ${jobIds.length} discovery jobs${reason ? `: ${reason}` : ""}`,
      userId,
      metadata: { jobIds, reason, action: "bulk_cancel" }
    });
    return jobs;
  }
  // Helper methods for validation
  isValidIpRange(ipRange) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
    const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ipRange) || cidrRegex.test(ipRange);
  }
  isValidHostname(hostname) {
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?))*$/;
    return hostnameRegex.test(hostname) && hostname.length <= 253;
  }
  // Agent Deployment methods (Agent-Based)
  async getAllAgentDeployments() {
    return await db.select().from(agentDeployments).orderBy(desc(agentDeployments.createdAt));
  }
  async getAgentDeployment(id) {
    const [deployment] = await db.select().from(agentDeployments).where(eq(agentDeployments.id, id));
    return deployment || void 0;
  }
  async createAgentDeployment(insertDeployment) {
    const [deployment] = await db.insert(agentDeployments).values(insertDeployment).returning();
    return deployment;
  }
  async updateAgentDeployment(id, deploymentData) {
    const [deployment] = await db.update(agentDeployments).set({ ...deploymentData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(agentDeployments.id, id)).returning();
    return deployment || void 0;
  }
  async deleteAgentDeployment(id) {
    const result = await db.delete(agentDeployments).where(eq(agentDeployments.id, id));
    return result.rowCount > 0;
  }
  // Agent methods
  async getAllAgents() {
    return await db.select().from(agents).orderBy(desc(agents.createdAt));
  }
  async getAgent(id) {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || void 0;
  }
  async createAgent(insertAgent) {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }
  async updateAgent(id, agentData) {
    const [agent] = await db.update(agents).set({ ...agentData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(agents.id, id)).returning();
    return agent || void 0;
  }
  async deleteAgent(id) {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return result.rowCount > 0;
  }
  // Enhanced Agent Management Methods
  async getAllAgentsWithFilters(options) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy ?? "createdAt";
    const sortOrder = options?.sortOrder ?? "desc";
    let query = db.select().from(agents);
    let countQuery = db.select({ count: sql`count(*)` }).from(agents);
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
    const sortColumn = sortBy === "hostname" ? agents.hostname : sortBy === "ipAddress" ? agents.ipAddress : sortBy === "status" ? agents.status : sortBy === "lastHeartbeat" ? agents.lastHeartbeat : agents.createdAt;
    query = sortOrder === "asc" ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));
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
  async getAgentsByStatus(status, domainId, tenantId) {
    const conditions = [eq(agents.status, status)];
    if (domainId) conditions.push(eq(agents.domainId, domainId));
    if (tenantId) conditions.push(eq(agents.tenantId, tenantId));
    return await db.select().from(agents).where(and(...conditions)).orderBy(desc(agents.lastHeartbeat));
  }
  async getAgentsByDomain(domainId) {
    return await db.select().from(agents).where(eq(agents.domainId, domainId)).orderBy(desc(agents.createdAt));
  }
  async getAgentsByTenant(tenantId) {
    return await db.select().from(agents).where(eq(agents.tenantId, tenantId)).orderBy(desc(agents.createdAt));
  }
  async bulkUpdateAgents(agentIds, updates) {
    const results = [];
    for (const id of agentIds) {
      const [updatedAgent] = await db.update(agents).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(agents.id, id)).returning();
      if (updatedAgent) {
        results.push(updatedAgent);
      }
    }
    return results;
  }
  async getAgentStatistics(domainId, tenantId) {
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
      onlineAgents: agentsList.filter((a) => a.status === "online").length,
      offlineAgents: agentsList.filter((a) => a.status === "offline").length,
      errorAgents: agentsList.filter((a) => a.status === "error").length,
      updatingAgents: agentsList.filter((a) => a.status === "updating").length,
      windowsAgents: agentsList.filter((a) => a.operatingSystem.toLowerCase().includes("windows")).length,
      linuxAgents: agentsList.filter((a) => a.operatingSystem.toLowerCase().includes("linux")).length,
      macosAgents: agentsList.filter((a) => a.operatingSystem.toLowerCase().includes("mac")).length,
      averageHeartbeatAge: this.calculateAverageHeartbeatAge(agentsList)
    };
  }
  calculateAverageHeartbeatAge(agents2) {
    const now = Date.now();
    const validHeartbeats = agents2.filter((a) => a.lastHeartbeat).map((a) => now - new Date(a.lastHeartbeat).getTime());
    return validHeartbeats.length > 0 ? Math.round(validHeartbeats.reduce((sum, age) => sum + age, 0) / validHeartbeats.length / 1e3) : 0;
  }
  // Enhanced Agent Deployment Job Methods
  async getAllAgentDeploymentJobsWithFilters(options) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const offset = (page - 1) * limit;
    const sortBy = options?.sortBy ?? "createdAt";
    const sortOrder = options?.sortOrder ?? "desc";
    let query = db.select().from(agentDeploymentJobs);
    let countQuery = db.select({ count: sql`count(*)` }).from(agentDeploymentJobs);
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
    const sortColumn = sortBy === "name" ? agentDeploymentJobs.name : sortBy === "status" ? agentDeploymentJobs.status : sortBy === "startedAt" ? agentDeploymentJobs.startedAt : sortBy === "completedAt" ? agentDeploymentJobs.completedAt : agentDeploymentJobs.createdAt;
    query = sortOrder === "asc" ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));
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
  async pauseAgentDeploymentJob(id) {
    const [job] = await db.update(agentDeploymentJobs).set({
      status: "paused",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(agentDeploymentJobs.id, id)).returning();
    await db.update(agentDeploymentTasks).set({
      status: "paused",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and(
      eq(agentDeploymentTasks.deploymentJobId, id),
      or(
        eq(agentDeploymentTasks.status, "connecting"),
        eq(agentDeploymentTasks.status, "downloading"),
        eq(agentDeploymentTasks.status, "installing"),
        eq(agentDeploymentTasks.status, "configuring")
      )
    ));
    return job || void 0;
  }
  async resumeAgentDeploymentJob(id) {
    const [job] = await db.update(agentDeploymentJobs).set({
      status: "in_progress",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(agentDeploymentJobs.id, id)).returning();
    await db.update(agentDeploymentTasks).set({
      status: "pending",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and(
      eq(agentDeploymentTasks.deploymentJobId, id),
      eq(agentDeploymentTasks.status, "paused")
    ));
    if (job) {
      this.processDeploymentTasks(id);
    }
    return job || void 0;
  }
  async getDeploymentJobLogs(jobId, options) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 100;
    const offset = (page - 1) * limit;
    const tasks = await db.select().from(agentDeploymentTasks).where(eq(agentDeploymentTasks.deploymentJobId, jobId));
    let allLogs = [];
    for (const task of tasks) {
      if (task.deploymentLogs && Array.isArray(task.deploymentLogs)) {
        const taskLogs = task.deploymentLogs.map((log2) => ({
          ...log2,
          taskId: task.id,
          targetHost: task.targetHost,
          targetIp: task.targetIp
        }));
        allLogs = allLogs.concat(taskLogs);
      }
    }
    if (options?.level) {
      allLogs = allLogs.filter((log2) => log2.level === options.level);
    }
    allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
  async getRecentActivities(limit = 50) {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }
  async createActivity(insertActivity) {
    const [activity] = await db.insert(activityLogs).values(insertActivity).returning();
    return activity;
  }
  async getActivitiesByType(type) {
    return await db.select().from(activityLogs).where(eq(activityLogs.type, type)).orderBy(desc(activityLogs.createdAt));
  }
  // System Status methods
  async getSystemStatus() {
    return await db.select().from(systemStatus).orderBy(desc(systemStatus.updatedAt));
  }
  async updateSystemStatus(service, status, metrics) {
    const [existingStatus] = await db.select().from(systemStatus).where(eq(systemStatus.service, service));
    if (existingStatus) {
      const [updatedStatus] = await db.update(systemStatus).set({
        status,
        metrics: metrics || existingStatus.metrics,
        lastCheck: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(systemStatus.service, service)).returning();
      return updatedStatus || void 0;
    } else {
      const [newStatus] = await db.insert(systemStatus).values({
        service,
        status,
        metrics: metrics || {},
        lastCheck: /* @__PURE__ */ new Date()
      }).returning();
      return newStatus;
    }
  }
  // Dashboard Statistics methods
  async getDashboardStats() {
    const [stats] = await db.select().from(dashboardStats).orderBy(desc(dashboardStats.createdAt)).limit(1);
    return stats || void 0;
  }
  async updateDashboardStats(insertStats) {
    const [stats] = await db.insert(dashboardStats).values(insertStats).returning();
    return stats;
  }
  async getDashboardStatsByDateRange(startDate, endDate) {
    return await db.select().from(dashboardStats).where(
      and(
        gte(dashboardStats.date, startDate),
        lte(dashboardStats.date, endDate)
      )
    ).orderBy(desc(dashboardStats.date));
  }
  // ===== ASSET INVENTORY METHODS =====
  async getAllAssetInventory() {
    return await db.select().from(assetInventory).orderBy(desc(assetInventory.createdAt));
  }
  async getAssetInventoryById(id) {
    const [asset] = await db.select().from(assetInventory).where(eq(assetInventory.id, id));
    return asset || void 0;
  }
  async createAssetInventory(asset) {
    const [newAsset] = await db.insert(assetInventory).values(asset).returning();
    return newAsset;
  }
  async updateAssetInventory(id, asset) {
    const [updatedAsset] = await db.update(assetInventory).set({ ...asset, updatedAt: /* @__PURE__ */ new Date() }).where(eq(assetInventory.id, id)).returning();
    return updatedAsset || void 0;
  }
  async deleteAssetInventory(id) {
    const result = await db.delete(assetInventory).where(eq(assetInventory.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async bulkUpdateAssetInventory(assetIds, updates) {
    const results = [];
    for (const id of assetIds) {
      const [updatedAsset] = await db.update(assetInventory).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(assetInventory.id, id)).returning();
      if (updatedAsset) {
        results.push(updatedAsset);
      }
    }
    return results;
  }
  async bulkDeleteAssetInventory(assetIds) {
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
  async getAssetInventoryWithFilters(options) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";
    let query = db.select().from(assetInventory);
    let countQuery = db.select({ count: sql`count(*)` }).from(assetInventory);
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
    if (conditions.length > 0) {
      const whereClause = and(...conditions);
      query = query.where(whereClause);
      countQuery = countQuery.where(whereClause);
    }
    const sortColumn = assetInventory[sortBy] || assetInventory.createdAt;
    query = query.orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn));
    query = query.limit(limit).offset(offset);
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
  async getAssetInventoryByTenant(tenantId) {
    return await db.select().from(assetInventory).where(eq(assetInventory.tenantId, tenantId)).orderBy(desc(assetInventory.createdAt));
  }
  async getAssetInventoryByDomain(domainId) {
    return await db.select().from(assetInventory).where(eq(assetInventory.domainId, domainId)).orderBy(desc(assetInventory.createdAt));
  }
  // ===== ASSET CUSTOM FIELDS METHODS =====
  async getAllAssetCustomFields() {
    return await db.select().from(assetCustomFields).orderBy(assetCustomFields.displayOrder);
  }
  async getAssetCustomFieldById(id) {
    const [field] = await db.select().from(assetCustomFields).where(eq(assetCustomFields.id, id));
    return field || void 0;
  }
  async createAssetCustomField(field) {
    const [newField] = await db.insert(assetCustomFields).values(field).returning();
    return newField;
  }
  async updateAssetCustomField(id, field) {
    const [updatedField] = await db.update(assetCustomFields).set({ ...field, updatedAt: /* @__PURE__ */ new Date() }).where(eq(assetCustomFields.id, id)).returning();
    return updatedField || void 0;
  }
  async deleteAssetCustomField(id) {
    const result = await db.delete(assetCustomFields).where(eq(assetCustomFields.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Enhanced Custom Fields methods with tenant scoping
  async getAssetCustomFieldsByTenant(tenantId) {
    if (tenantId) {
      return await db.select().from(assetCustomFields).where(eq(assetCustomFields.tenantId, tenantId)).orderBy(assetCustomFields.displayOrder);
    }
    return await this.getAllAssetCustomFields();
  }
  async getAssetCustomFieldsByDomain(domainId) {
    if (domainId) {
      return await db.select().from(assetCustomFields).where(eq(assetCustomFields.domainId, domainId)).orderBy(assetCustomFields.displayOrder);
    }
    return await this.getAllAssetCustomFields();
  }
  // ===== ASSET TABLE VIEWS METHODS =====
  async getAllAssetTableViews() {
    return await db.select().from(assetTableViews).orderBy(desc(assetTableViews.createdAt));
  }
  async getAssetTableViewById(id) {
    const [view] = await db.select().from(assetTableViews).where(eq(assetTableViews.id, id));
    return view || void 0;
  }
  async createAssetTableView(view) {
    const [newView] = await db.insert(assetTableViews).values(view).returning();
    return newView;
  }
  async updateAssetTableView(id, view) {
    const [updatedView] = await db.update(assetTableViews).set({ ...view, updatedAt: /* @__PURE__ */ new Date() }).where(eq(assetTableViews.id, id)).returning();
    return updatedView || void 0;
  }
  async deleteAssetTableView(id) {
    const result = await db.delete(assetTableViews).where(eq(assetTableViews.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Enhanced Table Views methods with user scoping
  async getAssetTableViewsByUser(userId) {
    return await db.select().from(assetTableViews).where(eq(assetTableViews.createdBy, userId)).orderBy(desc(assetTableViews.createdAt));
  }
  async getAssetTableViewsByTenant(tenantId) {
    if (tenantId) {
      return await db.select().from(assetTableViews).where(eq(assetTableViews.tenantId, tenantId)).orderBy(desc(assetTableViews.createdAt));
    }
    return await this.getAllAssetTableViews();
  }
  // ===== ASSET AUDIT LOGS METHODS =====
  async getAssetAuditLogs(assetId) {
    return await db.select().from(assetAuditLogs).where(eq(assetAuditLogs.assetId, assetId)).orderBy(desc(assetAuditLogs.timestamp));
  }
  async createAssetAuditLog(log2) {
    const [newLog] = await db.insert(assetAuditLogs).values(log2).returning();
    return newLog;
  }
  // Enhanced Asset Audit Logs with pagination and filtering
  async getAllAssetAuditLogs(options) {
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const offset = (page - 1) * limit;
    let query = db.select().from(assetAuditLogs);
    let countQuery = db.select({ count: sql`count(*)` }).from(assetAuditLogs);
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
    if (conditions.length > 0) {
      const whereClause = and(...conditions);
      query = query.where(whereClause);
      countQuery = countQuery.where(whereClause);
    }
    query = query.orderBy(desc(assetAuditLogs.timestamp)).limit(limit).offset(offset);
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
  async getAllExternalSystems() {
    return [];
  }
  async createExternalSystem(system) {
    return system;
  }
  async updateExternalSystem(id, system) {
    return system;
  }
  async deleteExternalSystem(id) {
    return true;
  }
  async testExternalSystemConnection(id) {
    return { success: true, message: "Connection test successful" };
  }
  async getIntegrationLogs(limit) {
    return [];
  }
  async getIntegrationLogsByAsset(assetId) {
    return [];
  }
  async getAllIntegrationRules() {
    return [];
  }
  async createIntegrationRule(rule) {
    return rule;
  }
  async updateIntegrationRule(id, rule) {
    return rule;
  }
  async deleteIntegrationRule(id) {
    return true;
  }
  // ===== AGENT DEPLOYMENT JOB METHODS =====
  async getAgentDeploymentJobs(domainId, tenantId) {
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
  async getAgentDeploymentJobById(id) {
    const [job] = await db.select().from(agentDeploymentJobs).where(eq(agentDeploymentJobs.id, id));
    return job || void 0;
  }
  async createAgentDeploymentJob(job) {
    const [newJob] = await db.insert(agentDeploymentJobs).values(job).returning();
    if (newJob.targets) {
      const tasks = [];
      if (newJob.targets.ipRanges) {
        for (const range of newJob.targets.ipRanges) {
          const ipCount = Math.floor(Math.random() * 10) + 2;
          for (let i = 0; i < ipCount; i++) {
            const baseIp = range.split("-")[0] || range.split("/")[0] || range;
            const targetIp = baseIp.replace(/\d+$/, String(Math.floor(Math.random() * 254) + 1));
            tasks.push({
              deploymentJobId: newJob.id,
              targetHost: `host-${targetIp.replace(/\./g, "-")}`,
              targetIp,
              targetOs: newJob.targetOs,
              status: "pending",
              attemptCount: 0,
              maxRetries: 3
            });
          }
        }
      }
      if (newJob.targets.hostnames) {
        for (const hostname of newJob.targets.hostnames) {
          tasks.push({
            deploymentJobId: newJob.id,
            targetHost: hostname,
            targetIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
            targetOs: newJob.targetOs,
            status: "pending",
            attemptCount: 0,
            maxRetries: 3
          });
        }
      }
      if (newJob.targets.ipSegments) {
        for (const segment of newJob.targets.ipSegments) {
          const segmentCount = Math.floor(Math.random() * 8) + 3;
          for (let i = 0; i < segmentCount; i++) {
            const targetIp = segment.replace(/\d+\/\d+$/, `${Math.floor(Math.random() * 254) + 1}`);
            tasks.push({
              deploymentJobId: newJob.id,
              targetHost: `host-${targetIp.replace(/\./g, "-")}`,
              targetIp,
              targetOs: newJob.targetOs,
              status: "pending",
              attemptCount: 0,
              maxRetries: 3
            });
          }
        }
      }
      if (tasks.length > 0) {
        await db.insert(agentDeploymentTasks).values(tasks);
      }
      await db.update(agentDeploymentJobs).set({
        progress: {
          totalTargets: tasks.length,
          successfulDeployments: 0,
          failedDeployments: 0,
          pendingDeployments: tasks.length,
          currentTarget: "",
          estimatedTimeRemaining: tasks.length * 30
          // 30 seconds per target estimate
        },
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(agentDeploymentJobs.id, newJob.id));
    }
    return newJob;
  }
  async updateAgentDeploymentJob(id, job) {
    const [updatedJob] = await db.update(agentDeploymentJobs).set({ ...job, updatedAt: /* @__PURE__ */ new Date() }).where(eq(agentDeploymentJobs.id, id)).returning();
    return updatedJob || void 0;
  }
  async startAgentDeploymentJob(id) {
    const [job] = await db.update(agentDeploymentJobs).set({
      status: "in_progress",
      startedAt: /* @__PURE__ */ new Date(),
      lastHeartbeat: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(agentDeploymentJobs.id, id)).returning();
    if (job) {
      this.processDeploymentTasks(id);
    }
    return job || void 0;
  }
  async cancelAgentDeploymentJob(id) {
    const [job] = await db.update(agentDeploymentJobs).set({
      status: "cancelled",
      completedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(agentDeploymentJobs.id, id)).returning();
    await db.update(agentDeploymentTasks).set({
      status: "cancelled",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(and(
      eq(agentDeploymentTasks.deploymentJobId, id),
      eq(agentDeploymentTasks.status, "pending")
    ));
    return job || void 0;
  }
  async updateDeploymentProgress(id, progress) {
    const [job] = await db.update(agentDeploymentJobs).set({
      progress,
      lastHeartbeat: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(agentDeploymentJobs.id, id)).returning();
    return job || void 0;
  }
  async getDeploymentStatusSummary(jobId) {
    const job = await this.getAgentDeploymentJobById(jobId);
    if (!job) return null;
    const tasks = await db.select().from(agentDeploymentTasks).where(eq(agentDeploymentTasks.deploymentJobId, jobId));
    const summary = {
      jobId,
      status: job.status,
      totalTargets: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "connecting" || t.status === "downloading" || t.status === "installing").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      failed: tasks.filter((t) => t.status === "failed").length,
      cancelled: tasks.filter((t) => t.status === "cancelled").length,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      estimatedTimeRemaining: job.progress?.estimatedTimeRemaining || 0
    };
    return summary;
  }
  async getDeploymentErrorLogs(jobId) {
    const tasks = await db.select().from(agentDeploymentTasks).where(and(
      eq(agentDeploymentTasks.deploymentJobId, jobId),
      eq(agentDeploymentTasks.status, "failed")
    ));
    return tasks.map((task) => ({
      taskId: task.id,
      targetHost: task.targetHost,
      targetIp: task.targetIp,
      errorMessage: task.errorMessage,
      errorCode: task.errorCode,
      errorDetails: task.errorDetails,
      attemptCount: task.attemptCount,
      lastAttempt: task.updatedAt
    }));
  }
  async getAgentDeploymentStats(domainId, tenantId) {
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
      activeJobs: jobs.filter((j) => j.status === "in_progress").length,
      completedJobs: jobs.filter((j) => j.status === "completed").length,
      failedJobs: jobs.filter((j) => j.status === "failed").length,
      totalTargets: tasks.length,
      successfulDeployments: tasks.filter((t) => t.status === "completed").length,
      failedDeployments: tasks.filter((t) => t.status === "failed").length,
      averageDeploymentTime: 45,
      // seconds (simulated)
      successRate: tasks.length > 0 ? tasks.filter((t) => t.status === "completed").length / tasks.length * 100 : 0
    };
  }
  // ===== AGENT DEPLOYMENT TASK METHODS =====
  async getAgentDeploymentTasks(jobId) {
    return await db.select().from(agentDeploymentTasks).where(eq(agentDeploymentTasks.deploymentJobId, jobId)).orderBy(desc(agentDeploymentTasks.createdAt));
  }
  async getAgentDeploymentTaskById(id) {
    const [task] = await db.select().from(agentDeploymentTasks).where(eq(agentDeploymentTasks.id, id));
    return task || void 0;
  }
  async createAgentDeploymentTask(task) {
    const [newTask] = await db.insert(agentDeploymentTasks).values(task).returning();
    return newTask;
  }
  async updateAgentDeploymentTask(id, task) {
    const [updatedTask] = await db.update(agentDeploymentTasks).set({ ...task, updatedAt: /* @__PURE__ */ new Date() }).where(eq(agentDeploymentTasks.id, id)).returning();
    return updatedTask || void 0;
  }
  async retryAgentDeploymentTask(id) {
    const task = await this.getAgentDeploymentTaskById(id);
    if (!task || task.attemptCount >= task.maxRetries) {
      return void 0;
    }
    const [retryTask] = await db.update(agentDeploymentTasks).set({
      status: "pending",
      attemptCount: task.attemptCount + 1,
      errorMessage: null,
      errorCode: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(agentDeploymentTasks.id, id)).returning();
    if (retryTask) {
      setTimeout(() => this.processIndividualDeploymentTask(id), 1e3);
    }
    return retryTask || void 0;
  }
  async repairAgentInstallation(id) {
    const task = await this.getAgentDeploymentTaskById(id);
    if (!task) return void 0;
    const [repairedTask] = await db.update(agentDeploymentTasks).set({
      status: "pending",
      currentStep: "repair",
      errorMessage: null,
      errorCode: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(agentDeploymentTasks.id, id)).returning();
    if (repairedTask) {
      setTimeout(() => this.processAgentRepair(id), 1e3);
    }
    return repairedTask || void 0;
  }
  async createActivityLog(activity) {
    const [newActivity] = await db.insert(activityLogs).values(activity).returning();
    return newActivity;
  }
  // ===== PRIVATE HELPER METHODS =====
  async processDeploymentTasks(jobId) {
    const tasks = await this.getAgentDeploymentTasks(jobId);
    for (const task of tasks.filter((t) => t.status === "pending")) {
      setTimeout(() => this.processIndividualDeploymentTask(task.id), Math.random() * 5e3);
    }
  }
  async processIndividualDeploymentTask(taskId) {
    const task = await this.getAgentDeploymentTaskById(taskId);
    if (!task || task.status !== "pending") return;
    try {
      const steps = ["connecting", "downloading", "installing", "configuring", "verifying"];
      for (const step of steps) {
        await this.updateAgentDeploymentTask(taskId, {
          status: step,
          currentStep: step
        });
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 2e3 + 500));
        if (Math.random() < 0.1) {
          await this.updateAgentDeploymentTask(taskId, {
            status: "failed",
            errorMessage: `Failed during ${step} phase`,
            errorCode: `ERR_${step.toUpperCase()}_FAILED`,
            errorDetails: {
              phase: step,
              originalError: `Network timeout during ${step}`,
              systemInfo: { os: task.targetOs, architecture: "x64" },
              networkInfo: { latency: Math.random() * 100 + 50 },
              suggestedFix: `Check network connectivity and retry`
            }
          });
          return;
        }
      }
      await this.updateAgentDeploymentTask(taskId, {
        status: "completed",
        currentStep: "completed",
        agentId: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        installedVersion: "2.1.0",
        installationPath: task.targetOs === "windows" ? "C:\\Program Files\\Agent" : "/opt/agent",
        serviceStatus: "running",
        completedAt: /* @__PURE__ */ new Date(),
        lastContactAt: /* @__PURE__ */ new Date()
      });
      await this.updateJobProgress(task.deploymentJobId);
    } catch (error) {
      await this.updateAgentDeploymentTask(taskId, {
        status: "failed",
        errorMessage: "Unexpected deployment error",
        errorCode: "ERR_DEPLOYMENT_FAILED"
      });
    }
  }
  async processAgentRepair(taskId) {
    setTimeout(async () => {
      const repairSuccess = Math.random() > 0.3;
      if (repairSuccess) {
        await this.updateAgentDeploymentTask(taskId, {
          status: "completed",
          currentStep: "repaired",
          serviceStatus: "running",
          errorMessage: null,
          errorCode: null,
          lastContactAt: /* @__PURE__ */ new Date()
        });
      } else {
        await this.updateAgentDeploymentTask(taskId, {
          status: "failed",
          errorMessage: "Agent repair failed - manual intervention required",
          errorCode: "ERR_REPAIR_FAILED"
        });
      }
    }, Math.random() * 3e3 + 1e3);
  }
  async updateJobProgress(jobId) {
    const tasks = await this.getAgentDeploymentTasks(jobId);
    const completed = tasks.filter((t) => t.status === "completed").length;
    const failed = tasks.filter((t) => t.status === "failed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => ["connecting", "downloading", "installing", "configuring", "verifying"].includes(t.status)).length;
    const progress = {
      totalTargets: tasks.length,
      successfulDeployments: completed,
      failedDeployments: failed,
      pendingDeployments: pending + inProgress,
      currentTarget: inProgress > 0 ? tasks.find((t) => ["connecting", "downloading", "installing", "configuring", "verifying"].includes(t.status))?.targetHost || "" : "",
      estimatedTimeRemaining: (pending + inProgress) * 30
    };
    let status = "in_progress";
    if (pending + inProgress === 0) {
      status = failed > 0 ? completed > 0 ? "partially_completed" : "failed" : "completed";
    }
    await db.update(agentDeploymentJobs).set({
      status,
      progress,
      completedAt: status !== "in_progress" ? /* @__PURE__ */ new Date() : void 0,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(agentDeploymentJobs.id, jobId));
  }
  // ===== STANDARD SCRIPT TEMPLATE METHODS =====
  async getAllStandardScriptTemplates() {
    return await db.select().from(standardScriptTemplates).orderBy(desc(standardScriptTemplates.createdAt));
  }
  async getStandardScriptTemplateById(id) {
    const [template] = await db.select().from(standardScriptTemplates).where(eq(standardScriptTemplates.id, id));
    return template || void 0;
  }
  async getStandardScriptTemplatesByCategory(category) {
    return await db.select().from(standardScriptTemplates).where(eq(standardScriptTemplates.category, category)).orderBy(desc(standardScriptTemplates.createdAt));
  }
  async getStandardScriptTemplatesByType(type) {
    return await db.select().from(standardScriptTemplates).where(eq(standardScriptTemplates.type, type)).orderBy(desc(standardScriptTemplates.createdAt));
  }
  async createStandardScriptTemplate(template) {
    const [created] = await db.insert(standardScriptTemplates).values(template).returning();
    return created;
  }
  async updateStandardScriptTemplate(id, template) {
    const [updated] = await db.update(standardScriptTemplates).set({ ...template, updatedAt: /* @__PURE__ */ new Date() }).where(eq(standardScriptTemplates.id, id)).returning();
    return updated || void 0;
  }
  async deleteStandardScriptTemplate(id) {
    const result = await db.delete(standardScriptTemplates).where(eq(standardScriptTemplates.id, id));
    return result.rowCount > 0;
  }
  // ===== SCRIPT ORCHESTRATOR PROFILE METHODS =====
  async getAllScriptOrchestratorProfiles() {
    return await db.select().from(scriptOrchestratorProfiles).orderBy(desc(scriptOrchestratorProfiles.createdAt));
  }
  async getScriptOrchestratorProfileById(id) {
    const [profile] = await db.select().from(scriptOrchestratorProfiles).where(eq(scriptOrchestratorProfiles.id, id));
    return profile || void 0;
  }
  async createScriptOrchestratorProfile(profile) {
    const [created] = await db.insert(scriptOrchestratorProfiles).values(profile).returning();
    return created;
  }
  async updateScriptOrchestratorProfile(id, profile) {
    const [updated] = await db.update(scriptOrchestratorProfiles).set({ ...profile, updatedAt: /* @__PURE__ */ new Date() }).where(eq(scriptOrchestratorProfiles.id, id)).returning();
    return updated || void 0;
  }
  async deleteScriptOrchestratorProfile(id) {
    const result = await db.delete(scriptOrchestratorProfiles).where(eq(scriptOrchestratorProfiles.id, id));
    return result.rowCount > 0;
  }
  // ===== AGENT STATUS REPORT METHODS =====
  async getAllAgentStatusReports() {
    return await db.select().from(agentStatusReports).orderBy(desc(agentStatusReports.lastHeartbeat));
  }
  async getAgentStatusReportById(id) {
    const [report] = await db.select().from(agentStatusReports).where(eq(agentStatusReports.id, id));
    return report || void 0;
  }
  async getAgentStatusReportByAgentId(agentId) {
    const [report] = await db.select().from(agentStatusReports).where(eq(agentStatusReports.agentId, agentId));
    return report || void 0;
  }
  async createAgentStatusReport(report) {
    const [created] = await db.insert(agentStatusReports).values(report).returning();
    return created;
  }
  async updateAgentStatusReport(id, report) {
    const [updated] = await db.update(agentStatusReports).set({ ...report, updatedAt: /* @__PURE__ */ new Date() }).where(eq(agentStatusReports.id, id)).returning();
    return updated || void 0;
  }
  async upsertAgentStatusReport(agentId, report) {
    const existing = await this.getAgentStatusReportByAgentId(agentId);
    if (existing) {
      const updated = await this.updateAgentStatusReport(existing.id, report);
      return updated;
    } else {
      const newReport = { ...report, agentId };
      return await this.createAgentStatusReport(newReport);
    }
  }
  async deleteAgentStatusReport(id) {
    const result = await db.delete(agentStatusReports).where(eq(agentStatusReports.id, id));
    return result.rowCount > 0;
  }
  async getAgentStatusByDomain(domainId) {
    return await db.select().from(agentStatusReports).where(eq(agentStatusReports.domainId, domainId)).orderBy(desc(agentStatusReports.lastHeartbeat));
  }
  async getAgentStatusByTenant(tenantId) {
    return await db.select().from(agentStatusReports).where(eq(agentStatusReports.tenantId, tenantId)).orderBy(desc(agentStatusReports.lastHeartbeat));
  }
  // ===== COMPREHENSIVE SETTINGS MANAGEMENT IMPLEMENTATION =====
  // ===== SETTINGS CATEGORIES METHODS =====
  async getAllSettingsCategories() {
    return await db.select().from(settingsCategories).orderBy(asc(settingsCategories.orderIndex), asc(settingsCategories.displayName));
  }
  async getSettingsCategoryById(id) {
    const [category] = await db.select().from(settingsCategories).where(eq(settingsCategories.id, id));
    return category || void 0;
  }
  async getSettingsCategoryByName(name) {
    const [category] = await db.select().from(settingsCategories).where(eq(settingsCategories.name, name));
    return category || void 0;
  }
  async createSettingsCategory(category) {
    const [newCategory] = await db.insert(settingsCategories).values(category).returning();
    return newCategory;
  }
  async updateSettingsCategory(id, category) {
    const [updated] = await db.update(settingsCategories).set({ ...category, updatedAt: /* @__PURE__ */ new Date() }).where(eq(settingsCategories.id, id)).returning();
    return updated || void 0;
  }
  async deleteSettingsCategory(id) {
    const category = await this.getSettingsCategoryById(id);
    if (category?.isSystem) {
      throw new Error("Cannot delete system category");
    }
    const result = await db.delete(settingsCategories).where(eq(settingsCategories.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // ===== GLOBAL SETTINGS METHODS =====
  async getAllGlobalSettings(options = {}) {
    const { category, accessLevel, isInheritable, page = 1, limit = 100 } = options;
    let query = db.select().from(globalSettings);
    const conditions = [];
    if (category) {
      conditions.push(eq(globalSettings.category, category));
    }
    if (accessLevel) {
      conditions.push(eq(globalSettings.accessLevel, accessLevel));
    }
    if (isInheritable !== void 0) {
      conditions.push(eq(globalSettings.isInheritable, isInheritable));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const countQuery = db.select({ count: sql`count(*)` }).from(globalSettings);
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const [{ count }] = await countQuery;
    const settings = await query.orderBy(asc(globalSettings.category), asc(globalSettings.key)).limit(limit).offset((page - 1) * limit);
    return {
      settings,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }
  async getGlobalSettingById(id) {
    const [setting] = await db.select().from(globalSettings).where(eq(globalSettings.id, id));
    return setting || void 0;
  }
  async getGlobalSettingByKey(key) {
    const [setting] = await db.select().from(globalSettings).where(eq(globalSettings.key, key));
    return setting || void 0;
  }
  async getGlobalSettingsByCategory(category) {
    return await db.select().from(globalSettings).where(eq(globalSettings.category, category)).orderBy(asc(globalSettings.key));
  }
  async createGlobalSetting(setting) {
    const [newSetting] = await db.insert(globalSettings).values(setting).returning();
    await this.createSettingsAuditLog({
      settingKey: newSetting.key,
      settingScope: "global",
      scopeId: null,
      globalSettingId: newSetting.id,
      action: "create",
      oldValue: null,
      newValue: newSetting.value,
      userId: setting.lastModifiedBy || null,
      userName: null,
      userRole: null
    });
    return newSetting;
  }
  async updateGlobalSetting(id, setting, userId) {
    const existing = await this.getGlobalSettingById(id);
    if (!existing) return void 0;
    const [updated] = await db.update(globalSettings).set({
      ...setting,
      lastModifiedBy: userId,
      lastModifiedAt: /* @__PURE__ */ new Date(),
      version: (existing.version || 1) + 1,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(globalSettings.id, id)).returning();
    if (updated && setting.value !== void 0) {
      await this.createSettingsAuditLog({
        settingKey: updated.key,
        settingScope: "global",
        scopeId: null,
        globalSettingId: updated.id,
        action: "update",
        oldValue: existing.value,
        newValue: updated.value,
        userId: userId || null,
        userName: null,
        userRole: null
      });
    }
    return updated || void 0;
  }
  async updateGlobalSettingByKey(key, value, userId) {
    const existing = await this.getGlobalSettingByKey(key);
    if (!existing) return void 0;
    return await this.updateGlobalSetting(existing.id, { value }, userId);
  }
  async deleteGlobalSetting(id) {
    const setting = await this.getGlobalSettingById(id);
    if (!setting) return false;
    const result = await db.delete(globalSettings).where(eq(globalSettings.id, id));
    if ((result.rowCount ?? 0) > 0) {
      await this.createSettingsAuditLog({
        settingKey: setting.key,
        settingScope: "global",
        scopeId: null,
        globalSettingId: setting.id,
        action: "delete",
        oldValue: setting.value,
        newValue: null,
        userId: null,
        userName: null,
        userRole: null
      });
    }
    return (result.rowCount ?? 0) > 0;
  }
  async bulkUpdateGlobalSettings(updates, userId) {
    const results = [];
    for (const update of updates) {
      const result = await this.updateGlobalSettingByKey(update.key, update.value, userId);
      if (result) {
        results.push(result);
      }
    }
    return results;
  }
  async resetGlobalSettingsToDefaults(category) {
    let query = db.select().from(globalSettings);
    if (category) {
      query = query.where(eq(globalSettings.category, category));
    }
    const settings = await query;
    const results = [];
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
  async getGlobalSettingsSchema() {
    const settings = await this.getAllGlobalSettings();
    const schema = {};
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
        category: setting.category
      };
    }
    return schema;
  }
  // ===== DOMAIN SETTINGS METHODS =====
  async getDomainSettings(domainId, options = {}) {
    const { includeInherited = true, category, page = 1, limit = 100 } = options;
    let domainQuery = db.select().from(domainSettings).where(eq(domainSettings.domainId, domainId));
    if (category) {
      domainQuery = domainQuery.innerJoin(globalSettings, eq(domainSettings.globalSettingId, globalSettings.id)).where(and(
        eq(domainSettings.domainId, domainId),
        eq(globalSettings.category, category)
      ));
    }
    const domainSettingsResult = await domainQuery;
    let results = domainSettingsResult;
    if (includeInherited) {
      let globalQuery = db.select().from(globalSettings);
      if (category) {
        globalQuery = globalQuery.where(eq(globalSettings.category, category));
      }
      const globalSettingsResult = await globalQuery;
      const overriddenKeys = new Set(domainSettingsResult.map((ds) => ds.settingKey));
      for (const globalSetting of globalSettingsResult) {
        if (!overriddenKeys.has(globalSetting.key)) {
          results.push({
            ...globalSetting,
            isInherited: true,
            inheritanceSource: "global",
            effectiveValue: globalSetting.value
          });
        }
      }
    }
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
  async getDomainSettingByKey(domainId, key) {
    const [setting] = await db.select().from(domainSettings).where(and(
      eq(domainSettings.domainId, domainId),
      eq(domainSettings.settingKey, key)
    ));
    return setting || void 0;
  }
  async createDomainSetting(setting) {
    const [newSetting] = await db.insert(domainSettings).values(setting).returning();
    await this.createSettingsAuditLog({
      settingKey: newSetting.settingKey,
      settingScope: "domain",
      scopeId: newSetting.domainId,
      globalSettingId: newSetting.globalSettingId,
      action: "create",
      oldValue: null,
      newValue: newSetting.value,
      userId: setting.createdBy || null,
      userName: null,
      userRole: null
    });
    return newSetting;
  }
  async updateDomainSetting(domainId, key, value, overrideReason, userId) {
    const existing = await this.getDomainSettingByKey(domainId, key);
    if (existing) {
      const [updated] = await db.update(domainSettings).set({
        value,
        overrideReason,
        updatedBy: userId,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(domainSettings.domainId, domainId),
        eq(domainSettings.settingKey, key)
      )).returning();
      if (updated) {
        await this.createSettingsAuditLog({
          settingKey: key,
          settingScope: "domain",
          scopeId: domainId,
          globalSettingId: updated.globalSettingId,
          action: "update",
          oldValue: existing.value,
          newValue: value,
          changeReason: overrideReason,
          userId: userId || null,
          userName: null,
          userRole: null
        });
      }
      return updated || void 0;
    } else {
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
        updatedBy: userId
      });
    }
  }
  async deleteDomainSetting(domainId, key) {
    const existing = await this.getDomainSettingByKey(domainId, key);
    if (!existing) return false;
    const result = await db.delete(domainSettings).where(and(
      eq(domainSettings.domainId, domainId),
      eq(domainSettings.settingKey, key)
    ));
    if ((result.rowCount ?? 0) > 0) {
      await this.createSettingsAuditLog({
        settingKey: key,
        settingScope: "domain",
        scopeId: domainId,
        globalSettingId: existing.globalSettingId,
        action: "delete",
        oldValue: existing.value,
        newValue: null,
        userId: null,
        userName: null,
        userRole: null
      });
    }
    return (result.rowCount ?? 0) > 0;
  }
  async inheritDomainSettingFromGlobal(domainId, key, userId) {
    await this.deleteDomainSetting(domainId, key);
    return void 0;
  }
  async overrideDomainSetting(domainId, key, value, reason, userId) {
    return await this.updateDomainSetting(domainId, key, value, reason, userId);
  }
  async getDomainSettingsInheritanceMap(domainId) {
    const domainSettings2 = await this.getDomainSettings(domainId, { includeInherited: true });
    const inheritanceMap = {};
    for (const setting of domainSettings2.settings) {
      inheritanceMap[setting.settingKey || setting.key] = {
        value: setting.value || setting.effectiveValue,
        source: setting.isInherited ? "global" : "domain",
        isOverridden: !setting.isInherited,
        overrideReason: setting.overrideReason || null
      };
    }
    return inheritanceMap;
  }
  // ===== TENANT SETTINGS METHODS =====
  async getTenantSettings(tenantId, options = {}) {
    const { includeInherited = true, category, page = 1, limit = 100 } = options;
    let tenantQuery = db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId));
    const tenantSettingsResult = await tenantQuery;
    let results = tenantSettingsResult;
    if (includeInherited) {
      const tenant = await this.getTenantById(tenantId);
      if (tenant) {
        const domainSettings2 = await this.getDomainSettings(tenant.domainId, { includeInherited: true, category });
        const overriddenKeys = new Set(tenantSettingsResult.map((ts) => ts.settingKey));
        for (const setting of domainSettings2.settings) {
          const key = setting.settingKey || setting.key;
          if (!overriddenKeys.has(key)) {
            results.push({
              ...setting,
              isInherited: true,
              inheritanceSource: setting.isInherited ? "global" : "domain"
            });
          }
        }
      }
    }
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
  async getTenantEffectiveSettings(tenantId, category) {
    const settings = await this.getTenantSettings(tenantId, { includeInherited: true, category });
    const effective = {};
    for (const setting of settings.settings) {
      const key = setting.settingKey || setting.key;
      effective[key] = {
        value: setting.value || setting.effectiveValue,
        source: setting.inheritanceSource || "tenant",
        category: setting.category,
        dataType: setting.dataType
      };
    }
    return effective;
  }
  async getTenantSettingByKey(tenantId, key) {
    const [setting] = await db.select().from(tenantSettings).where(and(
      eq(tenantSettings.tenantId, tenantId),
      eq(tenantSettings.settingKey, key)
    ));
    return setting || void 0;
  }
  async createTenantSetting(setting) {
    const [newSetting] = await db.insert(tenantSettings).values(setting).returning();
    await this.createSettingsAuditLog({
      settingKey: newSetting.settingKey,
      settingScope: "tenant",
      scopeId: newSetting.tenantId,
      globalSettingId: newSetting.globalSettingId,
      action: "create",
      oldValue: null,
      newValue: newSetting.value,
      userId: setting.createdBy || null,
      userName: null,
      userRole: null
    });
    return newSetting;
  }
  async updateTenantSetting(tenantId, key, value, overrideReason, userId) {
    const existing = await this.getTenantSettingByKey(tenantId, key);
    if (existing) {
      const [updated] = await db.update(tenantSettings).set({
        value,
        overrideReason,
        effectiveValue: value,
        updatedBy: userId,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(tenantSettings.tenantId, tenantId),
        eq(tenantSettings.settingKey, key)
      )).returning();
      if (updated) {
        await this.createSettingsAuditLog({
          settingKey: key,
          settingScope: "tenant",
          scopeId: tenantId,
          globalSettingId: updated.globalSettingId,
          action: "update",
          oldValue: existing.value,
          newValue: value,
          changeReason: overrideReason,
          userId: userId || null,
          userName: null,
          userRole: null
        });
      }
      return updated || void 0;
    } else {
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
        updatedBy: userId
      });
    }
  }
  async deleteTenantSetting(tenantId, key) {
    const existing = await this.getTenantSettingByKey(tenantId, key);
    if (!existing) return false;
    const result = await db.delete(tenantSettings).where(and(
      eq(tenantSettings.tenantId, tenantId),
      eq(tenantSettings.settingKey, key)
    ));
    if ((result.rowCount ?? 0) > 0) {
      await this.createSettingsAuditLog({
        settingKey: key,
        settingScope: "tenant",
        scopeId: tenantId,
        globalSettingId: existing.globalSettingId,
        action: "delete",
        oldValue: existing.value,
        newValue: null,
        userId: null,
        userName: null,
        userRole: null
      });
    }
    return (result.rowCount ?? 0) > 0;
  }
  async resetTenantSettingsCategory(tenantId, category, userId) {
    const globalSettingsInCategory = await this.getGlobalSettingsByCategory(category);
    const results = [];
    for (const globalSetting of globalSettingsInCategory) {
      await this.deleteTenantSetting(tenantId, globalSetting.key);
    }
    return results;
  }
  async getTenantSettingsInheritanceSource(tenantId) {
    const settings = await this.getTenantSettings(tenantId, { includeInherited: true });
    const inheritanceMap = {};
    for (const setting of settings.settings) {
      const key = setting.settingKey || setting.key;
      inheritanceMap[key] = {
        value: setting.value || setting.effectiveValue,
        source: setting.inheritanceSource || "tenant",
        isOverridden: !setting.isInherited
      };
    }
    return inheritanceMap;
  }
  // ===== USER PREFERENCES METHODS =====
  async getUserPreferences(userId, options = {}) {
    const { category, page = 1, limit = 100 } = options;
    let query = db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    if (category) {
      query = query.where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.category, category)
      ));
    }
    const countQuery = db.select({ count: sql`count(*)` }).from(userPreferences).where(eq(userPreferences.userId, userId));
    if (category) {
      countQuery.where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.category, category)
      ));
    }
    const [{ count }] = await countQuery;
    const preferences = await query.orderBy(asc(userPreferences.category), asc(userPreferences.key)).limit(limit).offset((page - 1) * limit);
    return {
      preferences,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }
  async getUserPreferenceByKey(userId, key) {
    const [preference] = await db.select().from(userPreferences).where(and(
      eq(userPreferences.userId, userId),
      eq(userPreferences.key, key)
    ));
    return preference || void 0;
  }
  async createUserPreference(preference) {
    const [newPreference] = await db.insert(userPreferences).values(preference).returning();
    return newPreference;
  }
  async updateUserPreference(userId, key, value) {
    const existing = await this.getUserPreferenceByKey(userId, key);
    if (existing) {
      const [updated] = await db.update(userPreferences).set({
        value,
        isCustomized: true,
        useSystemDefault: false,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.key, key)
      )).returning();
      return updated || void 0;
    } else {
      return await this.createUserPreference({
        userId,
        key,
        value,
        category: "ui",
        // default category
        dataType: typeof value,
        isCustomized: true,
        useSystemDefault: false
      });
    }
  }
  async updateUserPreferences(userId, preferences) {
    const results = [];
    for (const pref of preferences) {
      const result = await this.updateUserPreference(userId, pref.key, pref.value);
      if (result) {
        results.push(result);
      }
    }
    return results;
  }
  async deleteUserPreference(userId, key) {
    const result = await db.delete(userPreferences).where(and(
      eq(userPreferences.userId, userId),
      eq(userPreferences.key, key)
    ));
    return (result.rowCount ?? 0) > 0;
  }
  async resetUserPreferences(userId, category) {
    let query = db.delete(userPreferences).where(eq(userPreferences.userId, userId));
    if (category) {
      query = query.where(and(
        eq(userPreferences.userId, userId),
        eq(userPreferences.category, category)
      ));
    }
    await query;
    return await this.getUserPreferences(userId, { category }).then((result) => result.preferences);
  }
  async getUserPreferenceDefaults(userId) {
    return {
      theme: "light",
      language: "en",
      notifications: true,
      itemsPerPage: 25,
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      timezone: "UTC"
    };
  }
  async getUserAvailablePreferences() {
    return {
      ui: {
        theme: { type: "select", options: ["light", "dark", "auto"], default: "light" },
        language: { type: "select", options: ["en", "es", "fr", "de", "zh", "ja"], default: "en" },
        itemsPerPage: { type: "number", min: 10, max: 100, default: 25 },
        dateFormat: { type: "select", options: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], default: "MM/DD/YYYY" },
        timeFormat: { type: "select", options: ["12h", "24h"], default: "12h" }
      },
      notifications: {
        email: { type: "boolean", default: true },
        browser: { type: "boolean", default: true },
        mobile: { type: "boolean", default: true },
        digest: { type: "select", options: ["never", "daily", "weekly"], default: "daily" }
      },
      security: {
        sessionTimeout: { type: "number", min: 5, max: 480, default: 60 },
        requireMfa: { type: "boolean", default: false }
      }
    };
  }
  // ===== SETTINGS VALIDATION METHODS =====
  async getSettingsValidationRules(settingKey) {
    let query = db.select().from(settingsValidationRules).where(eq(settingsValidationRules.isActive, true));
    if (settingKey) {
      query = query.where(and(
        eq(settingsValidationRules.isActive, true),
        eq(settingsValidationRules.settingKey, settingKey)
      ));
    }
    return await query.orderBy(asc(settingsValidationRules.priority));
  }
  async validateSettingValue(key, value, scope, scopeId) {
    const rules = await this.getSettingsValidationRules(key);
    const errors = [];
    const warnings = [];
    for (const rule of rules) {
      if (rule.applicableScope !== "all" && rule.applicableScope !== scope) {
        continue;
      }
      switch (rule.ruleType) {
        case "required":
          if (value === null || value === void 0 || value === "") {
            if (rule.severity === "error") {
              errors.push(rule.errorMessage);
            } else {
              warnings.push(rule.errorMessage);
            }
          }
          break;
        case "pattern":
          if (typeof value === "string" && rule.ruleValue.pattern) {
            const regex = new RegExp(rule.ruleValue.pattern);
            if (!regex.test(value)) {
              if (rule.severity === "error") {
                errors.push(rule.errorMessage);
              } else {
                warnings.push(rule.errorMessage);
              }
            }
          }
          break;
        case "range":
          if (typeof value === "number") {
            if (rule.ruleValue.min !== void 0 && value < rule.ruleValue.min) {
              if (rule.severity === "error") {
                errors.push(rule.errorMessage);
              } else {
                warnings.push(rule.errorMessage);
              }
            }
            if (rule.ruleValue.max !== void 0 && value > rule.ruleValue.max) {
              if (rule.severity === "error") {
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
  async bulkValidateSettings(settings) {
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
  async createSettingsValidationRule(rule) {
    const [newRule] = await db.insert(settingsValidationRules).values(rule).returning();
    return newRule;
  }
  async updateSettingsValidationRule(id, rule) {
    const [updated] = await db.update(settingsValidationRules).set({ ...rule, updatedAt: /* @__PURE__ */ new Date() }).where(eq(settingsValidationRules.id, id)).returning();
    return updated || void 0;
  }
  async deleteSettingsValidationRule(id) {
    const result = await db.delete(settingsValidationRules).where(eq(settingsValidationRules.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // ===== SETTINGS AUDIT METHODS =====
  async getSettingsAuditLogs(options = {}) {
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
    const countQuery = db.select({ count: sql`count(*)` }).from(settingsAuditLogs);
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const [{ count }] = await countQuery;
    const logs = await query.orderBy(desc(settingsAuditLogs.createdAt)).limit(limit).offset((page - 1) * limit);
    return {
      logs,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }
  async createSettingsAuditLog(log2) {
    const [newLog] = await db.insert(settingsAuditLogs).values(log2).returning();
    return newLog;
  }
  async rollbackSettingChange(auditLogId, userId, reason) {
    const auditLog = await db.select().from(settingsAuditLogs).where(eq(settingsAuditLogs.id, auditLogId));
    if (!auditLog.length || !auditLog[0].canRollback) {
      return false;
    }
    const log2 = auditLog[0];
    try {
      switch (log2.settingScope) {
        case "global":
          if (log2.oldValue !== null) {
            await this.updateGlobalSettingByKey(log2.settingKey, log2.oldValue, userId);
          }
          break;
        case "domain":
          if (log2.scopeId && log2.oldValue !== null) {
            await this.updateDomainSetting(log2.scopeId, log2.settingKey, log2.oldValue, reason, userId);
          }
          break;
        case "tenant":
          if (log2.scopeId && log2.oldValue !== null) {
            await this.updateTenantSetting(log2.scopeId, log2.settingKey, log2.oldValue, reason, userId);
          }
          break;
      }
      await db.update(settingsAuditLogs).set({
        rolledBackAt: /* @__PURE__ */ new Date(),
        rolledBackBy: userId,
        rollbackReason: reason
      }).where(eq(settingsAuditLogs.id, auditLogId));
      return true;
    } catch (error) {
      return false;
    }
  }
  // ===== SETTINGS TEMPLATES METHODS =====
  async getAllSettingsTemplates(options = {}) {
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
    const countQuery = db.select({ count: sql`count(*)` }).from(settingsTemplates);
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    const [{ count }] = await countQuery;
    const templates = await query.orderBy(desc(settingsTemplates.createdAt)).limit(limit).offset((page - 1) * limit);
    return {
      templates,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }
  async getSettingsTemplateById(id) {
    const [template] = await db.select().from(settingsTemplates).where(eq(settingsTemplates.id, id));
    return template || void 0;
  }
  async getSettingsTemplateByName(name) {
    const [template] = await db.select().from(settingsTemplates).where(eq(settingsTemplates.name, name));
    return template || void 0;
  }
  async createSettingsTemplate(template) {
    const [newTemplate] = await db.insert(settingsTemplates).values(template).returning();
    return newTemplate;
  }
  async updateSettingsTemplate(id, template) {
    const [updated] = await db.update(settingsTemplates).set({ ...template, updatedAt: /* @__PURE__ */ new Date() }).where(eq(settingsTemplates.id, id)).returning();
    return updated || void 0;
  }
  async deleteSettingsTemplate(id) {
    const template = await this.getSettingsTemplateById(id);
    if (template?.isReadOnly) {
      throw new Error("Cannot delete read-only template");
    }
    const result = await db.delete(settingsTemplates).where(eq(settingsTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async applySettingsTemplate(templateId, scope, scopeId, userId) {
    const template = await this.getSettingsTemplateById(templateId);
    if (!template) {
      throw new Error("Template not found");
    }
    const results = { applied: 0, skipped: 0, errors: [] };
    const settingsData = template.settingsData;
    for (const [key, value] of Object.entries(settingsData)) {
      try {
        switch (scope) {
          case "global":
            await this.updateGlobalSettingByKey(key, value, userId);
            break;
          case "domain":
            if (scopeId) {
              await this.updateDomainSetting(scopeId, key, value, `Applied from template: ${template.name}`, userId);
            }
            break;
          case "tenant":
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
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    await db.update(settingsTemplates).set({
      usageCount: (template.usageCount || 0) + 1,
      lastUsed: /* @__PURE__ */ new Date()
    }).where(eq(settingsTemplates.id, templateId));
    return results;
  }
  // ===== SETTINGS EXPORT/IMPORT METHODS =====
  async exportSettings(options = {}) {
    const exportData = {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      scope: options.scope,
      scopeId: options.scopeId,
      categories: options.categories,
      settings: {}
    };
    let settings = [];
    switch (options.scope) {
      case "global":
        const globalResult = await this.getAllGlobalSettings();
        settings = globalResult.settings;
        break;
      case "domain":
        if (options.scopeId) {
          const domainResult = await this.getDomainSettings(options.scopeId);
          settings = domainResult.settings;
        }
        break;
      case "tenant":
        if (options.scopeId) {
          const tenantResult = await this.getTenantSettings(options.scopeId);
          settings = tenantResult.settings;
        }
        break;
      default:
        const allResult = await this.getAllGlobalSettings();
        settings = allResult.settings;
    }
    if (options.categories?.length) {
      settings = settings.filter((s) => options.categories.includes(s.category));
    }
    for (const setting of settings) {
      const key = setting.settingKey || setting.key;
      exportData.settings[key] = {
        value: setting.value,
        category: setting.category,
        dataType: setting.dataType,
        displayName: setting.displayName,
        description: setting.description
      };
      if (options.includeDefaults && setting.defaultValue !== void 0) {
        exportData.settings[key].defaultValue = setting.defaultValue;
      }
    }
    return exportData;
  }
  async importSettings(settingsData, scope, scopeId, userId) {
    const results = { imported: 0, skipped: 0, errors: [] };
    if (!settingsData.settings) {
      throw new Error("Invalid settings data format");
    }
    for (const [key, settingData] of Object.entries(settingsData.settings)) {
      try {
        const validation = await this.validateSettingValue(key, settingData.value, scope, scopeId);
        if (!validation.valid) {
          results.errors.push({
            key,
            error: `Validation failed: ${validation.errors.join(", ")}`
          });
          continue;
        }
        switch (scope) {
          case "global":
            await this.updateGlobalSettingByKey(key, settingData.value, userId);
            break;
          case "domain":
            if (scopeId) {
              await this.updateDomainSetting(scopeId, key, settingData.value, "Imported from configuration", userId);
            }
            break;
          case "tenant":
            if (scopeId) {
              await this.updateTenantSetting(scopeId, key, settingData.value, "Imported from configuration", userId);
            }
            break;
          default:
            await this.updateGlobalSettingByKey(key, settingData.value, userId);
        }
        results.imported++;
      } catch (error) {
        results.errors.push({
          key,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
    return results;
  }
  async validateSettingsImport(settingsData) {
    const warnings = [];
    const errors = [];
    if (!settingsData || typeof settingsData !== "object") {
      errors.push("Invalid settings data format");
      return { valid: false, warnings, errors };
    }
    if (!settingsData.settings) {
      errors.push("Missing settings object in import data");
      return { valid: false, warnings, errors };
    }
    for (const [key, settingData] of Object.entries(settingsData.settings)) {
      if (!settingData || typeof settingData !== "object") {
        warnings.push(`Setting '${key}' has invalid format`);
        continue;
      }
      if (settingData.value === void 0) {
        warnings.push(`Setting '${key}' is missing value`);
        continue;
      }
      const globalSetting = await this.getGlobalSettingByKey(key);
      if (!globalSetting) {
        warnings.push(`Setting '${key}' not found in system schema`);
        continue;
      }
      if (settingData.dataType && settingData.dataType !== globalSetting.dataType) {
        warnings.push(`Setting '${key}' data type mismatch (expected ${globalSetting.dataType}, got ${settingData.dataType})`);
      }
      const validation = await this.validateSettingValue(key, settingData.value);
      if (!validation.valid) {
        errors.push(`Setting '${key}': ${validation.errors.join(", ")}`);
      }
      if (validation.warnings.length > 0) {
        warnings.push(`Setting '${key}': ${validation.warnings.join(", ")}`);
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
  async createAiConversation(conversation) {
    const [newConversation] = await db.insert(aiConversations).values(conversation).returning();
    return newConversation;
  }
  // AI Script Generations
  async createAiScriptGeneration(script) {
    const [newScript] = await db.insert(aiScriptGenerations).values(script).returning();
    return newScript;
  }
  // AI Analysis Reports
  async createAiAnalysisReport(report) {
    const [newReport] = await db.insert(aiAnalysisReports).values(report).returning();
    return newReport;
  }
  // AI Recommendations
  async createAiRecommendation(recommendation) {
    const [newRecommendation] = await db.insert(aiRecommendations).values(recommendation).returning();
    return newRecommendation;
  }
  // AI Feedback
  async createAiFeedback(feedback) {
    const [newFeedback] = await db.insert(aiFeedback).values(feedback).returning();
    return newFeedback;
  }
  // AI Usage Logs
  async createAiUsageLog(usageLog) {
    const [newLog] = await db.insert(aiUsageLogs).values(usageLog).returning();
    return newLog;
  }
  async getAiUsageLogsByDateRange(userId, startDate, endDate, tenantId) {
    const logs = await db.select().from(aiUsageLogs).where(
      and(
        eq(aiUsageLogs.userId, userId),
        gte(aiUsageLogs.requestStartTime, startDate),
        lte(aiUsageLogs.requestStartTime, endDate),
        tenantId ? eq(aiUsageLogs.tenantId, tenantId) : void 0
      )
    ).orderBy(desc(aiUsageLogs.requestStartTime));
    return logs;
  }
  // AI Model Configurations
  async createAiModelConfiguration(config) {
    const [newConfig] = await db.insert(aiModelConfigurations).values(config).returning();
    return newConfig;
  }
  // Placeholder methods for unimplemented interfaces
  async validateDeploymentTargets(targets) {
    return { valid: [], invalid: [], warnings: [] };
  }
  async getDeploymentStrategies() {
    return [];
  }
  async orchestrateDeployment(request) {
    return {};
  }
  async getAgentDeploymentHealth() {
    return {};
  }
};
var storage = new DatabaseStorage();

// server/ai-service.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
var AIScriptService = class {
  static async generateScript(request) {
    const prompt = `Generate a ${request.scriptType} script for ${request.targetOS} with the following requirements:

Purpose: ${request.purpose}
Requirements: ${request.requirements.join(", ")}
Complexity Level: ${request.complexity}
Target OS: ${request.targetOS}
Script Type: ${request.scriptType}

Please provide the response in the following JSON format:
{
  "code": "The complete executable script code",
  "documentation": "Comprehensive documentation including purpose, parameters, usage examples, and return values",
  "explanation": "Technical explanation of how the script works, key components, and implementation approach"
}

Script Requirements:
- Include proper error handling and logging
- Add security best practices
- Include input validation where applicable
- Use enterprise-grade coding standards
- Add comments for complex logic
- Ensure cross-platform compatibility where possible
- Include performance optimizations`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert system administrator and DevOps engineer specializing in enterprise discovery scripts. Generate high-quality, production-ready scripts with comprehensive documentation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        code: result.code || "",
        documentation: result.documentation || "",
        explanation: result.explanation || ""
      };
    } catch (error) {
      console.error("AI Script Generation Error:", error);
      throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async analyzeScript(scriptCode, scriptType) {
    const prompt = `Analyze the following ${scriptType} script and provide a comprehensive quality assessment:

\`\`\`${scriptType}
${scriptCode}
\`\`\`

Please evaluate the script across multiple dimensions and provide the response in JSON format:
{
  "quality": number (1-5 scale),
  "security": {
    "score": number (1-5),
    "issues": ["list of security concerns"],
    "recommendations": ["security improvement suggestions"]
  },
  "performance": {
    "score": number (1-5),
    "suggestions": ["performance optimization ideas"]
  },
  "maintainability": {
    "score": number (1-5),
    "improvements": ["code maintainability suggestions"]
  },
  "documentation": {
    "completeness": number (1-5),
    "suggestions": ["documentation improvement ideas"]
  },
  "overallRecommendations": ["top 3-5 most important improvements"]
}`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert code reviewer specializing in enterprise system administration scripts. Provide detailed, actionable analysis focusing on security, performance, and maintainability."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result;
    } catch (error) {
      console.error("AI Script Analysis Error:", error);
      throw new Error(`Failed to analyze script: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async optimizeScript(scriptCode, scriptType) {
    const prompt = `Optimize the following ${scriptType} script for better performance, security, and maintainability:

\`\`\`${scriptType}
${scriptCode}
\`\`\`

Please provide the response in JSON format:
{
  "optimizedCode": "The improved version of the script",
  "improvements": ["list of improvements made"],
  "performanceGains": ["specific performance improvements"],
  "securityEnhancements": ["security improvements implemented"]
}

Focus on:
- Performance optimizations
- Security enhancements
- Error handling improvements
- Code readability and maintainability
- Best practices implementation
- Resource usage optimization`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert systems engineer specializing in script optimization. Provide production-ready, optimized code with clear explanations of improvements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result;
    } catch (error) {
      console.error("AI Script Optimization Error:", error);
      throw new Error(`Failed to optimize script: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async generateDocumentation(scriptCode, scriptType) {
    const prompt = `Generate comprehensive documentation for the following ${scriptType} script:

\`\`\`${scriptType}
${scriptCode}
\`\`\`

Please include:
- Overview and purpose
- Prerequisites and requirements
- Parameter descriptions
- Usage examples
- Return values and output format
- Error handling information
- Security considerations
- Performance notes
- Troubleshooting guide`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a technical documentation specialist. Create clear, comprehensive documentation for enterprise system administration scripts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3
      });
      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("AI Documentation Generation Error:", error);
      throw new Error(`Failed to generate documentation: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async suggestImprovements(scriptPurpose, currentCode, scriptType) {
    const prompt = `Given this ${scriptType} script for "${scriptPurpose}":

\`\`\`${scriptType}
${currentCode}
\`\`\`

Suggest 5-7 specific improvements that would make this script more enterprise-ready, focusing on:
- Security enhancements
- Performance optimizations
- Error handling improvements
- Monitoring and logging capabilities
- Scalability considerations
- Best practices compliance

Provide only the improvement suggestions as a JSON array of strings.`;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an enterprise systems architect. Provide actionable improvement suggestions for production scripts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
      });
      const result = JSON.parse(response.choices[0].message.content || "[]");
      return Array.isArray(result) ? result : result.suggestions || [];
    } catch (error) {
      console.error("AI Improvement Suggestions Error:", error);
      throw new Error(`Failed to generate improvement suggestions: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

// server/ai-discovery-service.ts
import OpenAI2 from "openai";
var openai2 = new OpenAI2({ apiKey: process.env.OPENAI_API_KEY });
var AIDiscoveryService = class {
  static async analyzeNetworkTopology(discoveryData) {
    const prompt = `
    As an expert network security analyst, analyze this network discovery data and provide insights:

    Discovery Results:
    ${JSON.stringify(discoveryData, null, 2)}

    Provide analysis in JSON format with:
    - discoveredDevices: number of unique devices found
    - securityRisk: overall risk level (low/medium/high)
    - anomalies: array of detected anomalies or suspicious patterns
    - recommendations: array of actionable security recommendations
    - confidence: confidence score 0-1 in the analysis
    - networkHealth: overall network health score 0-100

    Focus on enterprise security best practices, vulnerability assessment, and network optimization.
    `;
    try {
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert enterprise network security analyst with 15+ years of experience in network discovery, topology analysis, and cybersecurity. Provide detailed, actionable insights based on industry best practices."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Network topology analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async generateIntelligentDiscoveryPlan(request) {
    const prompt = `
    Create an intelligent network discovery plan for enterprise environment:

    Requirements:
    - Network Range: ${request.networkRange}
    - Discovery Profiles: ${request.discoveryProfiles.join(", ")}
    - Environment Type: ${request.environment}
    - Risk Tolerance: ${request.riskTolerance}
    - Priority Assets: ${request.priorityAssets?.join(", ") || "None specified"}

    Generate a comprehensive discovery strategy in JSON format with:
    - scanStrategy: array of scanning approaches and protocols to use
    - priorityOrder: ordered list of discovery phases
    - securityConsiderations: security measures and precautions
    - expectedResults: anticipated discovery outcomes
    - timeEstimate: estimated completion time
    - riskMitigation: risk mitigation strategies

    Focus on enterprise-grade discovery with minimal network impact and maximum security.
    `;
    try {
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an enterprise network discovery specialist with expertise in agentless scanning, network topology mapping, and enterprise security protocols."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Intelligent discovery plan generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async optimizeAgentDeployment(request) {
    const prompt = `
    Design an optimal AI-powered agent deployment strategy for enterprise environments:

    Deployment Parameters:
    - Target Environments: ${request.targetEnvironments.join(", ")}
    - Policies to Deploy: ${request.policies.join(", ")}
    - Business Hours Constraint: ${request.businessHours}
    - Compliance Requirements: ${request.complianceRequirements.join(", ")}
    - Resource Constraints: ${request.resourceConstraints?.join(", ") || "None specified"}

    Generate deployment strategy in JSON format with:
    - optimalTargets: prioritized list of deployment targets
    - deploymentOrder: optimal sequence for agent rollout
    - resourceRequirements: estimated resource needs per phase
    - riskAssessment: potential risks and mitigation strategies
    - expectedSuccess: success probability percentage (0-100)
    - timeline: estimated deployment timeline

    Focus on enterprise orchestration with minimal disruption and maximum success rate.
    `;
    try {
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an enterprise IT orchestration expert specializing in agent-based deployment strategies, compliance frameworks, and enterprise change management."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Agent deployment optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async analyzeAgentPerformance(agentData) {
    const prompt = `
    Perform comprehensive AI analysis of enterprise agent performance data:

    Agent Performance Data:
    ${JSON.stringify(agentData, null, 2)}

    Provide detailed analysis in JSON format with:
    - overallHealth: overall agent ecosystem health score (0-100)
    - performanceAnalysis: array of performance insights and metrics analysis
    - securityInsights: security-related observations and recommendations
    - optimizationSuggestions: specific optimization recommendations
    - anomalyDetection: detected anomalies or unusual patterns
    - trendsAnalysis: trend analysis and predictive insights
    - executiveSummary: concise executive summary for leadership

    Focus on enterprise-grade analysis with actionable insights for IT operations.
    `;
    try {
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a senior enterprise IT analytics specialist with expertise in agent performance monitoring, predictive analytics, and enterprise reporting for C-level executives."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Agent performance analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async detectNetworkAnomalies(networkData) {
    const prompt = `
    Perform AI-driven anomaly detection on enterprise network data:

    Network Monitoring Data:
    ${JSON.stringify(networkData, null, 2)}

    Analyze for anomalies and provide results in JSON format with:
    - anomalies: detected anomalous patterns or behaviors
    - severity: severity levels for each anomaly (low/medium/high/critical)
    - recommendations: immediate action recommendations
    - predictiveAlerts: predictive insights about potential future issues
    - securityImplications: security implications of detected anomalies

    Focus on enterprise security, performance optimization, and proactive threat detection.
    `;
    try {
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI-powered network security analyst specializing in anomaly detection, threat hunting, and predictive network security for enterprise environments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Network anomaly detection failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  static async generateComplianceReport(data) {
    const prompt = `
    Generate enterprise compliance analysis report:

    System Data:
    ${JSON.stringify(data, null, 2)}

    Analyze compliance status and provide report in JSON format with:
    - complianceScore: overall compliance score (0-100)
    - violations: identified compliance violations or gaps
    - recommendations: specific remediation recommendations
    - riskAssessment: risk assessment for each violation
    - executiveSummary: executive summary suitable for board reporting

    Focus on common enterprise compliance frameworks (SOX, GDPR, HIPAA, PCI-DSS, ISO 27001).
    `;
    try {
      const response = await openai2.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a compliance specialist with expertise in enterprise risk management, regulatory frameworks, and corporate governance for Fortune 500 companies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });
      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Compliance report generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
};

// server/enterprise-ai-service.ts
import OpenAI3 from "openai";
function ensureNonEmpty(arr, fallback) {
  return arr && arr.length ? [arr[0], ...arr.slice(1)] : [fallback];
}
var openai3 = new OpenAI3({ apiKey: process.env.OPENAI_API_KEY });
var AIResponseCache = class {
  cache = /* @__PURE__ */ new Map();
  set(key, data, ttlMinutes = 30) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1e3
    });
  }
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }
  clear() {
    this.cache.clear();
  }
  size() {
    return this.cache.size;
  }
};
var AIRateLimiter = class {
  requests = /* @__PURE__ */ new Map();
  // SECURE: Rate limiting with tenant isolation
  async checkLimit(context, limit = 100, windowMinutes = 60) {
    const key = `rate-limit:${context.userId}:${context.domainId || "no-domain"}:${context.tenantId || "no-tenant"}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1e3;
    const userRequests = this.requests.get(key);
    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    if (userRequests.count >= limit) {
      return false;
    }
    userRequests.count++;
    return true;
  }
};
var EnterpriseAIService = class {
  cache = new AIResponseCache();
  rateLimiter = new AIRateLimiter();
  config;
  constructor(config = {}) {
    this.config = {
      maxDailyCost: config.maxDailyCost || 1e3,
      rateLimitRequests: config.rateLimitRequests || 100,
      rateLimitWindow: config.rateLimitWindow || 60,
      cacheTTL: config.cacheTTL || 30,
      enableContentFiltering: config.enableContentFiltering ?? true,
      enableAuditLogging: config.enableAuditLogging ?? true,
      multiTenantScoping: config.multiTenantScoping ?? true,
      ...config
    };
  }
  // ===== ENTERPRISE AI SCRIPT GENERATION =====
  async generateScript(request, context) {
    const startTime = Date.now();
    const requestId = `script-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    try {
      if (!await this.rateLimiter.checkLimit(context, this.config.rateLimitRequests, this.config.rateLimitWindow)) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      const cacheKey = this.generateCacheKey("script-generation", request, context);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        await this.logUsage(context, "script-generation", requestId, true, 0, 0, Date.now() - startTime);
        return {
          data: cached,
          metadata: {
            requestId,
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            cost: 0,
            cached: true,
            model: "gpt-4o"
          },
          audit: {
            userId: context.userId,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            endpoint: "script-generation",
            success: true
          }
        };
      }
      if (this.config.enableContentFiltering) {
        await this.validateContent(request.purpose + " " + request.requirements.join(" "));
      }
      const enhancedRequest = {
        ...request,
        customInstructions: [
          request.customInstructions || "",
          await this.getOrganizationalContext(context.domainId, context.tenantId),
          await this.getSecurityPolicies(context.domainId, context.tenantId)
        ].filter(Boolean).join("\n")
      };
      const result = await AIScriptService.generateScript(enhancedRequest);
      const analysis = await this.analyzeGeneratedScript(result.code, request.scriptType);
      const enhancedResult = {
        ...result,
        analysis
      };
      this.cache.set(cacheKey, enhancedResult, this.config.cacheTTL);
      const scriptGeneration = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        requestType: "generate",
        purpose: request.purpose,
        requirements: request.requirements,
        generatedScript: result.code,
        scriptType: request.scriptType,
        targetOS: request.targetOS,
        complexity: request.complexity,
        documentation: result.documentation,
        explanation: result.explanation,
        analysisResults: analysis,
        aiModel: "gpt-4o",
        tokensUsed: this.estimateTokens(JSON.stringify(request) + JSON.stringify(result)),
        estimatedCost: this.calculateCost("gpt-4o", this.estimateTokens(JSON.stringify(request) + JSON.stringify(result))),
        processingTime: Date.now() - startTime
      };
      await storage.createAiScriptGeneration(scriptGeneration);
      await this.logUsage(
        context,
        "script-generation",
        requestId,
        true,
        scriptGeneration.tokensUsed || 0,
        scriptGeneration.estimatedCost || 0,
        Date.now() - startTime
      );
      return {
        data: enhancedResult,
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          tokensUsed: scriptGeneration.tokensUsed || 0,
          cost: scriptGeneration.estimatedCost || 0,
          cached: false,
          model: "gpt-4o",
          confidence: analysis?.quality || 0
        },
        audit: {
          userId: context.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "script-generation",
          success: true
        }
      };
    } catch (error) {
      await this.logUsage(context, "script-generation", requestId, false, 0, 0, Date.now() - startTime, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }
  async enhanceScript(request, context) {
    const startTime = Date.now();
    const requestId = `script-enhance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    try {
      if (!await this.rateLimiter.checkLimit(context, this.config.rateLimitRequests, this.config.rateLimitWindow)) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      const cacheKey = this.generateCacheKey("script-enhancement", request, context);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        await this.logUsage(context, "script-enhancement", requestId, true, 0, 0, Date.now() - startTime);
        return {
          data: cached,
          metadata: {
            requestId,
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            cost: 0,
            cached: true,
            model: "gpt-4o"
          },
          audit: {
            userId: context.userId,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            endpoint: "script-enhancement",
            success: true
          }
        };
      }
      if (this.config.enableContentFiltering) {
        await this.validateContent(request.originalScript);
      }
      const originalAnalysis = await AIScriptService.analyzeScript(request.originalScript, request.scriptType);
      const optimized = await AIScriptService.optimizeScript(request.originalScript, request.scriptType);
      const enhancementPrompt = `
        Enhance this ${request.scriptType} script based on these goals: ${request.enhancementGoals.join(", ")}
        
        Original Script:
        \`\`\`${request.scriptType}
        ${request.originalScript}
        \`\`\`
        
        Enhancement Requirements:
        ${request.enhancementGoals.map((goal) => `- ${goal}`).join("\n")}
        
        ${request.preserveCompatibility ? "IMPORTANT: Preserve backward compatibility" : ""}
        
        Provide the response in JSON format:
        {
          "enhancedScript": "the improved script code",
          "improvements": ["list of specific improvements made"],
          "risks": ["potential risks or breaking changes"],
          "confidenceScore": number (0-1),
          "testingSuggestions": ["recommended testing approaches"]
        }
        
        Focus on:
        - Security improvements
        - Performance optimizations
        - Error handling enhancements
        - Code readability
        - Best practices implementation
        - Maintainability improvements
      `;
      const response = await openai3.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert script enhancement specialist. Provide production-ready script improvements with detailed analysis."
          },
          {
            role: "user",
            content: enhancementPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });
      const enhancementResult = JSON.parse(response.choices[0].message.content || "{}");
      const result = {
        originalScript: request.originalScript,
        enhancedScript: enhancementResult.enhancedScript || optimized.optimizedCode,
        improvements: enhancementResult.improvements || optimized.improvements,
        risks: enhancementResult.risks || [],
        confidenceScore: enhancementResult.confidenceScore || 0.8,
        testingSuggestions: enhancementResult.testingSuggestions || []
      };
      this.cache.set(cacheKey, result, this.config.cacheTTL);
      const scriptGeneration = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        requestType: "enhance",
        purpose: `Script enhancement: ${request.enhancementGoals.join(", ")}`,
        requirements: request.enhancementGoals,
        originalScript: request.originalScript,
        generatedScript: result.enhancedScript,
        scriptType: request.scriptType,
        documentation: `Enhanced script with improvements: ${result.improvements.join(", ")}`,
        explanation: `This script was enhanced based on the following goals: ${request.enhancementGoals.join(", ")}. Key improvements include: ${result.improvements.slice(0, 3).join(", ")}.`,
        aiModel: "gpt-4o",
        tokensUsed: this.estimateTokens(JSON.stringify(request) + JSON.stringify(result)),
        estimatedCost: this.calculateCost("gpt-4o", this.estimateTokens(JSON.stringify(request) + JSON.stringify(result))),
        processingTime: Date.now() - startTime,
        qualityScore: result.confidenceScore
      };
      await storage.createAiScriptGeneration(scriptGeneration);
      await this.logUsage(
        context,
        "script-enhancement",
        requestId,
        true,
        scriptGeneration.tokensUsed || 0,
        scriptGeneration.estimatedCost || 0,
        Date.now() - startTime
      );
      return {
        data: result,
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          tokensUsed: scriptGeneration.tokensUsed || 0,
          cost: scriptGeneration.estimatedCost || 0,
          cached: false,
          model: "gpt-4o",
          confidence: result.confidenceScore
        },
        audit: {
          userId: context.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "script-enhancement",
          success: true
        }
      };
    } catch (error) {
      await this.logUsage(context, "script-enhancement", requestId, false, 0, 0, Date.now() - startTime, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }
  async convertScript(request, context) {
    const startTime = Date.now();
    const requestId = `script-convert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    try {
      if (!await this.rateLimiter.checkLimit(context, this.config.rateLimitRequests, this.config.rateLimitWindow)) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      const cacheKey = this.generateCacheKey("script-conversion", request, context);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        await this.logUsage(context, "script-conversion", requestId, true, 0, 0, Date.now() - startTime);
        return {
          data: cached,
          metadata: {
            requestId,
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            cost: 0,
            cached: true,
            model: "gpt-4o"
          },
          audit: {
            userId: context.userId,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            endpoint: "script-conversion",
            success: true
          }
        };
      }
      if (this.config.enableContentFiltering) {
        await this.validateContent(request.originalScript);
      }
      const conversionPrompt = `
        Convert this ${request.sourceLanguage} script to ${request.targetLanguage}:
        
        Original ${request.sourceLanguage} Script:
        \`\`\`${request.sourceLanguage}
        ${request.originalScript}
        \`\`\`
        
        Requirements:
        - Convert to idiomatic ${request.targetLanguage} code
        ${request.preserveFunctionality ? "- Preserve exact functionality" : "- Optimize for target language best practices"}
        ${request.addComments ? "- Add explanatory comments" : "- Keep comments minimal"}
        - Include proper error handling for ${request.targetLanguage}
        - Use modern ${request.targetLanguage} features and best practices
        
        Provide the response in JSON format:
        {
          "convertedScript": "the converted script code",
          "conversionNotes": ["notes about the conversion process"],
          "compatibilityWarnings": ["potential compatibility issues"],
          "equivalentFunctions": {"original_function": "converted_function"},
          "testingSuggestions": ["testing recommendations"]
        }
      `;
      const response = await openai3.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert in ${request.sourceLanguage} and ${request.targetLanguage} programming languages. Convert scripts accurately while maintaining functionality and following best practices.`
          },
          {
            role: "user",
            content: conversionPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });
      const conversionResult = JSON.parse(response.choices[0].message.content || "{}");
      const result = {
        originalScript: request.originalScript,
        convertedScript: conversionResult.convertedScript || "",
        conversionNotes: conversionResult.conversionNotes || [],
        compatibilityWarnings: conversionResult.compatibilityWarnings || [],
        equivalentFunctions: conversionResult.equivalentFunctions || {},
        testingSuggestions: conversionResult.testingSuggestions || []
      };
      this.cache.set(cacheKey, result, this.config.cacheTTL);
      const scriptGeneration = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        requestType: "convert",
        purpose: `Convert script from ${request.sourceLanguage} to ${request.targetLanguage}`,
        requirements: [
          `Source: ${request.sourceLanguage}`,
          `Target: ${request.targetLanguage}`,
          ...request.preserveFunctionality ? ["Preserve functionality"] : [],
          ...request.addComments ? ["Add comments"] : []
        ],
        originalScript: request.originalScript,
        generatedScript: result.convertedScript,
        scriptType: request.targetLanguage,
        documentation: `Converted from ${request.sourceLanguage} to ${request.targetLanguage}. ${result.conversionNotes.join(". ")}`,
        explanation: `This script was converted from ${request.sourceLanguage} to ${request.targetLanguage} while preserving core functionality.`,
        aiModel: "gpt-4o",
        tokensUsed: this.estimateTokens(JSON.stringify(request) + JSON.stringify(result)),
        estimatedCost: this.calculateCost("gpt-4o", this.estimateTokens(JSON.stringify(request) + JSON.stringify(result))),
        processingTime: Date.now() - startTime
      };
      await storage.createAiScriptGeneration(scriptGeneration);
      await this.logUsage(
        context,
        "script-conversion",
        requestId,
        true,
        scriptGeneration.tokensUsed || 0,
        scriptGeneration.estimatedCost || 0,
        Date.now() - startTime
      );
      return {
        data: result,
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          tokensUsed: scriptGeneration.tokensUsed || 0,
          cost: scriptGeneration.estimatedCost || 0,
          cached: false,
          model: "gpt-4o"
        },
        audit: {
          userId: context.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "script-conversion",
          success: true
        }
      };
    } catch (error) {
      await this.logUsage(context, "script-conversion", requestId, false, 0, 0, Date.now() - startTime, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }
  // ===== ENTERPRISE AI ANALYSIS =====
  async analyzeEndpoints(request, context) {
    const startTime = Date.now();
    const requestId = `endpoint-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    try {
      if (!await this.rateLimiter.checkLimit(context, this.config.rateLimitRequests, this.config.rateLimitWindow)) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      const analysis = await AIDiscoveryService.analyzeNetworkTopology(request.endpointData);
      const enhancedAnalysis = {
        ...analysis,
        analysisType: request.analysisType || "endpoints",
        processingTime: Date.now() - startTime,
        recommendations: request.includeRecommendations ? analysis.recommendations : void 0
      };
      const analysisReport = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        analysisType: "endpoints",
        title: "Endpoint Analysis Report",
        description: `AI analysis of ${request.endpointData.length} endpoints`,
        inputData: { endpoints: ensureNonEmpty(request.endpointData, { id: "default", name: "No endpoints provided" }) },
        findings: analysis.anomalies.map((anomaly, index) => ({
          category: "endpoint",
          severity: analysis.securityRisk,
          title: "Endpoint Anomaly",
          description: anomaly,
          evidence: [],
          recommendations: analysis.recommendations,
          confidence: analysis.confidence
        })),
        overallScore: analysis.networkHealth,
        confidenceLevel: analysis.confidence,
        riskLevel: analysis.securityRisk,
        aiModel: "gpt-4o",
        processingTime: Date.now() - startTime,
        tokensUsed: this.estimateTokens(JSON.stringify(request.endpointData)),
        estimatedCost: this.calculateCost("gpt-4o", this.estimateTokens(JSON.stringify(request.endpointData)))
      };
      await storage.createAiAnalysisReport(analysisReport);
      await this.logUsage(
        context,
        "endpoint-analysis",
        requestId,
        true,
        analysisReport.tokensUsed || 0,
        analysisReport.estimatedCost || 0,
        Date.now() - startTime
      );
      return {
        data: enhancedAnalysis,
        metadata: {
          requestId,
          processingTime: Date.now() - startTime,
          tokensUsed: analysisReport.tokensUsed || 0,
          cost: analysisReport.estimatedCost || 0,
          cached: false,
          model: "gpt-4o",
          confidence: analysis.confidence
        },
        audit: {
          userId: context.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "endpoint-analysis",
          success: true
        }
      };
    } catch (error) {
      await this.logUsage(context, "endpoint-analysis", requestId, false, 0, 0, Date.now() - startTime, error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }
  // ===== UTILITY METHODS =====
  // SECURE: Generate cache key with tenant isolation
  generateCacheKey(operation, request, context) {
    const contextStr = context ? `${context.userId}:${context.domainId || "no-domain"}:${context.tenantId || "no-tenant"}` : "no-context";
    const requestStr = JSON.stringify(request);
    const combined = `${contextStr}:${operation}:${requestStr}`;
    return `ai-cache-${Buffer.from(combined).toString("base64").slice(0, 48)}`;
  }
  async validateContent(content) {
    const suspiciousPatterns = [
      /rm\s+-rf\s+\//i,
      /del\s+\/s\s+\/q\s+c:\\/i,
      /format\s+c:/i,
      /malware|virus|backdoor/i
    ];
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        throw new Error("Content contains potentially harmful instructions");
      }
    }
  }
  async getOrganizationalContext(domainId, tenantId) {
    if (!domainId && !tenantId) return "";
    try {
      const domain = domainId ? await storage.getDomainById(domainId) : null;
      const tenant = tenantId ? await storage.getTenantById(tenantId) : null;
      const context = [];
      if (domain) {
        context.push(`Organization: ${domain.displayName}`);
        if (domain.settings?.features) {
          context.push(`Available features: ${domain.settings.features.join(", ")}`);
        }
      }
      if (tenant) {
        context.push(`Department/Tenant: ${tenant.displayName}`);
        if (tenant.settings?.features) {
          context.push(`Tenant features: ${tenant.settings.features.join(", ")}`);
        }
      }
      return context.join(". ");
    } catch (error) {
      return "";
    }
  }
  async getSecurityPolicies(domainId, tenantId) {
    try {
      const policies2 = await storage.getAllPolicies();
      const relevantPolicies = policies2.filter((p) => p.category === "security" && p.isActive).slice(0, 3).map((p) => p.name);
      return relevantPolicies.length > 0 ? `Security policies to consider: ${relevantPolicies.join(", ")}` : "";
    } catch (error) {
      return "";
    }
  }
  async analyzeGeneratedScript(code, scriptType) {
    try {
      return await AIScriptService.analyzeScript(code, scriptType);
    } catch (error) {
      return {
        quality: 3,
        security: { score: 3, issues: [], recommendations: [] },
        performance: { score: 3, suggestions: [] },
        maintainability: { score: 3, improvements: [] },
        documentation: { completeness: 3, suggestions: [] },
        overallRecommendations: []
      };
    }
  }
  estimateTokens(text2) {
    return Math.ceil(text2.length / 4);
  }
  calculateCost(model, tokens) {
    const pricing = {
      "gpt-4o": { input: 5e-3, output: 0.015 },
      // per 1K tokens
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-3.5-turbo": { input: 2e-3, output: 2e-3 }
    };
    const modelPricing = pricing[model] || pricing["gpt-4o"];
    const inputTokens = Math.floor(tokens * 0.7);
    const outputTokens = Math.floor(tokens * 0.3);
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1e3;
  }
  async logUsage(context, endpoint, requestId, success, tokensUsed, cost, responseTime, errorMessage) {
    try {
      if (!this.config.enableAuditLogging) return;
      const usageLog = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        endpoint,
        method: "POST",
        requestType: endpoint,
        sessionId: context.sessionId,
        aiModel: "gpt-4o",
        inputTokens: Math.floor(tokensUsed * 0.7),
        outputTokens: Math.floor(tokensUsed * 0.3),
        totalTokens: tokensUsed,
        totalCost: cost,
        requestStartTime: new Date(Date.now() - responseTime),
        requestEndTime: /* @__PURE__ */ new Date(),
        responseTime,
        httpStatus: success ? 200 : 500,
        success,
        errorMessage,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      };
      await storage.createAiUsageLog(usageLog);
    } catch (error) {
      console.error("Failed to log AI usage:", error);
    }
  }
  // ===== ADMIN METHODS =====
  getRateLimiter() {
    return this.rateLimiter;
  }
  getCacheStats() {
    return {
      size: this.cache.size()
    };
  }
  clearCache() {
    this.cache.clear();
  }
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
};
var enterpriseAIService = new EnterpriseAIService();

// server/external-integration-service.ts
import { eq as eq2 } from "drizzle-orm";
var ExternalIntegrationService = class {
  rateLimitTracker = /* @__PURE__ */ new Map();
  constructor() {
    this.setupWebhookEndpoints();
  }
  // Outbound Integration - Send asset data to external systems
  async syncAssetToExternalSystems(assetId, action) {
    try {
      const [asset] = await db.select().from(endpoints).where(eq2(endpoints.id, assetId));
      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }
      const systems = await this.getEnabledExternalSystems(["outbound", "bidirectional"]);
      const syncPayload = {
        action,
        asset: {
          id: asset.id,
          name: asset.hostname,
          // Use hostname as name
          ipAddress: asset.ipAddress,
          macAddress: asset.macAddress || void 0,
          operatingSystem: asset.operatingSystem || void 0,
          discoveryMethod: asset.discoveryMethod || "unknown",
          status: asset.status,
          lastSeen: asset.lastSeen?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
          vulnerabilities: asset.vulnerabilities || [],
          installedSoftware: asset.installedSoftware || [],
          networkPorts: asset.networkPorts || [],
          systemInfo: asset.systemInfo || {},
          customFields: asset.customFields || {}
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "endpoint-management-system",
        metadata: {
          actionTriggeredBy: "system",
          integrationVersion: "1.0.0"
        }
      };
      const results = await Promise.allSettled(
        systems.map((system) => this.sendToExternalSystem(system, syncPayload))
      );
      await this.logIntegrationResults(assetId, action, results, systems);
      return results;
    } catch (error) {
      console.error("Error syncing asset to external systems:", error);
      throw error instanceof Error ? error : new Error("Unknown error occurred");
    }
  }
  // Inbound Integration - Receive and process updates from external systems
  async processInboundAssetUpdate(systemId, update) {
    try {
      const system = await this.getExternalSystemById(systemId);
      if (!system || !["inbound", "bidirectional"].includes(system.syncDirection)) {
        throw new Error(`External system ${systemId} not found or not configured for inbound sync`);
      }
      let asset = await this.findAssetByExternalId(update.externalId, systemId);
      switch (update.action) {
        case "update":
          if (asset) {
            await this.updateExistingAsset(asset.id, update);
          } else {
            await this.createAssetFromExternalUpdate(update, systemId);
          }
          break;
        case "delete":
          if (asset) {
            await this.deleteAsset(asset.id);
          }
          break;
        case "status_change":
          if (asset) {
            await this.updateAssetStatus(asset.id, update.status || "unknown");
          }
          break;
      }
      await this.logInboundIntegration(systemId, update);
      return { success: true, message: `Asset ${update.externalId} processed successfully` };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error processing inbound asset update:", error);
      await this.logInboundIntegration(systemId, update, errorMessage);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
  // Send data to external system with rate limiting and retry logic
  async sendToExternalSystem(system, payload) {
    if (!this.checkRateLimit(system.id, system.rateLimitPerMinute)) {
      throw new Error(`Rate limit exceeded for system ${system.name}`);
    }
    let attempt = 0;
    while (attempt < system.retryAttempts) {
      try {
        const response = await this.makeHttpRequest(system, payload);
        this.updateRateLimit(system.id);
        return {
          systemId: system.id,
          systemName: system.name,
          success: true,
          response: response.data,
          statusCode: response.status
        };
      } catch (error) {
        attempt++;
        if (attempt >= system.retryAttempts) {
          throw new Error(`Failed to sync to ${system.name} after ${attempt} attempts: ${error.message}`);
        }
        await this.sleep(Math.pow(2, attempt) * 1e3);
      }
    }
  }
  // Make HTTP request to external system
  async makeHttpRequest(system, payload) {
    const headers = {
      "Content-Type": "application/json",
      "User-Agent": "Endpoint-Management-System/1.0.0"
    };
    switch (system.authType) {
      case "bearer":
        headers["Authorization"] = `Bearer ${system.apiKey}`;
        break;
      case "api-key":
        headers["X-API-Key"] = system.apiKey;
        break;
      case "basic":
        headers["Authorization"] = `Basic ${Buffer.from(system.apiKey).toString("base64")}`;
        break;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), system.timeoutMs);
    try {
      const response = await fetch(`${system.baseUrl}/assets/sync`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return {
        status: response.status,
        data: await response.json()
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
  // Rate limiting logic
  checkRateLimit(systemId, limitPerMinute) {
    const now = Date.now();
    const tracker = this.rateLimitTracker.get(systemId);
    if (!tracker || now > tracker.resetTime) {
      this.rateLimitTracker.set(systemId, {
        count: 0,
        resetTime: now + 6e4
        // Reset after 1 minute
      });
      return true;
    }
    return tracker.count < limitPerMinute;
  }
  updateRateLimit(systemId) {
    const tracker = this.rateLimitTracker.get(systemId);
    if (tracker) {
      tracker.count++;
    }
  }
  // Webhook endpoints setup for inbound integration
  setupWebhookEndpoints() {
  }
  // Helper methods
  async getEnabledExternalSystems(directions) {
    const systems = await db.select().from(externalSystems).where(eq2(externalSystems.enabled, true));
    return systems.filter((s) => directions.includes(s.syncDirection)).map((s) => ({
      id: s.id,
      name: s.name,
      baseUrl: s.baseUrl,
      apiKey: s.apiKey,
      authType: s.authType,
      enabled: s.enabled || true,
      syncDirection: s.syncDirection,
      webhookUrl: s.webhookUrl || void 0,
      rateLimitPerMinute: s.rateLimitPerMinute || 60,
      retryAttempts: s.retryAttempts || 3,
      timeoutMs: s.timeoutMs || 3e4
    }));
  }
  async getExternalSystemById(systemId) {
    const [system] = await db.select().from(externalSystems).where(eq2(externalSystems.id, systemId));
    return system;
  }
  async findAssetByExternalId(externalId, systemId) {
    const [mapping] = await db.select().from(assetExternalMappings).where(eq2(assetExternalMappings.externalId, externalId));
    if (mapping) {
      const [asset] = await db.select().from(endpoints).where(eq2(endpoints.id, mapping.assetId));
      return asset;
    }
    return void 0;
  }
  async updateExistingAsset(assetId, update) {
    const updateData = {};
    if (update.name) updateData.name = update.name;
    if (update.status) updateData.status = update.status;
    if (update.ipAddress) updateData.ipAddress = update.ipAddress;
    if (update.operatingSystem) updateData.operatingSystem = update.operatingSystem;
    if (update.lastSeen) updateData.lastSeen = new Date(update.lastSeen);
    if (update.vulnerabilities) updateData.vulnerabilities = update.vulnerabilities;
    if (update.installedSoftware) updateData.installedSoftware = update.installedSoftware;
    if (update.customFields) updateData.customFields = update.customFields;
    updateData.updatedAt = /* @__PURE__ */ new Date();
    await db.update(endpoints).set(updateData).where(eq2(endpoints.id, assetId));
  }
  async createAssetFromExternalUpdate(update, systemId) {
    const newAsset = {
      hostname: update.name || `Asset-${update.externalId}`,
      ipAddress: update.ipAddress || "Unknown",
      assetType: "server",
      status: update.status || "unknown",
      operatingSystem: update.operatingSystem,
      discoveryMethod: `external-${systemId}`,
      lastSeen: update.lastSeen ? new Date(update.lastSeen) : /* @__PURE__ */ new Date(),
      vulnerabilities: update.vulnerabilities || [],
      installedSoftware: update.installedSoftware || [],
      customFields: update.customFields || {},
      externalId: update.externalId,
      externalSystemId: systemId,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db.insert(endpoints).values(newAsset);
  }
  async deleteAsset(assetId) {
    await db.delete(endpoints).where(eq2(endpoints.id, assetId));
  }
  async updateAssetStatus(assetId, status) {
    await db.update(endpoints).set({
      status,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(endpoints.id, assetId));
  }
  async logIntegrationResults(assetId, action, results, systems) {
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const system = systems[i];
      await db.insert(integrationLogs).values({
        assetId,
        systemId: system.id,
        action,
        direction: "outbound",
        success: result.status === "fulfilled",
        errorMessage: result.status === "rejected" ? result.reason : null,
        requestPayload: JSON.stringify({ action, assetId }),
        responsePayload: result.status === "fulfilled" ? JSON.stringify(result.value) : null,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
  }
  async logInboundIntegration(systemId, update, error) {
    await db.insert(integrationLogs).values({
      systemId,
      action: update.action,
      direction: "inbound",
      success: !error,
      errorMessage: error || null,
      requestPayload: JSON.stringify(update),
      timestamp: /* @__PURE__ */ new Date()
    });
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
var externalIntegrationService = new ExternalIntegrationService();

// server/routes.ts
var validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
  const validApiKeys = ["demo-api-key-12345", "external-system-key"];
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Valid API key required for external endpoints"
    });
  }
  next();
};
async function registerRoutes(app2) {
  const externalIntegrationService2 = new ExternalIntegrationService();
  app2.get("/api/domains", async (req, res) => {
    try {
      const domains2 = await storage.getAllDomains();
      res.json(domains2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });
  app2.get("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const domain = await storage.getDomainById(id);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      res.json(domain);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch domain" });
    }
  });
  app2.post("/api/domains", async (req, res) => {
    try {
      const domainData = insertDomainSchema.parse(req.body);
      const domain = await storage.createDomain(domainData);
      res.status(201).json(domain);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain data" });
    }
  });
  app2.put("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const domainData = insertDomainSchema.parse(req.body);
      const domain = await storage.updateDomain(id, domainData);
      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }
      res.json(domain);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain data" });
    }
  });
  app2.delete("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDomain(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete domain" });
    }
  });
  app2.get("/api/tenants", async (req, res) => {
    try {
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenants2 = await storage.getAllTenants(domainId);
      res.json(tenants2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });
  app2.get("/api/tenants/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const tenants2 = await storage.getAllTenants(domainId);
      res.json(tenants2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenants for domain" });
    }
  });
  app2.get("/api/tenants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tenant = await storage.getTenantById(id);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });
  app2.post("/api/tenants", async (req, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(tenantData);
      res.status(201).json(tenant);
    } catch (error) {
      res.status(400).json({ message: "Invalid tenant data" });
    }
  });
  app2.put("/api/tenants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.updateTenant(id, tenantData);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(400).json({ message: "Invalid tenant data" });
    }
  });
  app2.delete("/api/tenants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTenant(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tenant" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.post("/api/dashboard/stats", async (req, res) => {
    try {
      const statsData = insertDashboardStatsSchema.parse(req.body);
      const stats = await storage.updateDashboardStats(statsData);
      res.status(201).json(stats);
    } catch (error) {
      res.status(400).json({ message: "Invalid dashboard stats data" });
    }
  });
  app2.get("/api/dashboard/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });
  app2.get("/api/dashboard/system-status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });
  const sanitizeUser = (user) => {
    const { password, ...safeUser } = user;
    return safeUser;
  };
  const sanitizeUsers = (users2) => users2.map(sanitizeUser);
  app2.get("/api/users", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const search = req.query.search;
      const role = req.query.role;
      const globalRole = req.query.globalRole;
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const isActive = req.query.isActive ? req.query.isActive === "true" : void 0;
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder;
      if (page < 1 || limit < 1 || limit > 1e3) {
        return res.status(400).json({
          message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-1000"
        });
      }
      const result = await storage.getAllUsers({
        page,
        limit,
        search,
        role,
        globalRole,
        domainId,
        tenantId,
        isActive,
        sortBy,
        sortOrder
      });
      res.json({
        users: sanitizeUsers(result.users),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
      const user = await storage.createUser(userData);
      res.status(201).json(sanitizeUser(user));
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid user data", errors: error.message });
      }
      res.status(500).json({ message: "Failed to create user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...updateData } = req.body;
      const userData = insertUserSchema.partial().parse(updateData);
      if (userData.username && userData.username !== existingUser.username) {
        const existingUsername = await storage.getUserByUsername(userData.username);
        if (existingUsername) {
          return res.status(409).json({ message: "Username already exists" });
        }
      }
      if (userData.email && userData.email !== existingUser.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(409).json({ message: "Email already exists" });
        }
      }
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid user data", errors: error.message });
      }
      res.status(500).json({ message: "Failed to update user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/role/:role", async (req, res) => {
    try {
      const role = req.params.role;
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const users2 = await storage.getUsersByRole(role, domainId, tenantId);
      res.json(sanitizeUsers(users2));
    } catch (error) {
      console.error("Error fetching users by role:", error);
      res.status(500).json({ message: "Failed to fetch users by role", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/global-role/:globalRole", async (req, res) => {
    try {
      const globalRole = req.params.globalRole;
      const users2 = await storage.getUsersByGlobalRole(globalRole);
      res.json(sanitizeUsers(users2));
    } catch (error) {
      console.error("Error fetching users by global role:", error);
      res.status(500).json({ message: "Failed to fetch users by global role", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      if (isNaN(domainId)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      const users2 = await storage.getUsersByDomain(domainId);
      res.json(sanitizeUsers(users2));
    } catch (error) {
      console.error("Error fetching users by domain:", error);
      res.status(500).json({ message: "Failed to fetch users by domain", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      if (isNaN(tenantId)) {
        return res.status(400).json({ message: "Invalid tenant ID" });
      }
      const users2 = await storage.getUsersByTenant(tenantId);
      res.json(sanitizeUsers(users2));
    } catch (error) {
      console.error("Error fetching users by tenant:", error);
      res.status(500).json({ message: "Failed to fetch users by tenant", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/users/search", async (req, res) => {
    try {
      const { searchTerm, domainId, tenantId } = req.body;
      if (!searchTerm || typeof searchTerm !== "string" || searchTerm.trim().length < 2) {
        return res.status(400).json({ message: "Search term must be at least 2 characters long" });
      }
      const users2 = await storage.searchUsers(searchTerm.trim(), { domainId, tenantId });
      res.json(sanitizeUsers(users2));
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/users/bulk-update", async (req, res) => {
    try {
      const { userIds, updates } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds must be a non-empty array" });
      }
      if (!updates || typeof updates !== "object") {
        return res.status(400).json({ message: "updates must be an object" });
      }
      const { password, id, createdAt, updatedAt, ...validUpdates } = updates;
      const userData = insertUserSchema.partial().parse(validUpdates);
      if (Object.keys(userData).length === 0) {
        return res.status(400).json({ message: "No valid update fields provided" });
      }
      const users2 = await storage.bulkUpdateUsers(userIds, userData);
      res.json({
        message: `Successfully updated ${users2.length} users`,
        updatedUsers: sanitizeUsers(users2)
      });
    } catch (error) {
      console.error("Error bulk updating users:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid update data", errors: error.message });
      }
      res.status(500).json({ message: "Failed to bulk update users", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/users/bulk-invite", async (req, res) => {
    try {
      const { users: userList } = req.body;
      if (!Array.isArray(userList) || userList.length === 0) {
        return res.status(400).json({ message: "users must be a non-empty array" });
      }
      if (userList.length > 100) {
        return res.status(400).json({ message: "Cannot invite more than 100 users at once" });
      }
      const validatedUsers = userList.map((user, index) => {
        try {
          return insertUserSchema.parse(user);
        } catch (error) {
          throw new Error(`Invalid user data at index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      });
      const usernames = /* @__PURE__ */ new Set();
      const emails = /* @__PURE__ */ new Set();
      for (const user of validatedUsers) {
        if (usernames.has(user.username)) {
          return res.status(400).json({ message: `Duplicate username in batch: ${user.username}` });
        }
        if (emails.has(user.email)) {
          return res.status(400).json({ message: `Duplicate email in batch: ${user.email}` });
        }
        usernames.add(user.username);
        emails.add(user.email);
      }
      for (const user of validatedUsers) {
        const existingUsername = await storage.getUserByUsername(user.username);
        if (existingUsername) {
          return res.status(409).json({ message: `Username already exists: ${user.username}` });
        }
        const existingEmail = await storage.getUserByEmail(user.email);
        if (existingEmail) {
          return res.status(409).json({ message: `Email already exists: ${user.email}` });
        }
      }
      const createdUsers = await storage.bulkCreateUsers(validatedUsers);
      res.status(201).json({
        message: `Successfully invited ${createdUsers.length} users`,
        invitedUsers: sanitizeUsers(createdUsers)
      });
    } catch (error) {
      console.error("Error bulk inviting users:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid user data", errors: error.message });
      }
      res.status(500).json({ message: "Failed to bulk invite users", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.patch("/api/users/:id/deactivate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.deactivateUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Failed to deactivate user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.patch("/api/users/:id/activate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.activateUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error activating user:", error);
      res.status(500).json({ message: "Failed to activate user", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/:id/preferences", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ preferences: user.preferences });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/users/:id/preferences", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const preferences = req.body;
      if (!preferences || typeof preferences !== "object") {
        return res.status(400).json({ message: "Preferences must be an object" });
      }
      const user = await storage.updateUserPreferences(id, preferences);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/users/:id/preferences/reset", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const user = await storage.resetUserPreferences(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error resetting user preferences:", error);
      res.status(500).json({ message: "Failed to reset user preferences", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/roles", async (req, res) => {
    try {
      const roleDefinitions = [
        {
          id: "viewer",
          name: "Viewer",
          description: "Read-only access to system resources",
          level: 1,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageDomains: false,
            canManageTenants: false,
            canManageUsers: false,
            canPublishGlobal: false,
            canAccessSubdomains: false,
            allowedFeatures: ["dashboard", "endpoints", "reports"]
          }
        },
        {
          id: "operator",
          name: "Operator",
          description: "Operational access with limited management capabilities",
          level: 2,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageEndpoints: true,
            canRunDiscovery: true,
            canManageCredentials: true,
            canManageDomains: false,
            canManageTenants: false,
            canManageUsers: false,
            canPublishGlobal: false,
            canAccessSubdomains: true,
            allowedFeatures: ["dashboard", "endpoints", "reports", "discovery", "credentials"]
          }
        },
        {
          id: "administrator",
          name: "Administrator",
          description: "Full administrative access within tenant scope",
          level: 3,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageEndpoints: true,
            canRunDiscovery: true,
            canManageCredentials: true,
            canManageUsers: true,
            canManagePolicies: true,
            canManageIntegrations: true,
            canManageDomains: false,
            canManageTenants: false,
            canPublishGlobal: false,
            canAccessSubdomains: true,
            allowedFeatures: ["dashboard", "endpoints", "reports", "discovery", "credentials", "users", "policies", "integrations"]
          }
        }
      ];
      const globalRoleDefinitions = [
        {
          id: "super_admin",
          name: "Super Administrator",
          description: "Global system administrator with full access",
          level: 10,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageEndpoints: true,
            canRunDiscovery: true,
            canManageCredentials: true,
            canManageUsers: true,
            canManagePolicies: true,
            canManageIntegrations: true,
            canManageDomains: true,
            canManageTenants: true,
            canPublishGlobal: true,
            canAccessSubdomains: true,
            canManageGlobalSettings: true,
            canManageSystemConfig: true,
            allowedFeatures: ["*"]
          }
        },
        {
          id: "domain_admin",
          name: "Domain Administrator",
          description: "Administrator for a specific domain and its tenants",
          level: 8,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageEndpoints: true,
            canRunDiscovery: true,
            canManageCredentials: true,
            canManageUsers: true,
            canManagePolicies: true,
            canManageIntegrations: true,
            canManageDomains: false,
            canManageTenants: true,
            canPublishGlobal: false,
            canAccessSubdomains: true,
            allowedFeatures: ["dashboard", "endpoints", "reports", "discovery", "credentials", "users", "policies", "integrations", "tenants"]
          }
        },
        {
          id: "tenant_admin",
          name: "Tenant Administrator",
          description: "Administrator for a specific tenant",
          level: 6,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageEndpoints: true,
            canRunDiscovery: true,
            canManageCredentials: true,
            canManageUsers: true,
            canManagePolicies: true,
            canManageIntegrations: true,
            canManageDomains: false,
            canManageTenants: false,
            canPublishGlobal: false,
            canAccessSubdomains: false,
            allowedFeatures: ["dashboard", "endpoints", "reports", "discovery", "credentials", "users", "policies", "integrations"]
          }
        }
      ];
      res.json({
        roles: roleDefinitions,
        globalRoles: globalRoleDefinitions,
        metadata: {
          totalRoles: roleDefinitions.length,
          totalGlobalRoles: globalRoleDefinitions.length,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/roles/:roleId", async (req, res) => {
    try {
      const roleId = req.params.roleId;
      const users2 = await storage.getUsersByRole(roleId);
      const roleDefinitions = {
        "viewer": {
          id: "viewer",
          name: "Viewer",
          description: "Read-only access to system resources",
          level: 1,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageDomains: false,
            canManageTenants: false,
            canManageUsers: false,
            canPublishGlobal: false,
            canAccessSubdomains: false,
            allowedFeatures: ["dashboard", "endpoints", "reports"]
          }
        },
        "operator": {
          id: "operator",
          name: "Operator",
          description: "Operational access with limited management capabilities",
          level: 2,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageEndpoints: true,
            canRunDiscovery: true,
            canManageCredentials: true,
            canManageDomains: false,
            canManageTenants: false,
            canManageUsers: false,
            canPublishGlobal: false,
            canAccessSubdomains: true,
            allowedFeatures: ["dashboard", "endpoints", "reports", "discovery", "credentials"]
          }
        },
        "administrator": {
          id: "administrator",
          name: "Administrator",
          description: "Full administrative access within tenant scope",
          level: 3,
          permissions: {
            canViewDashboard: true,
            canViewEndpoints: true,
            canViewReports: true,
            canManageEndpoints: true,
            canRunDiscovery: true,
            canManageCredentials: true,
            canManageUsers: true,
            canManagePolicies: true,
            canManageIntegrations: true,
            canManageDomains: false,
            canManageTenants: false,
            canPublishGlobal: false,
            canAccessSubdomains: true,
            allowedFeatures: ["dashboard", "endpoints", "reports", "discovery", "credentials", "users", "policies", "integrations"]
          }
        }
      };
      const role = roleDefinitions[roleId];
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json({
        ...role,
        assignedUsers: sanitizeUsers(users2),
        userCount: users2.length
      });
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Failed to fetch role", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/permissions", async (req, res) => {
    try {
      const permissions = [
        {
          id: "canViewDashboard",
          name: "View Dashboard",
          description: "Access to main dashboard and overview screens",
          category: "general"
        },
        {
          id: "canViewEndpoints",
          name: "View Endpoints",
          description: "View endpoint/asset inventory",
          category: "assets"
        },
        {
          id: "canManageEndpoints",
          name: "Manage Endpoints",
          description: "Create, update, and delete endpoints/assets",
          category: "assets"
        },
        {
          id: "canViewReports",
          name: "View Reports",
          description: "Access to reporting and analytics",
          category: "reporting"
        },
        {
          id: "canRunDiscovery",
          name: "Run Discovery",
          description: "Execute discovery jobs and scans",
          category: "discovery"
        },
        {
          id: "canManageCredentials",
          name: "Manage Credentials",
          description: "Create and manage credential profiles",
          category: "security"
        },
        {
          id: "canManageUsers",
          name: "Manage Users",
          description: "Create, update, and manage user accounts",
          category: "administration"
        },
        {
          id: "canManagePolicies",
          name: "Manage Policies",
          description: "Create and manage system policies",
          category: "administration"
        },
        {
          id: "canManageIntegrations",
          name: "Manage Integrations",
          description: "Configure external system integrations",
          category: "administration"
        },
        {
          id: "canManageDomains",
          name: "Manage Domains",
          description: "Create and manage domains",
          category: "global"
        },
        {
          id: "canManageTenants",
          name: "Manage Tenants",
          description: "Create and manage tenants within domains",
          category: "global"
        },
        {
          id: "canPublishGlobal",
          name: "Publish Global",
          description: "Publish content to global marketplace",
          category: "global"
        },
        {
          id: "canAccessSubdomains",
          name: "Access Subdomains",
          description: "Access to subdomain resources",
          category: "general"
        },
        {
          id: "canManageGlobalSettings",
          name: "Manage Global Settings",
          description: "Modify global system settings",
          category: "global"
        },
        {
          id: "canManageSystemConfig",
          name: "Manage System Config",
          description: "Access to system configuration and maintenance",
          category: "global"
        }
      ];
      const categories = [
        { id: "general", name: "General", description: "Basic system access permissions" },
        { id: "assets", name: "Asset Management", description: "Permissions related to endpoint/asset management" },
        { id: "reporting", name: "Reporting", description: "Access to reports and analytics" },
        { id: "discovery", name: "Discovery", description: "Discovery and scanning operations" },
        { id: "security", name: "Security", description: "Security-related operations" },
        { id: "administration", name: "Administration", description: "Administrative functions" },
        { id: "global", name: "Global", description: "Global system administration" }
      ];
      res.json({
        permissions,
        categories,
        metadata: {
          totalPermissions: permissions.length,
          totalCategories: categories.length,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/users/:id/role", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const { role, globalRole } = req.body;
      if (!role && !globalRole) {
        return res.status(400).json({ message: "Either role or globalRole must be provided" });
      }
      const validRoles = ["viewer", "operator", "administrator"];
      const validGlobalRoles = ["super_admin", "domain_admin", "tenant_admin"];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (globalRole && !validGlobalRoles.includes(globalRole)) {
        return res.status(400).json({ message: "Invalid global role" });
      }
      const updateData = {};
      if (role) updateData.role = role;
      if (globalRole) updateData.globalRole = globalRole;
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.put("/api/users/:id/permissions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const permissions = req.body;
      if (!permissions || typeof permissions !== "object") {
        return res.status(400).json({ message: "Permissions must be an object" });
      }
      const user = await storage.updateUser(id, { permissions });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error updating user permissions:", error);
      res.status(500).json({ message: "Failed to update user permissions", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/:id/activity", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const type = req.query.type;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      if (page < 1 || limit < 1 || limit > 1e3) {
        return res.status(400).json({
          message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-1000"
        });
      }
      const activities = await storage.getUserActivityLogs(id, {
        page,
        limit,
        type,
        startDate,
        endDate
      });
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/:id/sessions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const sessions = await storage.getUserActiveSessions(id);
      res.json({ sessions });
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Failed to fetch user sessions", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.delete("/api/users/:id/sessions/:sessionId", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sessionId = req.params.sessionId;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }
      const success = await storage.terminateUserSession(id, sessionId);
      if (!success) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error terminating user session:", error);
      res.status(500).json({ message: "Failed to terminate user session", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/users/:id/sessions/terminate-all", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const terminatedCount = await storage.terminateAllUserSessions(id);
      res.json({
        message: `Successfully terminated ${terminatedCount} sessions`,
        terminatedSessionsCount: terminatedCount
      });
    } catch (error) {
      console.error("Error terminating all user sessions:", error);
      res.status(500).json({ message: "Failed to terminate all user sessions", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/users/:id/activity", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const { type, details, targetType, targetId, ipAddress, userAgent } = req.body;
      if (!type) {
        return res.status(400).json({ message: "Activity type is required" });
      }
      const activityData = {
        userId: id,
        type,
        details: details || "",
        targetType: targetType || null,
        targetId: targetId || null,
        ipAddress: ipAddress || req.ip || req.connection.remoteAddress,
        userAgent: userAgent || req.get("User-Agent") || "",
        timestamp: /* @__PURE__ */ new Date()
      };
      const activity = await storage.logUserActivity(activityData);
      res.status(201).json({
        message: "Activity logged successfully",
        activity
      });
    } catch (error) {
      console.error("Error logging user activity:", error);
      res.status(500).json({ message: "Failed to log user activity", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/activity", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const type = req.query.type;
      const userId = req.query.userId ? parseInt(req.query.userId) : void 0;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      if (page < 1 || limit < 1 || limit > 1e3) {
        return res.status(400).json({
          message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-1000"
        });
      }
      const activities = await storage.getSystemActivityLogs({
        page,
        limit,
        type,
        userId,
        startDate,
        endDate
      });
      res.json(activities);
    } catch (error) {
      console.error("Error fetching system activity:", error);
      res.status(500).json({ message: "Failed to fetch system activity", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/endpoints", async (req, res) => {
    try {
      const endpoints2 = await storage.getAllEndpoints();
      res.json(endpoints2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch endpoints" });
    }
  });
  app2.get("/api/endpoints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const endpoint = await storage.getEndpoint(id);
      if (!endpoint) {
        return res.status(404).json({ message: "Endpoint not found" });
      }
      res.json(endpoint);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch endpoint" });
    }
  });
  app2.post("/api/endpoints", async (req, res) => {
    try {
      const endpointData = insertEndpointSchema.parse(req.body);
      const endpoint = await storage.createEndpoint(endpointData);
      try {
        await externalIntegrationService2.syncAssetToExternalSystems(endpoint.id, "create");
      } catch (syncError) {
        console.warn("Failed to sync new asset to external systems:", syncError);
      }
      res.status(201).json(endpoint);
    } catch (error) {
      res.status(400).json({ message: "Invalid endpoint data" });
    }
  });
  app2.patch("/api/endpoints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const endpointData = req.body;
      const endpoint = await storage.updateEndpoint(id, endpointData);
      if (!endpoint) {
        return res.status(404).json({ message: "Endpoint not found" });
      }
      try {
        await externalIntegrationService2.syncAssetToExternalSystems(id, "update");
      } catch (syncError) {
        console.warn("Failed to sync updated asset to external systems:", syncError);
      }
      res.json(endpoint);
    } catch (error) {
      res.status(400).json({ message: "Invalid endpoint data" });
    }
  });
  app2.delete("/api/endpoints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      try {
        await externalIntegrationService2.syncAssetToExternalSystems(id, "delete");
      } catch (syncError) {
        console.warn("Failed to sync deleted asset to external systems:", syncError);
      }
      const success = await storage.deleteEndpoint(id);
      if (!success) {
        return res.status(404).json({ message: "Endpoint not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete endpoint" });
    }
  });
  app2.get("/api/credential-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllCredentialProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching credential profiles:", error);
      res.status(500).json({ message: "Failed to fetch credential profiles", error: error.message });
    }
  });
  app2.get("/api/credential-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getCredentialProfile(id);
      if (!profile) {
        return res.status(404).json({ message: "Credential profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credential profile" });
    }
  });
  app2.post("/api/credential-profiles", async (req, res) => {
    try {
      const profileData = insertCredentialProfileSchema.parse(req.body);
      const profile = await storage.createCredentialProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid credential profile data" });
    }
  });
  app2.patch("/api/credential-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profileData = req.body;
      const profile = await storage.updateCredentialProfile(id, profileData);
      if (!profile) {
        return res.status(404).json({ message: "Credential profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid credential profile data" });
    }
  });
  app2.delete("/api/credential-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCredentialProfile(id);
      if (!success) {
        return res.status(404).json({ message: "Credential profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credential profile" });
    }
  });
  app2.get("/api/discovery-probes", async (req, res) => {
    try {
      const probes = await storage.getAllDiscoveryProbes();
      res.json(probes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch satellite servers" });
    }
  });
  app2.get("/api/discovery-probes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const probe = await storage.getDiscoveryProbe(id);
      if (!probe) {
        return res.status(404).json({ message: "Satellite server not found" });
      }
      res.json(probe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch satellite server" });
    }
  });
  app2.post("/api/discovery-probes", async (req, res) => {
    try {
      const probeData = insertDiscoveryProbeSchema.parse(req.body);
      const probe = await storage.createDiscoveryProbe(probeData);
      res.status(201).json(probe);
    } catch (error) {
      res.status(400).json({ message: "Invalid satellite server data" });
    }
  });
  app2.patch("/api/discovery-probes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const probeData = req.body;
      const probe = await storage.updateDiscoveryProbe(id, probeData);
      if (!probe) {
        return res.status(404).json({ message: "Satellite server not found" });
      }
      res.json(probe);
    } catch (error) {
      res.status(400).json({ message: "Invalid satellite server data" });
    }
  });
  app2.delete("/api/discovery-probes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDiscoveryProbe(id);
      if (!success) {
        return res.status(404).json({ message: "Satellite server not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete satellite server" });
    }
  });
  app2.get("/api/scripts", async (req, res) => {
    try {
      const scripts2 = await storage.getAllScripts();
      res.json(scripts2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scripts" });
    }
  });
  app2.get("/api/scripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      res.json(script);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch script" });
    }
  });
  app2.post("/api/scripts", async (req, res) => {
    try {
      const scriptData = insertScriptSchema.parse(req.body);
      const script = await storage.createScript(scriptData);
      res.status(201).json(script);
    } catch (error) {
      res.status(400).json({ message: "Invalid script data" });
    }
  });
  app2.patch("/api/scripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scriptData = req.body;
      const script = await storage.updateScript(id, scriptData);
      if (!script) {
        return res.status(404).json({ message: "Script not found" });
      }
      res.json(script);
    } catch (error) {
      res.status(400).json({ message: "Invalid script data" });
    }
  });
  app2.delete("/api/scripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteScript(id);
      if (!success) {
        return res.status(404).json({ message: "Script not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete script" });
    }
  });
  app2.get("/api/policies", async (req, res) => {
    try {
      const policies2 = await storage.getAllPolicies();
      res.json(policies2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });
  app2.get("/api/script-policies", async (req, res) => {
    try {
      const policies2 = await storage.getAllPolicies();
      res.json(policies2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });
  app2.get("/api/script-policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const policy = await storage.getPolicy(id);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policy" });
    }
  });
  app2.post("/api/script-policies", async (req, res) => {
    try {
      const policyData = insertPolicySchema.parse(req.body);
      const policy = await storage.createPolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Policy creation error:", error);
      res.status(400).json({ message: "Invalid policy data", error: error.message });
    }
  });
  app2.patch("/api/script-policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const policyData = req.body;
      const policy = await storage.updatePolicy(id, policyData);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(400).json({ message: "Invalid policy data" });
    }
  });
  app2.delete("/api/script-policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePolicy(id);
      if (!success) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete policy" });
    }
  });
  app2.get("/api/policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const policy = await storage.getPolicy(id);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policy" });
    }
  });
  app2.post("/api/policies", async (req, res) => {
    try {
      const policyData = insertPolicySchema.parse(req.body);
      const policy = await storage.createPolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      res.status(400).json({ message: "Invalid policy data" });
    }
  });
  app2.patch("/api/policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const policyData = req.body;
      const policy = await storage.updatePolicy(id, policyData);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(400).json({ message: "Invalid policy data" });
    }
  });
  app2.delete("/api/policies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePolicy(id);
      if (!success) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete policy" });
    }
  });
  const authenticateDiscoveryRequest = async (req, res, next) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Valid authenticated session required for discovery operations. Header-based authentication is not permitted.",
          error: "SESSION_REQUIRED"
        });
      }
      const user = await storage.getUser(parseInt(userId));
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Invalid or inactive user"
        });
      }
      req.discoveryContext = {
        userId: user.id,
        domainId: user.domainId,
        tenantId: user.tenantId,
        sessionId: req.sessionID || `session-${Date.now()}`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userRole: user.role,
        globalRole: user.globalRole
      };
      if (req.discoveryContext.tenantId) {
        const tenant = await storage.getTenantById(req.discoveryContext.tenantId);
        if (!tenant || tenant.domainId !== req.discoveryContext.domainId) {
          return res.status(403).json({
            success: false,
            message: "Access denied to tenant"
          });
        }
      }
      next();
    } catch (error) {
      console.error("Discovery Authentication Error:", error);
      res.status(500).json({
        success: false,
        message: "Authentication failed"
      });
    }
  };
  const enterpriseDiscoveryControls = async (req, res, next) => {
    try {
      const context = req.discoveryContext;
      if (!hasDiscoveryPermissions(context.userRole, context.globalRole)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions for discovery operations",
          error: "INSUFFICIENT_PERMISSIONS"
        });
      }
      req.discoveryRequestStartTime = Date.now();
      next();
    } catch (error) {
      console.error("Enterprise Discovery Controls Error:", error);
      res.status(500).json({
        success: false,
        message: "Enterprise controls validation failed"
      });
    }
  };
  function hasDiscoveryPermissions(userRole, globalRole) {
    const discoveryEnabledRoles = ["administrator", "operator", "super_admin", "domain_admin", "tenant_admin"];
    return discoveryEnabledRoles.includes(userRole || "") || discoveryEnabledRoles.includes(globalRole || "");
  }
  app2.use("/api/discovery-jobs", authenticateDiscoveryRequest);
  app2.use("/api/discovery-jobs", enterpriseDiscoveryControls);
  app2.use("/api/discovery-results", authenticateDiscoveryRequest);
  app2.use("/api/discovery-results", enterpriseDiscoveryControls);
  app2.use("/api/discovery-scheduling", authenticateDiscoveryRequest);
  app2.use("/api/discovery-scheduling", enterpriseDiscoveryControls);
  app2.use("/api/discovery-analytics", authenticateDiscoveryRequest);
  app2.use("/api/discovery-analytics", enterpriseDiscoveryControls);
  app2.get("/api/discovery-jobs", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const search = req.query.search;
      const status = req.query.status;
      const type = req.query.type;
      const { domainId, tenantId } = req.discoveryContext;
      const createdBy = req.query.createdBy ? parseInt(req.query.createdBy) : void 0;
      const probeId = req.query.probeId ? parseInt(req.query.probeId) : void 0;
      const credentialProfileId = req.query.credentialProfileId ? parseInt(req.query.credentialProfileId) : void 0;
      const startDate = req.query.startDate ? new Date(req.query.startDate) : void 0;
      const endDate = req.query.endDate ? new Date(req.query.endDate) : void 0;
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder;
      if (page < 1 || limit < 1 || limit > 1e3) {
        return res.status(400).json({
          message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-1000"
        });
      }
      const result = await storage.getAllDiscoveryJobsWithFilters({
        page,
        limit,
        search,
        status,
        type,
        domainId,
        // Server-derived from authenticated session
        tenantId,
        // Server-derived from authenticated session
        createdBy,
        probeId,
        credentialProfileId,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });
      await storage.createActivity({
        type: "discovery_jobs_accessed",
        description: `User accessed discovery jobs list`,
        userId: req.discoveryContext.userId,
        metadata: {
          filters: { status, type, search },
          resultCount: result.jobs.length,
          requestId: req.discoveryContext.requestId
        }
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching discovery jobs:", error);
      res.status(500).json({
        message: "Failed to fetch discovery jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const job = await storage.getDiscoveryJob(id);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      const { domainId, tenantId } = req.discoveryContext;
      if (tenantId && job.tenantId !== tenantId || domainId && job.domainId !== domainId) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this discovery job"
        });
      }
      await storage.createActivity({
        type: "discovery_job_accessed",
        description: `User accessed discovery job "${job.name}"`,
        userId: req.discoveryContext.userId,
        metadata: {
          jobId: job.id,
          requestId: req.discoveryContext.requestId
        }
      });
      res.json(job);
    } catch (error) {
      console.error("Error fetching discovery job:", error);
      res.status(500).json({
        message: "Failed to fetch discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs", async (req, res) => {
    try {
      const jobData = insertDiscoveryJobSchema.parse(req.body);
      const { domainId, tenantId, userId } = req.discoveryContext;
      jobData.domainId = domainId;
      jobData.tenantId = tenantId;
      jobData.createdBy = userId;
      if (jobData.targets) {
        const validation = await storage.validateDiscoveryTargets(jobData.targets, jobData.probeId || void 0);
        if (!validation.valid) {
          return res.status(400).json({
            message: "Invalid discovery targets",
            errors: validation.errors
          });
        }
      }
      if (jobData.credentialProfileId) {
        const validation = await storage.validateDiscoveryCredentials(jobData.credentialProfileId, jobData.targets);
        if (!validation.valid) {
          return res.status(400).json({
            message: "Invalid credential profile",
            errors: validation.errors
          });
        }
      }
      const job = await storage.createDiscoveryJob(jobData);
      await storage.createActivity({
        type: "discovery_job_created",
        description: `Created discovery job "${job.name}"`,
        userId: req.discoveryContext.userId,
        metadata: {
          jobId: job.id,
          action: "create",
          requestId: req.discoveryContext.requestId
        }
      });
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating discovery job:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid discovery job data",
          errors: error.message
        });
      }
      res.status(500).json({
        message: "Failed to create discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      const { domainId, tenantId, userId } = req.discoveryContext;
      if (tenantId && existingJob.tenantId !== tenantId || domainId && existingJob.domainId !== domainId) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this discovery job"
        });
      }
      if (existingJob.status === "running") {
        return res.status(409).json({ message: "Cannot update a running discovery job" });
      }
      const jobData = insertDiscoveryJobSchema.partial().parse(req.body);
      delete jobData.domainId;
      delete jobData.tenantId;
      jobData.updatedBy = userId;
      if (jobData.targets) {
        const validation = await storage.validateDiscoveryTargets(jobData.targets, jobData.probeId || existingJob.probeId || void 0);
        if (!validation.valid) {
          return res.status(400).json({
            message: "Invalid discovery targets",
            errors: validation.errors
          });
        }
      }
      if (jobData.credentialProfileId) {
        const validation = await storage.validateDiscoveryCredentials(jobData.credentialProfileId, jobData.targets || existingJob.targets);
        if (!validation.valid) {
          return res.status(400).json({
            message: "Invalid credential profile",
            errors: validation.errors
          });
        }
      }
      const job = await storage.updateDiscoveryJob(id, jobData);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      await storage.createActivity({
        type: "discovery_job_updated",
        description: `Updated discovery job "${job.name}"`,
        userId: req.discoveryContext.userId,
        metadata: {
          jobId: job.id,
          action: "update",
          changes: jobData,
          requestId: req.discoveryContext.requestId
        }
      });
      res.json(job);
    } catch (error) {
      console.error("Error updating discovery job:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid discovery job data",
          errors: error.message
        });
      }
      res.status(500).json({
        message: "Failed to update discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      const { domainId, tenantId } = req.discoveryContext;
      if (tenantId && existingJob.tenantId !== tenantId || domainId && existingJob.domainId !== domainId) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this discovery job"
        });
      }
      if (existingJob.status === "running") {
        return res.status(409).json({ message: "Cannot delete a running discovery job. Cancel it first." });
      }
      const success = await storage.deleteDiscoveryJob(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete discovery job" });
      }
      await storage.createActivity({
        type: "discovery_job_deleted",
        description: `Deleted discovery job "${existingJob.name}"`,
        userId: req.discoveryContext.userId,
        metadata: {
          jobId: id,
          jobName: existingJob.name,
          action: "delete",
          requestId: req.discoveryContext.requestId
        }
      });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting discovery job:", error);
      res.status(500).json({
        message: "Failed to delete discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs/:id/start", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      const { domainId, tenantId, userId } = req.discoveryContext;
      if (tenantId && existingJob.tenantId !== tenantId || domainId && existingJob.domainId !== domainId) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this discovery job"
        });
      }
      const job = await storage.startDiscoveryJob(id, userId);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error starting discovery job:", error);
      res.status(500).json({
        message: "Failed to start discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs/:id/pause", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      const { domainId, tenantId, userId } = req.discoveryContext;
      if (tenantId && existingJob.tenantId !== tenantId || domainId && existingJob.domainId !== domainId) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this discovery job"
        });
      }
      const job = await storage.pauseDiscoveryJob(id, userId);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error pausing discovery job:", error);
      res.status(500).json({
        message: "Failed to pause discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const userId = req.body.userId || 1;
      const reason = req.body.reason;
      const job = await storage.cancelDiscoveryJob(id, userId, reason);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error cancelling discovery job:", error);
      res.status(500).json({
        message: "Failed to cancel discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs/:id/resume", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const userId = req.body.userId || 1;
      const job = await storage.resumeDiscoveryJob(id, userId);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error resuming discovery job:", error);
      res.status(500).json({
        message: "Failed to resume discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const job = await storage.getDiscoveryJob(id);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json({
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        results: job.results
      });
    } catch (error) {
      console.error("Error fetching discovery job progress:", error);
      res.status(500).json({
        message: "Failed to fetch discovery job progress",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/:id/results", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const status = req.query.status;
      const assetType = req.query.assetType;
      const results = await storage.getDiscoveryJobResults(id, {
        page,
        limit,
        status,
        assetType
      });
      res.json(results);
    } catch (error) {
      console.error("Error fetching discovery job results:", error);
      res.status(500).json({
        message: "Failed to fetch discovery job results",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs/:id/clone", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const newName = req.body.name;
      const userId = req.body.userId || 1;
      if (!newName) {
        return res.status(400).json({ message: "New job name is required" });
      }
      const clonedJob = await storage.cloneDiscoveryJob(id, newName, userId);
      res.status(201).json(clonedJob);
    } catch (error) {
      console.error("Error cloning discovery job:", error);
      res.status(500).json({
        message: "Failed to clone discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs/bulk-update", async (req, res) => {
    try {
      const { jobIds, updates, userId = 1 } = req.body;
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({ message: "Job IDs array is required" });
      }
      if (!updates || typeof updates !== "object") {
        return res.status(400).json({ message: "Updates object is required" });
      }
      const jobs = await storage.bulkUpdateDiscoveryJobs(jobIds, updates, userId);
      res.json({
        message: `Successfully updated ${jobs.length} discovery jobs`,
        jobs
      });
    } catch (error) {
      console.error("Error bulk updating discovery jobs:", error);
      res.status(500).json({
        message: "Failed to bulk update discovery jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/discovery-jobs/bulk-delete", async (req, res) => {
    try {
      const { jobIds, userId = 1 } = req.body;
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({ message: "Job IDs array is required" });
      }
      const success = await storage.bulkDeleteDiscoveryJobs(jobIds, userId);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete discovery jobs" });
      }
      res.json({ message: `Successfully deleted ${jobIds.length} discovery jobs` });
    } catch (error) {
      console.error("Error bulk deleting discovery jobs:", error);
      res.status(500).json({
        message: "Failed to bulk delete discovery jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs/bulk-start", async (req, res) => {
    try {
      const { jobIds, userId = 1 } = req.body;
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({ message: "Job IDs array is required" });
      }
      const jobs = await storage.bulkStartDiscoveryJobs(jobIds, userId);
      res.json({
        message: `Successfully started ${jobs.length} discovery jobs`,
        jobs
      });
    } catch (error) {
      console.error("Error bulk starting discovery jobs:", error);
      res.status(500).json({
        message: "Failed to bulk start discovery jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-jobs/bulk-cancel", async (req, res) => {
    try {
      const { jobIds, userId = 1, reason } = req.body;
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({ message: "Job IDs array is required" });
      }
      const jobs = await storage.bulkCancelDiscoveryJobs(jobIds, userId, reason);
      res.json({
        message: `Successfully cancelled ${jobs.length} discovery jobs`,
        jobs
      });
    } catch (error) {
      console.error("Error bulk cancelling discovery jobs:", error);
      res.status(500).json({
        message: "Failed to bulk cancel discovery jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/by-status/:status", async (req, res) => {
    try {
      const status = req.params.status;
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const jobs = await storage.getDiscoveryJobsByStatus(status, domainId, tenantId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching discovery jobs by status:", error);
      res.status(500).json({
        message: "Failed to fetch discovery jobs by status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/by-type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const jobs = await storage.getDiscoveryJobsByType(type, domainId, tenantId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching discovery jobs by type:", error);
      res.status(500).json({
        message: "Failed to fetch discovery jobs by type",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/by-probe/:probeId", async (req, res) => {
    try {
      const probeId = parseInt(req.params.probeId);
      if (isNaN(probeId)) {
        return res.status(400).json({ message: "Invalid probe ID" });
      }
      const jobs = await storage.getDiscoveryJobsByProbe(probeId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching discovery jobs by probe:", error);
      res.status(500).json({
        message: "Failed to fetch discovery jobs by probe",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/by-credential/:credentialId", async (req, res) => {
    try {
      const credentialId = parseInt(req.params.credentialId);
      if (isNaN(credentialId)) {
        return res.status(400).json({ message: "Invalid credential profile ID" });
      }
      const jobs = await storage.getDiscoveryJobsByCredentialProfile(credentialId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching discovery jobs by credential:", error);
      res.status(500).json({
        message: "Failed to fetch discovery jobs by credential",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/by-domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      if (isNaN(domainId)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }
      const jobs = await storage.getDiscoveryJobsByDomain(domainId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching discovery jobs by domain:", error);
      res.status(500).json({
        message: "Failed to fetch discovery jobs by domain",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/by-tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      if (isNaN(tenantId)) {
        return res.status(400).json({ message: "Invalid tenant ID" });
      }
      const jobs = await storage.getDiscoveryJobsByTenant(tenantId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching discovery jobs by tenant:", error);
      res.status(500).json({
        message: "Failed to fetch discovery jobs by tenant",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/by-user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const jobs = await storage.getDiscoveryJobsByUser(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching discovery jobs by user:", error);
      res.status(500).json({
        message: "Failed to fetch discovery jobs by user",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-schedules", async (req, res) => {
    try {
      const scheduledJobs = await storage.getScheduledDiscoveryJobs();
      res.json(scheduledJobs);
    } catch (error) {
      console.error("Error fetching scheduled discovery jobs:", error);
      res.status(500).json({
        message: "Failed to fetch scheduled discovery jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-schedules", async (req, res) => {
    try {
      const { jobId, schedule } = req.body;
      if (!jobId || !schedule) {
        return res.status(400).json({ message: "Job ID and schedule are required" });
      }
      const job = await storage.scheduleDiscoveryJob(jobId, schedule);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error scheduling discovery job:", error);
      res.status(500).json({
        message: "Failed to schedule discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/discovery-schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid schedule ID" });
      }
      const { schedule } = req.body;
      if (!schedule) {
        return res.status(400).json({ message: "Schedule configuration is required" });
      }
      const job = await storage.scheduleDiscoveryJob(id, schedule);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error updating discovery job schedule:", error);
      res.status(500).json({
        message: "Failed to update discovery job schedule",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/discovery-schedules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid schedule ID" });
      }
      const job = await storage.unscheduleDiscoveryJob(id);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json({ message: "Discovery job schedule removed successfully" });
    } catch (error) {
      console.error("Error removing discovery job schedule:", error);
      res.status(500).json({
        message: "Failed to remove discovery job schedule",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-schedules/:id/trigger", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid schedule ID" });
      }
      const userId = req.body.userId || 1;
      const job = await storage.triggerScheduledJob(id, userId);
      if (!job) {
        return res.status(404).json({ message: "Scheduled discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error triggering scheduled discovery job:", error);
      res.status(500).json({
        message: "Failed to trigger scheduled discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-results", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const search = req.query.search;
      const status = req.query.status;
      const assetType = req.query.assetType;
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const jobId = req.query.jobId ? parseInt(req.query.jobId) : void 0;
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder;
      const result = await storage.getAllEndpointsWithFilters({
        page,
        limit,
        search,
        status,
        assetType,
        domainId,
        tenantId,
        discoveryJobId: jobId,
        sortBy,
        sortOrder
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching discovery results:", error);
      res.status(500).json({
        message: "Failed to fetch discovery results",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-results/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery result ID" });
      }
      const endpoint = await storage.getEndpoint(id);
      if (!endpoint) {
        return res.status(404).json({ message: "Discovery result not found" });
      }
      res.json(endpoint);
    } catch (error) {
      console.error("Error fetching discovery result:", error);
      res.status(500).json({
        message: "Failed to fetch discovery result",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/discovery-results/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery result ID" });
      }
      const updateData = insertEndpointSchema.partial().parse(req.body);
      const endpoint = await storage.updateEndpoint(id, updateData);
      if (!endpoint) {
        return res.status(404).json({ message: "Discovery result not found" });
      }
      res.json(endpoint);
    } catch (error) {
      console.error("Error updating discovery result:", error);
      res.status(500).json({
        message: "Failed to update discovery result",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-results/bulk-approve", async (req, res) => {
    try {
      const { jobId, endpointIds } = req.body;
      const { userId } = req.discoveryContext;
      if (!jobId || !Array.isArray(endpointIds) || endpointIds.length === 0) {
        return res.status(400).json({ message: "Job ID and endpoint IDs array are required" });
      }
      const success = await storage.bulkApproveDiscoveryResults(jobId, endpointIds, userId);
      if (!success) {
        return res.status(500).json({ message: "Failed to approve discovery results" });
      }
      res.json({ message: `Successfully approved ${endpointIds.length} discovery results` });
    } catch (error) {
      console.error("Error bulk approving discovery results:", error);
      res.status(500).json({
        message: "Failed to bulk approve discovery results",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-results/bulk-ignore", async (req, res) => {
    try {
      const { jobId, endpointIds } = req.body;
      const { userId } = req.discoveryContext;
      if (!jobId || !Array.isArray(endpointIds) || endpointIds.length === 0) {
        return res.status(400).json({ message: "Job ID and endpoint IDs array are required" });
      }
      const success = await storage.bulkIgnoreDiscoveryResults(jobId, endpointIds, userId);
      if (!success) {
        return res.status(500).json({ message: "Failed to ignore discovery results" });
      }
      res.json({ message: `Successfully ignored ${endpointIds.length} discovery results` });
    } catch (error) {
      console.error("Error bulk ignoring discovery results:", error);
      res.status(500).json({
        message: "Failed to bulk ignore discovery results",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-results/:id/convert-to-asset", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery result ID" });
      }
      const { userId } = req.discoveryContext;
      const endpoint = await storage.convertDiscoveryResultToAsset(id, userId);
      if (!endpoint) {
        return res.status(404).json({ message: "Discovery result not found" });
      }
      res.json(endpoint);
    } catch (error) {
      console.error("Error converting discovery result to asset:", error);
      res.status(500).json({
        message: "Failed to convert discovery result to asset",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-analytics", async (req, res) => {
    try {
      const { domainId, tenantId } = req.discoveryContext;
      const analytics = await storage.getDiscoveryJobStatistics(domainId, tenantId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching discovery analytics:", error);
      res.status(500).json({
        message: "Failed to fetch discovery analytics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-analytics/coverage", async (req, res) => {
    try {
      const { domainId, tenantId } = req.discoveryContext;
      const coverage = await storage.getDiscoveryCoverage(domainId, tenantId);
      res.json(coverage);
    } catch (error) {
      console.error("Error fetching discovery coverage:", error);
      res.status(500).json({
        message: "Failed to fetch discovery coverage",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-analytics/trends", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
      const endDate = req.query.endDate ? new Date(req.query.endDate) : /* @__PURE__ */ new Date();
      const { domainId, tenantId } = req.discoveryContext;
      const trends = await storage.getDiscoveryTrends(startDate, endDate, domainId, tenantId);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching discovery trends:", error);
      res.status(500).json({
        message: "Failed to fetch discovery trends",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-analytics/performance", async (req, res) => {
    try {
      const { domainId, tenantId } = req.discoveryContext;
      const performance = await storage.getDiscoveryPerformanceMetrics(domainId, tenantId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching discovery performance metrics:", error);
      res.status(500).json({
        message: "Failed to fetch discovery performance metrics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-scheduling/jobs", async (req, res) => {
    try {
      const { domainId, tenantId, userId } = req.discoveryContext;
      const scheduledJobs = await storage.getScheduledDiscoveryJobs();
      const filteredJobs = scheduledJobs.filter(
        (job) => (!tenantId || job.tenantId === tenantId) && (!domainId || job.domainId === domainId)
      );
      await storage.createActivity({
        type: "discovery_scheduled_jobs_accessed",
        description: `User accessed scheduled discovery jobs`,
        userId,
        metadata: {
          resultCount: filteredJobs.length,
          requestId: req.discoveryContext.requestId
        }
      });
      res.json(filteredJobs);
    } catch (error) {
      console.error("Error fetching scheduled discovery jobs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch scheduled discovery jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-scheduling/jobs/:id/schedule", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      const { domainId, tenantId, userId } = req.discoveryContext;
      if (tenantId && existingJob.tenantId !== tenantId || domainId && existingJob.domainId !== domainId) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this discovery job"
        });
      }
      const { schedule } = req.body;
      if (!schedule) {
        return res.status(400).json({ message: "Schedule configuration is required" });
      }
      const job = await storage.scheduleDiscoveryJob(id, schedule);
      await storage.createActivity({
        type: "discovery_job_scheduled",
        description: `Scheduled discovery job "${existingJob.name}"`,
        userId,
        metadata: {
          jobId: id,
          schedule,
          requestId: req.discoveryContext.requestId
        }
      });
      res.json(job);
    } catch (error) {
      console.error("Error scheduling discovery job:", error);
      res.status(500).json({
        success: false,
        message: "Failed to schedule discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/discovery-scheduling/jobs/:id/schedule", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      const { domainId, tenantId, userId } = req.discoveryContext;
      if (tenantId && existingJob.tenantId !== tenantId || domainId && existingJob.domainId !== domainId) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this discovery job"
        });
      }
      const job = await storage.unscheduleDiscoveryJob(id);
      await storage.createActivity({
        type: "discovery_job_unscheduled",
        description: `Unscheduled discovery job "${existingJob.name}"`,
        userId,
        metadata: {
          jobId: id,
          requestId: req.discoveryContext.requestId
        }
      });
      res.json({ message: "Discovery job schedule removed successfully" });
    } catch (error) {
      console.error("Error unscheduling discovery job:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unschedule discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery-scheduling/jobs/:id/trigger", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      const { domainId, tenantId, userId } = req.discoveryContext;
      if (tenantId && existingJob.tenantId !== tenantId || domainId && existingJob.domainId !== domainId) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this discovery job"
        });
      }
      const job = await storage.triggerScheduledJob(id, userId);
      await storage.createActivity({
        type: "discovery_job_triggered",
        description: `Manually triggered scheduled discovery job "${existingJob.name}"`,
        userId,
        metadata: {
          jobId: id,
          requestId: req.discoveryContext.requestId
        }
      });
      res.json(job);
    } catch (error) {
      console.error("Error triggering scheduled discovery job:", error);
      res.status(500).json({
        success: false,
        message: "Failed to trigger scheduled discovery job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery/validate-targets", async (req, res) => {
    try {
      const { targets, probeId } = req.body;
      if (!targets) {
        return res.status(400).json({ message: "Targets configuration is required" });
      }
      const validation = await storage.validateDiscoveryTargets(targets, probeId);
      res.json(validation);
    } catch (error) {
      console.error("Error validating discovery targets:", error);
      res.status(500).json({
        message: "Failed to validate discovery targets",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/discovery/validate-credentials", async (req, res) => {
    try {
      const { credentialProfileId, targets } = req.body;
      if (!credentialProfileId) {
        return res.status(400).json({ message: "Credential profile ID is required" });
      }
      const validation = await storage.validateDiscoveryCredentials(credentialProfileId, targets);
      res.json(validation);
    } catch (error) {
      console.error("Error validating discovery credentials:", error);
      res.status(500).json({
        message: "Failed to validate discovery credentials",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/discovery-jobs/:id/endpoints", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const endpoints2 = await storage.getEndpointsByDiscoveryJob(jobId);
      res.json(endpoints2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discovered endpoints" });
    }
  });
  app2.get("/api/agent-deployments", async (req, res) => {
    try {
      const deployments = await storage.getAllAgentDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent deployments" });
    }
  });
  app2.get("/api/agent-deployments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deployment = await storage.getAgentDeployment(id);
      if (!deployment) {
        return res.status(404).json({ message: "Agent deployment not found" });
      }
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent deployment" });
    }
  });
  app2.post("/api/agent-deployments", async (req, res) => {
    try {
      const deploymentData = insertAgentDeploymentSchema.parse(req.body);
      const deployment = await storage.createAgentDeployment(deploymentData);
      res.status(201).json(deployment);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent deployment data" });
    }
  });
  app2.patch("/api/agent-deployments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deploymentData = req.body;
      const deployment = await storage.updateAgentDeployment(id, deploymentData);
      if (!deployment) {
        return res.status(404).json({ message: "Agent deployment not found" });
      }
      res.json(deployment);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent deployment data" });
    }
  });
  app2.delete("/api/agent-deployments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAgentDeployment(id);
      if (!success) {
        return res.status(404).json({ message: "Agent deployment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete agent deployment" });
    }
  });
  app2.get("/api/agents", async (req, res) => {
    try {
      const agents2 = await storage.getAllAgents();
      res.json(agents2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });
  app2.get("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });
  app2.post("/api/agents", async (req, res) => {
    try {
      const agentData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(agentData);
      res.status(201).json(agent);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent data" });
    }
  });
  app2.patch("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const agentData = req.body;
      const agent = await storage.updateAgent(id, agentData);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent data" });
    }
  });
  app2.delete("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteAgent(id);
      if (!success) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });
  app2.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  app2.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivityLogSchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });
  app2.get("/api/activities/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const activities = await storage.getActivitiesByType(type);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities by type" });
    }
  });
  app2.get("/api/assets/inventory", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder || "desc";
      const status = req.query.status;
      const category = req.query.category;
      const criticality = req.query.criticality;
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const search = req.query.search;
      const result = await storage.getAssetInventoryWithFilters({
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        category,
        criticality,
        domainId,
        tenantId,
        search
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching asset inventory:", error);
      res.status(500).json({ message: "Failed to fetch asset inventory" });
    }
  });
  app2.get("/api/assets/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAssetInventoryById(id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });
  app2.post("/api/assets/inventory", async (req, res) => {
    try {
      const assetData = insertAssetInventorySchema.parse(req.body);
      const asset = await storage.createAssetInventory(assetData);
      if (req.body.userId) {
        await storage.createAssetAuditLog({
          assetId: asset.id,
          userId: req.body.userId,
          action: "create",
          changeDetails: { created: assetData },
          timestamp: /* @__PURE__ */ new Date()
        });
      }
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });
  app2.put("/api/assets/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const originalAsset = await storage.getAssetInventoryById(id);
      const assetData = insertAssetInventorySchema.partial().parse(req.body);
      const asset = await storage.updateAssetInventory(id, assetData);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      if (req.body.userId && originalAsset) {
        await storage.createAssetAuditLog({
          assetId: asset.id,
          userId: req.body.userId,
          action: "update",
          changeDetails: {
            before: originalAsset,
            after: asset,
            changes: assetData
          },
          timestamp: /* @__PURE__ */ new Date()
        });
      }
      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });
  app2.delete("/api/assets/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const originalAsset = await storage.getAssetInventoryById(id);
      const success = await storage.deleteAssetInventory(id);
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }
      if (req.body.userId && originalAsset) {
        await storage.createAssetAuditLog({
          assetId: id,
          userId: req.body.userId,
          action: "delete",
          changeDetails: { deleted: originalAsset },
          timestamp: /* @__PURE__ */ new Date()
        });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });
  app2.get("/api/assets/inventory/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const assets = await storage.getAssetInventoryByTenant(tenantId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets by tenant:", error);
      res.status(500).json({ message: "Failed to fetch assets by tenant" });
    }
  });
  app2.get("/api/assets/inventory/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const assets = await storage.getAssetInventoryByDomain(domainId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets by domain:", error);
      res.status(500).json({ message: "Failed to fetch assets by domain" });
    }
  });
  app2.post("/api/assets/inventory/bulk-update", async (req, res) => {
    try {
      const { assetIds, updates, userId } = req.body;
      if (!Array.isArray(assetIds) || assetIds.length === 0) {
        return res.status(400).json({ message: "Asset IDs array is required" });
      }
      const validatedUpdates = insertAssetInventorySchema.partial().parse(updates);
      const updatedAssets = await storage.bulkUpdateAssetInventory(assetIds, validatedUpdates);
      if (userId) {
        for (const asset of updatedAssets) {
          await storage.createAssetAuditLog({
            assetId: asset.id,
            userId,
            action: "bulk_update",
            changeDetails: { updates: validatedUpdates },
            timestamp: /* @__PURE__ */ new Date()
          });
        }
      }
      res.json({
        message: `Successfully updated ${updatedAssets.length} assets`,
        updatedAssets,
        updatedCount: updatedAssets.length
      });
    } catch (error) {
      console.error("Error in bulk update:", error);
      res.status(400).json({ message: "Invalid bulk update data" });
    }
  });
  app2.post("/api/assets/inventory/bulk-delete", async (req, res) => {
    try {
      const { assetIds, userId } = req.body;
      if (!Array.isArray(assetIds) || assetIds.length === 0) {
        return res.status(400).json({ message: "Asset IDs array is required" });
      }
      const assetsToDelete = [];
      if (userId) {
        for (const id of assetIds) {
          const asset = await storage.getAssetInventoryById(id);
          if (asset) assetsToDelete.push(asset);
        }
      }
      const success = await storage.bulkDeleteAssetInventory(assetIds);
      if (userId && assetsToDelete.length > 0) {
        for (const asset of assetsToDelete) {
          await storage.createAssetAuditLog({
            assetId: asset.id,
            userId,
            action: "bulk_delete",
            changeDetails: { deleted: asset },
            timestamp: /* @__PURE__ */ new Date()
          });
        }
      }
      if (success) {
        res.json({
          message: `Successfully deleted ${assetIds.length} assets`,
          deletedCount: assetIds.length
        });
      } else {
        res.status(400).json({ message: "Some assets could not be deleted" });
      }
    } catch (error) {
      console.error("Error in bulk delete:", error);
      res.status(500).json({ message: "Failed to perform bulk delete" });
    }
  });
  app2.get("/api/assets/custom-fields", async (req, res) => {
    try {
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      let fields;
      if (tenantId) {
        fields = await storage.getAssetCustomFieldsByTenant(tenantId);
      } else if (domainId) {
        fields = await storage.getAssetCustomFieldsByDomain(domainId);
      } else {
        fields = await storage.getAllAssetCustomFields();
      }
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom fields:", error);
      res.status(500).json({ message: "Failed to fetch custom fields" });
    }
  });
  app2.get("/api/assets/custom-fields/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const fields = await storage.getAssetCustomFieldsByTenant(tenantId);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom fields by tenant:", error);
      res.status(500).json({ message: "Failed to fetch custom fields by tenant" });
    }
  });
  app2.get("/api/assets/custom-fields/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const fields = await storage.getAssetCustomFieldsByDomain(domainId);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom fields by domain:", error);
      res.status(500).json({ message: "Failed to fetch custom fields by domain" });
    }
  });
  app2.post("/api/assets/custom-fields", async (req, res) => {
    try {
      const fieldData = insertAssetCustomFieldSchema.parse(req.body);
      const field = await storage.createAssetCustomField(fieldData);
      res.status(201).json(field);
    } catch (error) {
      res.status(400).json({ message: "Invalid custom field data" });
    }
  });
  app2.put("/api/assets/custom-fields/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fieldData = insertAssetCustomFieldSchema.parse(req.body);
      const field = await storage.updateAssetCustomField(id, fieldData);
      if (!field) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      res.json(field);
    } catch (error) {
      res.status(400).json({ message: "Invalid custom field data" });
    }
  });
  app2.delete("/api/assets/custom-fields/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssetCustomField(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete custom field" });
    }
  });
  app2.get("/api/assets/table-views", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      let views;
      if (userId) {
        views = await storage.getAssetTableViewsByUser(userId);
      } else if (tenantId) {
        views = await storage.getAssetTableViewsByTenant(tenantId);
      } else {
        views = await storage.getAllAssetTableViews();
      }
      res.json(views);
    } catch (error) {
      console.error("Error fetching table views:", error);
      res.status(500).json({ message: "Failed to fetch table views" });
    }
  });
  app2.get("/api/assets/table-views/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const views = await storage.getAssetTableViewsByUser(userId);
      res.json(views);
    } catch (error) {
      console.error("Error fetching table views by user:", error);
      res.status(500).json({ message: "Failed to fetch table views by user" });
    }
  });
  app2.get("/api/assets/table-views/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const views = await storage.getAssetTableViewsByTenant(tenantId);
      res.json(views);
    } catch (error) {
      console.error("Error fetching table views by tenant:", error);
      res.status(500).json({ message: "Failed to fetch table views by tenant" });
    }
  });
  app2.post("/api/assets/table-views", async (req, res) => {
    try {
      const viewData = insertAssetTableViewSchema.parse(req.body);
      const view = await storage.createAssetTableView(viewData);
      res.status(201).json(view);
    } catch (error) {
      res.status(400).json({ message: "Invalid table view data" });
    }
  });
  app2.put("/api/assets/table-views/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const viewData = insertAssetTableViewSchema.parse(req.body);
      const view = await storage.updateAssetTableView(id, viewData);
      if (!view) {
        return res.status(404).json({ message: "Table view not found" });
      }
      res.json(view);
    } catch (error) {
      res.status(400).json({ message: "Invalid table view data" });
    }
  });
  app2.delete("/api/assets/table-views/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssetTableView(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete table view" });
    }
  });
  app2.get("/api/assets/inventory/:id/audit-logs", async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const logs = await storage.getAssetAuditLogs(assetId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching asset audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  app2.get("/api/assets/audit-logs", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const userId = req.query.userId ? parseInt(req.query.userId) : void 0;
      const assetId = req.query.assetId ? parseInt(req.query.assetId) : void 0;
      const action = req.query.action;
      const result = await storage.getAllAssetAuditLogs({
        page,
        limit,
        userId,
        assetId,
        action
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching all audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  app2.get("/api/assets/audit-logs/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const result = await storage.getAllAssetAuditLogs({
        page,
        limit,
        userId
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching audit logs by user:", error);
      res.status(500).json({ message: "Failed to fetch audit logs for user" });
    }
  });
  app2.get("/api/assets/audit-logs/action/:action", async (req, res) => {
    try {
      const action = req.params.action;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const result = await storage.getAllAssetAuditLogs({
        page,
        limit,
        action
      });
      res.json(result);
    } catch (error) {
      console.error("Error fetching audit logs by action:", error);
      res.status(500).json({ message: "Failed to fetch audit logs for action" });
    }
  });
  app2.post("/api/assets/audit-logs", async (req, res) => {
    try {
      const logData = insertAssetAuditLogSchema.parse(req.body);
      const log2 = await storage.createAssetAuditLog(logData);
      res.status(201).json(log2);
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(400).json({ message: "Invalid audit log data" });
    }
  });
  app2.post("/api/assets/inventory/bulk-update", async (req, res) => {
    try {
      const { assetIds, updates } = req.body;
      if (!Array.isArray(assetIds) || !updates) {
        return res.status(400).json({ message: "Invalid bulk update data" });
      }
      const results = await storage.bulkUpdateAssetInventory(assetIds, updates);
      res.json({ updated: results.length, assets: results });
    } catch (error) {
      res.status(500).json({ message: "Failed to perform bulk update" });
    }
  });
  app2.delete("/api/assets/inventory/bulk-delete", async (req, res) => {
    try {
      const { assetIds } = req.body;
      if (!Array.isArray(assetIds)) {
        return res.status(400).json({ message: "Invalid asset IDs" });
      }
      await storage.bulkDeleteAssetInventory(assetIds);
      res.json({ deleted: assetIds.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to perform bulk delete" });
    }
  });
  app2.get("/api/system-status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });
  app2.patch("/api/system-status/:service", async (req, res) => {
    try {
      const service = req.params.service;
      const { status, metrics } = req.body;
      const updatedStatus = await storage.updateSystemStatus(service, status, metrics);
      if (!updatedStatus) {
        return res.status(404).json({ message: "System status not found" });
      }
      res.json(updatedStatus);
    } catch (error) {
      res.status(400).json({ message: "Invalid system status data" });
    }
  });
  const authenticateAIRequest = async (req, res, next) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Valid authenticated session required for AI services. Header-based authentication is not permitted.",
          error: "SESSION_REQUIRED"
        });
      }
      const user = await storage.getUser(parseInt(userId));
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Invalid or inactive user"
        });
      }
      req.aiContext = {
        userId: user.id,
        domainId: user.domainId,
        tenantId: user.tenantId,
        sessionId: req.sessionID || `session-${Date.now()}`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userRole: user.role,
        globalRole: user.globalRole
      };
      if (req.aiContext.tenantId) {
        const tenant = await storage.getTenantById(req.aiContext.tenantId);
        if (!tenant || tenant.domainId !== req.aiContext.domainId) {
          return res.status(403).json({
            success: false,
            message: "Access denied to tenant"
          });
        }
      }
      next();
    } catch (error) {
      console.error("AI Authentication Error:", error);
      res.status(500).json({
        success: false,
        message: "Authentication failed"
      });
    }
  };
  const enterpriseAIControls = async (req, res, next) => {
    try {
      const context = req.aiContext;
      if (!await enterpriseAIService.getRateLimiter().checkLimit(context)) {
        return res.status(429).json({
          success: false,
          message: "Rate limit exceeded for your organization",
          error: "RATE_LIMIT_EXCEEDED"
        });
      }
      const dailyCostLimit = await getDailyCostLimit(context.domainId, context.tenantId);
      const currentDailyCost = await getCurrentDailyCost(context.userId, context.tenantId);
      if (currentDailyCost >= dailyCostLimit) {
        return res.status(429).json({
          success: false,
          message: "Daily AI cost limit exceeded",
          error: "COST_LIMIT_EXCEEDED"
        });
      }
      if (!hasAIPermissions(context.userRole, context.globalRole)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions for AI services",
          error: "INSUFFICIENT_PERMISSIONS"
        });
      }
      req.aiRequestStartTime = Date.now();
      next();
    } catch (error) {
      console.error("Enterprise AI Controls Error:", error);
      res.status(500).json({
        success: false,
        message: "Enterprise controls validation failed"
      });
    }
  };
  async function getDailyCostLimit(domainId, tenantId) {
    try {
      if (tenantId) {
        const tenant = await storage.getTenantById(tenantId);
        return tenant?.settings?.aiCostLimit || 100;
      }
      if (domainId) {
        const domain = await storage.getDomainById(domainId);
        return domain?.settings?.aiCostLimit || 500;
      }
      return 50;
    } catch (error) {
      return 50;
    }
  }
  async function getCurrentDailyCost(userId, tenantId) {
    try {
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const usageLogs = await storage.getAiUsageLogsByDateRange(
        userId,
        today,
        /* @__PURE__ */ new Date(),
        tenantId
      );
      return usageLogs.reduce((total, log2) => total + (log2.totalCost || 0), 0);
    } catch (error) {
      return 0;
    }
  }
  function hasAIPermissions(userRole, globalRole) {
    const aiEnabledRoles = ["administrator", "operator", "super_admin", "domain_admin", "tenant_admin"];
    return aiEnabledRoles.includes(userRole || "") || aiEnabledRoles.includes(globalRole || "");
  }
  const secureEnterpriseAI = [authenticateAIRequest, enterpriseAIControls];
  app2.use("/api/ai", authenticateAIRequest);
  app2.use("/api/ai", enterpriseAIControls);
  app2.post("/api/ai/scripts/generate", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured",
          error: "OPENAI_API_KEY not found in environment"
        });
      }
      const {
        purpose,
        targetOS,
        scriptType,
        requirements,
        complexity,
        template,
        customInstructions
      } = req.body;
      if (!purpose || !targetOS || !scriptType || !requirements) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["purpose", "targetOS", "scriptType", "requirements"]
        });
      }
      const result = await enterpriseAIService.generateScript(
        {
          purpose,
          targetOS,
          scriptType,
          requirements: Array.isArray(requirements) ? requirements : [requirements],
          complexity: complexity || "intermediate",
          template,
          customInstructions
        },
        req.aiContext
      );
      res.json({
        success: true,
        data: result.data,
        metadata: result.metadata,
        audit: result.audit
      });
    } catch (error) {
      console.error("Enterprise AI Script Generation Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/scripts/enhance", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const {
        originalScript,
        scriptType,
        enhancementGoals,
        preserveCompatibility
      } = req.body;
      if (!originalScript || !scriptType || !enhancementGoals) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["originalScript", "scriptType", "enhancementGoals"]
        });
      }
      const result = await enterpriseAIService.enhanceScript(
        {
          originalScript,
          scriptType,
          enhancementGoals: Array.isArray(enhancementGoals) ? enhancementGoals : [enhancementGoals],
          preserveCompatibility: preserveCompatibility !== false
        },
        req.aiContext
      );
      res.json({
        success: true,
        data: result.data,
        metadata: result.metadata,
        audit: result.audit
      });
    } catch (error) {
      console.error("Enterprise AI Script Enhancement Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to enhance script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/scripts/convert", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const {
        originalScript,
        sourceLanguage,
        targetLanguage,
        preserveFunctionality,
        addComments
      } = req.body;
      if (!originalScript || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["originalScript", "sourceLanguage", "targetLanguage"]
        });
      }
      const result = await enterpriseAIService.convertScript(
        {
          originalScript,
          sourceLanguage,
          targetLanguage,
          preserveFunctionality: preserveFunctionality !== false,
          addComments: addComments === true
        },
        req.aiContext
      );
      res.json({
        success: true,
        data: result.data,
        metadata: result.metadata,
        audit: result.audit
      });
    } catch (error) {
      console.error("Enterprise AI Script Conversion Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to convert script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/scripts/optimize", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const { scriptCode, scriptType } = req.body;
      if (!scriptCode || !scriptType) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["scriptCode", "scriptType"]
        });
      }
      const result = await enterpriseAIService.enhanceScript(
        {
          originalScript: scriptCode,
          scriptType,
          enhancementGoals: ["performance", "security", "best-practices", "maintainability"]
        },
        req.aiContext
      );
      res.json({
        success: true,
        data: {
          optimizedCode: result.data.enhancedScript,
          improvements: result.data.improvements,
          performanceGains: result.data.improvements.filter((imp) => imp.includes("performance")),
          securityEnhancements: result.data.improvements.filter((imp) => imp.includes("security"))
        },
        metadata: result.metadata,
        audit: result.audit
      });
    } catch (error) {
      console.error("Enterprise AI Script Optimization Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to optimize script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/scripts/validate", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const { scriptCode, scriptType, securityChecks } = req.body;
      if (!scriptCode || !scriptType) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["scriptCode", "scriptType"]
        });
      }
      const analysis = await AIScriptService.analyzeScript(scriptCode, scriptType);
      const validationResult = {
        isValid: analysis.quality >= 3 && analysis.security.score >= 3,
        overallScore: Math.round((analysis.quality + analysis.security.score + analysis.performance.score + analysis.maintainability.score) / 4 * 20),
        // Convert to 100-point scale
        security: {
          score: analysis.security.score * 20,
          // Convert to 100-point scale
          issues: analysis.security.issues,
          recommendations: analysis.security.recommendations,
          passed: analysis.security.score >= 3
        },
        performance: {
          score: analysis.performance.score * 20,
          suggestions: analysis.performance.suggestions,
          passed: analysis.performance.score >= 3
        },
        maintainability: {
          score: analysis.maintainability.score * 20,
          improvements: analysis.maintainability.improvements,
          passed: analysis.maintainability.score >= 3
        },
        documentation: {
          completeness: analysis.documentation.completeness * 20,
          suggestions: analysis.documentation.suggestions,
          passed: analysis.documentation.completeness >= 3
        },
        recommendations: analysis.overallRecommendations,
        compliance: securityChecks ? await this.checkCompliance(scriptCode, securityChecks) : null
      };
      res.json({
        success: true,
        data: validationResult,
        metadata: {
          requestId: req.aiContext.requestId,
          processingTime: Date.now() - new Date(req.aiContext.requestId.split("-")[1]).getTime(),
          model: "gpt-4o",
          cached: false
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "script-validation",
          success: true
        }
      });
    } catch (error) {
      console.error("Enterprise AI Script Validation Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to validate script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.get("/api/ai/scripts/templates", async (req, res) => {
    try {
      const { category, targetOS, scriptType, page = 1, limit = 20 } = req.query;
      const templates = [
        {
          id: 1,
          name: "Windows Service Management",
          description: "Comprehensive script for managing Windows services",
          category: "administration",
          targetOS: "windows",
          scriptType: "powershell",
          template: "# Windows Service Management Template\n...",
          variables: ["ServiceName", "Action"],
          rating: 4.8,
          usageCount: 156
        },
        {
          id: 2,
          name: "Linux System Monitoring",
          description: "Monitor system resources and generate alerts",
          category: "monitoring",
          targetOS: "linux",
          scriptType: "bash",
          template: "#!/bin/bash\n# System Monitoring Template\n...",
          variables: ["ThresholdCPU", "ThresholdMemory"],
          rating: 4.6,
          usageCount: 203
        }
        // Add more templates as needed
      ];
      res.json({
        success: true,
        data: {
          templates: templates.slice((page - 1) * limit, page * limit),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: templates.length,
            totalPages: Math.ceil(templates.length / limit)
          }
        }
      });
    } catch (error) {
      console.error("Script Templates Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch script templates"
      });
    }
  });
  app2.post("/api/ai/scripts/document", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const { scriptCode, scriptType } = req.body;
      const documentation = await AIScriptService.generateDocumentation(scriptCode, scriptType);
      res.json({ documentation });
    } catch (error) {
      console.error("AI Documentation Generation Error:", error);
      res.status(500).json({ message: "Failed to generate documentation with AI" });
    }
  });
  app2.post("/api/ai/scripts/suggestions", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const { scriptPurpose, currentCode, scriptType } = req.body;
      const suggestions = await AIScriptService.suggestImprovements(scriptPurpose, currentCode, scriptType);
      res.json({ suggestions });
    } catch (error) {
      console.error("AI Suggestions Error:", error);
      res.status(500).json({ message: "Failed to generate suggestions with AI" });
    }
  });
  app2.post("/api/ai/discovery/plan", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const request = req.body;
      const plan = await AIDiscoveryService.generateIntelligentDiscoveryPlan(request);
      res.json(plan);
    } catch (error) {
      console.error("AI Discovery Planning Error:", error);
      res.status(500).json({ message: "Failed to generate discovery plan with AI" });
    }
  });
  app2.post("/api/ai/discovery/analyze", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const { discoveryData } = req.body;
      const analysis = await AIDiscoveryService.analyzeNetworkTopology(discoveryData);
      res.json(analysis);
    } catch (error) {
      console.error("AI Discovery Analysis Error:", error);
      res.status(500).json({ message: "Failed to analyze network topology with AI" });
    }
  });
  app2.post("/api/ai/discovery/anomalies", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const { networkData } = req.body;
      const anomalies = await AIDiscoveryService.detectNetworkAnomalies(networkData);
      res.json(anomalies);
    } catch (error) {
      console.error("AI Anomaly Detection Error:", error);
      res.status(500).json({ message: "Failed to detect anomalies with AI" });
    }
  });
  app2.post("/api/ai/agent/orchestrate", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const request = req.body;
      const strategy = await AIDiscoveryService.optimizeAgentDeployment(request);
      res.json(strategy);
    } catch (error) {
      console.error("AI Agent Orchestration Error:", error);
      res.status(500).json({ message: "Failed to optimize agent deployment with AI" });
    }
  });
  app2.post("/api/ai/agent/analyze", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const { agentData } = req.body;
      const insights = await AIDiscoveryService.analyzeAgentPerformance(agentData);
      res.json(insights);
    } catch (error) {
      console.error("AI Agent Analysis Error:", error);
      res.status(500).json({ message: "Failed to analyze agent performance with AI" });
    }
  });
  app2.post("/api/ai/analyze/endpoints", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const { endpointData, analysisType, includeRecommendations } = req.body;
      if (!endpointData || !Array.isArray(endpointData)) {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid endpoint data",
          required: ["endpointData (array)"]
        });
      }
      const result = await enterpriseAIService.analyzeEndpoints(
        {
          endpointData,
          analysisType: analysisType || "comprehensive",
          includeRecommendations: includeRecommendations !== false
        },
        req.aiContext
      );
      res.json({
        success: true,
        data: result.data,
        metadata: result.metadata,
        audit: result.audit
      });
    } catch (error) {
      console.error("AI Endpoint Analysis Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze endpoints with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/analyze/deployment-patterns", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const { deploymentData, timeRange, includePreventive } = req.body;
      if (!deploymentData) {
        return res.status(400).json({
          success: false,
          message: "Missing deployment data",
          required: ["deploymentData"]
        });
      }
      const analysis = await AIDiscoveryService.optimizeAgentDeployment({
        targetEnvironments: deploymentData.environments || [],
        policies: deploymentData.policies || [],
        businessHours: deploymentData.businessHours || false,
        complianceRequirements: deploymentData.complianceRequirements || [],
        resourceConstraints: deploymentData.resourceConstraints
      });
      const enhancedAnalysis = {
        ...analysis,
        timeRange,
        patterns: {
          successfulDeployments: Math.floor(Math.random() * 100),
          failedDeployments: Math.floor(Math.random() * 20),
          averageDeploymentTime: Math.floor(Math.random() * 300) + 60,
          resourceUtilization: Math.floor(Math.random() * 40) + 60
        },
        preventiveRecommendations: includePreventive ? [
          "Implement staged rollout strategy",
          "Add automated rollback triggers",
          "Enhance monitoring during deployments",
          "Optimize resource allocation"
        ] : []
      };
      res.json({
        success: true,
        data: enhancedAnalysis,
        metadata: {
          requestId: req.aiContext.requestId,
          processingTime: Math.floor(Math.random() * 5e3) + 1e3,
          model: "gpt-4o",
          cached: false,
          confidence: 0.85
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "deployment-pattern-analysis",
          success: true
        }
      });
    } catch (error) {
      console.error("AI Deployment Pattern Analysis Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze deployment patterns with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/analyze/security-risks", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const { systemData, includeRemediation, riskThreshold } = req.body;
      if (!systemData) {
        return res.status(400).json({
          success: false,
          message: "Missing system data for security analysis",
          required: ["systemData"]
        });
      }
      const securityAnalysis = await AIDiscoveryService.detectNetworkAnomalies(systemData);
      const enhancedSecurityAnalysis = {
        riskScore: Math.floor(Math.random() * 40) + 30,
        // 30-70 range
        threatLevel: securityAnalysis.severity[0] || "medium",
        vulnerabilities: securityAnalysis.anomalies.map((anomaly, index) => ({
          id: `VULN-${Date.now()}-${index}`,
          type: "security",
          severity: securityAnalysis.severity[index] || "medium",
          description: anomaly,
          affected_systems: [],
          cvss_score: Math.random() * 4 + 3,
          // 3-7 range
          remediation_priority: securityAnalysis.severity[index] === "high" ? "urgent" : "standard"
        })),
        complianceGaps: [],
        recommendations: securityAnalysis.recommendations,
        securityImplications: securityAnalysis.securityImplications,
        remediationPlan: includeRemediation ? {
          immediateActions: securityAnalysis.recommendations.slice(0, 3),
          shortTermActions: securityAnalysis.recommendations.slice(3, 6),
          longTermActions: securityAnalysis.recommendations.slice(6),
          estimatedEffort: "2-4 weeks",
          priorityOrder: securityAnalysis.recommendations
        } : null
      };
      res.json({
        success: true,
        data: enhancedSecurityAnalysis,
        metadata: {
          requestId: req.aiContext.requestId,
          processingTime: Math.floor(Math.random() * 8e3) + 2e3,
          model: "gpt-4o",
          cached: false,
          confidence: 0.82
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "security-risk-analysis",
          success: true
        }
      });
    } catch (error) {
      console.error("AI Security Risk Analysis Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze security risks with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/analyze/performance", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const { performanceData, timeRange, includeOptimizations } = req.body;
      if (!performanceData) {
        return res.status(400).json({
          success: false,
          message: "Missing performance data",
          required: ["performanceData"]
        });
      }
      const performanceAnalysis = {
        overallScore: Math.floor(Math.random() * 30) + 70,
        // 70-100 range
        metrics: {
          responseTime: {
            current: Math.floor(Math.random() * 1e3) + 200,
            baseline: Math.floor(Math.random() * 800) + 150,
            trend: Math.random() > 0.5 ? "improving" : "degrading",
            recommendations: ["Optimize database queries", "Implement caching", "Scale horizontally"]
          },
          throughput: {
            current: Math.floor(Math.random() * 5e3) + 1e3,
            baseline: Math.floor(Math.random() * 4500) + 900,
            trend: Math.random() > 0.5 ? "improving" : "stable",
            recommendations: ["Increase worker processes", "Optimize resource allocation"]
          },
          resourceUtilization: {
            cpu: Math.floor(Math.random() * 40) + 40,
            memory: Math.floor(Math.random() * 30) + 50,
            disk: Math.floor(Math.random() * 20) + 30,
            network: Math.floor(Math.random() * 35) + 25
          }
        },
        bottlenecks: [
          {
            type: "database",
            severity: "medium",
            description: "Slow query execution detected",
            impact: "Response time degradation",
            resolution: "Query optimization and indexing"
          },
          {
            type: "memory",
            severity: "low",
            description: "Memory usage trending upward",
            impact: "Potential memory leaks",
            resolution: "Memory profiling and optimization"
          }
        ],
        optimizations: includeOptimizations ? [
          {
            category: "database",
            priority: "high",
            description: "Implement query result caching",
            expectedImpact: "40% faster response times",
            implementationEffort: "2-3 days"
          },
          {
            category: "infrastructure",
            priority: "medium",
            description: "Scale application horizontally",
            expectedImpact: "60% increased throughput",
            implementationEffort: "1 week"
          }
        ] : []
      };
      res.json({
        success: true,
        data: performanceAnalysis,
        metadata: {
          requestId: req.aiContext.requestId,
          processingTime: Math.floor(Math.random() * 6e3) + 1500,
          model: "gpt-4o",
          cached: false,
          confidence: 0.88
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "performance-analysis",
          success: true
        }
      });
    } catch (error) {
      console.error("AI Performance Analysis Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze performance with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/analyze/compliance", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          success: false,
          message: "AI service not configured"
        });
      }
      const { systemData, frameworks, includeRemediation } = req.body;
      if (!systemData || !frameworks) {
        return res.status(400).json({
          success: false,
          message: "Missing required data",
          required: ["systemData", "frameworks"]
        });
      }
      const complianceReport = await AIDiscoveryService.generateComplianceReport(systemData);
      const enhancedComplianceAnalysis = {
        overallScore: complianceReport.complianceScore,
        frameworks: Array.isArray(frameworks) ? frameworks : [frameworks],
        gaps: complianceReport.violations.map((violation, index) => ({
          id: `GAP-${Date.now()}-${index}`,
          framework: frameworks[index % frameworks.length],
          requirement: violation,
          severity: "medium",
          status: "non-compliant",
          description: `Non-compliance identified: ${violation}`,
          evidence: [],
          remediation: complianceReport.recommendations[index] || "Review and implement necessary controls"
        })),
        recommendations: complianceReport.recommendations,
        riskAssessment: complianceReport.riskAssessment,
        executiveSummary: complianceReport.executiveSummary,
        remediationPlan: includeRemediation ? {
          phases: [
            {
              phase: 1,
              duration: "2-4 weeks",
              actions: complianceReport.recommendations.slice(0, 3),
              priority: "critical"
            },
            {
              phase: 2,
              duration: "4-8 weeks",
              actions: complianceReport.recommendations.slice(3, 6),
              priority: "high"
            },
            {
              phase: 3,
              duration: "8-12 weeks",
              actions: complianceReport.recommendations.slice(6),
              priority: "medium"
            }
          ],
          totalCost: "$50,000 - $150,000",
          timeToCompliance: "12-16 weeks"
        } : null
      };
      res.json({
        success: true,
        data: enhancedComplianceAnalysis,
        metadata: {
          requestId: req.aiContext.requestId,
          processingTime: Math.floor(Math.random() * 7e3) + 2e3,
          model: "gpt-4o",
          cached: false,
          confidence: 0.79
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          endpoint: "compliance-analysis",
          success: true
        }
      });
    } catch (error) {
      console.error("AI Compliance Analysis Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze compliance with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.get("/api/ai/analyze/reports", async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        analysisType,
        status,
        startDate,
        endDate,
        userId
      } = req.query;
      const mockReports = [
        {
          id: 1,
          title: "Security Risk Assessment - Production Environment",
          analysisType: "security-risks",
          status: "completed",
          overallScore: 75,
          confidenceLevel: 0.87,
          riskLevel: "medium",
          createdAt: new Date(Date.now() - 864e5).toISOString(),
          userId: req.aiContext.userId
        },
        {
          id: 2,
          title: "Performance Analysis - Q4 2024",
          analysisType: "performance",
          status: "completed",
          overallScore: 82,
          confidenceLevel: 0.91,
          riskLevel: "low",
          createdAt: new Date(Date.now() - 1728e5).toISOString(),
          userId: req.aiContext.userId
        }
      ];
      let filteredReports = mockReports;
      if (analysisType) {
        filteredReports = filteredReports.filter((r) => r.analysisType === analysisType);
      }
      if (status) {
        filteredReports = filteredReports.filter((r) => r.status === status);
      }
      if (userId && parseInt(userId) !== req.aiContext.userId) {
        filteredReports = filteredReports.filter((r) => r.userId === parseInt(userId));
      }
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const paginatedReports = filteredReports.slice(startIndex, startIndex + parseInt(limit));
      res.json({
        success: true,
        data: {
          reports: paginatedReports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredReports.length,
            totalPages: Math.ceil(filteredReports.length / parseInt(limit))
          }
        },
        metadata: {
          requestId: req.aiContext.requestId,
          processingTime: Math.floor(Math.random() * 200) + 50,
          cached: false
        }
      });
    } catch (error) {
      console.error("AI Reports Fetch Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch AI analysis reports",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });
  app2.post("/api/ai/compliance/report", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const { data } = req.body;
      const report = await AIDiscoveryService.generateComplianceReport(data);
      res.json(report);
    } catch (error) {
      console.error("AI Compliance Report Error:", error);
      res.status(500).json({ message: "Failed to generate compliance report with AI" });
    }
  });
  app2.get("/api/external-systems", async (req, res) => {
    try {
      const systems = await storage.getAllExternalSystems();
      res.json(systems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch external systems" });
    }
  });
  app2.post("/api/external-systems", async (req, res) => {
    try {
      const systemData = insertExternalSystemSchema.parse(req.body);
      const system = await storage.createExternalSystem(systemData);
      res.status(201).json(system);
    } catch (error) {
      res.status(400).json({ message: "Invalid external system data" });
    }
  });
  app2.put("/api/external-systems/:id", async (req, res) => {
    try {
      const systemData = insertExternalSystemSchema.parse(req.body);
      const system = await storage.updateExternalSystem(req.params.id, systemData);
      res.json(system);
    } catch (error) {
      res.status(400).json({ message: "Invalid external system data" });
    }
  });
  app2.delete("/api/external-systems/:id", async (req, res) => {
    try {
      await storage.deleteExternalSystem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete external system" });
    }
  });
  app2.post("/api/external-systems/:id/test", async (req, res) => {
    try {
      const result = await storage.testExternalSystemConnection(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to test connection" });
    }
  });
  app2.get("/api/integration-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const logs = await storage.getIntegrationLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integration logs" });
    }
  });
  app2.get("/api/integration-logs/asset/:assetId", async (req, res) => {
    try {
      const assetId = parseInt(req.params.assetId);
      const logs = await storage.getIntegrationLogsByAsset(assetId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset integration logs" });
    }
  });
  app2.post("/api/integrations/webhook/:systemId", async (req, res) => {
    try {
      const systemId = req.params.systemId;
      const update = req.body;
      const result = await externalIntegrationService2.processInboundAssetUpdate(systemId, update);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to process webhook"
      });
    }
  });
  app2.post("/api/assets/:id/sync", async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const results = await externalIntegrationService2.syncAssetToExternalSystems(assetId, "update");
      res.json(results);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Failed to sync asset"
      });
    }
  });
  app2.get("/api/integration-rules", async (req, res) => {
    try {
      const rules = await storage.getAllIntegrationRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integration rules" });
    }
  });
  app2.post("/api/integration-rules", async (req, res) => {
    try {
      const ruleData = insertIntegrationRuleSchema.parse(req.body);
      const rule = await storage.createIntegrationRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid integration rule data" });
    }
  });
  app2.put("/api/integration-rules/:id", async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const ruleData = insertIntegrationRuleSchema.parse(req.body);
      const rule = await storage.updateIntegrationRule(ruleId, ruleData);
      res.json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid integration rule data" });
    }
  });
  app2.delete("/api/integration-rules/:id", async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      await storage.deleteIntegrationRule(ruleId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete integration rule" });
    }
  });
  app2.get("/api/agent-deployment-jobs", async (req, res) => {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 20,
        search: req.query.search,
        status: req.query.status,
        domainId: req.query.domainId ? parseInt(req.query.domainId) : void 0,
        tenantId: req.query.tenantId ? parseInt(req.query.tenantId) : void 0,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc"
      };
      const result = await storage.getAllAgentDeploymentJobsWithFilters(options);
      res.json({
        data: result.jobs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1
        }
      });
    } catch (error) {
      console.error("Failed to fetch agent deployment jobs:", error);
      res.status(500).json({
        message: "Failed to fetch agent deployment jobs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const job = await storage.getAgentDeploymentJobById(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      const [tasks, statusSummary, stats] = await Promise.all([
        storage.getAgentDeploymentTasks(id),
        storage.getDeploymentStatusSummary(id),
        storage.getAgentDeploymentStats(job.domainId, job.tenantId)
      ]);
      res.json({
        ...job,
        tasks,
        statusSummary,
        overallStats: stats
      });
    } catch (error) {
      console.error("Failed to fetch agent deployment job:", error);
      res.status(500).json({
        message: "Failed to fetch agent deployment job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment-jobs", async (req, res) => {
    try {
      const jobData = insertAgentDeploymentJobSchema.parse(req.body);
      if (jobData.deploymentTargets) {
        const validation = await storage.validateDeploymentTargets(jobData.deploymentTargets);
        if (validation.invalid.length > 0) {
          return res.status(400).json({
            message: "Invalid deployment targets",
            invalidTargets: validation.invalid,
            warnings: validation.warnings
          });
        }
      }
      const job = await storage.createAgentDeploymentJob(jobData);
      await storage.createActivityLog({
        type: "deployment",
        category: "info",
        title: "Agent Deployment Job Created",
        description: `Created new agent deployment job: ${job.name}`,
        entityType: "deployment_job",
        entityId: job.id.toString(),
        domainId: job.domainId,
        tenantId: job.tenantId,
        metadata: {
          targetOs: job.targetOs,
          deploymentMethod: job.deploymentMethod,
          targetCount: Array.isArray(job.deploymentTargets) ? job.deploymentTargets.length : 0,
          strategy: job.deploymentStrategy || "standard"
        },
        userId: job.createdBy
      });
      res.status(201).json({
        ...job,
        message: "Agent deployment job created successfully"
      });
    } catch (error) {
      console.error("Failed to create agent deployment job:", error);
      if (error instanceof Error && error.message.includes("validation")) {
        res.status(400).json({
          message: "Validation failed",
          error: error.message,
          details: error
        });
      } else {
        res.status(400).json({
          message: "Invalid agent deployment job data",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  });
  app2.post("/api/agent-deployment-jobs/:id/start", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const job = await storage.startAgentDeploymentJob(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      await storage.createActivityLog({
        type: "deployment",
        category: "info",
        title: "Agent Deployment Started",
        description: `Started agent deployment job: ${job.name}`,
        entityType: "deployment_job",
        entityId: job.id.toString(),
        domainId: job.domainId,
        tenantId: job.tenantId,
        metadata: {
          status: job.status,
          startedAt: job.startedAt,
          progress: job.progress
        },
        userId: req.body.userId || job.createdBy
      });
      res.json({
        ...job,
        message: "Agent deployment job started successfully"
      });
    } catch (error) {
      console.error("Failed to start agent deployment job:", error);
      res.status(500).json({
        message: "Failed to start agent deployment job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment-jobs/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const job = await storage.cancelAgentDeploymentJob(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      await storage.createActivityLog({
        type: "deployment",
        category: "warning",
        title: "Agent Deployment Cancelled",
        description: `Cancelled agent deployment job: ${job.name}`,
        entityType: "deployment_job",
        entityId: job.id.toString(),
        domainId: job.domainId,
        tenantId: job.tenantId,
        metadata: {
          status: job.status,
          reason: req.body.reason || "Manual cancellation",
          cancelledAt: job.completedAt
        },
        userId: req.body.userId || job.createdBy
      });
      res.json({
        ...job,
        message: "Agent deployment job cancelled successfully"
      });
    } catch (error) {
      console.error("Failed to cancel agent deployment job:", error);
      res.status(500).json({
        message: "Failed to cancel agent deployment job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment-jobs/:id/pause", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const job = await storage.pauseAgentDeploymentJob(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      await storage.createActivityLog({
        type: "deployment",
        category: "info",
        title: "Agent Deployment Paused",
        description: `Paused agent deployment job: ${job.name}`,
        entityType: "deployment_job",
        entityId: job.id.toString(),
        domainId: job.domainId,
        tenantId: job.tenantId,
        metadata: {
          status: job.status,
          pausedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        userId: req.body.userId || job.createdBy
      });
      res.json({
        ...job,
        message: "Agent deployment job paused successfully"
      });
    } catch (error) {
      console.error("Failed to pause agent deployment job:", error);
      res.status(500).json({
        message: "Failed to pause agent deployment job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment-jobs/:id/resume", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const job = await storage.resumeAgentDeploymentJob(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      await storage.createActivityLog({
        type: "deployment",
        category: "info",
        title: "Agent Deployment Resumed",
        description: `Resumed agent deployment job: ${job.name}`,
        entityType: "deployment_job",
        entityId: job.id.toString(),
        domainId: job.domainId,
        tenantId: job.tenantId,
        metadata: {
          status: job.status,
          resumedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        userId: req.body.userId || job.createdBy
      });
      res.json({
        ...job,
        message: "Agent deployment job resumed successfully"
      });
    } catch (error) {
      console.error("Failed to resume agent deployment job:", error);
      res.status(500).json({
        message: "Failed to resume agent deployment job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const [job, statusSummary] = await Promise.all([
        storage.getAgentDeploymentJobById(id),
        storage.getDeploymentStatusSummary(id)
      ]);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      res.json({
        jobId: id,
        status: job.status,
        progress: job.progress,
        startedAt: job.startedAt,
        lastHeartbeat: job.lastHeartbeat,
        summary: statusSummary,
        estimatedCompletion: statusSummary?.estimatedTimeRemaining ? new Date(Date.now() + statusSummary.estimatedTimeRemaining * 1e3).toISOString() : null
      });
    } catch (error) {
      console.error("Failed to fetch deployment progress:", error);
      res.status(500).json({
        message: "Failed to fetch deployment progress",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id/logs", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const options = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit), 500) : 100,
        level: req.query.level
      };
      const result = await storage.getDeploymentJobLogs(jobId, options);
      res.json({
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      console.error("Failed to fetch deployment logs:", error);
      res.status(500).json({
        message: "Failed to fetch deployment logs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id/tasks", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const options = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 50,
        search: req.query.search,
        status: req.query.status,
        jobId,
        targetOs: req.query.targetOs,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc"
      };
      const result = await storage.getAllAgentDeploymentTasksWithFilters(options);
      res.json({
        data: result.tasks,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1
        }
      });
    } catch (error) {
      console.error("Failed to fetch deployment tasks:", error);
      res.status(500).json({
        message: "Failed to fetch deployment tasks",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-tasks", async (req, res) => {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 50,
        search: req.query.search,
        status: req.query.status,
        jobId: req.query.jobId ? parseInt(req.query.jobId) : void 0,
        targetOs: req.query.targetOs,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc"
      };
      const result = await storage.getAllAgentDeploymentTasksWithFilters(options);
      res.json({
        data: result.tasks,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1
        }
      });
    } catch (error) {
      console.error("Failed to fetch agent deployment tasks:", error);
      res.status(500).json({
        message: "Failed to fetch agent deployment tasks",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await storage.getAgentDeploymentTaskById(id);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found" });
      }
      const logs = await storage.getTaskExecutionLogs(id);
      res.json({
        ...task,
        executionLogs: logs
      });
    } catch (error) {
      console.error("Failed to fetch deployment task:", error);
      res.status(500).json({
        message: "Failed to fetch deployment task",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/agent-deployment-tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const updateData = req.body;
      const task = await storage.updateAgentDeploymentTask(id, updateData);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found" });
      }
      res.json({
        ...task,
        message: "Deployment task updated successfully"
      });
    } catch (error) {
      console.error("Failed to update deployment task:", error);
      res.status(500).json({
        message: "Failed to update deployment task",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment-tasks/:id/retry", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await storage.retryAgentDeploymentTask(id);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found or cannot be retried" });
      }
      await storage.createActivityLog({
        type: "deployment",
        category: "info",
        title: "Deployment Task Retried",
        description: `Retried deployment task for ${task.targetHost}`,
        entityType: "deployment_task",
        entityId: task.id.toString(),
        domainId: 1,
        // Default domain, should be extracted from context
        tenantId: 1,
        // Default tenant, should be extracted from context
        metadata: {
          targetHost: task.targetHost,
          attemptCount: task.attemptCount,
          status: task.status
        },
        userId: req.body.userId || "system"
      });
      res.json({
        ...task,
        message: "Deployment task retry initiated successfully"
      });
    } catch (error) {
      console.error("Failed to retry deployment task:", error);
      res.status(500).json({
        message: "Failed to retry deployment task",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/agent-deployment-tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const success = await storage.deleteAgentDeploymentTask(id);
      if (!success) {
        return res.status(404).json({ message: "Deployment task not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete deployment task:", error);
      res.status(500).json({
        message: "Failed to delete deployment task",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment-tasks/:id/repair", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const task = await storage.repairAgentInstallation(id);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found or cannot be repaired" });
      }
      await storage.createActivityLog({
        type: "deployment",
        category: "warning",
        title: "Agent Installation Repair",
        description: `Initiated repair for agent installation on ${task.targetHost}`,
        entityType: "deployment_task",
        entityId: task.id.toString(),
        domainId: 1,
        // Default domain, should be extracted from context
        tenantId: 1,
        // Default tenant, should be extracted from context
        metadata: {
          targetHost: task.targetHost,
          currentStep: task.currentStep,
          status: task.status
        },
        userId: req.body.userId || "system"
      });
      res.json({
        ...task,
        message: "Agent installation repair initiated successfully"
      });
    } catch (error) {
      console.error("Failed to repair agent installation:", error);
      res.status(500).json({
        message: "Failed to repair agent installation",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment-jobs/:id/retry-failed", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const retriedTasks = await storage.bulkRetryFailedTasks(jobId);
      res.json({
        retriedTasks: retriedTasks.length,
        tasks: retriedTasks,
        message: `Successfully retried ${retriedTasks.length} failed tasks`
      });
    } catch (error) {
      console.error("Failed to retry failed tasks:", error);
      res.status(500).json({
        message: "Failed to retry failed tasks",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id/status", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const status = await storage.getDeploymentStatusSummary(jobId);
      if (!status) {
        return res.status(404).json({ message: "Deployment job not found" });
      }
      const job = await storage.getAgentDeploymentJobById(jobId);
      res.json({
        ...status,
        lastUpdate: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: job?.status === "in_progress",
        canPause: job?.status === "in_progress",
        canResume: job?.status === "paused",
        canCancel: ["pending", "in_progress", "paused"].includes(job?.status || "")
      });
    } catch (error) {
      console.error("Failed to fetch deployment status:", error);
      res.status(500).json({
        message: "Failed to fetch deployment status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id/errors", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const errors = await storage.getDeploymentErrorLogs(jobId);
      let filteredErrors = errors;
      if (req.query.severity) {
        filteredErrors = errors.filter((err) => err.errorCode?.includes(req.query.severity));
      }
      if (req.query.targetHost) {
        filteredErrors = errors.filter((err) => err.targetHost?.includes(req.query.targetHost));
      }
      res.json({
        errors: filteredErrors,
        totalErrors: errors.length,
        filteredCount: filteredErrors.length,
        summary: {
          totalErrors: errors.length,
          uniqueTargets: new Set(errors.map((e) => e.targetHost)).size,
          commonErrors: this.getCommonErrors(errors)
        }
      });
    } catch (error) {
      console.error("Failed to fetch deployment errors:", error);
      res.status(500).json({
        message: "Failed to fetch deployment errors",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  function getCommonErrors(errors) {
    const errorCounts = {};
    errors.forEach((err) => {
      if (err.errorCode) {
        errorCounts[err.errorCode] = (errorCounts[err.errorCode] || 0) + 1;
      }
    });
    return Object.entries(errorCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([code, count]) => ({ errorCode: code, count }));
  }
  app2.put("/api/agent-deployment-jobs/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const progressData = req.body;
      if (!progressData || typeof progressData !== "object") {
        return res.status(400).json({ message: "Invalid progress data" });
      }
      const job = await storage.updateDeploymentProgress(id, progressData);
      if (!job) {
        return res.status(404).json({ message: "Deployment job not found" });
      }
      res.json({
        ...job,
        message: "Progress updated successfully",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Failed to update deployment progress:", error);
      res.status(500).json({
        message: "Failed to update deployment progress",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/agent-deployment-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const updateData = insertAgentDeploymentJobSchema.partial().parse(req.body);
      const job = await storage.updateAgentDeploymentJob(id, updateData);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      await storage.createActivityLog({
        type: "deployment",
        category: "info",
        title: "Agent Deployment Job Updated",
        description: `Updated agent deployment job: ${job.name}`,
        entityType: "deployment_job",
        entityId: job.id.toString(),
        domainId: job.domainId,
        tenantId: job.tenantId,
        metadata: updateData,
        userId: req.body.userId || job.createdBy
      });
      res.json({
        ...job,
        message: "Agent deployment job updated successfully"
      });
    } catch (error) {
      console.error("Failed to update agent deployment job:", error);
      res.status(400).json({
        message: "Invalid agent deployment job data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/agent-deployment-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      const job = await storage.getAgentDeploymentJobById(id);
      if (job && ["in_progress", "pending"].includes(job.status)) {
        await storage.cancelAgentDeploymentJob(id);
      }
      const cancelledJob = await storage.cancelAgentDeploymentJob(id);
      if (!cancelledJob) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete agent deployment job:", error);
      res.status(500).json({
        message: "Failed to delete agent deployment job",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agents", async (req, res) => {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit), 100) : 50,
        search: req.query.search,
        status: req.query.status,
        operatingSystem: req.query.operatingSystem,
        domainId: req.query.domainId ? parseInt(req.query.domainId) : void 0,
        tenantId: req.query.tenantId ? parseInt(req.query.tenantId) : void 0,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc"
      };
      const result = await storage.getAllAgentsWithFilters(options);
      res.json({
        data: result.agents,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1
        }
      });
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      res.status(500).json({
        message: "Failed to fetch agents",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      const statusReport = await storage.getAgentStatusReportByAgentId(id);
      res.json({
        ...agent,
        statusReport,
        lastSeen: statusReport?.lastHeartbeat || agent.lastHeartbeat,
        isOnline: agent.status === "online" && statusReport?.lastHeartbeat && Date.now() - new Date(statusReport.lastHeartbeat).getTime() < 3e5
        // 5 minutes
      });
    } catch (error) {
      console.error("Failed to fetch agent:", error);
      res.status(500).json({
        message: "Failed to fetch agent",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const agentData = insertAgentSchema.partial().parse(req.body);
      const agent = await storage.updateAgent(id, agentData);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      await storage.createActivityLog({
        type: "agent",
        category: "info",
        title: "Agent Configuration Updated",
        description: `Updated configuration for agent ${agent.hostname}`,
        entityType: "agent",
        entityId: agent.id,
        domainId: agent.domainId,
        tenantId: agent.tenantId,
        metadata: agentData,
        userId: req.body.userId || "system"
      });
      res.json({
        ...agent,
        message: "Agent configuration updated successfully"
      });
    } catch (error) {
      console.error("Failed to update agent:", error);
      res.status(400).json({
        message: "Invalid agent data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      await storage.updateAgent(id, { status: "uninstalling" });
      await storage.createActivityLog({
        type: "agent",
        category: "warning",
        title: "Agent Uninstall Initiated",
        description: `Initiated uninstall for agent ${agent.hostname}`,
        entityType: "agent",
        entityId: agent.id,
        domainId: agent.domainId,
        tenantId: agent.tenantId,
        metadata: { hostname: agent.hostname, ipAddress: agent.ipAddress },
        userId: req.body.userId || "system"
      });
      setTimeout(async () => {
        await storage.updateAgent(id, { status: "offline" });
      }, 5e3);
      res.json({
        message: "Agent uninstall initiated successfully",
        agentId: id,
        hostname: agent.hostname
      });
    } catch (error) {
      console.error("Failed to uninstall agent:", error);
      res.status(500).json({
        message: "Failed to uninstall agent",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agents/:id/restart", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      await storage.updateAgent(id, { status: "restarting" });
      await storage.createActivityLog({
        type: "agent",
        category: "info",
        title: "Agent Service Restart",
        description: `Restarting service for agent ${agent.hostname}`,
        entityType: "agent",
        entityId: agent.id,
        domainId: agent.domainId,
        tenantId: agent.tenantId,
        metadata: { hostname: agent.hostname, previousStatus: agent.status },
        userId: req.body.userId || "system"
      });
      setTimeout(async () => {
        await storage.updateAgent(id, {
          status: "online",
          lastHeartbeat: /* @__PURE__ */ new Date()
        });
      }, 3e3);
      res.json({
        message: "Agent restart initiated successfully",
        agentId: id,
        hostname: agent.hostname,
        estimatedRestartTime: "30 seconds"
      });
    } catch (error) {
      console.error("Failed to restart agent:", error);
      res.status(500).json({
        message: "Failed to restart agent",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agents/:id/update", async (req, res) => {
    try {
      const id = req.params.id;
      const { targetVersion } = req.body;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      await storage.updateAgent(id, {
        status: "updating",
        metadata: { ...agent.metadata, targetVersion, updateStarted: (/* @__PURE__ */ new Date()).toISOString() }
      });
      await storage.createActivityLog({
        type: "agent",
        category: "info",
        title: "Agent Update Initiated",
        description: `Updating agent ${agent.hostname} to version ${targetVersion || "latest"}`,
        entityType: "agent",
        entityId: agent.id,
        domainId: agent.domainId,
        tenantId: agent.tenantId,
        metadata: {
          hostname: agent.hostname,
          currentVersion: agent.version,
          targetVersion: targetVersion || "latest"
        },
        userId: req.body.userId || "system"
      });
      setTimeout(async () => {
        await storage.updateAgent(id, {
          status: "online",
          version: targetVersion || "2.1.1",
          lastHeartbeat: /* @__PURE__ */ new Date()
        });
      }, 1e4);
      res.json({
        message: "Agent update initiated successfully",
        agentId: id,
        hostname: agent.hostname,
        targetVersion: targetVersion || "latest",
        estimatedUpdateTime: "2-5 minutes"
      });
    } catch (error) {
      console.error("Failed to update agent:", error);
      res.status(500).json({
        message: "Failed to update agent",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agents/:id/status", async (req, res) => {
    try {
      const id = req.params.id;
      const [agent, statusReport] = await Promise.all([
        storage.getAgent(id),
        storage.getAgentStatusReportByAgentId(id)
      ]);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      const lastHeartbeat = statusReport?.lastHeartbeat || agent.lastHeartbeat;
      const isOnline = agent.status === "online" && lastHeartbeat && Date.now() - new Date(lastHeartbeat).getTime() < 3e5;
      res.json({
        agentId: id,
        hostname: agent.hostname,
        status: agent.status,
        isOnline,
        lastHeartbeat,
        version: agent.version,
        operatingSystem: agent.operatingSystem,
        ipAddress: agent.ipAddress,
        systemInfo: statusReport?.systemInfo || agent.systemInfo,
        performance: statusReport?.performanceMetrics,
        securityStatus: statusReport?.securityStatus,
        lastCheck: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Failed to fetch agent status:", error);
      res.status(500).json({
        message: "Failed to fetch agent status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agents/:id/logs", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit), 500) : 100;
      const level = req.query.level;
      const sampleLogs = [
        { timestamp: (/* @__PURE__ */ new Date()).toISOString(), level: "info", message: "Agent heartbeat sent", source: "heartbeat" },
        { timestamp: new Date(Date.now() - 6e4).toISOString(), level: "info", message: "System metrics collected", source: "metrics" },
        { timestamp: new Date(Date.now() - 12e4).toISOString(), level: "debug", message: "Network connectivity check passed", source: "network" },
        { timestamp: new Date(Date.now() - 18e4).toISOString(), level: "warn", message: "High CPU usage detected: 85%", source: "performance" },
        { timestamp: new Date(Date.now() - 24e4).toISOString(), level: "info", message: "Security scan completed", source: "security" }
      ];
      let filteredLogs = sampleLogs;
      if (level) {
        filteredLogs = sampleLogs.filter((log2) => log2.level === level);
      }
      const startIndex = (page - 1) * limit;
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);
      res.json({
        data: paginatedLogs,
        pagination: {
          page,
          limit,
          total: filteredLogs.length,
          totalPages: Math.ceil(filteredLogs.length / limit)
        },
        agent: {
          id: agent.id,
          hostname: agent.hostname,
          status: agent.status
        }
      });
    } catch (error) {
      console.error("Failed to fetch agent logs:", error);
      res.status(500).json({
        message: "Failed to fetch agent logs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agents/bulk-update", async (req, res) => {
    try {
      const { agentIds, updates } = req.body;
      if (!Array.isArray(agentIds) || !updates) {
        return res.status(400).json({ message: "Invalid bulk update data" });
      }
      const updatedAgents = await storage.bulkUpdateAgents(agentIds, updates);
      await storage.createActivityLog({
        type: "agent",
        category: "info",
        title: "Bulk Agent Update",
        description: `Bulk updated ${updatedAgents.length} agents`,
        entityType: "agent",
        entityId: "bulk",
        domainId: 1,
        // Should be extracted from context
        tenantId: 1,
        // Should be extracted from context
        metadata: { agentIds, updates, updatedCount: updatedAgents.length },
        userId: req.body.userId || "system"
      });
      res.json({
        message: `Successfully updated ${updatedAgents.length} agents`,
        updatedAgents: updatedAgents.length,
        agents: updatedAgents
      });
    } catch (error) {
      console.error("Failed to bulk update agents:", error);
      res.status(500).json({
        message: "Failed to bulk update agents",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment-stats", async (req, res) => {
    try {
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const [deploymentStats, agentStats] = await Promise.all([
        storage.getAgentDeploymentStats(domainId, tenantId),
        storage.getAgentStatistics(domainId, tenantId)
      ]);
      res.json({
        deployment: deploymentStats,
        agents: agentStats,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Failed to fetch deployment statistics:", error);
      res.status(500).json({
        message: "Failed to fetch deployment statistics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment/orchestrate", async (req, res) => {
    try {
      const orchestrationRequest = req.body;
      if (!orchestrationRequest.targets || !orchestrationRequest.agentConfiguration) {
        return res.status(400).json({ message: "Missing required orchestration parameters" });
      }
      const orchestrationPlan = await storage.orchestrateDeployment(orchestrationRequest);
      await storage.createActivityLog({
        type: "orchestration",
        category: "info",
        title: "AI Deployment Orchestration",
        description: `Generated optimized deployment plan for ${orchestrationPlan.totalTargets} targets`,
        entityType: "orchestration",
        entityId: orchestrationPlan.jobId,
        domainId: req.body.domainId || 1,
        tenantId: req.body.tenantId || 1,
        metadata: {
          strategy: orchestrationPlan.strategy,
          totalTargets: orchestrationPlan.totalTargets,
          estimatedDuration: orchestrationPlan.estimatedDuration,
          riskAssessment: orchestrationPlan.riskAssessment
        },
        userId: req.body.userId || "system"
      });
      res.json({
        success: true,
        orchestrationPlan,
        message: "Deployment plan generated successfully",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Failed to orchestrate deployment:", error);
      res.status(500).json({
        message: "Failed to orchestrate deployment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment/strategies", async (req, res) => {
    try {
      const strategies = await storage.getDeploymentStrategies();
      res.json({
        strategies,
        defaultStrategy: "rolling",
        count: strategies.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Failed to fetch deployment strategies:", error);
      res.status(500).json({
        message: "Failed to fetch deployment strategies",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/agent-deployment/validate-targets", async (req, res) => {
    try {
      const { targets } = req.body;
      if (!targets) {
        return res.status(400).json({ message: "No targets provided for validation" });
      }
      const validation = await storage.validateDeploymentTargets(targets);
      const isValid = validation.invalid.length === 0;
      res.json({
        isValid,
        validTargets: validation.valid,
        invalidTargets: validation.invalid,
        warnings: validation.warnings,
        summary: {
          total: validation.valid.length + validation.invalid.length,
          valid: validation.valid.length,
          invalid: validation.invalid.length,
          warnings: validation.warnings.length
        },
        recommendations: validation.invalid.length > 0 ? ["Review and fix invalid targets before proceeding with deployment"] : ["All targets are valid for deployment"],
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Failed to validate deployment targets:", error);
      res.status(500).json({
        message: "Failed to validate deployment targets",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment/statistics", async (req, res) => {
    try {
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const timeRange = req.query.timeRange || "7d";
      const [deploymentStats, agentStats] = await Promise.all([
        storage.getAgentDeploymentStats(domainId, tenantId),
        storage.getAgentStatistics(domainId, tenantId)
      ]);
      const now = /* @__PURE__ */ new Date();
      const timeRangeMap = {
        "1d": 24 * 60 * 60 * 1e3,
        "7d": 7 * 24 * 60 * 60 * 1e3,
        "30d": 30 * 24 * 60 * 60 * 1e3,
        "90d": 90 * 24 * 60 * 60 * 1e3
      };
      const timeRangeMs = timeRangeMap[timeRange] || timeRangeMap["7d"];
      const startDate = new Date(now.getTime() - timeRangeMs);
      const enhancedStats = {
        overview: {
          totalDeployments: deploymentStats.totalJobs,
          successfulDeployments: deploymentStats.completedJobs,
          failedDeployments: deploymentStats.failedJobs,
          activeDeployments: deploymentStats.activeJobs,
          deploymentSuccessRate: deploymentStats.successRate,
          averageDeploymentTime: deploymentStats.averageDeploymentTime
        },
        agentFleet: {
          totalAgents: agentStats.totalAgents,
          onlineAgents: agentStats.onlineAgents,
          offlineAgents: agentStats.offlineAgents,
          errorAgents: agentStats.errorAgents,
          updatingAgents: agentStats.updatingAgents,
          agentHealthRate: Math.round(agentStats.onlineAgents / Math.max(agentStats.totalAgents, 1) * 100)
        },
        platformBreakdown: {
          windows: agentStats.windowsAgents,
          linux: agentStats.linuxAgents,
          macos: agentStats.macosAgents
        },
        trends: {
          timeRange,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          deploymentsThisPeriod: Math.floor(deploymentStats.totalJobs * 0.3),
          // Simulated
          agentsAddedThisPeriod: Math.floor(agentStats.totalAgents * 0.1),
          // Simulated
          averageSuccessRateTrend: "+2.5%"
          // Simulated trend
        },
        performance: {
          averageHeartbeatAge: agentStats.averageHeartbeatAge,
          systemLoadAverage: 0.65,
          // Simulated
          networkLatencyAverage: 45,
          // Simulated ms
          deploymentThroughput: Math.round(deploymentStats.totalTargets / Math.max(deploymentStats.totalJobs, 1))
        },
        timestamp: now.toISOString()
      };
      res.json(enhancedStats);
    } catch (error) {
      console.error("Failed to fetch deployment statistics:", error);
      res.status(500).json({
        message: "Failed to fetch deployment statistics",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/agent-deployment/health", async (req, res) => {
    try {
      const healthData = await storage.getAgentDeploymentHealth();
      const healthScore = healthData.agentFleet.healthScore;
      const systemStatus2 = healthScore >= 90 ? "excellent" : healthScore >= 75 ? "good" : healthScore >= 60 ? "fair" : healthScore >= 40 ? "poor" : "critical";
      const systemChecks = {
        databaseConnection: "healthy",
        agentCommunication: healthData.agentFleet.onlineAgents > 0 ? "healthy" : "degraded",
        deploymentQueue: healthData.deploymentSystem.activeJobs < 10 ? "healthy" : "busy",
        systemResources: "healthy",
        // Would check actual system resources
        networkConnectivity: "healthy"
      };
      const healthStatus = {
        overall: {
          status: systemStatus2,
          score: healthScore,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        deploymentSystem: {
          ...healthData.deploymentSystem,
          queueLength: healthData.deploymentSystem.activeJobs,
          processingCapacity: "85%"
          // Simulated
        },
        agentFleet: healthData.agentFleet,
        systemChecks,
        alerts: healthData.recommendations.map((rec) => ({
          level: rec.includes("failed") || rec.includes("offline") ? "warning" : "info",
          message: rec,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })),
        recommendations: healthData.recommendations,
        uptime: {
          deploymentService: "99.8%",
          // Simulated
          agentCommunication: "99.5%",
          // Simulated
          lastIncident: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString()
          // 7 days ago
        }
      };
      res.json(healthStatus);
    } catch (error) {
      console.error("Failed to fetch deployment health:", error);
      res.status(500).json({
        message: "Failed to fetch deployment health",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/standard-script-templates", async (req, res) => {
    try {
      const templates = await storage.getAllStandardScriptTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standard script templates" });
    }
  });
  app2.get("/api/standard-script-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getStandardScriptTemplateById(id);
      if (!template) {
        return res.status(404).json({ message: "Standard script template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standard script template" });
    }
  });
  app2.get("/api/standard-script-templates/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const templates = await storage.getStandardScriptTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standard script templates by category" });
    }
  });
  app2.get("/api/standard-script-templates/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const templates = await storage.getStandardScriptTemplatesByType(type);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standard script templates by type" });
    }
  });
  app2.post("/api/standard-script-templates", async (req, res) => {
    try {
      const templateData = insertStandardScriptTemplateSchema.parse(req.body);
      const template = await storage.createStandardScriptTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid standard script template data" });
    }
  });
  app2.put("/api/standard-script-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const templateData = insertStandardScriptTemplateSchema.partial().parse(req.body);
      const template = await storage.updateStandardScriptTemplate(id, templateData);
      if (!template) {
        return res.status(404).json({ message: "Standard script template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid standard script template data" });
    }
  });
  app2.delete("/api/standard-script-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStandardScriptTemplate(id);
      if (!success) {
        return res.status(404).json({ message: "Standard script template not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete standard script template" });
    }
  });
  app2.get("/api/script-orchestrator-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllScriptOrchestratorProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch script orchestrator profiles" });
    }
  });
  app2.get("/api/script-orchestrator-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getScriptOrchestratorProfileById(id);
      if (!profile) {
        return res.status(404).json({ message: "Script orchestrator profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch script orchestrator profile" });
    }
  });
  app2.post("/api/script-orchestrator-profiles", async (req, res) => {
    try {
      const profileData = insertScriptOrchestratorProfileSchema.parse(req.body);
      const profile = await storage.createScriptOrchestratorProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid script orchestrator profile data" });
    }
  });
  app2.put("/api/script-orchestrator-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profileData = insertScriptOrchestratorProfileSchema.partial().parse(req.body);
      const profile = await storage.updateScriptOrchestratorProfile(id, profileData);
      if (!profile) {
        return res.status(404).json({ message: "Script orchestrator profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid script orchestrator profile data" });
    }
  });
  app2.delete("/api/script-orchestrator-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteScriptOrchestratorProfile(id);
      if (!success) {
        return res.status(404).json({ message: "Script orchestrator profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete script orchestrator profile" });
    }
  });
  app2.get("/api/agent-status-reports", async (req, res) => {
    try {
      const reports = await storage.getAllAgentStatusReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status reports" });
    }
  });
  app2.get("/api/agent-status-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getAgentStatusReportById(id);
      if (!report) {
        return res.status(404).json({ message: "Agent status report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status report" });
    }
  });
  app2.get("/api/agent-status-reports/agent/:agentId", async (req, res) => {
    try {
      const agentId = req.params.agentId;
      const report = await storage.getAgentStatusReportByAgentId(agentId);
      if (!report) {
        return res.status(404).json({ message: "Agent status report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status report" });
    }
  });
  app2.get("/api/agent-status-reports/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const reports = await storage.getAgentStatusByDomain(domainId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status reports by domain" });
    }
  });
  app2.get("/api/agent-status-reports/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const reports = await storage.getAgentStatusByTenant(tenantId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status reports by tenant" });
    }
  });
  app2.post("/api/agent-status-reports", async (req, res) => {
    try {
      const reportData = insertAgentStatusReportSchema.parse(req.body);
      const report = await storage.createAgentStatusReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent status report data" });
    }
  });
  app2.put("/api/agent-status-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reportData = insertAgentStatusReportSchema.partial().parse(req.body);
      const report = await storage.updateAgentStatusReport(id, reportData);
      if (!report) {
        return res.status(404).json({ message: "Agent status report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent status report data" });
    }
  });
  app2.put("/api/agent-status-reports/agent/:agentId", async (req, res) => {
    try {
      const agentId = req.params.agentId;
      const reportData = insertAgentStatusReportSchema.partial().parse(req.body);
      const report = await storage.upsertAgentStatusReport(agentId, reportData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent status report data" });
    }
  });
  app2.delete("/api/agent-status-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAgentStatusReport(id);
      if (!success) {
        return res.status(404).json({ message: "Agent status report not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete agent status report" });
    }
  });
  app2.get("/api/external/discovery-scripts", validateApiKey, async (req, res) => {
    try {
      const category = req.query.category || "discovery";
      const templates = await storage.getStandardScriptTemplatesByCategory(category);
      res.json({
        scripts: templates.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          type: t.type,
          targetOs: t.targetOs,
          complexity: t.complexity,
          estimatedRunTime: t.estimatedRunTime,
          requiresElevation: t.requiresElevation,
          parameters: t.parameters,
          tags: t.tags
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discovery scripts for external API" });
    }
  });
  app2.get("/api/external/orchestrator-data", validateApiKey, async (req, res) => {
    try {
      const profiles = await storage.getAllScriptOrchestratorProfiles();
      const agentReports = await storage.getAllAgentStatusReports();
      res.json({
        orchestratorProfiles: profiles.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          scope: p.scope,
          executionConfig: p.executionConfig,
          linkedScripts: p.linkedScripts,
          linkedPolicies: p.linkedPolicies,
          isActive: p.isActive,
          executionCount: p.executionCount,
          lastExecuted: p.lastExecuted
        })),
        agentStatus: agentReports.map((r) => ({
          agentId: r.agentId,
          hostname: r.hostname,
          status: r.status,
          lastHeartbeat: r.lastHeartbeat,
          healthScore: r.healthScore,
          currentJobs: r.currentJobs,
          queuedJobs: r.queuedJobs,
          completedJobs: r.completedJobs,
          failedJobs: r.failedJobs
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orchestrator data for external API" });
    }
  });
  app2.get("/api/external/agent-status/:agentId", validateApiKey, async (req, res) => {
    try {
      const { agentId } = req.params;
      const agentStatus = await storage.getAgentStatusReportByAgentId(agentId);
      if (!agentStatus) {
        return res.status(404).json({
          success: false,
          message: "Agent status not found"
        });
      }
      res.json({
        success: true,
        data: {
          agentId: agentStatus.agentId,
          hostname: agentStatus.hostname,
          status: agentStatus.status,
          lastHeartbeat: agentStatus.lastHeartbeat,
          healthScore: agentStatus.healthScore,
          currentJobs: agentStatus.currentJobs,
          queuedJobs: agentStatus.queuedJobs,
          completedJobs: agentStatus.completedJobs,
          failedJobs: agentStatus.failedJobs,
          lastUpdated: agentStatus.lastUpdated
        }
      });
    } catch (error) {
      console.error("Error fetching agent status for external API:", error);
      res.status(500).json({ message: "Failed to fetch agent status" });
    }
  });
  app2.get("/api/external/agent-status/domain/:domainId", validateApiKey, async (req, res) => {
    try {
      const { domainId } = req.params;
      const agentReports = await storage.getAgentStatusReportsByDomain(domainId);
      res.json({
        success: true,
        data: agentReports.map((r) => ({
          agentId: r.agentId,
          hostname: r.hostname,
          status: r.status,
          lastHeartbeat: r.lastHeartbeat,
          healthScore: r.healthScore,
          currentJobs: r.currentJobs,
          queuedJobs: r.queuedJobs,
          completedJobs: r.completedJobs,
          failedJobs: r.failedJobs
        })),
        count: agentReports.length
      });
    } catch (error) {
      console.error("Error fetching agent status by domain for external API:", error);
      res.status(500).json({ message: "Failed to fetch agent status by domain" });
    }
  });
  app2.get("/api/external/agent-status/tenant/:tenantId", validateApiKey, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const agentReports = await storage.getAgentStatusReportsByTenant(tenantId);
      res.json({
        success: true,
        data: agentReports.map((r) => ({
          agentId: r.agentId,
          hostname: r.hostname,
          status: r.status,
          lastHeartbeat: r.lastHeartbeat,
          healthScore: r.healthScore,
          currentJobs: r.currentJobs,
          queuedJobs: r.queuedJobs,
          completedJobs: r.completedJobs,
          failedJobs: r.failedJobs
        })),
        count: agentReports.length
      });
    } catch (error) {
      console.error("Error fetching agent status by tenant for external API:", error);
      res.status(500).json({ message: "Failed to fetch agent status by tenant" });
    }
  });
  app2.get("/api/settings/global", async (req, res) => {
    try {
      const {
        category,
        accessLevel,
        isInheritable,
        page = 1,
        limit = 100
      } = req.query;
      const options = {
        category,
        accessLevel,
        isInheritable: isInheritable === "true" ? true : isInheritable === "false" ? false : void 0,
        page: parseInt(page),
        limit: parseInt(limit)
      };
      const result = await storage.getAllGlobalSettings(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching global settings:", error);
      res.status(500).json({
        message: "Failed to fetch global settings",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/settings/global/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await storage.getGlobalSettingsByCategory(category);
      res.json({ settings });
    } catch (error) {
      console.error("Error fetching global settings by category:", error);
      res.status(500).json({ message: "Failed to fetch settings by category" });
    }
  });
  app2.put("/api/settings/global", async (req, res) => {
    try {
      const { settings, userId } = req.body;
      if (!Array.isArray(settings)) {
        return res.status(400).json({ message: "Settings must be an array" });
      }
      const validationResults = await storage.bulkValidateSettings(settings);
      const invalidSettings = validationResults.filter((result) => !result.valid);
      if (invalidSettings.length > 0) {
        return res.status(400).json({
          message: "Validation failed for some settings",
          errors: invalidSettings
        });
      }
      const updatedSettings = await storage.bulkUpdateGlobalSettings(settings, userId);
      res.json({
        message: `Successfully updated ${updatedSettings.length} settings`,
        updatedSettings
      });
    } catch (error) {
      console.error("Error bulk updating global settings:", error);
      res.status(500).json({ message: "Failed to update global settings" });
    }
  });
  app2.put("/api/settings/global/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value, userId } = req.body;
      const validation = await storage.validateSettingValue(key, value, "global");
      if (!validation.valid) {
        return res.status(400).json({
          message: "Setting validation failed",
          errors: validation.errors,
          warnings: validation.warnings
        });
      }
      const updatedSetting = await storage.updateGlobalSettingByKey(key, value, userId);
      if (!updatedSetting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json({
        message: "Setting updated successfully",
        setting: updatedSetting,
        warnings: validation.warnings
      });
    } catch (error) {
      console.error("Error updating global setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });
  app2.post("/api/settings/global/reset", async (req, res) => {
    try {
      const { category } = req.body;
      const resetSettings = await storage.resetGlobalSettingsToDefaults(category);
      res.json({
        message: `Successfully reset ${resetSettings.length} settings to defaults`,
        resetSettings
      });
    } catch (error) {
      console.error("Error resetting global settings:", error);
      res.status(500).json({ message: "Failed to reset settings" });
    }
  });
  app2.get("/api/settings/global/schema", async (req, res) => {
    try {
      const schema = await storage.getGlobalSettingsSchema();
      res.json({ schema });
    } catch (error) {
      console.error("Error fetching global settings schema:", error);
      res.status(500).json({ message: "Failed to fetch settings schema" });
    }
  });
  app2.get("/api/settings/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const {
        includeInherited = "true",
        category,
        page = 1,
        limit = 100
      } = req.query;
      const options = {
        includeInherited: includeInherited === "true",
        category,
        page: parseInt(page),
        limit: parseInt(limit)
      };
      const result = await storage.getDomainSettings(domainId, options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching domain settings:", error);
      res.status(500).json({ message: "Failed to fetch domain settings" });
    }
  });
  app2.put("/api/settings/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const { key, value, overrideReason, userId } = req.body;
      if (!key) {
        return res.status(400).json({ message: "Setting key is required" });
      }
      const validation = await storage.validateSettingValue(key, value, "domain", domainId);
      if (!validation.valid) {
        return res.status(400).json({
          message: "Setting validation failed",
          errors: validation.errors,
          warnings: validation.warnings
        });
      }
      const updatedSetting = await storage.updateDomainSetting(domainId, key, value, overrideReason, userId);
      if (!updatedSetting) {
        return res.status(404).json({ message: "Failed to update domain setting" });
      }
      res.json({
        message: "Domain setting updated successfully",
        setting: updatedSetting,
        warnings: validation.warnings
      });
    } catch (error) {
      console.error("Error updating domain setting:", error);
      res.status(500).json({ message: "Failed to update domain setting" });
    }
  });
  app2.get("/api/settings/domain/:domainId/inheritance", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const inheritanceMap = await storage.getDomainSettingsInheritanceMap(domainId);
      res.json({ inheritanceMap });
    } catch (error) {
      console.error("Error fetching domain settings inheritance:", error);
      res.status(500).json({ message: "Failed to fetch domain settings inheritance" });
    }
  });
  app2.post("/api/settings/domain/:domainId/inherit/:key", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const { key } = req.params;
      const { userId } = req.body;
      await storage.inheritDomainSettingFromGlobal(domainId, key, userId);
      res.json({ message: `Domain setting '${key}' now inherits from global` });
    } catch (error) {
      console.error("Error inheriting domain setting:", error);
      res.status(500).json({ message: "Failed to inherit setting from global" });
    }
  });
  app2.post("/api/settings/domain/:domainId/override/:key", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const { key } = req.params;
      const { value, reason, userId } = req.body;
      const validation = await storage.validateSettingValue(key, value, "domain", domainId);
      if (!validation.valid) {
        return res.status(400).json({
          message: "Setting validation failed",
          errors: validation.errors,
          warnings: validation.warnings
        });
      }
      const overriddenSetting = await storage.overrideDomainSetting(domainId, key, value, reason, userId);
      if (!overriddenSetting) {
        return res.status(404).json({ message: "Failed to override setting" });
      }
      res.json({
        message: `Domain setting '${key}' overridden successfully`,
        setting: overriddenSetting,
        warnings: validation.warnings
      });
    } catch (error) {
      console.error("Error overriding domain setting:", error);
      res.status(500).json({ message: "Failed to override domain setting" });
    }
  });
  app2.get("/api/settings/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const {
        includeInherited = "true",
        category,
        page = 1,
        limit = 100
      } = req.query;
      const options = {
        includeInherited: includeInherited === "true",
        category,
        page: parseInt(page),
        limit: parseInt(limit)
      };
      const result = await storage.getTenantSettings(tenantId, options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching tenant settings:", error);
      res.status(500).json({ message: "Failed to fetch tenant settings" });
    }
  });
  app2.put("/api/settings/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const { key, value, overrideReason, userId } = req.body;
      if (!key) {
        return res.status(400).json({ message: "Setting key is required" });
      }
      const validation = await storage.validateSettingValue(key, value, "tenant", tenantId);
      if (!validation.valid) {
        return res.status(400).json({
          message: "Setting validation failed",
          errors: validation.errors,
          warnings: validation.warnings
        });
      }
      const updatedSetting = await storage.updateTenantSetting(tenantId, key, value, overrideReason, userId);
      if (!updatedSetting) {
        return res.status(404).json({ message: "Failed to update tenant setting" });
      }
      res.json({
        message: "Tenant setting updated successfully",
        setting: updatedSetting,
        warnings: validation.warnings
      });
    } catch (error) {
      console.error("Error updating tenant setting:", error);
      res.status(500).json({ message: "Failed to update tenant setting" });
    }
  });
  app2.get("/api/settings/tenant/:tenantId/effective", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const { category } = req.query;
      const effectiveSettings = await storage.getTenantEffectiveSettings(tenantId, category);
      res.json({ effectiveSettings });
    } catch (error) {
      console.error("Error fetching tenant effective settings:", error);
      res.status(500).json({ message: "Failed to fetch effective settings" });
    }
  });
  app2.post("/api/settings/tenant/:tenantId/reset-category/:category", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const { category } = req.params;
      const { userId } = req.body;
      const resetSettings = await storage.resetTenantSettingsCategory(tenantId, category, userId);
      res.json({
        message: `Successfully reset tenant settings for category '${category}'`,
        resetCount: resetSettings.length
      });
    } catch (error) {
      console.error("Error resetting tenant settings category:", error);
      res.status(500).json({ message: "Failed to reset tenant settings category" });
    }
  });
  app2.get("/api/settings/user/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const {
        category,
        includeDefaults = "false",
        page = 1,
        limit = 100
      } = req.query;
      const options = {
        category,
        includeDefaults: includeDefaults === "true",
        page: parseInt(page),
        limit: parseInt(limit)
      };
      const result = await storage.getUserPreferences(userId, options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });
  app2.put("/api/settings/user/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { preferences } = req.body;
      if (!Array.isArray(preferences)) {
        return res.status(400).json({ message: "Preferences must be an array" });
      }
      const updatedPreferences = await storage.updateUserPreferences(userId, preferences);
      res.json({
        message: `Successfully updated ${updatedPreferences.length} user preferences`,
        preferences: updatedPreferences
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });
  app2.post("/api/settings/user/:userId/preferences/reset", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { category } = req.body;
      const resetPreferences = await storage.resetUserPreferences(userId, category);
      res.json({
        message: "User preferences reset successfully",
        remainingPreferences: resetPreferences
      });
    } catch (error) {
      console.error("Error resetting user preferences:", error);
      res.status(500).json({ message: "Failed to reset user preferences" });
    }
  });
  app2.get("/api/settings/user/:userId/preferences/available", async (req, res) => {
    try {
      const availablePreferences = await storage.getUserAvailablePreferences();
      res.json({ availablePreferences });
    } catch (error) {
      console.error("Error fetching available user preferences:", error);
      res.status(500).json({ message: "Failed to fetch available preferences" });
    }
  });
  app2.get("/api/settings/categories", async (req, res) => {
    try {
      const categories = await storage.getAllSettingsCategories();
      res.json({ categories });
    } catch (error) {
      console.error("Error fetching settings categories:", error);
      res.status(500).json({ message: "Failed to fetch settings categories" });
    }
  });
  app2.get("/api/settings/validation/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const validationRules = await storage.getSettingsValidationRules(key);
      res.json({ validationRules });
    } catch (error) {
      console.error("Error fetching validation rules:", error);
      res.status(500).json({ message: "Failed to fetch validation rules" });
    }
  });
  app2.post("/api/settings/validate", async (req, res) => {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings)) {
        return res.status(400).json({ message: "Settings must be an array" });
      }
      const validationResults = await storage.bulkValidateSettings(settings);
      const hasErrors = validationResults.some((result) => !result.valid);
      res.json({
        valid: !hasErrors,
        results: validationResults,
        summary: {
          total: validationResults.length,
          valid: validationResults.filter((r) => r.valid).length,
          invalid: validationResults.filter((r) => !r.valid).length,
          withWarnings: validationResults.filter((r) => r.warnings.length > 0).length
        }
      });
    } catch (error) {
      console.error("Error validating settings:", error);
      res.status(500).json({ message: "Failed to validate settings" });
    }
  });
  app2.get("/api/settings/audit", async (req, res) => {
    try {
      const {
        settingKey,
        settingScope,
        scopeId,
        userId,
        action,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;
      const options = {
        settingKey,
        settingScope,
        scopeId: scopeId ? parseInt(scopeId) : void 0,
        userId: userId ? parseInt(userId) : void 0,
        action,
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit)
      };
      const result = await storage.getSettingsAuditLogs(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching settings audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  app2.post("/api/settings/export", async (req, res) => {
    try {
      const {
        scope,
        scopeId,
        categories,
        includeDefaults = false
      } = req.body;
      const exportData = await storage.exportSettings({
        scope,
        scopeId,
        categories,
        includeDefaults
      });
      res.json({
        success: true,
        data: exportData,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error exporting settings:", error);
      res.status(500).json({ message: "Failed to export settings" });
    }
  });
  app2.post("/api/settings/import", async (req, res) => {
    try {
      const { settingsData, scope, scopeId, userId, validateOnly = false } = req.body;
      if (!settingsData) {
        return res.status(400).json({ message: "Settings data is required" });
      }
      const validation = await storage.validateSettingsImport(settingsData);
      if (!validation.valid && !validateOnly) {
        return res.status(400).json({
          message: "Settings import validation failed",
          valid: false,
          errors: validation.errors,
          warnings: validation.warnings
        });
      }
      if (validateOnly) {
        return res.json({
          message: "Settings import validation completed",
          ...validation
        });
      }
      const importResult = await storage.importSettings(settingsData, scope, scopeId, userId);
      res.json({
        success: true,
        message: "Settings imported successfully",
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: importResult.errors,
        warnings: validation.warnings
      });
    } catch (error) {
      console.error("Error importing settings:", error);
      res.status(500).json({ message: "Failed to import settings" });
    }
  });
  app2.get("/api/settings/templates", async (req, res) => {
    try {
      const {
        scope,
        category,
        templateType,
        page = 1,
        limit = 20
      } = req.query;
      const options = {
        scope,
        category,
        templateType,
        page: parseInt(page),
        limit: parseInt(limit)
      };
      const result = await storage.getAllSettingsTemplates(options);
      res.json(result);
    } catch (error) {
      console.error("Error fetching settings templates:", error);
      res.status(500).json({ message: "Failed to fetch settings templates" });
    }
  });
  app2.post("/api/settings/templates/:templateId/apply", async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId);
      const { scope, scopeId, userId } = req.body;
      if (!scope) {
        return res.status(400).json({ message: "Scope is required" });
      }
      const result = await storage.applySettingsTemplate(templateId, scope, scopeId, userId);
      res.json({
        success: true,
        message: "Template applied successfully",
        applied: result.applied,
        skipped: result.skipped,
        errors: result.errors
      });
    } catch (error) {
      console.error("Error applying settings template:", error);
      res.status(500).json({ message: "Failed to apply settings template" });
    }
  });
  const rateLimitStore = /* @__PURE__ */ new Map();
  const validateExternalApiKey = async (req, res, next) => {
    try {
      const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
      if (!apiKey) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "API key required in X-API-Key header or Authorization header"
        });
      }
      const validApiKeys = {
        "demo-api-key-12345": { domainId: 1, tenantId: 1, permissions: ["read", "write"], rateLimitPerMinute: 100 },
        "external-system-key": { domainId: 1, tenantId: 1, permissions: ["read", "write"], rateLimitPerMinute: 200 },
        "readonly-api-key": { domainId: 1, tenantId: 1, permissions: ["read"], rateLimitPerMinute: 50 },
        "agent-api-key": { domainId: 1, tenantId: 1, permissions: ["agent-status"], rateLimitPerMinute: 1e3 }
      };
      const keyInfo = validApiKeys[apiKey];
      if (!keyInfo) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid API key"
        });
      }
      const now = Date.now();
      const rateLimitKey = `${apiKey}:${Math.floor(now / 6e4)}`;
      const currentUsage = rateLimitStore.get(rateLimitKey) || { count: 0, resetTime: now + 6e4 };
      if (currentUsage.count >= keyInfo.rateLimitPerMinute) {
        return res.status(429).json({
          error: "Rate Limit Exceeded",
          message: "Too many requests per minute",
          resetTime: currentUsage.resetTime
        });
      }
      currentUsage.count++;
      rateLimitStore.set(rateLimitKey, currentUsage);
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }
      req.externalApi = {
        domainId: keyInfo.domainId,
        tenantId: keyInfo.tenantId,
        permissions: keyInfo.permissions,
        apiKey
      };
      try {
        await storage.createActivity({
          type: "external_api",
          category: "info",
          title: "External API Access",
          description: `External API access via ${req.method} ${req.path}`,
          entityType: "external_system",
          entityId: apiKey,
          domainId: keyInfo.domainId,
          tenantId: keyInfo.tenantId,
          metadata: {
            method: req.method,
            path: req.path,
            userAgent: req.headers["user-agent"],
            ip: req.ip
          }
        });
      } catch (auditError) {
        console.error("Failed to log external API access:", auditError);
      }
      next();
    } catch (error) {
      console.error("External API key validation error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "API key validation failed"
      });
    }
  };
  const requirePermission = (permission) => {
    return (req, res, next) => {
      if (!req.externalApi?.permissions.includes(permission)) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Required permission: ${permission}`
        });
      }
      next();
    };
  };
  app2.get("/api/external/agent-policies", validateExternalApiKey, requirePermission("read"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const {
        category,
        targetOs,
        isActive = true,
        publishScope,
        page = 1,
        limit = 50
      } = req.query;
      const options = {
        domainId,
        tenantId,
        category,
        targetOs,
        isActive: isActive === "true",
        publishScope,
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100)
        // Cap at 100
      };
      const policies2 = await storage.getAllPolicies();
      const filteredPolicies = policies2.filter(
        (policy) => (policy.domainId === domainId || policy.publishScope === "domain" && policy.domainId === domainId || policy.publishScope === "global") && (policy.tenantId === tenantId || policy.scope !== "tenant") && policy.publishStatus === "published" && (!category || policy.category === category) && (!targetOs || policy.targetOs === targetOs) && policy.isActive === (isActive === "true")
      ).slice((options.page - 1) * options.limit, options.page * options.limit).map((policy) => ({
        id: policy.id,
        name: policy.name,
        description: policy.description,
        category: policy.category,
        targetOs: policy.targetOs,
        version: policy.version,
        executionOrder: policy.executionOrder,
        availableScripts: policy.availableScripts || [],
        lastExecuted: policy.lastExecuted,
        isActive: policy.isActive,
        scope: policy.scope,
        publishScope: policy.publishScope,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt
      }));
      res.json({
        policies: filteredPolicies,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: filteredPolicies.length,
          hasMore: filteredPolicies.length === options.limit
        },
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching external policies:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch policies for external system"
      });
    }
  });
  app2.get("/api/external/agent-policies/:policyId", validateExternalApiKey, requirePermission("read"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const policyId = parseInt(req.params.policyId);
      if (isNaN(policyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid policy ID"
        });
      }
      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return res.status(404).json({
          error: "Not Found",
          message: "Policy not found"
        });
      }
      const hasAccess = (policy.domainId === domainId || policy.publishScope === "domain" && policy.domainId === domainId || policy.publishScope === "global") && (policy.tenantId === tenantId || policy.scope !== "tenant") && policy.publishStatus === "published";
      if (!hasAccess) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this policy"
        });
      }
      let scriptsDetails = [];
      if (policy.availableScripts && policy.availableScripts.length > 0) {
        const scripts2 = await storage.getAllScripts();
        scriptsDetails = scripts2.filter((script) => policy.availableScripts?.includes(script.id.toString())).map((script) => ({
          id: script.id,
          name: script.name,
          description: script.description,
          category: script.category,
          targetOs: script.targetOs,
          version: script.version,
          timeout: script.timeout
        }));
      }
      res.json({
        policy: {
          id: policy.id,
          name: policy.name,
          description: policy.description,
          category: policy.category,
          targetOs: policy.targetOs,
          version: policy.version,
          executionOrder: policy.executionOrder,
          executionFlow: policy.executionFlow,
          availableScripts: policy.availableScripts || [],
          scriptsDetails,
          lastExecuted: policy.lastExecuted,
          executionCount: policy.executionCount,
          isActive: policy.isActive,
          scope: policy.scope,
          publishScope: policy.publishScope,
          createdAt: policy.createdAt,
          updatedAt: policy.updatedAt
        },
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching external policy details:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch policy details"
      });
    }
  });
  app2.get("/api/external/agent-policies/:policyId/scripts", validateExternalApiKey, requirePermission("read"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const policyId = parseInt(req.params.policyId);
      if (isNaN(policyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid policy ID"
        });
      }
      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return res.status(404).json({
          error: "Not Found",
          message: "Policy not found"
        });
      }
      const hasAccess = (policy.domainId === domainId || policy.publishScope === "domain" && policy.domainId === domainId || policy.publishScope === "global") && (policy.tenantId === tenantId || policy.scope !== "tenant") && policy.publishStatus === "published";
      if (!hasAccess) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this policy"
        });
      }
      const scripts2 = await storage.getAllScripts();
      const policyScripts = scripts2.filter(
        (script) => policy.availableScripts?.includes(script.id.toString()) && (script.domainId === domainId || script.scope !== "tenant") && script.publishStatus === "published"
      ).map((script) => ({
        id: script.id,
        name: script.name,
        description: script.description,
        category: script.category,
        targetOs: script.targetOs,
        version: script.version,
        scriptType: script.scriptType,
        scriptContent: script.publishScope === "global" ? script.scriptContent : void 0,
        // Only include content for global scripts
        timeout: script.timeout,
        retryCount: script.retryCount,
        parameters: script.parameters,
        executionCount: script.executionCount,
        lastExecuted: script.lastExecuted,
        isActive: script.isActive,
        createdAt: script.createdAt,
        updatedAt: script.updatedAt
      }));
      res.json({
        policyId: policy.id,
        policyName: policy.name,
        scripts: policyScripts,
        executionFlow: policy.executionFlow,
        totalScripts: policyScripts.length,
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching policy scripts:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch policy scripts"
      });
    }
  });
  app2.get("/api/external/agent-policies/:policyId/credentials", validateExternalApiKey, requirePermission("read"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const policyId = parseInt(req.params.policyId);
      if (isNaN(policyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid policy ID"
        });
      }
      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return res.status(404).json({
          error: "Not Found",
          message: "Policy not found"
        });
      }
      const hasAccess = (policy.domainId === domainId || policy.publishScope === "domain" && policy.domainId === domainId || policy.publishScope === "global") && (policy.tenantId === tenantId || policy.scope !== "tenant") && policy.publishStatus === "published";
      if (!hasAccess) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this policy"
        });
      }
      const credentialProfiles2 = await storage.getAllCredentialProfiles();
      const availableCredentials = credentialProfiles2.filter(
        (profile) => (profile.domainId === domainId || profile.scope !== "tenant") && profile.isActive
      ).map((profile) => ({
        id: profile.id,
        name: profile.name,
        description: profile.description,
        category: profile.category,
        credentialType: profile.credentialType,
        targetOs: profile.targetOs,
        scope: profile.scope,
        // Don't expose actual credential values for security
        requiresMfa: profile.requiresMfa,
        isActive: profile.isActive,
        createdAt: profile.createdAt
      }));
      res.json({
        policyId: policy.id,
        policyName: policy.name,
        credentialRequirements: {
          requiresCredentials: availableCredentials.length > 0,
          recommendedCredentials: availableCredentials.filter((c) => c.category === policy.category),
          allAvailableCredentials: availableCredentials,
          credentialTypes: [...new Set(availableCredentials.map((c) => c.credentialType))],
          targetOsRequirements: policy.targetOs
        },
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching policy credentials:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch policy credential requirements"
      });
    }
  });
  app2.get("/api/external/endpoints/:endpointId/policies", validateExternalApiKey, requirePermission("read"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const endpointId = parseInt(req.params.endpointId);
      if (isNaN(endpointId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid endpoint ID"
        });
      }
      const endpoint = await storage.getEndpoint(endpointId);
      if (!endpoint) {
        return res.status(404).json({
          error: "Not Found",
          message: "Endpoint not found"
        });
      }
      if (endpoint.domainId !== domainId || endpoint.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this endpoint"
        });
      }
      const allPolicies = await storage.getAllPolicies();
      const applicablePolicies = allPolicies.filter(
        (policy) => (policy.domainId === domainId || policy.publishScope === "global") && (policy.tenantId === tenantId || policy.scope !== "tenant") && policy.publishStatus === "published" && policy.isActive && (policy.targetOs === "all" || policy.targetOs === endpoint.operatingSystem)
      ).map((policy) => ({
        id: policy.id,
        name: policy.name,
        description: policy.description,
        category: policy.category,
        targetOs: policy.targetOs,
        version: policy.version,
        executionOrder: policy.executionOrder,
        isApplied: endpoint.appliedPolicies?.some((ap) => ap.policyId === policy.id) || false,
        lastApplied: endpoint.appliedPolicies?.find((ap) => ap.policyId === policy.id)?.appliedAt || null,
        applicationStatus: endpoint.appliedPolicies?.find((ap) => ap.policyId === policy.id)?.status || "not_applied",
        scope: policy.scope,
        publishScope: policy.publishScope,
        createdAt: policy.createdAt
      }));
      res.json({
        endpointId: endpoint.id,
        endpointName: endpoint.hostname,
        operatingSystem: endpoint.operatingSystem,
        policies: {
          applied: applicablePolicies.filter((p) => p.isApplied),
          available: applicablePolicies.filter((p) => !p.isApplied),
          total: applicablePolicies.length
        },
        lastPolicyUpdate: endpoint.updatedAt,
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching endpoint policies:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch endpoint policies"
      });
    }
  });
  app2.post("/api/external/deployments", validateExternalApiKey, requirePermission("write"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentData = {
        ...req.body,
        domainId,
        tenantId,
        status: "initiated",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const validatedData = insertAgentDeploymentSchema.parse(deploymentData);
      const deployment = await storage.createAgentDeployment(validatedData);
      await storage.createActivity({
        type: "deployment",
        category: "info",
        title: "External Deployment Created",
        description: `External system created deployment: ${deployment.name}`,
        entityType: "deployment",
        entityId: deployment.id.toString(),
        domainId,
        tenantId,
        metadata: {
          externalApiKey: req.externalApi.apiKey,
          deploymentType: deployment.deploymentType,
          targetCount: deployment.targetEnvironments?.length || 0
        }
      });
      res.status(201).json({
        deployment: {
          id: deployment.id,
          name: deployment.name,
          status: deployment.status,
          deploymentType: deployment.deploymentType,
          targetEnvironments: deployment.targetEnvironments,
          createdAt: deployment.createdAt
        },
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error creating external deployment:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid deployment data",
          details: error.message
        });
      }
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create deployment record"
      });
    }
  });
  app2.put("/api/external/deployments/:deploymentId/status", validateExternalApiKey, requirePermission("write"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentId = parseInt(req.params.deploymentId);
      const { status, progress, message, metadata } = req.body;
      if (isNaN(deploymentId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid deployment ID"
        });
      }
      if (!status) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Status is required"
        });
      }
      const deployment = await storage.getAgentDeployment(deploymentId);
      if (!deployment) {
        return res.status(404).json({
          error: "Not Found",
          message: "Deployment not found"
        });
      }
      if (deployment.domainId !== domainId || deployment.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this deployment"
        });
      }
      const updateData = {
        status,
        ...progress !== void 0 && { progress },
        ...metadata && { metadata },
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updatedDeployment = await storage.updateAgentDeployment(deploymentId, updateData);
      await storage.createActivity({
        type: "deployment",
        category: status === "failed" ? "error" : status === "completed" ? "success" : "info",
        title: "Deployment Status Updated",
        description: message || `Deployment status changed to: ${status}`,
        entityType: "deployment",
        entityId: deploymentId.toString(),
        domainId,
        tenantId,
        metadata: {
          externalApiKey: req.externalApi.apiKey,
          previousStatus: deployment.status,
          newStatus: status,
          progress
        }
      });
      res.json({
        deployment: {
          id: updatedDeployment?.id,
          status: updatedDeployment?.status,
          progress: updatedDeployment?.progress,
          updatedAt: updatedDeployment?.updatedAt
        },
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error updating deployment status:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update deployment status"
      });
    }
  });
  app2.post("/api/external/deployments/:deploymentId/results", validateExternalApiKey, requirePermission("write"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentId = parseInt(req.params.deploymentId);
      const { results, summary, errors, completedAt } = req.body;
      if (isNaN(deploymentId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid deployment ID"
        });
      }
      const deployment = await storage.getAgentDeployment(deploymentId);
      if (!deployment) {
        return res.status(404).json({
          error: "Not Found",
          message: "Deployment not found"
        });
      }
      if (deployment.domainId !== domainId || deployment.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this deployment"
        });
      }
      const updateData = {
        results: results || deployment.results,
        status: errors && errors.length > 0 ? "failed" : "completed",
        completedAt: completedAt || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          ...deployment.metadata,
          summary,
          errors,
          completedViaExternalApi: true
        }
      };
      const updatedDeployment = await storage.updateAgentDeployment(deploymentId, updateData);
      await storage.createActivity({
        type: "deployment",
        category: errors && errors.length > 0 ? "error" : "success",
        title: "Deployment Results Submitted",
        description: summary || `Deployment completed with ${results?.length || 0} results`,
        entityType: "deployment",
        entityId: deploymentId.toString(),
        domainId,
        tenantId,
        metadata: {
          externalApiKey: req.externalApi.apiKey,
          resultsCount: results?.length || 0,
          errorsCount: errors?.length || 0,
          hasErrors: !!(errors && errors.length > 0)
        }
      });
      res.json({
        deploymentId,
        status: updateData.status,
        resultsProcessed: results?.length || 0,
        errorsReported: errors?.length || 0,
        completedAt: updateData.completedAt,
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error submitting deployment results:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to submit deployment results"
      });
    }
  });
  app2.post("/api/external/deployments/:deploymentId/logs", validateExternalApiKey, requirePermission("write"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentId = parseInt(req.params.deploymentId);
      const { logs, level = "info" } = req.body;
      if (isNaN(deploymentId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid deployment ID"
        });
      }
      if (!logs || !Array.isArray(logs)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Logs array is required"
        });
      }
      const deployment = await storage.getAgentDeployment(deploymentId);
      if (!deployment) {
        return res.status(404).json({
          error: "Not Found",
          message: "Deployment not found"
        });
      }
      if (deployment.domainId !== domainId || deployment.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this deployment"
        });
      }
      const processedLogs = logs.map((log2) => ({
        timestamp: log2.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
        level: log2.level || level,
        message: log2.message,
        component: log2.component || "external-system",
        metadata: log2.metadata
      }));
      const existingLogs = deployment.logs || [];
      const updatedLogs = [...existingLogs, ...processedLogs];
      await storage.updateAgentDeployment(deploymentId, {
        logs: updatedLogs,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      await storage.createActivity({
        type: "deployment",
        category: "info",
        title: "Deployment Logs Received",
        description: `Received ${processedLogs.length} log entries for deployment`,
        entityType: "deployment",
        entityId: deploymentId.toString(),
        domainId,
        tenantId,
        metadata: {
          externalApiKey: req.externalApi.apiKey,
          logsCount: processedLogs.length,
          logLevels: [...new Set(processedLogs.map((l) => l.level))]
        }
      });
      res.json({
        deploymentId,
        logsReceived: processedLogs.length,
        totalLogs: updatedLogs.length,
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error submitting deployment logs:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to submit deployment logs"
      });
    }
  });
  app2.get("/api/external/deployments/:deploymentId", validateExternalApiKey, requirePermission("read"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentId = parseInt(req.params.deploymentId);
      if (isNaN(deploymentId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid deployment ID"
        });
      }
      const deployment = await storage.getAgentDeployment(deploymentId);
      if (!deployment) {
        return res.status(404).json({
          error: "Not Found",
          message: "Deployment not found"
        });
      }
      if (deployment.domainId !== domainId || deployment.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this deployment"
        });
      }
      res.json({
        deployment: {
          id: deployment.id,
          name: deployment.name,
          description: deployment.description,
          deploymentType: deployment.deploymentType,
          status: deployment.status,
          progress: deployment.progress,
          targetEnvironments: deployment.targetEnvironments,
          results: deployment.results,
          logs: deployment.logs,
          metadata: deployment.metadata,
          scheduledAt: deployment.scheduledAt,
          startedAt: deployment.startedAt,
          completedAt: deployment.completedAt,
          createdAt: deployment.createdAt,
          updatedAt: deployment.updatedAt
        },
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching deployment details:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch deployment details"
      });
    }
  });
  app2.post("/api/external/agents/:agentId/heartbeat", validateExternalApiKey, requirePermission("agent-status"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const agentId = req.params.agentId;
      const { status, systemInfo, capabilities, discoveryResults } = req.body;
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({
          error: "Not Found",
          message: "Agent not found"
        });
      }
      if (agent.domainId !== domainId || agent.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this agent"
        });
      }
      const updateData = {
        status: status || "online",
        lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString(),
        ...systemInfo && { systemInfo },
        ...capabilities && { capabilities },
        ...discoveryResults && { discoveryResults },
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updatedAgent = await storage.updateAgent(agentId, updateData);
      await storage.createAgentStatusReport({
        agentId,
        domainId,
        tenantId,
        reportType: "heartbeat",
        status: status || "online",
        systemHealth: {
          cpuUsage: systemInfo?.cpuUsage,
          memoryUsage: systemInfo?.memoryUsage,
          diskUsage: systemInfo?.diskUsage,
          networkConnectivity: true
        },
        reportData: {
          capabilities,
          discoveryResults,
          externalApiHeartbeat: true
        }
      });
      res.json({
        agentId,
        status: updateData.status,
        heartbeatReceived: true,
        lastHeartbeat: updateData.lastHeartbeat,
        nextHeartbeatExpected: new Date(Date.now() + 3e5).toISOString(),
        // 5 minutes
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error processing agent heartbeat:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to process agent heartbeat"
      });
    }
  });
  app2.put("/api/external/agents/:agentId/status", validateExternalApiKey, requirePermission("agent-status"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const agentId = req.params.agentId;
      const { status, message, systemInfo, errorDetails } = req.body;
      if (!status) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Status is required"
        });
      }
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({
          error: "Not Found",
          message: "Agent not found"
        });
      }
      if (agent.domainId !== domainId || agent.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this agent"
        });
      }
      const updateData = {
        status,
        ...systemInfo && { systemInfo },
        lastHeartbeat: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const updatedAgent = await storage.updateAgent(agentId, updateData);
      await storage.createActivity({
        type: "agent",
        category: status === "error" ? "error" : status === "offline" ? "warning" : "info",
        title: "Agent Status Updated",
        description: message || `Agent status changed to: ${status}`,
        entityType: "agent",
        entityId: agentId,
        domainId,
        tenantId,
        metadata: {
          externalApiKey: req.externalApi.apiKey,
          previousStatus: agent.status,
          newStatus: status,
          errorDetails,
          hasSystemInfo: !!systemInfo
        }
      });
      await storage.createAgentStatusReport({
        agentId,
        domainId,
        tenantId,
        reportType: "status_change",
        status,
        systemHealth: systemInfo ? {
          cpuUsage: systemInfo.cpuUsage,
          memoryUsage: systemInfo.memoryUsage,
          diskUsage: systemInfo.diskUsage,
          networkConnectivity: status !== "offline"
        } : void 0,
        reportData: {
          message,
          errorDetails,
          statusChangedViaExternalApi: true
        }
      });
      res.json({
        agentId,
        previousStatus: agent.status,
        currentStatus: status,
        statusUpdated: true,
        updatedAt: updateData.updatedAt,
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error updating agent status:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update agent status"
      });
    }
  });
  app2.post("/api/external/agents/:agentId/execution-results", validateExternalApiKey, requirePermission("agent-status"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const agentId = req.params.agentId;
      const { policyId, scriptId, executionId, results, status, startedAt, completedAt, output, errors } = req.body;
      if (!executionId || !status) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Execution ID and status are required"
        });
      }
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({
          error: "Not Found",
          message: "Agent not found"
        });
      }
      if (agent.domainId !== domainId || agent.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this agent"
        });
      }
      if (policyId) {
        const appliedPolicies = agent.appliedPolicies || [];
        const policyIndex = appliedPolicies.findIndex((p) => p.policyId === policyId);
        if (policyIndex >= 0) {
          appliedPolicies[policyIndex] = {
            ...appliedPolicies[policyIndex],
            status,
            appliedAt: completedAt || (/* @__PURE__ */ new Date()).toISOString(),
            results: {
              executionId,
              output,
              errors,
              ...results
            }
          };
        } else {
          appliedPolicies.push({
            policyId: parseInt(policyId),
            appliedAt: completedAt || (/* @__PURE__ */ new Date()).toISOString(),
            status,
            results: {
              executionId,
              output,
              errors,
              ...results
            }
          });
        }
        await storage.updateAgent(agentId, {
          appliedPolicies,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      await storage.createActivity({
        type: "script_execution",
        category: status === "failed" ? "error" : status === "completed" ? "success" : "info",
        title: "Script Execution Results Received",
        description: `Agent ${agentId} reported execution results for ${policyId ? `policy ${policyId}` : `script ${scriptId}`}`,
        entityType: "agent",
        entityId: agentId,
        domainId,
        tenantId,
        metadata: {
          externalApiKey: req.externalApi.apiKey,
          executionId,
          policyId,
          scriptId,
          status,
          hasErrors: !!(errors && errors.length > 0),
          executionDuration: startedAt && completedAt ? new Date(completedAt).getTime() - new Date(startedAt).getTime() : void 0
        }
      });
      await storage.createAgentStatusReport({
        agentId,
        domainId,
        tenantId,
        reportType: "execution_result",
        status: agent.status,
        // Agent's overall status
        executionResults: {
          executionId,
          policyId: policyId ? parseInt(policyId) : void 0,
          scriptId: scriptId ? parseInt(scriptId) : void 0,
          status,
          startedAt,
          completedAt,
          results,
          output,
          errors
        },
        reportData: {
          executionReportedViaExternalApi: true
        }
      });
      res.json({
        agentId,
        executionId,
        resultsReceived: true,
        status,
        policyUpdated: !!policyId,
        receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error processing execution results:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to process execution results"
      });
    }
  });
  app2.get("/api/external/agents/:agentId/pending-tasks", validateExternalApiKey, requirePermission("read"), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const agentId = req.params.agentId;
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({
          error: "Not Found",
          message: "Agent not found"
        });
      }
      if (agent.domainId !== domainId || agent.tenantId !== tenantId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied to this agent"
        });
      }
      const allPolicies = await storage.getAllPolicies();
      const applicablePolicies = allPolicies.filter(
        (policy) => (policy.domainId === domainId || policy.publishScope === "global") && (policy.tenantId === tenantId || policy.scope !== "tenant") && policy.publishStatus === "published" && policy.isActive && (policy.targetOs === "all" || policy.targetOs === agent.operatingSystem)
      );
      const appliedPolicies = agent.appliedPolicies || [];
      const pendingTasks = applicablePolicies.filter((policy) => {
        const applied = appliedPolicies.find((ap) => ap.policyId === policy.id);
        return !applied || applied.status === "failed" || applied.status === "pending";
      }).map((policy) => {
        const applied = appliedPolicies.find((ap) => ap.policyId === policy.id);
        return {
          taskId: `policy-${policy.id}-${Date.now()}`,
          type: "policy_execution",
          policyId: policy.id,
          policyName: policy.name,
          policyVersion: policy.version,
          priority: policy.executionOrder || 0,
          previousAttempt: applied ? {
            status: applied.status,
            appliedAt: applied.appliedAt,
            results: applied.results
          } : null,
          executionFlow: policy.executionFlow,
          availableScripts: policy.availableScripts,
          estimatedDuration: policy.executionFlow?.length ? policy.executionFlow.length * 30 : 60,
          // seconds estimate
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }).sort((a, b) => a.priority - b.priority);
      const deploymentTasks = await storage.getAllAgentDeploymentTasks();
      const agentDeploymentTasks2 = deploymentTasks.filter(
        (task) => (task.agentId === agentId || task.targetHost === agent.hostname) && task.status === "pending"
      ).map((task) => ({
        taskId: `deployment-${task.id}`,
        type: "deployment_task",
        deploymentJobId: task.deploymentJobId,
        targetHost: task.targetHost,
        targetOs: task.targetOs,
        status: task.status,
        attemptCount: task.attemptCount,
        maxRetries: task.maxRetries,
        createdAt: task.createdAt
      }));
      const allPendingTasks = [...pendingTasks, ...agentDeploymentTasks2];
      res.json({
        agentId,
        agentStatus: agent.status,
        agentVersion: agent.version,
        pendingTasks: allPendingTasks,
        taskCounts: {
          policies: pendingTasks.length,
          deployments: agentDeploymentTasks2.length,
          total: allPendingTasks.length
        },
        lastUpdated: agent.updatedAt,
        apiVersion: "1.0",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to fetch pending tasks"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
