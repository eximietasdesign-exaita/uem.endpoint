import { Card, CardHeader } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingSpinner';

export default function AuditPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">System audit trails and activity monitoring</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader title="Activity Logs" subtitle="Coming soon" />
          <LoadingState message="Audit log features are being developed..." />
        </Card>
      </div>
    </div>
  );
}