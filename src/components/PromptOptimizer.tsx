import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Card } from './ui/card'
import { optimizePrompt, analyzePromptIssues, PROMPT_TIPS, type PromptOptimization } from '@/lib/prompt-optimizer'
import { Sparkle, TrendUp, Lightbulb, ArrowRight, Copy, CircleNotch } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PromptOptimizerProps {
  prompt: string
  onOptimizedPrompt: (optimized: string) => void
}

export function PromptOptimizer({ prompt, onOptimizedPrompt }: PromptOptimizerProps) {
  const [optimization, setOptimization] = useState<PromptOptimization | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showTips, setShowTips] = useState(false)

  const issues = analyzePromptIssues(prompt)

  const handleOptimize = async () => {
    if (!prompt || prompt.trim().length < 3) {
      toast.error('Enter a prompt first')
      return
    }

    setIsOptimizing(true)
    try {
      const result = await optimizePrompt(prompt)
      setOptimization(result)
      toast.success('Prompt optimized!', {
        description: `Quality improvement: +${result.qualityPrediction.improvement}%`
      })
    } catch (error) {
      console.error('Optimization error:', error)
      toast.error('Failed to optimize prompt')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleUseOptimized = () => {
    if (optimization) {
      onOptimizedPrompt(optimization.optimized)
      toast.success('Optimized prompt applied!')
    }
  }

  const handleCopyOptimized = async () => {
    if (optimization) {
      await navigator.clipboard.writeText(optimization.optimized)
      toast.success('Copied to clipboard!')
    }
  }

  return (
    <div className="space-y-3">
      {/* Quick Analysis */}
      {issues.length > 0 && !optimization && (
        <Card className="p-3 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-start gap-2">
            <Lightbulb size={18} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1 text-sm">
              <div className="font-medium text-amber-400">Suggestions</div>
              <ul className="space-y-1 text-muted-foreground">
                {issues.slice(0, 3).map((issue, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Optimize Button */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleOptimize}
          disabled={isOptimizing || !prompt || prompt.length < 3}
          className="gap-2 flex-1"
        >
          {isOptimizing ? (
            <>
              <CircleNotch size={16} className="animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkle size={16} />
              Optimize Prompt
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTips(!showTips)}
          className="gap-2"
        >
          <Lightbulb size={16} />
          Tips
        </Button>
      </div>

      {/* Tips Panel */}
      <AnimatePresence>
        {showTips && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 space-y-3">
              <div className="font-semibold text-sm flex items-center gap-2">
                <Lightbulb size={16} className="text-primary" />
                Prompt Writing Tips
              </div>
              <div className="space-y-2">
                {PROMPT_TIPS.map((tip, i) => (
                  <div key={i} className="text-xs space-y-1">
                    <div className="font-medium text-primary">{tip.category}</div>
                    <div className="text-muted-foreground">{tip.tip}</div>
                    <div className="text-[10px] text-muted-foreground/70 italic">
                      {tip.example}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimization Results */}
      <AnimatePresence>
        {optimization && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4 space-y-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              {/* Quality Improvement */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendUp size={18} className="text-emerald-400" />
                  <span className="text-sm font-semibold">Quality Improvement</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  +{optimization.qualityPrediction.improvement}%
                </Badge>
              </div>

              {/* Before/After Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
                  <div className="text-xs text-muted-foreground mb-1">Before</div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {optimization.qualityPrediction.before}/10
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="text-xs text-primary mb-1">After</div>
                  <div className="text-2xl font-bold text-primary">
                    {optimization.qualityPrediction.after}/10
                  </div>
                </div>
              </div>

              <Separator />

              {/* Optimized Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Optimized Prompt</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyOptimized}
                      className="h-7 px-2 gap-1.5"
                    >
                      <Copy size={14} />
                      Copy
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleUseOptimized}
                      className="h-7 px-2 gap-1.5"
                    >
                      <ArrowRight size={14} />
                      Use This
                    </Button>
                  </div>
                </div>
                <div className="text-sm p-3 rounded-lg bg-background/70 border border-border/30 text-foreground/90 leading-relaxed">
                  {optimization.optimized}
                </div>
              </div>

              {/* Improvements */}
              <div className="space-y-2">
                <span className="text-sm font-semibold">Key Improvements</span>
                <ul className="space-y-1.5">
                  {optimization.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Sparkle size={14} className="text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reasoning */}
              <div className="text-xs text-muted-foreground p-3 rounded-lg bg-background/50 border border-border/30">
                <span className="font-medium">Why: </span>
                {optimization.reasoning}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
