import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import DashboardPage from '@/pages/Dashboard';
import EndpointsPage from '@/pages/Endpoints';
import EndpointDetailsPage from '@/pages/EndpointDetails';
import SettingsPage from '@/pages/Settings';
import AnalyticsPage from '@/pages/Analytics';
import SecurityPage from '@/pages/Security';
import AuditPage from '@/pages/AuditLogs';
import StreamDrawer from '@/components/StreamDrawer';

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/endpoints" element={<EndpointsPage />} />
          <Route path="/endpoints/:agentId" element={<EndpointDetailsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <StreamDrawer />
      </Layout>
      <Toaster position="top-right" />
    </>
  );
}
