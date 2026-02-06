import { AIEngine } from './engines'
import { streamLLM } from './llm'

export interface ResearchStep {
  id: string
  question: string
  engine: AIEngine
  response: string
  status: 'pending' | 'running' | 'complete' | 'error'
  timestamp: number
  error?: string
}

export interface ResearchPlan {
  topic: string
  steps: ResearchStep[]
  createdAt: number
}

export interface ResearchReport {
  topic: string
  executiveSummary: string
  findings: ResearchStep[]
  synthesis: string
  recommendations: string[]
  sources: string[]
  timestamp: number
}

/**
 * Generate a multi-step research plan using AI
 */
export async function generateResearchPlan(
  topic: string,
  depth: 'quick' | 'standard' | 'comprehensive' = 'standard'
): Promise<ResearchPlan> {
  const stepCount = depth === 'quick' ? 3 : depth === 'standard' ? 5 : 8
  
  const planPrompt = `You are a research strategist. Create a ${depth} research plan for this topic:

TOPIC: ${topic}

Generate exactly ${stepCount} specific research questions that will comprehensively explore this topic. Each question should:
- Build on previous questions
- Cover different angles (what, why, how, implications, alternatives, future)
- Be specific and answerable

Return ONLY a JSON array of questions, no markdown, no explanation:
["question 1", "question 2", ...]`

  const response = await streamLLM(planPrompt, 'gpt-4o', () => {})
  
  let cleanedResponse = response.trim()
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  
  const questions = JSON.parse(cleanedResponse) as string[]
  
  // Assign engines in rotation
  const engines: AIEngine[] = ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-2.0-flash-thinking-exp', 'gpt-4o-mini', 'claude-3-5-haiku-20241022']
  
  const steps: ResearchStep[] = questions.map((question, index) => ({
    id: `step_${index}`,
    question,
    engine: engines[index % engines.length],
    response: '',
    status: 'pending' as const,
    timestamp: Date.now()
  }))
  
  return {
    topic,
    steps,
    createdAt: Date.now()
  }
}

/**
 * Execute research plan autonomously
 */
export async function executeResearchPlan(
  plan: ResearchPlan,
  onStepUpdate: (step: ResearchStep) => void
): Promise<ResearchReport> {
  const findings: ResearchStep[] = []
  
  // Execute steps sequentially (each builds on previous)
  for (const step of plan.steps) {
    const updatedStep = { ...step, status: 'running' as const }
    onStepUpdate(updatedStep)
    
    try {
      // Build context from previous findings
      const context = findings.length > 0
        ? `\n\nPREVIOUS FINDINGS:\n${findings.map((f, i) => `${i + 1}. ${f.question}\n${f.response.substring(0, 200)}...`).join('\n\n')}`
        : ''
      
      const researchPrompt = `You are conducting research on: ${plan.topic}

RESEARCH QUESTION: ${step.question}${context}

Provide a thorough, well-researched answer. Include:
- Key facts and data
- Multiple perspectives
- Evidence and reasoning
- Relevant examples
- Important nuances or caveats

Be comprehensive but focused.`
      
      const response = await streamLLM(
        researchPrompt,
        step.engine,
        (chunk) => {
          onStepUpdate({ ...updatedStep, response: updatedStep.response + chunk })
        }
      )
      
      const completedStep = {
        ...step,
        response,
        status: 'complete' as const,
        timestamp: Date.now()
      }
      
      findings.push(completedStep)
      onStepUpdate(completedStep)
      
    } catch (error) {
      const errorStep = {
        ...step,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
      findings.push(errorStep)
      onStepUpdate(errorStep)
    }
  }
  
  // Generate synthesis
  const synthesis = await synthesizeResearch(plan.topic, findings)
  
  return {
    topic: plan.topic,
    executiveSummary: synthesis.summary,
    findings,
    synthesis: synthesis.fullSynthesis,
    recommendations: synthesis.recommendations,
    sources: synthesis.sources,
    timestamp: Date.now()
  }
}

async function synthesizeResearch(topic: string, findings: ResearchStep[]): Promise<{
  summary: string
  fullSynthesis: string
  recommendations: string[]
  sources: string[]
}> {
  const findingsText = findings
    .filter(f => f.status === 'complete')
    .map((f, i) => `**Q${i + 1}: ${f.question}**\n${f.response}`)
    .join('\n\n---\n\n')
  
  const synthesisPrompt = `You are synthesizing research on: ${topic}

RESEARCH FINDINGS:
${findingsText}

Create a comprehensive synthesis in valid JSON format (no markdown, no code blocks):
{
  "summary": "<2-3 sentence executive summary>",
  "fullSynthesis": "<comprehensive synthesis integrating all findings, 3-4 paragraphs>",
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "sources": ["<key source or reference 1>", "<source 2>", "<source 3>"]
}`

  const response = await streamLLM(synthesisPrompt, 'gpt-4o', () => {})
  
  let cleanedResponse = response.trim()
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  
  return JSON.parse(cleanedResponse)
}

/**
 * Export research report as markdown
 */
export function exportResearchReport(report: ResearchReport): void {
  const markdown = `# Research Report: ${report.topic}

**Generated:** ${new Date(report.timestamp).toLocaleString()}

## Executive Summary

${report.executiveSummary}

## Research Findings

${report.findings.map((f, i) => `### ${i + 1}. ${f.question}

**Engine:** ${f.engine}
**Status:** ${f.status}

${f.response}
`).join('\n\n')}

## Synthesis

${report.synthesis}

## Recommendations

${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Key Sources

${report.sources.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

*Generated by The Keys System - Autonomous Research Agent*`

  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `research-${report.topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
}
