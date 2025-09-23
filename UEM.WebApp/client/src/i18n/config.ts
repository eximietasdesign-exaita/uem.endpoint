import { LocaleConfig, SupportedLanguage } from "./types";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "es", "fr", "de", "zh", "ja", "ar"];

export const LOCALE_CONFIGS: Record<SupportedLanguage, LocaleConfig> = {
  en: {
    language: "en",
    region: "US",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "h:mm a",
    numberFormat: {
      decimal: ".",
      thousands: ",",
      currency: "$"
    }
  },
  es: {
    language: "es",
    region: "ES",
    name: "Spanish",
    nativeName: "Español",
    direction: "ltr",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "HH:mm",
    numberFormat: {
      decimal: ",",
      thousands: ".",
      currency: "€"
    }
  },
  fr: {
    language: "fr",
    region: "FR",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "HH:mm",
    numberFormat: {
      decimal: ",",
      thousands: " ",
      currency: "€"
    }
  },
  de: {
    language: "de",
    region: "DE",
    name: "German",
    nativeName: "Deutsch",
    direction: "ltr",
    dateFormat: "dd.MM.yyyy",
    timeFormat: "HH:mm",
    numberFormat: {
      decimal: ",",
      thousands: ".",
      currency: "€"
    }
  },
  zh: {
    language: "zh",
    region: "CN",
    name: "Chinese",
    nativeName: "中文",
    direction: "ltr",
    dateFormat: "yyyy/MM/dd",
    timeFormat: "HH:mm",
    numberFormat: {
      decimal: ".",
      thousands: ",",
      currency: "¥"
    }
  },
  ja: {
    language: "ja",
    region: "JP",
    name: "Japanese",
    nativeName: "日本語",
    direction: "ltr",
    dateFormat: "yyyy/MM/dd",
    timeFormat: "HH:mm",
    numberFormat: {
      decimal: ".",
      thousands: ",",
      currency: "¥"
    }
  },
  ar: {
    language: "ar",
    region: "SA",
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "HH:mm",
    numberFormat: {
      decimal: ".",
      thousands: ",",
      currency: "ر.س"
    }
  }
};

export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
export const FALLBACK_LANGUAGE: SupportedLanguage = "en";

export const I18N_CONFIG = {
  defaultNamespace: "common",
  fallbackLanguage: FALLBACK_LANGUAGE,
  supportedLanguages: SUPPORTED_LANGUAGES,
  interpolation: {
    prefix: "{{",
    suffix: "}}"
  },
  detection: {
    order: ["localStorage", "navigator", "htmlTag"],
    caches: ["localStorage"]
  }
};