// Application Constants
export const APP_CONFIG = {
  NAME: 'Enterprise Endpoint Management',
  VERSION: '2.1.0',
  DESCRIPTION: 'Comprehensive endpoint management and security monitoring platform',
  COMPANY: 'Enterprise Solutions',
  SUPPORT_EMAIL: 'support@enterprise.local',
  DOCUMENTATION_URL: 'https://docs.enterprise.local',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// UI Constants
export const UI_CONFIG = {
  ITEMS_PER_PAGE: 25,
  SEARCH_DEBOUNCE_MS: 300,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 200,
} as const;

// Agent Configuration
export const AGENT_CONFIG = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  TIMEOUT_THRESHOLD: 180000, // 3 minutes
  MAX_RETRY_ATTEMPTS: 3,
  PROBE_SOURCES: [
    'Enterprise-Probe-01',
    'Enterprise-Probe-02',
    'Enterprise-Probe-03',
    'Enterprise-Probe-04',
  ],
} as const;

// Asset Types
export const ASSET_TYPES = [
  'Domain Controller',
  'Web Server',
  'Database Server',
  'File Server',
  'Application Server',
  'Load Balancer',
  'Firewall',
  'Switch',
  'Router',
  'Workstation',
  'Laptop',
  'Mobile Device',
  'IoT Device',
  'Storage Device',
  'Virtualization Host',
  'Container Host',
] as const;

// Operating Systems
export const OPERATING_SYSTEMS = [
  'Windows Server 2022',
  'Windows Server 2019',
  'Windows Server 2016',
  'Windows 11',
  'Windows 10',
  'Ubuntu 22.04 LTS',
  'Ubuntu 20.04 LTS',
  'CentOS 8',
  'CentOS 7',
  'Red Hat Enterprise Linux 9',
  'Red Hat Enterprise Linux 8',
  'SUSE Linux Enterprise Server',
  'Debian 11',
  'Debian 10',
  'macOS Monterey',
  'macOS Big Sur',
  'AIX 7.2',
  'AIX 7.1',
  'Solaris 11',
  'FreeBSD 13',
] as const;

// Status Types
export const STATUS_TYPES = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  WARNING: 'Warning',
  CRITICAL: 'Critical',
  MAINTENANCE: 'Maintenance',
  UNKNOWN: 'Unknown',
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

// Discovery Methods
export const DISCOVERY_METHODS = {
  AGENT_BASED: 'Agent-Based',
  AGENTLESS: 'Agentless',
  MANUAL: 'Manual',
  HYBRID: 'Hybrid',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_SCRIPT_SIZE: 1048576, // 1MB
  VALID_IP_REGEX: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  VALID_EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  VALID_HOSTNAME_REGEX: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
} as const;

// Color Scheme
export const COLOR_SCHEME = {
  PRIMARY: 'hsl(217, 91%, 60%)',
  SECONDARY: 'hsl(215, 25%, 27%)',
  SUCCESS: 'hsl(142, 76%, 36%)',
  WARNING: 'hsl(38, 92%, 50%)',
  ERROR: 'hsl(0, 84%, 60%)',
  INFO: 'hsl(204, 94%, 94%)',
} as const;

// Default Values
export const DEFAULT_VALUES = {
  PAGINATION_SIZE: 25,
  REFRESH_INTERVAL: 30000,
  SESSION_TIMEOUT: 3600000, // 1 hour
  FILE_UPLOAD_MAX_SIZE: 10485760, // 10MB
  SEARCH_MIN_LENGTH: 3,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_FAILED: 'Validation failed. Please check your input.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a valid file.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Item created successfully.',
  UPDATED: 'Item updated successfully.',
  DELETED: 'Item deleted successfully.',
  SAVED: 'Changes saved successfully.',
  UPLOADED: 'File uploaded successfully.',
  DOWNLOADED: 'File downloaded successfully.',
  EXPORTED: 'Data exported successfully.',
  IMPORTED: 'Data imported successfully.',
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  FULL: 'EEEE, MMMM dd, yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'MM/dd/yyyy HH:mm:ss',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
] as const;

// Script Categories
export const SCRIPT_CATEGORIES = [
  'Applications & Databases',
  'Cloud & Virtualization',
  'Network & Connectivity',
  'Operating System',
  'Security',
  'System Monitoring',
  'Hardware Information',
  'Performance Analysis',
  'Backup & Recovery',
  'Compliance & Auditing',
] as const;

// Script Types
export const SCRIPT_TYPES = [
  'powershell',
  'bash',
  'python',
  'wmi',
  'sql',
  'registry',
  'custom',
] as const;

// Time Intervals
export const TIME_INTERVALS = {
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
  WEEK: 604800000,
  MONTH: 2592000000,
  YEAR: 31536000000,
} as const;

// Export all constants as a single object for easy access
export const CONSTANTS = {
  APP_CONFIG,
  API_CONFIG,
  UI_CONFIG,
  AGENT_CONFIG,
  ASSET_TYPES,
  OPERATING_SYSTEMS,
  STATUS_TYPES,
  PRIORITY_LEVELS,
  DISCOVERY_METHODS,
  VALIDATION_RULES,
  COLOR_SCHEME,
  DEFAULT_VALUES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  SUPPORTED_LANGUAGES,
  SCRIPT_CATEGORIES,
  SCRIPT_TYPES,
  TIME_INTERVALS,
} as const;

export default CONSTANTS;