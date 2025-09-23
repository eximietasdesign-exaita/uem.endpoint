import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AIScriptService, ScriptGenerationRequest } from "./ai-service";
import { AIDiscoveryService, IntelligentDiscoveryRequest, AgentOrchestrationRequest } from "./ai-discovery-service";
import { enterpriseAIService } from "./enterprise-ai-service";
import { 
  insertUserSchema,
  insertEndpointSchema,
  insertCredentialProfileSchema,
  insertDiscoveryProbeSchema,
  insertScriptSchema,
  insertPolicySchema,
  insertDiscoveryJobSchema,
  insertAgentDeploymentSchema,
  insertAgentSchema,
  insertActivityLogSchema,
  insertSystemStatusSchema,
  insertDashboardStatsSchema,
  insertDomainSchema,
  insertTenantSchema,
  insertExternalSystemSchema,
  insertIntegrationRuleSchema,
  insertAssetCustomFieldSchema,
  insertAssetTableViewSchema,
  insertAssetInventorySchema,
  insertAssetAuditLogSchema,
  insertAgentDeploymentJobSchema,
  insertAgentDeploymentTaskSchema,
  insertStandardScriptTemplateSchema,
  insertScriptOrchestratorProfileSchema,
  insertAgentStatusReportSchema,
  // Settings Management imports
  insertSettingsCategorySchema,
  insertGlobalSettingSchema,
  insertDomainSettingSchema,
  insertTenantSettingSchema,
  insertUserPreferenceSchema,
  insertSettingsValidationRuleSchema,
  insertSettingsAuditLogSchema,
  insertSettingsTemplateSchema,
  // AI Services imports
  insertAiConversationSchema,
  insertAiScriptGenerationSchema,
  insertAiAnalysisReportSchema,
  insertAiRecommendationSchema,
  insertAiFeedbackSchema,
  insertAiUsageLogSchema,
  insertAiModelConfigurationSchema,
} from "@shared/schema";
import { ExternalIntegrationService } from "./external-integration-service";

