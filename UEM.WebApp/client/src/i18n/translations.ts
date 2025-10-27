// Static imports for all translation files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ar from './locales/ar.json';

import { SupportedLanguage, TranslationNamespace } from './types';

// Compile all translations into a single object
export const translations: Record<SupportedLanguage, TranslationNamespace> = {
  en,
  es,
  fr,
  de,
  zh,
  ja,
  ar,
};

// Export individual translations for convenience
export { en, es, fr, de, zh, ja, ar };