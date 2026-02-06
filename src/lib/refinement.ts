import { AIEngine } from './engines'
import { streamLLM } from './llm'
import { ModelParameters, getParametersForEngine } from './model-parameters'

export interface RefinementContext {
  id: string
  originalPrompt: string
  originalResponse: string
  selectedText: string
  selectedIndex: number
  timestamp: number
}

export interface RefinementRequest {
  context: RefinementContext
  followUpQuestion: string
  engine: AIEngine
}

export interface RefinementResult {
  id: string
  contextId: string
  question: string
  response: string
  engine: AIEngine
  timestamp: number
}

/**
 * Generate a contextual follow-up prompt that preserves the conversation context
 */
export function buildRefinementPrompt(
  originalPrompt: string,
  originalResponse: string,
  selectedText: string,
  followUpQuestion: string
): string {
  return `You are helping refine a previous response. Here's the context:

ORIGINAL QUESTION:
${originalPrompt}

PREVIOUS FULL RESPONSE:
${originalResponse}

USER SELECTED THIS PART:
"${selectedText}"

NEW FOLLOW-UP QUESTION:
${followUpQuestion}

Please provide a focused response to the follow-up question while maintaining awareness of the full context. Be specific and reference the selected text when relevant.`
}

/**
 * Execute a refinement request with streaming support
 */
export async function refineResponse(
  request: RefinementRequest,
  onChunk?: (chunk: string) => void
): Promise<RefinementResult> {
  const { context, followUpQuestion, engine } = request
  
  const refinementPrompt = buildRefinementPrompt(
    context.originalPrompt,
    context.originalResponse,
    context.selectedText,
    followUpQuestion
  )
  
  const params = getParametersForEngine(engine)
  
  const response = await streamLLM(
    refinementPrompt,
    engine,
    onChunk || (() => {}),
    params
  )
  
  return {
    id: generateId(),
    contextId: context.id,
    question: followUpQuestion,
    response,
    engine,
    timestamp: Date.now()
  }
}

/**
 * Smart text selection - expand to sentence or paragraph boundaries
 */
export function expandSelection(text: string, startIndex: number, endIndex: number): {
  text: string
  start: number
  end: number
} {
  // Expand to sentence boundaries (., !, ?)
  let start = startIndex
  let end = endIndex
  
  // Expand backwards to sentence start
  while (start > 0 && !isSentenceEnd(text[start - 1])) {
    start--
  }
  
  // Expand forwards to sentence end
  while (end < text.length && !isSentenceEnd(text[end])) {
    end++
  }
  
  // Include the punctuation
  if (end < text.length && isSentenceEnd(text[end])) {
    end++
  }
  
  return {
    text: text.substring(start, end).trim(),
    start,
    end
  }
}

function isSentenceEnd(char: string): boolean {
  return char === '.' || char === '!' || char === '?' || char === '\n'
}

/**
 * Generate a unique ID for refinement tracking
 */
function generateId(): string {
  return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Store refinement history in localStorage
 */
const STORAGE_KEY = 'refinement_history'
const MAX_HISTORY = 50

export function saveRefinementToHistory(result: RefinementResult): void {
  try {
    const history = getRefinementHistory()
    history.unshift(result)
    
    // Keep only the most recent items
    const trimmed = history.slice(0, MAX_HISTORY)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to save refinement to history:', error)
  }
}

export function getRefinementHistory(): RefinementResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load refinement history:', error)
    return []
  }
}

export function getRefinementsByContext(contextId: string): RefinementResult[] {
  const history = getRefinementHistory()
  return history.filter(r => r.contextId === contextId)
}

export function clearRefinementHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear refinement history:', error)
  }
}

/**
 * Suggest contextual follow-up questions based on selected text
 */
export function suggestFollowUpQuestions(selectedText: string): string[] {
  const suggestions: string[] = []
  
  // Analyze the selected text to generate smart suggestions
  if (selectedText.length < 20) {
    suggestions.push(`Can you explain "${selectedText}" in more detail?`)
    suggestions.push(`What are some examples of ${selectedText}?`)
  } else {
    suggestions.push('Can you expand on this point?')
    suggestions.push('What are the practical implications of this?')
    suggestions.push('Are there any counterarguments to this?')
  }
  
  // Always include these generic ones
  suggestions.push('Can you simplify this explanation?')
  suggestions.push('What are the key takeaways here?')
  
  return suggestions.slice(0, 4) // Return top 4 suggestions
}
