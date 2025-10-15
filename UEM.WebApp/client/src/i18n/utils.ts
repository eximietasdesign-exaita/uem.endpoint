import { SupportedLanguage, TranslationNamespace, LogMessage } from "./types";
import { LOCALE_CONFIGS, DEFAULT_LANGUAGE, FALLBACK_LANGUAGE } from "./config";

// Translation utilities
export function interpolateString(template: string, params: Record<string, any> = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

export function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function detectBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language.toLowerCase();
  const langCode = browserLang.split('-')[0] as SupportedLanguage;
  
  return LOCALE_CONFIGS[langCode] ? langCode : DEFAULT_LANGUAGE;
}

export function formatDate(date: Date | string, language: SupportedLanguage = DEFAULT_LANGUAGE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = LOCALE_CONFIGS[language];
  
  return new Intl.DateTimeFormat(`${language}-${locale.region}`, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
}

export function formatTime(date: Date | string, language: SupportedLanguage = DEFAULT_LANGUAGE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = LOCALE_CONFIGS[language];
  
  return new Intl.DateTimeFormat(`${language}-${locale.region}`, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: locale.timeFormat.includes('a')
  }).format(dateObj);
}

export function formatNumber(num: number, language: SupportedLanguage = DEFAULT_LANGUAGE): string {
  const locale = LOCALE_CONFIGS[language];
  
  return new Intl.NumberFormat(`${language}-${locale.region}`).format(num);
}

export function formatCurrency(amount: number, language: SupportedLanguage = DEFAULT_LANGUAGE): string {
  const locale = LOCALE_CONFIGS[language];
  
  return new Intl.NumberFormat(`${language}-${locale.region}`, {
    style: 'currency',
    currency: locale.numberFormat.currency === '$' ? 'USD' : 
              locale.numberFormat.currency === '€' ? 'EUR' :
              locale.numberFormat.currency === '¥' ? 'JPY' : 'USD'
  }).format(amount);
}

export function formatRelativeTime(date: Date | string, language: SupportedLanguage = DEFAULT_LANGUAGE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(`${language}-${LOCALE_CONFIGS[language].region}`, {
    numeric: 'auto'
  });
  
  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

// Validation utilities
export function validateTranslationKeys(translations: Record<string, any>, requiredKeys: string[]): string[] {
  const missingKeys: string[] = [];
  
  requiredKeys.forEach(key => {
    if (!getNestedValue(translations, key)) {
      missingKeys.push(key);
    }
  });
  
  return missingKeys;
}

export function generateTranslationReport(translations: Record<SupportedLanguage, any>): {
  totalKeys: number;
  completeness: Record<SupportedLanguage, { translated: number; missing: number; percentage: number }>;
  missingKeys: Record<SupportedLanguage, string[]>;
} {
  const baseLanguage = DEFAULT_LANGUAGE;
  const baseKeys = extractAllKeys(translations[baseLanguage]);
  
  const report = {
    totalKeys: baseKeys.length,
    completeness: {} as any,
    missingKeys: {} as any
  };
  
  Object.keys(translations).forEach(lang => {
    const missing = validateTranslationKeys(translations[lang as SupportedLanguage], baseKeys);
    const translated = baseKeys.length - missing.length;
    
    report.completeness[lang as SupportedLanguage] = {
      translated,
      missing: missing.length,
      percentage: Math.round((translated / baseKeys.length) * 100)
    };
    
    report.missingKeys[lang as SupportedLanguage] = missing;
  });
  
  return report;
}

function extractAllKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  
  Object.keys(obj).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...extractAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  });
  
  return keys;
}

// Logging utilities
export function createLogMessage(
  level: LogMessage['level'],
  key: string,
  params?: Record<string, any>
): LogMessage {
  return {
    level,
    key,
    params: params || {}
  };
}

export function formatLogMessage(
  message: LogMessage,
  translations: Record<string, string>,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  const template = getNestedValue(translations, `logging.${message.key}`) || message.key;
  const formattedMessage = interpolateString(template, message.params);
  
  const timestamp = formatTime(new Date(), language);
  const level = message.level.toUpperCase();
  
  return `[${timestamp}] ${level}: ${formattedMessage}`;
}

// RTL/LTR utilities
export function getTextDirection(language: SupportedLanguage): 'ltr' | 'rtl' {
  return LOCALE_CONFIGS[language]?.direction || 'ltr';
}

export function applyTextDirection(language: SupportedLanguage): void {
  const direction = getTextDirection(language);
  document.documentElement.setAttribute('dir', direction);
  document.documentElement.setAttribute('lang', language);
}

// Storage utilities
export function saveLanguagePreference(language: SupportedLanguage): void {
  localStorage.setItem('preferred-language', language);
}

export function getStoredLanguagePreference(): SupportedLanguage | null {
  const stored = localStorage.getItem('preferred-language');
  return stored && LOCALE_CONFIGS[stored as SupportedLanguage] ? stored as SupportedLanguage : null;
}

export function clearLanguagePreference(): void {
  localStorage.removeItem('preferred-language');
}