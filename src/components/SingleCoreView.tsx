import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { OutputPanel } from '@/components/OutputPanel'
import { InteractiveResponse } from '@/components/InteractiveResponse'
import { HistoryPanel } from '@/components/HistoryPanel'
import { HistoryDetailModal } from '@/components/HistoryDetailModal'
import { EngineSelect } from '@/components/EngineSelect'
import { SystemPromptEditor } from '@/components/SystemPromptEditor'
import { ConsoleCard } from '@/components/ConsoleCard'
import { QualityScoreCard } from '@/components/QualityScoreCard'
import { PromptOptimizer } from '@/components/PromptOptimizer'
import { CoreConfig } from '@/lib/cores'
import { HistoryEntry, createHistoryEntry } from '@/lib/history'
import {
  AIEngine,
  CORE_ENGINES,
  DEFAULT_ENGINE,
  getEngineStorageKey,
} from '@/lib/engines'
import { getCachedResponse, cacheResponse } from '@/lib/cache'
import { callLLM, streamLLM } from '@/lib/llm'
import { categorizeError } from '@/lib/retry'
import { logCost } from '@/lib/cost-tracking'
import {
  exportEntryAsMarkdown,
  exportEntryAsJSON,
  exportEntryAsHTML,
  generateShareableLink,
} from '@/lib/export'
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Sparkle,
  FlowArrow,
  Database,
} from '@phosphor-icons/react'
import { Download, FileText, FileJson, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useKV } from '@/lib/storage'
import { toast } from 'sonner'

interface SingleCoreViewProps {
  config: CoreConfig
  onBack: () => void
}

