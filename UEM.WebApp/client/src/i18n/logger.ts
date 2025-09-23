import { LogMessage, SupportedLanguage } from "./types";
import { formatLogMessage, createLogMessage } from "./utils";

interface LoggerConfig {
  level: 'debug' | 'info' | 'warning' | 'error';
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  timestampFormat: 'iso' | 'locale';
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  key: string;
  params?: Record<string, any>;
  language: string;
}

class InternationalizedLogger {
  private config: LoggerConfig;
  private logEntries: LogEntry[] = [];
  private translations: Record<string, string> = {};
  private currentLanguage: SupportedLanguage = 'en';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      timestampFormat: 'iso',
      ...config
    };

    // Load stored logs if available
    this.loadStoredLogs();
  }

  // Update translations and language
  updateTranslations(translations: Record<string, string>, language: SupportedLanguage) {
    this.translations = translations;
    this.currentLanguage = language;
  }

  // Core logging method
  private log(message: LogMessage) {
    const shouldLog = this.shouldLog(message.level);
    if (!shouldLog) return;

    const formattedMessage = formatLogMessage(message, this.translations, this.currentLanguage);
    const timestamp = this.formatTimestamp(new Date());

    const logEntry: LogEntry = {
      timestamp,
      level: message.level,
      message: formattedMessage,
      key: message.key,
      params: message.params,
      language: this.currentLanguage
    };

    // Console logging
    if (this.config.enableConsole) {
      this.consoleLog(message.level, formattedMessage);
    }

    // Storage logging
    if (this.config.enableStorage) {
      this.storeLog(logEntry);
    }

    // Custom event for external listeners
    window.dispatchEvent(new CustomEvent('i18nLog', { detail: logEntry }));
  }

  // Public logging methods
  debug(key: string, params?: Record<string, any>) {
    this.log(createLogMessage('debug', key, params));
  }

  info(key: string, params?: Record<string, any>) {
    this.log(createLogMessage('info', key, params));
  }

  warning(key: string, params?: Record<string, any>) {
    this.log(createLogMessage('warning', key, params));
  }

  error(key: string, params?: Record<string, any>) {
    this.log(createLogMessage('error', key, params));
  }

  // Discovery-specific logging methods
  discoveryStarted(jobName: string) {
    this.info('info_discovery_started', { jobName });
  }

  discoveryCompleted(jobName: string, discovered: number) {
    this.info('info_discovery_completed', { jobName, discovered });
  }

  discoveryFailed(jobName: string, error: string) {
    this.error('error_discovery_failed', { jobName, error });
  }

  // Agent-specific logging methods
  agentDeployed(hostname: string, ipAddress: string) {
    this.info('info_agent_deployed', { hostname, ipAddress });
  }

  agentDeploymentFailed(hostname: string, error: string) {
    this.error('error_agent_deployment', { hostname, error });
  }

  agentHeartbeat(agentId: string) {
    this.debug('debug_agent_heartbeat', { agentId });
  }

  // Script execution logging
  scriptExecuted(scriptName: string, hostname: string) {
    this.info('info_script_executed', { scriptName, hostname });
  }

  scriptFailed(scriptName: string, hostname: string, error: string) {
    this.error('error_script_execution', { scriptName, hostname, error });
  }

  // Policy logging
  policyApplied(policyName: string, agentCount: number) {
    this.info('info_policy_applied', { policyName, agentCount });
  }

  policyConflict(agentId: string) {
    this.warning('warning_policy_conflict', { agentId });
  }

  // System logging
  highCpuUsage(probeName: string, usage: number) {
    this.warning('warning_high_cpu', { probeName, usage });
  }

  probeOffline(probeName: string) {
    this.error('error_probe_offline', { probeName });
  }

  databaseConnectionFailed(error: string) {
    this.error('error_database_connection', { error });
  }

  // User activity logging
  userLogin(username: string, ipAddress: string) {
    this.info('info_user_login', { username, ipAddress });
  }

  authenticationFailed(username: string, ipAddress: string) {
    this.warning('warning_failed_authentication', { username, ipAddress });
  }

  // API logging
  apiRequest(method: string, endpoint: string, ipAddress: string) {
    this.debug('debug_api_request', { method, endpoint, ipAddress });
  }

  // Performance logging
  queryExecution(duration: number, query: string) {
    this.debug('debug_query_execution', { duration, query });
  }

  // Security logging
  criticalVulnerability(hostname: string, cveId: string) {
    this.error('error_critical_vulnerability', { hostname, cveId });
  }

  // Helper methods
  private shouldLog(level: LogMessage['level']): boolean {
    const levels = ['debug', 'info', 'warning', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private consoleLog(level: string, message: string) {
    switch (level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warning':
        console.warn(message);
        break;
      case 'error':
        console.error(message);
        break;
      default:
        console.log(message);
    }
  }

  private formatTimestamp(date: Date): string {
    return this.config.timestampFormat === 'iso' 
      ? date.toISOString()
      : date.toLocaleString();
  }

  private storeLog(entry: LogEntry) {
    this.logEntries.push(entry);
    
    // Maintain max entries limit
    if (this.logEntries.length > this.config.maxStorageEntries) {
      this.logEntries = this.logEntries.slice(-this.config.maxStorageEntries);
    }
    
    // Persist to localStorage
    try {
      localStorage.setItem('i18n-logs', JSON.stringify(this.logEntries));
    } catch (error) {
      console.warn('Failed to persist logs to localStorage:', error);
    }
  }

  private loadStoredLogs() {
    try {
      const stored = localStorage.getItem('i18n-logs');
      if (stored) {
        this.logEntries = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored logs:', error);
      this.logEntries = [];
    }
  }

  // Public methods for log management
  getLogs(level?: LogMessage['level']): LogEntry[] {
    if (level) {
      return this.logEntries.filter(entry => entry.level === level);
    }
    return [...this.logEntries];
  }

  clearLogs() {
    this.logEntries = [];
    localStorage.removeItem('i18n-logs');
  }

  exportLogs(): string {
    return JSON.stringify(this.logEntries, null, 2);
  }

  setLogLevel(level: LoggerConfig['level']) {
    this.config.level = level;
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Global logger instance
export const i18nLogger = new InternationalizedLogger();

// Export for custom logger instances
export { InternationalizedLogger };

// Convenience function for quick logging
export function createI18nLogger(config?: Partial<LoggerConfig>): InternationalizedLogger {
  return new InternationalizedLogger(config);
}