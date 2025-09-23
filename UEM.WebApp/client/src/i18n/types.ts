// Internationalization Types
export type SupportedLanguage = "en" | "es" | "fr" | "de" | "zh" | "ja" | "ar";

export interface LocaleConfig {
  language: SupportedLanguage;
  region: string;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
}

export interface TranslationKey {
  key: string;
  defaultValue: string;
  description?: string;
  context?: string;
  plural?: boolean;
}

export interface LogMessage {
  level: "info" | "warning" | "error" | "debug";
  key: string;
  params?: Record<string, any>;
}

export interface TranslationNamespace {
  common: Record<string, string>;
  navigation: Record<string, string>;
  dashboard: Record<string, string>;
  assets: Record<string, string>;
  discovery: Record<string, string>;
  scripts: Record<string, string>;
  policies: Record<string, string>;
  probes: Record<string, string>;
  credentials: Record<string, string>;
  agents: Record<string, string>;
  reports: Record<string, string>;
  users: Record<string, string>;
  settings: Record<string, string>;
  errors: Record<string, string>;
  success: Record<string, string>;
  validation: Record<string, string>;
  logging: Record<string, string>;
}

export type TranslationFunction = (key: string, params?: Record<string, any>) => string;
export type LoggingFunction = (message: LogMessage) => void;