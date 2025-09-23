import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSimpleI18n } from "@/i18n/SimpleI18n";
import { SimpleLanguageSelector } from "@/components/SimpleLanguageSelector";

export default function SimpleI18nDemoPage() {
  const { language, changeLanguage, t } = useSimpleI18n();
  const [demoCount, setDemoCount] = useState(0);

  const currentDate = new Date();
  const sampleNumber = 12345.67;

  const handleDemo = () => {
    setDemoCount(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Internationalization Demo</CardTitle>
            <SimpleLanguageSelector />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Language Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Current Language Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>Language Code:</strong> <Badge>{language}</Badge></p>
                <p><strong>Demo Counter:</strong> {demoCount}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Translation Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Translation Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Common Actions</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Save:</strong> {t('common.save')}</p>
                  <p><strong>Cancel:</strong> {t('common.cancel')}</p>
                  <p><strong>Loading:</strong> {t('common.loading')}</p>
                  <p><strong>Delete:</strong> {t('common.delete')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Dashboard</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Title:</strong> {t('dashboard.title')}</p>
                  <p><strong>Total Endpoints:</strong> {t('dashboard.total_endpoints')}</p>
                  <p><strong>Security Alerts:</strong> {t('dashboard.security_alerts')}</p>
                  <p><strong>System Status:</strong> {t('dashboard.system_status')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Navigation</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Dashboard:</strong> {t('navigation.dashboard')}</p>
                  <p><strong>Assets:</strong> {t('navigation.assets')}</p>
                  <p><strong>Discovery:</strong> {t('navigation.discovery')}</p>
                  <p><strong>Settings:</strong> {t('navigation.settings')}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parameter Interpolation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Parameter Interpolation</h3>
            <div className="space-y-2">
              <p>{t('logging.info_discovery_completed', { jobName: 'Sample Network Scan', discovered: 42 })}</p>
              <p>{t('logging.warning_high_cpu', { probeName: 'Main Campus Probe', usage: 87 })}</p>
              <p>{t('logging.info_agent_deployed', { hostname: 'DESKTOP-ABC123', ipAddress: '192.168.1.100' })}</p>
            </div>
          </div>

          <Separator />

          {/* Interactive Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Interactive Demo</h3>
            <div className="flex gap-2 mb-3">
              <Button onClick={handleDemo}>
                {t('common.add')} Demo Count
              </Button>
              <Button onClick={() => setDemoCount(0)} variant="outline">
                {t('common.reset')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Demo button clicked {demoCount} times. Current language: <Badge variant="outline">{language}</Badge>
            </p>
          </div>

          <Separator />

          {/* Language Quick Switch */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Language Switch</h3>
            <div className="flex flex-wrap gap-2">
              {(['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'] as const).map((lang) => (
                <Button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  variant={language === lang ? 'default' : 'outline'}
                  size="sm"
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Features Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Framework Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Working</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Static translation loading</li>
                  <li>Language switching</li>
                  <li>Parameter interpolation</li>
                  <li>Fallback to English</li>
                  <li>Local storage persistence</li>
                  <li>Multi-language support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">📋 Available Languages</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>English (en) - Complete</li>
                  <li>Spanish (es) - Basic</li>
                  <li>French (fr) - Basic</li>
                  <li>German (de) - Basic</li>
                  <li>Chinese (zh) - Basic</li>
                  <li>Japanese (ja) - Basic</li>
                  <li>Arabic (ar) - Basic</li>
                </ul>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}