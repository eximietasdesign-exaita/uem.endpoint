import React from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSimpleI18n, SupportedLanguage } from "@/i18n/SimpleI18n";

const LANGUAGE_OPTIONS = [
  { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English' },
  { code: 'es' as SupportedLanguage, name: 'Spanish', nativeName: 'Español' },
  { code: 'fr' as SupportedLanguage, name: 'French', nativeName: 'Français' },
  { code: 'de' as SupportedLanguage, name: 'German', nativeName: 'Deutsch' },
  { code: 'zh' as SupportedLanguage, name: 'Chinese', nativeName: '中文' },
  { code: 'ja' as SupportedLanguage, name: 'Japanese', nativeName: '日本語' },
  { code: 'ar' as SupportedLanguage, name: 'Arabic', nativeName: 'العربية' },
];

export function SimpleLanguageSelector() {
  const { language, changeLanguage } = useSimpleI18n();

  const currentLanguage = LANGUAGE_OPTIONS.find(lang => lang.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage.nativeName}
          </span>
          <span className="sm:hidden">
            {language.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGE_OPTIONS.map((langOption) => {
          const isActive = language === langOption.code;
          
          return (
            <DropdownMenuItem
              key={langOption.code}
              onClick={() => changeLanguage(langOption.code)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{langOption.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{langOption.name}</span>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}