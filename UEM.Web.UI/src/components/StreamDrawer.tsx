import * as Dialog from '@radix-ui/react-dialog'
import { useCallback, useState } from 'react'
import { useSSE } from '@/lib/sse'

export default function StreamDrawer(){
  const [open, setOpen] = useState(true)
  const [lines, setLines] = useState<string[]>([])
  const onMsg = useCallback((json:any)=> setLines(prev => [JSON.stringify(json), ...prev].slice(0,400)), [])
  useSSE('/broker/api/stream/events', onMsg)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="fixed bottom-4 right-4 rounded-full shadow bg-blue-600 text-white p-3">Stream</button>
      </Dialog.Trigger>
      <Dialog.Overlay className="fixed inset-0 bg-black/20" />
      <Dialog.Content className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-xl p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <Dialog.Title className="font-semibold">Real-time Stream</Dialog.Title>
          <Dialog.Close className="text-sm text-gray-600 hover:underline">Close</Dialog.Close>
        </div>
        <div className="h-[calc(100%-40px)] overflow-auto rounded border bg-gray-50 p-3">
          <pre className="text-xs leading-5 whitespace-pre-wrap">{lines.join('\n')}</pre>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
