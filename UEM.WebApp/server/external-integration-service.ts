import { db } from "./db";
import { endpoints, externalSystems, integrationLogs, assetExternalMappings } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface ExternalSystemConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  authType: 'bearer' | 'api-key' | 'basic';
  enabled: boolean;
  syncDirection: 'inbound' | 'outbound' | 'bidirectional';
  webhookUrl?: string;
  rateLimitPerMinute: number;
  retryAttempts: number;
  timeoutMs: number;
}

export interface AssetSyncPayload {
  action: 'create' | 'update' | 'delete' | 'status_change' | 'discovery' | 'scan_complete';
  asset: {
    id: number;
    name: string;
    ipAddress: string;
    macAddress?: string;
    operatingSystem?: string;
    discoveryMethod: string;
    status: string;
    lastSeen: string;
    vulnerabilities?: any[];
    installedSoftware?: any[];
    networkPorts?: any[];
    systemInfo?: any;
    customFields?: Record<string, any>;
  };
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface InboundAssetUpdate {
  externalId: string;
  name?: string;
  status?: string;
  ipAddress?: string;
  operatingSystem?: string;
  lastSeen?: string;
  vulnerabilities?: any[];
  installedSoftware?: any[];
  customFields?: Record<string, any>;
  action: 'update' | 'delete' | 'status_change';
}

export class ExternalIntegrationService {
  private rateLimitTracker = new Map<string, { count: number; resetTime: number }>();
  
  constructor() {
    this.setupWebhookEndpoints();
  }

