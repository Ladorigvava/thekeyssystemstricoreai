import { useState, useEffect } from 'react'
import { ConsoleCard } from './ConsoleCard'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { 
  getUsageStats, 
  setMonthlyBudget, 
  getMonthlyBudget,
  formatCost,
  clearCostData,
  exportCostDataCSV,
  MODEL_COSTS
} from '@/lib/cost-tracking'
import { ENGINE_CONFIGS, AIEngine } from '@/lib/engines'
import { 
  ChartLineUp, 
  Coin, 
  DownloadSimple, 
  Trash, 
  Warning,
  CheckCircle,
  TrendUp
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface CostDashboardProps {
  onClose: () => void
}

export function CostDashboard({ onClose }: CostDashboardProps) {
  const [stats, setStats] = useState(getUsageStats())
  const [budget, setBudget] = useState(getMonthlyBudget())
  const [budgetInput, setBudgetInput] = useState(budget.toString())

  const refresh = () => {
    setStats(getUsageStats())
    setBudget(getMonthlyBudget())
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleSetBudget = () => {
    const amount = parseFloat(budgetInput)
    if (isNaN(amount) || amount < 0) {
      toast.error('Invalid budget amount')
      return
    }
    setMonthlyBudget(amount)
    setBudget(amount)
    refresh()
    toast.success(`Monthly budget set to ${formatCost(amount)}`)
  }

  const handleClearData = () => {
    if (confirm('Clear all cost tracking data? This cannot be undone.')) {
      clearCostData()
      refresh()
      toast.success('Cost data cleared')
    }
  }

  const handleExportCSV = () => {
    const csv = exportCostDataCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cost-tracking-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Cost data exported')
  }

  const budgetPercentage = budget > 0 ? (stats.totalCost / budget) * 100 : 0
  const isOverBudget = budget > 0 && stats.totalCost > budget
  const isNearBudget = budget > 0 && budgetPercentage > 80 && !isOverBudget

  // Get top 3 most expensive engines
  const topEngines = Object.entries(stats.costByEngine)
    .filter(([_, cost]) => cost > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)

  // Get top 3 most used modes
  const topModes = Object.entries(stats.costByMode)
    .filter(([_, cost]) => cost > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Coin size={32} weight="duotone" className="text-amber-400" />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Cost Tracking Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Monitor your AI usage and spending</p>
                </div>
              </div>
              <Button onClick={onClose} variant="outline">Close</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            {/* Total Cost Card */}
            <ConsoleCard glass className="p-5" glow="accent">
              <div className="flex items-center gap-2 mb-2">
                <Coin size={20} weight="fill" className="text-amber-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  This Month
                </h3>
              </div>
              <div className="text-3xl font-bold text-amber-400">{formatCost(stats.totalCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalQueries} {stats.totalQueries === 1 ? 'query' : 'queries'}
              </p>
            </ConsoleCard>

            {/* Budget Card */}
            <ConsoleCard glass className="p-5" glow={isOverBudget ? 'accent' : isNearBudget ? 'accent' : 'secondary'}>
              <div className="flex items-center gap-2 mb-2">
                <ChartLineUp size={20} weight="fill" className={
                  isOverBudget ? 'text-red-400' : isNearBudget ? 'text-yellow-400' : 'text-secondary'
                } />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Budget Status
                </h3>
              </div>
              {budget > 0 ? (
                <>
                  <div className={`text-3xl font-bold ${
                    isOverBudget ? 'text-red-400' : isNearBudget ? 'text-yellow-400' : 'text-secondary'
                  }`}>
                    {budgetPercentage.toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isOverBudget ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <Warning size={14} weight="fill" />
                        Over budget by {formatCost(stats.totalCost - budget)}
                      </span>
                    ) : (
                      `${formatCost(stats.budgetRemaining || 0)} remaining`
                    )}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-muted-foreground">No Budget</div>
                  <p className="text-xs text-muted-foreground mt-1">Set a monthly budget below</p>
                </>
              )}
            </ConsoleCard>

            {/* Average Cost Card */}
            <ConsoleCard glass className="p-5" glow="primary">
              <div className="flex items-center gap-2 mb-2">
                <TrendUp size={20} weight="fill" className="text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Avg Per Query
                </h3>
              </div>
              <div className="text-3xl font-bold text-primary">
                {stats.totalQueries > 0 ? formatCost(stats.totalCost / stats.totalQueries) : formatCost(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalQueries > 0 ? 'Efficiency metric' : 'No queries yet'}
              </p>
            </ConsoleCard>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Management */}
            <ConsoleCard glass className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Coin size={18} weight="bold" className="text-accent" />
                Budget Management
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="budget" className="text-xs">Monthly Budget (USD)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      min="0"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      placeholder="0.00"
                      className="h-9"
                    />
                    <Button onClick={handleSetBudget} size="sm" className="glow-accent">
                      Set Budget
                    </Button>
                  </div>
                </div>
                
                {budget > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Budget Progress</span>
                      <span className="font-medium">{budgetPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full ${
                          isOverBudget 
                            ? 'bg-red-500' 
                            : isNearBudget 
                            ? 'bg-yellow-500' 
                            : 'bg-gradient-to-r from-accent to-secondary'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    onClick={handleExportCSV} 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    disabled={stats.totalQueries === 0}
                  >
                    <DownloadSimple size={16} className="mr-1.5" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={handleClearData} 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-400 hover:text-red-300"
                    disabled={stats.totalQueries === 0}
                  >
                    <Trash size={16} className="mr-1.5" />
                    Clear Data
                  </Button>
                </div>
              </div>
            </ConsoleCard>

            {/* Top Engines */}
            <ConsoleCard glass className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendUp size={18} weight="bold" className="text-primary" />
                Most Expensive Engines
              </h3>
              <ScrollArea className="h-[180px]">
                {topEngines.length > 0 ? (
                  <div className="space-y-2">
                    {topEngines.map(([engine, cost]) => (
                      <div key={engine} className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{ENGINE_CONFIGS[engine as AIEngine].name}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.queriesByEngine[engine as AIEngine]} queries
                          </div>
                        </div>
                        <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                          {formatCost(cost)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No usage data yet
                  </div>
                )}
              </ScrollArea>
            </ConsoleCard>

            {/* Top Modes */}
            <ConsoleCard glass className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <ChartLineUp size={18} weight="bold" className="text-secondary" />
                Cost by Mode
              </h3>
              <ScrollArea className="h-[180px]">
                {topModes.length > 0 ? (
                  <div className="space-y-2">
                    {topModes.map(([mode, cost]) => (
                      <div key={mode} className="flex items-center justify-between p-2 bg-secondary/10 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium capitalize">{mode}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.entriesThisMonth.filter(e => e.mode === mode).length} queries
                          </div>
                        </div>
                        <Badge variant="outline" className="text-secondary border-secondary/30">
                          {formatCost(cost)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No usage data yet
                  </div>
                )}
              </ScrollArea>
            </ConsoleCard>

            {/* Cost Reference Table */}
            <ConsoleCard glass className="p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Coin size={18} weight="bold" className="text-accent" />
                Pricing Reference
              </h3>
              <ScrollArea className="h-[180px]">
                <div className="space-y-1.5">
                  {Object.entries(MODEL_COSTS).map(([engine, costs]) => (
                    <div key={engine} className="flex items-center justify-between p-1.5 hover:bg-secondary/5 rounded text-xs">
                      <span className="font-medium truncate flex-1">{ENGINE_CONFIGS[engine as AIEngine].name}</span>
                      <div className="flex gap-2 text-muted-foreground">
                        <span>In: ${costs.input}/M</span>
                        <span>Out: ${costs.output}/M</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </ConsoleCard>
          </div>
        </div>
      </div>
    </div>
  )
}
