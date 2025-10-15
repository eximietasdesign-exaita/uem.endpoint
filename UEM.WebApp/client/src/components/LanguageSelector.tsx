import React from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation, LOCALE_CONFIGS, SupportedLanguage } from "@/i18n";

export function LanguageSelector() {
  const { language, changeLanguage, isLoading } = useTranslation();

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    changeLanguage(newLanguage);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={isLoading}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {LOCALE_CONFIGS[language].nativeName}
          </span>
          <span className="sm:hidden">
            {language.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {Object.entries(LOCALE_CONFIGS).map(([langCode, config]) => {
          const isActive = language === langCode;
          const isRTL = config.direction === 'rtl';
          
          return (
            <DropdownMenuItem
              key={langCode}
              onClick={() => handleLanguageChange(langCode as SupportedLanguage)}
              className={`cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
              disabled={isLoading}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`text-sm font-medium ${isRTL ? 'text-right' : ''}`}>
                    {config.nativeName}
                  </div>
                  <div className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
                    {config.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.direction === 'rtl' && (
                    <Badge variant="secondary" className="text-xs">
                      RTL
                    </Badge>
                  )}
                  {isActive && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}