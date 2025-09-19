import { Route, Routes, NavLink } from 'react-router-dom'
import DashboardPage from '@/pages/Dashboard'
import EndpointsPage from '@/pages/Endpoints'
import EndpointDetailsPage from '@/pages/EndpointDetails'
import SettingsPage from '@/pages/Settings'
import StreamDrawer from '@/components/StreamDrawer'

const NavItem = ({ to, label }:{ to:string; label:string }) => (
  <NavLink to={to} className={({isActive}) =>
    `px-3 py-2 rounded ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>{label}</NavLink>
)

export default function App(){
  return (
    <div>
      <header className="h-12 border-b flex items-center gap-3 px-3">
        <strong>UEM Console</strong>
        <nav className="flex gap-2">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/endpoints" label="Endpoints" />
          <NavItem to="/settings" label="Settings" />
        </nav>
      </header>
      <main className="p-3">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/endpoints" element={<EndpointsPage />} />
          <Route path="/endpoints/:agentId" element={<EndpointDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <StreamDrawer />
    </div>
  )
}
