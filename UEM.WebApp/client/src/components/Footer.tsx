import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useInternetConnectivity } from '@/hooks/useInternetConnectivity';
import { useSimpleI18n } from '@/i18n/SimpleI18n';

export function Footer() {
  const { t } = useSimpleI18n();
  const { isOnline, status, latency, lastChecked, refresh } = useInternetConnectivity();

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: Wifi,
          label: 'Online',
          badgeVariant: 'default' as const,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          label: 'Degraded',
          badgeVariant: 'secondary' as const,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        };
      case 'checking':
        return {
          icon: RefreshCw,
          label: 'Checking',
          badgeVariant: 'outline' as const,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
      case 'offline':
      default:
        return {
          icon: WifiOff,
          label: 'Offline',
          badgeVariant: 'destructive' as const,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  const formatLastChecked = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastChecked.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastChecked.toLocaleTimeString();
  };

  const getLatencyText = () => {
    if (!latency) return null;
    if (latency < 100) return 'Excellent';
    if (latency < 300) return 'Good';
    if (latency < 1000) return 'Fair';
    return 'Poor';
  };

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        
        {/* Left side - Company info */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Enterprise Endpoint Management</span>
          <span className="text-gray-400 dark:text-gray-500">|</span>
          <span>v2.1.0</span>
          <span className="text-gray-400 dark:text-gray-500">|</span>
          <span>© 2025 Enterprise Solutions</span>
        </div>

        {/* Right side - System Status */}
        <div className="flex items-center space-x-4">
          
          {/* Current Time */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleTimeString()}
          </div>

          <div className="text-gray-400 dark:text-gray-500">|</div>

          {/* Internet Connectivity Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={statusConfig.badgeVariant}
                  className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}
                >
                  <Icon className={`h-3 w-3 mr-1 ${status === 'checking' ? 'animate-spin' : ''}`} />
                  {statusConfig.label}
                </Badge>
                
                {latency && status === 'online' && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {latency}ms
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-medium">Network Status</div>
                <div className="text-sm space-y-1">
                  <div>Status: <span className={statusConfig.color}>{statusConfig.label}</span></div>
                  <div>Last checked: {formatLastChecked()}</div>
                  {latency && (
                    <>
                      <div>Latency: {latency}ms ({getLatencyText()})</div>
                    </>
                  )}
                  <div>Browser online: {navigator.onLine ? 'Yes' : 'No'}</div>
                </div>
                <div className="pt-1 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={refresh}
                    className="h-6 px-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>

          <div className="text-gray-400 dark:text-gray-500">|</div>

          {/* System Health */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              System Healthy
            </Badge>
          </div>

        </div>
      </div>
    </footer>
  );
}