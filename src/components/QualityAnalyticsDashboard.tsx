import { useState } from 'react'
import { motion } from 'framer-motion'
import { ConsoleCard } from './ConsoleCard'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  getScoredResponses,
  getAverageScoresByEngine,
  getTopPerformingEngines,
  clearScoredResponses,
  getScoreColor,
  getScoreLabel,
  ScoredResponse
} from '@/lib/quality-scoring'
import { ENGINE_CONFIGS } from '@/lib/engines'
import {
  Brain,
  ChartBar,
  Trophy,
  Sparkle,
  CheckCircle,
  TrendUp,
  Trash,
  Clock
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QualityAnalyticsDashboardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QualityAnalyticsDashboard({ open, onOpenChange }: QualityAnalyticsDashboardProps) {
  const [selectedResponse, setSelectedResponse] = useState<ScoredResponse | null>(null)
  
  const scoredResponses = getScoredResponses()
  const averagesByEngine = getAverageScoresByEngine()
  const topEngines = getTopPerformingEngines(5)

  const handleClearAll = () => {
    clearScoredResponses()
    toast.success('All quality scores cleared')
    onOpenChange(false)
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            Quality Analytics Dashboard
          </DialogTitle>
          <DialogDescription>
            AI-powered quality scores and performance insights across all engines
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {scoredResponses.length === 0 ? (
              <div className="text-center py-12">
                <Brain size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">No quality scores yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Run analyses and click "Analyze Quality" to start tracking
                </p>
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <ConsoleCard glass className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {scoredResponses.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Total Scored
                    </div>
                  </ConsoleCard>
                  <ConsoleCard glass className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">
                      {(scoredResponses.reduce((sum, r) => sum + r.score.overall, 0) / scoredResponses.length).toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Avg Score
                    </div>
                  </ConsoleCard>
                  <ConsoleCard glass className="p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">
                      {Object.keys(averagesByEngine).length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Engines Used
                    </div>
                  </ConsoleCard>
                </div>

                {/* Top Performing Engines */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={18} className="text-amber-400" />
                    <h3 className="text-sm font-semibold">Top Performing Engines</h3>
                  </div>
                  <div className="space-y-2">
                    {topEngines.map((item, index) => {
                      const config = ENGINE_CONFIGS[item.engine as keyof typeof ENGINE_CONFIGS]
                      if (!config) return null
                      
                      return (
                        <ConsoleCard key={item.engine} glass className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`text-lg font-bold ${
                                index === 0 ? 'text-amber-400' : 
                                index === 1 ? 'text-gray-300' : 
                                index === 2 ? 'text-orange-400' : 
                                'text-muted-foreground'
                              }`}>
                                #{index + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{config.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.count} {item.count === 1 ? 'score' : 'scores'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getScoreColor(item.avgScore)}`}>
                                {item.avgScore.toFixed(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getScoreLabel(item.avgScore)}
                              </div>
                            </div>
                          </div>
                        </ConsoleCard>
                      )
                    })}
                  </div>
                </div>

                {/* Dimension Averages */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ChartBar size={18} className="text-purple-400" />
                    <h3 className="text-sm font-semibold">Average Scores by Dimension</h3>
                  </div>
                  <ConsoleCard glass className="p-4">
                    <div className="space-y-3">
                      {(() => {
                        const allScores = scoredResponses.map(r => r.score)
                        const avgClarity = allScores.reduce((s, sc) => s + sc.clarity, 0) / allScores.length
                        const avgAccuracy = allScores.reduce((s, sc) => s + sc.accuracy, 0) / allScores.length
                        const avgUsefulness = allScores.reduce((s, sc) => s + sc.usefulness, 0) / allScores.length
                        const avgDepth = allScores.reduce((s, sc) => s + sc.depth, 0) / allScores.length
                        const avgCreativity = allScores.reduce((s, sc) => s + sc.creativity, 0) / allScores.length

                        return (
                          <>
                            <ScoreBar label="Clarity" value={avgClarity} icon={Sparkle} />
                            <ScoreBar label="Accuracy" value={avgAccuracy} icon={CheckCircle} />
                            <ScoreBar label="Usefulness" value={avgUsefulness} icon={TrendUp} />
                            <ScoreBar label="Depth" value={avgDepth} icon={ChartBar} />
                            <ScoreBar label="Creativity" value={avgCreativity} icon={Brain} />
                          </>
                        )
                      })()}
                    </div>
                  </ConsoleCard>
                </div>

                {/* Recent Scores */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-blue-400" />
                      <h3 className="text-sm font-semibold">Recent Scores</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="gap-2 text-destructive"
                    >
                      <Trash size={14} />
                      Clear All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {scoredResponses.slice(0, 10).reverse().map((response) => {
                      const config = ENGINE_CONFIGS[response.engine as keyof typeof ENGINE_CONFIGS]
                      
                      return (
                        <ConsoleCard key={response.id} glass className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {config?.name || response.engine}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(response.timestamp)}
                                </span>
                              </div>
                              <div className={`text-sm font-bold ${getScoreColor(response.score.overall)}`}>
                                {response.score.overall}/10
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {response.input}
                            </div>
                          </div>
                        </ConsoleCard>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function ScoreBar({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-muted-foreground" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className={`text-xs font-bold ${getScoreColor(value)}`}>
          {value.toFixed(1)}/10
        </span>
      </div>
      <Progress value={value * 10} className="h-1.5" />
    </div>
  )
}
