// Utility Functions for Enterprise Endpoint Management Application

import { CONSTANTS } from './constants';
import { Agent, DiscoveryJob, Script, Policy, FilterOptions, DateRange } from './types';

// Date and Time Utilities
export const formatDate = (date: Date | string, format: string = CONSTANTS.DATE_FORMATS.MEDIUM): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const options: Intl.DateTimeFormatOptions = {};
  
  switch (format) {
    case CONSTANTS.DATE_FORMATS.SHORT:
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      break;
    case CONSTANTS.DATE_FORMATS.MEDIUM:
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      break;
    case CONSTANTS.DATE_FORMATS.LONG:
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case CONSTANTS.DATE_FORMATS.FULL:
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case CONSTANTS.DATE_FORMATS.TIME:
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
      break;
    case CONSTANTS.DATE_FORMATS.DATETIME:
      options.year = 'numeric';
      options.month = '2-digit';
      options.day = '2-digit';
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit';
      break;
  }
  
  return d.toLocaleDateString('en-US', options);
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / CONSTANTS.TIME_INTERVALS.MINUTE);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffMins < 10080) {
    const days = Math.floor(diffMins / 1440);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return formatDate(d, CONSTANTS.DATE_FORMATS.MEDIUM);
  }
};

export const getTimeZoneOffset = (): string => {
  const offset = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset <= 0 ? '+' : '-';
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// String Utilities
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const camelCaseToTitleCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const generateId = (prefix: string = '', length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}-${result}` : result;
};

// Validation Utilities
export const isValidEmail = (email: string): boolean => {
  return CONSTANTS.VALIDATION_RULES.VALID_EMAIL_REGEX.test(email);
};

export const isValidIpAddress = (ip: string): boolean => {
  return CONSTANTS.VALIDATION_RULES.VALID_IP_REGEX.test(ip);
};

export const isValidHostname = (hostname: string): boolean => {
  return CONSTANTS.VALIDATION_RULES.VALID_HOSTNAME_REGEX.test(hostname);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < CONSTANTS.VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${CONSTANTS.VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters long`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Array Utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Object Utilities
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) {
    return true;
  }
  
  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length === 0;
  }
  
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }
  
  return false;
};

// Number Utilities
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

export const formatPercentage = (value: number, total: number, decimals: number = 1): string => {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(decimals) + '%';
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Color Utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Search and Filter Utilities
export const searchText = (text: string, query: string): boolean => {
  return text.toLowerCase().includes(query.toLowerCase());
};

export const filterByDateRange = (date: Date | string, range: DateRange): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d >= range.start && d <= range.end;
};

export const applyFilters = <T>(items: T[], filters: FilterOptions, searchFields: (keyof T)[]): T[] => {
  return items.filter(item => {
    // Search filter
    if (filters.searchQuery) {
      const matchesSearch = searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return searchText(value, filters.searchQuery!);
        }
        return false;
      });
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      const status = (item as any).status;
      if (status && status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
    }
    
    // Category filter
    if (filters.category && filters.category !== 'all') {
      const category = (item as any).category;
      if (category && category !== filters.category) {
        return false;
      }
    }
    
    // Type filter
    if (filters.type && filters.type !== 'all') {
      const type = (item as any).type;
      if (type && type !== filters.type) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange) {
      const createdAt = (item as any).createdAt;
      if (createdAt && !filterByDateRange(createdAt, filters.dateRange)) {
        return false;
      }
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const tags = (item as any).tags;
      if (!tags || !Array.isArray(tags)) {
        return false;
      }
      const hasMatchingTag = filters.tags.some(tag => tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });
};

// Status Utilities
export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'online':
    case 'active':
    case 'healthy':
    case 'running':
    case 'success':
      return CONSTANTS.COLOR_SCHEME.SUCCESS;
    case 'warning':
    case 'partial':
      return CONSTANTS.COLOR_SCHEME.WARNING;
    case 'offline':
    case 'failed':
    case 'error':
    case 'critical':
      return CONSTANTS.COLOR_SCHEME.ERROR;
    case 'maintenance':
    case 'inactive':
    case 'pending':
      return CONSTANTS.COLOR_SCHEME.SECONDARY;
    default:
      return CONSTANTS.COLOR_SCHEME.INFO;
  }
};

