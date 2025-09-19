export default function StatusBadge({ online }:{ online?: boolean }){
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${online?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>
    <span className={`h-2 w-2 rounded-full ${online?'bg-green-500':'bg-gray-400'}`}></span>
    {online?'Online':'Offline'}
  </span>
}
