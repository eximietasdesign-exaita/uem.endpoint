import { useEffect } from 'react'
// lib/sse.ts
export function useSSE(url: string, onMessage: (data: any) => void){
  useEffect(()=>{
    console.debug(`[SSE] connect ${url}`)
    const es = new EventSource(url)
    es.onmessage = (e) => { try { onMessage(JSON.parse(e.data)) } catch (err) { console.error('[SSE] parse', err) } }
    es.onerror = (e) => { console.error('[SSE] error', e) }
    return () => { console.debug('[SSE] close'); es.close() }
  }, [url, onMessage])
}
