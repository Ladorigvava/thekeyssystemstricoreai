import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ConsoleCard } from './ConsoleCard'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { AIEngine, ENGINE_CONFIGS } from '@/lib/engines'
import {
  runStreamingRace,
  formatTime,
  formatSpeed,
  getSpeedWinner,
  getThroughputWinner,
  type RaceProgress,
  type RaceStats,
} from '@/lib/streaming-race'
import {
  Rabbit,
  Trophy,
  Timer,
  Lightning,
  Article,
  Gauge,
  Flag,
  CircleNotch,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export function StreamingRaceView({ onBack }: { onBack: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [selectedEngines, setSelectedEngines] = useState<Set<AIEngine>>(
    new Set(['gpt-4o', 'claude-sonnet-5', 'gemini-2.5-pro'] as AIEngine[]),
  )
  const [isRacing, setIsRacing] = useState(false)
  const [progress, setProgress] = useState<Map<AIEngine, RaceProgress>>(
    new Map(),
  )
  const [stats, setStats] = useState<Map<AIEngine, RaceStats>>(new Map())
  const [stage, setStage] = useState<'setup' | 'racing' | 'complete'>('setup')

  const toggleEngine = (engine: AIEngine) => {
    const newSet = new Set(selectedEngines)
    if (newSet.has(engine)) {
      newSet.delete(engine)
    } else {
      if (newSet.size >= 6) {
        toast.error('Maximum 6 engines for race')
        return
      }
      newSet.add(engine)
    }
    setSelectedEngines(newSet)
  }

  const handleStartRace = async () => {
    if (!prompt.trim()) {
      toast.error('Enter a prompt first')
      return
    }

    if (selectedEngines.size < 2) {
      toast.error('Select at least 2 engines for a race')
      return
    }

    setIsRacing(true)
    setStage('racing')
    setProgress(new Map())
    setStats(new Map())

    try {
      await runStreamingRace(
        prompt,
        Array.from(selectedEngines),
        (progressUpdate) => {
          setProgress(new Map(progressUpdate))
        },
        (finalStats) => {
          setStats(new Map(finalStats))
          setStage('complete')
          toast.success('Race complete!', {
            description: 'All engines have finished',
          })
        },
      )
    } catch (error) {
      console.error('Race error:', error)
      toast.error('Race failed', {
        description: 'Please try again or select different engines',
      })
    } finally {
      setIsRacing(false)
    }
  }

  const handleNewRace = () => {
    setStage('setup')
    setProgress(new Map())
    setStats(new Map())
    setPrompt('')
  }

  // Calculate rankings
  const speedWinner = getSpeedWinner(stats)
  const throughputWinner = getThroughputWinner(stats)

  // Get sorted engines by completion time
  const sortedBySpeed = Array.from(stats.entries())
    .sort(([, a], [, b]) => a.totalTime - b.totalTime)
    .map(([engine]) => engine)

  // Get progress as percentage (based on average expected length)
  const getProgressPercent = (prog: RaceProgress): number => {
    if (prog.isComplete) return 100
    // Estimate progress based on char count (rough heuristic)
    const estimatedTotal = 2000 // chars
    return Math.min(100, (prog.text.length / estimatedTotal) * 100)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20 md:pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <ConsoleCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rabbit size={24} weight="duotone" className="text-primary" />
                <h1 className="text-2xl font-bold font-display">
                  Streaming Race
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Watch AI models compete in real-time with live speed metrics
              </p>
            </div>
            <Button onClick={onBack} variant="outline" size="sm">
              Back
            </Button>
          </div>

          {stage === 'setup' && (
            <div className="space-y-6">
              {/* Engine Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Select Racers (2-6 engines)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.keys(ENGINE_CONFIGS) as AIEngine[]).map((engine) => (
                    <div
                      key={engine}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <Checkbox
                        id={engine}
                        checked={selectedEngines.has(engine)}
                        onCheckedChange={() => toggleEngine(engine)}
                      />
                      <Label
                        htmlFor={engine}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {ENGINE_CONFIGS[engine].name}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedEngines.size} / 6
                </p>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <Label>Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a prompt to race (e.g., 'Explain quantum computing in simple terms')"
                  className="min-h-[100px] resize-none"
                  disabled={isRacing}
                />
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartRace}
                disabled={!prompt.trim() || selectedEngines.size < 2}
                className="w-full"
                size="lg"
              >
                <Flag size={20} className="mr-2" />
                Start Race
              </Button>
            </div>
          )}

          {(stage === 'racing' || stage === 'complete') && (
            <div className="space-y-4">
              {/* Live Progress Bars */}
              <div className="space-y-3">
                {Array.from(selectedEngines).map((engine) => {
                  const prog = progress.get(engine)
                  const stat = stats.get(engine)
                  const isWinner =
                    stage === 'complete' && speedWinner === engine
                  const position = sortedBySpeed.indexOf(engine) + 1

                  return (
                    <motion.div
                      key={engine}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border ${
                        isWinner
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/50 bg-background/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {ENGINE_CONFIGS[engine].name}
                            </Badge>
                            {isWinner && (
                              <Trophy size={16} className="text-amber-400" />
                            )}
                            {stage === 'complete' && position <= 3 && (
                              <Badge className="text-xs">#{position}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {prog && !prog.isComplete && (
                              <div className="flex items-center gap-1">
                                <CircleNotch
                                  size={14}
                                  className="animate-spin"
                                />
                                <span>Writing...</span>
                              </div>
                            )}
                            {prog && prog.charsPerSecond > 0 && (
                              <div className="flex items-center gap-1">
                                <Lightning size={14} />
                                <span>{formatSpeed(prog.charsPerSecond)}</span>
                              </div>
                            )}
                            {prog && prog.wordCount > 0 && (
                              <div className="flex items-center gap-1">
                                <Article size={14} />
                                <span>{prog.wordCount} words</span>
                              </div>
                            )}
                            {stat && (
                              <div className="flex items-center gap-1">
                                <Timer size={14} />
                                <span>{formatTime(stat.totalTime)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Progress
                          value={prog ? getProgressPercent(prog) : 0}
                          className="h-2"
                        />

                        {prog?.error && (
                          <p className="text-xs text-destructive">
                            {prog.error}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Winner Stats */}
              {stage === 'complete' && stats.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid md:grid-cols-2 gap-4"
                >
                  {speedWinner && (
                    <ConsoleCard glass className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-amber-400">
                          <Trophy size={20} />
                          <span className="font-semibold">
                            Fastest Completion
                          </span>
                        </div>
                        <p className="text-2xl font-bold">
                          {ENGINE_CONFIGS[speedWinner].name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(stats.get(speedWinner)!.totalTime)}
                        </p>
                      </div>
                    </ConsoleCard>
                  )}

                  {throughputWinner && (
                    <ConsoleCard glass className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-400">
                          <Gauge size={20} />
                          <span className="font-semibold">
                            Highest Throughput
                          </span>
                        </div>
                        <p className="text-2xl font-bold">
                          {ENGINE_CONFIGS[throughputWinner].name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatSpeed(stats.get(throughputWinner)!.avgSpeed)}
                        </p>
                      </div>
                    </ConsoleCard>
                  )}
                </motion.div>
              )}

              {/* Response Preview */}
              {stage === 'complete' && (
                <div className="space-y-3">
                  <Label>Responses</Label>
                  <ScrollArea className="h-[400px] rounded-lg border border-border/50 p-4">
                    <div className="space-y-4">
                      {sortedBySpeed.map((engine, index) => {
                        const prog = progress.get(engine)
                        if (!prog?.text) return null

                        return (
                          <div key={engine} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                #{index + 1} {ENGINE_CONFIGS[engine].name}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {prog.text}
                            </p>
                            {index < sortedBySpeed.length - 1 && (
                              <div className="border-b border-border/30 my-4" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* New Race Button */}
              {stage === 'complete' && (
                <Button
                  onClick={handleNewRace}
                  className="w-full"
                  variant="outline"
                >
                  New Race
                </Button>
              )}
            </div>
          )}
        </ConsoleCard>
      </motion.div>
    </div>
  )
}
