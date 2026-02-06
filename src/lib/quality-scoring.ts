import { callLLM } from './llm'
import { AIEngine } from './engines'

// Quality scoring dimensions
export interface QualityScore {
  overall: number // 1-10 overall score
  clarity: number // 1-10 how clear and understandable
  accuracy: number // 1-10 perceived correctness
  usefulness: number // 1-10 practical value
  depth: number // 1-10 thoroughness and detail
  creativity: number // 1-10 originality and insight
  explanation: string // Brief explanation of the scores
  strengths: string[] // Key strengths identified
  improvements: string[] // Suggested improvements
  timestamp: number
}

// Score history for tracking
export interface ScoredResponse {
  id: string
  input: string
  output: string
  engine: string
  score: QualityScore
  timestamp: number
}

// Get quality score from AI
export async function scoreResponse(
  input: string,
  output: string,
  engine: string = 'gpt-4o'
): Promise<QualityScore> {
  const scoringPrompt = `You are an expert AI response evaluator. Analyze the following AI-generated response and provide detailed quality scores.

USER INPUT:
${input}

AI RESPONSE:
${output}

Evaluate this response on 5 dimensions (score each 1-10):
1. **Clarity**: How clear, well-structured, and easy to understand is the response?
2. **Accuracy**: How correct and reliable does the information appear to be?
3. **Usefulness**: How practical and valuable is this response for the user?
4. **Depth**: How thorough and detailed is the analysis?
5. **Creativity**: How original and insightful are the ideas presented?

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "clarity": <number 1-10>,
  "accuracy": <number 1-10>,
  "usefulness": <number 1-10>,
  "depth": <number 1-10>,
  "creativity": <number 1-10>,
  "explanation": "<brief 1-2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`

  try {
    const result = await callLLM(scoringPrompt, engine as AIEngine)
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedResult = result.trim()
    if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    
    const parsed = JSON.parse(cleanedResult)
    
    // Calculate overall score as weighted average
    const overall = (
      parsed.clarity * 0.25 +
      parsed.accuracy * 0.25 +
      parsed.usefulness * 0.20 +
      parsed.depth * 0.15 +
      parsed.creativity * 0.15
    )
    
    return {
      overall: Math.round(overall * 10) / 10,
      clarity: parsed.clarity,
      accuracy: parsed.accuracy,
      usefulness: parsed.usefulness,
      depth: parsed.depth,
      creativity: parsed.creativity,
      explanation: parsed.explanation,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Failed to score response:', error)
    
    // Fallback to basic heuristic scoring
    return {
      overall: 7.0,
      clarity: 7,
      accuracy: 7,
      usefulness: 7,
      depth: 7,
      creativity: 7,
      explanation: 'Unable to generate detailed scoring. Using default estimates.',
      strengths: ['Response generated successfully'],
      improvements: ['Consider requesting a more detailed analysis'],
      timestamp: Date.now()
    }
  }
}

// Get color based on score
export function getScoreColor(score: number): string {
  if (score >= 8.5) return 'text-emerald-400'
  if (score >= 7.0) return 'text-green-400'
  if (score >= 5.5) return 'text-yellow-400'
  if (score >= 4.0) return 'text-orange-400'
  return 'text-red-400'
}

// Get badge variant based on score
export function getScoreBadge(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 8.5) return 'default'
  if (score >= 7.0) return 'secondary'
  if (score >= 5.5) return 'outline'
  return 'destructive'
}

// Get performance label
export function getScoreLabel(score: number): string {
  if (score >= 9.0) return 'Outstanding'
  if (score >= 8.0) return 'Excellent'
  if (score >= 7.0) return 'Very Good'
  if (score >= 6.0) return 'Good'
  if (score >= 5.0) return 'Average'
  if (score >= 4.0) return 'Below Average'
  return 'Poor'
}

// Store scored response in localStorage
export function saveScoredResponse(scoredResponse: ScoredResponse): void {
  try {
    const stored = localStorage.getItem('scored-responses')
    const responses: ScoredResponse[] = stored ? JSON.parse(stored) : []
    
    // Keep only last 100 scored responses
    if (responses.length >= 100) {
      responses.shift()
    }
    
    responses.push(scoredResponse)
    localStorage.setItem('scored-responses', JSON.stringify(responses))
  } catch (error) {
    console.error('Failed to save scored response:', error)
  }
}

// Get all scored responses
export function getScoredResponses(): ScoredResponse[] {
  try {
    const stored = localStorage.getItem('scored-responses')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load scored responses:', error)
    return []
  }
}

// Get average scores by engine
export function getAverageScoresByEngine(): Record<string, {
  count: number
  avgOverall: number
  avgClarity: number
  avgAccuracy: number
  avgUsefulness: number
  avgDepth: number
  avgCreativity: number
}> {
  const responses = getScoredResponses()
  
  // Single-pass aggregation for better performance
  const engineStats: Record<string, {
    count: number
    totalOverall: number
    totalClarity: number
    totalAccuracy: number
    totalUsefulness: number
    totalDepth: number
    totalCreativity: number
  }> = {}
  
  for (const r of responses) {
    if (!engineStats[r.engine]) {
      engineStats[r.engine] = {
        count: 0,
        totalOverall: 0,
        totalClarity: 0,
        totalAccuracy: 0,
        totalUsefulness: 0,
        totalDepth: 0,
        totalCreativity: 0
      }
    }
    
    const stats = engineStats[r.engine]
    stats.count++
    stats.totalOverall += r.score.overall
    stats.totalClarity += r.score.clarity
    stats.totalAccuracy += r.score.accuracy
    stats.totalUsefulness += r.score.usefulness
    stats.totalDepth += r.score.depth
    stats.totalCreativity += r.score.creativity
  }
  
  // Convert totals to averages
  const averages: Record<string, {
    count: number
    avgOverall: number
    avgClarity: number
    avgAccuracy: number
    avgUsefulness: number
    avgDepth: number
    avgCreativity: number
  }> = {}
  
  for (const engine of Object.keys(engineStats)) {
    const stats = engineStats[engine]
    averages[engine] = {
      count: stats.count,
      avgOverall: stats.totalOverall / stats.count,
      avgClarity: stats.totalClarity / stats.count,
      avgAccuracy: stats.totalAccuracy / stats.count,
      avgUsefulness: stats.totalUsefulness / stats.count,
      avgDepth: stats.totalDepth / stats.count,
      avgCreativity: stats.totalCreativity / stats.count
    }
  }
  
  return averages
}

// Get top performing engines
export function getTopPerformingEngines(limit: number = 5): Array<{
  engine: string
  avgScore: number
  count: number
}> {
  const averages = getAverageScoresByEngine()
  
  return Object.entries(averages)
    .map(([engine, stats]) => ({
      engine,
      avgScore: stats.avgOverall,
      count: stats.count
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, limit)
}

// Clear all scored responses
export function clearScoredResponses(): void {
  try {
    localStorage.removeItem('scored-responses')
  } catch (error) {
    console.error('Failed to clear scored responses:', error)
  }
}
