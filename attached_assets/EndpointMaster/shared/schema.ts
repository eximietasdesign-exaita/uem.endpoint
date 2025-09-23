import { pgTable, text, integer, boolean, timestamp, jsonb, real, uuid, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Domains table for multi-domain support
export const domains = pgTable("uem_app_domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  parentDomainId: integer("parent_domain_id").references(() => domains.id),
  type: text("type").notNull().default("standard"), // root, standard, subdomain
  status: text("status").notNull().default("active"), // active, inactive, suspended
  settings: jsonb("settings").$type<{
    allowSubdomains: boolean;
    maxTenants: number;
    customBranding: boolean;
    dataRetentionDays: number;
    features: string[];
  }>(),
  branding: jsonb("branding").$type<{
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
    companyName: string;
  }>(),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenants table for multi-tenant support
export const tenants = pgTable("uem_app_tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  domainId: integer("domain_id").notNull().references(() => domains.id),
  type: text("type").notNull().default("standard"), // enterprise, standard, trial
  status: text("status").notNull().default("active"), // active, inactive, suspended, trial_expired
  settings: jsonb("settings").$type<{
    maxUsers: number;
    maxEndpoints: number;
    dataIsolation: "strict" | "shared";
    allowGlobalPublishing: boolean;
    features: string[];
  }>(),
  subscriptionPlan: text("subscription_plan").default("standard"), // trial, standard, premium, enterprise
  subscriptionExpiry: timestamp("subscription_expiry"),
  dataQuota: integer("data_quota_gb").default(10), // in GB
  usedQuota: integer("used_quota_gb").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Domain Relations
export const domainRelations = relations(domains, ({ one, many }) => ({
  parentDomain: one(domains, {
    fields: [domains.parentDomainId],
    references: [domains.id],
  }),
  subdomains: many(domains),
  tenants: many(tenants),
}));

// Tenant Relations
export const tenantRelations = relations(tenants, ({ one, many }) => ({
  domain: one(domains, {
    fields: [tenants.domainId],
    references: [domains.id],
  }),
  users: many(users),
}));

// Users table for authentication and authorization
export const users = pgTable("uem_app_users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("viewer"), // administrator, operator, viewer
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  globalRole: text("global_role"), // super_admin, domain_admin, tenant_admin
  firstName: text("first_name"),
  lastName: text("last_name"),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").$type<{
    canManageDomains: boolean;
    canManageTenants: boolean;
    canPublishGlobal: boolean;
    canAccessSubdomains: boolean;
    allowedFeatures: string[];
  }>(),
  preferences: jsonb("preferences").$type<{
    theme: "light" | "dark";
    language: "en" | "es" | "fr" | "de";
    notifications: boolean;
    defaultDomain?: number;
    defaultTenant?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Credential Profiles table for Enterprise-Grade Credential Management
export const credentialProfiles = pgTable("uem_app_credential_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"), // general, system, network, cloud, database, security
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"), // global, domain, tenant
  
  // Enhanced security and compliance
  encryptionLevel: text("encryption_level").notNull().default("aes256"), // aes256, rsa2048, ecc
  complianceLevel: text("compliance_level").notNull().default("standard"), // standard, sox, pci, hipaa, iso27001
  accessLevel: text("access_level").notNull().default("standard"), // restricted, standard, elevated, administrative
  
  // Vault Integration
  vaultProvider: text("vault_provider").default("internal"), // internal, hashicorp, azure, aws, cyberark
  vaultPath: text("vault_path"),
  vaultNamespace: text("vault_namespace"),
  vaultRole: text("vault_role"),
  
  // Local Storage Configuration
  storageType: text("storage_type").notNull().default("encrypted"), // encrypted, vault, hybrid
  localEncryption: boolean("local_encryption").default(true),
  
  // Security and Audit
  rotationPolicy: jsonb("rotation_policy").$type<{
    enabled: boolean;
    intervalDays: number;
    autoRotate: boolean;
    notifyBefore: number;
    backupPrevious: boolean;
  }>(),
  
  // Access Control
  accessRestrictions: jsonb("access_restrictions").$type<{
    ipWhitelist: string[];
    timeRestrictions: {
      allowedHours: string;
      timezone: string;
    };
    maxConcurrentUsers: number;
    requireApproval: boolean;
    approvers: string[];
  }>(),
  
  // Monitoring and Compliance
  auditLevel: text("audit_level").notNull().default("standard"), // minimal, standard, detailed, full
  monitoringEnabled: boolean("monitoring_enabled").default(true),
  alertingEnabled: boolean("alerting_enabled").default(false),
  
  // Enhanced Metadata
  tags: jsonb("tags").$type<string[]>().default([]),
  environments: jsonb("environments").$type<string[]>().default([]), // production, staging, development, test
  
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
  credentialsLegacy: jsonb("credentials").$type<any[]>(),
});

// Individual Credentials within Profiles (Enterprise Credential Vault)
export const credentialEntries = pgTable("uem_app_credential_entries", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => credentialProfiles.id, { onDelete: 'cascade' }),
  
  // Credential Identity
  name: text("name").notNull(),
  type: text("type").notNull(), // ssh, rdp, winrm, snmp, api_key, certificate, token, database, cloud, service_account
  subType: text("sub_type"), // ssh_key, ssh_password, certificate_p12, oauth2, service_principal
  
  // Connection Details
  hostname: text("hostname"),
  port: integer("port"),
  protocol: text("protocol"), // ssh, rdp, https, tcp, udp
  
  // Authentication Data (encrypted)
  username: text("username"),
  passwordEncrypted: text("password_encrypted"), // Encrypted password/secret
  domainName: text("domain_name"),
  
  // Advanced Authentication
  privateKeyEncrypted: text("private_key_encrypted"), // Encrypted private keys
  certificateEncrypted: text("certificate_encrypted"), // Encrypted certificates
  tokenEncrypted: text("token_encrypted"), // Encrypted API tokens
  
  // Vault References
  vaultSecretPath: text("vault_secret_path"), // Path to secret in external vault
  vaultSecretKey: text("vault_secret_key"), // Key within the secret
  vaultVersion: integer("vault_version"), // Version for vault rotation
  
  // Metadata and Configuration
  connectionString: text("connection_string"), // For databases, APIs
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default({}),
  
  // Security and Compliance
  encryptionAlgorithm: text("encryption_algorithm").default("AES-256-GCM"),
  keyDerivationFunction: text("key_derivation_function").default("PBKDF2"),
  saltValue: text("salt_value"), // For encryption salt
  
  // Access Control
  accessLevel: text("access_level").notNull().default("standard"), // restricted, standard, elevated, administrative
  
  // Lifecycle Management
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  lastValidated: timestamp("last_validated"),
  validationStatus: text("validation_status").default("unknown"), // valid, invalid, expired, unknown
  
  // Usage Tracking
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  
  // Audit
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Credential Access Logs for Audit Trail
export const credentialAccessLogs = pgTable("uem_app_credential_access_logs", {
  id: serial("id").primaryKey(),
  credentialId: integer("credential_id").references(() => credentialEntries.id, { onDelete: 'cascade' }),
  profileId: integer("profile_id").references(() => credentialProfiles.id),
  userId: integer("user_id").references(() => users.id),
  
  // Access Details
  accessType: text("access_type").notNull(), // view, use, modify, rotate, delete
  accessMethod: text("access_method"), // ui, api, script, automation
  sourceIp: text("source_ip"),
  userAgent: text("user_agent"),
  
  // Context
  purpose: text("purpose"), // discovery, deployment, maintenance, audit
  targetSystem: text("target_system"),
  sessionId: text("session_id"),
  
  // Results
  accessGranted: boolean("access_granted").notNull(),
  failureReason: text("failure_reason"),
  
  // Timestamps
  accessedAt: timestamp("accessed_at").defaultNow(),
  sessionDuration: integer("session_duration_seconds"),
});

// Discovery Probes table
export const discoveryProbes = pgTable("uem_app_discovery_probes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"), // global, domain, tenant
  ipAddress: text("ip_address").notNull(),
  port: integer("port").default(443),
  status: text("status").notNull().default("offline"), // online, offline, warning, maintenance
  version: text("version"),
  capabilities: jsonb("capabilities").$type<string[]>(),
  lastHeartbeat: timestamp("last_heartbeat"),
  cpuUsage: real("cpu_usage").default(0),
  memoryUsage: real("memory_usage").default(0),
  diskUsage: real("disk_usage").default(0),
  jobsInQueue: integer("jobs_in_queue").default(0),
  totalJobsExecuted: integer("total_jobs_executed").default(0),
  environment: text("environment").default("production"), // production, staging, development
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Standard Script Templates table for enterprise-grade discovery scripts
export const standardScriptTemplates = pgTable("uem_app_standard_script_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // discovery, health_check, maintenance, security, inventory, compliance
  type: text("type").notNull(), // powershell, bash, python, wmi, registry, snmp
  targetOs: text("target_os").notNull(), // windows, linux, macos, any
  template: text("template").notNull(), // Script template with placeholders
  
  // Standard metadata
  vendor: text("vendor").default("internal"), // internal, microsoft, redhat, canonical
  complexity: text("complexity").default("basic"), // basic, intermediate, advanced, expert
  estimatedRunTime: integer("estimated_run_time_seconds").default(30),
  requiresElevation: boolean("requires_elevation").default(false),
  requiresNetwork: boolean("requires_network").default(false),
  
  // Parameters and configuration
  parameters: jsonb("parameters").$type<Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    defaultValue?: any;
    validation?: string;
  }>>(),
  
  // Output processing configuration
  outputFormat: text("output_format").default("text"), // text, json, xml, csv
  outputProcessing: jsonb("output_processing").$type<{
    parser: string;
    rules: Array<{
      type: string;
      pattern: string;
      field: string;
      dataType: string;
    }>;
    postProcessing?: Array<{
      action: string;
      condition: string;
      value: string;
    }>;
  }>(),
  
  // Credential requirements
  credentialRequirements: jsonb("credential_requirements").$type<{
    required: boolean;
    types: string[]; // ssh, rdp, winrm, snmp, api_key
    minimumPrivileges: string;
    description: string;
  }>(),
  
  // Standard tags and classification
  tags: jsonb("tags").$type<string[]>().default([]),
  industries: jsonb("industries").$type<string[]>().default([]), // healthcare, finance, retail, manufacturing
  complianceFrameworks: jsonb("compliance_frameworks").$type<string[]>().default([]), // sox, pci, hipaa, iso27001
  
  // Versioning and lifecycle
  version: text("version").default("1.0.0"),
  isStandard: boolean("is_standard").default(true),
  isActive: boolean("is_active").default(true),
  deprecatedAt: timestamp("deprecated_at"),
  
  // Usage analytics
  usageCount: integer("usage_count").default(0),
  avgExecutionTime: real("avg_execution_time").default(0),
  successRate: real("success_rate").default(100.0),
  
  // Audit trail
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scripts table (enhanced)
export const scripts = pgTable("uem_app_scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // discovery, health_check, maintenance, security
  type: text("type").notNull(), // powershell, bash, python, wmi
  targetOs: text("target_os").notNull(), // windows, linux, macos, any
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"), // global, domain, tenant
  publishStatus: text("publish_status").notNull().default("private"), // private, domain, global
  content: text("content").notNull(),
  
  // Standard template reference
  standardTemplateId: integer("standard_template_id").references(() => standardScriptTemplates.id),
  isFromTemplate: boolean("is_from_template").default(false),
  templateVersion: text("template_version"),
  
  // Script orchestrator integration
  orchestratorProfileId: integer("orchestrator_profile_id").references(() => scriptOrchestratorProfiles.id),
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  
  parameters: jsonb("parameters").$type<Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    defaultValue?: any;
  }>>(),
  outputProcessing: jsonb("output_processing").$type<{
    rules: Array<{
      type: string;
      pattern: string;
      field: string;
    }>;
  }>(),
  tags: jsonb("tags").$type<string[]>(),
  version: text("version").default("1.0.0"),
  author: text("author"),
  isActive: boolean("is_active").default(true),
  isFavorite: boolean("is_favorite").default(false),
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Policies table
export const policies = pgTable("uem_app_policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // operating_system, network, security, compliance
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"), // global, domain, tenant
  publishScope: text("publish_scope").notNull().default("private"), // private, domain, global
  availableScripts: jsonb("available_scripts").$type<string[]>(),
  executionFlow: jsonb("execution_flow").$type<Array<{
    stepNumber: number;
    scriptId: number;
    stepName: string;
    runCondition: string;
    onSuccess: string;
    onFailure: string;
  }>>(),
  publishStatus: text("publish_status").default("draft"), // draft, published, maintenance, inactive
  isActive: boolean("is_active").default(true),
  version: text("version").default("1.0.0"),
  targetOs: text("target_os").notNull(),
  executionOrder: integer("execution_order").default(0),
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Script Orchestrator Profiles table
export const scriptOrchestratorProfiles = pgTable("uem_app_script_orchestrator_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Profile configuration
  category: text("category").notNull().default("general"), // general, discovery, compliance, maintenance
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"), // global, domain, tenant
  
  // Credential vault integration - direct FK to credential profile
  defaultCredentialProfileId: integer("default_credential_profile_id").references(() => credentialProfiles.id),
  
  // Credential vault configuration
  credentialVaultConfig: jsonb("credential_vault_config").$type<{
    vaultProvider: string; // internal, hashicorp, azure, aws, cyberark
    vaultUrl?: string;
    namespace?: string;
    authMethod: string;
    credentialProfiles: number[]; // linked credential profile IDs
    defaultProfile?: number;
  }>(),
  
  // Script execution configuration
  executionConfig: jsonb("execution_config").$type<{
    parallelExecution: boolean;
    maxConcurrency: number;
    timeout: number;
    retryPolicy: {
      enabled: boolean;
      maxRetries: number;
      retryDelay: number;
    };
    errorHandling: {
      continueOnError: boolean;
      notifyOnFailure: boolean;
      rollbackOnFailure: boolean;
    };
  }>(),
  
  // Linked scripts and policies
  linkedScripts: jsonb("linked_scripts").$type<number[]>().default([]),
  linkedPolicies: jsonb("linked_policies").$type<number[]>().default([]),
  
  // Orchestrator metadata
  version: text("version").default("1.0.0"),
  isActive: boolean("is_active").default(true),
  executionCount: integer("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent Status Reports table
export const agentStatusReports = pgTable("uem_app_agent_status_reports", {
  id: serial("id").primaryKey(),
  agentId: text("agent_id").notNull().unique(), // Unique constraint for upsert functionality
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  
  // Agent identification
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  agentVersion: text("agent_version"),
  operatingSystem: text("operating_system"),
  osVersion: text("os_version"),
  
  // Status information
  status: text("status").notNull().default("unknown"), // online, offline, error, maintenance, updating
  statusMessage: text("status_message"),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow(),
  lastSuccessfulContact: timestamp("last_successful_contact"),
  
  // System metrics
  systemMetrics: jsonb("system_metrics").$type<{
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    uptime: number;
    processCount: number;
    threadCount: number;
    handleCount?: number; // Windows specific
  }>(),
  
  // Agent capabilities and configuration
  capabilities: jsonb("capabilities").$type<{
    supportedScriptTypes: string[];
    maxConcurrentJobs: number;
    supportsRemoteExecution: boolean;
    supportsFileTransfer: boolean;
    supportedProtocols: string[];
  }>(),
  
  // Execution status
  currentJobs: jsonb("current_jobs").$type<Array<{
    jobId: string;
    scriptId: number;
    status: string;
    startTime: string;
    progress?: number;
  }>>().default([]),
  
  queuedJobs: integer("queued_jobs").default(0),
  completedJobs: integer("completed_jobs").default(0),
  failedJobs: integer("failed_jobs").default(0),
  
  // Configuration and settings
  configuration: jsonb("configuration").$type<{
    logLevel: string;
    enableRemoteUpdates: boolean;
    heartbeatInterval: number;
    maxLogSize: number;
    credentialCaching: boolean;
  }>(),
  
  // Health and diagnostics
  healthScore: real("health_score").default(100.0),
  diagnostics: jsonb("diagnostics").$type<{
    errors: Array<{
      timestamp: string;
      severity: string;
      message: string;
      component: string;
    }>;
    warnings: Array<{
      timestamp: string;
      message: string;
      component: string;
    }>;
    performance: {
      avgResponseTime: number;
      errorRate: number;
      successRate: number;
    };
  }>(),
  
  // External system integration
  externalSystemId: text("external_system_id"),
  customAttributes: jsonb("custom_attributes").$type<Record<string, any>>().default({}),
  
  // Audit and lifecycle
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent Deployment Jobs table (for tracking agent deployments)
export const agentDeploymentJobs = pgTable("uem_app_agent_deployment_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Job configuration
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed, cancelled
  
  // Deployment targets
  deploymentTargets: jsonb("deployment_targets").$type<Array<{
    hostname: string;
    ipAddress: string;
    operatingSystem: string;
    credentialProfileId: number;
    deploymentMethod: string; // ssh, rdp, winrm, psexec
  }>>(),
  
  // Deployment configuration
  agentConfiguration: jsonb("agent_configuration").$type<{
    version: string;
    installPath: string;
    serviceAccount: string;
    enableAutoUpdates: boolean;
    logLevel: string;
    features: string[];
  }>(),
  
  // Progress tracking
  totalTargets: integer("total_targets").default(0),
  completedTargets: integer("completed_targets").default(0),
  failedTargets: integer("failed_targets").default(0),
  progress: real("progress").default(0.0),
  
  // Results and reporting
  deploymentResults: jsonb("deployment_results").$type<Array<{
    hostname: string;
    ipAddress: string;
    status: string;
    agentId?: string;
    error?: string;
    deployedAt?: string;
  }>>(),
  
  // Job lifecycle
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  scheduledFor: timestamp("scheduled_for"),
  
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Endpoints/Assets table
export const endpoints = pgTable("uem_app_endpoints", {
  id: serial("id").primaryKey(),
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  macAddress: text("mac_address"),
  operatingSystem: text("operating_system"),
  osVersion: text("os_version"),
  domain: text("domain"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  publishScope: text("publish_scope").notNull().default("tenant"), // tenant, domain, global
  assetType: text("asset_type").notNull(), // server, workstation, laptop, mobile, iot
  status: text("status").notNull().default("unknown"), // online, offline, warning, critical
  discoveryMethod: text("discovery_method"), // agentless_scan, agent_deployment, manual
  lastSeen: timestamp("last_seen"),
  complianceScore: real("compliance_score").default(0),
  vulnerabilityCount: integer("vulnerability_count").default(0),
  criticalVulnerabilities: integer("critical_vulnerabilities").default(0),
  systemInfo: jsonb("system_info").$type<{
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    processor?: string;
    memory?: string;
    storage?: string;
    networkAdapters?: Array<{
      name: string;
      type: string;
      speed: string;
    }>;
  }>(),
  installedSoftware: jsonb("installed_software").$type<Array<{
    name: string;
    version: string;
    vendor: string;
    installDate?: string;
  }>>(),
  vulnerabilities: jsonb("vulnerabilities").$type<Array<{
    cveId: string;
    severity: string;
    description: string;
    publishedDate: string;
    solution?: string;
  }>>(),
  networkPorts: jsonb("network_ports").$type<Array<{
    port: number;
    protocol: string;
    service: string;
    state: string;
  }>>(),
  agentId: text("agent_id"),
  probeId: integer("probe_id").references(() => discoveryProbes.id),
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  discoveryJobId: integer("discovery_job_id"),
  externalId: text("external_id"), // For mapping to external systems
  externalSystemId: text("external_system_id"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discovery Jobs table (Agentless)
export const discoveryJobs = pgTable("uem_app_discovery_jobs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // agentless, agent_based
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed, cancelled
  targets: jsonb("targets").$type<{
    ipRanges?: string[];
    hostnames?: string[];
    ouPaths?: string[];
    ipSegments?: string[];
  }>(),
  discoveryProfiles: jsonb("discovery_profiles").$type<string[]>(),
  schedule: jsonb("schedule").$type<{
    type: string; // now, scheduled, recurring
    startTime?: string;
    frequency?: string; // daily, weekly, monthly
    businessHours?: boolean;
  }>(),
  progress: jsonb("progress").$type<{
    total: number;
    discovered: number;
    failed: number;
    inProgress: number;
  }>(),
  results: jsonb("results").$type<{
    totalAssets: number;
    newAssets: number;
    updatedAssets: number;
    errors: Array<{
      target: string;
      error: string;
      timestamp: string;
    }>;
  }>(),
  probeId: integer("probe_id").references(() => discoveryProbes.id),
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  createdBy: integer("created_by").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent-Based Discovery Deployments table
export const agentDeployments = pgTable("uem_app_agent_deployments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  policyIds: jsonb("policy_ids").$type<number[]>(),
  targets: jsonb("targets").$type<{
    ipRanges?: string[];
    hostnames?: string[];
    ouPaths?: string[];
    ipSegments?: string[];
  }>(),
  deploymentMethod: text("deployment_method").notNull(), // group_policy, sccm, manual, powershell_remote
  schedule: jsonb("schedule").$type<{
    type: string;
    startTime?: string;
    frequency?: string;
    businessHours?: boolean;
  }>(),
  status: text("status").notNull().default("pending"),
  progress: jsonb("progress").$type<{
    total: number;
    applied: number;
    inProgress: number;
    pending: number;
    failed: number;
  }>(),
  results: jsonb("results").$type<{
    successfulDeployments: number;
    failedDeployments: number;
    errors: Array<{
      endpoint: string;
      error: string;
      timestamp: string;
    }>;
  }>(),
  probeId: integer("probe_id").references(() => discoveryProbes.id),
  credentialProfileId: integer("credential_profile_id").references(() => credentialProfiles.id),
  createdBy: integer("created_by").references(() => users.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agents table
export const agents = pgTable("uem_app_agents", {
  id: text("id").primaryKey(), // UUID
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  operatingSystem: text("operating_system").notNull(),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  version: text("version").notNull(),
  status: text("status").notNull().default("offline"), // online, offline, error, updating
  lastHeartbeat: timestamp("last_heartbeat"),
  capabilities: jsonb("capabilities").$type<string[]>(),
  systemInfo: jsonb("system_info").$type<{
    manufacturer?: string;
    model?: string;
    processor?: string;
    memory?: string;
    storage?: string;
    serialNumber?: string;
  }>(),
  deploymentMethod: text("deployment_method"),
  deploymentId: integer("deployment_id").references(() => agentDeployments.id),
  endpointId: integer("endpoint_id").references(() => endpoints.id),
  installedAt: timestamp("installed_at"),
  appliedPolicies: jsonb("applied_policies").$type<Array<{
    policyId: number;
    appliedAt: string;
    status: string;
    results?: any;
  }>>(),
  discoveryResults: jsonb("discovery_results").$type<{
    assetsDiscovered: number;
    lastDiscovery: string;
    errors: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity Logs table
export const activityLogs = pgTable("uem_app_activity_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // discovery, deployment, script_execution, policy_execution, system
  category: text("category").notNull(), // info, warning, error, success
  title: text("title").notNull(),
  description: text("description"),
  entityType: text("entity_type"), // endpoint, agent, job, policy, script
  entityId: text("entity_id"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  metadata: jsonb("metadata").$type<{
    [key: string]: any;
  }>(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Status table
export const systemStatus = pgTable("uem_app_system_status", {
  id: serial("id").primaryKey(),
  service: text("service").notNull().unique(), // discovery_service, agent_service, database, api
  status: text("status").notNull().default("healthy"), // healthy, warning, critical, maintenance
  uptime: integer("uptime").default(0), // in seconds
  lastCheck: timestamp("last_check").defaultNow(),
  metrics: jsonb("metrics").$type<{
    cpu?: number;
    memory?: number;
    disk?: number;
    responseTime?: number;
    errorRate?: number;
  }>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard Statistics table
export const dashboardStats = pgTable("uem_app_dashboard_stats", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

// External Systems table for bidirectional integration
export const externalSystems = pgTable("uem_app_external_systems", {
  id: text("id").primaryKey(), // UUID or system-specific ID
  name: text("name").notNull(),
  description: text("description"),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  scope: text("scope").notNull().default("tenant"), // global, domain, tenant
  baseUrl: text("base_url").notNull(),
  authType: text("auth_type").notNull(), // bearer, api-key, basic
  apiKey: text("api_key").notNull(),
  enabled: boolean("enabled").default(true),
  syncDirection: text("sync_direction").notNull(), // inbound, outbound, bidirectional
  webhookUrl: text("webhook_url"),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  retryAttempts: integer("retry_attempts").default(3),
  timeoutMs: integer("timeout_ms").default(30000),
  lastSyncTime: timestamp("last_sync_time"),
  totalSyncCount: integer("total_sync_count").default(0),
  failureCount: integer("failure_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration Logs table for tracking all integration activities
export const integrationLogs = pgTable("uem_app_integration_logs", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => endpoints.id),
  systemId: text("system_id").references(() => externalSystems.id),
  action: text("action").notNull(), // create, update, delete, status_change, discovery, scan_complete
  direction: text("direction").notNull(), // inbound, outbound
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  requestPayload: text("request_payload"), // JSON string
  responsePayload: text("response_payload"), // JSON string
  processingTimeMs: integer("processing_time_ms"),
  timestamp: timestamp("timestamp").defaultNow(),
});


// Agent Deployment Tasks table for tracking individual deployment attempts
export const agentDeploymentTasks = pgTable("uem_app_agent_deployment_tasks", {
  id: serial("id").primaryKey(),
  deploymentJobId: integer("deployment_job_id").notNull().references(() => agentDeploymentJobs.id),
  targetHost: text("target_host").notNull(),
  targetIp: text("target_ip"),
  targetOs: text("target_os").notNull(),
  
  // Task Status
  status: text("status").notNull().default("pending"), // pending, connecting, downloading, installing, configuring, verifying, completed, failed, retrying
  attemptCount: integer("attempt_count").default(0),
  maxRetries: integer("max_retries").default(3),
  
  // Deployment Details
  agentId: text("agent_id"), // Generated after successful deployment
  installedVersion: text("installed_version"),
  installationPath: text("installation_path"),
  serviceStatus: text("service_status"), // running, stopped, disabled, not_installed
  
  // Progress and Timing
  currentStep: text("current_step"), // connecting, pre_check, download, install, configure, register, verify
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastContactAt: timestamp("last_contact_at"),
  
  // Error Handling
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  errorDetails: jsonb("error_details").$type<{
    phase: string;
    originalError: string;
    systemInfo: Record<string, any>;
    networkInfo: Record<string, any>;
    suggestedFix: string;
  }>(),
  
  // Deployment Logs
  deploymentLogs: jsonb("deployment_logs").$type<Array<{
    timestamp: string;
    level: string; // info, warning, error, debug
    message: string;
    step: string;
  }>>(),
  
  // System Information
  systemInfo: jsonb("system_info").$type<{
    hostname: string;
    osVersion: string;
    architecture: string;
    memory: number;
    diskSpace: number;
    cpuCores: number;
    domain: string;
    lastBootTime: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Asset External Mappings table for tracking external system references
export const assetExternalMappings = pgTable("uem_app_asset_external_mappings", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => endpoints.id),
  systemId: text("system_id").references(() => externalSystems.id),
  externalId: text("external_id").notNull(),
  externalData: jsonb("external_data").$type<Record<string, any>>(),
  lastSyncTime: timestamp("last_sync_time"),
  syncStatus: text("sync_status").default("synced"), // synced, pending, failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Integration Rules table for configuring sync behavior
export const integrationRules = pgTable("uem_app_integration_rules", {
  id: serial("id").primaryKey(),
  systemId: text("system_id").references(() => externalSystems.id),
  name: text("name").notNull(),
  description: text("description"),
  trigger: text("trigger").notNull(), // asset_created, asset_updated, asset_deleted, status_changed, discovery_complete
  conditions: jsonb("conditions").$type<{
    assetTypes?: string[];
    discoveryMethods?: string[];
    statusChanges?: string[];
    customFields?: Record<string, any>;
  }>(),
  actions: jsonb("actions").$type<{
    syncToExternal?: boolean;
    transformData?: Record<string, any>;
    customEndpoint?: string;
    includeFields?: string[];
    excludeFields?: string[];
  }>(),
  enabled: boolean("enabled").default(true),
  priority: integer("priority").default(50), // 1-100, higher priority executed first
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Relations with Domain/Tenant Support
export const usersRelations = relations(users, ({ one, many }) => ({
  domain: one(domains, {
    fields: [users.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  credentialProfiles: many(credentialProfiles),
  scripts: many(scripts),
  policies: many(policies),
  discoveryJobs: many(discoveryJobs),
  agentDeployments: many(agentDeployments),
  activityLogs: many(activityLogs),
}));

export const credentialProfilesRelations = relations(credentialProfiles, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [credentialProfiles.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [credentialProfiles.updatedBy],
    references: [users.id],
  }),
  domain: one(domains, {
    fields: [credentialProfiles.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [credentialProfiles.tenantId],
    references: [tenants.id],
  }),
  credentialEntries: many(credentialEntries),
  endpoints: many(endpoints),
  discoveryJobs: many(discoveryJobs),
  agentDeployments: many(agentDeployments),
}));

export const credentialEntriesRelations = relations(credentialEntries, ({ one, many }) => ({
  profile: one(credentialProfiles, {
    fields: [credentialEntries.profileId],
    references: [credentialProfiles.id],
  }),
  createdBy: one(users, {
    fields: [credentialEntries.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [credentialEntries.updatedBy],
    references: [users.id],
  }),
  accessLogs: many(credentialAccessLogs),
}));

export const credentialAccessLogsRelations = relations(credentialAccessLogs, ({ one }) => ({
  credential: one(credentialEntries, {
    fields: [credentialAccessLogs.credentialId],
    references: [credentialEntries.id],
  }),
  profile: one(credentialProfiles, {
    fields: [credentialAccessLogs.profileId],
    references: [credentialProfiles.id],
  }),
  user: one(users, {
    fields: [credentialAccessLogs.userId],
    references: [users.id],
  }),
}));

export const discoveryProbesRelations = relations(discoveryProbes, ({ many }) => ({
  endpoints: many(endpoints),
  discoveryJobs: many(discoveryJobs),
  agentDeployments: many(agentDeployments),
}));

export const scriptsRelations = relations(scripts, ({ one }) => ({
  createdBy: one(users, {
    fields: [scripts.createdBy],
    references: [users.id],
  }),
}));

export const policiesRelations = relations(policies, ({ one }) => ({
  createdBy: one(users, {
    fields: [policies.createdBy],
    references: [users.id],
  }),
}));

export const endpointsRelations = relations(endpoints, ({ one, many }) => ({
  probe: one(discoveryProbes, {
    fields: [endpoints.probeId],
    references: [discoveryProbes.id],
  }),
  credentialProfile: one(credentialProfiles, {
    fields: [endpoints.credentialProfileId],
    references: [credentialProfiles.id],
  }),
  agents: many(agents),
}));

export const discoveryJobsRelations = relations(discoveryJobs, ({ one }) => ({
  probe: one(discoveryProbes, {
    fields: [discoveryJobs.probeId],
    references: [discoveryProbes.id],
  }),
  credentialProfile: one(credentialProfiles, {
    fields: [discoveryJobs.credentialProfileId],
    references: [credentialProfiles.id],
  }),
  createdBy: one(users, {
    fields: [discoveryJobs.createdBy],
    references: [users.id],
  }),
}));

export const agentDeploymentsRelations = relations(agentDeployments, ({ one, many }) => ({
  probe: one(discoveryProbes, {
    fields: [agentDeployments.probeId],
    references: [discoveryProbes.id],
  }),
  credentialProfile: one(credentialProfiles, {
    fields: [agentDeployments.credentialProfileId],
    references: [credentialProfiles.id],
  }),
  createdBy: one(users, {
    fields: [agentDeployments.createdBy],
    references: [users.id],
  }),
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one }) => ({
  deployment: one(agentDeployments, {
    fields: [agents.deploymentId],
    references: [agentDeployments.id],
  }),
  endpoint: one(endpoints, {
    fields: [agents.endpointId],
    references: [endpoints.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const externalSystemsRelations = relations(externalSystems, ({ many }) => ({
  integrationLogs: many(integrationLogs),
  assetMappings: many(assetExternalMappings),
  integrationRules: many(integrationRules),
}));

export const integrationLogsRelations = relations(integrationLogs, ({ one }) => ({
  asset: one(endpoints, {
    fields: [integrationLogs.assetId],
    references: [endpoints.id],
  }),
  system: one(externalSystems, {
    fields: [integrationLogs.systemId],
    references: [externalSystems.id],
  }),
}));

export const assetExternalMappingsRelations = relations(assetExternalMappings, ({ one }) => ({
  asset: one(endpoints, {
    fields: [assetExternalMappings.assetId],
    references: [endpoints.id],
  }),
  system: one(externalSystems, {
    fields: [assetExternalMappings.systemId],
    references: [externalSystems.id],
  }),
}));

export const integrationRulesRelations = relations(integrationRules, ({ one }) => ({
  system: one(externalSystems, {
    fields: [integrationRules.systemId],
    references: [externalSystems.id],
  }),
}));

// Insert schemas for Domain/Tenant
export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCredentialProfileSchema = createInsertSchema(credentialProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCredentialEntrySchema = createInsertSchema(credentialEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCredentialAccessLogSchema = createInsertSchema(credentialAccessLogs).omit({
  id: true,
  accessedAt: true,
});

export const insertDiscoveryProbeSchema = createInsertSchema(discoveryProbes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEndpointSchema = createInsertSchema(endpoints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscoveryJobSchema = createInsertSchema(discoveryJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentDeploymentSchema = createInsertSchema(agentDeployments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemStatusSchema = createInsertSchema(systemStatus).omit({
  id: true,
  updatedAt: true,
});

export const insertDashboardStatsSchema = createInsertSchema(dashboardStats).omit({
  id: true,
  createdAt: true,
});

export const insertExternalSystemSchema = createInsertSchema(externalSystems).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationLogSchema = createInsertSchema(integrationLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAssetExternalMappingSchema = createInsertSchema(assetExternalMappings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationRuleSchema = createInsertSchema(integrationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentDeploymentJobSchema = createInsertSchema(agentDeploymentJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentDeploymentTaskSchema = createInsertSchema(agentDeploymentTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Domain/Tenant Types
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCredentialProfile = z.infer<typeof insertCredentialProfileSchema>;
export type CredentialProfile = typeof credentialProfiles.$inferSelect;
export type InsertCredentialEntry = z.infer<typeof insertCredentialEntrySchema>;
export type CredentialEntry = typeof credentialEntries.$inferSelect;
export type InsertCredentialAccessLog = z.infer<typeof insertCredentialAccessLogSchema>;
export type CredentialAccessLog = typeof credentialAccessLogs.$inferSelect;
export type InsertDiscoveryProbe = z.infer<typeof insertDiscoveryProbeSchema>;
export type DiscoveryProbe = typeof discoveryProbes.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policies.$inferSelect;
// Note: ScriptPolicy is an alias for Policy type
export type InsertEndpoint = z.infer<typeof insertEndpointSchema>;
export type Endpoint = typeof endpoints.$inferSelect;
export type InsertDiscoveryJob = z.infer<typeof insertDiscoveryJobSchema>;
export type DiscoveryJob = typeof discoveryJobs.$inferSelect;
export type InsertAgentDeployment = z.infer<typeof insertAgentDeploymentSchema>;
export type AgentDeployment = typeof agentDeployments.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertSystemStatus = z.infer<typeof insertSystemStatusSchema>;
export type SystemStatus = typeof systemStatus.$inferSelect;
export type InsertDashboardStats = z.infer<typeof insertDashboardStatsSchema>;
export type DashboardStats = typeof dashboardStats.$inferSelect;
export type InsertExternalSystem = z.infer<typeof insertExternalSystemSchema>;
export type ExternalSystem = typeof externalSystems.$inferSelect;
export type InsertIntegrationLog = z.infer<typeof insertIntegrationLogSchema>;
export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertAssetExternalMapping = z.infer<typeof insertAssetExternalMappingSchema>;
export type AssetExternalMapping = typeof assetExternalMappings.$inferSelect;
export type InsertIntegrationRule = z.infer<typeof insertIntegrationRuleSchema>;
export type IntegrationRule = typeof integrationRules.$inferSelect;
export type InsertAgentDeploymentJob = z.infer<typeof insertAgentDeploymentJobSchema>;
export type AgentDeploymentJob = typeof agentDeploymentJobs.$inferSelect;
export type InsertAgentDeploymentTask = z.infer<typeof insertAgentDeploymentTaskSchema>;
export type AgentDeploymentTask = typeof agentDeploymentTasks.$inferSelect;

// Asset Management Extensions
export const assetCustomFields = pgTable("uem_app_asset_custom_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  fieldType: text("field_type").notNull(), // text, number, date, select, multiselect, boolean, currency
  required: boolean("required").default(false),
  defaultValue: text("default_value"),
  options: jsonb("options").$type<string[]>(),
  validation: jsonb("validation").$type<{
    min?: number;
    max?: number;
    pattern?: string;
  }>(),
  category: text("category").notNull().default("basic"), // basic, location, business, technical, financial, compliance
  displayOrder: integer("display_order").default(0),
  description: text("description"),
  placeholder: text("placeholder"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assetTableViews = pgTable("uem_app_asset_table_views", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  columns: jsonb("columns").$type<string[]>().notNull(),
  filters: jsonb("filters").$type<Record<string, any>>().default({}),
  sortBy: text("sort_by").default("name"),
  sortOrder: text("sort_order").default("asc"), // asc, desc
  isDefault: boolean("is_default").default(false),
  permissions: jsonb("permissions").$type<string[]>().default(["read"]),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced endpoints table for comprehensive asset management
export const assetInventory = pgTable("uem_app_asset_inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ipAddress: text("ip_address").notNull(),
  macAddress: text("mac_address"),
  osType: text("os_type"),
  osVersion: text("os_version"),
  status: text("status").notNull().default("active"), // active, inactive, maintenance, decommissioned
  discoveryMethod: text("discovery_method").default("manual"), // agentless, agent, manual
  lastSeen: timestamp("last_seen").defaultNow(),
  location: text("location"),
  category: text("category"),
  criticality: text("criticality").notNull().default("medium"), // critical, high, medium, low
  businessUnit: text("business_unit"),
  project: text("project"),
  reportingManager: text("reporting_manager"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default({}),
  tags: jsonb("tags").$type<string[]>().default([]),
  vulnerabilities: integer("vulnerabilities").default(0),
  complianceScore: integer("compliance_score").default(100),
  assetValue: real("asset_value"),
  purchaseDate: timestamp("purchase_date"),
  warrantyExpiry: timestamp("warranty_expiry"),
  vendor: text("vendor"),
  model: text("model"),
  serialNumber: text("serial_number"),
  // Network Information
  networkInfo: jsonb("network_info").$type<{
    openPorts?: number[];
    services?: Array<{ name: string; port: number; status: string }>;
    dnsRecords?: string[];
  }>(),
  // Hardware Information
  hardwareInfo: jsonb("hardware_info").$type<{
    cpu?: { model: string; cores: number; frequency: string };
    memory?: { total: string; available: string; usage: string };
    storage?: Array<{ drive: string; total: string; free: string; usage: string }>;
  }>(),
  // Security Information
  securityInfo: jsonb("security_info").$type<{
    vulnerabilities?: Array<{ id: string; severity: string; description: string }>;
    patches?: Array<{ id: string; installed: boolean; date: string }>;
    antivirusStatus?: string;
    firewallStatus?: string;
  }>(),
  // Tenant/Domain context
  tenantId: integer("tenant_id").references(() => tenants.id),
  domainId: integer("domain_id").references(() => domains.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const assetAuditLogs = pgTable("uem_app_asset_audit_logs", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").notNull().references(() => assetInventory.id),
  action: text("action").notNull(), // created, updated, deleted, viewed, exported
  details: text("details"),
  userId: integer("user_id"),
  userEmail: text("user_email"),
  timestamp: timestamp("timestamp").defaultNow(),
  changes: jsonb("changes").$type<{
    field: string;
    oldValue: any;
    newValue: any;
  }[]>(),
});

// ===== COMPREHENSIVE SETTINGS MANAGEMENT SYSTEM =====

// Settings Categories for organizing configuration options
export const settingsCategories = pgTable("uem_app_settings_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  icon: text("icon"), // Icon identifier for UI
  parentCategoryId: integer("parent_category_id").references(() => settingsCategories.id),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  isSystem: boolean("is_system").default(false), // System categories cannot be deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Global Settings - System-wide configuration
export const globalSettings = pgTable("uem_app_global_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  category: text("category").notNull().default("system"), // system, security, email, ldap, discovery, agent, notifications, api, ui, backup
  categoryId: integer("category_id").references(() => settingsCategories.id),
  
  // Setting metadata
  displayName: text("display_name").notNull(),
  description: text("description"),
  dataType: text("data_type").notNull().default("string"), // string, number, boolean, json, array, password, email, url
  
  // Validation and constraints
  validationRules: jsonb("validation_rules").$type<{
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string; // regex pattern
    minValue?: number;
    maxValue?: number;
    allowedValues?: any[]; // enum values
    customValidator?: string; // custom validation function name
  }>(),
  
  // UI and display configuration
  uiHints: jsonb("ui_hints").$type<{
    inputType: "text" | "textarea" | "number" | "boolean" | "select" | "multiselect" | "password" | "email" | "url" | "json";
    placeholder?: string;
    helpText?: string;
    group?: string;
    order?: number;
    sensitive?: boolean; // hide value in UI
    readonly?: boolean;
    conditional?: { // show/hide based on other settings
      dependsOn: string;
      showWhen: any;
    };
  }>(),
  
  // Default and inheritance
  defaultValue: jsonb("default_value"),
  isInheritable: boolean("is_inheritable").default(true), // Can domains/tenants override this?
  requiresRestart: boolean("requires_restart").default(false), // Setting change requires system restart
  
  // Security and permissions
  securityLevel: text("security_level").notNull().default("standard"), // public, standard, sensitive, restricted
  accessLevel: text("access_level").notNull().default("admin"), // admin, operator, all
  
  // Audit and tracking
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  lastModifiedAt: timestamp("last_modified_at").defaultNow(),
  version: integer("version").default(1), // For optimistic locking
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Domain Settings - Domain-specific overrides
export const domainSettings = pgTable("uem_app_domain_settings", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id, { onDelete: 'cascade' }),
  settingKey: text("setting_key").notNull(),
  globalSettingId: integer("global_setting_id").references(() => globalSettings.id),
  
  // Override configuration
  value: jsonb("value").notNull(),
  isOverridden: boolean("is_overridden").default(true), // false means inheriting from global
  inheritFromGlobal: boolean("inherit_from_global").default(false),
  
  // Metadata
  overrideReason: text("override_reason"), // Why was this setting overridden?
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenant Settings - Tenant-specific overrides
export const tenantSettings = pgTable("uem_app_tenant_settings", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  settingKey: text("setting_key").notNull(),
  globalSettingId: integer("global_setting_id").references(() => globalSettings.id),
  domainSettingId: integer("domain_setting_id").references(() => domainSettings.id),
  
  // Override configuration
  value: jsonb("value").notNull(),
  isOverridden: boolean("is_overridden").default(true),
  inheritFromDomain: boolean("inherit_from_domain").default(false),
  inheritFromGlobal: boolean("inherit_from_global").default(false),
  
  // Inheritance source tracking
  inheritanceSource: text("inheritance_source").default("global"), // global, domain, tenant
  effectiveValue: jsonb("effective_value"), // Cached computed effective value
  
  // Metadata
  overrideReason: text("override_reason"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Audit trail
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Preferences - User-specific settings and preferences
export const userPreferences = pgTable("uem_app_user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text("category").notNull().default("ui"), // ui, notifications, personal, security, accessibility
  
  // Preference configuration
  key: text("key").notNull(),
  value: jsonb("value").notNull(),
  dataType: text("data_type").notNull().default("string"),
  
  // User customization
  isCustomized: boolean("is_customized").default(true), // false means using default
  useSystemDefault: boolean("use_system_default").default(false),
  
  // Synchronization and sharing
  syncAcrossDevices: boolean("sync_across_devices").default(true),
  isShared: boolean("is_shared").default(false), // Share with team members
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settings Validation Rules - Dynamic validation configuration
export const settingsValidationRules = pgTable("uem_app_settings_validation_rules", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull(),
  globalSettingId: integer("global_setting_id").references(() => globalSettings.id),
  
  // Validation configuration
  ruleName: text("rule_name").notNull(),
  ruleType: text("rule_type").notNull(), // required, pattern, range, custom, dependency
  ruleValue: jsonb("rule_value").notNull(),
  
  // Conditional validation
  condition: jsonb("condition").$type<{
    dependsOn?: string[];
    when?: any;
    unless?: any;
  }>(),
  
  // Error handling
  errorMessage: text("error_message").notNull(),
  severity: text("severity").default("error"), // error, warning, info
  
  // Context and scope
  applicableScope: text("applicable_scope").default("all"), // all, global, domain, tenant
  environmentRestriction: text("environment_restriction"), // production, staging, development
  
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(100), // Lower number = higher priority
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settings Audit Logs - Comprehensive audit trail for all settings changes
export const settingsAuditLogs = pgTable("uem_app_settings_audit_logs", {
  id: serial("id").primaryKey(),
  
  // What was changed
  settingKey: text("setting_key").notNull(),
  settingScope: text("setting_scope").notNull(), // global, domain, tenant, user
  scopeId: integer("scope_id"), // ID of the domain/tenant/user (null for global)
  globalSettingId: integer("global_setting_id").references(() => globalSettings.id),
  
  // Change details
  action: text("action").notNull(), // create, update, delete, reset, import, export
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  changeReason: text("change_reason"),
  
  // Change validation and impact
  validationStatus: text("validation_status").default("passed"), // passed, failed, warning
  validationErrors: jsonb("validation_errors").$type<string[]>(),
  impactAssessment: jsonb("impact_assessment").$type<{
    affectedUsers: number;
    affectedSystems: string[];
    requiresRestart: boolean;
    breakingChange: boolean;
  }>(),
  
  // Context and metadata
  changeSource: text("change_source").default("ui"), // ui, api, import, migration, automation
  clientInfo: jsonb("client_info").$type<{
    userAgent?: string;
    ipAddress?: string;
    sessionId?: string;
    requestId?: string;
  }>(),
  
  // Approval workflow
  requiresApproval: boolean("requires_approval").default(false),
  approvalStatus: text("approval_status").default("auto_approved"), // pending, approved, rejected, auto_approved
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
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings Template Presets - Predefined configuration templates
export const settingsTemplates = pgTable("uem_app_settings_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  
  // Template configuration
  scope: text("scope").notNull().default("global"), // global, domain, tenant
  category: text("category").notNull().default("general"),
  templateType: text("template_type").notNull().default("preset"), // preset, backup, migration
  
  // Template data
  settingsData: jsonb("settings_data").notNull(),
  includedCategories: jsonb("included_categories").$type<string[]>().default([]),
  excludedSettings: jsonb("excluded_settings").$type<string[]>().default([]),
  
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema for custom fields
export const insertAssetCustomFieldSchema = createInsertSchema(assetCustomFields).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetTableViewSchema = createInsertSchema(assetTableViews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetInventorySchema = createInsertSchema(assetInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetAuditLogSchema = createInsertSchema(assetAuditLogs).omit({
  id: true,
  timestamp: true,
});

// ===== SETTINGS MANAGEMENT INSERT SCHEMAS =====
export const insertSettingsCategorySchema = createInsertSchema(settingsCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGlobalSettingSchema = createInsertSchema(globalSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastModifiedAt: true,
  version: true,
});

export const insertDomainSettingSchema = createInsertSchema(domainSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenantSettingSchema = createInsertSchema(tenantSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingsValidationRuleSchema = createInsertSchema(settingsValidationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSettingsAuditLogSchema = createInsertSchema(settingsAuditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsTemplateSchema = createInsertSchema(settingsTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUsed: true,
  usageCount: true,
});

// ===== SETTINGS MANAGEMENT TYPES =====
export type SettingsCategory = typeof settingsCategories.$inferSelect;
export type InsertSettingsCategory = z.infer<typeof insertSettingsCategorySchema>;
export type GlobalSetting = typeof globalSettings.$inferSelect;
export type InsertGlobalSetting = z.infer<typeof insertGlobalSettingSchema>;
export type DomainSetting = typeof domainSettings.$inferSelect;
export type InsertDomainSetting = z.infer<typeof insertDomainSettingSchema>;
export type TenantSetting = typeof tenantSettings.$inferSelect;
export type InsertTenantSetting = z.infer<typeof insertTenantSettingSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type SettingsValidationRule = typeof settingsValidationRules.$inferSelect;
export type InsertSettingsValidationRule = z.infer<typeof insertSettingsValidationRuleSchema>;
export type SettingsAuditLog = typeof settingsAuditLogs.$inferSelect;
export type InsertSettingsAuditLog = z.infer<typeof insertSettingsAuditLogSchema>;
export type SettingsTemplate = typeof settingsTemplates.$inferSelect;
export type InsertSettingsTemplate = z.infer<typeof insertSettingsTemplateSchema>;

// Asset management types
export type InsertAssetCustomField = z.infer<typeof insertAssetCustomFieldSchema>;
export type AssetCustomField = typeof assetCustomFields.$inferSelect;
export type InsertAssetTableView = z.infer<typeof insertAssetTableViewSchema>;
export type AssetTableView = typeof assetTableViews.$inferSelect;
export type InsertAssetInventory = z.infer<typeof insertAssetInventorySchema>;
export type AssetInventory = typeof assetInventory.$inferSelect;
export type InsertAssetAuditLog = z.infer<typeof insertAssetAuditLogSchema>;
export type AssetAuditLog = typeof assetAuditLogs.$inferSelect;

// Asset relations
export const assetInventoryRelations = relations(assetInventory, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [assetInventory.tenantId],
    references: [tenants.id],
  }),
  domain: one(domains, {
    fields: [assetInventory.domainId],
    references: [domains.id],
  }),
  auditLogs: many(assetAuditLogs),
}));

export const assetAuditLogRelations = relations(assetAuditLogs, ({ one }) => ({
  asset: one(assetInventory, {
    fields: [assetAuditLogs.assetId],
    references: [assetInventory.id],
  }),
}));

// Standard Script Templates - Insert Schemas
export const insertStandardScriptTemplateSchema = createInsertSchema(standardScriptTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Script Orchestrator Profiles - Insert Schemas
export const insertScriptOrchestratorProfileSchema = createInsertSchema(scriptOrchestratorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Agent Status Reports - Insert Schemas
export const insertAgentStatusReportSchema = createInsertSchema(agentStatusReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Standard Script Templates Types
export type StandardScriptTemplate = typeof standardScriptTemplates.$inferSelect;
export type InsertStandardScriptTemplate = z.infer<typeof insertStandardScriptTemplateSchema>;

// Script Orchestrator Profiles Types
export type ScriptOrchestratorProfile = typeof scriptOrchestratorProfiles.$inferSelect;
export type InsertScriptOrchestratorProfile = z.infer<typeof insertScriptOrchestratorProfileSchema>;

// Agent Status Reports Types
export type AgentStatusReport = typeof agentStatusReports.$inferSelect;
export type InsertAgentStatusReport = z.infer<typeof insertAgentStatusReportSchema>;

// ===== AI SERVICES SCHEMA MODELS =====

// AI Conversations table for chat history and user interactions
export const aiConversations = pgTable("uem_app_ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  
  // Conversation metadata
  sessionId: text("session_id").notNull(),
  title: text("title"),
  type: text("type").notNull().default("chat"), // chat, troubleshoot, explain, ask
  category: text("category").default("general"), // general, scripts, analysis, deployment, security
  
  // Conversation content
  messages: jsonb("messages").$type<Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>>().default([]),
  
  // AI model and configuration
  aiModel: text("ai_model").default("gpt-4o"),
  modelConfig: jsonb("model_config").$type<{
    temperature: number;
    maxTokens: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  }>(),
  
  // Context and system information
  contextData: jsonb("context_data").$type<Record<string, any>>(),
  systemPrompt: text("system_prompt"),
  
  // Usage and performance
  totalTokensUsed: integer("total_tokens_used").default(0),
  totalCost: real("total_cost").default(0),
  responseTime: integer("response_time_ms"),
  
  // Status and lifecycle
  status: text("status").notNull().default("active"), // active, archived, deleted
  isStarred: boolean("is_starred").default(false),
  
  // Timestamps
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Script Generations table for storing generated and enhanced scripts
export const aiScriptGenerations = pgTable("uem_app_ai_script_generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  conversationId: integer("conversation_id").references(() => aiConversations.id),
  
  // Request details
  requestType: text("request_type").notNull(), // generate, enhance, convert, optimize, validate
  purpose: text("purpose").notNull(),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  
  // Script details
  originalScript: text("original_script"),
  generatedScript: text("generated_script").notNull(),
  scriptType: text("script_type").notNull(), // powershell, bash, python, wmi, sql
  targetOS: text("target_os"), // windows, linux, macos, cross-platform
  complexity: text("complexity"), // basic, intermediate, advanced
  
  // Documentation and analysis
  documentation: text("documentation"),
  explanation: text("explanation"),
  analysisResults: jsonb("analysis_results").$type<{
    quality: number;
    security: { score: number; issues: string[]; recommendations: string[] };
    performance: { score: number; suggestions: string[] };
    maintainability: { score: number; improvements: string[] };
    documentation: { completeness: number; suggestions: string[] };
    overallRecommendations: string[];
  }>(),
  
  // AI model and cost tracking
  aiModel: text("ai_model").default("gpt-4o"),
  tokensUsed: integer("tokens_used"),
  estimatedCost: real("estimated_cost"),
  processingTime: integer("processing_time_ms"),
  
  // Quality and feedback
  qualityScore: real("quality_score"),
  userRating: integer("user_rating"), // 1-5 stars
  userFeedback: text("user_feedback"),
  isBookmarked: boolean("is_bookmarked").default(false),
  
  // Usage tracking
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  
  // Status
  status: text("status").notNull().default("active"), // active, archived, deleted
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Analysis Reports table for intelligent system analysis
export const aiAnalysisReports = pgTable("uem_app_ai_analysis_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  
  // Analysis details
  analysisType: text("analysis_type").notNull(), // endpoints, deployment-patterns, security-risks, performance, compliance
  title: text("title").notNull(),
  description: text("description"),
  
  // Data and context
  inputData: jsonb("input_data").$type<Record<string, any>>(),
  dataSourceIds: jsonb("data_source_ids").$type<number[]>().default([]),
  analysisScope: text("analysis_scope"), // global, domain, tenant, specific-assets
  
  // Analysis results
  findings: jsonb("findings").$type<Array<{
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    evidence: any[];
    recommendations: string[];
    confidence: number;
  }>>().default([]),
  
  recommendations: jsonb("recommendations").$type<Array<{
    priority: "low" | "medium" | "high" | "urgent";
    category: string;
    title: string;
    description: string;
    actionItems: string[];
    estimatedEffort: string;
    potentialImpact: string;
  }>>().default([]),
  
  insights: jsonb("insights").$type<Array<{
    type: string;
    title: string;
    description: string;
    metrics: Record<string, any>;
    trends: string[];
  }>>().default([]),
  
  // Scoring and metrics
  overallScore: real("overall_score"),
  confidenceLevel: real("confidence_level"),
  riskLevel: text("risk_level"), // low, medium, high, critical
  
  // Compliance and standards
  complianceFrameworks: jsonb("compliance_frameworks").$type<string[]>().default([]),
  complianceScore: real("compliance_score"),
  complianceGaps: jsonb("compliance_gaps").$type<string[]>().default([]),
  
  // AI model and processing
  aiModel: text("ai_model").default("gpt-4o"),
  processingTime: integer("processing_time_ms"),
  tokensUsed: integer("tokens_used"),
  estimatedCost: real("estimated_cost"),
  
  // Executive summary
  executiveSummary: text("executive_summary"),
  keyTakeaways: jsonb("key_takeaways").$type<string[]>().default([]),
  
  // Status and sharing
  status: text("status").notNull().default("completed"), // processing, completed, failed, archived
  isShared: boolean("is_shared").default(false),
  shareLevel: text("share_level"), // private, team, domain, global
  
  // Timestamps
  analysisStartedAt: timestamp("analysis_started_at"),
  analysisCompletedAt: timestamp("analysis_completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Recommendations table for intelligent suggestions and insights
export const aiRecommendations = pgTable("uem_app_ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  analysisReportId: integer("analysis_report_id").references(() => aiAnalysisReports.id),
  
  // Recommendation details
  type: text("type").notNull(), // dashboard, asset-management, deployment, policy, security, performance
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Priority and impact
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  impact: text("impact"), // low, medium, high, transformational
  confidence: real("confidence").notNull(), // 0.0 to 1.0
  
  // Implementation details
  actionItems: jsonb("action_items").$type<Array<{
    step: number;
    action: string;
    description: string;
    estimatedTime: string;
    prerequisites: string[];
    risk: "low" | "medium" | "high";
  }>>().default([]),
  
  estimatedEffort: text("estimated_effort"),
  estimatedBenefit: text("estimated_benefit"),
  
  // Context and targeting
  targetScope: text("target_scope"), // user, team, domain, tenant, global
  targetAssetIds: jsonb("target_asset_ids").$type<number[]>().default([]),
  contextData: jsonb("context_data").$type<Record<string, any>>(),
  
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
  status: text("status").notNull().default("active"), // active, implemented, dismissed, expired, archived
  isPersonalized: boolean("is_personalized").default(false),
  isTrending: boolean("is_trending").default(false),
  
  // Expiration and refresh
  expiresAt: timestamp("expires_at"),
  refreshedAt: timestamp("refreshed_at"),
  
  // AI generation metadata
  aiModel: text("ai_model").default("gpt-4o"),
  generationMethod: text("generation_method"), // pattern-analysis, user-behavior, system-analysis, predictive
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Feedback table for learning and continuous improvement
export const aiFeedback = pgTable("uem_app_ai_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  
  // Feedback target
  feedbackType: text("feedback_type").notNull(), // conversation, script-generation, analysis, recommendation
  targetId: integer("target_id").notNull(), // ID of the target entity
  targetType: text("target_type").notNull(), // conversation, script, analysis-report, recommendation
  
  // Feedback content
  rating: integer("rating"), // 1-5 stars
  sentiment: text("sentiment"), // positive, neutral, negative
  feedbackText: text("feedback_text"),
  
  // Specific feedback categories
  accuracy: integer("accuracy"), // 1-5
  usefulness: integer("usefulness"), // 1-5
  clarity: integer("clarity"), // 1-5
  completeness: integer("completeness"), // 1-5
  
  // Improvement suggestions
  improvementSuggestions: jsonb("improvement_suggestions").$type<Array<{
    category: string;
    suggestion: string;
    priority: string;
  }>>().default([]),
  
  // Context
  userContext: jsonb("user_context").$type<Record<string, any>>(),
  sessionId: text("session_id"),
  
  // Processing status
  isProcessed: boolean("is_processed").default(false),
  processingNotes: text("processing_notes"),
  processedAt: timestamp("processed_at"),
  
  // Metadata
  feedbackSource: text("feedback_source"), // ui, api, automated
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Usage Logs table for comprehensive audit and cost tracking
export const aiUsageLogs = pgTable("uem_app_ai_usage_logs", {
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
  modelConfig: jsonb("model_config").$type<Record<string, any>>(),
  
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
  requestPayload: jsonb("request_payload").$type<Record<string, any>>(),
  responsePayload: jsonb("response_payload").$type<Record<string, any>>(),
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
  safetyFlags: jsonb("safety_flags").$type<string[]>().default([]),
  
  // Client information
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  clientVersion: text("client_version"),
  
  // Timestamps
  timestamp: timestamp("timestamp").defaultNow(),
});

// AI Model Configurations table for managing AI model settings
export const aiModelConfigurations = pgTable("uem_app_ai_model_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  domainId: integer("domain_id").references(() => domains.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  
  // Model details
  modelName: text("model_name").notNull(), // gpt-4o, gpt-4, gpt-3.5-turbo, etc.
  provider: text("provider").default("openai"), // openai, anthropic, azure, etc.
  
  // Configuration parameters
  defaultConfig: jsonb("default_config").$type<{
    temperature: number;
    maxTokens: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    responseFormat?: string;
  }>(),
  
  // Use case specific configs
  useCaseConfigs: jsonb("use_case_configs").$type<Record<string, any>>(),
  
  // Cost and limits
  inputCostPerToken: real("input_cost_per_token"),
  outputCostPerToken: real("output_cost_per_token"),
  maxDailySpend: real("max_daily_spend"),
  maxMonthlySpend: real("max_monthly_spend"),
  
  // Access control
  allowedScopes: jsonb("allowed_scopes").$type<string[]>().default(["tenant"]),
  allowedUserRoles: jsonb("allowed_user_roles").$type<string[]>().default(["administrator"]),
  
  // Status
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  
  // Metadata
  description: text("description"),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Usage tracking
  usageCount: integer("usage_count").default(0),
  totalCost: real("total_cost").default(0),
  
  // Audit
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===== AI SERVICES RELATIONS =====

export const aiConversationsRelations = relations(aiConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiConversations.userId],
    references: [users.id],
  }),
  domain: one(domains, {
    fields: [aiConversations.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [aiConversations.tenantId],
    references: [tenants.id],
  }),
  scriptGenerations: many(aiScriptGenerations),
  feedback: many(aiFeedback),
}));

export const aiScriptGenerationsRelations = relations(aiScriptGenerations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiScriptGenerations.userId],
    references: [users.id],
  }),
  domain: one(domains, {
    fields: [aiScriptGenerations.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [aiScriptGenerations.tenantId],
    references: [tenants.id],
  }),
  conversation: one(aiConversations, {
    fields: [aiScriptGenerations.conversationId],
    references: [aiConversations.id],
  }),
  feedback: many(aiFeedback),
}));

export const aiAnalysisReportsRelations = relations(aiAnalysisReports, ({ one, many }) => ({
  user: one(users, {
    fields: [aiAnalysisReports.userId],
    references: [users.id],
  }),
  domain: one(domains, {
    fields: [aiAnalysisReports.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [aiAnalysisReports.tenantId],
    references: [tenants.id],
  }),
  recommendations: many(aiRecommendations),
  feedback: many(aiFeedback),
}));

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one, many }) => ({
  user: one(users, {
    fields: [aiRecommendations.userId],
    references: [users.id],
  }),
  domain: one(domains, {
    fields: [aiRecommendations.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [aiRecommendations.tenantId],
    references: [tenants.id],
  }),
  analysisReport: one(aiAnalysisReports, {
    fields: [aiRecommendations.analysisReportId],
    references: [aiAnalysisReports.id],
  }),
  feedback: many(aiFeedback),
}));

export const aiFeedbackRelations = relations(aiFeedback, ({ one }) => ({
  user: one(users, {
    fields: [aiFeedback.userId],
    references: [users.id],
  }),
  domain: one(domains, {
    fields: [aiFeedback.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [aiFeedback.tenantId],
    references: [tenants.id],
  }),
}));

export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageLogs.userId],
    references: [users.id],
  }),
  domain: one(domains, {
    fields: [aiUsageLogs.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [aiUsageLogs.tenantId],
    references: [tenants.id],
  }),
}));

export const aiModelConfigurationsRelations = relations(aiModelConfigurations, ({ one }) => ({
  domain: one(domains, {
    fields: [aiModelConfigurations.domainId],
    references: [domains.id],
  }),
  tenant: one(tenants, {
    fields: [aiModelConfigurations.tenantId],
    references: [tenants.id],
  }),
  createdBy: one(users, {
    fields: [aiModelConfigurations.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [aiModelConfigurations.updatedBy],
    references: [users.id],
  }),
}));

// ===== AI SERVICES INSERT SCHEMAS =====

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({
  id: true,
  lastMessageAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiScriptGenerationSchema = createInsertSchema(aiScriptGenerations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiAnalysisReportSchema = createInsertSchema(aiAnalysisReports).omit({
  id: true,
  analysisStartedAt: true,
  analysisCompletedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiFeedbackSchema = createInsertSchema(aiFeedback).omit({
  id: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAiModelConfigurationSchema = createInsertSchema(aiModelConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ===== AI SERVICES TYPES =====

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;

export type AiScriptGeneration = typeof aiScriptGenerations.$inferSelect;
export type InsertAiScriptGeneration = z.infer<typeof insertAiScriptGenerationSchema>;

export type AiAnalysisReport = typeof aiAnalysisReports.$inferSelect;
export type InsertAiAnalysisReport = z.infer<typeof insertAiAnalysisReportSchema>;

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;

export type AiFeedback = typeof aiFeedback.$inferSelect;
export type InsertAiFeedback = z.infer<typeof insertAiFeedbackSchema>;

export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;

export type AiModelConfiguration = typeof aiModelConfigurations.$inferSelect;
export type InsertAiModelConfiguration = z.infer<typeof insertAiModelConfigurationSchema>;

// Legacy types for backward compatibility
export type ScriptPolicy = Policy;
export type InsertScriptPolicy = InsertPolicy;
export type Activity = ActivityLog;
export type InsertActivity = InsertActivityLog;
export type AgentlessDiscoveryJob = DiscoveryJob;
export type InsertAgentlessDiscoveryJob = InsertDiscoveryJob;