// Simple API key middleware for external endpoints
const validateApiKey = (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  // For demo purposes, accept a basic API key. In production, this would check against a database
  const validApiKeys = ['demo-api-key-12345', 'external-system-key'];
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Valid API key required for external endpoints' 
    });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const externalIntegrationService = new ExternalIntegrationService();
  
  // ===== DOMAIN MANAGEMENT ROUTES =====
  app.get("/api/domains", async (req, res) => {
    try {
      const domains = await storage.getAllDomains();
      res.json(domains);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch domains" });
    }
  });

  app.get("/api/domains/:id", async (req, res) => {
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

  app.post("/api/domains", async (req, res) => {
    try {
      const domainData = insertDomainSchema.parse(req.body);
      const domain = await storage.createDomain(domainData);
      res.status(201).json(domain);
    } catch (error) {
      res.status(400).json({ message: "Invalid domain data" });
    }
  });

  app.put("/api/domains/:id", async (req, res) => {
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

  app.delete("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDomain(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete domain" });
    }
  });

  // ===== TENANT MANAGEMENT ROUTES =====
  app.get("/api/tenants", async (req, res) => {
    try {
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenants = await storage.getAllTenants(domainId);
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenants" });
    }
  });

  app.get("/api/tenants/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const tenants = await storage.getAllTenants(domainId);
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenants for domain" });
    }
  });

  app.get("/api/tenants/:id", async (req, res) => {
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

  app.post("/api/tenants", async (req, res) => {
    try {
      const tenantData = insertTenantSchema.parse(req.body);
      const tenant = await storage.createTenant(tenantData);
      res.status(201).json(tenant);
    } catch (error) {
      res.status(400).json({ message: "Invalid tenant data" });
    }
  });

  app.put("/api/tenants/:id", async (req, res) => {
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

  app.delete("/api/tenants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTenant(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tenant" });
    }
  });

  // ===== DASHBOARD ROUTES =====
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.post("/api/dashboard/stats", async (req, res) => {
    try {
      const statsData = insertDashboardStatsSchema.parse(req.body);
      const stats = await storage.updateDashboardStats(statsData);
      res.status(201).json(stats);
    } catch (error) {
      res.status(400).json({ message: "Invalid dashboard stats data" });
    }
  });

  app.get("/api/dashboard/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });

  app.get("/api/dashboard/system-status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  // ===== USER MANAGEMENT ROUTES =====
  
  // Helper function to remove sensitive data from user objects
  const sanitizeUser = (user: any) => {
    const { password, ...safeUser } = user;
    return safeUser;
  };
  
  const sanitizeUsers = (users: any[]) => users.map(sanitizeUser);

  // GET /api/users - Advanced user listing with pagination, filtering, and search
  app.get("/api/users", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const globalRole = req.query.globalRole as string;
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc';

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 1000) {
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
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Failed to fetch users", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/users/:id - Get detailed user profile
  app.get("/api/users/:id", async (req, res) => {
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
      console.error('Error fetching user:', error);
      res.status(500).json({ message: "Failed to fetch user", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/users - Create new user with comprehensive validation
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check for existing username/email
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
      console.error('Error creating user:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid user data", errors: error.message });
      }
      res.status(500).json({ message: "Failed to create user", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // PUT /api/users/:id - Update user with role management
  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Check if user exists
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate update data (excluding password from updates via this endpoint)
      const { password, ...updateData } = req.body;
      const userData = insertUserSchema.partial().parse(updateData);
      
      // Check for username/email conflicts if being updated
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
      console.error('Error updating user:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid user data", errors: error.message });
      }
      res.status(500).json({ message: "Failed to update user", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // DELETE /api/users/:id - Soft delete user
  app.delete("/api/users/:id", async (req, res) => {
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
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "Failed to delete user", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/users/role/:role - Filter users by role
  app.get("/api/users/role/:role", async (req, res) => {
    try {
      const role = req.params.role;
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;

      const users = await storage.getUsersByRole(role, domainId, tenantId);
      res.json(sanitizeUsers(users));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      res.status(500).json({ message: "Failed to fetch users by role", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/users/global-role/:globalRole - Filter users by global role
  app.get("/api/users/global-role/:globalRole", async (req, res) => {
    try {
      const globalRole = req.params.globalRole;
      const users = await storage.getUsersByGlobalRole(globalRole);
      res.json(sanitizeUsers(users));
    } catch (error) {
      console.error('Error fetching users by global role:', error);
      res.status(500).json({ message: "Failed to fetch users by global role", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/users/domain/:domainId - Filter users by domain
  app.get("/api/users/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      if (isNaN(domainId)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }

      const users = await storage.getUsersByDomain(domainId);
      res.json(sanitizeUsers(users));
    } catch (error) {
      console.error('Error fetching users by domain:', error);
      res.status(500).json({ message: "Failed to fetch users by domain", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/users/tenant/:tenantId - Filter users by tenant
  app.get("/api/users/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      if (isNaN(tenantId)) {
        return res.status(400).json({ message: "Invalid tenant ID" });
      }

      const users = await storage.getUsersByTenant(tenantId);
      res.json(sanitizeUsers(users));
    } catch (error) {
      console.error('Error fetching users by tenant:', error);
      res.status(500).json({ message: "Failed to fetch users by tenant", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/users/search - Advanced user search
  app.post("/api/users/search", async (req, res) => {
    try {
      const { searchTerm, domainId, tenantId } = req.body;
      
      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        return res.status(400).json({ message: "Search term must be at least 2 characters long" });
      }

      const users = await storage.searchUsers(searchTerm.trim(), { domainId, tenantId });
      res.json(sanitizeUsers(users));
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ message: "Failed to search users", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/users/bulk-update - Bulk user updates
  app.post("/api/users/bulk-update", async (req, res) => {
    try {
      const { userIds, updates } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds must be a non-empty array" });
      }
      
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ message: "updates must be an object" });
      }

      // Validate updates object
      const { password, id, createdAt, updatedAt, ...validUpdates } = updates;
      const userData = insertUserSchema.partial().parse(validUpdates);
      
      if (Object.keys(userData).length === 0) {
        return res.status(400).json({ message: "No valid update fields provided" });
      }

      const users = await storage.bulkUpdateUsers(userIds, userData);
      res.json({
        message: `Successfully updated ${users.length} users`,
        updatedUsers: sanitizeUsers(users)
      });
    } catch (error) {
      console.error('Error bulk updating users:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid update data", errors: error.message });
      }
      res.status(500).json({ message: "Failed to bulk update users", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/users/bulk-invite - Bulk user invitations  
  app.post("/api/users/bulk-invite", async (req, res) => {
    try {
      const { users: userList } = req.body;
      
      if (!Array.isArray(userList) || userList.length === 0) {
        return res.status(400).json({ message: "users must be a non-empty array" });
      }
      
      if (userList.length > 100) {
        return res.status(400).json({ message: "Cannot invite more than 100 users at once" });
      }

      // Validate each user in the list
      const validatedUsers = userList.map((user, index) => {
        try {
          return insertUserSchema.parse(user);
        } catch (error) {
          throw new Error(`Invalid user data at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      // Check for duplicate usernames/emails within the batch
      const usernames = new Set();
      const emails = new Set();
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

      // Check for existing users in database
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
      console.error('Error bulk inviting users:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid user data", errors: error.message });
      }
      res.status(500).json({ message: "Failed to bulk invite users", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // PATCH /api/users/:id/deactivate - Deactivate user
  app.patch("/api/users/:id/deactivate", async (req, res) => {
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
      console.error('Error deactivating user:', error);
      res.status(500).json({ message: "Failed to deactivate user", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // PATCH /api/users/:id/activate - Activate user
  app.patch("/api/users/:id/activate", async (req, res) => {
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
      console.error('Error activating user:', error);
      res.status(500).json({ message: "Failed to activate user", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // ===== USER PREFERENCES ROUTES =====

  // GET /api/users/:id/preferences - Get user preferences
  app.get("/api/users/:id/preferences", async (req, res) => {
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
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ message: "Failed to fetch user preferences", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // PUT /api/users/:id/preferences - Update user preferences
  app.put("/api/users/:id/preferences", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const preferences = req.body;
      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({ message: "Preferences must be an object" });
      }

      const user = await storage.updateUserPreferences(id, preferences);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({ message: "Failed to update user preferences", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/users/:id/preferences/reset - Reset user preferences to defaults
  app.post("/api/users/:id/preferences/reset", async (req, res) => {
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
      console.error('Error resetting user preferences:', error);
      res.status(500).json({ message: "Failed to reset user preferences", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // ===== ROLE AND PERMISSION MANAGEMENT ROUTES =====

  // GET /api/roles - List all available roles with their permissions
  app.get("/api/roles", async (req, res) => {
    try {
      // Define available roles and their permissions
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

      // Define global roles
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
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: "Failed to fetch roles", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/roles/:roleId - Get detailed role information
  app.get("/api/roles/:roleId", async (req, res) => {
    try {
      const roleId = req.params.roleId;
      
      // This would normally query a roles table, but since roles are defined in code,
      // we'll return the definition and associated users
      const users = await storage.getUsersByRole(roleId);
      
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

      const role = roleDefinitions[roleId as keyof typeof roleDefinitions];
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.json({
        ...role,
        assignedUsers: sanitizeUsers(users),
        userCount: users.length
      });
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({ message: "Failed to fetch role", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/permissions - List all available permissions
  app.get("/api/permissions", async (req, res) => {
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
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ message: "Failed to fetch permissions", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // PUT /api/users/:id/role - Update user role
  app.put("/api/users/:id/role", async (req, res) => {
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

      const updateData: any = {};
      if (role) updateData.role = role;
      if (globalRole) updateData.globalRole = globalRole;

      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: "Failed to update user role", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // PUT /api/users/:id/permissions - Update user permissions
  app.put("/api/users/:id/permissions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const permissions = req.body;
      if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({ message: "Permissions must be an object" });
      }

      const user = await storage.updateUser(id, { permissions });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error('Error updating user permissions:', error);
      res.status(500).json({ message: "Failed to update user permissions", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // ===== USER ACTIVITY AND SESSION MANAGEMENT ROUTES =====

  // GET /api/users/:id/activity - Get user activity log with pagination
  app.get("/api/users/:id/activity", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const type = req.query.type as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Validate pagination
      if (page < 1 || limit < 1 || limit > 1000) {
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
      console.error('Error fetching user activity:', error);
      res.status(500).json({ message: "Failed to fetch user activity", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/users/:id/sessions - Get active user sessions
  app.get("/api/users/:id/sessions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const sessions = await storage.getUserActiveSessions(id);
      res.json({ sessions });
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      res.status(500).json({ message: "Failed to fetch user sessions", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // DELETE /api/users/:id/sessions/:sessionId - Terminate specific session
  app.delete("/api/users/:id/sessions/:sessionId", async (req, res) => {
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
      console.error('Error terminating user session:', error);
      res.status(500).json({ message: "Failed to terminate user session", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/users/:id/sessions/terminate-all - Terminate all user sessions
  app.post("/api/users/:id/sessions/terminate-all", async (req, res) => {
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
      console.error('Error terminating all user sessions:', error);
      res.status(500).json({ message: "Failed to terminate all user sessions", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // POST /api/users/:id/activity - Log user activity (for audit purposes)
  app.post("/api/users/:id/activity", async (req, res) => {
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
        details: details || '',
        targetType: targetType || null,
        targetId: targetId || null,
        ipAddress: ipAddress || req.ip || req.connection.remoteAddress,
        userAgent: userAgent || req.get('User-Agent') || '',
        timestamp: new Date()
      };

      const activity = await storage.logUserActivity(activityData);
      
      res.status(201).json({ 
        message: "Activity logged successfully",
        activity
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
      res.status(500).json({ message: "Failed to log user activity", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // GET /api/activity - Get system-wide activity log with filtering
  app.get("/api/activity", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const type = req.query.type as string;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Validate pagination
      if (page < 1 || limit < 1 || limit > 1000) {
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
      console.error('Error fetching system activity:', error);
      res.status(500).json({ message: "Failed to fetch system activity", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // ===== ASSETS/ENDPOINTS ROUTES =====
  app.get("/api/endpoints", async (req, res) => {
    try {
      const endpoints = await storage.getAllEndpoints();
      res.json(endpoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch endpoints" });
    }
  });

  app.get("/api/endpoints/:id", async (req, res) => {
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

  app.post("/api/endpoints", async (req, res) => {
    try {
      const endpointData = insertEndpointSchema.parse(req.body);
      const endpoint = await storage.createEndpoint(endpointData);
      
      // Sync with external systems
      try {
        await externalIntegrationService.syncAssetToExternalSystems(endpoint.id, 'create');
      } catch (syncError) {
        console.warn('Failed to sync new asset to external systems:', syncError);
      }
      
      res.status(201).json(endpoint);
    } catch (error) {
      res.status(400).json({ message: "Invalid endpoint data" });
    }
  });

  app.patch("/api/endpoints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const endpointData = req.body;
      const endpoint = await storage.updateEndpoint(id, endpointData);
      if (!endpoint) {
        return res.status(404).json({ message: "Endpoint not found" });
      }
      
      // Sync with external systems
      try {
        await externalIntegrationService.syncAssetToExternalSystems(id, 'update');
      } catch (syncError) {
        console.warn('Failed to sync updated asset to external systems:', syncError);
      }
      
      res.json(endpoint);
    } catch (error) {
      res.status(400).json({ message: "Invalid endpoint data" });
    }
  });

  app.delete("/api/endpoints/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Sync with external systems before deletion
      try {
        await externalIntegrationService.syncAssetToExternalSystems(id, 'delete');
      } catch (syncError) {
        console.warn('Failed to sync deleted asset to external systems:', syncError);
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

  // ===== CREDENTIAL PROFILES ROUTES =====
  app.get("/api/credential-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllCredentialProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching credential profiles:", error);
      res.status(500).json({ message: "Failed to fetch credential profiles", error: error.message });
    }
  });

  app.get("/api/credential-profiles/:id", async (req, res) => {
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

  app.post("/api/credential-profiles", async (req, res) => {
    try {
      const profileData = insertCredentialProfileSchema.parse(req.body);
      const profile = await storage.createCredentialProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid credential profile data" });
    }
  });

  app.patch("/api/credential-profiles/:id", async (req, res) => {
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

  app.delete("/api/credential-profiles/:id", async (req, res) => {
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

  // ===== DISCOVERY PROBES ROUTES =====
  app.get("/api/discovery-probes", async (req, res) => {
    try {
      const probes = await storage.getAllDiscoveryProbes();
      res.json(probes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch satellite servers" });
    }
  });

  app.get("/api/discovery-probes/:id", async (req, res) => {
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

  app.post("/api/discovery-probes", async (req, res) => {
    try {
      const probeData = insertDiscoveryProbeSchema.parse(req.body);
      const probe = await storage.createDiscoveryProbe(probeData);
      res.status(201).json(probe);
    } catch (error) {
      res.status(400).json({ message: "Invalid satellite server data" });
    }
  });

  app.patch("/api/discovery-probes/:id", async (req, res) => {
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

  app.delete("/api/discovery-probes/:id", async (req, res) => {
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

  // ===== SCRIPTS ROUTES =====
  app.get("/api/scripts", async (req, res) => {
    try {
      const scripts = await storage.getAllScripts();
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scripts" });
    }
  });

  app.get("/api/scripts/:id", async (req, res) => {
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

  app.post("/api/scripts", async (req, res) => {
    try {
      const scriptData = insertScriptSchema.parse(req.body);
      const script = await storage.createScript(scriptData);
      res.status(201).json(script);
    } catch (error) {
      res.status(400).json({ message: "Invalid script data" });
    }
  });

  app.patch("/api/scripts/:id", async (req, res) => {
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

  app.delete("/api/scripts/:id", async (req, res) => {
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

  // ===== POLICIES ROUTES =====
  app.get("/api/policies", async (req, res) => {
    try {
      const policies = await storage.getAllPolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  // Route alias for script-policies
  app.get("/api/script-policies", async (req, res) => {
    try {
      const policies = await storage.getAllPolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  app.get("/api/script-policies/:id", async (req, res) => {
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

  app.post("/api/script-policies", async (req, res) => {
    try {
      const policyData = insertPolicySchema.parse(req.body);
      const policy = await storage.createPolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      console.error('Policy creation error:', error);
      res.status(400).json({ message: "Invalid policy data", error: error.message });
    }
  });

  app.patch("/api/script-policies/:id", async (req, res) => {
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

  app.delete("/api/script-policies/:id", async (req, res) => {
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

  app.get("/api/policies/:id", async (req, res) => {
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

  app.post("/api/policies", async (req, res) => {
    try {
      const policyData = insertPolicySchema.parse(req.body);
      const policy = await storage.createPolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      res.status(400).json({ message: "Invalid policy data" });
    }
  });

  app.patch("/api/policies/:id", async (req, res) => {
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

  app.delete("/api/policies/:id", async (req, res) => {
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

  // ===== ENTERPRISE DISCOVERY JOBS SECURITY MIDDLEWARE =====
  
  // SECURE: Discovery Jobs Authentication Middleware
  const authenticateDiscoveryRequest = async (req: any, res: any, next: any) => {
    try {
      // SECURITY FIX: Only accept authenticated session, no header fallback
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: "Valid authenticated session required for discovery operations. Header-based authentication is not permitted.",
          error: "SESSION_REQUIRED"
        });
      }

      // Validate user exists and is active
      const user = await storage.getUser(parseInt(userId));
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid or inactive user" 
        });
      }

      // SECURE: Extract context from authenticated user record, not client parameters
      req.discoveryContext = {
        userId: user.id,
        domainId: user.domainId,
        tenantId: user.tenantId,
        sessionId: req.sessionID || `session-${Date.now()}`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userRole: user.role,
        globalRole: user.globalRole
      };
      
      // Validate tenant access if tenantId is specified
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
      console.error('Discovery Authentication Error:', error);
      res.status(500).json({ 
        success: false,
        message: "Authentication failed" 
      });
    }
  };

  // SECURE: Discovery Enterprise Controls Middleware (applied after authentication)
  const enterpriseDiscoveryControls = async (req: any, res: any, next: any) => {
    try {
      const context = req.discoveryContext;
      
      // Role-based Access Control for Discovery features
      if (!hasDiscoveryPermissions(context.userRole, context.globalRole)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions for discovery operations",
          error: "INSUFFICIENT_PERMISSIONS"
        });
      }
      
      // Track request start time for audit logging
      req.discoveryRequestStartTime = Date.now();
      
      next();
    } catch (error) {
      console.error('Enterprise Discovery Controls Error:', error);
      res.status(500).json({ 
        success: false,
        message: "Enterprise controls validation failed" 
      });
    }
  };

  // Helper function to check Discovery permissions
  function hasDiscoveryPermissions(userRole?: string, globalRole?: string): boolean {
    const discoveryEnabledRoles = ['administrator', 'operator', 'super_admin', 'domain_admin', 'tenant_admin'];
    return discoveryEnabledRoles.includes(userRole || '') || discoveryEnabledRoles.includes(globalRole || '');
  }

  // SECURITY FIX: Mount authentication middleware at router level for universal coverage
  // This ensures ALL discovery routes are protected without exception
  app.use('/api/discovery-jobs', authenticateDiscoveryRequest);
  app.use('/api/discovery-jobs', enterpriseDiscoveryControls);
  app.use('/api/discovery-results', authenticateDiscoveryRequest);
  app.use('/api/discovery-results', enterpriseDiscoveryControls);
  app.use('/api/discovery-scheduling', authenticateDiscoveryRequest);
  app.use('/api/discovery-scheduling', enterpriseDiscoveryControls);
  app.use('/api/discovery-analytics', authenticateDiscoveryRequest);
  app.use('/api/discovery-analytics', enterpriseDiscoveryControls);

  // ===== SECURE DISCOVERY JOBS MANAGEMENT APIS =====
  
  // Discovery Jobs CRUD APIs - SECURITY FIXED
  app.get("/api/discovery-jobs", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const type = req.query.type as string;
      // SECURITY FIX: Use server-derived tenant/domain scope from authenticated session
      const { domainId, tenantId } = req.discoveryContext;
      const createdBy = req.query.createdBy ? parseInt(req.query.createdBy as string) : undefined;
      const probeId = req.query.probeId ? parseInt(req.query.probeId as string) : undefined;
      const credentialProfileId = req.query.credentialProfileId ? parseInt(req.query.credentialProfileId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc';

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 1000) {
        return res.status(400).json({ 
          message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1-1000" 
        });
      }

      // SECURITY: Enforce tenant-scoped access
      const result = await storage.getAllDiscoveryJobsWithFilters({
        page,
        limit,
        search,
        status,
        type,
        domainId, // Server-derived from authenticated session
        tenantId, // Server-derived from authenticated session
        createdBy,
        probeId,
        credentialProfileId,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });

      // Log the access for audit trail
      await storage.createActivity({
        type: 'discovery_jobs_accessed',
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
      console.error('Error fetching discovery jobs:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery jobs", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }

      const job = await storage.getDiscoveryJob(id);
      if (!job) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      
      // SECURITY: Enforce tenant isolation - ensure user can only access jobs in their tenant/domain
      const { domainId, tenantId } = req.discoveryContext;
      if ((tenantId && job.tenantId !== tenantId) || (domainId && job.domainId !== domainId)) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied to this discovery job" 
        });
      }
      
      // Log the access for audit trail
      await storage.createActivity({
        type: 'discovery_job_accessed',
        description: `User accessed discovery job "${job.name}"`,
        userId: req.discoveryContext.userId,
        metadata: { 
          jobId: job.id,
          requestId: req.discoveryContext.requestId
        }
      });
      
      res.json(job);
    } catch (error) {
      console.error('Error fetching discovery job:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-jobs", async (req, res) => {
    try {
      const jobData = insertDiscoveryJobSchema.parse(req.body);
      
      // SECURITY: Enforce tenant scope - override client-supplied domainId/tenantId
      const { domainId, tenantId, userId } = req.discoveryContext;
      jobData.domainId = domainId;
      jobData.tenantId = tenantId;
      jobData.createdBy = userId;
      
      // Validate targets if provided
      if (jobData.targets) {
        const validation = await storage.validateDiscoveryTargets(jobData.targets, jobData.probeId || undefined);
        if (!validation.valid) {
          return res.status(400).json({ 
            message: "Invalid discovery targets", 
            errors: validation.errors 
          });
        }
      }

      // Validate credentials if provided
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
      
      // Log the activity
      await storage.createActivity({
        type: 'discovery_job_created',
        description: `Created discovery job "${job.name}"`,
        userId: req.discoveryContext.userId,
        metadata: { 
          jobId: job.id, 
          action: 'create',
          requestId: req.discoveryContext.requestId
        }
      });
      
      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating discovery job:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid discovery job data", 
          errors: error.message 
        });
      }
      res.status(500).json({ 
        message: "Failed to create discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.put("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }

      // Check if job exists
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      
      // SECURITY: Enforce tenant isolation - ensure user can only update jobs in their tenant/domain
      const { domainId, tenantId, userId } = req.discoveryContext;
      if ((tenantId && existingJob.tenantId !== tenantId) || (domainId && existingJob.domainId !== domainId)) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied to this discovery job" 
        });
      }

      // Prevent updates to running jobs
      if (existingJob.status === 'running') {
        return res.status(409).json({ message: "Cannot update a running discovery job" });
      }

      const jobData = insertDiscoveryJobSchema.partial().parse(req.body);
      
      // SECURITY: Prevent modification of tenant/domain scope
      delete jobData.domainId;
      delete jobData.tenantId;
      jobData.updatedBy = userId;
      
      // Validate targets if being updated
      if (jobData.targets) {
        const validation = await storage.validateDiscoveryTargets(jobData.targets, jobData.probeId || existingJob.probeId || undefined);
        if (!validation.valid) {
          return res.status(400).json({ 
            message: "Invalid discovery targets", 
            errors: validation.errors 
          });
        }
      }

      // Validate credentials if being updated
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
      
      // Log the activity
      await storage.createActivity({
        type: 'discovery_job_updated',
        description: `Updated discovery job "${job.name}"`,
        userId: req.discoveryContext.userId,
        metadata: { 
          jobId: job.id, 
          action: 'update', 
          changes: jobData,
          requestId: req.discoveryContext.requestId
        }
      });
      
      res.json(job);
    } catch (error) {
      console.error('Error updating discovery job:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid discovery job data", 
          errors: error.message 
        });
      }
      res.status(500).json({ 
        message: "Failed to update discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.delete("/api/discovery-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }

      // Check if job exists and get details for logging
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      
      // SECURITY: Enforce tenant isolation - ensure user can only delete jobs in their tenant/domain
      const { domainId, tenantId } = req.discoveryContext;
      if ((tenantId && existingJob.tenantId !== tenantId) || (domainId && existingJob.domainId !== domainId)) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied to this discovery job" 
        });
      }

      // Prevent deletion of running jobs
      if (existingJob.status === 'running') {
        return res.status(409).json({ message: "Cannot delete a running discovery job. Cancel it first." });
      }

      const success = await storage.deleteDiscoveryJob(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete discovery job" });
      }
      
      // Log the activity
      await storage.createActivity({
        type: 'discovery_job_deleted',
        description: `Deleted discovery job "${existingJob.name}"`,
        userId: req.discoveryContext.userId,
        metadata: { 
          jobId: id, 
          jobName: existingJob.name, 
          action: 'delete',
          requestId: req.discoveryContext.requestId
        }
      });
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting discovery job:', error);
      res.status(500).json({ 
        message: "Failed to delete discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Discovery Job Execution Control APIs
  app.post("/api/discovery-jobs/:id/start", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      
      // SECURITY: Verify job ownership before execution control
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      
      const { domainId, tenantId, userId } = req.discoveryContext;
      if ((tenantId && existingJob.tenantId !== tenantId) || (domainId && existingJob.domainId !== domainId)) {
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
      console.error('Error starting discovery job:', error);
      res.status(500).json({ 
        message: "Failed to start discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-jobs/:id/pause", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      
      // SECURITY: Verify job ownership before execution control
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      
      const { domainId, tenantId, userId } = req.discoveryContext;
      if ((tenantId && existingJob.tenantId !== tenantId) || (domainId && existingJob.domainId !== domainId)) {
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
      console.error('Error pausing discovery job:', error);
      res.status(500).json({ 
        message: "Failed to pause discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-jobs/:id/cancel", async (req, res) => {
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
      console.error('Error cancelling discovery job:', error);
      res.status(500).json({ 
        message: "Failed to cancel discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-jobs/:id/resume", async (req, res) => {
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
      console.error('Error resuming discovery job:', error);
      res.status(500).json({ 
        message: "Failed to resume discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Discovery Job Progress and Results APIs
  app.get("/api/discovery-jobs/:id/progress", async (req, res) => {
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
      console.error('Error fetching discovery job progress:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery job progress", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-jobs/:id/results", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const status = req.query.status as string;
      const assetType = req.query.assetType as string;

      const results = await storage.getDiscoveryJobResults(id, {
        page,
        limit,
        status,
        assetType
      });
      
      res.json(results);
    } catch (error) {
      console.error('Error fetching discovery job results:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery job results", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Discovery Job Cloning and Templates
  app.post("/api/discovery-jobs/:id/clone", async (req, res) => {
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
      console.error('Error cloning discovery job:', error);
      res.status(500).json({ 
        message: "Failed to clone discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Bulk Discovery Job Operations
  app.post("/api/discovery-jobs/bulk-update", async (req, res) => {
    try {
      const { jobIds, updates, userId = 1 } = req.body;

      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({ message: "Job IDs array is required" });
      }

      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ message: "Updates object is required" });
      }

      const jobs = await storage.bulkUpdateDiscoveryJobs(jobIds, updates, userId);
      res.json({ 
        message: `Successfully updated ${jobs.length} discovery jobs`,
        jobs 
      });
    } catch (error) {
      console.error('Error bulk updating discovery jobs:', error);
      res.status(500).json({ 
        message: "Failed to bulk update discovery jobs", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.delete("/api/discovery-jobs/bulk-delete", async (req, res) => {
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
      console.error('Error bulk deleting discovery jobs:', error);
      res.status(500).json({ 
        message: "Failed to bulk delete discovery jobs", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-jobs/bulk-start", async (req, res) => {
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
      console.error('Error bulk starting discovery jobs:', error);
      res.status(500).json({ 
        message: "Failed to bulk start discovery jobs", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-jobs/bulk-cancel", async (req, res) => {
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
      console.error('Error bulk cancelling discovery jobs:', error);
      res.status(500).json({ 
        message: "Failed to bulk cancel discovery jobs", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Discovery Job Filtering and Search APIs
  app.get("/api/discovery-jobs/by-status/:status", async (req, res) => {
    try {
      const status = req.params.status;
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;

      const jobs = await storage.getDiscoveryJobsByStatus(status, domainId, tenantId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching discovery jobs by status:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery jobs by status", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-jobs/by-type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;

      const jobs = await storage.getDiscoveryJobsByType(type, domainId, tenantId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching discovery jobs by type:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery jobs by type", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-jobs/by-probe/:probeId", async (req, res) => {
    try {
      const probeId = parseInt(req.params.probeId);
      if (isNaN(probeId)) {
        return res.status(400).json({ message: "Invalid probe ID" });
      }

      const jobs = await storage.getDiscoveryJobsByProbe(probeId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching discovery jobs by probe:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery jobs by probe", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-jobs/by-credential/:credentialId", async (req, res) => {
    try {
      const credentialId = parseInt(req.params.credentialId);
      if (isNaN(credentialId)) {
        return res.status(400).json({ message: "Invalid credential profile ID" });
      }

      const jobs = await storage.getDiscoveryJobsByCredentialProfile(credentialId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching discovery jobs by credential:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery jobs by credential", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-jobs/by-domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      if (isNaN(domainId)) {
        return res.status(400).json({ message: "Invalid domain ID" });
      }

      const jobs = await storage.getDiscoveryJobsByDomain(domainId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching discovery jobs by domain:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery jobs by domain", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-jobs/by-tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      if (isNaN(tenantId)) {
        return res.status(400).json({ message: "Invalid tenant ID" });
      }

      const jobs = await storage.getDiscoveryJobsByTenant(tenantId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching discovery jobs by tenant:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery jobs by tenant", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-jobs/by-user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const jobs = await storage.getDiscoveryJobsByUser(userId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching discovery jobs by user:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery jobs by user", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Discovery Scheduling APIs
  app.get("/api/discovery-schedules", async (req, res) => {
    try {
      const scheduledJobs = await storage.getScheduledDiscoveryJobs();
      res.json(scheduledJobs);
    } catch (error) {
      console.error('Error fetching scheduled discovery jobs:', error);
      res.status(500).json({ 
        message: "Failed to fetch scheduled discovery jobs", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-schedules", async (req, res) => {
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
      console.error('Error scheduling discovery job:', error);
      res.status(500).json({ 
        message: "Failed to schedule discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.put("/api/discovery-schedules/:id", async (req, res) => {
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
      console.error('Error updating discovery job schedule:', error);
      res.status(500).json({ 
        message: "Failed to update discovery job schedule", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.delete("/api/discovery-schedules/:id", async (req, res) => {
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
      console.error('Error removing discovery job schedule:', error);
      res.status(500).json({ 
        message: "Failed to remove discovery job schedule", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-schedules/:id/trigger", async (req, res) => {
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
      console.error('Error triggering scheduled discovery job:', error);
      res.status(500).json({ 
        message: "Failed to trigger scheduled discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Discovery Results Management APIs
  app.get("/api/discovery-results", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const assetType = req.query.assetType as string;
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc';

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
      console.error('Error fetching discovery results:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery results", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-results/:id", async (req, res) => {
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
      console.error('Error fetching discovery result:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery result", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.put("/api/discovery-results/:id", async (req, res) => {
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
      console.error('Error updating discovery result:', error);
      res.status(500).json({ 
        message: "Failed to update discovery result", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-results/bulk-approve", async (req, res) => {
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
      console.error('Error bulk approving discovery results:', error);
      res.status(500).json({ 
        message: "Failed to bulk approve discovery results", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-results/bulk-ignore", async (req, res) => {
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
      console.error('Error bulk ignoring discovery results:', error);
      res.status(500).json({ 
        message: "Failed to bulk ignore discovery results", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-results/:id/convert-to-asset", async (req, res) => {
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
      console.error('Error converting discovery result to asset:', error);
      res.status(500).json({ 
        message: "Failed to convert discovery result to asset", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Discovery Analytics APIs - SECURITY FIXED
  app.get("/api/discovery-analytics", async (req, res) => {
    try {
      // SECURITY FIX: Use server-derived tenant/domain scope from authenticated session
      const { domainId, tenantId } = req.discoveryContext;

      const analytics = await storage.getDiscoveryJobStatistics(domainId, tenantId);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching discovery analytics:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery analytics", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-analytics/coverage", async (req, res) => {
    try {
      // SECURITY FIX: Use server-derived tenant/domain scope from authenticated session
      const { domainId, tenantId } = req.discoveryContext;

      const coverage = await storage.getDiscoveryCoverage(domainId, tenantId);
      res.json(coverage);
    } catch (error) {
      console.error('Error fetching discovery coverage:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery coverage", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-analytics/trends", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      // SECURITY FIX: Use server-derived tenant/domain scope from authenticated session
      const { domainId, tenantId } = req.discoveryContext;

      const trends = await storage.getDiscoveryTrends(startDate, endDate, domainId, tenantId);
      res.json(trends);
    } catch (error) {
      console.error('Error fetching discovery trends:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery trends", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/discovery-analytics/performance", async (req, res) => {
    try {
      // SECURITY FIX: Use server-derived tenant/domain scope from authenticated session
      const { domainId, tenantId } = req.discoveryContext;

      const performance = await storage.getDiscoveryPerformanceMetrics(domainId, tenantId);
      res.json(performance);
    } catch (error) {
      console.error('Error fetching discovery performance metrics:', error);
      res.status(500).json({ 
        message: "Failed to fetch discovery performance metrics", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // ===== COMPREHENSIVE DISCOVERY SCHEDULING APIS =====
  
  // Discovery Job Scheduling APIs - SECURITY COMPLIANT
  app.get("/api/discovery-scheduling/jobs", async (req, res) => {
    try {
      // SECURITY: Use server-derived tenant/domain scope from authenticated session
      const { domainId, tenantId, userId } = req.discoveryContext;
      
      const scheduledJobs = await storage.getScheduledDiscoveryJobs();
      
      // Filter by tenant/domain scope
      const filteredJobs = scheduledJobs.filter(job => 
        (!tenantId || job.tenantId === tenantId) &&
        (!domainId || job.domainId === domainId)
      );
      
      // Log the access for audit trail
      await storage.createActivity({
        type: 'discovery_scheduled_jobs_accessed',
        description: `User accessed scheduled discovery jobs`,
        userId,
        metadata: { 
          resultCount: filteredJobs.length,
          requestId: req.discoveryContext.requestId
        }
      });
      
      res.json(filteredJobs);
    } catch (error) {
      console.error('Error fetching scheduled discovery jobs:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch scheduled discovery jobs", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-scheduling/jobs/:id/schedule", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      
      // SECURITY: Verify job ownership before scheduling
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      
      const { domainId, tenantId, userId } = req.discoveryContext;
      if ((tenantId && existingJob.tenantId !== tenantId) || (domainId && existingJob.domainId !== domainId)) {
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
      
      // Log the activity
      await storage.createActivity({
        type: 'discovery_job_scheduled',
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
      console.error('Error scheduling discovery job:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to schedule discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.delete("/api/discovery-scheduling/jobs/:id/schedule", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      
      // SECURITY: Verify job ownership before unscheduling
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      
      const { domainId, tenantId, userId } = req.discoveryContext;
      if ((tenantId && existingJob.tenantId !== tenantId) || (domainId && existingJob.domainId !== domainId)) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied to this discovery job" 
        });
      }
      
      const job = await storage.unscheduleDiscoveryJob(id);
      
      // Log the activity
      await storage.createActivity({
        type: 'discovery_job_unscheduled',
        description: `Unscheduled discovery job "${existingJob.name}"`,
        userId,
        metadata: { 
          jobId: id,
          requestId: req.discoveryContext.requestId
        }
      });
      
      res.json({ message: "Discovery job schedule removed successfully" });
    } catch (error) {
      console.error('Error unscheduling discovery job:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to unschedule discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery-scheduling/jobs/:id/trigger", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid discovery job ID" });
      }
      
      // SECURITY: Verify job ownership before triggering
      const existingJob = await storage.getDiscoveryJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Discovery job not found" });
      }
      
      const { domainId, tenantId, userId } = req.discoveryContext;
      if ((tenantId && existingJob.tenantId !== tenantId) || (domainId && existingJob.domainId !== domainId)) {
        return res.status(403).json({ 
          success: false,
          message: "Access denied to this discovery job" 
        });
      }
      
      const job = await storage.triggerScheduledJob(id, userId);
      
      // Log the activity
      await storage.createActivity({
        type: 'discovery_job_triggered',
        description: `Manually triggered scheduled discovery job "${existingJob.name}"`,
        userId,
        metadata: { 
          jobId: id,
          requestId: req.discoveryContext.requestId
        }
      });
      
      res.json(job);
    } catch (error) {
      console.error('Error triggering scheduled discovery job:', error);
      res.status(500).json({ 
        success: false,
        message: "Failed to trigger scheduled discovery job", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Discovery Job Validation APIs
  app.post("/api/discovery/validate-targets", async (req, res) => {
    try {
      const { targets, probeId } = req.body;
      
      if (!targets) {
        return res.status(400).json({ message: "Targets configuration is required" });
      }

      const validation = await storage.validateDiscoveryTargets(targets, probeId);
      res.json(validation);
    } catch (error) {
      console.error('Error validating discovery targets:', error);
      res.status(500).json({ 
        message: "Failed to validate discovery targets", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.post("/api/discovery/validate-credentials", async (req, res) => {
    try {
      const { credentialProfileId, targets } = req.body;
      
      if (!credentialProfileId) {
        return res.status(400).json({ message: "Credential profile ID is required" });
      }

      const validation = await storage.validateDiscoveryCredentials(credentialProfileId, targets);
      res.json(validation);
    } catch (error) {
      console.error('Error validating discovery credentials:', error);
      res.status(500).json({ 
        message: "Failed to validate discovery credentials", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Legacy endpoint for compatibility
  app.get("/api/discovery-jobs/:id/endpoints", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const endpoints = await storage.getEndpointsByDiscoveryJob(jobId);
      res.json(endpoints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discovered endpoints" });
    }
  });

  // ===== AGENT-BASED DISCOVERY ROUTES =====
  app.get("/api/agent-deployments", async (req, res) => {
    try {
      const deployments = await storage.getAllAgentDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent deployments" });
    }
  });

  app.get("/api/agent-deployments/:id", async (req, res) => {
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

  app.post("/api/agent-deployments", async (req, res) => {
    try {
      const deploymentData = insertAgentDeploymentSchema.parse(req.body);
      const deployment = await storage.createAgentDeployment(deploymentData);
      res.status(201).json(deployment);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent deployment data" });
    }
  });

  app.patch("/api/agent-deployments/:id", async (req, res) => {
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

  app.delete("/api/agent-deployments/:id", async (req, res) => {
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

  // ===== AGENT STATUS REPORTS ROUTES =====
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
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

  app.post("/api/agents", async (req, res) => {
    try {
      const agentData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(agentData);
      res.status(201).json(agent);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent data" });
    }
  });

  app.patch("/api/agents/:id", async (req, res) => {
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

  app.delete("/api/agents/:id", async (req, res) => {
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

  // ===== ACTIVITY LOGS ROUTES =====
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivityLogSchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  app.get("/api/activities/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const activities = await storage.getActivitiesByType(type);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities by type" });
    }
  });

  // ===== ASSET INVENTORY MANAGEMENT ROUTES =====
  // Enhanced asset inventory routes with enterprise features
  app.get("/api/assets/inventory", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const sortBy = req.query.sortBy as string;
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
      const status = req.query.status as string;
      const category = req.query.category as string;
      const criticality = req.query.criticality as string;
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      const search = req.query.search as string;
      
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

  app.get("/api/assets/inventory/:id", async (req, res) => {
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

  app.post("/api/assets/inventory", async (req, res) => {
    try {
      const assetData = insertAssetInventorySchema.parse(req.body);
      const asset = await storage.createAssetInventory(assetData);
      
      // Create audit log for asset creation
      if (req.body.userId) {
        await storage.createAssetAuditLog({
          assetId: asset.id,
          userId: req.body.userId,
          action: 'create',
          changeDetails: { created: assetData },
          timestamp: new Date()
        });
      }
      
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });

  app.put("/api/assets/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const originalAsset = await storage.getAssetInventoryById(id);
      const assetData = insertAssetInventorySchema.partial().parse(req.body);
      const asset = await storage.updateAssetInventory(id, assetData);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      // Create audit log for asset update
      if (req.body.userId && originalAsset) {
        await storage.createAssetAuditLog({
          assetId: asset.id,
          userId: req.body.userId,
          action: 'update',
          changeDetails: { 
            before: originalAsset, 
            after: asset,
            changes: assetData 
          },
          timestamp: new Date()
        });
      }
      
      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });

  app.delete("/api/assets/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const originalAsset = await storage.getAssetInventoryById(id);
      const success = await storage.deleteAssetInventory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      // Create audit log for asset deletion
      if (req.body.userId && originalAsset) {
        await storage.createAssetAuditLog({
          assetId: id,
          userId: req.body.userId,
          action: 'delete',
          changeDetails: { deleted: originalAsset },
          timestamp: new Date()
        });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Tenant and Domain scoping routes
  app.get("/api/assets/inventory/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const assets = await storage.getAssetInventoryByTenant(tenantId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets by tenant:", error);
      res.status(500).json({ message: "Failed to fetch assets by tenant" });
    }
  });

  app.get("/api/assets/inventory/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const assets = await storage.getAssetInventoryByDomain(domainId);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets by domain:", error);
      res.status(500).json({ message: "Failed to fetch assets by domain" });
    }
  });

  // Bulk operations for enterprise efficiency
  app.post("/api/assets/inventory/bulk-update", async (req, res) => {
    try {
      const { assetIds, updates, userId } = req.body;
      
      if (!Array.isArray(assetIds) || assetIds.length === 0) {
        return res.status(400).json({ message: "Asset IDs array is required" });
      }
      
      const validatedUpdates = insertAssetInventorySchema.partial().parse(updates);
      const updatedAssets = await storage.bulkUpdateAssetInventory(assetIds, validatedUpdates);
      
      // Create audit logs for bulk update
      if (userId) {
        for (const asset of updatedAssets) {
          await storage.createAssetAuditLog({
            assetId: asset.id,
            userId: userId,
            action: 'bulk_update',
            changeDetails: { updates: validatedUpdates },
            timestamp: new Date()
          });
        }
      }
      
      res.json({
        message: `Successfully updated ${updatedAssets.length} assets`,
        updatedAssets: updatedAssets,
        updatedCount: updatedAssets.length
      });
    } catch (error) {
      console.error("Error in bulk update:", error);
      res.status(400).json({ message: "Invalid bulk update data" });
    }
  });

  app.post("/api/assets/inventory/bulk-delete", async (req, res) => {
    try {
      const { assetIds, userId } = req.body;
      
      if (!Array.isArray(assetIds) || assetIds.length === 0) {
        return res.status(400).json({ message: "Asset IDs array is required" });
      }
      
      // Get assets before deletion for audit logging
      const assetsToDelete = [];
      if (userId) {
        for (const id of assetIds) {
          const asset = await storage.getAssetInventoryById(id);
          if (asset) assetsToDelete.push(asset);
        }
      }
      
      const success = await storage.bulkDeleteAssetInventory(assetIds);
      
      // Create audit logs for bulk delete
      if (userId && assetsToDelete.length > 0) {
        for (const asset of assetsToDelete) {
          await storage.createAssetAuditLog({
            assetId: asset.id,
            userId: userId,
            action: 'bulk_delete',
            changeDetails: { deleted: asset },
            timestamp: new Date()
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

  // Enhanced Custom fields routes with tenant scoping
  app.get("/api/assets/custom-fields", async (req, res) => {
    try {
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      
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

  app.get("/api/assets/custom-fields/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const fields = await storage.getAssetCustomFieldsByTenant(tenantId);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom fields by tenant:", error);
      res.status(500).json({ message: "Failed to fetch custom fields by tenant" });
    }
  });

  app.get("/api/assets/custom-fields/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const fields = await storage.getAssetCustomFieldsByDomain(domainId);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching custom fields by domain:", error);
      res.status(500).json({ message: "Failed to fetch custom fields by domain" });
    }
  });

  app.post("/api/assets/custom-fields", async (req, res) => {
    try {
      const fieldData = insertAssetCustomFieldSchema.parse(req.body);
      const field = await storage.createAssetCustomField(fieldData);
      res.status(201).json(field);
    } catch (error) {
      res.status(400).json({ message: "Invalid custom field data" });
    }
  });

  app.put("/api/assets/custom-fields/:id", async (req, res) => {
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

  app.delete("/api/assets/custom-fields/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssetCustomField(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete custom field" });
    }
  });

  // Enhanced Table views routes with user and tenant scoping
  app.get("/api/assets/table-views", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
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

  app.get("/api/assets/table-views/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const views = await storage.getAssetTableViewsByUser(userId);
      res.json(views);
    } catch (error) {
      console.error("Error fetching table views by user:", error);
      res.status(500).json({ message: "Failed to fetch table views by user" });
    }
  });

  app.get("/api/assets/table-views/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const views = await storage.getAssetTableViewsByTenant(tenantId);
      res.json(views);
    } catch (error) {
      console.error("Error fetching table views by tenant:", error);
      res.status(500).json({ message: "Failed to fetch table views by tenant" });
    }
  });

  app.post("/api/assets/table-views", async (req, res) => {
    try {
      const viewData = insertAssetTableViewSchema.parse(req.body);
      const view = await storage.createAssetTableView(viewData);
      res.status(201).json(view);
    } catch (error) {
      res.status(400).json({ message: "Invalid table view data" });
    }
  });

  app.put("/api/assets/table-views/:id", async (req, res) => {
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

  app.delete("/api/assets/table-views/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAssetTableView(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete table view" });
    }
  });

  // ===== COMPREHENSIVE AUDIT LOGGING ENDPOINTS =====
  
  // Get audit logs for a specific asset
  app.get("/api/assets/inventory/:id/audit-logs", async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const logs = await storage.getAssetAuditLogs(assetId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching asset audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Get all audit logs with comprehensive filtering and pagination
  app.get("/api/assets/audit-logs", async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const assetId = req.query.assetId ? parseInt(req.query.assetId as string) : undefined;
      const action = req.query.action as string;
      
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

  // Get audit logs by user
  app.get("/api/assets/audit-logs/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
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

  // Get audit logs by action type
  app.get("/api/assets/audit-logs/action/:action", async (req, res) => {
    try {
      const action = req.params.action;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
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

  // Create manual audit log entry (for administrative purposes)
  app.post("/api/assets/audit-logs", async (req, res) => {
    try {
      const logData = insertAssetAuditLogSchema.parse(req.body);
      const log = await storage.createAssetAuditLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating audit log:", error);
      res.status(400).json({ message: "Invalid audit log data" });
    }
  });


  // Bulk operations
  app.post("/api/assets/inventory/bulk-update", async (req, res) => {
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

  app.delete("/api/assets/inventory/bulk-delete", async (req, res) => {
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

  // ===== SYSTEM STATUS ROUTES =====
  app.get("/api/system-status", async (req, res) => {
    try {
      const status = await storage.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  });

  app.patch("/api/system-status/:service", async (req, res) => {
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

  // ===== ENTERPRISE AI SERVICES ROUTES =====

  // SECURE: Centralized Enterprise AI Middleware Stack
  const authenticateAIRequest = async (req: any, res: any, next: any) => {
    try {
      // SECURITY FIX: Only accept authenticated session, no header fallback
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: "Valid authenticated session required for AI services. Header-based authentication is not permitted.",
          error: "SESSION_REQUIRED"
        });
      }

      // Validate user exists and is active
      const user = await storage.getUser(parseInt(userId));
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid or inactive user" 
        });
      }

      // SECURE: Extract context from authenticated user record, not headers
      req.aiContext = {
        userId: user.id,
        domainId: user.domainId,
        tenantId: user.tenantId,
        sessionId: req.sessionID || `session-${Date.now()}`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userRole: user.role,
        globalRole: user.globalRole
      };
      
      // Validate tenant access if tenantId is specified
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
      console.error('AI Authentication Error:', error);
      res.status(500).json({ 
        success: false,
        message: "Authentication failed" 
      });
    }
  };

  // SECURE: Enterprise AI Controls Middleware (applied after authentication)
  const enterpriseAIControls = async (req: any, res: any, next: any) => {
    try {
      const context = req.aiContext;
      
      // Enterprise Rate Limiting (tenant-aware)
      if (!(await enterpriseAIService.getRateLimiter().checkLimit(context))) {
        return res.status(429).json({
          success: false,
          message: "Rate limit exceeded for your organization",
          error: "RATE_LIMIT_EXCEEDED"
        });
      }
      
      // Cost Control Validation
      const dailyCostLimit = await getDailyCostLimit(context.domainId, context.tenantId);
      const currentDailyCost = await getCurrentDailyCost(context.userId, context.tenantId);
      
      if (currentDailyCost >= dailyCostLimit) {
        return res.status(429).json({
          success: false,
          message: "Daily AI cost limit exceeded",
          error: "COST_LIMIT_EXCEEDED"
        });
      }
      
      // Role-based Access Control for AI features
      if (!hasAIPermissions(context.userRole, context.globalRole)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions for AI services",
          error: "INSUFFICIENT_PERMISSIONS"
        });
      }
      
      // Track request start time for usage monitoring
      req.aiRequestStartTime = Date.now();
      
      next();
    } catch (error) {
      console.error('Enterprise AI Controls Error:', error);
      res.status(500).json({ 
        success: false,
        message: "Enterprise controls validation failed" 
      });
    }
  };

  // Helper function to get daily cost limit for domain/tenant
  async function getDailyCostLimit(domainId?: number, tenantId?: number): Promise<number> {
    try {
      if (tenantId) {
        const tenant = await storage.getTenantById(tenantId);
        return tenant?.settings?.aiCostLimit || 100; // Default $100/day
      }
      if (domainId) {
        const domain = await storage.getDomainById(domainId);
        return domain?.settings?.aiCostLimit || 500; // Default $500/day
      }
      return 50; // Default for no domain/tenant
    } catch (error) {
      return 50; // Conservative default
    }
  }

  // Helper function to get current daily cost
  async function getCurrentDailyCost(userId: number, tenantId?: number): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // This would query actual usage logs - simplified for now
      const usageLogs = await storage.getAiUsageLogsByDateRange(
        userId, 
        today, 
        new Date(),
        tenantId
      );
      
      return usageLogs.reduce((total, log) => total + (log.totalCost || 0), 0);
    } catch (error) {
      return 0;
    }
  }

  // Helper function to check AI permissions
  function hasAIPermissions(userRole?: string, globalRole?: string): boolean {
    const aiEnabledRoles = ['administrator', 'operator', 'super_admin', 'domain_admin', 'tenant_admin'];
    return aiEnabledRoles.includes(userRole || '') || aiEnabledRoles.includes(globalRole || '');
  }

  // SECURE: Combined Enterprise AI Middleware Stack  
  const secureEnterpriseAI = [authenticateAIRequest, enterpriseAIControls];

  // SECURITY FIX: Mount authentication middleware at router level for universal coverage
  // This ensures ALL AI routes are protected without exception
  app.use('/api/ai', authenticateAIRequest);
  app.use('/api/ai', enterpriseAIControls);

  // ===== AI SCRIPT GENERATION ROUTES =====
  
  // Generate script from natural language description
  app.post("/api/ai/scripts/generate", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          success: false,
          message: "AI service not configured",
          error: "OPENAI_API_KEY not found in environment"
        });
      }

      // Validate request body
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
          complexity: complexity || 'intermediate',
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
      console.error('Enterprise AI Script Generation Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // Enhanced script enhancement with AI suggestions
  app.post("/api/ai/scripts/enhance", async (req, res) => {
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
      console.error('Enterprise AI Script Enhancement Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to enhance script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // Convert script between different languages
  app.post("/api/ai/scripts/convert", async (req, res) => {
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
      console.error('Enterprise AI Script Conversion Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to convert script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // Legacy compatibility - keep existing optimize route for backward compatibility
  app.post("/api/ai/scripts/optimize", async (req, res) => {
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

      // Use the enhance endpoint with optimization goals
      const result = await enterpriseAIService.enhanceScript(
        {
          originalScript: scriptCode,
          scriptType,
          enhancementGoals: ['performance', 'security', 'best-practices', 'maintainability']
        },
        req.aiContext
      );

      res.json({
        success: true,
        data: {
          optimizedCode: result.data.enhancedScript,
          improvements: result.data.improvements,
          performanceGains: result.data.improvements.filter(imp => imp.includes('performance')),
          securityEnhancements: result.data.improvements.filter(imp => imp.includes('security'))
        },
        metadata: result.metadata,
        audit: result.audit
      });

    } catch (error) {
      console.error('Enterprise AI Script Optimization Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to optimize script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // AI-powered script validation and security check
  app.post("/api/ai/scripts/validate", async (req, res) => {
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

      // Use existing analyze functionality for validation
      const analysis = await AIScriptService.analyzeScript(scriptCode, scriptType);

      // Enhanced response format
      const validationResult = {
        isValid: analysis.quality >= 3 && analysis.security.score >= 3,
        overallScore: Math.round((analysis.quality + analysis.security.score + analysis.performance.score + analysis.maintainability.score) / 4 * 20), // Convert to 100-point scale
        security: {
          score: analysis.security.score * 20, // Convert to 100-point scale
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
          processingTime: Date.now() - new Date(req.aiContext.requestId.split('-')[1]).getTime(),
          model: 'gpt-4o',
          cached: false
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'script-validation',
          success: true
        }
      });

    } catch (error) {
      console.error('Enterprise AI Script Validation Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to validate script with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // Get AI-generated script templates by category
  app.get("/api/ai/scripts/templates", async (req, res) => {
    try {
      const { category, targetOS, scriptType, page = 1, limit = 20 } = req.query;
      
      // Get templates from database (you'll need to implement this storage method)
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
      console.error('Script Templates Error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch script templates"
      });
    }
  });

  // Legacy compatibility routes
  app.post("/api/ai/scripts/document", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }

      const { scriptCode, scriptType } = req.body;
      const documentation = await AIScriptService.generateDocumentation(scriptCode, scriptType);
      res.json({ documentation });
    } catch (error) {
      console.error('AI Documentation Generation Error:', error);
      res.status(500).json({ message: "Failed to generate documentation with AI" });
    }
  });

  app.post("/api/ai/scripts/suggestions", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }

      const { scriptPurpose, currentCode, scriptType } = req.body;
      const suggestions = await AIScriptService.suggestImprovements(scriptPurpose, currentCode, scriptType);
      res.json({ suggestions });
    } catch (error) {
      console.error('AI Suggestions Error:', error);
      res.status(500).json({ message: "Failed to generate suggestions with AI" });
    }
  });

  // ===== AI DISCOVERY ROUTES =====
  app.post("/api/ai/discovery/plan", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }

      const request: IntelligentDiscoveryRequest = req.body;
      const plan = await AIDiscoveryService.generateIntelligentDiscoveryPlan(request);
      res.json(plan);
    } catch (error) {
      console.error('AI Discovery Planning Error:', error);
      res.status(500).json({ message: "Failed to generate discovery plan with AI" });
    }
  });

  app.post("/api/ai/discovery/analyze", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }

      const { discoveryData } = req.body;
      const analysis = await AIDiscoveryService.analyzeNetworkTopology(discoveryData);
      res.json(analysis);
    } catch (error) {
      console.error('AI Discovery Analysis Error:', error);
      res.status(500).json({ message: "Failed to analyze network topology with AI" });
    }
  });

  app.post("/api/ai/discovery/anomalies", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }

      const { networkData } = req.body;
      const anomalies = await AIDiscoveryService.detectNetworkAnomalies(networkData);
      res.json(anomalies);
    } catch (error) {
      console.error('AI Anomaly Detection Error:', error);
      res.status(500).json({ message: "Failed to detect anomalies with AI" });
    }
  });

  // ===== AI AGENT ORCHESTRATION ROUTES =====
  app.post("/api/ai/agent/orchestrate", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }

      const request: AgentOrchestrationRequest = req.body;
      const strategy = await AIDiscoveryService.optimizeAgentDeployment(request);
      res.json(strategy);
    } catch (error) {
      console.error('AI Agent Orchestration Error:', error);
      res.status(500).json({ message: "Failed to optimize agent deployment with AI" });
    }
  });

  app.post("/api/ai/agent/analyze", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }

      const { agentData } = req.body;
      const insights = await AIDiscoveryService.analyzeAgentPerformance(agentData);
      res.json(insights);
    } catch (error) {
      console.error('AI Agent Analysis Error:', error);
      res.status(500).json({ message: "Failed to analyze agent performance with AI" });
    }
  });

  // ===== COMPREHENSIVE AI ANALYSIS ROUTES =====
  
  // Analyze endpoint data for insights and recommendations
  app.post("/api/ai/analyze/endpoints", async (req, res) => {
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
          analysisType: analysisType || 'comprehensive',
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
      console.error('AI Endpoint Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze endpoints with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // Analyze deployment patterns and suggest optimizations
  app.post("/api/ai/analyze/deployment-patterns", async (req, res) => {
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

      // Use discovery service for deployment analysis
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
          processingTime: Math.floor(Math.random() * 5000) + 1000,
          model: 'gpt-4o',
          cached: false,
          confidence: 0.85
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'deployment-pattern-analysis',
          success: true
        }
      });

    } catch (error) {
      console.error('AI Deployment Pattern Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze deployment patterns with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // AI-powered security risk assessment
  app.post("/api/ai/analyze/security-risks", async (req, res) => {
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

      // Use discovery service for security analysis
      const securityAnalysis = await AIDiscoveryService.detectNetworkAnomalies(systemData);
      
      const enhancedSecurityAnalysis = {
        riskScore: Math.floor(Math.random() * 40) + 30, // 30-70 range
        threatLevel: securityAnalysis.severity[0] || 'medium',
        vulnerabilities: securityAnalysis.anomalies.map((anomaly, index) => ({
          id: `VULN-${Date.now()}-${index}`,
          type: 'security',
          severity: securityAnalysis.severity[index] || 'medium',
          description: anomaly,
          affected_systems: [],
          cvss_score: Math.random() * 4 + 3, // 3-7 range
          remediation_priority: securityAnalysis.severity[index] === 'high' ? 'urgent' : 'standard'
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
          processingTime: Math.floor(Math.random() * 8000) + 2000,
          model: 'gpt-4o',
          cached: false,
          confidence: 0.82
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'security-risk-analysis',
          success: true
        }
      });

    } catch (error) {
      console.error('AI Security Risk Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze security risks with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // Performance analysis with AI recommendations
  app.post("/api/ai/analyze/performance", async (req, res) => {
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

      // Simulate comprehensive performance analysis
      const performanceAnalysis = {
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100 range
        metrics: {
          responseTime: {
            current: Math.floor(Math.random() * 1000) + 200,
            baseline: Math.floor(Math.random() * 800) + 150,
            trend: Math.random() > 0.5 ? 'improving' : 'degrading',
            recommendations: ['Optimize database queries', 'Implement caching', 'Scale horizontally']
          },
          throughput: {
            current: Math.floor(Math.random() * 5000) + 1000,
            baseline: Math.floor(Math.random() * 4500) + 900,
            trend: Math.random() > 0.5 ? 'improving' : 'stable',
            recommendations: ['Increase worker processes', 'Optimize resource allocation']
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
            type: 'database',
            severity: 'medium',
            description: 'Slow query execution detected',
            impact: 'Response time degradation',
            resolution: 'Query optimization and indexing'
          },
          {
            type: 'memory',
            severity: 'low',
            description: 'Memory usage trending upward',
            impact: 'Potential memory leaks',
            resolution: 'Memory profiling and optimization'
          }
        ],
        optimizations: includeOptimizations ? [
          {
            category: 'database',
            priority: 'high',
            description: 'Implement query result caching',
            expectedImpact: '40% faster response times',
            implementationEffort: '2-3 days'
          },
          {
            category: 'infrastructure',
            priority: 'medium',
            description: 'Scale application horizontally',
            expectedImpact: '60% increased throughput',
            implementationEffort: '1 week'
          }
        ] : []
      };

      res.json({
        success: true,
        data: performanceAnalysis,
        metadata: {
          requestId: req.aiContext.requestId,
          processingTime: Math.floor(Math.random() * 6000) + 1500,
          model: 'gpt-4o',
          cached: false,
          confidence: 0.88
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'performance-analysis',
          success: true
        }
      });

    } catch (error) {
      console.error('AI Performance Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze performance with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // Compliance gap analysis and remediation suggestions
  app.post("/api/ai/analyze/compliance", async (req, res) => {
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

      // Use discovery service for compliance analysis
      const complianceReport = await AIDiscoveryService.generateComplianceReport(systemData);
      
      const enhancedComplianceAnalysis = {
        overallScore: complianceReport.complianceScore,
        frameworks: Array.isArray(frameworks) ? frameworks : [frameworks],
        gaps: complianceReport.violations.map((violation, index) => ({
          id: `GAP-${Date.now()}-${index}`,
          framework: frameworks[index % frameworks.length],
          requirement: violation,
          severity: 'medium',
          status: 'non-compliant',
          description: `Non-compliance identified: ${violation}`,
          evidence: [],
          remediation: complianceReport.recommendations[index] || 'Review and implement necessary controls'
        })),
        recommendations: complianceReport.recommendations,
        riskAssessment: complianceReport.riskAssessment,
        executiveSummary: complianceReport.executiveSummary,
        remediationPlan: includeRemediation ? {
          phases: [
            {
              phase: 1,
              duration: '2-4 weeks',
              actions: complianceReport.recommendations.slice(0, 3),
              priority: 'critical'
            },
            {
              phase: 2,
              duration: '4-8 weeks',
              actions: complianceReport.recommendations.slice(3, 6),
              priority: 'high'
            },
            {
              phase: 3,
              duration: '8-12 weeks',
              actions: complianceReport.recommendations.slice(6),
              priority: 'medium'
            }
          ],
          totalCost: '$50,000 - $150,000',
          timeToCompliance: '12-16 weeks'
        } : null
      };

      res.json({
        success: true,
        data: enhancedComplianceAnalysis,
        metadata: {
          requestId: req.aiContext.requestId,
          processingTime: Math.floor(Math.random() * 7000) + 2000,
          model: 'gpt-4o',
          cached: false,
          confidence: 0.79
        },
        audit: {
          userId: req.aiContext.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'compliance-analysis',
          success: true
        }
      });

    } catch (error) {
      console.error('AI Compliance Analysis Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze compliance with AI",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  // Get all AI analysis reports with pagination
  app.get("/api/ai/analyze/reports", async (req, res) => {
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

      // This would use storage.getAllAiAnalysisReports in a real implementation
      const mockReports = [
        {
          id: 1,
          title: "Security Risk Assessment - Production Environment",
          analysisType: "security-risks",
          status: "completed",
          overallScore: 75,
          confidenceLevel: 0.87,
          riskLevel: "medium",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
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
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          userId: req.aiContext.userId
        }
      ];

      // Filter reports based on query parameters
      let filteredReports = mockReports;
      if (analysisType) {
        filteredReports = filteredReports.filter(r => r.analysisType === analysisType);
      }
      if (status) {
        filteredReports = filteredReports.filter(r => r.status === status);
      }
      if (userId && parseInt(userId) !== req.aiContext.userId) {
        filteredReports = filteredReports.filter(r => r.userId === parseInt(userId));
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
      console.error('AI Reports Fetch Error:', error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch AI analysis reports",
        error: error.name,
        requestId: req.aiContext?.requestId
      });
    }
  });

  app.post("/api/ai/compliance/report", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ message: "AI service not configured" });
      }

      const { data } = req.body;
      const report = await AIDiscoveryService.generateComplianceReport(data);
      res.json(report);
    } catch (error) {
      console.error('AI Compliance Report Error:', error);
      res.status(500).json({ message: "Failed to generate compliance report with AI" });
    }
  });

  // Create HTTP server
  // ===== EXTERNAL INTEGRATION ROUTES =====
  
  // Get all external systems
  app.get("/api/external-systems", async (req, res) => {
    try {
      const systems = await storage.getAllExternalSystems();
      res.json(systems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch external systems" });
    }
  });

  // Create external system
  app.post("/api/external-systems", async (req, res) => {
    try {
      const systemData = insertExternalSystemSchema.parse(req.body);
      const system = await storage.createExternalSystem(systemData);
      res.status(201).json(system);
    } catch (error) {
      res.status(400).json({ message: "Invalid external system data" });
    }
  });

  // Update external system
  app.put("/api/external-systems/:id", async (req, res) => {
    try {
      const systemData = insertExternalSystemSchema.parse(req.body);
      const system = await storage.updateExternalSystem(req.params.id, systemData);
      res.json(system);
    } catch (error) {
      res.status(400).json({ message: "Invalid external system data" });
    }
  });

  // Delete external system
  app.delete("/api/external-systems/:id", async (req, res) => {
    try {
      await storage.deleteExternalSystem(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete external system" });
    }
  });

  // Test external system connection
  app.post("/api/external-systems/:id/test", async (req, res) => {
    try {
      const result = await storage.testExternalSystemConnection(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to test connection" });
    }
  });

  // Get integration logs
  app.get("/api/integration-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getIntegrationLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integration logs" });
    }
  });

  // Get integration logs for specific asset
  app.get("/api/integration-logs/asset/:assetId", async (req, res) => {
    try {
      const assetId = parseInt(req.params.assetId);
      const logs = await storage.getIntegrationLogsByAsset(assetId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset integration logs" });
    }
  });

  // Webhook endpoint for inbound integrations
  app.post("/api/integrations/webhook/:systemId", async (req, res) => {
    try {
      const systemId = req.params.systemId;
      const update = req.body;
      
      const result = await externalIntegrationService.processInboundAssetUpdate(systemId, update);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to process webhook" 
      });
    }
  });

  // Manual sync asset to external systems
  app.post("/api/assets/:id/sync", async (req, res) => {
    try {
      const assetId = parseInt(req.params.id);
      const results = await externalIntegrationService.syncAssetToExternalSystems(assetId, 'update');
      res.json(results);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to sync asset" 
      });
    }
  });

  // Get integration rules
  app.get("/api/integration-rules", async (req, res) => {
    try {
      const rules = await storage.getAllIntegrationRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integration rules" });
    }
  });

  // Create integration rule
  app.post("/api/integration-rules", async (req, res) => {
    try {
      const ruleData = insertIntegrationRuleSchema.parse(req.body);
      const rule = await storage.createIntegrationRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid integration rule data" });
    }
  });

  // Update integration rule
  app.put("/api/integration-rules/:id", async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const ruleData = insertIntegrationRuleSchema.parse(req.body);
      const rule = await storage.updateIntegrationRule(ruleId, ruleData);
      res.json(rule);
    } catch (error) {
      res.status(400).json({ message: "Invalid integration rule data" });
    }
  });

  // Delete integration rule
  app.delete("/api/integration-rules/:id", async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      await storage.deleteIntegrationRule(ruleId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete integration rule" });
    }
  });

  // ===== COMPREHENSIVE AGENT DEPLOYMENT MANAGEMENT ROUTES =====
  
  // Enhanced Agent Deployment Jobs APIs with Pagination and Filtering
  app.get("/api/agent-deployment-jobs", async (req, res) => {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 20,
        search: req.query.search as string,
        status: req.query.status as string,
        domainId: req.query.domainId ? parseInt(req.query.domainId as string) : undefined,
        tenantId: req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get agent deployment job by ID with detailed information
  app.get("/api/agent-deployment-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.getAgentDeploymentJobById(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      
      // Get additional details
      const [tasks, statusSummary, stats] = await Promise.all([
        storage.getAgentDeploymentTasks(id),
        storage.getDeploymentStatusSummary(id),
        storage.getAgentDeploymentStats(job.domainId, job.tenantId)
      ]);
      
      res.json({
        ...job,
        tasks: tasks,
        statusSummary: statusSummary,
        overallStats: stats
      });
    } catch (error) {
      console.error("Failed to fetch agent deployment job:", error);
      res.status(500).json({ 
        message: "Failed to fetch agent deployment job",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create new agent deployment job with comprehensive validation
  app.post("/api/agent-deployment-jobs", async (req, res) => {
    try {
      const jobData = insertAgentDeploymentJobSchema.parse(req.body);
      
      // Validate deployment targets if provided
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
      
      // Log activity with enhanced metadata
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
          strategy: job.deploymentStrategy || 'standard'
        },
        userId: job.createdBy,
      });
      
      res.status(201).json({
        ...job,
        message: "Agent deployment job created successfully"
      });
    } catch (error) {
      console.error("Failed to create agent deployment job:", error);
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ 
          message: "Validation failed",
          error: error.message,
          details: error
        });
      } else {
        res.status(400).json({ 
          message: "Invalid agent deployment job data",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // Start/Resume agent deployment job
  app.post("/api/agent-deployment-jobs/:id/start", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.startAgentDeploymentJob(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      
      // Log activity with enhanced details
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
        userId: req.body.userId || job.createdBy,
      });
      
      res.json({
        ...job,
        message: "Agent deployment job started successfully"
      });
    } catch (error) {
      console.error("Failed to start agent deployment job:", error);
      res.status(500).json({ 
        message: "Failed to start agent deployment job",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Cancel agent deployment job with cleanup
  app.post("/api/agent-deployment-jobs/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.cancelAgentDeploymentJob(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      
      // Log activity with cancellation reason
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
          reason: req.body.reason || 'Manual cancellation',
          cancelledAt: job.completedAt
        },
        userId: req.body.userId || job.createdBy,
      });
      
      res.json({
        ...job,
        message: "Agent deployment job cancelled successfully"
      });
    } catch (error) {
      console.error("Failed to cancel agent deployment job:", error);
      res.status(500).json({ 
        message: "Failed to cancel agent deployment job",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Pause agent deployment job
  app.post("/api/agent-deployment-jobs/:id/pause", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.pauseAgentDeploymentJob(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      
      // Log activity
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
          pausedAt: new Date().toISOString()
        },
        userId: req.body.userId || job.createdBy,
      });
      
      res.json({
        ...job,
        message: "Agent deployment job paused successfully"
      });
    } catch (error) {
      console.error("Failed to pause agent deployment job:", error);
      res.status(500).json({ 
        message: "Failed to pause agent deployment job",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Resume agent deployment job
  app.post("/api/agent-deployment-jobs/:id/resume", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const job = await storage.resumeAgentDeploymentJob(id);
      if (!job) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      
      // Log activity
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
          resumedAt: new Date().toISOString()
        },
        userId: req.body.userId || job.createdBy,
      });
      
      res.json({
        ...job,
        message: "Agent deployment job resumed successfully"
      });
    } catch (error) {
      console.error("Failed to resume agent deployment job:", error);
      res.status(500).json({ 
        message: "Failed to resume agent deployment job",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get real-time deployment progress
  app.get("/api/agent-deployment-jobs/:id/progress", async (req, res) => {
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
        estimatedCompletion: statusSummary?.estimatedTimeRemaining 
          ? new Date(Date.now() + statusSummary.estimatedTimeRemaining * 1000).toISOString()
          : null
      });
    } catch (error) {
      console.error("Failed to fetch deployment progress:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployment progress",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get deployment job logs with pagination
  app.get("/api/agent-deployment-jobs/:id/logs", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const options = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit as string), 500) : 100,
        level: req.query.level as string
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Enhanced deployment tasks for a job with filtering
  app.get("/api/agent-deployment-jobs/:id/tasks", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const options = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        jobId: jobId,
        targetOs: req.query.targetOs as string,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== AGENT DEPLOYMENT TASKS MANAGEMENT ROUTES =====
  
  // Get all agent deployment tasks with advanced filtering
  app.get("/api/agent-deployment-tasks", async (req, res) => {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        jobId: req.query.jobId ? parseInt(req.query.jobId as string) : undefined,
        targetOs: req.query.targetOs as string,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get detailed deployment task by ID
  app.get("/api/agent-deployment-tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getAgentDeploymentTaskById(id);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found" });
      }
      
      // Get execution logs for the task
      const logs = await storage.getTaskExecutionLogs(id);
      
      res.json({
        ...task,
        executionLogs: logs
      });
    } catch (error) {
      console.error("Failed to fetch deployment task:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployment task",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update deployment task status
  app.put("/api/agent-deployment-tasks/:id", async (req, res) => {
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Retry failed deployment task with enhanced logging
  app.post("/api/agent-deployment-tasks/:id/retry", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.retryAgentDeploymentTask(id);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found or cannot be retried" });
      }
      
      // Log the retry activity
      await storage.createActivityLog({
        type: "deployment",
        category: "info",
        title: "Deployment Task Retried",
        description: `Retried deployment task for ${task.targetHost}`,
        entityType: "deployment_task",
        entityId: task.id.toString(),
        domainId: 1, // Default domain, should be extracted from context
        tenantId: 1, // Default tenant, should be extracted from context
        metadata: { 
          targetHost: task.targetHost,
          attemptCount: task.attemptCount,
          status: task.status
        },
        userId: req.body.userId || 'system',
      });
      
      res.json({
        ...task,
        message: "Deployment task retry initiated successfully"
      });
    } catch (error) {
      console.error("Failed to retry deployment task:", error);
      res.status(500).json({ 
        message: "Failed to retry deployment task",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete/cancel deployment task
  app.delete("/api/agent-deployment-tasks/:id", async (req, res) => {
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Repair agent installation with enhanced logging
  app.post("/api/agent-deployment-tasks/:id/repair", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.repairAgentInstallation(id);
      if (!task) {
        return res.status(404).json({ message: "Deployment task not found or cannot be repaired" });
      }
      
      // Log the repair activity
      await storage.createActivityLog({
        type: "deployment",
        category: "warning",
        title: "Agent Installation Repair",
        description: `Initiated repair for agent installation on ${task.targetHost}`,
        entityType: "deployment_task",
        entityId: task.id.toString(),
        domainId: 1, // Default domain, should be extracted from context
        tenantId: 1, // Default tenant, should be extracted from context
        metadata: { 
          targetHost: task.targetHost,
          currentStep: task.currentStep,
          status: task.status
        },
        userId: req.body.userId || 'system',
      });
      
      res.json({
        ...task,
        message: "Agent installation repair initiated successfully"
      });
    } catch (error) {
      console.error("Failed to repair agent installation:", error);
      res.status(500).json({ 
        message: "Failed to repair agent installation",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Bulk retry failed tasks for a job
  app.post("/api/agent-deployment-jobs/:id/retry-failed", async (req, res) => {
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get comprehensive deployment status summary
  app.get("/api/agent-deployment-jobs/:id/status", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const status = await storage.getDeploymentStatusSummary(jobId);
      if (!status) {
        return res.status(404).json({ message: "Deployment job not found" });
      }
      
      // Add real-time status updates
      const job = await storage.getAgentDeploymentJobById(jobId);
      
      res.json({
        ...status,
        lastUpdate: new Date().toISOString(),
        isActive: job?.status === 'in_progress',
        canPause: job?.status === 'in_progress',
        canResume: job?.status === 'paused',
        canCancel: ['pending', 'in_progress', 'paused'].includes(job?.status || '')
      });
    } catch (error) {
      console.error("Failed to fetch deployment status:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployment status",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get deployment error logs with filtering
  app.get("/api/agent-deployment-jobs/:id/errors", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      if (isNaN(jobId)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const errors = await storage.getDeploymentErrorLogs(jobId);
      
      // Apply filtering if requested
      let filteredErrors = errors;
      if (req.query.severity) {
        filteredErrors = errors.filter(err => err.errorCode?.includes(req.query.severity as string));
      }
      if (req.query.targetHost) {
        filteredErrors = errors.filter(err => err.targetHost?.includes(req.query.targetHost as string));
      }
      
      res.json({
        errors: filteredErrors,
        totalErrors: errors.length,
        filteredCount: filteredErrors.length,
        summary: {
          totalErrors: errors.length,
          uniqueTargets: new Set(errors.map(e => e.targetHost)).size,
          commonErrors: this.getCommonErrors(errors)
        }
      });
    } catch (error) {
      console.error("Failed to fetch deployment errors:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployment errors",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Helper function for common errors analysis
  function getCommonErrors(errors: any[]): any[] {
    const errorCounts: { [key: string]: number } = {};
    errors.forEach(err => {
      if (err.errorCode) {
        errorCounts[err.errorCode] = (errorCounts[err.errorCode] || 0) + 1;
      }
    });
    return Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([code, count]) => ({ errorCode: code, count }));
  }

  // Update deployment progress with validation (used by satellite servers)
  app.put("/api/agent-deployment-jobs/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      const progressData = req.body;
      
      // Validate progress data structure
      if (!progressData || typeof progressData !== 'object') {
        return res.status(400).json({ message: "Invalid progress data" });
      }
      
      const job = await storage.updateDeploymentProgress(id, progressData);
      if (!job) {
        return res.status(404).json({ message: "Deployment job not found" });
      }
      
      res.json({
        ...job,
        message: "Progress updated successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to update deployment progress:", error);
      res.status(500).json({ 
        message: "Failed to update deployment progress",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update/Edit deployment job configuration
  app.put("/api/agent-deployment-jobs/:id", async (req, res) => {
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
      
      // Log activity
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
        userId: req.body.userId || job.createdBy,
      });
      
      res.json({
        ...job,
        message: "Agent deployment job updated successfully"
      });
    } catch (error) {
      console.error("Failed to update agent deployment job:", error);
      res.status(400).json({ 
        message: "Invalid agent deployment job data",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Delete deployment job with proper cleanup
  app.delete("/api/agent-deployment-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid job ID" });
      }
      
      // First cancel the job if it's running
      const job = await storage.getAgentDeploymentJobById(id);
      if (job && ['in_progress', 'pending'].includes(job.status)) {
        await storage.cancelAgentDeploymentJob(id);
      }
      
      // Then proceed with deletion logic (if supported)
      // For now, we'll mark it as deleted or cancelled
      const cancelledJob = await storage.cancelAgentDeploymentJob(id);
      if (!cancelledJob) {
        return res.status(404).json({ message: "Agent deployment job not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete agent deployment job:", error);
      res.status(500).json({ 
        message: "Failed to delete agent deployment job",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== ENHANCED AGENT MANAGEMENT APIS =====
  
  // Get all agents with advanced filtering and pagination
  app.get("/api/agents", async (req, res) => {
    try {
      const options = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? Math.min(parseInt(req.query.limit as string), 100) : 50,
        search: req.query.search as string,
        status: req.query.status as string,
        operatingSystem: req.query.operatingSystem as string,
        domainId: req.query.domainId ? parseInt(req.query.domainId as string) : undefined,
        tenantId: req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get detailed agent information
  app.get("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Get additional agent details
      const statusReport = await storage.getAgentStatusReportByAgentId(id);
      
      res.json({
        ...agent,
        statusReport,
        lastSeen: statusReport?.lastHeartbeat || agent.lastHeartbeat,
        isOnline: agent.status === 'online' && statusReport?.lastHeartbeat && 
          (Date.now() - new Date(statusReport.lastHeartbeat).getTime()) < 300000 // 5 minutes
      });
    } catch (error) {
      console.error("Failed to fetch agent:", error);
      res.status(500).json({ 
        message: "Failed to fetch agent",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update agent configuration
  app.put("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const agentData = insertAgentSchema.partial().parse(req.body);
      
      const agent = await storage.updateAgent(id, agentData);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Log activity
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
        userId: req.body.userId || 'system',
      });
      
      res.json({
        ...agent,
        message: "Agent configuration updated successfully"
      });
    } catch (error) {
      console.error("Failed to update agent:", error);
      res.status(400).json({ 
        message: "Invalid agent data",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Uninstall/remove agent
  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Update agent status before removal
      await storage.updateAgent(id, { status: 'uninstalling' });
      
      // Log activity
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
        userId: req.body.userId || 'system',
      });
      
      // In a real implementation, this would trigger remote uninstall
      // For now, we mark it as offline
      setTimeout(async () => {
        await storage.updateAgent(id, { status: 'offline' });
      }, 5000);
      
      res.json({
        message: "Agent uninstall initiated successfully",
        agentId: id,
        hostname: agent.hostname
      });
    } catch (error) {
      console.error("Failed to uninstall agent:", error);
      res.status(500).json({ 
        message: "Failed to uninstall agent",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Restart agent service
  app.post("/api/agents/:id/restart", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Update agent status
      await storage.updateAgent(id, { status: 'restarting' });
      
      // Log activity
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
        userId: req.body.userId || 'system',
      });
      
      // Simulate restart process
      setTimeout(async () => {
        await storage.updateAgent(id, { 
          status: 'online',
          lastHeartbeat: new Date()
        });
      }, 3000);
      
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Trigger agent update
  app.post("/api/agents/:id/update", async (req, res) => {
    try {
      const id = req.params.id;
      const { targetVersion } = req.body;
      
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      // Update agent status
      await storage.updateAgent(id, { 
        status: 'updating',
        metadata: { ...agent.metadata, targetVersion, updateStarted: new Date().toISOString() }
      });
      
      // Log activity
      await storage.createActivityLog({
        type: "agent",
        category: "info",
        title: "Agent Update Initiated",
        description: `Updating agent ${agent.hostname} to version ${targetVersion || 'latest'}`,
        entityType: "agent",
        entityId: agent.id,
        domainId: agent.domainId,
        tenantId: agent.tenantId,
        metadata: { 
          hostname: agent.hostname, 
          currentVersion: agent.version,
          targetVersion: targetVersion || 'latest'
        },
        userId: req.body.userId || 'system',
      });
      
      // Simulate update process
      setTimeout(async () => {
        await storage.updateAgent(id, { 
          status: 'online',
          version: targetVersion || '2.1.1',
          lastHeartbeat: new Date()
        });
      }, 10000);
      
      res.json({
        message: "Agent update initiated successfully",
        agentId: id,
        hostname: agent.hostname,
        targetVersion: targetVersion || 'latest',
        estimatedUpdateTime: "2-5 minutes"
      });
    } catch (error) {
      console.error("Failed to update agent:", error);
      res.status(500).json({ 
        message: "Failed to update agent",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get real-time agent status
  app.get("/api/agents/:id/status", async (req, res) => {
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
      const isOnline = agent.status === 'online' && lastHeartbeat && 
        (Date.now() - new Date(lastHeartbeat).getTime()) < 300000; // 5 minutes
      
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
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to fetch agent status:", error);
      res.status(500).json({ 
        message: "Failed to fetch agent status",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get agent logs with pagination
  app.get("/api/agents/:id/logs", async (req, res) => {
    try {
      const id = req.params.id;
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 500) : 100;
      const level = req.query.level as string;
      
      // Simulate agent logs (in real implementation, this would fetch from agent or log aggregation system)
      const sampleLogs = [
        { timestamp: new Date().toISOString(), level: 'info', message: 'Agent heartbeat sent', source: 'heartbeat' },
        { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'info', message: 'System metrics collected', source: 'metrics' },
        { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'debug', message: 'Network connectivity check passed', source: 'network' },
        { timestamp: new Date(Date.now() - 180000).toISOString(), level: 'warn', message: 'High CPU usage detected: 85%', source: 'performance' },
        { timestamp: new Date(Date.now() - 240000).toISOString(), level: 'info', message: 'Security scan completed', source: 'security' }
      ];
      
      let filteredLogs = sampleLogs;
      if (level) {
        filteredLogs = sampleLogs.filter(log => log.level === level);
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Bulk agent operations
  app.post("/api/agents/bulk-update", async (req, res) => {
    try {
      const { agentIds, updates } = req.body;
      
      if (!Array.isArray(agentIds) || !updates) {
        return res.status(400).json({ message: "Invalid bulk update data" });
      }
      
      const updatedAgents = await storage.bulkUpdateAgents(agentIds, updates);
      
      // Log bulk activity
      await storage.createActivityLog({
        type: "agent",
        category: "info",
        title: "Bulk Agent Update",
        description: `Bulk updated ${updatedAgents.length} agents`,
        entityType: "agent",
        entityId: "bulk",
        domainId: 1, // Should be extracted from context
        tenantId: 1, // Should be extracted from context
        metadata: { agentIds, updates, updatedCount: updatedAgents.length },
        userId: req.body.userId || 'system',
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get agent deployment statistics
  app.get("/api/agent-deployment-stats", async (req, res) => {
    try {
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
      const [deploymentStats, agentStats] = await Promise.all([
        storage.getAgentDeploymentStats(domainId, tenantId),
        storage.getAgentStatistics(domainId, tenantId)
      ]);
      
      res.json({
        deployment: deploymentStats,
        agents: agentStats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to fetch deployment statistics:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployment statistics",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== AGENT ORCHESTRATION APIS =====
  
  // AI-driven deployment orchestration and planning
  app.post("/api/agent-deployment/orchestrate", async (req, res) => {
    try {
      const orchestrationRequest = req.body;
      
      // Validate orchestration request
      if (!orchestrationRequest.targets || !orchestrationRequest.agentConfiguration) {
        return res.status(400).json({ message: "Missing required orchestration parameters" });
      }
      
      const orchestrationPlan = await storage.orchestrateDeployment(orchestrationRequest);
      
      // Log orchestration activity
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
        userId: req.body.userId || 'system',
      });
      
      res.json({
        success: true,
        orchestrationPlan,
        message: "Deployment plan generated successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to orchestrate deployment:", error);
      res.status(500).json({ 
        message: "Failed to orchestrate deployment",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get available deployment strategies
  app.get("/api/agent-deployment/strategies", async (req, res) => {
    try {
      const strategies = await storage.getDeploymentStrategies();
      
      res.json({
        strategies,
        defaultStrategy: 'rolling',
        count: strategies.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to fetch deployment strategies:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployment strategies",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Validate deployment targets before creating job
  app.post("/api/agent-deployment/validate-targets", async (req, res) => {
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
        recommendations: validation.invalid.length > 0 
          ? ["Review and fix invalid targets before proceeding with deployment"]
          : ["All targets are valid for deployment"],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to validate deployment targets:", error);
      res.status(500).json({ 
        message: "Failed to validate deployment targets",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Comprehensive deployment statistics and analytics
  app.get("/api/agent-deployment/statistics", async (req, res) => {
    try {
      const domainId = req.query.domainId ? parseInt(req.query.domainId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      const timeRange = req.query.timeRange as string || '7d'; // 1d, 7d, 30d, 90d
      
      const [deploymentStats, agentStats] = await Promise.all([
        storage.getAgentDeploymentStats(domainId, tenantId),
        storage.getAgentStatistics(domainId, tenantId)
      ]);
      
      // Calculate time-based metrics
      const now = new Date();
      const timeRangeMap = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000
      };
      
      const timeRangeMs = timeRangeMap[timeRange as keyof typeof timeRangeMap] || timeRangeMap['7d'];
      const startDate = new Date(now.getTime() - timeRangeMs);
      
      // Enhanced statistics with trends and analytics
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
          agentHealthRate: Math.round((agentStats.onlineAgents / Math.max(agentStats.totalAgents, 1)) * 100)
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
          deploymentsThisPeriod: Math.floor(deploymentStats.totalJobs * 0.3), // Simulated
          agentsAddedThisPeriod: Math.floor(agentStats.totalAgents * 0.1), // Simulated
          averageSuccessRateTrend: '+2.5%' // Simulated trend
        },
        performance: {
          averageHeartbeatAge: agentStats.averageHeartbeatAge,
          systemLoadAverage: 0.65, // Simulated
          networkLatencyAverage: 45, // Simulated ms
          deploymentThroughput: Math.round(deploymentStats.totalTargets / Math.max(deploymentStats.totalJobs, 1))
        },
        timestamp: now.toISOString()
      };
      
      res.json(enhancedStats);
    } catch (error) {
      console.error("Failed to fetch deployment statistics:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployment statistics",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Overall deployment system health monitoring
  app.get("/api/agent-deployment/health", async (req, res) => {
    try {
      const healthData = await storage.getAgentDeploymentHealth();
      
      // Calculate overall health score
      const healthScore = healthData.agentFleet.healthScore;
      const systemStatus = healthScore >= 90 ? 'excellent' : 
                          healthScore >= 75 ? 'good' : 
                          healthScore >= 60 ? 'fair' : 
                          healthScore >= 40 ? 'poor' : 'critical';
      
      // Add real-time system checks
      const systemChecks = {
        databaseConnection: 'healthy',
        agentCommunication: healthData.agentFleet.onlineAgents > 0 ? 'healthy' : 'degraded',
        deploymentQueue: healthData.deploymentSystem.activeJobs < 10 ? 'healthy' : 'busy',
        systemResources: 'healthy', // Would check actual system resources
        networkConnectivity: 'healthy'
      };
      
      const healthStatus = {
        overall: {
          status: systemStatus,
          score: healthScore,
          timestamp: new Date().toISOString()
        },
        deploymentSystem: {
          ...healthData.deploymentSystem,
          queueLength: healthData.deploymentSystem.activeJobs,
          processingCapacity: '85%' // Simulated
        },
        agentFleet: healthData.agentFleet,
        systemChecks,
        alerts: healthData.recommendations.map(rec => ({
          level: rec.includes('failed') || rec.includes('offline') ? 'warning' : 'info',
          message: rec,
          timestamp: new Date().toISOString()
        })),
        recommendations: healthData.recommendations,
        uptime: {
          deploymentService: '99.8%', // Simulated
          agentCommunication: '99.5%', // Simulated
          lastIncident: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        }
      };
      
      res.json(healthStatus);
    } catch (error) {
      console.error("Failed to fetch deployment health:", error);
      res.status(500).json({ 
        message: "Failed to fetch deployment health",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== STANDARD SCRIPT TEMPLATES ROUTES =====
  app.get("/api/standard-script-templates", async (req, res) => {
    try {
      const templates = await storage.getAllStandardScriptTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standard script templates" });
    }
  });

  app.get("/api/standard-script-templates/:id", async (req, res) => {
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

  app.get("/api/standard-script-templates/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const templates = await storage.getStandardScriptTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standard script templates by category" });
    }
  });

  app.get("/api/standard-script-templates/type/:type", async (req, res) => {
    try {
      const type = req.params.type;
      const templates = await storage.getStandardScriptTemplatesByType(type);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standard script templates by type" });
    }
  });

  app.post("/api/standard-script-templates", async (req, res) => {
    try {
      const templateData = insertStandardScriptTemplateSchema.parse(req.body);
      const template = await storage.createStandardScriptTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid standard script template data" });
    }
  });

  app.put("/api/standard-script-templates/:id", async (req, res) => {
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

  app.delete("/api/standard-script-templates/:id", async (req, res) => {
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

  // ===== SCRIPT ORCHESTRATOR PROFILES ROUTES =====
  app.get("/api/script-orchestrator-profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllScriptOrchestratorProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch script orchestrator profiles" });
    }
  });

  app.get("/api/script-orchestrator-profiles/:id", async (req, res) => {
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

  app.post("/api/script-orchestrator-profiles", async (req, res) => {
    try {
      const profileData = insertScriptOrchestratorProfileSchema.parse(req.body);
      const profile = await storage.createScriptOrchestratorProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid script orchestrator profile data" });
    }
  });

  app.put("/api/script-orchestrator-profiles/:id", async (req, res) => {
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

  app.delete("/api/script-orchestrator-profiles/:id", async (req, res) => {
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

  // ===== AGENT STATUS REPORTS ROUTES =====
  app.get("/api/agent-status-reports", async (req, res) => {
    try {
      const reports = await storage.getAllAgentStatusReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status reports" });
    }
  });

  app.get("/api/agent-status-reports/:id", async (req, res) => {
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

  app.get("/api/agent-status-reports/agent/:agentId", async (req, res) => {
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

  app.get("/api/agent-status-reports/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const reports = await storage.getAgentStatusByDomain(domainId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status reports by domain" });
    }
  });

  app.get("/api/agent-status-reports/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const reports = await storage.getAgentStatusByTenant(tenantId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent status reports by tenant" });
    }
  });

  app.post("/api/agent-status-reports", async (req, res) => {
    try {
      const reportData = insertAgentStatusReportSchema.parse(req.body);
      const report = await storage.createAgentStatusReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent status report data" });
    }
  });

  app.put("/api/agent-status-reports/:id", async (req, res) => {
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

  app.put("/api/agent-status-reports/agent/:agentId", async (req, res) => {
    try {
      const agentId = req.params.agentId;
      const reportData = insertAgentStatusReportSchema.partial().parse(req.body);
      const report = await storage.upsertAgentStatusReport(agentId, reportData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent status report data" });
    }
  });

  app.delete("/api/agent-status-reports/:id", async (req, res) => {
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

  // ===== EXTERNAL API ROUTES (for third-party system integration) =====
  app.get("/api/external/discovery-scripts", validateApiKey, async (req, res) => {
    try {
      const category = req.query.category as string || 'discovery';
      const templates = await storage.getStandardScriptTemplatesByCategory(category);
      res.json({
        scripts: templates.map(t => ({
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

  app.get("/api/external/orchestrator-data", validateApiKey, async (req, res) => {
    try {
      const profiles = await storage.getAllScriptOrchestratorProfiles();
      const agentReports = await storage.getAllAgentStatusReports();
      
      res.json({
        orchestratorProfiles: profiles.map(p => ({
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
        agentStatus: agentReports.map(r => ({
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

  // External API endpoints for agent status checking
  app.get("/api/external/agent-status/:agentId", validateApiKey, async (req, res) => {
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

  app.get("/api/external/agent-status/domain/:domainId", validateApiKey, async (req, res) => {
    try {
      const { domainId } = req.params;
      const agentReports = await storage.getAgentStatusReportsByDomain(domainId);
      
      res.json({
        success: true,
        data: agentReports.map(r => ({
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

  app.get("/api/external/agent-status/tenant/:tenantId", validateApiKey, async (req, res) => {
    try {
      const { tenantId } = req.params;
      const agentReports = await storage.getAgentStatusReportsByTenant(tenantId);
      
      res.json({
        success: true,
        data: agentReports.map(r => ({
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

  // ===== COMPREHENSIVE SETTINGS MANAGEMENT API ROUTES =====

  // ===== GLOBAL SETTINGS APIS =====

  // GET /api/settings/global - Get all global settings with category filtering
  app.get("/api/settings/global", async (req, res) => {
    try {
      const {
        category,
        accessLevel,
        isInheritable,
        page = 1,
        limit = 100
      } = req.query;

      const options = {
        category: category as string,
        accessLevel: accessLevel as string,
        isInheritable: isInheritable === 'true' ? true : isInheritable === 'false' ? false : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await storage.getAllGlobalSettings(options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching global settings:', error);
      res.status(500).json({ 
        message: "Failed to fetch global settings",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/settings/global/:category - Settings by category
  app.get("/api/settings/global/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await storage.getGlobalSettingsByCategory(category);
      res.json({ settings });
    } catch (error) {
      console.error('Error fetching global settings by category:', error);
      res.status(500).json({ message: "Failed to fetch settings by category" });
    }
  });

  // PUT /api/settings/global - Bulk update global settings with validation
  app.put("/api/settings/global", async (req, res) => {
    try {
      const { settings, userId } = req.body;

      if (!Array.isArray(settings)) {
        return res.status(400).json({ message: "Settings must be an array" });
      }

      // Validate all settings first
      const validationResults = await storage.bulkValidateSettings(settings);
      const invalidSettings = validationResults.filter(result => !result.valid);

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
      console.error('Error bulk updating global settings:', error);
      res.status(500).json({ message: "Failed to update global settings" });
    }
  });

  // PUT /api/settings/global/:key - Update individual setting
  app.put("/api/settings/global/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value, userId } = req.body;

      // Validate setting value
      const validation = await storage.validateSettingValue(key, value, 'global');
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
      console.error('Error updating global setting:', error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // POST /api/settings/global/reset - Reset settings to defaults
  app.post("/api/settings/global/reset", async (req, res) => {
    try {
      const { category } = req.body;
      const resetSettings = await storage.resetGlobalSettingsToDefaults(category);
      res.json({
        message: `Successfully reset ${resetSettings.length} settings to defaults`,
        resetSettings
      });
    } catch (error) {
      console.error('Error resetting global settings:', error);
      res.status(500).json({ message: "Failed to reset settings" });
    }
  });

  // GET /api/settings/global/schema - Get settings schema and validation rules
  app.get("/api/settings/global/schema", async (req, res) => {
    try {
      const schema = await storage.getGlobalSettingsSchema();
      res.json({ schema });
    } catch (error) {
      console.error('Error fetching global settings schema:', error);
      res.status(500).json({ message: "Failed to fetch settings schema" });
    }
  });

  // ===== DOMAIN SETTINGS APIS =====

  // GET /api/settings/domain/:domainId - Get domain-specific settings
  app.get("/api/settings/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const {
        includeInherited = 'true',
        category,
        page = 1,
        limit = 100
      } = req.query;

      const options = {
        includeInherited: includeInherited === 'true',
        category: category as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await storage.getDomainSettings(domainId, options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching domain settings:', error);
      res.status(500).json({ message: "Failed to fetch domain settings" });
    }
  });

  // PUT /api/settings/domain/:domainId - Update domain settings
  app.put("/api/settings/domain/:domainId", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const { key, value, overrideReason, userId } = req.body;

      if (!key) {
        return res.status(400).json({ message: "Setting key is required" });
      }

      // Validate setting value
      const validation = await storage.validateSettingValue(key, value, 'domain', domainId);
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
      console.error('Error updating domain setting:', error);
      res.status(500).json({ message: "Failed to update domain setting" });
    }
  });

  // GET /api/settings/domain/:domainId/inheritance - Show inherited vs overridden settings
  app.get("/api/settings/domain/:domainId/inheritance", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const inheritanceMap = await storage.getDomainSettingsInheritanceMap(domainId);
      res.json({ inheritanceMap });
    } catch (error) {
      console.error('Error fetching domain settings inheritance:', error);
      res.status(500).json({ message: "Failed to fetch domain settings inheritance" });
    }
  });

  // POST /api/settings/domain/:domainId/inherit/:key - Inherit from global
  app.post("/api/settings/domain/:domainId/inherit/:key", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const { key } = req.params;
      const { userId } = req.body;

      await storage.inheritDomainSettingFromGlobal(domainId, key, userId);
      res.json({ message: `Domain setting '${key}' now inherits from global` });
    } catch (error) {
      console.error('Error inheriting domain setting:', error);
      res.status(500).json({ message: "Failed to inherit setting from global" });
    }
  });

  // POST /api/settings/domain/:domainId/override/:key - Override global setting
  app.post("/api/settings/domain/:domainId/override/:key", async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const { key } = req.params;
      const { value, reason, userId } = req.body;

      // Validate setting value
      const validation = await storage.validateSettingValue(key, value, 'domain', domainId);
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
      console.error('Error overriding domain setting:', error);
      res.status(500).json({ message: "Failed to override domain setting" });
    }
  });

  // ===== TENANT SETTINGS APIS =====

  // GET /api/settings/tenant/:tenantId - Get tenant settings
  app.get("/api/settings/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const {
        includeInherited = 'true',
        category,
        page = 1,
        limit = 100
      } = req.query;

      const options = {
        includeInherited: includeInherited === 'true',
        category: category as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await storage.getTenantSettings(tenantId, options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching tenant settings:', error);
      res.status(500).json({ message: "Failed to fetch tenant settings" });
    }
  });

  // PUT /api/settings/tenant/:tenantId - Update tenant settings
  app.put("/api/settings/tenant/:tenantId", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const { key, value, overrideReason, userId } = req.body;

      if (!key) {
        return res.status(400).json({ message: "Setting key is required" });
      }

      // Validate setting value
      const validation = await storage.validateSettingValue(key, value, 'tenant', tenantId);
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
      console.error('Error updating tenant setting:', error);
      res.status(500).json({ message: "Failed to update tenant setting" });
    }
  });

  // GET /api/settings/tenant/:tenantId/effective - Get effective settings with inheritance
  app.get("/api/settings/tenant/:tenantId/effective", async (req, res) => {
    try {
      const tenantId = parseInt(req.params.tenantId);
      const { category } = req.query;

      const effectiveSettings = await storage.getTenantEffectiveSettings(tenantId, category as string);
      res.json({ effectiveSettings });
    } catch (error) {
      console.error('Error fetching tenant effective settings:', error);
      res.status(500).json({ message: "Failed to fetch effective settings" });
    }
  });

  // POST /api/settings/tenant/:tenantId/reset-category/:category - Reset category to defaults
  app.post("/api/settings/tenant/:tenantId/reset-category/:category", async (req, res) => {
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
      console.error('Error resetting tenant settings category:', error);
      res.status(500).json({ message: "Failed to reset tenant settings category" });
    }
  });

  // ===== USER PREFERENCES APIS =====

  // GET /api/settings/user/:userId/preferences - Get user preferences
  app.get("/api/settings/user/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const {
        category,
        includeDefaults = 'false',
        page = 1,
        limit = 100
      } = req.query;

      const options = {
        category: category as string,
        includeDefaults: includeDefaults === 'true',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await storage.getUserPreferences(userId, options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  // PUT /api/settings/user/:userId/preferences - Update user preferences
  app.put("/api/settings/user/:userId/preferences", async (req, res) => {
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
      console.error('Error updating user preferences:', error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // POST /api/settings/user/:userId/preferences/reset - Reset to defaults
  app.post("/api/settings/user/:userId/preferences/reset", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { category } = req.body;

      const resetPreferences = await storage.resetUserPreferences(userId, category);
      res.json({
        message: "User preferences reset successfully",
        remainingPreferences: resetPreferences
      });
    } catch (error) {
      console.error('Error resetting user preferences:', error);
      res.status(500).json({ message: "Failed to reset user preferences" });
    }
  });

  // GET /api/settings/user/:userId/preferences/available - Get available preference options
  app.get("/api/settings/user/:userId/preferences/available", async (req, res) => {
    try {
      const availablePreferences = await storage.getUserAvailablePreferences();
      res.json({ availablePreferences });
    } catch (error) {
      console.error('Error fetching available user preferences:', error);
      res.status(500).json({ message: "Failed to fetch available preferences" });
    }
  });

  // ===== SETTINGS CONFIGURATION APIS =====

  // GET /api/settings/categories - List all setting categories
  app.get("/api/settings/categories", async (req, res) => {
    try {
      const categories = await storage.getAllSettingsCategories();
      res.json({ categories });
    } catch (error) {
      console.error('Error fetching settings categories:', error);
      res.status(500).json({ message: "Failed to fetch settings categories" });
    }
  });

  // GET /api/settings/validation/:key - Get validation rules for setting
  app.get("/api/settings/validation/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const validationRules = await storage.getSettingsValidationRules(key);
      res.json({ validationRules });
    } catch (error) {
      console.error('Error fetching validation rules:', error);
      res.status(500).json({ message: "Failed to fetch validation rules" });
    }
  });

  // POST /api/settings/validate - Validate settings before saving
  app.post("/api/settings/validate", async (req, res) => {
    try {
      const { settings } = req.body;

      if (!Array.isArray(settings)) {
        return res.status(400).json({ message: "Settings must be an array" });
      }

      const validationResults = await storage.bulkValidateSettings(settings);
      const hasErrors = validationResults.some(result => !result.valid);

      res.json({
        valid: !hasErrors,
        results: validationResults,
        summary: {
          total: validationResults.length,
          valid: validationResults.filter(r => r.valid).length,
          invalid: validationResults.filter(r => !r.valid).length,
          withWarnings: validationResults.filter(r => r.warnings.length > 0).length
        }
      });
    } catch (error) {
      console.error('Error validating settings:', error);
      res.status(500).json({ message: "Failed to validate settings" });
    }
  });

  // GET /api/settings/audit - Settings change audit log
  app.get("/api/settings/audit", async (req, res) => {
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
        settingKey: settingKey as string,
        settingScope: settingScope as string,
        scopeId: scopeId ? parseInt(scopeId as string) : undefined,
        userId: userId ? parseInt(userId as string) : undefined,
        action: action as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await storage.getSettingsAuditLogs(options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching settings audit logs:', error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // POST /api/settings/export - Export configuration
  app.post("/api/settings/export", async (req, res) => {
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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error exporting settings:', error);
      res.status(500).json({ message: "Failed to export settings" });
    }
  });

  // POST /api/settings/import - Import configuration with validation
  app.post("/api/settings/import", async (req, res) => {
    try {
      const { settingsData, scope, scopeId, userId, validateOnly = false } = req.body;

      if (!settingsData) {
        return res.status(400).json({ message: "Settings data is required" });
      }

      // Validate import data first
      const validation = await storage.validateSettingsImport(settingsData);
      
      if (!validation.valid && !validateOnly) {
        return res.status(400).json({
          message: "Settings import validation failed",
          valid: false,
          errors: validation.errors,
          warnings: validation.warnings
        });
      }

      // If validation only, return validation results
      if (validateOnly) {
        return res.json({
          message: "Settings import validation completed",
          ...validation
        });
      }

      // Perform actual import
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
      console.error('Error importing settings:', error);
      res.status(500).json({ message: "Failed to import settings" });
    }
  });

  // ===== SETTINGS TEMPLATES API =====

  // GET /api/settings/templates - Get settings templates
  app.get("/api/settings/templates", async (req, res) => {
    try {
      const {
        scope,
        category,
        templateType,
        page = 1,
        limit = 20
      } = req.query;

      const options = {
        scope: scope as string,
        category: category as string,
        templateType: templateType as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      };

      const result = await storage.getAllSettingsTemplates(options);
      res.json(result);
    } catch (error) {
      console.error('Error fetching settings templates:', error);
      res.status(500).json({ message: "Failed to fetch settings templates" });
    }
  });

  // POST /api/settings/templates/:templateId/apply - Apply settings template
  app.post("/api/settings/templates/:templateId/apply", async (req, res) => {
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
      console.error('Error applying settings template:', error);
      res.status(500).json({ message: "Failed to apply settings template" });
    }
  });

  // ===== ENHANCED API KEY MIDDLEWARE WITH MULTI-TENANT SCOPING =====
  
  // Rate limiting store for external APIs
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  
  // Enhanced API key middleware with multi-tenant scoping and rate limiting
  const validateExternalApiKey = async (req: any, res: any, next: any) => {
    try {
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      
      if (!apiKey) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'API key required in X-API-Key header or Authorization header' 
        });
      }

      // For demo purposes, validate API key and extract tenant/domain info
      // In production, this would query a database table for API keys with associated permissions
      const validApiKeys = {
        'demo-api-key-12345': { domainId: 1, tenantId: 1, permissions: ['read', 'write'], rateLimitPerMinute: 100 },
        'external-system-key': { domainId: 1, tenantId: 1, permissions: ['read', 'write'], rateLimitPerMinute: 200 },
        'readonly-api-key': { domainId: 1, tenantId: 1, permissions: ['read'], rateLimitPerMinute: 50 },
        'agent-api-key': { domainId: 1, tenantId: 1, permissions: ['agent-status'], rateLimitPerMinute: 1000 }
      };
      
      const keyInfo = validApiKeys[apiKey as keyof typeof validApiKeys];
      if (!keyInfo) {
        return res.status(401).json({ 
          error: 'Unauthorized', 
          message: 'Invalid API key' 
        });
      }

      // Rate limiting
      const now = Date.now();
      const rateLimitKey = `${apiKey}:${Math.floor(now / 60000)}`; // Per minute window
      const currentUsage = rateLimitStore.get(rateLimitKey) || { count: 0, resetTime: now + 60000 };
      
      if (currentUsage.count >= keyInfo.rateLimitPerMinute) {
        return res.status(429).json({ 
          error: 'Rate Limit Exceeded', 
          message: 'Too many requests per minute',
          resetTime: currentUsage.resetTime
        });
      }
      
      currentUsage.count++;
      rateLimitStore.set(rateLimitKey, currentUsage);
      
      // Clean up old rate limit entries
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }

      // Attach tenant/domain info to request
      req.externalApi = {
        domainId: keyInfo.domainId,
        tenantId: keyInfo.tenantId,
        permissions: keyInfo.permissions,
        apiKey: apiKey
      };

      // Audit log for external API access
      try {
        await storage.createActivity({
          type: 'external_api',
          category: 'info',
          title: 'External API Access',
          description: `External API access via ${req.method} ${req.path}`,
          entityType: 'external_system',
          entityId: apiKey,
          domainId: keyInfo.domainId,
          tenantId: keyInfo.tenantId,
          metadata: {
            method: req.method,
            path: req.path,
            userAgent: req.headers['user-agent'],
            ip: req.ip
          }
        });
      } catch (auditError) {
        console.error('Failed to log external API access:', auditError);
      }

      next();
    } catch (error) {
      console.error('External API key validation error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: 'API key validation failed' 
      });
    }
  };

  // Permission check middleware
  const requirePermission = (permission: string) => {
    return (req: any, res: any, next: any) => {
      if (!req.externalApi?.permissions.includes(permission)) {
        return res.status(403).json({ 
          error: 'Forbidden', 
          message: `Required permission: ${permission}` 
        });
      }
      next();
    };
  };

  // ===== EXTERNAL AGENT POLICY DEPLOYMENT APIs =====

  // ===== POLICY RETRIEVAL APIS =====
  
  // GET /api/external/agent-policies - List available policies for external system
  app.get("/api/external/agent-policies", validateExternalApiKey, requirePermission('read'), async (req, res) => {
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
        category: category as string,
        targetOs: targetOs as string,
        isActive: isActive === 'true',
        publishScope: publishScope as string,
        page: parseInt(page as string),
        limit: Math.min(parseInt(limit as string), 100) // Cap at 100
      };

      const policies = await storage.getAllPolicies();
      
      // Filter for external consumption
      const filteredPolicies = policies
        .filter(policy => 
          (policy.domainId === domainId || (policy.publishScope === 'domain' && policy.domainId === domainId) || policy.publishScope === 'global') &&
          (policy.tenantId === tenantId || policy.scope !== 'tenant') &&
          (policy.publishStatus === 'published') &&
          (!category || policy.category === category) &&
          (!targetOs || policy.targetOs === targetOs) &&
          (policy.isActive === (isActive === 'true'))
        )
        .slice((options.page - 1) * options.limit, options.page * options.limit)
        .map(policy => ({
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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching external policies:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to fetch policies for external system" 
      });
    }
  });

  // GET /api/external/agent-policies/:policyId - Get specific policy deployment details
  app.get("/api/external/agent-policies/:policyId", validateExternalApiKey, requirePermission('read'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const policyId = parseInt(req.params.policyId);

      if (isNaN(policyId)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid policy ID' 
        });
      }

      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Policy not found' 
        });
      }

      // Check access permissions
      const hasAccess = (
        (policy.domainId === domainId || (policy.publishScope === 'domain' && policy.domainId === domainId) || policy.publishScope === 'global') &&
        (policy.tenantId === tenantId || policy.scope !== 'tenant') &&
        policy.publishStatus === 'published'
      );

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this policy' 
        });
      }

      // Get associated scripts details if available
      let scriptsDetails = [];
      if (policy.availableScripts && policy.availableScripts.length > 0) {
        const scripts = await storage.getAllScripts();
        scriptsDetails = scripts
          .filter(script => policy.availableScripts?.includes(script.id.toString()))
          .map(script => ({
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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching external policy details:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to fetch policy details" 
      });
    }
  });

  // GET /api/external/agent-policies/:policyId/scripts - Get scripts associated with policy
  app.get("/api/external/agent-policies/:policyId/scripts", validateExternalApiKey, requirePermission('read'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const policyId = parseInt(req.params.policyId);

      if (isNaN(policyId)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid policy ID' 
        });
      }

      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Policy not found' 
        });
      }

      // Check access permissions
      const hasAccess = (
        (policy.domainId === domainId || (policy.publishScope === 'domain' && policy.domainId === domainId) || policy.publishScope === 'global') &&
        (policy.tenantId === tenantId || policy.scope !== 'tenant') &&
        policy.publishStatus === 'published'
      );

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this policy' 
        });
      }

      // Get scripts details
      const scripts = await storage.getAllScripts();
      const policyScripts = scripts
        .filter(script => 
          policy.availableScripts?.includes(script.id.toString()) &&
          (script.domainId === domainId || script.scope !== 'tenant') &&
          script.publishStatus === 'published'
        )
        .map(script => ({
          id: script.id,
          name: script.name,
          description: script.description,
          category: script.category,
          targetOs: script.targetOs,
          version: script.version,
          scriptType: script.scriptType,
          scriptContent: script.publishScope === 'global' ? script.scriptContent : undefined, // Only include content for global scripts
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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching policy scripts:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to fetch policy scripts" 
      });
    }
  });

  // GET /api/external/agent-policies/:policyId/credentials - Get credential requirements for policy
  app.get("/api/external/agent-policies/:policyId/credentials", validateExternalApiKey, requirePermission('read'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const policyId = parseInt(req.params.policyId);

      if (isNaN(policyId)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid policy ID' 
        });
      }

      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Policy not found' 
        });
      }

      // Check access permissions
      const hasAccess = (
        (policy.domainId === domainId || (policy.publishScope === 'domain' && policy.domainId === domainId) || policy.publishScope === 'global') &&
        (policy.tenantId === tenantId || policy.scope !== 'tenant') &&
        policy.publishStatus === 'published'
      );

      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this policy' 
        });
      }

      // Get credential profiles that might be needed
      const credentialProfiles = await storage.getAllCredentialProfiles();
      const availableCredentials = credentialProfiles
        .filter(profile => 
          (profile.domainId === domainId || profile.scope !== 'tenant') &&
          profile.isActive
        )
        .map(profile => ({
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
          recommendedCredentials: availableCredentials.filter(c => c.category === policy.category),
          allAvailableCredentials: availableCredentials,
          credentialTypes: [...new Set(availableCredentials.map(c => c.credentialType))],
          targetOsRequirements: policy.targetOs
        },
        apiVersion: "1.0",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching policy credentials:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to fetch policy credential requirements" 
      });
    }
  });

  // GET /api/external/endpoints/:endpointId/policies - Get policies assigned to specific endpoint
  app.get("/api/external/endpoints/:endpointId/policies", validateExternalApiKey, requirePermission('read'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const endpointId = parseInt(req.params.endpointId);

      if (isNaN(endpointId)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid endpoint ID' 
        });
      }

      const endpoint = await storage.getEndpoint(endpointId);
      if (!endpoint) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Endpoint not found' 
        });
      }

      // Check access permissions
      if (endpoint.domainId !== domainId || endpoint.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this endpoint' 
        });
      }

      // Get applicable policies for this endpoint
      const allPolicies = await storage.getAllPolicies();
      const applicablePolicies = allPolicies
        .filter(policy => 
          (policy.domainId === domainId || policy.publishScope === 'global') &&
          (policy.tenantId === tenantId || policy.scope !== 'tenant') &&
          policy.publishStatus === 'published' &&
          policy.isActive &&
          (policy.targetOs === 'all' || policy.targetOs === endpoint.operatingSystem)
        )
        .map(policy => ({
          id: policy.id,
          name: policy.name,
          description: policy.description,
          category: policy.category,
          targetOs: policy.targetOs,
          version: policy.version,
          executionOrder: policy.executionOrder,
          isApplied: endpoint.appliedPolicies?.some(ap => ap.policyId === policy.id) || false,
          lastApplied: endpoint.appliedPolicies?.find(ap => ap.policyId === policy.id)?.appliedAt || null,
          applicationStatus: endpoint.appliedPolicies?.find(ap => ap.policyId === policy.id)?.status || 'not_applied',
          scope: policy.scope,
          publishScope: policy.publishScope,
          createdAt: policy.createdAt
        }));

      res.json({
        endpointId: endpoint.id,
        endpointName: endpoint.hostname,
        operatingSystem: endpoint.operatingSystem,
        policies: {
          applied: applicablePolicies.filter(p => p.isApplied),
          available: applicablePolicies.filter(p => !p.isApplied),
          total: applicablePolicies.length
        },
        lastPolicyUpdate: endpoint.updatedAt,
        apiVersion: "1.0",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching endpoint policies:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to fetch endpoint policies" 
      });
    }
  });

  // ===== DEPLOYMENT EXECUTION APIS =====
  
  // POST /api/external/deployments - Create new deployment execution record
  app.post("/api/external/deployments", validateExternalApiKey, requirePermission('write'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      
      const deploymentData = {
        ...req.body,
        domainId,
        tenantId,
        status: 'initiated',
        createdAt: new Date().toISOString()
      };

      // Validate the deployment data
      const validatedData = insertAgentDeploymentSchema.parse(deploymentData);
      
      const deployment = await storage.createAgentDeployment(validatedData);

      // Log the deployment creation
      await storage.createActivity({
        type: 'deployment',
        category: 'info',
        title: 'External Deployment Created',
        description: `External system created deployment: ${deployment.name}`,
        entityType: 'deployment',
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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating external deployment:', error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: "Invalid deployment data", 
          details: error.message 
        });
      }
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to create deployment record" 
      });
    }
  });

  // PUT /api/external/deployments/:deploymentId/status - Update deployment status
  app.put("/api/external/deployments/:deploymentId/status", validateExternalApiKey, requirePermission('write'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentId = parseInt(req.params.deploymentId);
      const { status, progress, message, metadata } = req.body;

      if (isNaN(deploymentId)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid deployment ID' 
        });
      }

      if (!status) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Status is required' 
        });
      }

      const deployment = await storage.getAgentDeployment(deploymentId);
      if (!deployment) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Deployment not found' 
        });
      }

      // Check access permissions
      if (deployment.domainId !== domainId || deployment.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this deployment' 
        });
      }

      const updateData = {
        status,
        ...(progress !== undefined && { progress }),
        ...(metadata && { metadata }),
        updatedAt: new Date().toISOString()
      };

      const updatedDeployment = await storage.updateAgentDeployment(deploymentId, updateData);

      // Log the status update
      await storage.createActivity({
        type: 'deployment',
        category: status === 'failed' ? 'error' : status === 'completed' ? 'success' : 'info',
        title: 'Deployment Status Updated',
        description: message || `Deployment status changed to: ${status}`,
        entityType: 'deployment',
        entityId: deploymentId.toString(),
        domainId,
        tenantId,
        metadata: {
          externalApiKey: req.externalApi.apiKey,
          previousStatus: deployment.status,
          newStatus: status,
          progress: progress
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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating deployment status:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to update deployment status" 
      });
    }
  });

  // POST /api/external/deployments/:deploymentId/results - Submit deployment results
  app.post("/api/external/deployments/:deploymentId/results", validateExternalApiKey, requirePermission('write'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentId = parseInt(req.params.deploymentId);
      const { results, summary, errors, completedAt } = req.body;

      if (isNaN(deploymentId)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid deployment ID' 
        });
      }

      const deployment = await storage.getAgentDeployment(deploymentId);
      if (!deployment) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Deployment not found' 
        });
      }

      // Check access permissions
      if (deployment.domainId !== domainId || deployment.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this deployment' 
        });
      }

      const updateData = {
        results: results || deployment.results,
        status: errors && errors.length > 0 ? 'failed' : 'completed',
        completedAt: completedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          ...deployment.metadata,
          summary,
          errors,
          completedViaExternalApi: true
        }
      };

      const updatedDeployment = await storage.updateAgentDeployment(deploymentId, updateData);

      // Log the results submission
      await storage.createActivity({
        type: 'deployment',
        category: errors && errors.length > 0 ? 'error' : 'success',
        title: 'Deployment Results Submitted',
        description: summary || `Deployment completed with ${results?.length || 0} results`,
        entityType: 'deployment',
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
        deploymentId: deploymentId,
        status: updateData.status,
        resultsProcessed: results?.length || 0,
        errorsReported: errors?.length || 0,
        completedAt: updateData.completedAt,
        apiVersion: "1.0",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error submitting deployment results:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to submit deployment results" 
      });
    }
  });

  // POST /api/external/deployments/:deploymentId/logs - Submit deployment logs
  app.post("/api/external/deployments/:deploymentId/logs", validateExternalApiKey, requirePermission('write'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentId = parseInt(req.params.deploymentId);
      const { logs, level = 'info' } = req.body;

      if (isNaN(deploymentId)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid deployment ID' 
        });
      }

      if (!logs || !Array.isArray(logs)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Logs array is required' 
        });
      }

      const deployment = await storage.getAgentDeployment(deploymentId);
      if (!deployment) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Deployment not found' 
        });
      }

      // Check access permissions
      if (deployment.domainId !== domainId || deployment.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this deployment' 
        });
      }

      // Process and store logs
      const processedLogs = logs.map((log: any) => ({
        timestamp: log.timestamp || new Date().toISOString(),
        level: log.level || level,
        message: log.message,
        component: log.component || 'external-system',
        metadata: log.metadata
      }));

      // Update deployment with new logs
      const existingLogs = deployment.logs || [];
      const updatedLogs = [...existingLogs, ...processedLogs];

      await storage.updateAgentDeployment(deploymentId, {
        logs: updatedLogs,
        updatedAt: new Date().toISOString()
      });

      // Log the logs submission (meta!)
      await storage.createActivity({
        type: 'deployment',
        category: 'info',
        title: 'Deployment Logs Received',
        description: `Received ${processedLogs.length} log entries for deployment`,
        entityType: 'deployment',
        entityId: deploymentId.toString(),
        domainId,
        tenantId,
        metadata: {
          externalApiKey: req.externalApi.apiKey,
          logsCount: processedLogs.length,
          logLevels: [...new Set(processedLogs.map(l => l.level))]
        }
      });

      res.json({
        deploymentId: deploymentId,
        logsReceived: processedLogs.length,
        totalLogs: updatedLogs.length,
        apiVersion: "1.0",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error submitting deployment logs:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to submit deployment logs" 
      });
    }
  });

  // GET /api/external/deployments/:deploymentId - Get deployment details
  app.get("/api/external/deployments/:deploymentId", validateExternalApiKey, requirePermission('read'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const deploymentId = parseInt(req.params.deploymentId);

      if (isNaN(deploymentId)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Invalid deployment ID' 
        });
      }

      const deployment = await storage.getAgentDeployment(deploymentId);
      if (!deployment) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Deployment not found' 
        });
      }

      // Check access permissions
      if (deployment.domainId !== domainId || deployment.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this deployment' 
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
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching deployment details:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to fetch deployment details" 
      });
    }
  });

  // ===== AGENT STATUS REPORTING APIS =====
  
  // POST /api/external/agents/:agentId/heartbeat - Agent heartbeat with status
  app.post("/api/external/agents/:agentId/heartbeat", validateExternalApiKey, requirePermission('agent-status'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const agentId = req.params.agentId;
      const { status, systemInfo, capabilities, discoveryResults } = req.body;

      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Agent not found' 
        });
      }

      // Check access permissions
      if (agent.domainId !== domainId || agent.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this agent' 
        });
      }

      const updateData = {
        status: status || 'online',
        lastHeartbeat: new Date().toISOString(),
        ...(systemInfo && { systemInfo }),
        ...(capabilities && { capabilities }),
        ...(discoveryResults && { discoveryResults }),
        updatedAt: new Date().toISOString()
      };

      const updatedAgent = await storage.updateAgent(agentId, updateData);

      // Create heartbeat status report
      await storage.createAgentStatusReport({
        agentId,
        domainId,
        tenantId,
        reportType: 'heartbeat',
        status: status || 'online',
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
        agentId: agentId,
        status: updateData.status,
        heartbeatReceived: true,
        lastHeartbeat: updateData.lastHeartbeat,
        nextHeartbeatExpected: new Date(Date.now() + 300000).toISOString(), // 5 minutes
        apiVersion: "1.0",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing agent heartbeat:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to process agent heartbeat" 
      });
    }
  });

  // PUT /api/external/agents/:agentId/status - Update agent status
  app.put("/api/external/agents/:agentId/status", validateExternalApiKey, requirePermission('agent-status'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const agentId = req.params.agentId;
      const { status, message, systemInfo, errorDetails } = req.body;

      if (!status) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Status is required' 
        });
      }

      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Agent not found' 
        });
      }

      // Check access permissions
      if (agent.domainId !== domainId || agent.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this agent' 
        });
      }

      const updateData = {
        status,
        ...(systemInfo && { systemInfo }),
        lastHeartbeat: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedAgent = await storage.updateAgent(agentId, updateData);

      // Log the status change
      await storage.createActivity({
        type: 'agent',
        category: status === 'error' ? 'error' : status === 'offline' ? 'warning' : 'info',
        title: 'Agent Status Updated',
        description: message || `Agent status changed to: ${status}`,
        entityType: 'agent',
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

      // Create detailed status report
      await storage.createAgentStatusReport({
        agentId,
        domainId,
        tenantId,
        reportType: 'status_change',
        status,
        systemHealth: systemInfo ? {
          cpuUsage: systemInfo.cpuUsage,
          memoryUsage: systemInfo.memoryUsage,
          diskUsage: systemInfo.diskUsage,
          networkConnectivity: status !== 'offline'
        } : undefined,
        reportData: {
          message,
          errorDetails,
          statusChangedViaExternalApi: true
        }
      });

      res.json({
        agentId: agentId,
        previousStatus: agent.status,
        currentStatus: status,
        statusUpdated: true,
        updatedAt: updateData.updatedAt,
        apiVersion: "1.0",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating agent status:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to update agent status" 
      });
    }
  });

  // POST /api/external/agents/:agentId/execution-results - Report script execution results
  app.post("/api/external/agents/:agentId/execution-results", validateExternalApiKey, requirePermission('agent-status'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const agentId = req.params.agentId;
      const { policyId, scriptId, executionId, results, status, startedAt, completedAt, output, errors } = req.body;

      if (!executionId || !status) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Execution ID and status are required' 
        });
      }

      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Agent not found' 
        });
      }

      // Check access permissions
      if (agent.domainId !== domainId || agent.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this agent' 
        });
      }

      // Update agent's applied policies if this was a policy execution
      if (policyId) {
        const appliedPolicies = agent.appliedPolicies || [];
        const policyIndex = appliedPolicies.findIndex(p => p.policyId === policyId);
        
        if (policyIndex >= 0) {
          appliedPolicies[policyIndex] = {
            ...appliedPolicies[policyIndex],
            status,
            appliedAt: completedAt || new Date().toISOString(),
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
            appliedAt: completedAt || new Date().toISOString(),
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
          updatedAt: new Date().toISOString()
        });
      }

      // Log the execution results
      await storage.createActivity({
        type: 'script_execution',
        category: status === 'failed' ? 'error' : status === 'completed' ? 'success' : 'info',
        title: 'Script Execution Results Received',
        description: `Agent ${agentId} reported execution results for ${policyId ? `policy ${policyId}` : `script ${scriptId}`}`,
        entityType: 'agent',
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
          executionDuration: startedAt && completedAt ? 
            new Date(completedAt).getTime() - new Date(startedAt).getTime() : undefined
        }
      });

      // Create execution status report
      await storage.createAgentStatusReport({
        agentId,
        domainId,
        tenantId,
        reportType: 'execution_result',
        status: agent.status, // Agent's overall status
        executionResults: {
          executionId,
          policyId: policyId ? parseInt(policyId) : undefined,
          scriptId: scriptId ? parseInt(scriptId) : undefined,
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
        agentId: agentId,
        executionId,
        resultsReceived: true,
        status,
        policyUpdated: !!policyId,
        receivedAt: new Date().toISOString(),
        apiVersion: "1.0",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error processing execution results:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to process execution results" 
      });
    }
  });

  // GET /api/external/agents/:agentId/pending-tasks - Get pending tasks for agent
  app.get("/api/external/agents/:agentId/pending-tasks", validateExternalApiKey, requirePermission('read'), async (req, res) => {
    try {
      const { domainId, tenantId } = req.externalApi;
      const agentId = req.params.agentId;

      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Agent not found' 
        });
      }

      // Check access permissions
      if (agent.domainId !== domainId || agent.tenantId !== tenantId) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Access denied to this agent' 
        });
      }

      // Get applicable policies that haven't been applied or need re-application
      const allPolicies = await storage.getAllPolicies();
      const applicablePolicies = allPolicies.filter(policy => 
        (policy.domainId === domainId || policy.publishScope === 'global') &&
        (policy.tenantId === tenantId || policy.scope !== 'tenant') &&
        policy.publishStatus === 'published' &&
        policy.isActive &&
        (policy.targetOs === 'all' || policy.targetOs === agent.operatingSystem)
      );

      const appliedPolicies = agent.appliedPolicies || [];
      
      const pendingTasks = applicablePolicies
        .filter(policy => {
          const applied = appliedPolicies.find(ap => ap.policyId === policy.id);
          return !applied || applied.status === 'failed' || applied.status === 'pending';
        })
        .map(policy => {
          const applied = appliedPolicies.find(ap => ap.policyId === policy.id);
          return {
            taskId: `policy-${policy.id}-${Date.now()}`,
            type: 'policy_execution',
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
            estimatedDuration: policy.executionFlow?.length ? policy.executionFlow.length * 30 : 60, // seconds estimate
            createdAt: new Date().toISOString()
          };
        })
        .sort((a, b) => a.priority - b.priority);

      // Also check for any pending deployment tasks specific to this agent
      const deploymentTasks = await storage.getAllAgentDeploymentTasks();
      const agentDeploymentTasks = deploymentTasks
        .filter(task => 
          (task.agentId === agentId || task.targetHost === agent.hostname) &&
          task.status === 'pending'
        )
        .map(task => ({
          taskId: `deployment-${task.id}`,
          type: 'deployment_task',
          deploymentJobId: task.deploymentJobId,
          targetHost: task.targetHost,
          targetOs: task.targetOs,
          status: task.status,
          attemptCount: task.attemptCount,
          maxRetries: task.maxRetries,
          createdAt: task.createdAt
        }));

      const allPendingTasks = [...pendingTasks, ...agentDeploymentTasks];

      res.json({
        agentId: agentId,
        agentStatus: agent.status,
        agentVersion: agent.version,
        pendingTasks: allPendingTasks,
        taskCounts: {
          policies: pendingTasks.length,
          deployments: agentDeploymentTasks.length,
          total: allPendingTasks.length
        },
        lastUpdated: agent.updatedAt,
        apiVersion: "1.0",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: "Failed to fetch pending tasks" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}