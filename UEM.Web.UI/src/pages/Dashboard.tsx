import EndpointTable from '@/components/EndpointTable'
import CommandPanel from '@/components/CommandPanel'

export default function DashboardPage(){
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <EndpointTable />
      <CommandPanel />
    </div>
  )
}
