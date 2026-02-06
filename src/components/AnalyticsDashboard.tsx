import { Button } from './ui/button'
import { ConsoleCard } from './ConsoleCard'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Brain, TrendUp, Coins, Lightning, Target } from '@phosphor-icons/react'
import { getCacheStats } from '@/lib/cache'
import { getPerformanceMetrics } from '@/lib/performance-analytics'
import { useState, useEffect } from 'react'

export function AnalyticsDashboard({ onBack }: { onBack: () => void }) {
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [perfMetrics, setPerfMetrics] = useState<any>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const cache = await getCacheStats()
    const perf = getPerformanceMetrics()
    setCacheStats(cache)
    setPerfMetrics(perf)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20 md:pt-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <ConsoleCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Brain size={24} weight="duotone" className="text-primary" />
              <h1 className="text-2xl font-bold font-display">Advanced Analytics</h1>
            </div>
            <Button onClick={onBack} variant="outline" size="sm">Back</Button>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <ConsoleCard glass className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={20} className="text-blue-400" />
                <span className="text-xs text-muted-foreground">Total Queries</span>
              </div>
              <p className="text-2xl font-bold">{perfMetrics?.totalQueries || 0}</p>
            </ConsoleCard>

            <ConsoleCard glass className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins size={20} className="text-amber-400" />
                <span className="text-xs text-muted-foreground">Total Cost</span>
              </div>
              <p className="text-2xl font-bold">${(perfMetrics?.totalCost || 0).toFixed(4)}</p>
            </ConsoleCard>

            <ConsoleCard glass className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightning size={20} className="text-green-400" />
                <span className="text-xs text-muted-foreground">Cache Hit Rate</span>
              </div>
              <p className="text-2xl font-bold">{(cacheStats?.hitRate || 0).toFixed(1)}%</p>
            </ConsoleCard>

            <ConsoleCard glass className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendUp size={20} className="text-purple-400" />
                <span className="text-xs text-muted-foreground">Avg Quality</span>
              </div>
              <p className="text-2xl font-bold">{(perfMetrics?.avgQualityScore || 0).toFixed(1)}/10</p>
            </ConsoleCard>
          </div>

          {/* Cache Savings */}
          {cacheStats && (
            <ConsoleCard glass className="p-4 mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Lightning size={16} className="text-green-400" />
                Cache Savings
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Total Saved</span>
                    <span className="font-semibold text-green-400">
                      ${(cacheStats.totalCostSaved || 0).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Cache Hits</span>
                    <span className="font-semibold">{cacheStats.totalHits || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cached Items</span>
                    <span className="font-semibold">{cacheStats.totalCached || 0}</span>
                  </div>
                </div>
              </div>
            </ConsoleCard>
          )}

          {/* Top Performing Engines */}
          {perfMetrics?.topEngines && perfMetrics.topEngines.length > 0 && (
            <ConsoleCard glass className="p-4">
              <h3 className="text-sm font-semibold mb-3">Top Performing Engines</h3>
              <div className="space-y-3">
                {perfMetrics.topEngines.map((engine: any, index: number) => (
                  <div key={engine.engine} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      #{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{engine.engine}</span>
                        <span className="text-sm text-muted-foreground">
                          {engine.score.toFixed(2)}/10
                        </span>
                      </div>
                      <Progress value={(engine.score / 10) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </ConsoleCard>
          )}
        </ConsoleCard>
      </div>
    </div>
  )
}
