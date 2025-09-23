import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingSpinner';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Detailed analytics and reporting for your endpoint infrastructure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader title="Performance Analytics" subtitle="Coming soon" />
          <LoadingState message="Analytics features are being developed..." />
        </Card>

        <Card>
          <CardHeader title="Usage Reports" subtitle="Coming soon" />
          <LoadingState message="Reporting features are being developed..." />
        </Card>
      </div>
    </div>
  );
}