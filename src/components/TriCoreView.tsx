import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { OutputPanel } from '@/components/OutputPanel'
import { HistoryPanel } from '@/components/HistoryPanel'
import { HistoryDetailModal } from '@/components/HistoryDetailModal'
import { EngineSelect } from '@/components/EngineSelect'
import { SystemPromptEditor } from '@/components/SystemPromptEditor'
import { CORE_CONFIGS } from '@/lib/cores'
import { HistoryEntry, createHistoryEntry } from '@/lib/history'
import {
  AIEngine,
  CORE_ENGINES,
  ENGINE_CONFIGS,
  getEngineStorageKey,
} from '@/lib/engines'
import { getCachedResponse, cacheResponse } from '@/lib/cache'
import { streamLLM, type LLMResult } from '@/lib/llm'
import { logCost } from '@/lib/cost-tracking'
import { useKV, flushStorage } from '@/lib/storage'
import { exportEntryAsMarkdown, exportEntryAsJSON } from '@/lib/export'
import { toast } from 'sonner'
import { Atom, Square, Download } from 'lucide-react'

type Core = 'chadrak' | 'nova' | 'triad'
const CORES: Core[] = ['chadrak', 'nova', 'triad']
type CoreState = {
  content: string
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled'
  cached: boolean
  error?: string
  result?: LLMResult
}
const empty = (): Record<Core, CoreState> =>
  Object.fromEntries(
    CORES.map((id) => [id, { content: '', status: 'idle', cached: false }]),
  ) as Record<Core, CoreState>

