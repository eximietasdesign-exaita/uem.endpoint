import { useParams } from 'react-router-dom'
import StatusBadge from '@/components/StatusBadge'
export default function EndpointDetailsPage(){
  const { agentId } = useParams()
  return (<div className="space-y-3"><h1 className="text-xl font-semibold">Endpoint <span className="font-mono">{agentId}</span></h1><StatusBadge online /></div>)
}
