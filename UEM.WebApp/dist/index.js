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
import { eq, desc, and, gte, lte } from "drizzle-orm";

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
  agents: () => agents,
  agentsRelations: () => agentsRelations,
  assetAuditLogRelations: () => assetAuditLogRelations,
  assetAuditLogs: () => assetAuditLogs,
  assetCustomFields: () => assetCustomFields,
  assetExternalMappings: () => assetExternalMappings,
  assetExternalMappingsRelations: () => assetExternalMappingsRelations,
  assetInventory: () => assetInventory,
  assetInventoryRelations: () => assetInventoryRelations,
  assetTableViews: () => assetTableViews,
  credentialAccessLogs: () => credentialAccessLogs,
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
  domains: () => domains,
  endpoints: () => endpoints,
  endpointsRelations: () => endpointsRelations,
  externalSystems: () => externalSystems,
  externalSystemsRelations: () => externalSystemsRelations,
  insertActivityLogSchema: () => insertActivityLogSchema,
  insertAgentDeploymentJobSchema: () => insertAgentDeploymentJobSchema,
  insertAgentDeploymentSchema: () => insertAgentDeploymentSchema,
  insertAgentDeploymentTaskSchema: () => insertAgentDeploymentTaskSchema,
  insertAgentSchema: () => insertAgentSchema,
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
  insertEndpointSchema: () => insertEndpointSchema,
  insertExternalSystemSchema: () => insertExternalSystemSchema,
  insertIntegrationLogSchema: () => insertIntegrationLogSchema,
  insertIntegrationRuleSchema: () => insertIntegrationRuleSchema,
  insertPolicySchema: () => insertPolicySchema,
  insertScriptSchema: () => insertScriptSchema,
  insertSystemStatusSchema: () => insertSystemStatusSchema,
  insertTenantSchema: () => insertTenantSchema,
  insertUserSchema: () => insertUserSchema,
  integrationLogs: () => integrationLogs,
  integrationLogsRelations: () => integrationLogsRelations,
  integrationRules: () => integrationRules,
  integrationRulesRelations: () => integrationRulesRelations,
  policies: () => policies,
  policiesRelations: () => policiesRelations,
  scripts: () => scripts,
  scriptsRelations: () => scriptsRelations,
  systemStatus: () => systemStatus,
  tenantRelations: () => tenantRelations,
  tenants: () => tenants,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, integer, boolean, timestamp, jsonb, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var domains = pgTable("domains", {
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
var tenants = pgTable("tenants", {
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
var users = pgTable("users", {
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
var credentialProfiles = pgTable("credential_profiles", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var credentialEntries = pgTable("credential_entries", {
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
var credentialAccessLogs = pgTable("credential_access_logs", {
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
var discoveryProbes = pgTable("discovery_probes", {
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
var scripts = pgTable("scripts", {
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
var policies = pgTable("policies", {
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
var endpoints = pgTable("endpoints", {
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
var discoveryJobs = pgTable("discovery_jobs", {
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
var agentDeployments = pgTable("agent_deployments", {
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
var agents = pgTable("agents", {
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
var activityLogs = pgTable("activity_logs", {
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
var systemStatus = pgTable("system_status", {
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
var dashboardStats = pgTable("dashboard_stats", {
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
var externalSystems = pgTable("external_systems", {
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
var integrationLogs = pgTable("integration_logs", {
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
var agentDeploymentJobs = pgTable("agent_deployment_jobs", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  name: text("name").notNull(),
  description: text("description"),
  targetOs: text("target_os").notNull(),
  // windows, linux, macos
  deploymentMethod: text("deployment_method").notNull(),
  // group_policy, sccm, ssh, powershell_remote, manual_package
  agentVersion: text("agent_version").notNull(),
  agentPackageUrl: text("agent_package_url").notNull(),
  // Target Configuration
  targets: jsonb("targets").$type(),
  // Deployment Configuration
  deploymentConfig: jsonb("deployment_config").$type(),
  // Credentials and Infrastructure
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  satelliteServerId: integer("satellite_server_id").references(() => discoveryProbes.id),
  // Scheduling
  scheduledAt: timestamp("scheduled_at"),
  executionMode: text("execution_mode").notNull().default("immediate"),
  // immediate, scheduled, business_hours
  businessHoursOnly: boolean("business_hours_only").default(false),
  maxConcurrentDeployments: integer("max_concurrent_deployments").default(10),
  // Status and Progress
  status: text("status").notNull().default("pending"),
  // pending, in_progress, completed, failed, cancelled, partially_completed
  progress: jsonb("progress").$type(),
  // Results and Logs
  results: jsonb("results").$type(),
  errorLogs: jsonb("error_logs").$type(),
  // Metadata
  createdBy: integer("created_by").notNull().references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastHeartbeat: timestamp("last_heartbeat"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var agentDeploymentTasks = pgTable("agent_deployment_tasks", {
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
var assetExternalMappings = pgTable("asset_external_mappings", {
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
var integrationRules = pgTable("integration_rules", {
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
  accessLogs: many(credentialAccessLogs)
}));
var credentialAccessLogsRelations = relations(credentialAccessLogs, ({ one }) => ({
  credential: one(credentialEntries, {
    fields: [credentialAccessLogs.credentialId],
    references: [credentialEntries.id]
  }),
  profile: one(credentialProfiles, {
    fields: [credentialAccessLogs.profileId],
    references: [credentialProfiles.id]
  }),
  user: one(users, {
    fields: [credentialAccessLogs.userId],
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
var insertCredentialAccessLogSchema = createInsertSchema(credentialAccessLogs).omit({
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
var assetCustomFields = pgTable("asset_custom_fields", {
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
var assetTableViews = pgTable("asset_table_views", {
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
var assetInventory = pgTable("asset_inventory", {
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
var assetAuditLogs = pgTable("asset_audit_logs", {
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
  async createUser(insertUser) {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }
  async updateUserPreferences(id, preferences) {
    const [user] = await db.update(users).set({ preferences, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
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
  // ===== ASSET AUDIT LOGS METHODS =====
  async getAssetAuditLogs(assetId) {
    return await db.select().from(assetAuditLogs).where(eq(assetAuditLogs.assetId, assetId)).orderBy(desc(assetAuditLogs.timestamp));
  }
  async createAssetAuditLog(log2) {
    const [newLog] = await db.insert(assetAuditLogs).values(log2).returning();
    return newLog;
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
      throw new Error(`Failed to generate script: ${error.message}`);
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
      throw new Error(`Failed to analyze script: ${error.message}`);
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
      throw new Error(`Failed to optimize script: ${error.message}`);
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
      throw new Error(`Failed to generate documentation: ${error.message}`);
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
      throw new Error(`Failed to generate improvement suggestions: ${error.message}`);
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
      throw new Error(`Network topology analysis failed: ${error.message}`);
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
      throw new Error(`Intelligent discovery plan generation failed: ${error.message}`);
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
      throw new Error(`Agent deployment optimization failed: ${error.message}`);
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
      throw new Error(`Agent performance analysis failed: ${error.message}`);
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
      throw new Error(`Network anomaly detection failed: ${error.message}`);
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
      throw new Error(`Compliance report generation failed: ${error.message}`);
    }
  }
};

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
  app2.get("/api/users", async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.patch("/api/users/:id/preferences", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const preferences = req.body;
      const user = await storage.updateUserPreferences(id, preferences);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid preferences data" });
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
  app2.get("/api/discovery-jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllDiscoveryJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discovery jobs" });
    }
  });
  app2.get("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getDiscoveryJob(id);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discovery job" });
    }
  });
  app2.post("/api/discovery-jobs", async (req, res) => {
    try {
      const jobData = insertDiscoveryJobSchema.parse(req.body);
      const job = await storage.createDiscoveryJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid discovery job data" });
    }
  });
  app2.patch("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const jobData = req.body;
      const job = await storage.updateDiscoveryJob(id, jobData);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid discovery job data" });
    }
  });
  app2.delete("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDiscoveryJob(id);
      if (!success) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete discovery job" });
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
      const assets = await storage.getAllAssetInventory();
      res.json(assets);
    } catch (error) {
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
      res.status(201).json(asset);
    } catch (error) {
      res.status(400).json({ message: "Invalid asset data" });
    }
  });
  app2.put("/api/assets/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assetData = insertAssetInventorySchema.parse(req.body);
      const asset = await storage.updateAssetInventory(id, assetData);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(400).json({ message: "Invalid asset data" });
    }
  });
  app2.delete("/api/assets/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssetInventory(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });
  app2.get("/api/assets/custom-fields", async (req, res) => {
    try {
      const fields = await storage.getAllAssetCustomFields();
      res.json(fields);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom fields" });
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
      const views = await storage.getAllAssetTableViews();
      res.json(views);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch table views" });
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
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  app2.post("/api/assets/audit-logs", async (req, res) => {
    try {
      const logData = insertAssetAuditLogSchema.parse(req.body);
      const log2 = await storage.createAssetAuditLog(logData);
      res.status(201).json(log2);
    } catch (error) {
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
  app2.post("/api/ai/scripts/generate", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const request = req.body;
      const result = await AIScriptService.generateScript(request);
      res.json(result);
    } catch (error) {
      console.error("AI Script Generation Error:", error);
      res.status(500).json({ message: "Failed to generate script with AI" });
    }
  });
  app2.post("/api/ai/scripts/analyze", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const { scriptCode, scriptType } = req.body;
      const analysis = await AIScriptService.analyzeScript(scriptCode, scriptType);
      res.json(analysis);
    } catch (error) {
      console.error("AI Script Analysis Error:", error);
      res.status(500).json({ message: "Failed to analyze script with AI" });
    }
  });
  app2.post("/api/ai/scripts/optimize", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }
      const { scriptCode, scriptType } = req.body;
      const optimization = await AIScriptService.optimizeScript(scriptCode, scriptType);
      res.json(optimization);
    } catch (error) {
      console.error("AI Script Optimization Error:", error);
      res.status(500).json({ message: "Failed to optimize script with AI" });
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
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const jobs = await storage.getAgentDeploymentJobs(domainId, tenantId);
      res.json(jobs);
    } catch (error) {
      console.error("Failed to fetch agent deployment jobs:", error);
      res.status(500).json({ message: "Failed to fetch agent deployment jobs" });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getAgentDeploymentJobById(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Failed to fetch agent deployment job:", error);
      res.status(500).json({ message: "Failed to fetch agent deployment job" });
    }
  });
  app2.post("/api/agent-deployment-jobs", async (req, res) => {
    try {
      const jobData = insertAgentDeploymentJobSchema.parse(req.body);
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
        metadata: { targetOs: job.targetOs, deploymentMethod: job.deploymentMethod },
        userId: job.createdBy
      });
      res.status(201).json(job);
    } catch (error) {
      console.error("Failed to create agent deployment job:", error);
      res.status(400).json({ message: "Invalid agent deployment job data" });
    }
  });
  app2.post("/api/agent-deployment-jobs/:id/start", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
        metadata: { status: job.status },
        userId: req.body.userId || job.createdBy
      });
      res.json(job);
    } catch (error) {
      console.error("Failed to start agent deployment job:", error);
      res.status(500).json({ message: "Failed to start agent deployment job" });
    }
  });
  app2.post("/api/agent-deployment-jobs/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
        metadata: { status: job.status },
        userId: req.body.userId || job.createdBy
      });
      res.json(job);
    } catch (error) {
      console.error("Failed to cancel agent deployment job:", error);
      res.status(500).json({ message: "Failed to cancel agent deployment job" });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id/tasks", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const tasks = await storage.getAgentDeploymentTasks(jobId);
      res.json(tasks);
    } catch (error) {
      console.error("Failed to fetch deployment tasks:", error);
      res.status(500).json({ message: "Failed to fetch deployment tasks" });
    }
  });
  app2.post("/api/agent-deployment-tasks/:id/retry", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.retryAgentDeploymentTask(id);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Failed to retry deployment task:", error);
      res.status(500).json({ message: "Failed to retry deployment task" });
    }
  });
  app2.post("/api/agent-deployment-tasks/:id/repair", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.repairAgentInstallation(id);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Failed to repair agent installation:", error);
      res.status(500).json({ message: "Failed to repair agent installation" });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id/status", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const status = await storage.getDeploymentStatusSummary(jobId);
      if (!status) {
        return res.status(404).json({ message: "Deployment job not found" });
      }
      res.json(status);
    } catch (error) {
      console.error("Failed to fetch deployment status:", error);
      res.status(500).json({ message: "Failed to fetch deployment status" });
    }
  });
  app2.get("/api/agent-deployment-jobs/:id/errors", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const errors = await storage.getDeploymentErrorLogs(jobId);
      res.json(errors);
    } catch (error) {
      console.error("Failed to fetch deployment errors:", error);
      res.status(500).json({ message: "Failed to fetch deployment errors" });
    }
  });
  app2.put("/api/agent-deployment-jobs/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const progressData = req.body;
      const job = await storage.updateDeploymentProgress(id, progressData);
      if (!job) {
        return res.status(404).json({ message: "Deployment job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Failed to update deployment progress:", error);
      res.status(500).json({ message: "Failed to update deployment progress" });
    }
  });
  app2.get("/api/agent-deployment-stats", async (req, res) => {
    try {
      const domainId = req.query.domainId ? parseInt(req.query.domainId) : void 0;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId) : void 0;
      const stats = await storage.getAgentDeploymentStats(domainId, tenantId);
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch deployment statistics:", error);
      res.status(500).json({ message: "Failed to fetch deployment statistics" });
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
