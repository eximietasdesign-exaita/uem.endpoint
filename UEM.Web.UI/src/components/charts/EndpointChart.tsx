import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface EndpointChartProps {
  data: Array<{
    timestamp: string;
    online: number;
    offline: number;
    total: number;
  }>;
}

export function EndpointStatusChart({ data }: EndpointChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleString()}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="online" 
            stackId="1" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.8}
            name="Online"
          />
          <Area 
            type="monotone" 
            dataKey="offline" 
            stackId="1" 
            stroke="#ef4444" 
            fill="#ef4444" 
            fillOpacity={0.8}
            name="Offline"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ActivityChartProps {
  data: Array<{
    timestamp: string;
    commands: number;
    alerts: number;
    connections: number;
  }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleString()}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="commands" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Commands Executed"
          />
          <Line 
            type="monotone" 
            dataKey="alerts" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="Alerts Generated"
          />
          <Line 
            type="monotone" 
            dataKey="connections" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            name="New Connections"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}