export function TriCoreView({ onBack: _onBack }: { onBack: () => void }) {
  const [input, setInput] = useKV('tricore-input', '')
  const [chadrak, setChadrak] = useKV<AIEngine>(
    getEngineStorageKey('chadrak'),
    CORE_ENGINES.chadrak,
  )
  const [nova, setNova] = useKV<AIEngine>(
    getEngineStorageKey('nova'),
    CORE_ENGINES.nova,
  )
  const [triad, setTriad] = useKV<AIEngine>(
    getEngineStorageKey('triad'),
    CORE_ENGINES.triad,
  )
  const engines = { chadrak, nova, triad },
    setters = { chadrak: setChadrak, nova: setNova, triad: setTriad }
  const [chadrakPrompt, setChadrakPrompt] = useKV(
    'custom-prompt-chadrak',
    CORE_CONFIGS.chadrak.systemPrompt,
  )
  const [novaPrompt, setNovaPrompt] = useKV(
    'custom-prompt-nova',
    CORE_CONFIGS.nova.systemPrompt,
  )
  const [triadPrompt, setTriadPrompt] = useKV(
    'custom-prompt-triad',
    CORE_CONFIGS.triad.systemPrompt,
  )
  const prompts = {
    chadrak: chadrakPrompt,
    nova: novaPrompt,
    triad: triadPrompt,
  }
  const promptSetters = {
    chadrak: setChadrakPrompt,
    nova: setNovaPrompt,
    triad: setTriadPrompt,
  }
  const [states, setStates] = useState(empty)
  const [running, setRunning] = useState(false)
  const [reuseCache, setReuseCache] = useState(false)
  const [history, setHistory] = useKV<HistoryEntry[]>('history-tricore', [])
  const [entry, setEntry] = useState<HistoryEntry | null>(null)
  const [latest, setLatest] = useState<HistoryEntry | null>(null)
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  const update = (id: Core, value: Partial<CoreState>) =>
    setStates((old) => ({ ...old, [id]: { ...old[id], ...value } }))
  async function run() {
    if (controller.current || !input.trim()) return
    const abort = new AbortController()
    controller.current = abort
    const submitted = input.trim(),
      chosen = { ...engines },
      instructions = { ...prompts }
    setRunning(true)
    setStates(empty())
    setLatest(null)
    try {
      const outcomes = await Promise.all(
        CORES.map(async (id) => {
          update(id, { status: 'running' })
          const cacheKey = JSON.stringify({
            instructions: instructions[id],
            input: submitted,
          })
          try {
            let result: LLMResult | undefined
            const cached = reuseCache
              ? await getCachedResponse(cacheKey, chosen[id], id)
              : null
            const content =
              cached ||
              (await streamLLM(
                submitted,
                chosen[id],
                (text) => update(id, { content: text }),
                {
                  instructions: instructions[id],
                  signal: abort.signal,
                  onResult: (value) => {
                    result = value
                  },
                },
              ))
            if (abort.signal.aborted) throw new Error('Cancelled')
            update(id, {
              content,
              status: 'completed',
              cached: Boolean(cached),
              result,
            })
            if (!cached) {
              logCost(chosen[id], submitted, content, id)
              await cacheResponse(cacheKey, content, chosen[id], id)
            }
            return {
              id,
              content,
              status: 'completed' as const,
              cached: Boolean(cached),
              result,
            }
          } catch (error) {
            const message = abort.signal.aborted
              ? 'Cancelled by you.'
              : error instanceof Error
                ? error.message
                : 'Analysis failed.'
            update(id, {
              status: abort.signal.aborted ? 'cancelled' : 'failed',
              error: message,
            })
            return {
              id,
              content: '',
              status: abort.signal.aborted
                ? ('cancelled' as const)
                : ('failed' as const),
              error: message,
              cached: false,
            }
          }
        }),
      )
      const successes = outcomes.filter(
        (value) => value.status === 'completed',
      ).length
      const output = Object.fromEntries(
        outcomes.map((value) => [
          value.id,
          value.content ||
            `${value.status === 'cancelled' ? 'Cancelled' : 'Failed'}: ${value.error}`,
        ]),
      ) as Record<Core, string>
      const saved: HistoryEntry = {
        ...createHistoryEntry('tricore', submitted, output),
        engine: CORES.map((id) => `${id}: ${chosen[id]}`).join(' · '),
        status:
          successes === 3 ? 'completed' : successes ? 'partial' : 'failed',
        coreRuns: Object.fromEntries(
          outcomes.map((value) => [
            value.id,
            {
              model: chosen[value.id],
              status: value.status,
              cached: value.cached,
              responseId: value.result?.responseId,
              runId: value.result?.runId,
            },
          ]),
        ),
      }
      setHistory((old) => [saved, ...(old || [])].slice(0, 200))
      setLatest(saved)
      await flushStorage()
      if (successes === 3)
        toast.success('All three analyses completed and saved.')
      else
        toast.warning(
          `${successes} of 3 cores completed. Details are saved in history.`,
        )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save the run.',
      )
    } finally {
      controller.current = null
      setRunning(false)
    }
  }
  const completed = CORES.filter(
    (id) => states[id].status === 'completed',
  ).length
  return (
    <main className="tri-workspace">
      <header className="tri-heading">
        <div>
          <p className="tri-eyebrow">Combined core system</p>
          <h1>Tri-Core Analysis Engine</h1>
          <p className="text-muted-foreground">
            One input. Three independent perspectives.
          </p>
        </div>
        <span className="tri-run-count">
          {running ? `${completed}/3 complete` : 'Chadrak · Nova · Triad'}
        </span>
      </header>
      <div className="tri-layout">
        <div className="min-w-0 space-y-5">
          <section className="tri-console">
            <label htmlFor="tricore-input" className="tri-eyebrow text-primary">
              Command input
            </label>
            <Textarea
              id="tricore-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={running}
              maxLength={100000}
              placeholder="Describe a goal, problem, or idea for the three cores…"
              className="min-h-32 mt-3 text-base resize-y"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={run} disabled={running || !input.trim()}>
                  <Atom size={18} />
                  {running ? 'Analysis in progress…' : 'Run Tri-Core Analysis'}
                </Button>
                {running && (
                  <Button
                    variant="outline"
                    onClick={() => controller.current?.abort()}
                  >
                    <Square size={15} />
                    Cancel
                  </Button>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={reuseCache}
                  onChange={(e) => setReuseCache(e.target.checked)}
                  disabled={running}
                />
                Reuse exact cached answers
              </label>
            </div>
          </section>
          <div className="tri-core-grid">
            {CORES.map((id) => (
              <section
                key={id}
                className={`tri-core tri-core-${id}`}
                aria-label={`${CORE_CONFIGS[id].name} panel`}
              >
                <div className="tri-core-settings">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h2>{CORE_CONFIGS[id].name}</h2>
                    <SystemPromptEditor
                      coreId={id}
                      coreName={CORE_CONFIGS[id].name}
                      currentPrompt={prompts[id]}
                      defaultPrompt={CORE_CONFIGS[id].systemPrompt}
                      onSave={promptSetters[id]}
                      onReset={() =>
                        promptSetters[id](CORE_CONFIGS[id].systemPrompt)
                      }
                    />
                  </div>
                  <EngineSelect
                    value={engines[id]}
                    onValueChange={setters[id]}
                    disabled={running}
                  />
                  <p className="text-sm text-muted-foreground mt-3">
                    {id === 'chadrak'
                      ? 'Structure · logic · risks'
                      : id === 'nova'
                        ? 'Critique · narrative · clarity'
                        : 'Execution · dependencies · next steps'}
                  </p>
                </div>
                <div className="tri-core-output">
                  <OutputPanel
                    title={
                      states[id].status === 'idle'
                        ? 'Ready for input'
                        : states[id].status
                    }
                    content={states[id].content}
                    isLoading={states[id].status === 'running'}
                    usedCache={states[id].cached}
                  />
                  {states[id].error && (
                    <p
                      role="alert"
                      className="text-sm text-destructive p-4 border-t border-border"
                    >
                      {states[id].error}
                    </p>
                  )}
                  {states[id].result && (
                    <p className="tri-provenance">
                      {states[id].result!.provider} · {states[id].result!.model}
                      <br />
                      Response:{' '}
                      {states[id].result!.responseId ||
                        'No provider ID returned'}
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
          {latest && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => exportEntryAsMarkdown(latest)}
              >
                <Download size={16} />
                Export Markdown
              </Button>
              <Button
                variant="outline"
                onClick={() => exportEntryAsJSON(latest)}
              >
                Export JSON
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                Run status: {latest.status}
              </span>
            </div>
          )}
        </div>
        <aside className="tri-history">
          <HistoryPanel
            history={history || []}
            onSelectEntry={setEntry}
            onDeleteEntry={(id) =>
              setHistory((old) => old.filter((item) => item.id !== id))
            }
            onClearAll={() => setHistory([])}
          />
        </aside>
      </div>
      <HistoryDetailModal
        entry={entry}
        open={Boolean(entry)}
        onOpenChange={(open) => {
          if (!open) setEntry(null)
        }}
      />
    </main>
  )
}