export const getStatusIcon = (status: string): string => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'online':
    case 'active':
    case 'healthy':
    case 'running':
    case 'success':
      return 'check-circle';
    case 'warning':
    case 'partial':
      return 'alert-triangle';
    case 'offline':
    case 'failed':
    case 'error':
    case 'critical':
      return 'x-circle';
    case 'maintenance':
    case 'inactive':
      return 'pause-circle';
    case 'pending':
      return 'clock';
    default:
      return 'help-circle';
  }
};

// File Utilities
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isValidFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
};

export const formatFileSize = (bytes: number): string => {
  return formatBytes(bytes);
};

// Network Utilities
export const isValidCIDR = (cidr: string): boolean => {
  const parts = cidr.split('/');
  if (parts.length !== 2) return false;
  
  const ip = parts[0];
  const prefix = parseInt(parts[1]);
  
  return isValidIpAddress(ip) && prefix >= 0 && prefix <= 32;
};

export const expandIPRange = (range: string): string[] => {
  const parts = range.split('-');
  if (parts.length !== 2) return [];
  
  const start = parts[0].trim();
  const end = parts[1].trim();
  
  if (!isValidIpAddress(start) || !isValidIpAddress(end)) {
    return [];
  }
  
  const startParts = start.split('.').map(Number);
  const endParts = end.split('.').map(Number);
  
  const ips: string[] = [];
  
  for (let a = startParts[0]; a <= endParts[0]; a++) {
    for (let b = startParts[1]; b <= endParts[1]; b++) {
      for (let c = startParts[2]; c <= endParts[2]; c++) {
        for (let d = startParts[3]; d <= endParts[3]; d++) {
          ips.push(`${a}.${b}.${c}.${d}`);
        }
      }
    }
  }
  
  return ips;
};

// Error Handling Utilities
export const createErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && error.message) {
    return error.message;
  }
  
  return CONSTANTS.ERROR_MESSAGES.GENERIC;
};

export const handleApiError = (error: any, fallbackMessage?: string): string => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 401) {
      return CONSTANTS.ERROR_MESSAGES.UNAUTHORIZED;
    } else if (status === 403) {
      return CONSTANTS.ERROR_MESSAGES.FORBIDDEN;
    } else if (status === 404) {
      return CONSTANTS.ERROR_MESSAGES.NOT_FOUND;
    } else if (status === 422) {
      return CONSTANTS.ERROR_MESSAGES.VALIDATION_FAILED;
    } else if (data && data.message) {
      return data.message;
    }
  } else if (error.request) {
    // Request was made but no response
    return CONSTANTS.ERROR_MESSAGES.NETWORK;
  }
  
  return fallbackMessage || createErrorMessage(error);
};

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = CONSTANTS.UI_CONFIG.SEARCH_DEBOUNCE_MS
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle Utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Local Storage Utilities
export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setToLocalStorage = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
  }
};

// Export all utilities
export default {
  // Date and Time
  formatDate,
  formatRelativeTime,
  getTimeZoneOffset,
  
  // String
  truncateText,
  capitalizeFirstLetter,
  camelCaseToTitleCase,
  slugify,
  generateId,
  
  // Validation
  isValidEmail,
  isValidIpAddress,
  isValidHostname,
  validatePassword,
  
  // Array
  groupBy,
  sortBy,
  removeDuplicates,
  chunk,
  
  // Object
  deepClone,
  omit,
  pick,
  isEmpty,
  
  // Number
  formatNumber,
  formatBytes,
  formatPercentage,
  clamp,
  
  // Color
  hexToRgb,
  rgbToHex,
  getContrastColor,
  
  // Search and Filter
  searchText,
  filterByDateRange,
  applyFilters,
  
  // Status
  getStatusColor,
  getStatusIcon,
  
  // File
  getFileExtension,
  isValidFileType,
  formatFileSize,
  
  // Network
  isValidCIDR,
  expandIPRange,
  
  // Error Handling
  createErrorMessage,
  handleApiError,
  
  // Performance
  debounce,
  throttle,
  
  // Local Storage
  getFromLocalStorage,
  setToLocalStorage,
  removeFromLocalStorage,
};