import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { OutputPanel } from '@/components/OutputPanel'
import { HistoryPanel } from '@/components/HistoryPanel'
import { HistoryDetailModal } from '@/components/HistoryDetailModal'
import { EngineSelect } from '@/components/EngineSelect'
import { SystemPromptEditor } from '@/components/SystemPromptEditor'
import { ConsoleCard } from '@/components/ConsoleCard'
import { CORE_CONFIGS } from '@/lib/cores'
import { HistoryEntry, createHistoryEntry } from '@/lib/history'
import { AIEngine, DEFAULT_ENGINE, getEngineStorageKey } from '@/lib/engines'
import { getCachedResponse, cacheResponse } from '@/lib/cache'
import { callLLM, streamLLM } from '@/lib/llm'
import { categorizeError } from '@/lib/retry'
import { logCost } from '@/lib/cost-tracking'
import { ArrowLeft, Atom, Database } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface TriCoreViewProps {
  onBack: () => void
}

interface CoreResults {
  chadrak: string
  nova: string
  triad: string
}

interface CacheStatus {
  chadrak: boolean
  nova: boolean
  triad: boolean
}

interface LoadingStatus {
  chadrak: boolean
  nova: boolean
  triad: boolean
}

export function TriCoreView({ onBack }: TriCoreViewProps) {
  const [input, setInput] = useKV('tricore-input', '')
  const [results, setResults] = useState<CoreResults>({
    chadrak: '',
    nova: '',
    triad: ''
  })
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    chadrak: false,
    nova: false,
    triad: false
  })
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
    chadrak: false,
    nova: false,
    triad: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [chadrakEngine, setChadrakEngine] = useKV<AIEngine>(getEngineStorageKey('chadrak'), DEFAULT_ENGINE)
  const [novaEngine, setNovaEngine] = useKV<AIEngine>(getEngineStorageKey('nova'), DEFAULT_ENGINE)
  const [triadEngine, setTriadEngine] = useKV<AIEngine>(getEngineStorageKey('triad'), DEFAULT_ENGINE)
  const [chadrakPrompt, setChadrakPrompt] = useKV<string>('custom-prompt-chadrak', CORE_CONFIGS.chadrak.systemPrompt)
  const [novaPrompt, setNovaPrompt] = useKV<string>('custom-prompt-nova', CORE_CONFIGS.nova.systemPrompt)
  const [triadPrompt, setTriadPrompt] = useKV<string>('custom-prompt-triad', CORE_CONFIGS.triad.systemPrompt)
  const [history, setHistory] = useKV<HistoryEntry[]>('history-tricore', [])
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)
  const [showHistoryDetail, setShowHistoryDetail] = useState(false)

  const handleRunTriCore = async () => {
    if (!input || !input.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    setIsLoading(true)
    setResults({ chadrak: '', nova: '', triad: '' })
    setCacheStatus({ chadrak: false, nova: false, triad: false })
    setLoadingStatus({ chadrak: true, nova: true, triad: true })

    const chadrakSysPrompt = chadrakPrompt || CORE_CONFIGS.chadrak.systemPrompt
    const novaSysPrompt = novaPrompt || CORE_CONFIGS.nova.systemPrompt
    const triadSysPrompt = triadPrompt || CORE_CONFIGS.triad.systemPrompt

    const chadrakPromptText = `${chadrakSysPrompt}

User input:
${input}`

    const novaPromptText = `${novaSysPrompt}

User input:
${input}`

    const triadPromptText = `${triadSysPrompt}

User input:
${input}`

    // Process each core independently with parallel execution
    const processChadrak = async () => {
      try {
        const cachedResult = await getCachedResponse(chadrakPromptText, chadrakEngine || DEFAULT_ENGINE, 'chadrak')
        
        if (cachedResult) {
          setResults(prev => ({ ...prev, chadrak: cachedResult }))
          setCacheStatus(prev => ({ ...prev, chadrak: true }))
          setLoadingStatus(prev => ({ ...prev, chadrak: false }))
          return cachedResult
        } else {
          const result = await streamLLM(
            chadrakPromptText, 
            chadrakEngine || DEFAULT_ENGINE,
            (chunk) => {
              setResults(prev => ({ ...prev, chadrak: chunk }))
            }
          )
          logCost(chadrakEngine || DEFAULT_ENGINE, chadrakPromptText, result, 'chadrak')
          setLoadingStatus(prev => ({ ...prev, chadrak: false }))
          await cacheResponse(chadrakPromptText, result, chadrakEngine || DEFAULT_ENGINE, 'chadrak')
          return result
        }
      } catch (error) {
        console.error('Chadrak error:', error)
        const cachedFallback = await getCachedResponse(chadrakPromptText, chadrakEngine || DEFAULT_ENGINE, 'chadrak')
        if (cachedFallback) {
          setResults(prev => ({ ...prev, chadrak: cachedFallback }))
          setCacheStatus(prev => ({ ...prev, chadrak: true }))
        } else {
          const errorInfo = categorizeError(error instanceof Error ? error : new Error(String(error)))
          setResults(prev => ({ ...prev, chadrak: `⚠️ Analysis failed: ${errorInfo.message}` }))
        }
        setLoadingStatus(prev => ({ ...prev, chadrak: false }))
        return cachedFallback || ''
      }
    }

    const processNova = async () => {
      try {
        const cachedResult = await getCachedResponse(novaPromptText, novaEngine || DEFAULT_ENGINE, 'nova')
        
        if (cachedResult) {
          setResults(prev => ({ ...prev, nova: cachedResult }))
          setCacheStatus(prev => ({ ...prev, nova: true }))
          setLoadingStatus(prev => ({ ...prev, nova: false }))
          return cachedResult
        } else {
          const result = await streamLLM(
            novaPromptText, 
            novaEngine || DEFAULT_ENGINE,
            (chunk) => {
              setResults(prev => ({ ...prev, nova: chunk }))
            }
          )
          logCost(novaEngine || DEFAULT_ENGINE, novaPromptText, result, 'nova')
          setLoadingStatus(prev => ({ ...prev, nova: false }))
          await cacheResponse(novaPromptText, result, novaEngine || DEFAULT_ENGINE, 'nova')
          return result
        }
      } catch (error) {
        console.error('Nova error:', error)
        const cachedFallback = await getCachedResponse(novaPromptText, novaEngine || DEFAULT_ENGINE, 'nova')
        if (cachedFallback) {
          setResults(prev => ({ ...prev, nova: cachedFallback }))
          setCacheStatus(prev => ({ ...prev, nova: true }))
        } else {
          const errorInfo = categorizeError(error instanceof Error ? error : new Error(String(error)))
          setResults(prev => ({ ...prev, nova: `⚠️ Analysis failed: ${errorInfo.message}` }))
        }
        setLoadingStatus(prev => ({ ...prev, nova: false }))
        return cachedFallback || ''
      }
    }

    const processTriad = async () => {
      try {
        const cachedResult = await getCachedResponse(triadPromptText, triadEngine || DEFAULT_ENGINE, 'triad')
        
        if (cachedResult) {
          setResults(prev => ({ ...prev, triad: cachedResult }))
          setCacheStatus(prev => ({ ...prev, triad: true }))
          setLoadingStatus(prev => ({ ...prev, triad: false }))
          return cachedResult
        } else {
          const result = await streamLLM(
            triadPromptText, 
            triadEngine || DEFAULT_ENGINE,
            (chunk) => {
              setResults(prev => ({ ...prev, triad: chunk }))
            }
          )
          logCost(triadEngine || DEFAULT_ENGINE, triadPromptText, result, 'triad')
          setLoadingStatus(prev => ({ ...prev, triad: false }))
          await cacheResponse(triadPromptText, result, triadEngine || DEFAULT_ENGINE, 'triad')
          return result
        }
      } catch (error) {
        console.error('Triad error:', error)
        const cachedFallback = await getCachedResponse(triadPromptText, triadEngine || DEFAULT_ENGINE, 'triad')
        if (cachedFallback) {
          setResults(prev => ({ ...prev, triad: cachedFallback }))
          setCacheStatus(prev => ({ ...prev, triad: true }))
        } else {
          const errorInfo = categorizeError(error instanceof Error ? error : new Error(String(error)))
          setResults(prev => ({ ...prev, triad: `⚠️ Analysis failed: ${errorInfo.message}` }))
        }
        setLoadingStatus(prev => ({ ...prev, triad: false }))
        return cachedFallback || ''
      }
    }

    // Execute all three cores in parallel
    const [chadrakResult, novaResult, triadResult] = await Promise.all([
      processChadrak(),
      processNova(),
      processTriad()
    ])

    // Count cached responses for notification
    const cachedCount = [
      cacheStatus.chadrak,
      cacheStatus.nova,
      cacheStatus.triad
    ].filter(Boolean).length

    if (cachedCount > 0) {
      toast.success(`${cachedCount} response${cachedCount > 1 ? 's' : ''} loaded from cache`, {
        icon: <Database size={16} weight="bold" />
      })
    }

    // Check for any errors in results
    const hasErrors = [chadrakResult, novaResult, triadResult].some(r => r.startsWith('⚠️'))
    if (hasErrors) {
      toast.warning('Some cores completed with errors', {
        description: 'Check outputs for details. Retry logic was applied automatically.',
        duration: 6000
      })
    }

    // Save to history with all results
    const finalResults = {
      chadrak: chadrakResult,
      nova: novaResult,
      triad: triadResult
    }

    const newEntry = createHistoryEntry('tricore', input, finalResults)
    setHistory((currentHistory) => [newEntry, ...(currentHistory || [])])

    setIsLoading(false)
  }

  const handleSelectHistoryEntry = (entry: HistoryEntry) => {
    setSelectedEntry(entry)
    setShowHistoryDetail(true)
  }

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory((currentHistory) => (currentHistory || []).filter((entry) => entry.id !== id))
    toast.success('History entry deleted')
  }

  const handleClearHistory = () => {
    setHistory([])
    toast.success('History cleared')
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="border-b border-border/30 console-gradient">
        <div className="max-w-[1400px] mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full" />
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-0.5">
                Combined Core System
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Tri-Core Analysis Engine</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            Execute parallel analysis across all three reasoning cores simultaneously
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ConsoleCard glass className="p-4" glow="primary">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <label htmlFor="tricore-input" className="block text-xs font-semibold uppercase tracking-wider text-primary">
                      Command Input Console
                    </label>
                  </div>
                  <Textarea
                    id="tricore-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your text, idea, or document for multi-core analysis..."
                    className="min-h-24 resize-none bg-background/50 border-border/50 focus:border-primary/50 text-sm leading-relaxed"
                  />
                  <Button
                    onClick={handleRunTriCore}
                    disabled={isLoading || !input || !input.trim()}
                    className="w-full md:w-auto glow-primary"
                  >
                    {isLoading ? (
                      <>
                        <Atom className="mr-2 animate-spin" size={18} weight="duotone" />
                        Processing All Cores...
                      </>
                    ) : (
                      <>
                        <Atom className="mr-2" size={18} weight="duotone" />
                        Run Tri-Core Analysis
                      </>
                    )}
                  </Button>
                </div>
              </ConsoleCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            >
              <div className="space-y-3 min-w-0">
                <ConsoleCard className="p-4 border-[var(--chadrak-accent)]/30" glow="chadrak">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--chadrak-accent)' }} />
                      <span className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--chadrak-accent)' }}>
                        Chadrak
                      </span>
                    </div>
                    <SystemPromptEditor
                      coreId="chadrak"
                      coreName="Chadrak Core"
                      currentPrompt={chadrakPrompt || CORE_CONFIGS.chadrak.systemPrompt}
                      defaultPrompt={CORE_CONFIGS.chadrak.systemPrompt}
                      onSave={setChadrakPrompt}
                      onReset={() => setChadrakPrompt(CORE_CONFIGS.chadrak.systemPrompt)}
                    />
                  </div>
                  <EngineSelect 
                    value={chadrakEngine || DEFAULT_ENGINE}
                    onValueChange={setChadrakEngine}
                  />
                </ConsoleCard>
                <div className="h-[450px]">
                  <OutputPanel
                    title="Structural Analysis"
                    content={results.chadrak}
                    isLoading={loadingStatus.chadrak}
                    badge="Chadrak"
                    usedCache={cacheStatus.chadrak}
                  />
                </div>
              </div>
              
              <div className="space-y-3 min-w-0">
                <ConsoleCard className="p-4 border-[var(--nova-accent)]/30" glow="nova">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--nova-accent)' }} />
                      <span className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--nova-accent)' }}>
                        Nova
                      </span>
                    </div>
                    <SystemPromptEditor
                      coreId="nova"
                      coreName="Nova Core"
                      currentPrompt={novaPrompt || CORE_CONFIGS.nova.systemPrompt}
                      defaultPrompt={CORE_CONFIGS.nova.systemPrompt}
                      onSave={setNovaPrompt}
                      onReset={() => setNovaPrompt(CORE_CONFIGS.nova.systemPrompt)}
                    />
                  </div>
                  <EngineSelect 
                    value={novaEngine || DEFAULT_ENGINE}
                    onValueChange={setNovaEngine}
                  />
                </ConsoleCard>
                <div className="h-[450px]">
                  <OutputPanel
                    title="Narrative Enhancement"
                    content={results.nova}
                    isLoading={loadingStatus.nova}
                    badge="Nova"
                    usedCache={cacheStatus.nova}
                  />
                </div>
              </div>
              
              <div className="space-y-3 min-w-0">
                <ConsoleCard className="p-4 border-[var(--triad-accent)]/30" glow="triad">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--triad-accent)' }} />
                      <span className="text-xs font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--triad-accent)' }}>
                        Triad
                      </span>
                    </div>
                    <SystemPromptEditor
                      coreId="triad"
                      coreName="Triad Core"
                      currentPrompt={triadPrompt || CORE_CONFIGS.triad.systemPrompt}
                      defaultPrompt={CORE_CONFIGS.triad.systemPrompt}
                      onSave={setTriadPrompt}
                      onReset={() => setTriadPrompt(CORE_CONFIGS.triad.systemPrompt)}
                    />
                  </div>
                  <EngineSelect 
                    value={triadEngine || DEFAULT_ENGINE}
                    onValueChange={setTriadEngine}
                  />
                </ConsoleCard>
                <div className="h-[450px]">
                  <OutputPanel
                    title="Execution Plan"
                    content={results.triad}
                    isLoading={loadingStatus.triad}
                    badge="Triad"
                    usedCache={cacheStatus.triad}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="h-[550px]"
          >
            <HistoryPanel
              history={history || []}
              onSelectEntry={handleSelectHistoryEntry}
              onDeleteEntry={handleDeleteHistoryEntry}
              onClearAll={handleClearHistory}
            />
          </motion.div>
        </div>
      </div>

      <HistoryDetailModal
        entry={selectedEntry}
        open={showHistoryDetail}
        onOpenChange={setShowHistoryDetail}
      />
    </div>
  )
}