  // Outbound Integration - Send asset data to external systems
  async syncAssetToExternalSystems(assetId: number, action: AssetSyncPayload['action']) {
    try {
      // Get asset details
      const [asset] = await db.select().from(endpoints).where(eq(endpoints.id, assetId));
      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }

      // Get enabled external systems for outbound sync
      const systems = await this.getEnabledExternalSystems(['outbound', 'bidirectional']);

      const syncPayload: AssetSyncPayload = {
        action,
        asset: {
          id: asset.id,
          name: asset.hostname, // Use hostname as name
          ipAddress: asset.ipAddress,
          macAddress: asset.macAddress || undefined,
          operatingSystem: asset.operatingSystem || undefined,
          discoveryMethod: asset.discoveryMethod || 'unknown',
          status: asset.status,
          lastSeen: asset.lastSeen?.toISOString() || new Date().toISOString(),
          vulnerabilities: asset.vulnerabilities || [],
          installedSoftware: asset.installedSoftware || [],
          networkPorts: asset.networkPorts || [],
          systemInfo: asset.systemInfo || {},
          customFields: asset.customFields || {}
        },
        timestamp: new Date().toISOString(),
        source: 'endpoint-management-system',
        metadata: {
          actionTriggeredBy: 'system',
          integrationVersion: '1.0.0'
        }
      };

      // Send to each external system
      const results = await Promise.allSettled(
        systems.map(system => this.sendToExternalSystem(system, syncPayload))
      );

      // Log integration results
      await this.logIntegrationResults(assetId, action, results, systems);

      return results;
    } catch (error) {
      console.error('Error syncing asset to external systems:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  // Inbound Integration - Receive and process updates from external systems
  async processInboundAssetUpdate(systemId: string, update: InboundAssetUpdate) {
    try {
      // Validate the external system
      const system = await this.getExternalSystemById(systemId);
      if (!system || !['inbound', 'bidirectional'].includes(system.syncDirection)) {
        throw new Error(`External system ${systemId} not found or not configured for inbound sync`);
      }

      // Find existing asset by external ID or create new one
      let asset = await this.findAssetByExternalId(update.externalId, systemId);

      switch (update.action) {
        case 'update':
          if (asset) {
            await this.updateExistingAsset(asset.id, update);
          } else {
            await this.createAssetFromExternalUpdate(update, systemId);
          }
          break;

        case 'delete':
          if (asset) {
            await this.deleteAsset(asset.id);
          }
          break;

        case 'status_change':
          if (asset) {
            await this.updateAssetStatus(asset.id, update.status || 'unknown');
          }
          break;
      }

      // Log the inbound integration
      await this.logInboundIntegration(systemId, update);

      return { success: true, message: `Asset ${update.externalId} processed successfully` };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error processing inbound asset update:', error);
      await this.logInboundIntegration(systemId, update, errorMessage);
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }

  // Send data to external system with rate limiting and retry logic
  private async sendToExternalSystem(system: ExternalSystemConfig, payload: AssetSyncPayload) {
    // Check rate limiting
    if (!this.checkRateLimit(system.id, system.rateLimitPerMinute)) {
      throw new Error(`Rate limit exceeded for system ${system.name}`);
    }

    let attempt = 0;
    while (attempt < system.retryAttempts) {
      try {
        const response = await this.makeHttpRequest(system, payload);
        
        // Update rate limit tracker
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
        
        // Exponential backoff
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  // Make HTTP request to external system
  private async makeHttpRequest(system: ExternalSystemConfig, payload: AssetSyncPayload) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Endpoint-Management-System/1.0.0'
    };

    // Add authentication headers
    switch (system.authType) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${system.apiKey}`;
        break;
      case 'api-key':
        headers['X-API-Key'] = system.apiKey;
        break;
      case 'basic':
        headers['Authorization'] = `Basic ${Buffer.from(system.apiKey).toString('base64')}`;
        break;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), system.timeoutMs);

    try {
      const response = await fetch(`${system.baseUrl}/assets/sync`, {
        method: 'POST',
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
  private checkRateLimit(systemId: string, limitPerMinute: number): boolean {
    const now = Date.now();
    const tracker = this.rateLimitTracker.get(systemId);

    if (!tracker || now > tracker.resetTime) {
      this.rateLimitTracker.set(systemId, {
        count: 0,
        resetTime: now + 60000 // Reset after 1 minute
      });
      return true;
    }

    return tracker.count < limitPerMinute;
  }

  private updateRateLimit(systemId: string) {
    const tracker = this.rateLimitTracker.get(systemId);
    if (tracker) {
      tracker.count++;
    }
  }

  // Webhook endpoints setup for inbound integration
  private setupWebhookEndpoints() {
    // This would be integrated with your Express routes
    // Example: POST /api/integrations/webhook/:systemId
  }

  // Helper methods
  private async getEnabledExternalSystems(directions: string[]): Promise<ExternalSystemConfig[]> {
    const systems = await db.select().from(externalSystems).where(eq(externalSystems.enabled, true));
    return systems
      .filter(s => directions.includes(s.syncDirection))
      .map(s => ({
        id: s.id,
        name: s.name,
        baseUrl: s.baseUrl,
        apiKey: s.apiKey,
        authType: s.authType as 'bearer' | 'api-key' | 'basic',
        enabled: s.enabled || true,
        syncDirection: s.syncDirection as 'inbound' | 'outbound' | 'bidirectional',
        webhookUrl: s.webhookUrl || undefined,
        rateLimitPerMinute: s.rateLimitPerMinute || 60,
        retryAttempts: s.retryAttempts || 3,
        timeoutMs: s.timeoutMs || 30000
      }));
  }

  private async getExternalSystemById(systemId: string) {
    const [system] = await db.select().from(externalSystems).where(eq(externalSystems.id, systemId));
    return system;
  }

  private async findAssetByExternalId(externalId: string, systemId: string) {
    // Find asset by external mapping
    const [mapping] = await db.select().from(assetExternalMappings)
      .where(eq(assetExternalMappings.externalId, externalId));
    
    if (mapping) {
      const [asset] = await db.select().from(endpoints).where(eq(endpoints.id, mapping.assetId));
      return asset;
    }
    return undefined;
  }

  private async updateExistingAsset(assetId: number, update: InboundAssetUpdate) {
    const updateData: any = {};
    
    if (update.name) updateData.name = update.name;
    if (update.status) updateData.status = update.status;
    if (update.ipAddress) updateData.ipAddress = update.ipAddress;
    if (update.operatingSystem) updateData.operatingSystem = update.operatingSystem;
    if (update.lastSeen) updateData.lastSeen = new Date(update.lastSeen);
    if (update.vulnerabilities) updateData.vulnerabilities = update.vulnerabilities;
    if (update.installedSoftware) updateData.installedSoftware = update.installedSoftware;
    if (update.customFields) updateData.customFields = update.customFields;

    updateData.updatedAt = new Date();

    await db.update(endpoints).set(updateData).where(eq(endpoints.id, assetId));
  }

  private async createAssetFromExternalUpdate(update: InboundAssetUpdate, systemId: string) {
    const newAsset = {
      hostname: update.name || `Asset-${update.externalId}`,
      ipAddress: update.ipAddress || 'Unknown',
      assetType: 'server',
      status: update.status || 'unknown',
      operatingSystem: update.operatingSystem,
      discoveryMethod: `external-${systemId}`,
      lastSeen: update.lastSeen ? new Date(update.lastSeen) : new Date(),
      vulnerabilities: update.vulnerabilities || [],
      installedSoftware: update.installedSoftware || [],
      customFields: update.customFields || {},
      externalId: update.externalId,
      externalSystemId: systemId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.insert(endpoints).values(newAsset);
  }

  private async deleteAsset(assetId: number) {
    await db.delete(endpoints).where(eq(endpoints.id, assetId));
  }

  private async updateAssetStatus(assetId: number, status: string) {
    await db.update(endpoints).set({ 
      status, 
      updatedAt: new Date() 
    }).where(eq(endpoints.id, assetId));
  }

  private async logIntegrationResults(assetId: number, action: string, results: any[], systems: ExternalSystemConfig[]) {
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const system = systems[i];
      
      await db.insert(integrationLogs).values({
        assetId,
        systemId: system.id,
        action,
        direction: 'outbound',
        success: result.status === 'fulfilled',
        errorMessage: result.status === 'rejected' ? result.reason : null,
        requestPayload: JSON.stringify({ action, assetId }),
        responsePayload: result.status === 'fulfilled' ? JSON.stringify(result.value) : null,
        timestamp: new Date()
      });
    }
  }

  private async logInboundIntegration(systemId: string, update: InboundAssetUpdate, error?: string) {
    await db.insert(integrationLogs).values({
      systemId,
      action: update.action,
      direction: 'inbound',
      success: !error,
      errorMessage: error || null,
      requestPayload: JSON.stringify(update),
      timestamp: new Date()
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const externalIntegrationService = new ExternalIntegrationService();