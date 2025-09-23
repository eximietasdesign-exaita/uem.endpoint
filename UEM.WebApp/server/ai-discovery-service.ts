import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface NetworkTopologyAnalysis {
  discoveredDevices: number;
  securityRisk: 'low' | 'medium' | 'high';
  anomalies: string[];
  recommendations: string[];
  confidence: number;
  networkHealth: number;
}

export interface AgentDeploymentStrategy {
  optimalTargets: string[];
  deploymentOrder: string[];
  resourceRequirements: string[];
  riskAssessment: string[];
  expectedSuccess: number;
  timeline: string;
}

export interface AgentStatusInsights {
  overallHealth: number;
  performanceAnalysis: string[];
  securityInsights: string[];
  optimizationSuggestions: string[];
  anomalyDetection: string[];
  trendsAnalysis: string[];
  executiveSummary: string;
}

export interface IntelligentDiscoveryRequest {
  networkRange: string;
  discoveryProfiles: string[];
  environment: 'enterprise' | 'smb' | 'datacenter' | 'cloud' | 'hybrid';
  riskTolerance: 'low' | 'medium' | 'high';
  priorityAssets?: string[];
}

export interface AgentOrchestrationRequest {
  targetEnvironments: string[];
  policies: string[];
  businessHours: boolean;
  complianceRequirements: string[];
  resourceConstraints?: string[];
}

export class AIDiscoveryService {
  static async analyzeNetworkTopology(discoveryData: any): Promise<NetworkTopologyAnalysis> {
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
      const response = await openai.chat.completions.create({
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

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`Network topology analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateIntelligentDiscoveryPlan(request: IntelligentDiscoveryRequest): Promise<{
    scanStrategy: string[];
    priorityOrder: string[];
    securityConsiderations: string[];
    expectedResults: string[];
    timeEstimate: string;
    riskMitigation: string[];
  }> {
    const prompt = `
    Create an intelligent network discovery plan for enterprise environment:

    Requirements:
    - Network Range: ${request.networkRange}
    - Discovery Profiles: ${request.discoveryProfiles.join(', ')}
    - Environment Type: ${request.environment}
    - Risk Tolerance: ${request.riskTolerance}
    - Priority Assets: ${request.priorityAssets?.join(', ') || 'None specified'}

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
      const response = await openai.chat.completions.create({
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

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`Intelligent discovery plan generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async optimizeAgentDeployment(request: AgentOrchestrationRequest): Promise<AgentDeploymentStrategy> {
    const prompt = `
    Design an optimal AI-powered agent deployment strategy for enterprise environments:

    Deployment Parameters:
    - Target Environments: ${request.targetEnvironments.join(', ')}
    - Policies to Deploy: ${request.policies.join(', ')}
    - Business Hours Constraint: ${request.businessHours}
    - Compliance Requirements: ${request.complianceRequirements.join(', ')}
    - Resource Constraints: ${request.resourceConstraints?.join(', ') || 'None specified'}

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
      const response = await openai.chat.completions.create({
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

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`Agent deployment optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async analyzeAgentPerformance(agentData: any): Promise<AgentStatusInsights> {
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
      const response = await openai.chat.completions.create({
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

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`Agent performance analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async detectNetworkAnomalies(networkData: any): Promise<{
    anomalies: string[];
    severity: string[];
    recommendations: string[];
    predictiveAlerts: string[];
    securityImplications: string[];
  }> {
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
      const response = await openai.chat.completions.create({
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

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`Network anomaly detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateComplianceReport(data: any): Promise<{
    complianceScore: number;
    violations: string[];
    recommendations: string[];
    riskAssessment: string[];
    executiveSummary: string;
  }> {
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
      const response = await openai.chat.completions.create({
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

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      throw new Error(`Compliance report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}