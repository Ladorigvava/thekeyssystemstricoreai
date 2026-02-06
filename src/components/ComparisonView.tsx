import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConsoleCard } from '@/components/ConsoleCard'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { AIEngine, ENGINE_CONFIGS, AIProvider } from '@/lib/engines'
import { streamLLM } from '@/lib/llm'
import { logCost, estimateQueryCost, formatCost } from '@/lib/cost-tracking'
import { exportMultipleEntriesAsMarkdown, exportMultipleEntriesAsJSON } from '@/lib/export'
import { HistoryEntry } from '@/lib/history'
import { 
  ArrowLeft, 
  Atom, 
  CircleNotch, 
  Lightning, 
  Gauge, 
  Rocket, 
  Brain,
  Coin
} from '@phosphor-icons/react'
import { Download, FileText, FileJson } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ComparisonViewProps {
  onBack: () => void
}

interface ComparisonResult {
  engine: AIEngine
  output: string
  isLoading: boolean
  error: string | null
  startTime: number
  endTime: number | null
  cost: number
}

const DEFAULT_ENGINES: AIEngine[] = [
  'gpt-4o',
  'claude-3-5-sonnet-20241022',
  'gemini-2.0-flash-exp'
]

export function ComparisonView({ onBack }: ComparisonViewProps) {
  const [input, setInput] = useState('')
  const [selectedEngines, setSelectedEngines] = useState<Set<AIEngine>>(new Set(DEFAULT_ENGINES))
  const [results, setResults] = useState<Map<AIEngine, ComparisonResult>>(new Map())
  const [isRunning, setIsRunning] = useState(false)
  const [filterProvider, setFilterProvider] = useState<AIProvider | 'all'>('all')

  const handleEngineToggle = (engine: AIEngine) => {
    const newSelected = new Set(selectedEngines)
    if (newSelected.has(engine)) {
      newSelected.delete(engine)
    } else {
      newSelected.add(engine)
    }
    setSelectedEngines(newSelected)
  }

  const handleRunComparison = async () => {
    if (!input.trim()) {
      toast.error('Please enter a prompt to compare')
      return
    }

    if (selectedEngines.size === 0) {
      toast.error('Please select at least one engine')
      return
    }

    setIsRunning(true)
    const newResults = new Map<AIEngine, ComparisonResult>()

    // Initialize all results
    selectedEngines.forEach(engine => {
      newResults.set(engine, {
        engine,
        output: '',
        isLoading: true,
        error: null,
        startTime: Date.now(),
        endTime: null,
        cost: 0
      })
    })
    setResults(newResults)

    // Run all engines in parallel
    const promises = Array.from(selectedEngines).map(async (engine) => {
      const startTime = Date.now()
      try {
        const result = await streamLLM(
          input,
          engine,
          (chunk) => {
            setResults(prev => {
              const updated = new Map(prev)
              const current = updated.get(engine)
              if (current) {
                updated.set(engine, {
                  ...current,
                  output: chunk
                })
              }
              return updated
            })
          }
        )

        const endTime = Date.now()
        const cost = estimateQueryCost(engine, input, result.length)
        
        // Log cost
        logCost(engine, input, result, 'comparison')

        setResults(prev => {
          const updated = new Map(prev)
          const current = updated.get(engine)
          if (current) {
            updated.set(engine, {
              ...current,
              output: result,
              isLoading: false,
              endTime,
              cost
            })
          }
          return updated
        })
      } catch (error) {
        const endTime = Date.now()
        setResults(prev => {
          const updated = new Map(prev)
          const current = updated.get(engine)
          if (current) {
            updated.set(engine, {
              ...current,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              endTime
            })
          }
          return updated
        })
      }
    })

    await Promise.all(promises)
    setIsRunning(false)
    toast.success(`Comparison complete across ${selectedEngines.size} engines!`)
  }

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast': return <Lightning size={16} weight="fill" className="text-emerald-400" />
      case 'balanced': return <Gauge size={16} weight="fill" className="text-amber-400" />
      case 'powerful': return <Rocket size={16} weight="fill" className="text-primary" />
      case 'ultra': return <Brain size={16} weight="fill" className="text-violet-400" />
      default: return null
    }
  }

  const filteredEngines = Object.entries(ENGINE_CONFIGS)
    .filter(([_, config]) => filterProvider === 'all' || config.provider === filterProvider)
    .map(([key, config]) => ({ key: key as AIEngine, ...config }))

  const totalEstimatedCost = Array.from(selectedEngines).reduce((sum, engine) => {
    return sum + estimateQueryCost(engine, input, 1000)
  }, 0)

  const completedResults = Array.from(results.values()).filter(r => !r.isLoading && !r.error)
  const totalActualCost = completedResults.reduce((sum, r) => sum + r.cost, 0)

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 w-full overflow-x-hidden">
      <div className="max-w-[1800px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="border-b border-border/30 pb-4 mb-6">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="mb-4 hover:bg-secondary/50"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-1 h-10 bg-gradient-to-b from-accent to-transparent rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-0.5">
                  AI Model Comparison Engine
                </div>
                <div className="flex items-center gap-2">
                  <Atom size={24} weight="duotone" className="text-accent shrink-0" />
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                    Side-by-Side Model Comparison
                  </h1>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 ml-7">
              Run the same prompt across multiple AI engines and compare results, speed, and cost
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & Engine Selection */}
          <div className="space-y-4">
            <ConsoleCard glass className="p-4" glow="accent">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Atom size={18} weight="bold" className="text-accent" />
                Comparison Prompt
              </h3>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your prompt to compare across engines..."
                className="min-h-32 resize-none text-sm mb-3"
                disabled={isRunning}
              />
              
              {selectedEngines.size > 0 && input && (
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 p-2 bg-secondary/10 rounded">
                  <span>Estimated cost:</span>
                  <span className="font-medium text-amber-400">{formatCost(totalEstimatedCost)}</span>
                </div>
              )}

              <Button 
                onClick={handleRunComparison}
                disabled={isRunning || selectedEngines.size === 0 || !input.trim()}
                className="w-full glow-accent"
              >
                {isRunning ? (
                  <>
                    <CircleNotch className="mr-2 animate-spin" size={18} />
                    Comparing {selectedEngines.size} Models...
                  </>
                ) : (
                  `Compare ${selectedEngines.size} Models`
                )}
              </Button>
            </ConsoleCard>

            <ConsoleCard glass className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightning size={18} weight="bold" className="text-primary" />
                  Select Engines
                </span>
                <span className="text-xs text-muted-foreground">{selectedEngines.size} selected</span>
              </h3>

              <div className="flex gap-1 mb-3">
                {(['all', 'openai', 'anthropic', 'google'] as const).map((provider) => (
                  <Button
                    key={provider}
                    variant={filterProvider === provider ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterProvider(provider)}
                    className={`h-7 px-2.5 text-xs ${
                      filterProvider === provider ? 'glow-primary' : ''
                    }`}
                  >
                    {provider === 'all' ? 'All' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </Button>
                ))}
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-1.5">
                  {filteredEngines.map((engine) => (
                    <div
                      key={engine.key}
                      className={`flex items-center space-x-3 p-2 rounded hover:bg-secondary/10 cursor-pointer ${
                        selectedEngines.has(engine.key) ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => handleEngineToggle(engine.key)}
                    >
                      <Checkbox
                        checked={selectedEngines.has(engine.key)}
                        onCheckedChange={() => handleEngineToggle(engine.key)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getSpeedIcon(engine.speed)}
                          <span className="text-sm font-medium truncate">{engine.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{engine.description}</div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {engine.costTier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </ConsoleCard>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {results.size === 0 ? (
              <ConsoleCard glass className="p-8 text-center">
                <Atom size={64} weight="duotone" className="text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to Compare</h3>
                <p className="text-sm text-muted-foreground">
                  Select engines and enter a prompt to see side-by-side comparisons
                </p>
              </ConsoleCard>
            ) : (
              <div className="space-y-4">
                {completedResults.length > 0 && (
                  <>
                    <ConsoleCard glass className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Fastest</div>
                          <div className="text-sm font-semibold">
                            {(() => {
                              const fastest = completedResults.reduce((min, r) => 
                                (r.endTime! - r.startTime) < (min.endTime! - min.startTime) ? r : min
                              )
                              return ENGINE_CONFIGS[fastest.engine].name
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(() => {
                              const fastest = completedResults.reduce((min, r) => 
                                (r.endTime! - r.startTime) < (min.endTime! - min.startTime) ? r : min
                              )
                              return `${((fastest.endTime! - fastest.startTime) / 1000).toFixed(1)}s`
                            })()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Cheapest</div>
                          <div className="text-sm font-semibold">
                            {(() => {
                              const cheapest = completedResults.reduce((min, r) => r.cost < min.cost ? r : min)
                              return ENGINE_CONFIGS[cheapest.engine].name
                            })()}
                          </div>
                          <div className="text-xs text-amber-400">
                            {formatCost(completedResults.reduce((min, r) => r.cost < min.cost ? r : min).cost)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
                          <div className="text-sm font-semibold text-amber-400">
                            {formatCost(totalActualCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {completedResults.length} of {results.size} complete
                          </div>
                        </div>
                      </div>
                    </ConsoleCard>

                    {/* Export All Results */}
                    <ConsoleCard glass className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <label className="block text-xs font-semibold uppercase tracking-wider text-accent">
                            Export All Results
                          </label>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const entries: HistoryEntry[] = completedResults.map(result => ({
                                id: `${Date.now()}-${result.engine}`,
                                mode: 'comparison',
                                input: input,
                                output: result.output,
                                timestamp: result.startTime,
                                engine: result.engine
                              }))
                              exportMultipleEntriesAsMarkdown(entries)
                              toast.success(`Exported ${completedResults.length} results as Markdown`)
                            }}
                            className="gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Export Markdown
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const entries: HistoryEntry[] = completedResults.map(result => ({
                                id: `${Date.now()}-${result.engine}`,
                                mode: 'comparison',
                                input: input,
                                output: result.output,
                                timestamp: result.startTime,
                                engine: result.engine
                              }))
                              exportMultipleEntriesAsJSON(entries)
                              toast.success(`Exported ${completedResults.length} results as JSON`)
                            }}
                            className="gap-2"
                          >
                            <FileJson className="h-4 w-4" />
                            Export JSON
                          </Button>
                        </div>
                      </div>
                    </ConsoleCard>
                  </>
                )}

                <AnimatePresence mode="popLayout">
                  {Array.from(results.values()).map((result) => {
                    const config = ENGINE_CONFIGS[result.engine]
                    const duration = result.endTime ? (result.endTime - result.startTime) / 1000 : 0

                    return (
                      <motion.div
                        key={result.engine}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <ConsoleCard glass className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getSpeedIcon(config.speed)}
                              <h4 className="font-semibold">{config.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {config.provider}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {result.endTime && (
                                <span>{duration.toFixed(1)}s</span>
                              )}
                              {result.cost > 0 && (
                                <span className="text-amber-400">{formatCost(result.cost)}</span>
                              )}
                            </div>
                          </div>

                          {result.isLoading ? (
                            <div className="py-8 text-center">
                              <CircleNotch className="animate-spin mx-auto mb-2" size={24} />
                              <p className="text-sm text-muted-foreground">Generating response...</p>
                            </div>
                          ) : result.error ? (
                            <div className="py-4 px-3 bg-red-500/10 border border-red-500/20 rounded">
                              <p className="text-sm text-red-400">⚠️ {result.error}</p>
                            </div>
                          ) : (
                            <ScrollArea className="h-[300px]">
                              <div className="prose prose-invert prose-sm max-w-none">
                                <div className="whitespace-pre-wrap text-sm text-foreground/90">
                                  {result.output}
                                </div>
                              </div>
                            </ScrollArea>
                          )}
                        </ConsoleCard>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
