import { SupportedLanguage, TranslationNamespace } from "./types";
import { getNestedValue } from "./utils";

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ValidationStats;
}

export interface ValidationError {
  type: 'missing_key' | 'invalid_interpolation' | 'malformed_json' | 'type_mismatch';
  language: SupportedLanguage;
  key: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'unused_key' | 'inconsistent_interpolation' | 'long_text' | 'special_chars';
  language: SupportedLanguage;
  key: string;
  message: string;
}

export interface ValidationStats {
  totalKeys: number;
  translatedKeys: Record<SupportedLanguage, number>;
  missingKeys: Record<SupportedLanguage, number>;
  completeness: Record<SupportedLanguage, number>;
  languageCount: number;
}

export class TranslationValidator {
  private baseLanguage: SupportedLanguage = 'en';
  private requiredInterpolationPattern = /\{\{[\w\s]+\}\}/g;
  private maxTextLength = 500;

  constructor(baseLanguage: SupportedLanguage = 'en') {
    this.baseLanguage = baseLanguage;
  }

  // Main validation method
  validateTranslations(translations: Record<SupportedLanguage, TranslationNamespace>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const stats = this.generateStats(translations);

    // Get base language keys for comparison
    const baseKeys = this.extractAllKeys(translations[this.baseLanguage]);

    // Validate each language
    Object.entries(translations).forEach(([lang, translation]) => {
      const language = lang as SupportedLanguage;
      
      // Skip base language for missing key validation
      if (language !== this.baseLanguage) {
        errors.push(...this.validateMissingKeys(baseKeys, translation, language));
      }
      
      errors.push(...this.validateInterpolation(translation, language, translations[this.baseLanguage]));
      warnings.push(...this.validateTextLength(translation, language));
      warnings.push(...this.validateSpecialCharacters(translation, language));
    });

    // Cross-language validations
    warnings.push(...this.validateConsistentInterpolation(translations));
    warnings.push(...this.validateUnusedKeys(translations));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats
    };
  }

  // Validate missing translation keys
  private validateMissingKeys(
    baseKeys: string[], 
    translation: TranslationNamespace, 
    language: SupportedLanguage
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    baseKeys.forEach(key => {
      const value = getNestedValue(translation, key);
      if (!value || value.trim() === '') {
        errors.push({
          type: 'missing_key',
          language,
          key,
          message: `Missing translation for key '${key}' in language '${language}'`,
          severity: 'error'
        });
      }
    });

    return errors;
  }

  // Validate interpolation consistency
  private validateInterpolation(
    translation: TranslationNamespace,
    language: SupportedLanguage,
    baseTranslation: TranslationNamespace
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const keys = this.extractAllKeys(translation);

    keys.forEach(key => {
      const value = getNestedValue(translation, key);
      const baseValue = getNestedValue(baseTranslation, key);
      
      if (!value || !baseValue) return;

      // Extract interpolation variables
      const valueVars = this.extractInterpolationVars(value);
      const baseVars = this.extractInterpolationVars(baseValue);

      // Check for missing variables
      baseVars.forEach(baseVar => {
        if (!valueVars.includes(baseVar)) {
          errors.push({
            type: 'invalid_interpolation',
            language,
            key,
            message: `Missing interpolation variable '${baseVar}' in translation for '${key}'`,
            severity: 'error'
          });
        }
      });

      // Check for extra variables
      valueVars.forEach(valueVar => {
        if (!baseVars.includes(valueVar)) {
          errors.push({
            type: 'invalid_interpolation',
            language,
            key,
            message: `Extra interpolation variable '${valueVar}' in translation for '${key}'`,
            severity: 'warning'
          });
        }
      });
    });

    return errors;
  }

  // Validate text length
  private validateTextLength(
    translation: TranslationNamespace,
    language: SupportedLanguage
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const keys = this.extractAllKeys(translation);

    keys.forEach(key => {
      const value = getNestedValue(translation, key);
      if (value && value.length > this.maxTextLength) {
        warnings.push({
          type: 'long_text',
          language,
          key,
          message: `Text too long (${value.length} chars) for key '${key}'. Consider splitting or shortening.`
        });
      }
    });

    return warnings;
  }

  // Validate special characters and formatting
  private validateSpecialCharacters(
    translation: TranslationNamespace,
    language: SupportedLanguage
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const keys = this.extractAllKeys(translation);

    keys.forEach(key => {
      const value = getNestedValue(translation, key);
      if (!value) return;

      // Check for unescaped quotes that might break JSON
      if (/(?<!\\)["']/.test(value)) {
        warnings.push({
          type: 'special_chars',
          language,
          key,
          message: `Unescaped quotes found in '${key}'. This might cause JSON parsing issues.`
        });
      }

      // Check for HTML entities that might need escaping
      if (/<[^>]+>/.test(value)) {
        warnings.push({
          type: 'special_chars',
          language,
          key,
          message: `HTML tags found in '${key}'. Ensure proper escaping for security.`
        });
      }
    });

    return warnings;
  }

  // Validate consistent interpolation across languages
  private validateConsistentInterpolation(
    translations: Record<SupportedLanguage, TranslationNamespace>
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    const baseTranslation = translations[this.baseLanguage];
    const baseKeys = this.extractAllKeys(baseTranslation);

    baseKeys.forEach(key => {
      const baseValue = getNestedValue(baseTranslation, key);
      if (!baseValue) return;

      const baseVars = this.extractInterpolationVars(baseValue);
      if (baseVars.length === 0) return;

      Object.entries(translations).forEach(([lang, translation]) => {
        const language = lang as SupportedLanguage;
        if (language === this.baseLanguage) return;

        const value = getNestedValue(translation, key);
        if (!value) return;

        const vars = this.extractInterpolationVars(value);
        
        // Check variable order consistency
        if (baseVars.length === vars.length && 
            !baseVars.every((v, i) => v === vars[i])) {
          warnings.push({
            type: 'inconsistent_interpolation',
            language,
            key,
            message: `Interpolation variable order differs from base language in '${key}'`
          });
        }
      });
    });

    return warnings;
  }

  // Find potentially unused translation keys
  private validateUnusedKeys(
    translations: Record<SupportedLanguage, TranslationNamespace>
  ): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    // This is a simplified check - in a real implementation,
    // you'd analyze the actual codebase usage
    const baseKeys = this.extractAllKeys(translations[this.baseLanguage]);
    const potentiallyUnused = baseKeys.filter(key => {
      // Keys that follow certain patterns might be unused
      return key.includes('_old') || 
             key.includes('_deprecated') ||
             key.includes('_temp');
    });

    potentiallyUnused.forEach(key => {
      warnings.push({
        type: 'unused_key',
        language: this.baseLanguage,
        key,
        message: `Key '${key}' might be unused (contains deprecated/temp marker)`
      });
    });

    return warnings;
  }

  // Generate validation statistics
  private generateStats(translations: Record<SupportedLanguage, TranslationNamespace>): ValidationStats {
    const baseKeys = this.extractAllKeys(translations[this.baseLanguage]);
    const totalKeys = baseKeys.length;
    
    const translatedKeys: Record<SupportedLanguage, number> = {} as any;
    const missingKeys: Record<SupportedLanguage, number> = {} as any;
    const completeness: Record<SupportedLanguage, number> = {} as any;

    Object.entries(translations).forEach(([lang, translation]) => {
      const language = lang as SupportedLanguage;
      let translated = 0;

      baseKeys.forEach(key => {
        const value = getNestedValue(translation, key);
        if (value && value.trim() !== '') {
          translated++;
        }
      });

      translatedKeys[language] = translated;
      missingKeys[language] = totalKeys - translated;
      completeness[language] = Math.round((translated / totalKeys) * 100);
    });

    return {
      totalKeys,
      translatedKeys,
      missingKeys,
      completeness,
      languageCount: Object.keys(translations).length
    };
  }

  // Helper methods
  private extractAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...this.extractAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    });
    
    return keys;
  }

  private extractInterpolationVars(text: string): string[] {
    const matches = text.match(this.requiredInterpolationPattern);
    return matches ? matches.map(match => match.slice(2, -2).trim()) : [];
  }

  // Public utility methods
  generateValidationReport(result: ValidationResult): string {
    let report = '# Translation Validation Report\n\n';
    
    report += `## Summary\n`;
    report += `- **Status**: ${result.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
    report += `- **Total Keys**: ${result.stats.totalKeys}\n`;
    report += `- **Languages**: ${result.stats.languageCount}\n`;
    report += `- **Errors**: ${result.errors.length}\n`;
    report += `- **Warnings**: ${result.warnings.length}\n\n`;
    
    report += `## Completeness by Language\n`;
    Object.entries(result.stats.completeness).forEach(([lang, percentage]) => {
      const emoji = percentage === 100 ? '✅' : percentage >= 90 ? '⚠️' : '❌';
      report += `- **${lang.toUpperCase()}**: ${emoji} ${percentage}% (${result.stats.translatedKeys[lang as SupportedLanguage]}/${result.stats.totalKeys})\n`;
    });
    
    if (result.errors.length > 0) {
      report += `\n## Errors\n`;
      result.errors.forEach(error => {
        report += `- **${error.language.toUpperCase()}**: ${error.message}\n`;
      });
    }
    
    if (result.warnings.length > 0) {
      report += `\n## Warnings\n`;
      result.warnings.forEach(warning => {
        report += `- **${warning.language.toUpperCase()}**: ${warning.message}\n`;
      });
    }
    
    return report;
  }

  // Export validation results as JSON
  exportValidationResults(result: ValidationResult): string {
    return JSON.stringify(result, null, 2);
  }
}

// Default validator instance
export const translationValidator = new TranslationValidator();

// Validation utility functions
export function validateTranslationFile(content: string): { isValid: boolean; error?: string } {
  try {
    const parsed = JSON.parse(content);
    
    // Basic structure validation
    if (typeof parsed !== 'object' || parsed === null) {
      return { isValid: false, error: 'Translation file must be a JSON object' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: `JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export function validateTranslationKey(key: string): { isValid: boolean; error?: string } {
  // Key validation rules
  if (!key || key.trim() === '') {
    return { isValid: false, error: 'Translation key cannot be empty' };
  }
  
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/i.test(key)) {
    return { 
      isValid: false, 
      error: 'Translation key must use alphanumeric characters, underscores, and dots for nesting' 
    };
  }
  
  if (key.length > 100) {
    return { isValid: false, error: 'Translation key too long (max 100 characters)' };
  }
  
  return { isValid: true };
}