import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConsoleCard } from '@/components/ConsoleCard'
import { generateFlowBrief, GOOGLE_FLOW_URL, type FlowBriefInput } from '@/lib/google-flow'
import { toast } from 'sonner'

export function GoogleFlowPanel({ input }: { input: FlowBriefInput }) {
  const [brief, setBrief] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  async function generate() {
    if (controller.current) return
    const request = new AbortController()
    controller.current = request
    setBusy(true)
    setError('')
    setBrief('')
    const timeout = setTimeout(() => request.abort(), 120_000)
    try {
      const host = window.location.hostname
      const apiBase = import.meta.env.VITE_API_URL ||
        (['localhost', '127.0.0.1'].includes(host) ? `http://${host}:3001` : '')
      const result = await generateFlowBrief(input, apiBase, request.signal)
      if (!request.signal.aborted) setBrief(result)
    } catch (err) {
      setError(request.signal.aborted ? 'Request stopped. You can try again.' :
        err instanceof Error ? err.message : 'Unable to prepare the Flow brief.')
    } finally {
      clearTimeout(timeout)
      controller.current = null
      setBusy(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(brief)
      toast.success('Flow brief copied. Paste a scene prompt into Flow.')
    } catch {
      toast.error('Copy failed. Select and copy the brief below manually.')
    }
  }

  return (
    <ConsoleCard glass className="p-4 md:p-5 space-y-3">
      <h2 className="font-semibold">Google Flow · OpenAI anchor</h2>
      <p className="text-sm text-muted-foreground">
        Use the video idea and settings above. Chadrak prepares a scene-by-scene brief
        with OpenAI. Review it, copy a scene prompt into Flow, then generate and edit there.
      </p>
      <p className="text-xs text-muted-foreground">
        Manual handoff · Flow projects and videos are not synced to TKS.
        This action sends your brief inputs to OpenAI through the TKS server.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={generate} disabled={busy || !input.description.trim()}>
          {busy ? 'Preparing with OpenAI…' : 'Prepare Flow brief with OpenAI'}
        </Button>
        {busy && <Button variant="outline" onClick={() => controller.current?.abort()}>Cancel</Button>}
        <Button asChild variant="outline">
          <a href={GOOGLE_FLOW_URL} target="_blank" rel="noopener noreferrer">Open Google Flow</a>
        </Button>
        {brief && <Button variant="outline" onClick={copy}>Copy Flow brief</Button>}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {brief && <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Prepared by OpenAI · awaiting your review and manual handoff</p>
        <pre className="whitespace-pre-wrap break-words text-sm font-sans max-h-[500px] overflow-y-auto">{brief}</pre>
      </div>}
    </ConsoleCard>
  )
}
