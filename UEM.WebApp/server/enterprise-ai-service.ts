import OpenAI from "openai";
import { AIScriptService } from "./ai-service";
import { AIDiscoveryService } from "./ai-discovery-service";
import { storage } from "./storage";
import type { 
  InsertAiConversation, 
  InsertAiScriptGeneration, 
  InsertAiAnalysisReport,
  InsertAiRecommendation,
  InsertAiFeedback,
  InsertAiUsageLog 
} from "@shared/schema";

// TypeScript utility for non-empty arrays
type NonEmptyArray<T> = [T, ...T[]];

function ensureNonEmpty<T>(arr: T[] | null | undefined, fallback: T): NonEmptyArray<T> {
  return arr && arr.length ? [arr[0], ...arr.slice(1)] : [fallback];
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enterprise AI Service Configuration
interface EnterpriseAIConfig {
  maxDailyCost?: number;
  rateLimitRequests?: number;
  rateLimitWindow?: number;
  cacheTTL?: number;
  enableContentFiltering?: boolean;
  enableAuditLogging?: boolean;
  multiTenantScoping?: boolean;
}

// Enhanced Request Context for Enterprise Features
interface AIRequestContext {
  userId: number;
  domainId?: number;
  tenantId?: number;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

// AI Service Response with Enterprise Metadata
interface EnterpriseAIResponse<T> {
  data: T;
  metadata: {
    requestId: string;
    processingTime: number;
    tokensUsed: number;
    cost: number;
    cached: boolean;
    model: string;
    confidence?: number;
    sources?: string[];
  };
  audit: {
    userId: number;
    timestamp: string;
    endpoint: string;
    success: boolean;
  };
}

// In-Memory Cache for AI Responses
class AIResponseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMinutes: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// Rate Limiter for AI Requests
class AIRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  // SECURE: Rate limiting with tenant isolation
  async checkLimit(
    context: AIRequestContext, 
    limit: number = 100, 
    windowMinutes: number = 60
  ): Promise<boolean> {
    // SECURITY FIX: Include domain and tenant in rate limit key for proper isolation
    const key = `rate-limit:${context.userId}:${context.domainId || 'no-domain'}:${context.tenantId || 'no-tenant'}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
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
}

export class EnterpriseAIService {
  private cache = new AIResponseCache();
  private rateLimiter = new AIRateLimiter();
  private config: EnterpriseAIConfig;

  constructor(config: EnterpriseAIConfig = {}) {
    this.config = {
      maxDailyCost: config.maxDailyCost || 1000,
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

  async generateScript(
    request: {
      purpose: string;
      targetOS: 'windows' | 'linux' | 'macos' | 'cross-platform';
      scriptType: 'powershell' | 'bash' | 'python' | 'wmi';
      requirements: string[];
      complexity: 'basic' | 'intermediate' | 'advanced';
      template?: string;
      customInstructions?: string;
    },
    context: AIRequestContext
  ): Promise<EnterpriseAIResponse<{ code: string; documentation: string; explanation: string; analysis?: any }>> {
    const startTime = Date.now();
    const requestId = `script-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Rate limiting check with secure context
      if (!(await this.rateLimiter.checkLimit(context, this.config.rateLimitRequests, this.config.rateLimitWindow))) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Generate secure cache key with tenant isolation
      const cacheKey = this.generateCacheKey('script-generation', request, context);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        await this.logUsage(context, 'script-generation', requestId, true, 0, 0, Date.now() - startTime);
        
        return {
          data: cached,
          metadata: {
            requestId,
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            cost: 0,
            cached: true,
            model: 'gpt-4o'
          },
          audit: {
            userId: context.userId,
            timestamp: new Date().toISOString(),
            endpoint: 'script-generation',
            success: true
          }
        };
      }

      // Content filtering
      if (this.config.enableContentFiltering) {
        await this.validateContent(request.purpose + ' ' + request.requirements.join(' '));
      }

      // Enhanced generation with organizational context
      const enhancedRequest = {
        ...request,
        customInstructions: [
          request.customInstructions || '',
          await this.getOrganizationalContext(context.domainId, context.tenantId),
          await this.getSecurityPolicies(context.domainId, context.tenantId)
        ].filter(Boolean).join('\n')
      };

      // Generate script using base service
      const result = await AIScriptService.generateScript(enhancedRequest);

      // Enhanced analysis of generated script
      const analysis = await this.analyzeGeneratedScript(result.code, request.scriptType);

      const enhancedResult = {
        ...result,
        analysis
      };

      // Cache the result
      this.cache.set(cacheKey, enhancedResult, this.config.cacheTTL);

      // Store in database
      const scriptGeneration: InsertAiScriptGeneration = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        requestType: 'generate',
        purpose: request.purpose,
        requirements: request.requirements,
        generatedScript: result.code,
        scriptType: request.scriptType,
        targetOS: request.targetOS,
        complexity: request.complexity,
        documentation: result.documentation,
        explanation: result.explanation,
        analysisResults: analysis,
        aiModel: 'gpt-4o',
        tokensUsed: this.estimateTokens(JSON.stringify(request) + JSON.stringify(result)),
        estimatedCost: this.calculateCost('gpt-4o', this.estimateTokens(JSON.stringify(request) + JSON.stringify(result))),
        processingTime: Date.now() - startTime
      };

      await storage.createAiScriptGeneration(scriptGeneration);

      // Log usage
      await this.logUsage(
        context, 
        'script-generation', 
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
          model: 'gpt-4o',
          confidence: analysis?.quality || 0
        },
        audit: {
          userId: context.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'script-generation',
          success: true
        }
      };

    } catch (error) {
      await this.logUsage(context, 'script-generation', requestId, false, 0, 0, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async enhanceScript(
    request: {
      originalScript: string;
      scriptType: string;
      enhancementGoals: string[];
      preserveCompatibility?: boolean;
    },
    context: AIRequestContext
  ): Promise<EnterpriseAIResponse<{ originalScript: string; enhancedScript: string; improvements: string[]; risks: string[] }>> {
    const startTime = Date.now();
    const requestId = `script-enhance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Rate limiting check with secure context
      if (!(await this.rateLimiter.checkLimit(context, this.config.rateLimitRequests, this.config.rateLimitWindow))) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Generate secure cache key with tenant isolation
      const cacheKey = this.generateCacheKey('script-enhancement', request, context);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        await this.logUsage(context, 'script-enhancement', requestId, true, 0, 0, Date.now() - startTime);
        
        return {
          data: cached,
          metadata: {
            requestId,
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            cost: 0,
            cached: true,
            model: 'gpt-4o'
          },
          audit: {
            userId: context.userId,
            timestamp: new Date().toISOString(),
            endpoint: 'script-enhancement',
            success: true
          }
        };
      }

      // Content filtering
      if (this.config.enableContentFiltering) {
        await this.validateContent(request.originalScript);
      }

      // Analysis of original script
      const originalAnalysis = await AIScriptService.analyzeScript(request.originalScript, request.scriptType);
      
      // Enhancement using AI
      const optimized = await AIScriptService.optimizeScript(request.originalScript, request.scriptType);

      // Custom enhancement prompt
      const enhancementPrompt = `
        Enhance this ${request.scriptType} script based on these goals: ${request.enhancementGoals.join(', ')}
        
        Original Script:
        \`\`\`${request.scriptType}
        ${request.originalScript}
        \`\`\`
        
        Enhancement Requirements:
        ${request.enhancementGoals.map(goal => `- ${goal}`).join('\n')}
        
        ${request.preserveCompatibility ? 'IMPORTANT: Preserve backward compatibility' : ''}
        
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

      const response = await openai.chat.completions.create({
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

      const enhancementResult = JSON.parse(response.choices[0].message.content || '{}');
      
      const result = {
        originalScript: request.originalScript,
        enhancedScript: enhancementResult.enhancedScript || optimized.optimizedCode,
        improvements: enhancementResult.improvements || optimized.improvements,
        risks: enhancementResult.risks || [],
        confidenceScore: enhancementResult.confidenceScore || 0.8,
        testingSuggestions: enhancementResult.testingSuggestions || []
      };

      // Cache the result
      this.cache.set(cacheKey, result, this.config.cacheTTL);

      // Store in database
      const scriptGeneration: InsertAiScriptGeneration = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        requestType: 'enhance',
        purpose: `Script enhancement: ${request.enhancementGoals.join(', ')}`,
        requirements: request.enhancementGoals,
        originalScript: request.originalScript,
        generatedScript: result.enhancedScript,
        scriptType: request.scriptType,
        documentation: `Enhanced script with improvements: ${result.improvements.join(', ')}`,
        explanation: `This script was enhanced based on the following goals: ${request.enhancementGoals.join(', ')}. Key improvements include: ${result.improvements.slice(0, 3).join(', ')}.`,
        aiModel: 'gpt-4o',
        tokensUsed: this.estimateTokens(JSON.stringify(request) + JSON.stringify(result)),
        estimatedCost: this.calculateCost('gpt-4o', this.estimateTokens(JSON.stringify(request) + JSON.stringify(result))),
        processingTime: Date.now() - startTime,
        qualityScore: result.confidenceScore
      };

      await storage.createAiScriptGeneration(scriptGeneration);

      // Log usage
      await this.logUsage(
        context, 
        'script-enhancement', 
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
          model: 'gpt-4o',
          confidence: result.confidenceScore
        },
        audit: {
          userId: context.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'script-enhancement',
          success: true
        }
      };

    } catch (error) {
      await this.logUsage(context, 'script-enhancement', requestId, false, 0, 0, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async convertScript(
    request: {
      originalScript: string;
      sourceLanguage: string;
      targetLanguage: string;
      preserveFunctionality?: boolean;
      addComments?: boolean;
    },
    context: AIRequestContext
  ): Promise<EnterpriseAIResponse<{ originalScript: string; convertedScript: string; conversionNotes: string[]; compatibilityWarnings: string[] }>> {
    const startTime = Date.now();
    const requestId = `script-convert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Rate limiting check with secure context
      if (!(await this.rateLimiter.checkLimit(context, this.config.rateLimitRequests, this.config.rateLimitWindow))) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Generate secure cache key with tenant isolation
      const cacheKey = this.generateCacheKey('script-conversion', request, context);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        await this.logUsage(context, 'script-conversion', requestId, true, 0, 0, Date.now() - startTime);
        
        return {
          data: cached,
          metadata: {
            requestId,
            processingTime: Date.now() - startTime,
            tokensUsed: 0,
            cost: 0,
            cached: true,
            model: 'gpt-4o'
          },
          audit: {
            userId: context.userId,
            timestamp: new Date().toISOString(),
            endpoint: 'script-conversion',
            success: true
          }
        };
      }

      // Content filtering
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
        ${request.preserveFunctionality ? '- Preserve exact functionality' : '- Optimize for target language best practices'}
        ${request.addComments ? '- Add explanatory comments' : '- Keep comments minimal'}
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

      const response = await openai.chat.completions.create({
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

      const conversionResult = JSON.parse(response.choices[0].message.content || '{}');
      
      const result = {
        originalScript: request.originalScript,
        convertedScript: conversionResult.convertedScript || '',
        conversionNotes: conversionResult.conversionNotes || [],
        compatibilityWarnings: conversionResult.compatibilityWarnings || [],
        equivalentFunctions: conversionResult.equivalentFunctions || {},
        testingSuggestions: conversionResult.testingSuggestions || []
      };

      // Cache the result
      this.cache.set(cacheKey, result, this.config.cacheTTL);

      // Store in database
      const scriptGeneration: InsertAiScriptGeneration = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        requestType: 'convert',
        purpose: `Convert script from ${request.sourceLanguage} to ${request.targetLanguage}`,
        requirements: [
          `Source: ${request.sourceLanguage}`,
          `Target: ${request.targetLanguage}`,
          ...(request.preserveFunctionality ? ['Preserve functionality'] : []),
          ...(request.addComments ? ['Add comments'] : [])
        ],
        originalScript: request.originalScript,
        generatedScript: result.convertedScript,
        scriptType: request.targetLanguage,
        documentation: `Converted from ${request.sourceLanguage} to ${request.targetLanguage}. ${result.conversionNotes.join('. ')}`,
        explanation: `This script was converted from ${request.sourceLanguage} to ${request.targetLanguage} while preserving core functionality.`,
        aiModel: 'gpt-4o',
        tokensUsed: this.estimateTokens(JSON.stringify(request) + JSON.stringify(result)),
        estimatedCost: this.calculateCost('gpt-4o', this.estimateTokens(JSON.stringify(request) + JSON.stringify(result))),
        processingTime: Date.now() - startTime
      };

      await storage.createAiScriptGeneration(scriptGeneration);

      // Log usage
      await this.logUsage(
        context, 
        'script-conversion', 
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
          model: 'gpt-4o'
        },
        audit: {
          userId: context.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'script-conversion',
          success: true
        }
      };

    } catch (error) {
      await this.logUsage(context, 'script-conversion', requestId, false, 0, 0, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // ===== ENTERPRISE AI ANALYSIS =====

  async analyzeEndpoints(
    request: {
      endpointData: any[];
      analysisType?: string;
      includeRecommendations?: boolean;
    },
    context: AIRequestContext
  ): Promise<EnterpriseAIResponse<any>> {
    const startTime = Date.now();
    const requestId = `endpoint-analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Rate limiting check with secure context
      if (!(await this.rateLimiter.checkLimit(context, this.config.rateLimitRequests, this.config.rateLimitWindow))) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Use existing AI discovery service
      const analysis = await AIDiscoveryService.analyzeNetworkTopology(request.endpointData);
      
      const enhancedAnalysis = {
        ...analysis,
        analysisType: request.analysisType || 'endpoints',
        processingTime: Date.now() - startTime,
        recommendations: request.includeRecommendations ? analysis.recommendations : undefined
      };

      // Store analysis report
      const analysisReport: InsertAiAnalysisReport = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        analysisType: 'endpoints',
        title: 'Endpoint Analysis Report',
        description: `AI analysis of ${request.endpointData.length} endpoints`,
        inputData: { endpoints: ensureNonEmpty(request.endpointData, { id: 'default', name: 'No endpoints provided' } as any) },
        findings: analysis.anomalies.map((anomaly: string, index: number) => ({
          category: 'endpoint',
          severity: analysis.securityRisk as any,
          title: 'Endpoint Anomaly',
          description: anomaly,
          evidence: [],
          recommendations: analysis.recommendations,
          confidence: analysis.confidence
        })),
        overallScore: analysis.networkHealth,
        confidenceLevel: analysis.confidence,
        riskLevel: analysis.securityRisk,
        aiModel: 'gpt-4o',
        processingTime: Date.now() - startTime,
        tokensUsed: this.estimateTokens(JSON.stringify(request.endpointData)),
        estimatedCost: this.calculateCost('gpt-4o', this.estimateTokens(JSON.stringify(request.endpointData)))
      };

      await storage.createAiAnalysisReport(analysisReport);

      // Log usage
      await this.logUsage(
        context, 
        'endpoint-analysis', 
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
          model: 'gpt-4o',
          confidence: analysis.confidence
        },
        audit: {
          userId: context.userId,
          timestamp: new Date().toISOString(),
          endpoint: 'endpoint-analysis',
          success: true
        }
      };

    } catch (error) {
      await this.logUsage(context, 'endpoint-analysis', requestId, false, 0, 0, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // ===== UTILITY METHODS =====

  // SECURE: Generate cache key with tenant isolation
  private generateCacheKey(operation: string, request: any, context?: AIRequestContext): string {
    // SECURITY FIX: Include user/domain/tenant context to prevent cache bleed
    const contextStr = context ? `${context.userId}:${context.domainId || 'no-domain'}:${context.tenantId || 'no-tenant'}` : 'no-context';
    const requestStr = JSON.stringify(request);
    const combined = `${contextStr}:${operation}:${requestStr}`;
    return `ai-cache-${Buffer.from(combined).toString('base64').slice(0, 48)}`;
  }

  private async validateContent(content: string): Promise<void> {
    // Basic content filtering - in production, use more sophisticated filtering
    const suspiciousPatterns = [
      /rm\s+-rf\s+\//i,
      /del\s+\/s\s+\/q\s+c:\\/i,
      /format\s+c:/i,
      /malware|virus|backdoor/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        throw new Error('Content contains potentially harmful instructions');
      }
    }
  }

  private async getOrganizationalContext(domainId?: number, tenantId?: number): Promise<string> {
    if (!domainId && !tenantId) return '';
    
    try {
      // Get organizational policies and standards
      const domain = domainId ? await storage.getDomainById(domainId) : null;
      const tenant = tenantId ? await storage.getTenantById(tenantId) : null;
      
      const context = [];
      
      if (domain) {
        context.push(`Organization: ${domain.displayName}`);
        if (domain.settings?.features) {
          context.push(`Available features: ${domain.settings.features.join(', ')}`);
        }
      }
      
      if (tenant) {
        context.push(`Department/Tenant: ${tenant.displayName}`);
        if (tenant.settings?.features) {
          context.push(`Tenant features: ${tenant.settings.features.join(', ')}`);
        }
      }
      
      return context.join('. ');
    } catch (error) {
      return '';
    }
  }

  private async getSecurityPolicies(domainId?: number, tenantId?: number): Promise<string> {
    try {
      // Get security policies for context
      const policies = await storage.getAllPolicies();
      const relevantPolicies = policies
        .filter(p => p.category === 'security' && p.isActive)
        .slice(0, 3)
        .map(p => p.name);
        
      return relevantPolicies.length > 0 
        ? `Security policies to consider: ${relevantPolicies.join(', ')}`
        : '';
    } catch (error) {
      return '';
    }
  }

  private async analyzeGeneratedScript(code: string, scriptType: string): Promise<any> {
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

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for GPT models
    return Math.ceil(text.length / 4);
  }

  private calculateCost(model: string, tokens: number): number {
    // Pricing as of 2024 (approximate)
    const pricing = {
      'gpt-4o': { input: 0.005, output: 0.015 }, // per 1K tokens
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.002, output: 0.002 }
    };
    
    const modelPricing = pricing[model as keyof typeof pricing] || pricing['gpt-4o'];
    // Assume 70% input, 30% output tokens
    const inputTokens = Math.floor(tokens * 0.7);
    const outputTokens = Math.floor(tokens * 0.3);
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1000;
  }

  private async logUsage(
    context: AIRequestContext,
    endpoint: string,
    requestId: string,
    success: boolean,
    tokensUsed: number,
    cost: number,
    responseTime: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      if (!this.config.enableAuditLogging) return;

      const usageLog: InsertAiUsageLog = {
        userId: context.userId,
        domainId: context.domainId,
        tenantId: context.tenantId,
        endpoint: endpoint,
        method: 'POST',
        requestType: endpoint,
        sessionId: context.sessionId,
        aiModel: 'gpt-4o',
        inputTokens: Math.floor(tokensUsed * 0.7),
        outputTokens: Math.floor(tokensUsed * 0.3),
        totalTokens: tokensUsed,
        totalCost: cost,
        requestStartTime: new Date(Date.now() - responseTime),
        requestEndTime: new Date(),
        responseTime: responseTime,
        httpStatus: success ? 200 : 500,
        success: success,
        errorMessage: errorMessage,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
      };

      await storage.createAiUsageLog(usageLog);
    } catch (error) {
      console.error('Failed to log AI usage:', error);
    }
  }

  // ===== ADMIN METHODS =====

  getRateLimiter(): AIRateLimiter {
    return this.rateLimiter;
  }

  getCacheStats(): { size: number; hitRate?: number } {
    return {
      size: this.cache.size()
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  updateConfig(config: Partial<EnterpriseAIConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const enterpriseAIService = new EnterpriseAIService();