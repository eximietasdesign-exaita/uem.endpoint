import { useEffect, useState } from 'react';
import { Card, CardHeader, MetricCard } from '@/components/ui/Card';
import { EndpointStatusChart, ActivityChart } from '@/components/charts/EndpointChart';
import { LoadingState } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { sat } from '@/lib/satApi';
import { 
  ServerIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface DashboardMetrics {
  totalEndpoints: number;
  onlineEndpoints: number;
  offlineEndpoints: number;
  criticalAlerts: number;
  totalCommands: number;
  avgResponseTime: number;
  uptime: number;
  lastUpdated: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for charts - in production, this would come from your API
  const statusChartData = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString();
    const online = Math.floor(Math.random() * 50) + 80;
    const offline = Math.floor(Math.random() * 20) + 5;
    return {
      timestamp,
      online,
      offline,
      total: online + offline
    };
  });

  const activityChartData = Array.from({ length: 24 }, (_, i) => {
    const timestamp = new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString();
    return {
      timestamp,
      commands: Math.floor(Math.random() * 100) + 20,
      alerts: Math.floor(Math.random() * 30) + 5,
      connections: Math.floor(Math.random() * 50) + 10
    };
  });

  const fetchMetrics = async () => {
    try {
      setError(null);
      // Try to get real data from the API
      const response = await sat.get('/api/agents/latest-heartbeats');
      const agents = Array.isArray(response.data) ? response.data : [response.data];
      
      const online = agents.filter(a => a.online).length;
      const offline = agents.length - online;
      
      setMetrics({
        totalEndpoints: agents.length,
        onlineEndpoints: online,
        offlineEndpoints: offline,
        criticalAlerts: Math.floor(Math.random() * 10), // Mock data
        totalCommands: Math.floor(Math.random() * 1000) + 500, // Mock data
        avgResponseTime: Math.floor(Math.random() * 100) + 50, // Mock data
        uptime: 99.9, // Mock data
        lastUpdated: new Date().toISOString()
      });
    } catch (error: any) {
      // Fallback to mock data if API is not available
      console.warn('API not available, using mock data:', error?.message);
      setMetrics({
        totalEndpoints: 127,
        onlineEndpoints: 119,
        offlineEndpoints: 8,
        criticalAlerts: 3,
        totalCommands: 1247,
        avgResponseTime: 78,
        uptime: 99.9,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return <LoadingState message="Loading dashboard metrics..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
        <Button onClick={fetchMetrics}>Retry</Button>
      </div>
    );
  }

  const uptimePercentage = metrics?.uptime || 99.9;
  const responseTime = metrics?.avgResponseTime || 78;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your endpoint infrastructure in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Auto-refresh
            </label>
          </div>
          <Button onClick={fetchMetrics} variant="secondary" size="sm">
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Endpoints"
          value={metrics?.totalEndpoints || 0}
          change={{
            value: 2.1,
            type: 'increase'
          }}
          icon={<ServerIcon className="h-6 w-6" />}
        />
        <MetricCard
          title="Online Endpoints"
          value={metrics?.onlineEndpoints || 0}
          change={{
            value: 1.4,
            type: 'increase'
          }}
          icon={<ShieldCheckIcon className="h-6 w-6" />}
        />
        <MetricCard
          title="Critical Alerts"
          value={metrics?.criticalAlerts || 0}
          change={{
            value: 0.8,
            type: 'decrease'
          }}
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        />
        <MetricCard
          title="Commands Executed"
          value={metrics?.totalCommands || 0}
          change={{
            value: 12.3,
            type: 'increase'
          }}
          icon={<ChartBarIcon className="h-6 w-6" />}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{uptimePercentage}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${uptimePercentage}%` }}
                />
              </div>
            </div>
            <ClockIcon className="h-8 w-8 text-green-500 ml-4" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{responseTime}ms</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((200 - responseTime) / 200 * 100, 100)}%` }}
                />
              </div>
            </div>
            <CpuChipIcon className="h-8 w-8 text-blue-500 ml-4" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Health Score</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">94.2</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: '94.2%' }}
                />
              </div>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-purple-500 ml-4" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader
            title="Endpoint Status Over Time"
            subtitle="Last 24 hours"
          />
          <EndpointStatusChart data={statusChartData} />
        </Card>

        <Card>
          <CardHeader
            title="System Activity"
            subtitle="Commands, alerts, and connections"
          />
          <ActivityChart data={activityChartData} />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title="Recent Activity"
          subtitle="Latest endpoint events and system changes"
        />
        <div className="space-y-4">
          {[
            { 
              time: '2 minutes ago', 
              event: 'Endpoint DESKTOP-001 came online', 
              type: 'success',
              details: 'IP: 192.168.1.100'
            },
            { 
              time: '5 minutes ago', 
              event: 'Security scan completed on 15 endpoints', 
              type: 'info',
              details: 'No threats detected'
            },
            { 
              time: '12 minutes ago', 
              event: 'Critical alert: High CPU usage on SERVER-05', 
              type: 'warning',
              details: 'CPU usage: 89%'
            },
            { 
              time: '18 minutes ago', 
              event: 'Bulk command executed on 25 endpoints', 
              type: 'info',
              details: 'Windows Update installation'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                <p className="text-sm text-gray-500">{activity.details}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
