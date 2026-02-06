import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConsoleCard } from './ConsoleCard'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { 
  QualityScore, 
  scoreResponse, 
  getScoreColor, 
  getScoreLabel,
  saveScoredResponse,
  ScoredResponse 
} from '@/lib/quality-scoring'
import { 
  ChartBar, 
  Sparkle, 
  CheckCircle, 
  Warning, 
  TrendUp,
  Brain,
  CircleNotch
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface QualityScoreCardProps {
  input: string
  output: string
  engine: string
  onScoreComplete?: (score: QualityScore) => void
}

export function QualityScoreCard({ 
  input, 
  output, 
  engine,
  onScoreComplete 
}: QualityScoreCardProps) {
  const [score, setScore] = useState<QualityScore | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleScore = async () => {
    setIsScoring(true)
    try {
      const result = await scoreResponse(input, output, 'gpt-4o')
      setScore(result)
      setShowDetails(true)
      
      // Save to history
      const scoredResponse: ScoredResponse = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        input,
        output,
        engine,
        score: result,
        timestamp: Date.now()
      }
      saveScoredResponse(scoredResponse)
      
      if (onScoreComplete) {
        onScoreComplete(result)
      }
      
      toast.success('Quality analysis complete', {
        description: `Overall score: ${result.overall}/10 - ${getScoreLabel(result.overall)}`
      })
    } catch (error) {
      console.error('Scoring failed:', error)
      toast.error('Failed to analyze quality', {
        description: 'Please try again or check your API configuration'
      })
    } finally {
      setIsScoring(false)
    }
  }

  const ScoreDimension = ({ 
    label, 
    value, 
    icon: Icon 
  }: { 
    label: string
    value: number
    icon: any 
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm font-bold ${getScoreColor(value)}`}>
          {value}/10
        </span>
      </div>
      <Progress value={value * 10} className="h-2" />
    </div>
  )

  return (
    <ConsoleCard glass className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-400">
              Quality Analysis
            </label>
          </div>
          {score && (
            <Badge variant="outline" className={getScoreColor(score.overall)}>
              {getScoreLabel(score.overall)}
            </Badge>
          )}
        </div>

        {!score ? (
          <div className="text-center py-8">
            <Brain size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered quality analysis with detailed scores across 5 dimensions
            </p>
            <Button
              onClick={handleScore}
              disabled={isScoring}
              className="gap-2"
              variant="outline"
            >
              {isScoring ? (
                <>
                  <CircleNotch size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkle size={16} />
                  Analyze Quality
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="text-center p-4 rounded-lg bg-background/50 border border-border/30">
              <div className="text-sm text-muted-foreground mb-2">Overall Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
                {score.overall}
                <span className="text-lg text-muted-foreground">/10</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {getScoreLabel(score.overall)}
              </div>
            </div>

            {/* Toggle Details */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full gap-2"
            >
              <ChartBar size={16} />
              {showDetails ? 'Hide Details' : 'View Detailed Breakdown'}
            </Button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Separator />

                  {/* Dimension Scores */}
                  <div className="space-y-3">
                    <ScoreDimension 
                      label="Clarity" 
                      value={score.clarity} 
                      icon={Sparkle}
                    />
                    <ScoreDimension 
                      label="Accuracy" 
                      value={score.accuracy} 
                      icon={CheckCircle}
                    />
                    <ScoreDimension 
                      label="Usefulness" 
                      value={score.usefulness} 
                      icon={TrendUp}
                    />
                    <ScoreDimension 
                      label="Depth" 
                      value={score.depth} 
                      icon={ChartBar}
                    />
                    <ScoreDimension 
                      label="Creativity" 
                      value={score.creativity} 
                      icon={Brain}
                    />
                  </div>

                  <Separator />

                  {/* Explanation */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Analysis
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {score.explanation}
                    </p>
                  </div>

                  {/* Strengths */}
                  {score.strengths.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-400" />
                        <div className="text-xs font-semibold uppercase tracking-wider text-green-400">
                          Strengths
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {score.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {score.improvements.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Warning size={14} className="text-amber-400" />
                        <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                          Suggested Improvements
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {score.improvements.map((improvement, i) => (
                          <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                            <span className="text-amber-400 mt-0.5">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Re-analyze Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScore}
                    disabled={isScoring}
                    className="w-full gap-2"
                  >
                    {isScoring ? (
                      <>
                        <CircleNotch size={16} className="animate-spin" />
                        Re-analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkle size={16} />
                        Re-analyze
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ConsoleCard>
  )
}
