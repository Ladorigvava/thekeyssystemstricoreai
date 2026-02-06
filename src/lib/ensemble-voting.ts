import { AIEngine, ENGINE_CONFIGS } from './engines'
import { streamLLM } from './llm'
import { getParametersForEngine } from './model-parameters'

export interface EnsembleResponse {
  engine: AIEngine
  response: string
  timestamp: number
}

export interface JudgeVote {
  engine: AIEngine
  votedFor: AIEngine
  score: number // 1-10
  reasoning: string
  confidence: number // 0-100%
}

export interface EnsembleResult {
  question: string
  responses: EnsembleResponse[]
  votes: JudgeVote[]
  winner: AIEngine
  winnerScore: number
  winnerResponse: string
  consensus: string
  timestamp: number
}

/**
 * Run ensemble voting: multiple engines answer, AI judges vote on best
 */
export async function runEnsembleVoting(
  question: string,
  engines: AIEngine[],
  judgeEngines: AIEngine[],
  onResponseUpdate: (engine: AIEngine, partial: string) => void,
  onVoteUpdate?: (vote: JudgeVote) => void
): Promise<EnsembleResult> {
  if (engines.length < 3) {
    throw new Error('Ensemble voting requires at least 3 engines')
  }
  
  // Phase 1: Get responses from all engines in parallel
  const responsesMap = new Map<AIEngine, string>()
  
  const responsePromises = engines.map(async (engine) => {
    const params = getParametersForEngine(engine)
    const response = await streamLLM(
      question,
      engine,
      (chunk) => onResponseUpdate(engine, chunk),
      params
    )
    responsesMap.set(engine, response)
    return { engine, response, timestamp: Date.now() }
  })
  
  const responses = await Promise.all(responsePromises)
  
  // Phase 2: Have judges vote on the best response
  const votes: JudgeVote[] = []
  
  const responsesText = responses
    .map((r, i) => `**Response ${i + 1} (from ${ENGINE_CONFIGS[r.engine].name}):**\n${r.response}`)
    .join('\n\n---\n\n')
  
  const votePromises = judgeEngines.map(async (judgeEngine) => {
    const votePrompt = `You are an AI judge evaluating multiple AI responses to select the best one.

QUESTION:
${question}

RESPONSES TO EVALUATE:
${responsesText}

Evaluate each response on:
- Accuracy and correctness
- Completeness and depth
- Clarity and structure
- Usefulness and practicality
- Overall quality

Return your verdict in valid JSON format (no markdown, no code blocks):
{
  "votedFor": <response number 1-${responses.length}>,
  "score": <score from 1-10>,
  "reasoning": "<2-3 sentence explanation of why this response is best>",
  "confidence": <confidence percentage 0-100>
}`

    try {
      const voteResponse = await streamLLM(votePrompt, judgeEngine, () => {})
      
      let cleanedResponse = voteResponse.trim()
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      
      const voteData = JSON.parse(cleanedResponse)
      const votedForEngine = responses[voteData.votedFor - 1].engine
      
      const vote: JudgeVote = {
        engine: judgeEngine,
        votedFor: votedForEngine,
        score: voteData.score,
        reasoning: voteData.reasoning,
        confidence: voteData.confidence
      }
      
      votes.push(vote)
      if (onVoteUpdate) {
        onVoteUpdate(vote)
      }
      
      return vote
    } catch (error) {
      console.error(`Vote error from ${judgeEngine}:`, error)
      // Fallback vote
      const fallbackVote: JudgeVote = {
        engine: judgeEngine,
        votedFor: responses[0].engine,
        score: 5,
        reasoning: 'Error occurred during voting',
        confidence: 0
      }
      votes.push(fallbackVote)
      if (onVoteUpdate) {
        onVoteUpdate(fallbackVote)
      }
      return fallbackVote
    }
  })
  
  await Promise.all(votePromises)
  
  // Determine winner based on weighted votes
  const scoresByEngine = new Map<AIEngine, { totalScore: number; voteCount: number }>()
  
  votes.forEach(vote => {
    const current = scoresByEngine.get(vote.votedFor) || { totalScore: 0, voteCount: 0 }
    // Weight by confidence
    const weightedScore = (vote.score * vote.confidence) / 100
    scoresByEngine.set(vote.votedFor, {
      totalScore: current.totalScore + weightedScore,
      voteCount: current.voteCount + 1
    })
  })
  
  let winner: AIEngine = engines[0]
  let winnerScore = 0
  
  scoresByEngine.forEach((data, engine) => {
    const avgScore = data.totalScore / data.voteCount
    if (avgScore > winnerScore) {
      winnerScore = avgScore
      winner = engine
    }
  })
  
  // Generate consensus summary
  const consensus = await generateConsensus(question, responses, votes, winner)
  
  return {
    question,
    responses,
    votes,
    winner,
    winnerScore,
    winnerResponse: responsesMap.get(winner) || '',
    consensus,
    timestamp: Date.now()
  }
}

async function generateConsensus(
  question: string,
  responses: EnsembleResponse[],
  votes: JudgeVote[],
  winner: AIEngine
): Promise<string> {
  const voteSummary = votes
    .map(v => `- ${ENGINE_CONFIGS[v.engine].name} voted for ${ENGINE_CONFIGS[v.votedFor].name} (${v.score}/10, ${v.confidence}% confident): ${v.reasoning}`)
    .join('\n')
  
  const consensusPrompt = `Synthesize the ensemble voting results into a consensus statement.

QUESTION: ${question}

WINNER: ${ENGINE_CONFIGS[winner].name}

VOTE SUMMARY:
${voteSummary}

Create a 2-3 sentence consensus that explains:
1. Why ${ENGINE_CONFIGS[winner].name}'s response won
2. What the judges valued most
3. Key strengths of the winning response`

  const consensus = await streamLLM(consensusPrompt, 'gpt-4o', () => {})
  return consensus.trim()
}

/**
 * Get vote distribution statistics
 */
export function getVoteDistribution(votes: JudgeVote[]): Map<AIEngine, number> {
  const distribution = new Map<AIEngine, number>()
  votes.forEach(vote => {
    distribution.set(vote.votedFor, (distribution.get(vote.votedFor) || 0) + 1)
  })
  return distribution
}

/**
 * Get average confidence across all votes
 */
export function getAverageConfidence(votes: JudgeVote[]): number {
  if (votes.length === 0) return 0
  const total = votes.reduce((sum, vote) => sum + vote.confidence, 0)
  return total / votes.length
}

/**
 * Get highest-confidence vote
 */
export function getHighestConfidenceVote(votes: JudgeVote[]): JudgeVote | null {
  if (votes.length === 0) return null
  return votes.reduce((highest, vote) => 
    vote.confidence > highest.confidence ? vote : highest
  )
}
