import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ScriptGenerationRequest {
  purpose: string;
  targetOS: 'windows' | 'linux' | 'macos' | 'cross-platform';
  scriptType: 'powershell' | 'bash' | 'python' | 'wmi';
  requirements: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
}

export interface ScriptAnalysisResult {
  quality: number; // 1-5 scale
  security: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  performance: {
    score: number;
    suggestions: string[];
  };
  maintainability: {
    score: number;
    improvements: string[];
  };
  documentation: {
    completeness: number;
    suggestions: string[];
  };
  overallRecommendations: string[];
}

export interface ScriptOptimizationResult {
  optimizedCode: string;
  improvements: string[];
  performanceGains: string[];
  securityEnhancements: string[];
}

export class AIScriptService {
  static async generateScript(request: ScriptGenerationRequest): Promise<{ code: string; documentation: string; explanation: string }> {
    const prompt = `Generate a ${request.scriptType} script for ${request.targetOS} with the following requirements:

Purpose: ${request.purpose}
Requirements: ${request.requirements.join(', ')}
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
      console.error('AI Script Generation Error:', error);
      throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async analyzeScript(scriptCode: string, scriptType: string): Promise<ScriptAnalysisResult> {
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
      return result as ScriptAnalysisResult;
    } catch (error) {
      console.error('AI Script Analysis Error:', error);
      throw new Error(`Failed to analyze script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async optimizeScript(scriptCode: string, scriptType: string): Promise<ScriptOptimizationResult> {
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
      return result as ScriptOptimizationResult;
    } catch (error) {
      console.error('AI Script Optimization Error:', error);
      throw new Error(`Failed to optimize script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async generateDocumentation(scriptCode: string, scriptType: string): Promise<string> {
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
      console.error('AI Documentation Generation Error:', error);
      throw new Error(`Failed to generate documentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async suggestImprovements(scriptPurpose: string, currentCode: string, scriptType: string): Promise<string[]> {
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
      console.error('AI Improvement Suggestions Error:', error);
      throw new Error(`Failed to generate improvement suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}