import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { ConsoleCard } from './ConsoleCard'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { AIEngine, ENGINE_CONFIGS } from '@/lib/engines'
import { runDebate, synthesizeDebate, voteOnArguments, type DebateSynthesis } from '@/lib/debate'
import { 
  UsersThree, 
  Gavel, 
  Trophy, 
  Sparkle,
  CircleNotch,
  CheckCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export function DebateView({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState('')
  const [selectedEngines, setSelectedEngines] = useState<Set<AIEngine>>(
    new Set(['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-2.0-flash-exp'] as AIEngine[])
  )
  const [isDebating, setIsDebating] = useState(false)
  const [debateArguments, setDebateArguments] = useState<Map<AIEngine, string>>(new Map())
  const [synthesis, setSynthesis] = useState<DebateSynthesis | null>(null)
  const [votes, setVotes] = useState<Map<AIEngine, number>>(new Map())
  const [stage, setStage] = useState<'select' | 'debating' | 'voting' | 'complete'>('select')

  const toggleEngine = (engine: AIEngine) => {
    const newSet = new Set(selectedEngines)
    if (newSet.has(engine)) {
      newSet.delete(engine)
    } else {
      if (newSet.size >= 5) {
        toast.error('Maximum 5 engines for debate')
        return
      }
      newSet.add(engine)
    }
    setSelectedEngines(newSet)
  }

  const handleStartDebate = async () => {
    if (!question.trim()) {
      toast.error('Enter a question first')
      return
    }
    
    if (selectedEngines.size < 2) {
      toast.error('Select at least 2 engines for debate')
      return
    }

    setIsDebating(true)
    setStage('debating')
    setDebateArguments(new Map())
    setSynthesis(null)
    setVotes(new Map())

    try {
      // Run the debate
      const results = await runDebate(
        question,
        Array.from(selectedEngines),
        (engine, partial) => {
          setDebateArguments(prev => new Map(prev).set(engine, partial))
        }
      )
      
      setDebateArguments(results)
      setStage('voting')
      
      // Vote on arguments
      const voteResults = await voteOnArguments(question, results)
      setVotes(voteResults)
      
      // Synthesize debate
      const synthResult = await synthesizeDebate(question, results)
      setSynthesis(synthResult)
      
      setStage('complete')
      toast.success('Debate complete!', {
        description: 'AI moderator has synthesized the arguments'
      })
    } catch (error) {
      console.error('Debate error:', error)
      toast.error('Debate failed', {
        description: 'Please try again or select different engines'
      })
    } finally {
      setIsDebating(false)
    }
  }

  const topEngine = votes.size > 0
    ? Array.from(votes.entries()).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    : null

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="border-b border-border/30 console-gradient">
        <div className="max-w-[1400px] mx-auto px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-0.5">
                Revolutionary Feature
              </div>
              <div className="flex items-center gap-2">
                <UsersThree size={20} weight="duotone" className="text-primary shrink-0" />
                <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                  Multi-Agent Debate
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ml-2">
                  AI vs AI
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8">
        <div className="space-y-6">
          {/* Input Section */}
          {stage === 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <ConsoleCard glass className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Question for Debate
                    </Label>
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Enter a question or topic for AI models to debate... (e.g., 'Should companies prioritize growth or profitability?')"
                      className="min-h-32"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-3 block">
                      Select Debaters ({selectedEngines.size}/5)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.values(ENGINE_CONFIGS).map((engine) => (
                        <div
                          key={engine.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedEngines.has(engine.id)
                              ? 'bg-primary/10 border-primary/50'
                              : 'bg-background/50 border-border/30 hover:border-border/50'
                          }`}
                          onClick={() => toggleEngine(engine.id)}
                        >
                          <Checkbox
                            checked={selectedEngines.has(engine.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{engine.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {engine.provider}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleStartDebate}
                    disabled={isDebating || !question.trim() || selectedEngines.size < 2}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Gavel size={18} />
                    Start Debate
                  </Button>
                </div>
              </ConsoleCard>
            </motion.div>
          )}

          {/* Debate in Progress / Results */}
          {(stage === 'debating' || stage === 'voting' || stage === 'complete') && (
            <div className="space-y-6">
              {/* Question Card */}
              <ConsoleCard glass className="p-4">
                <div className="flex items-start gap-3">
                  <Gavel size={20} className="text-primary mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">Debating:</div>
                    <div className="font-semibold">{question}</div>
                  </div>
                  {stage === 'complete' && (
                    <Button variant="outline" size="sm" onClick={() => setStage('select')}>
                      New Debate
                    </Button>
                  )}
                </div>
              </ConsoleCard>

              {/* Arguments */}
              <div className="space-y-4">
                {Array.from(selectedEngines).map((engine) => {
                  const argument = debateArguments.get(engine)
                  const score = votes.get(engine)
                  const isWinner = topEngine === engine && stage === 'complete'

                  return (
                    <motion.div
                      key={engine}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ConsoleCard glass className={`p-4 ${isWinner ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{ENGINE_CONFIGS[engine].name}</Badge>
                              {isWinner && (
                                <Trophy size={16} className="text-amber-400" />
                              )}
                            </div>
                            {score !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Score:</span>
                                <Badge className="bg-primary/20 text-primary">
                                  {score}/10
                                </Badge>
                              </div>
                            )}
                          </div>
                          {argument ? (
                            <div className="text-sm text-foreground/90 leading-relaxed">
                              {argument}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CircleNotch size={16} className="animate-spin" />
                              Formulating argument...
                            </div>
                          )}
                        </div>
                      </ConsoleCard>
                    </motion.div>
                  )
                })}
              </div>

              {/* Synthesis */}
              {synthesis && stage === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ConsoleCard glass className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkle size={20} className="text-primary" />
                        <h3 className="font-bold text-lg">AI Moderator Synthesis</h3>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Summary
                          </div>
                          <p className="text-sm text-foreground/90">{synthesis.summary}</p>
                        </div>

                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Consensus
                          </div>
                          <p className="text-sm text-foreground/90">{synthesis.consensus}</p>
                        </div>

                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Key Points
                          </div>
                          <ul className="space-y-1.5">
                            {synthesis.keyPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                                <span className="text-foreground/90">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                            Recommendation
                          </div>
                          <p className="text-sm text-foreground/90">{synthesis.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </ConsoleCard>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