export function SingleCoreView({ config, onBack }: SingleCoreViewProps) {
  const [input, setInput] = useKV('tricore-input', '')
  const [output, setOutput] = useState('')
  const [analysisError, setAnalysisError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])
  const [isLoading, setIsLoading] = useState(false)
  const [usedCache, setUsedCache] = useState(false)
  const [selectedEngine, setSelectedEngine] = useKV<AIEngine>(
    getEngineStorageKey(config.id),
    CORE_ENGINES[config.id] || DEFAULT_ENGINE,
  )
  const [customPrompt, setCustomPrompt] = useKV<string>(
    `custom-prompt-${config.id}`,
    config.systemPrompt,
  )
  const [history, setHistory] = useKV<HistoryEntry[]>(
    `history-${config.id}`,
    [],
  )
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)
  const [showHistoryDetail, setShowHistoryDetail] = useState(false)

  const handleAnalyze = async () => {
    if (!input || !input.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    if (controller.current) return
    controller.current = new AbortController()
    setAnalysisError('')
    setIsLoading(true)
    setOutput('')
    setUsedCache(false)

    try {
      const systemPrompt = customPrompt || config.systemPrompt
      const promptText = `${systemPrompt}

User input:
${input}`

      const cachedResult = await getCachedResponse(
        promptText,
        selectedEngine || DEFAULT_ENGINE,
        config.id,
      )

      if (cachedResult) {
        setOutput(cachedResult)
        setUsedCache(true)
        toast.success('Loaded from cache', {
          description: 'Using previously cached response',
          icon: <Database size={16} weight="bold" />,
        })

        const newEntry = {
          ...createHistoryEntry(config.id, input, cachedResult),
          engine: selectedEngine,
        }
        setHistory((currentHistory) => [newEntry, ...(currentHistory || [])])
      } else {
        // Use streaming for real-time output
        const result = await streamLLM(
          promptText,
          selectedEngine || DEFAULT_ENGINE,
          (chunk) => {
            setOutput(chunk)
          },
          { signal: controller.current.signal },
        )

        // Log cost
        logCost(selectedEngine || DEFAULT_ENGINE, promptText, result, config.id)

        await cacheResponse(
          promptText,
          result,
          selectedEngine || DEFAULT_ENGINE,
          config.id,
        )

        const newEntry = {
          ...createHistoryEntry(config.id, input, result),
          engine: selectedEngine,
        }
        setHistory((currentHistory) => [newEntry, ...(currentHistory || [])])
      }
    } catch (error) {
      console.error('LLM error:', error)

      const systemPrompt = customPrompt || config.systemPrompt
      const fallbackPrompt = `${systemPrompt}

User input:
${input}`

      const cachedResult = await getCachedResponse(
        fallbackPrompt,
        selectedEngine || DEFAULT_ENGINE,
        config.id,
      )

      if (cachedResult) {
        setOutput(cachedResult)
        setUsedCache(true)
        toast.info('Using cached response', {
          description: 'AI engine unavailable. Using previously cached result.',
        })
      } else {
        const errorInfo = {
          isRetryable: false,
          message: error instanceof Error ? error.message : 'Please try again.',
        }
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        toast.error('Analysis failed', {
          description: errorInfo.isRetryable
            ? `${errorInfo.message} Try again when the provider is available.`
            : errorInfo.message,
          duration: 8000,
        })
        setAnalysisError(
          error instanceof Error ? error.message : 'Please try again.',
        )
        setOutput('')
      }
    } finally {
      controller.current = null
      setIsLoading(false)
    }
  }

  const handleSavePrompt = (newPrompt: string) => {
    setCustomPrompt(newPrompt)
  }

  const handleResetPrompt = () => {
    setCustomPrompt(config.systemPrompt)
  }

  const handleSelectHistoryEntry = (entry: HistoryEntry) => {
    setSelectedEntry(entry)
    setShowHistoryDetail(true)
  }

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory((currentHistory) =>
      (currentHistory || []).filter((entry) => entry.id !== id),
    )
    toast.success('History entry deleted')
  }

  const handleClearHistory = () => {
    setHistory([])
    toast.success('History cleared')
  }

  const coreIcons: Record<string, any> = {
    chadrak: Shield,
    nova: Sparkle,
    triad: FlowArrow,
  }

  const CoreIcon = coreIcons[config.id] || Shield

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="border-b border-border/30 console-gradient">
        <div className="max-w-[1400px] mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-0.5">
                Single Core System
              </div>
              <div className="flex items-center gap-2">
                <CoreIcon
                  size={20}
                  weight="duotone"
                  className="text-primary shrink-0"
                />
                <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                  {config.name}
                </h1>
              </div>
            </div>
            <div className="ml-auto shrink-0">
              <SystemPromptEditor
                coreId={config.id}
                coreName={config.name}
                currentPrompt={customPrompt || config.systemPrompt}
                defaultPrompt={config.systemPrompt}
                onSave={handleSavePrompt}
                onReset={handleResetPrompt}
              />
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
            {config.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="xl:col-span-3 space-y-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ConsoleCard glass className="p-4" glow="primary">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <label
                      htmlFor="input"
                      className="block text-xs font-semibold uppercase tracking-wider text-primary"
                    >
                      Input Console
                    </label>
                  </div>
                  <EngineSelect
                    value={selectedEngine || DEFAULT_ENGINE}
                    onValueChange={setSelectedEngine}
                  />
                  <PromptOptimizer
                    prompt={input || ''}
                    onOptimizedPrompt={setInput}
                  />
                  <Textarea
                    id="input"
                    value={input}
                    disabled={isLoading}
                    maxLength={100000}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter your text, idea, or document for analysis..."
                    className="min-h-40 md:min-h-64 resize-none bg-background/50 border-border/50 focus:border-primary/50 text-sm leading-relaxed"
                  />
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || !input || !input.trim()}
                    className="w-full glow-primary"
                  >
                    {isLoading ? (
                      'Processing...'
                    ) : (
                      <>
                        {config.buttonLabel}
                        <ArrowRight className="ml-2" size={16} />
                      </>
                    )}
                  </Button>
                  {isLoading && (
                    <Button
                      variant="outline"
                      onClick={() => controller.current?.abort()}
                    >
                      Cancel
                    </Button>
                  )}
                  {analysisError && (
                    <p role="alert" className="text-sm text-destructive">
                      {analysisError}
                    </p>
                  )}
                </div>
              </ConsoleCard>

              <div className="space-y-4">
                <div className="min-h-[350px] md:min-h-[450px]">
                  {output && !isLoading ? (
                    <InteractiveResponse
                      prompt={input || ''}
                      response={output}
                      engine={selectedEngine || DEFAULT_ENGINE}
                      contextId={`${config.id}_${Date.now()}`}
                    />
                  ) : (
                    <OutputPanel
                      title="Analysis Output"
                      content={output}
                      isLoading={isLoading}
                      badge={config.name}
                      usedCache={usedCache}
                    />
                  )}
                </div>

                {/* Export Buttons */}
                {output && !isLoading && (
                  <ConsoleCard glass className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <label className="block text-xs font-semibold uppercase tracking-wider text-accent">
                          Export Options
                        </label>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const entry: HistoryEntry = {
                              id: Date.now().toString(),
                              mode: config.id,
                              input: input || '',
                              output: output,
                              timestamp: Date.now(),
                              engine: selectedEngine,
                            }
                            exportEntryAsMarkdown(entry)
                            toast.success('Exported as Markdown')
                          }}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Markdown
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const entry: HistoryEntry = {
                              id: Date.now().toString(),
                              mode: config.id,
                              input: input || '',
                              output: output,
                              timestamp: Date.now(),
                              engine: selectedEngine,
                            }
                            exportEntryAsJSON(entry)
                            toast.success('Exported as JSON')
                          }}
                          className="gap-2"
                        >
                          <FileJson className="h-4 w-4" />
                          JSON
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const entry: HistoryEntry = {
                              id: Date.now().toString(),
                              mode: config.id,
                              input: input || '',
                              output: output,
                              timestamp: Date.now(),
                              engine: selectedEngine,
                            }
                            exportEntryAsHTML(entry)
                            toast.success('Exported as HTML')
                          }}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          HTML
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const entry: HistoryEntry = {
                              id: Date.now().toString(),
                              mode: config.id,
                              input: input || '',
                              output: output,
                              timestamp: Date.now(),
                              engine: selectedEngine,
                            }
                            if (
                              !window.confirm(
                                'The link will contain your input and analysis. Anyone receiving the complete link can read it. Create it?',
                              )
                            )
                              return
                            try {
                              await generateShareableLink(entry)
                              toast.success('Link copied to clipboard!')
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : 'Unable to copy link.',
                              )
                            }
                          }}
                          className="gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </ConsoleCard>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Quality Score Panel */}
            {output && !isLoading && (
              <div className="h-[550px]">
                <QualityScoreCard
                  input={input || ''}
                  output={output}
                  engine={selectedEngine || 'gpt-4o'}
                />
              </div>
            )}

            {/* History Panel */}
            {true && (
              <div className="h-[550px]">
                <HistoryPanel
                  history={history || []}
                  onSelectEntry={handleSelectHistoryEntry}
                  onDeleteEntry={handleDeleteHistoryEntry}
                  onClearAll={handleClearHistory}
                />
              </div>
            )}
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
