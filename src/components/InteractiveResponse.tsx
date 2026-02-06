import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { AIEngine, ENGINE_CONFIGS } from '@/lib/engines'
import {
  refineResponse,
  suggestFollowUpQuestions,
  saveRefinementToHistory,
  getRefinementsByContext,
  type RefinementContext,
  type RefinementResult
} from '@/lib/refinement'
import {
  MagnifyingGlassPlus,
  Sparkle,
  ArrowRight,
  CircleNotch,
  ChatCircleDots,
  Tree
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface InteractiveResponseProps {
  prompt: string
  response: string
  engine: AIEngine
  contextId?: string
}

export function InteractiveResponse({
  prompt,
  response,
  engine,
  contextId = `ctx_${Date.now()}`
}: InteractiveResponseProps) {
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const [showRefinementDialog, setShowRefinementDialog] = useState(false)
  const [followUpQuestion, setFollowUpQuestion] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [refinements, setRefinements] = useState<RefinementResult[]>([])
  const [streamingResponse, setStreamingResponse] = useState('')
  const responseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing refinements for this context
    const existing = getRefinementsByContext(contextId)
    setRefinements(existing)
  }, [contextId])

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectedText('')
      setSelectionPosition(null)
      return
    }

    const text = selection.toString().trim()
    if (text.length > 5 && text.length < 500) {
      setSelectedText(text)
      
      // Get selection position for tooltip
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelectionPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
    }
  }

  const handleRefinementClick = () => {
    setShowRefinementDialog(true)
    setFollowUpQuestion('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setFollowUpQuestion(suggestion)
  }

  const handleSubmitRefinement = async () => {
    if (!followUpQuestion.trim()) {
      toast.error('Enter a follow-up question')
      return
    }

    setIsRefining(true)
    setStreamingResponse('')

    try {
      const context: RefinementContext = {
        id: contextId,
        originalPrompt: prompt,
        originalResponse: response,
        selectedText,
        selectedIndex: response.indexOf(selectedText),
        timestamp: Date.now()
      }

      const result = await refineResponse(
        {
          context,
          followUpQuestion,
          engine
        },
        (chunk) => {
          setStreamingResponse(prev => prev + chunk)
        }
      )

      saveRefinementToHistory(result)
      setRefinements(prev => [result, ...prev])
      
      toast.success('Refinement complete!', {
        description: 'Follow-up response generated'
      })
      
      setShowRefinementDialog(false)
      setSelectedText('')
      setSelectionPosition(null)
      setFollowUpQuestion('')
      
    } catch (error) {
      console.error('Refinement error:', error)
      toast.error('Refinement failed', {
        description: 'Please try again'
      })
    } finally {
      setIsRefining(false)
      setStreamingResponse('')
    }
  }

  const suggestions = selectedText ? suggestFollowUpQuestions(selectedText) : []

  return (
    <div className="space-y-4">
      {/* Original Response */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="gap-1">
            <ChatCircleDots size={14} />
            Original Response
          </Badge>
          {refinements.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Tree size={14} />
              {refinements.length} refinement{refinements.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div
          ref={responseRef}
          onMouseUp={handleTextSelection}
          className="p-4 rounded-lg border border-border/50 bg-muted/20 cursor-text select-text hover:border-primary/30 transition-colors"
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {response}
          </p>
        </div>

        {/* Hint */}
        {!selectedText && !showRefinementDialog && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground mt-2 flex items-center gap-1"
          >
            <MagnifyingGlassPlus size={12} />
            Select any text to ask follow-up questions
          </motion.p>
        )}
      </div>

      {/* Selection Tooltip */}
      <AnimatePresence>
        {selectedText && selectionPosition && !showRefinementDialog && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              left: selectionPosition.x,
              top: selectionPosition.y,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 50
            }}
          >
            <Button
              onClick={handleRefinementClick}
              size="sm"
              className="shadow-lg"
            >
              <Sparkle size={14} className="mr-1" />
              Ask Follow-up
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refinement Dialog */}
      <AnimatePresence>
        {showRefinementDialog && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 rounded-lg border border-primary/50 bg-primary/5 space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkle size={16} className="text-primary" />
                  Follow-up Question
                </h3>
                <Button
                  onClick={() => {
                    setShowRefinementDialog(false)
                    setSelectedText('')
                    setSelectionPosition(null)
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
              
              {selectedText && (
                <div className="p-3 rounded-md bg-muted/50 border border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Selected text:</p>
                  <p className="text-sm italic">"{selectedText}"</p>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Quick suggestions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      variant="outline"
                      size="sm"
                      className="text-xs justify-start h-auto py-2 px-3"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Question */}
            <div className="space-y-2">
              <Textarea
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                placeholder="Ask your follow-up question..."
                className="min-h-[80px] resize-none"
                disabled={isRefining}
              />
              
              <Button
                onClick={handleSubmitRefinement}
                disabled={!followUpQuestion.trim() || isRefining}
                className="w-full"
              >
                {isRefining ? (
                  <>
                    <CircleNotch size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} className="mr-2" />
                    Get Answer
                  </>
                )}
              </Button>
            </div>

            {/* Streaming Response */}
            {streamingResponse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-lg border border-border/50 bg-background"
              >
                <Badge variant="outline" className="mb-3">
                  {ENGINE_CONFIGS[engine].name}
                </Badge>
                <p className="text-sm whitespace-pre-wrap">
                  {streamingResponse}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refinement History */}
      {refinements.length > 0 && !showRefinementDialog && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Tree size={16} />
            Follow-up Responses
          </h3>
          
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-4">
              {refinements.map((refinement, index) => (
                <motion.div
                  key={refinement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-border/50 bg-muted/10 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary">
                      Q: {refinement.question}
                    </p>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {ENGINE_CONFIGS[refinement.engine].name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {refinement.response}
                  </p>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
