import React, { createContext, useContext, useState, ReactNode } from "react";
import { translations } from "./translations";

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar';

interface SimpleI18nContextType {
  language: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const SimpleI18nContext = createContext<SimpleI18nContextType | null>(null);

interface SimpleI18nProviderProps {
  children: ReactNode;
}

export function SimpleI18nProvider({ children }: SimpleI18nProviderProps) {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const changeLanguage = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
  };

  const t = (key: string, params?: Record<string, any>): string => {
    // Simple key lookup with fallback
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }
    
    // Fallback to English
    if (!value && language !== 'en') {
      value = translations.en;
      for (const k of keys) {
        value = value?.[k];
        if (!value) break;
      }
    }
    
    // Final fallback to key
    if (!value) {
      return key;
    }
    
    // Simple parameter interpolation
    if (params && typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match;
      });
    }
    
    return value;
  };

  return (
    <SimpleI18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </SimpleI18nContext.Provider>
  );
}

export function useSimpleI18n() {
  const context = useContext(SimpleI18nContext);
  if (!context) {
    throw new Error('useSimpleI18n must be used within a SimpleI18nProvider');
  }
  return context;
}