import { useState } from 'react'
import { broker } from '@/lib/api'
import { useSelection } from '@/state/useSelection'

type CommandOutput = {
  agentId: string
  command: string
  output: string
  timestamp: Date
  status: 'running' | 'success' | 'error'
}

export default function CommandPanel(){
  const [cmd, setCmd] = useState(' -a')
  const [busy, setBusy] = useState(false)
  const [outputs, setOutputs] = useState<CommandOutput[]>([])
  const selection = useSelection()

  const run = async () => {
    if (!cmd.trim() || selection.selected.length === 0) return
    setBusy(true)
    
    // Add running entries for each selected agent
    const runningOutputs: CommandOutput[] = selection.selected.map(agentId => ({
      agentId,
      command: cmd.trim(),
      output: 'Running command...',
      timestamp: new Date(),
      status: 'running' as const
    }))
    
    setOutputs(prev => [...runningOutputs, ...prev])
    
    try {
      // Execute commands for each agent
      for (let i = 0; i < selection.selected.length; i++) {
        const agentId = selection.selected[i]
        try {
          const response = await broker.post('/api/commands', { 
            agentId, 
            type: 'run-shell', 
            payload: { command: cmd } 
          })
          
          // Update the output for this agent
          setOutputs(prev => prev.map(output => 
            output.agentId === agentId && output.timestamp === runningOutputs[i].timestamp
              ? {
                  ...output,
                  output: response.data?.output || 'Command executed successfully',
                  status: 'success' as const
                }
              : output
          ))
        } catch (error: any) {
          // Update with error for this agent
          setOutputs(prev => prev.map(output => 
            output.agentId === agentId && output.timestamp === runningOutputs[i].timestamp
              ? {
                  ...output,
                  output: `Error: ${error?.message || 'Failed to execute command'}`,
                  status: 'error' as const
                }
              : output
          ))
        }
      }
    } finally { 
      setBusy(false) 
    }
  }

  const clearOutputs = () => {
    setOutputs([])
  }

  const clearOutput = (agentId: string, timestamp: Date) => {
    setOutputs(prev => prev.filter(output => 
      !(output.agentId === agentId && output.timestamp === timestamp)
    ))
  }

  return (
    <div className="rounded border bg-white p-4 space-y-4">
      <div className="text-sm text-gray-600">Command Console</div>
      
      {/* Command Input Section */}
      <div className="space-y-3">
        <textarea 
          className="w-full border rounded p-2 h-28" 
          value={cmd} 
          onChange={e=>setCmd(e.target.value)}
          placeholder="Enter command to execute..."
        />
        <div className="flex items-center gap-2">
          <button 
            onClick={run} 
            disabled={busy || selection.selected.length===0 || !cmd.trim()}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50" 
            title={selection.selected.length===0?'Select at least one agent':(!cmd.trim()?'Enter a command':'')}
          >
            {busy ? 'Running...' : `Run on ${selection.selected.length}`}
          </button>
          <button 
            onClick={()=>setCmd('')} 
            className="text-sm text-gray-600 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Command Outputs Section */}
      {outputs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-700">Command Outputs</div>
            <button 
              onClick={clearOutputs}
              className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {outputs.map((output, index) => (
              <div key={`${output.agentId}-${output.timestamp.getTime()}`} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Agent: {output.agentId}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      output.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      output.status === 'success' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {output.status === 'running' && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></span>
                      )}
                      {output.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {output.timestamp.toLocaleTimeString()}
                    </span>
                    <button 
                      onClick={() => clearOutput(output.agentId, output.timestamp)}
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  <span className="font-mono bg-gray-100 px-1 rounded">
                    {output.command}
                  </span>
                </div>
                
                <pre className={`text-xs p-3 rounded max-h-32 overflow-auto font-mono ${
                  output.status === 'error' ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-800'
                }`}>
                  {output.output}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
