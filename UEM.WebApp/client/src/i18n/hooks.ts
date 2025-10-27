import { useContext, useEffect, useCallback } from "react";
import { SupportedLanguage, LogMessage } from "./types";
import { LOCALE_CONFIGS } from "./config";
import { 
  interpolateString, 
  getNestedValue, 
  formatLogMessage, 
  applyTextDirection,
  saveLanguagePreference,
  createLogMessage
} from "./utils";

// Import context (will be created)
import { I18nContext } from "./context";

// Main translation hook
export function useTranslation(namespace?: string) {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  const { language, translations, changeLanguage, isLoading } = context;
  
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let translation = getNestedValue(translations[language], fullKey);
    
    // Fallback to default language if translation not found
    if (!translation && language !== 'en') {
      translation = getNestedValue(translations.en, fullKey);
    }
    
    // Final fallback to key itself
    if (!translation) {
      console.warn(`Translation missing for key: ${fullKey} in language: ${language}`);
      translation = key;
    }
    
    return interpolateString(translation, params);
  }, [language, translations, namespace]);
  
  const formatDate = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = LOCALE_CONFIGS[language];
    
    return new Intl.DateTimeFormat(`${language}-${locale.region}`, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  }, [language]);
  
  const formatTime = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = LOCALE_CONFIGS[language];
    
    return new Intl.DateTimeFormat(`${language}-${locale.region}`, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: locale.timeFormat.includes('a')
    }).format(dateObj);
  }, [language]);
  
  const formatNumber = useCallback((num: number) => {
    const locale = LOCALE_CONFIGS[language];
    return new Intl.NumberFormat(`${language}-${locale.region}`).format(num);
  }, [language]);
  
  const formatCurrency = useCallback((amount: number) => {
    const locale = LOCALE_CONFIGS[language];
    const currencyCode = locale.numberFormat.currency === '$' ? 'USD' : 
                        locale.numberFormat.currency === '€' ? 'EUR' :
                        locale.numberFormat.currency === '¥' ? 'JPY' : 'USD';
    
    return new Intl.NumberFormat(`${language}-${locale.region}`, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  }, [language]);
  
  return {
    t,
    language,
    changeLanguage,
    isLoading,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    locale: LOCALE_CONFIGS[language],
    direction: LOCALE_CONFIGS[language].direction
  };
}

// Specialized hooks for different namespaces
export function useCommonTranslation() {
  return useTranslation('common');
}

export function useNavigationTranslation() {
  return useTranslation('navigation');
}

export function useDashboardTranslation() {
  return useTranslation('dashboard');
}

export function useAssetsTranslation() {
  return useTranslation('assets');
}

export function useDiscoveryTranslation() {
  return useTranslation('discovery');
}

export function useScriptsTranslation() {
  return useTranslation('scripts');
}

export function usePoliciesTranslation() {
  return useTranslation('policies');
}

export function useProbesTranslation() {
  return useTranslation('probes');
}

export function useCredentialsTranslation() {
  return useTranslation('credentials');
}

export function useAgentsTranslation() {
  return useTranslation('agents');
}

export function useUsersTranslation() {
  return useTranslation('users');
}

export function useSettingsTranslation() {
  return useTranslation('settings');
}

export function useErrorTranslation() {
  return useTranslation('errors');
}

export function useSuccessTranslation() {
  return useTranslation('success');
}

export function useValidationTranslation() {
  return useTranslation('validation');
}

// Logging hook
export function useLogging() {
  const { language, translations } = useContext(I18nContext) || {};
  
  const log = useCallback((message: LogMessage) => {
    if (!translations || !language) return;
    
    const formattedMessage = formatLogMessage(message, translations[language], language);
    
    switch (message.level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warning':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }, [language, translations]);
  
  const logInfo = useCallback((key: string, params?: Record<string, any>) => {
    log(createLogMessage('info', key, params));
  }, [log]);
  
  const logWarning = useCallback((key: string, params?: Record<string, any>) => {
    log(createLogMessage('warning', key, params));
  }, [log]);
  
  const logError = useCallback((key: string, params?: Record<string, any>) => {
    log(createLogMessage('error', key, params));
  }, [log]);
  
  const logDebug = useCallback((key: string, params?: Record<string, any>) => {
    log(createLogMessage('debug', key, params));
  }, [log]);
  
  return {
    log,
    logInfo,
    logWarning,
    logError,
    logDebug
  };
}

// Language detection and management hook
export function useLanguageDetection() {
  const { changeLanguage } = useTranslation();
  
  useEffect(() => {
    // Check for stored preference
    const storedLang = localStorage.getItem('preferred-language') as SupportedLanguage;
    if (storedLang && LOCALE_CONFIGS[storedLang]) {
      changeLanguage(storedLang);
      return;
    }
    
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    const langCode = browserLang.split('-')[0] as SupportedLanguage;
    
    if (LOCALE_CONFIGS[langCode]) {
      changeLanguage(langCode);
    }
  }, [changeLanguage]);
}

// RTL support hook
export function useRTLSupport() {
  const { language, direction } = useTranslation();
  
  useEffect(() => {
    applyTextDirection(language);
  }, [language]);
  
  return {
    isRTL: direction === 'rtl',
    direction
  };
}

// Persistent language preference hook
export function useLanguagePreference() {
  const { language, changeLanguage } = useTranslation();
  
  const setLanguagePreference = useCallback((newLanguage: SupportedLanguage) => {
    changeLanguage(newLanguage);
    saveLanguagePreference(newLanguage);
  }, [changeLanguage]);
  
  return {
    language,
    setLanguagePreference
  };
}