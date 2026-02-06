import { streamLLM } from './llm'
import { AIEngine } from './engines'

export interface DebateArgument {
  engine: AIEngine
  position: string
  arguments: string
  timestamp: number
}

export interface DebateSynthesis {
  summary: string
  consensus: string
  keyPoints: string[]
  recommendation: string
}

export async function runDebate(
  question: string,
  engines: AIEngine[],
  onArgumentUpdate: (engine: AIEngine, partial: string) => void
): Promise<Map<AIEngine, string>> {
  const results = new Map<AIEngine, string>()
  
  // Run all debates in parallel
  const promises = engines.map(async (engine) => {
    const debatePrompt = `You are participating in a multi-AI debate. Present your perspective on this question:

QUESTION: ${question}

Provide a well-reasoned argument with:
1. Your main position
2. 2-3 supporting arguments
3. Potential counterarguments you've considered

Be concise but compelling. Aim for 200-300 words.`

    const response = await streamLLM(
      debatePrompt,
      engine,
      (chunk) => onArgumentUpdate(engine, chunk)
    )
    
    results.set(engine, response)
    return response
  })
  
  await Promise.all(promises)
  return results
}

export async function synthesizeDebate(
  question: string,
  debateArgs: Map<AIEngine, string>
): Promise<DebateSynthesis> {
  const argumentsText = Array.from(debateArgs.entries())
    .map(([engine, arg]) => `**${engine}:**\n${arg}`)
    .join('\n\n---\n\n')
  
  const synthesisPrompt = `You are a neutral moderator synthesizing a multi-AI debate.

QUESTION DEBATED:
${question}

ARGUMENTS FROM DIFFERENT AIs:
${argumentsText}

Provide a synthesis in valid JSON format (no markdown, no code blocks):
{
  "summary": "<2-3 sentence summary of the debate>",
  "consensus": "<what all AIs agreed on>",
  "keyPoints": ["<key point 1>", "<key point 2>", "<key point 3>"],
  "recommendation": "<balanced recommendation based on all perspectives>"
}`

  try {
    const result = await streamLLM(synthesisPrompt, 'gpt-4o', () => {})
    
    let cleanedResult = result.trim()
    if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    
    const parsed = JSON.parse(cleanedResult)
    
    return {
      summary: parsed.summary || 'Multiple perspectives were presented.',
      consensus: parsed.consensus || 'The AIs presented different viewpoints.',
      keyPoints: parsed.keyPoints || [],
      recommendation: parsed.recommendation || 'Consider all perspectives when making your decision.'
    }
  } catch (error) {
    console.error('Synthesis failed:', error)
    return {
      summary: 'Multiple AI models presented different perspectives on this question.',
      consensus: 'Each AI brought unique insights to the discussion.',
      keyPoints: ['Review each argument individually', 'Consider the evidence presented', 'Make an informed decision'],
      recommendation: 'Evaluate all perspectives and decide based on your specific context and needs.'
    }
  }
}

// Vote on best argument
export async function voteOnArguments(
  question: string,
  debateArgs: Map<AIEngine, string>
): Promise<Map<AIEngine, number>> {
  const votes = new Map<AIEngine, number>()
  
  const argumentsText = Array.from(debateArgs.entries())
    .map(([engine, arg], index) => `ARGUMENT ${index + 1} (${engine}):\n${arg}`)
    .join('\n\n---\n\n')
  
  const votingPrompt = `You are judging a debate. Rate each argument on a scale of 1-10 based on:
- Logical coherence
- Supporting evidence
- Consideration of counterarguments
- Clarity and persuasiveness

QUESTION: ${question}

ARGUMENTS:
${argumentsText}

Respond with ONLY a JSON array of scores (no markdown):
[<score for argument 1>, <score for argument 2>, <score for argument 3>, ...]`

  try {
    const result = await streamLLM(votingPrompt, 'gpt-4o', () => {})
    
    let cleanedResult = result.trim()
    if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    
    const scores = JSON.parse(cleanedResult)
    
    Array.from(debateArgs.keys()).forEach((engine, index) => {
      votes.set(engine, scores[index] || 5)
    })
    
    return votes
  } catch (error) {
    console.error('Voting failed:', error)
    // Return neutral scores
    debateArgs.forEach((_, engine) => votes.set(engine, 7))
    return votes
  }
}
