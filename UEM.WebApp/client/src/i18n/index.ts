// Main entry point for the internationalization framework

// Types
export type { 
  SupportedLanguage, 
  LocaleConfig, 
  TranslationKey, 
  LogMessage, 
  TranslationNamespace,
  TranslationFunction,
  LoggingFunction 
} from './types';

// Configuration
export { 
  SUPPORTED_LANGUAGES, 
  LOCALE_CONFIGS, 
  DEFAULT_LANGUAGE, 
  FALLBACK_LANGUAGE,
  I18N_CONFIG 
} from './config';

// Context and Provider
export { I18nProvider, I18nContext, useI18n } from './context';

// Hooks
export {
  useTranslation,
  useCommonTranslation,
  useNavigationTranslation,
  useDashboardTranslation,
  useAssetsTranslation,
  useDiscoveryTranslation,
  useScriptsTranslation,
  usePoliciesTranslation,
  useProbesTranslation,
  useCredentialsTranslation,
  useAgentsTranslation,
  useUsersTranslation,
  useSettingsTranslation,
  useErrorTranslation,
  useSuccessTranslation,
  useValidationTranslation,
  useLogging,
  useLanguageDetection,
  useRTLSupport,
  useLanguagePreference
} from './hooks';

// Utilities
export {
  interpolateString,
  getNestedValue,
  detectBrowserLanguage,
  formatDate,
  formatTime,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  validateTranslationKeys,
  generateTranslationReport,
  createLogMessage,
  formatLogMessage,
  getTextDirection,
  applyTextDirection,
  saveLanguagePreference,
  getStoredLanguagePreference,
  clearLanguagePreference
} from './utils';

// Logger
export { 
  i18nLogger, 
  InternationalizedLogger, 
  createI18nLogger 
} from './logger';

// Validation
export { 
  translationValidator, 
  TranslationValidator,
  validateTranslationFile,
  validateTranslationKey 
} from './validation';

export type { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning, 
  ValidationStats 
} from './validation';

// Re-export commonly used types for convenience
export type Translation = TranslationNamespace;
export type Language = SupportedLanguage;