import React, { useEffect, useMemo, useState } from 'react';
import { sat } from '@/lib/satApi';
import { useSelection } from '@/state/useSelection';

type HeartbeatView = {
  agentId: string;
  uniqueId?: string;
  serialNumber?: string;
  hostname?: string;
  ipAddress?: string;
  macAddress?: string;
  agentVersion?: string;
  firstContacted?: string;
  lastContacted?: string;
  online?: boolean;
};

export default function EndpointTable() {
  const [rows, setRows] = useState<HeartbeatView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState<boolean>(() => {
    try { return localStorage.getItem('uem.autoRefresh') === '1'; } catch { return false; }
  });
  const [intervalMs, setIntervalMs] = useState<number>(() => 30000);
  const selection = useSelection();
  const [commandOutputs, setCommandOutputs] = useState<{[agentId: string]: string}>({});
  const [streaming, setStreaming] = useState<{[agentId: string]: boolean}>({});
  const [streamData, setStreamData] = useState<{[agentId: string]: string}>({});
  const [pinnedStreams, setPinnedStreams] = useState<{[agentId: string]: boolean}>({});

  const normalize = (data: any): HeartbeatView[] => {
    if (!data) return [];
    return Array.isArray(data) ? data as HeartbeatView[] : [data as HeartbeatView];
  };

  const refresh = async () => {
  try {
    setError(null);
    const hbResp = await sat.get('/api/agents/latest-heartbeats');
    const hb = normalize(hbResp.data);
    if (hb.length > 0) {
      setRows(hb);
      selection.set(hb.map(x => x.agentId));
      setLoading(false); // <-- Add this line
      return;
    }
  } catch (e: any) {
    console.error('Error fetching latest-heartbeats:', e);
  }
  try {
    const regResp = await sat.get('/api/agents');
    const reg = Array.isArray(regResp.data) ? regResp.data : [regResp.data];
    const mapped: HeartbeatView[] = reg.map((r: any) => ({
      agentId: r.agentId,
      uniqueId: r.uniqueId,
      serialNumber: r.serialNumber,
      hostname: r.hostname,
      ipAddress: r.ipAddress,
      macAddress: r.macAddress,
      agentVersion: r.agentVersion,
      firstContacted: r.registeredAtUtc ?? undefined,
      lastContacted: r.lastSeenUtc ?? undefined,
      online: r.online
    }));
    setRows(mapped);
    selection.set(mapped.map(x => x.agentId));
  } catch (e: any) {
    setError(e?.message ?? 'Failed to load agents');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { setLoading(true); refresh(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    let timer: number | undefined;
    const start = () => {
      if (auto && document.visibilityState === 'visible') {
        timer = window.setInterval(refresh, intervalMs);
      }
    };
    const stop = () => { if (timer) window.clearInterval(timer); timer = undefined; };
    start();
    const onVis = () => { stop(); start(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [auto, intervalMs]);

  const allSelected = useMemo(() => rows.length>0 && selection.selected.length === rows.length, [rows, selection.selected]);
  const someSelected = useMemo(() => selection.selected.length>0 && selection.selected.length < rows.length, [rows, selection.selected]);

  const toggleAll = () => { if (allSelected) selection.clear(); else selection.set(rows.map(r => r.agentId)); };

  const onToggleAuto = () => {
    const next = !auto; setAuto(next);
    try { localStorage.setItem('uem.autoRefresh', next ? '1' : '0'); } catch {}
  };

  // Function to execute command and fetch output
  const runCommand = async (agentId: string) => {
    setCommandOutputs(prev => ({ ...prev, [agentId]: 'Running command...' }));
    try {
      const resp = await sat.post(`/api/agents/${agentId}/run-command`, { command: 'YOUR_COMMAND_HERE' });
      setCommandOutputs(prev => ({ ...prev, [agentId]: resp.data.output ?? 'No output' }));
    } catch (e: any) {
      setCommandOutputs(prev => ({ ...prev, [agentId]: 'Error: ' + (e?.message ?? 'Failed to run command') }));
    }
  };

  // Toggle streaming for an agent
  const toggleStreaming = (agentId: string, enabled: boolean) => {
    setStreaming(prev => ({
      ...prev,
      [agentId]: enabled
    }));
    
    // Clear stream data when disabling
    if (!enabled) {
      setStreamData(prev => {
        const newData = { ...prev };
        delete newData[agentId];
        return newData;
      });
      // Also unpin when disabling streaming
      setPinnedStreams(prev => {
        const newPinned = { ...prev };
        delete newPinned[agentId];
        return newPinned;
      });
    }
  };

  // Toggle pin state for stream
  const toggleStreamPin = (agentId: string) => {
    setPinnedStreams(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  // Real-time stream polling logic
  useEffect(() => {
    const timers: {[agentId: string]: number} = {};
    
    Object.entries(streaming).forEach(([agentId, isOn]) => {
      if (isOn) {
        const fetchStream = async () => {
          try {
            const resp = await sat.get(`/api/agents/${agentId}/command-stream`);
            setStreamData(prev => ({ 
              ...prev, 
              [agentId]: resp.data.output ?? 'No stream data available' 
            }));
          } catch (e: any) {
            setStreamData(prev => ({ 
              ...prev, 
              [agentId]: 'Error fetching stream: ' + (e?.message ?? 'Unknown error')
            }));
          }
        };
        
        // Initial fetch
        fetchStream();
        // Set up polling
        timers[agentId] = window.setInterval(fetchStream, 3000);
      }
    });
    
    return () => {
      Object.values(timers).forEach(clearInterval);
    };
  }, [streaming]);

  if (loading) return <div className="p-4 text-sm text-gray-600">Loading endpoints…</div>;
  if (error) return <div className="p-4 text-sm text-red-600">Error: {error}</div>;

  return (
    <div className="rounded border overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="text-sm text-gray-700">Endpoints</div>
        <div className="flex items-center gap-2">
          <label className="text-sm flex items-center gap-1">
            <input type="checkbox" checked={auto} onChange={onToggleAuto} />
            Auto-refresh
          </label>
          <select className="text-sm border rounded px-1 py-0.5" value={intervalMs} onChange={e=>setIntervalMs(Number(e.target.value))} disabled={!auto}>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>60s</option>
          </select>
          <button className="text-sm px-2 py-1 border rounded" onClick={refresh}>Refresh now</button>
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th>
              <input type="checkbox"
                     aria-label="Select all"
                     checked={allSelected}
                     ref={(el)=>{ if(el) el.indeterminate = someSelected; }}
                     onChange={toggleAll} />
            </Th>
            <Th>Agent ID</Th>
            <Th>Hostname</Th>
            <Th>IP</Th>
            <Th>MAC</Th>
            <Th>Version</Th>
            <Th>First Contact</Th>
            <Th>Last Seen</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const selected = selection.selected.includes(r.agentId);
            const hasOutput = commandOutputs[r.agentId];
            const isStreaming = streaming[r.agentId];
            const hasStreamData = streamData[r.agentId];
            const isPinned = pinnedStreams[r.agentId];
            
            return (
              <React.Fragment key={r.agentId}>
                <tr className={`border-b hover:bg-gray-50 ${selected ? 'bg-blue-50' : ''}`}
                    onClick={() => selection.toggle(r.agentId)}>
                  <td className="px-3 py-2 text-sm">
                    <input type="checkbox"
                           checked={selected}
                           onChange={() => selection.toggle(r.agentId)}
                           onClick={(e)=> e.stopPropagation() } />
                  </td>
                  <Td mono>{r.agentId}</Td>
                  <Td>{r.hostname ?? '-'}</Td>
                  <Td>{r.ipAddress ?? '-'}</Td>
                  <Td>{formatMac(r.macAddress)}</Td>
                  <Td>{r.agentVersion ?? '-'}</Td>
                  <Td>{fmt(r.firstContacted ?? '-')}</Td>
                  <Td>{fmt(r.lastContacted ?? '-')}</Td>
                  <Td><Badge ok={r.online ?? isOnline(r.lastContacted ?? '')} /></Td>
                  <Td>
                    <div className="flex flex-col gap-2">
                      <button 
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                        onClick={e => { 
                          e.stopPropagation(); 
                          runCommand(r.agentId); 
                        }}
                      >
                        Run Command
                      </button>
                      <label className="text-xs flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!streaming[r.agentId]}
                          onChange={e => {
                            e.stopPropagation();
                            toggleStreaming(r.agentId, e.target.checked);
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                        Real-time Stream
                      </label>
                    </div>
                  </Td>
                </tr>
                
                {/* Output Row - Always visible when there's output or streaming is active or pinned */}
                {(hasOutput || isStreaming || isPinned) && (
                  <tr className="bg-gray-50">
                    <td colSpan={10} className="px-3 py-3 border-b">
                      <div className="space-y-3">
                        {/* Command Output Section */}
                        {hasOutput && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-700">
                                Command Output:
                              </span>
                              <button 
                                className="text-xs px-2 py-1 border rounded hover:bg-gray-200"
                                onClick={() => setCommandOutputs(prev => {
                                  const newOutputs = { ...prev };
                                  delete newOutputs[r.agentId];
                                  return newOutputs;
                                })}
                              >
                                Clear Output
                              </button>
                            </div>
                            <pre className="bg-white p-3 rounded text-xs max-h-40 overflow-auto border font-mono">
                              {commandOutputs[r.agentId]}
                            </pre>
                          </div>
                        )}
                        
                        {/* Real-time Stream Section */}
                        {(isStreaming || isPinned) && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                                Real-time Stream:
                                {isStreaming && (
                                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                )}
                                {isPinned && (
                                  <span className="text-yellow-600">📌</span>  // Pin icon when pinned
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                <button 
                                  className={`text-xs px-2 py-1 border rounded hover:bg-gray-200 ${isPinned ? 'bg-yellow-100 border-yellow-300' : ''}`}
                                  onClick={() => toggleStreamPin(r.agentId)}
                                  title={isPinned ? 'Unpin stream' : 'Pin stream'}
                                >
                                  {isPinned ? '📌 Unpin' : '📌 Pin'}  // Pin/Unpin button
                                </button>
                                <button 
                                  className="text-xs px-2 py-1 border rounded hover:bg-gray-200"
                                  onClick={() => {
                                    setStreamData(prev => {
                                      const newData = { ...prev };
                                      delete newData[r.agentId];
                                      return newData;
                                    });
                                  }}
                                >
                                  Clear Stream
                                </button>
                              </div>
                            </div>
                            <pre className="bg-black text-green-400 p-3 rounded text-xs max-h-40 overflow-auto border font-mono">
                              {hasStreamData || (isStreaming ? 'Waiting for stream data...' : 'Stream not active')}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: any){ return <th className="text-left px-3 py-2 text-sm font-semibold">{children}</th> }
function Td({ children, mono }: any){ return <td className={`px-3 py-2 text-sm ${mono?'font-mono':''}`}>{children}</td> }

function fmt(iso: string){ try { return new Date(iso).toLocaleString(); } catch { return iso; } }
function isOnline(iso: string){ if(!iso) return false; return Date.now() - new Date(iso).getTime() < 60_000; }
function formatMac(mac?: string){ if(!mac) return '-'; return mac.match(/.{1,2}/g)?.join(':').toUpperCase() }
function Badge({ok}: {ok?: boolean}){ return <span className={`px-2 py-0.5 text-xs rounded ${ok?'bg-green-500 text-white':'bg-gray-400 text-white'}`}>{ok?'ONLINE':'OFFLINE'}</span> }
