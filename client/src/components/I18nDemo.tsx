import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  useTranslation, 
  useLogging, 
  useDashboardTranslation,
  useCommonTranslation,
  translationValidator,
  SupportedLanguage,
  LOCALE_CONFIGS
} from "@/i18n";
import { LanguageSelector } from "./LanguageSelector";

export function I18nDemo() {
  const { t, language, formatDate, formatTime, formatNumber, formatCurrency, direction } = useTranslation();
  const { t: tDashboard } = useDashboardTranslation();
  const { t: tCommon } = useCommonTranslation();
  const { logInfo, logWarning, logError } = useLogging();
  const [logCount, setLogCount] = useState(0);

  const currentDate = new Date();
  const sampleNumber = 12345.67;
  const sampleCurrency = 99.99;

  const handleLogDemo = () => {
    const newCount = logCount + 1;
    setLogCount(newCount);
    
    logInfo('info_discovery_started', { jobName: `Demo Job ${newCount}` });
    logWarning('warning_high_cpu', { probeName: 'Demo Probe', usage: 85 });
    logError('error_discovery_failed', { jobName: `Demo Job ${newCount}`, error: 'Connection timeout' });
  };

  const validateTranslations = () => {
    // This would normally use the actual translations loaded in context
    // For demo purposes, we'll show the validation concept
    console.log('Translation validation would run here');
    logInfo('info_operation_completed', { operation: 'validation' });
  };

  const locale = LOCALE_CONFIGS[language];

  return (
    <div className={`space-y-6 ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('common.title', { title: 'Internationalization Demo' })}</CardTitle>
            <LanguageSelector />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Language Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{tCommon('language_info', { fallback: 'Language Information' })}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>{tCommon('current_language', { fallback: 'Current Language' })}:</strong> {locale.nativeName} ({locale.name})</p>
                <p><strong>{tCommon('region', { fallback: 'Region' })}:</strong> {locale.region}</p>
                <p><strong>{tCommon('direction', { fallback: 'Text Direction' })}:</strong> 
                  <Badge variant={direction === 'rtl' ? 'destructive' : 'default'} className="ml-2">
                    {direction.toUpperCase()}
                  </Badge>
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>{tCommon('date_format', { fallback: 'Date Format' })}:</strong> {locale.dateFormat}</p>
                <p><strong>{tCommon('time_format', { fallback: 'Time Format' })}:</strong> {locale.timeFormat}</p>
                <p><strong>{tCommon('currency', { fallback: 'Currency' })}:</strong> {locale.numberFormat.currency}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Namespace Demonstrations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{tCommon('namespace_demo', { fallback: 'Translation Namespaces' })}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">{tCommon('common_namespace', { fallback: 'Common' })}</h4>
                <div className="space-y-1 text-sm">
                  <p>{tCommon('save')}</p>
                  <p>{tCommon('cancel')}</p>
                  <p>{tCommon('loading')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">{tCommon('dashboard_namespace', { fallback: 'Dashboard' })}</h4>
                <div className="space-y-1 text-sm">
                  <p>{tDashboard('total_endpoints')}</p>
                  <p>{tDashboard('security_alerts')}</p>
                  <p>{tDashboard('system_status')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">{tCommon('navigation_namespace', { fallback: 'Navigation' })}</h4>
                <div className="space-y-1 text-sm">
                  <p>{t('navigation.dashboard')}</p>
                  <p>{t('navigation.assets')}</p>
                  <p>{t('navigation.settings')}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Formatting Demonstrations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{tCommon('formatting_demo', { fallback: 'Locale-Aware Formatting' })}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>{tCommon('date', { fallback: 'Date' })}:</strong> {formatDate(currentDate)}</p>
                <p><strong>{tCommon('time', { fallback: 'Time' })}:</strong> {formatTime(currentDate)}</p>
              </div>
              <div className="space-y-2">
                <p><strong>{tCommon('number', { fallback: 'Number' })}:</strong> {formatNumber(sampleNumber)}</p>
                <p><strong>{tCommon('currency', { fallback: 'Currency' })}:</strong> {formatCurrency(sampleCurrency)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Interpolation Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{tCommon('interpolation_demo', { fallback: 'Parameter Interpolation' })}</h3>
            <div className="space-y-2">
              <p>{t('logging.info_discovery_completed', { jobName: 'Sample Network Scan', discovered: 42 })}</p>
              <p>{t('logging.warning_high_cpu', { probeName: 'Main Campus Probe', usage: 87 })}</p>
              <p>{t('logging.info_agent_deployed', { hostname: 'DESKTOP-ABC123', ipAddress: '192.168.1.100' })}</p>
            </div>
          </div>

          <Separator />

          {/* Logging Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{tCommon('logging_demo', { fallback: 'Internationalized Logging' })}</h3>
            <div className="flex gap-2 mb-3">
              <Button onClick={handleLogDemo} size="sm">
                {tCommon('generate_log_messages', { fallback: 'Generate Log Messages' })}
              </Button>
              <Button onClick={validateTranslations} variant="outline" size="sm">
                {tCommon('validate_translations', { fallback: 'Validate Translations' })}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {tCommon('check_console', { fallback: 'Check browser console for internationalized log messages' })} ({logCount} {tCommon('messages_sent', { fallback: 'messages sent' })})
            </p>
          </div>

          <Separator />

          {/* Features Overview */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{tCommon('features_overview', { fallback: 'Framework Features' })}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ {tCommon('implemented', { fallback: 'Implemented' })}</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>{tCommon('feature_type_safety', { fallback: 'TypeScript type safety' })}</li>
                  <li>{tCommon('feature_namespaces', { fallback: 'Organized namespaces' })}</li>
                  <li>{tCommon('feature_interpolation', { fallback: 'Parameter interpolation' })}</li>
                  <li>{tCommon('feature_formatting', { fallback: 'Locale-aware formatting' })}</li>
                  <li>{tCommon('feature_rtl', { fallback: 'RTL support' })}</li>
                  <li>{tCommon('feature_logging', { fallback: 'Internationalized logging' })}</li>
                  <li>{tCommon('feature_validation', { fallback: 'Translation validation' })}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">⏳ {tCommon('in_progress', { fallback: 'In Progress' })}</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>{tCommon('feature_lazy_loading', { fallback: 'Lazy loading optimization' })}</li>
                  <li>{tCommon('feature_complete_translations', { fallback: 'Complete translations for all languages' })}</li>
                  <li>{tCommon('feature_pluralization', { fallback: 'Pluralization rules' })}</li>
                  <li>{tCommon('feature_integration', { fallback: 'Full app integration' })}</li>
                </ul>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}