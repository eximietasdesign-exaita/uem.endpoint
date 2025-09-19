export default function SettingsPage(){
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="rounded border bg-white p-4 space-y-3">
        <div className="text-sm text-gray-600">Environment</div>
        <ul className="text-xs text-gray-700 list-disc pl-5">
          <li>Satellite: {import.meta.env.VITE_SAT || 'https://localhost:7200'}</li>
          <li>Broker: {import.meta.env.VITE_BROKER || 'https://localhost:7201'}</li>
        </ul>
      </div>
    </div>
  )
}
