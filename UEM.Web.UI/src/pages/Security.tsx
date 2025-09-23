import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingSpinner';

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-600 mt-1">Security monitoring and compliance management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader title="Security Monitoring" subtitle="Coming soon" />
          <LoadingState message="Security features are being developed..." />
        </Card>

        <Card>
          <CardHeader title="Compliance Status" subtitle="Coming soon" />
          <LoadingState message="Compliance features are being developed..." />
        </Card>
      </div>
    </div>
  );
}