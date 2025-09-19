import EndpointTable from '@/components/EndpointTable'
import CommandPanel from '@/components/CommandPanel'

export default function EndpointsPage(){
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Endpoints</h1>
      <EndpointTable />
      <CommandPanel />
    </div>
  )
}
