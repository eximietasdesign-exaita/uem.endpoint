import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SupportedLanguage, TranslationNamespace } from "./types";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "./config";
import { detectBrowserLanguage, getStoredLanguagePreference, applyTextDirection } from "./utils";
import { translations } from "./translations";

interface I18nContextType {
  language: SupportedLanguage;
  translations: Record<SupportedLanguage, TranslationNamespace>;
  changeLanguage: (language: SupportedLanguage) => void;
  isLoading: boolean;
}

export const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export function I18nProvider({ children, defaultLanguage = DEFAULT_LANGUAGE }: I18nProviderProps) {
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(false);

  // Validate language and get translations
  const getTranslationData = (lang: SupportedLanguage): TranslationNamespace => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Unsupported language: ${lang}. Falling back to ${DEFAULT_LANGUAGE}`);
      return translations[DEFAULT_LANGUAGE];
    }
    
    return translations[lang] || translations[DEFAULT_LANGUAGE];
  };

  // Change language function
  const changeLanguage = (newLanguage: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(newLanguage)) {
      console.warn(`Unsupported language: ${newLanguage}. Falling back to ${DEFAULT_LANGUAGE}`);
      newLanguage = DEFAULT_LANGUAGE;
    }

    setLanguage(newLanguage);
    applyTextDirection(newLanguage);
    
    // Save preference
    localStorage.setItem('preferred-language', newLanguage);
    
    // Dispatch custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLanguage } 
    }));
  };

  // Initialize language on mount
  useEffect(() => {
    let initialLanguage = defaultLanguage;
    
    // Check for stored preference
    const storedLang = getStoredLanguagePreference();
    if (storedLang) {
      initialLanguage = storedLang;
    } else {
      // Detect browser language
      const detectedLang = detectBrowserLanguage();
      if (detectedLang !== DEFAULT_LANGUAGE) {
        initialLanguage = detectedLang;
      }
    }
    
    changeLanguage(initialLanguage);
  }, []);

  // All translations are preloaded, no need for additional loading

  const contextValue: I18nContextType = {
    language,
    translations,
    changeLanguage,
    isLoading
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use the I18n context
export function useI18n() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}