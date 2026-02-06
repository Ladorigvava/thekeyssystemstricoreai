import { callLLM } from './llm'

export interface PromptOptimization {
  original: string
  optimized: string
  improvements: string[]
  qualityPrediction: {
    before: number
    after: number
    improvement: number
  }
  reasoning: string
}

export async function optimizePrompt(prompt: string): Promise<PromptOptimization> {
  const optimizationPrompt = `You are an expert prompt engineer. Analyze and improve the following prompt for AI interactions.

ORIGINAL PROMPT:
${prompt}

Provide your analysis in valid JSON format (no markdown, no code blocks):
{
  "optimized": "<improved version of the prompt>",
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "qualityPrediction": {
    "before": <score 1-10>,
    "after": <score 1-10>,
    "improvement": <percentage improvement>
  },
  "reasoning": "<brief explanation of why these changes improve the prompt>"
}

Focus on:
- Clarity and specificity
- Proper context and constraints
- Actionable instructions
- Structured output requests
- Removing ambiguity`

  try {
    const result = await callLLM(optimizationPrompt, 'gpt-4o')
    
    // Clean up response - remove markdown code blocks if present
    let cleanedResult = result.trim()
    if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    
    const parsed = JSON.parse(cleanedResult)
    
    return {
      original: prompt,
      optimized: parsed.optimized,
      improvements: parsed.improvements || [],
      qualityPrediction: {
        before: parsed.qualityPrediction?.before || 5,
        after: parsed.qualityPrediction?.after || 8,
        improvement: parsed.qualityPrediction?.improvement || 60
      },
      reasoning: parsed.reasoning || 'Prompt optimized for clarity and specificity'
    }
  } catch (error) {
    console.error('Prompt optimization failed:', error)
    
    // Fallback: provide basic improvements
    return {
      original: prompt,
      optimized: prompt,
      improvements: [
        'Consider adding more specific details',
        'Define the expected output format',
        'Provide relevant context or constraints'
      ],
      qualityPrediction: {
        before: 5,
        after: 5,
        improvement: 0
      },
      reasoning: 'Unable to optimize at this time. Try being more specific in your prompt.'
    }
  }
}

// Quick prompt improvement tips
export const PROMPT_TIPS = [
  {
    category: 'Clarity',
    tip: 'Be specific about what you want',
    example: 'Instead of "Write about dogs", try "Write a 500-word article about dog training techniques for puppies"'
  },
  {
    category: 'Context',
    tip: 'Provide relevant background',
    example: 'Instead of "Fix this code", try "Fix this Python function that should calculate Fibonacci numbers but returns wrong values"'
  },
  {
    category: 'Format',
    tip: 'Specify output structure',
    example: 'Instead of "List benefits", try "List 5 benefits in bullet points with brief explanations"'
  },
  {
    category: 'Constraints',
    tip: 'Set clear boundaries',
    example: 'Instead of "Explain quantum physics", try "Explain quantum entanglement in 3 paragraphs for a high school student"'
  },
  {
    category: 'Examples',
    tip: 'Show what you want',
    example: 'Include "For example: [your example]" to guide the AI\'s style and format'
  }
]

// Detect common prompt issues
export function analyzePromptIssues(prompt: string): string[] {
  const issues: string[] = []
  
  if (prompt.length < 10) {
    issues.push('Prompt is very short - consider adding more detail')
  }
  
  if (!prompt.includes('?') && prompt.split(' ').length < 5) {
    issues.push('Try phrasing as a clear question or instruction')
  }
  
  if (prompt.toLowerCase().includes('write') && !prompt.match(/\d+\s*(word|paragraph|page|sentence)/i)) {
    issues.push('Specify desired length (e.g., "200 words", "3 paragraphs")')
  }
  
  if (!prompt.match(/\b(list|explain|analyze|compare|summarize|create|write|describe)\b/i)) {
    issues.push('Start with a clear action verb (explain, analyze, list, etc.)')
  }
  
  if (prompt.length > 500) {
    issues.push('Prompt is very long - consider breaking into multiple focused questions')
  }
  
  return issues
}
