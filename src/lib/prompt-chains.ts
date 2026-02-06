import { AIEngine } from './engines'
import { streamLLM } from './llm'
import { getParametersForEngine } from './model-parameters'

export interface PromptChainStep {
  id: string
  name: string
  prompt: string
  engine: AIEngine
  useOutputFrom?: string // ID of previous step to use output from
  transformOutput?: 'none' | 'summary' | 'extract' | 'validate'
  condition?: {
    type: 'always' | 'if-contains' | 'if-not-contains'
    value?: string
  }
}

export interface PromptChain {
  id: string
  name: string
  description: string
  steps: PromptChainStep[]
  createdAt: number
  updatedAt: number
}

export interface ChainExecutionResult {
  stepId: string
  stepName: string
  prompt: string
  response: string
  engine: AIEngine
  duration: number
  skipped: boolean
  error?: string
}

export interface ChainExecution {
  chainId: string
  results: ChainExecutionResult[]
  totalDuration: number
  success: boolean
  completedAt: number
}

export function createPromptChain(name: string, description: string): PromptChain {
  return {
    id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    steps: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

export function addChainStep(
  chain: PromptChain,
  name: string,
  prompt: string,
  engine: AIEngine,
  options?: {
    useOutputFrom?: string
    transformOutput?: 'none' | 'summary' | 'extract' | 'validate'
    condition?: PromptChainStep['condition']
  }
): PromptChain {
  const step: PromptChainStep = {
    id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    prompt,
    engine,
    useOutputFrom: options?.useOutputFrom,
    transformOutput: options?.transformOutput || 'none',
    condition: options?.condition || { type: 'always' }
  }
  
  return {
    ...chain,
    steps: [...chain.steps, step],
    updatedAt: Date.now()
  }
}

export async function executePromptChain(
  chain: PromptChain,
  initialInput: string,
  onStepComplete?: (result: ChainExecutionResult) => void
): Promise<ChainExecution> {
  const startTime = Date.now()
  const results: ChainExecutionResult[] = []
  const stepOutputs = new Map<string, string>()
  
  stepOutputs.set('initial', initialInput)
  
  for (const step of chain.steps) {
    // Check condition
    if (!shouldExecuteStep(step, stepOutputs)) {
      const skippedResult: ChainExecutionResult = {
        stepId: step.id,
        stepName: step.name,
        prompt: step.prompt,
        response: '',
        engine: step.engine,
        duration: 0,
        skipped: true
      }
      results.push(skippedResult)
      if (onStepComplete) onStepComplete(skippedResult)
      continue
    }
    
    const stepStart = Date.now()
    
    try {
      // Build prompt with previous output if needed
      let finalPrompt = step.prompt
      if (step.useOutputFrom) {
        const previousOutput = stepOutputs.get(step.useOutputFrom) || stepOutputs.get('initial') || ''
        finalPrompt = `${step.prompt}\n\n[Previous Output]:\n${previousOutput}`
      }
      
      const params = getParametersForEngine(step.engine)
      const response = await streamLLM(finalPrompt, step.engine, () => {}, params)
      
      // Transform output if needed
      const transformedOutput = await transformOutput(response, step.transformOutput, step.engine)
      
      stepOutputs.set(step.id, transformedOutput)
      
      const result: ChainExecutionResult = {
        stepId: step.id,
        stepName: step.name,
        prompt: finalPrompt,
        response: transformedOutput,
        engine: step.engine,
        duration: Date.now() - stepStart,
        skipped: false
      }
      
      results.push(result)
      if (onStepComplete) onStepComplete(result)
      
    } catch (error) {
      const errorResult: ChainExecutionResult = {
        stepId: step.id,
        stepName: step.name,
        prompt: step.prompt,
        response: '',
        engine: step.engine,
        duration: Date.now() - stepStart,
        skipped: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      results.push(errorResult)
      if (onStepComplete) onStepComplete(errorResult)
      break // Stop chain on error
    }
  }
  
  return {
    chainId: chain.id,
    results,
    totalDuration: Date.now() - startTime,
    success: results.every(r => !r.error),
    completedAt: Date.now()
  }
}

function shouldExecuteStep(step: PromptChainStep, outputs: Map<string, string>): boolean {
  if (!step.condition || step.condition.type === 'always') {
    return true
  }
  
  const previousOutput = step.useOutputFrom 
    ? outputs.get(step.useOutputFrom) || ''
    : outputs.get('initial') || ''
  
  if (step.condition.type === 'if-contains') {
    return previousOutput.toLowerCase().includes((step.condition.value || '').toLowerCase())
  }
  
  if (step.condition.type === 'if-not-contains') {
    return !previousOutput.toLowerCase().includes((step.condition.value || '').toLowerCase())
  }
  
  return true
}

async function transformOutput(
  output: string,
  transform: PromptChainStep['transformOutput'],
  engine: AIEngine
): Promise<string> {
  if (transform === 'none') return output
  
  if (transform === 'summary') {
    const summaryPrompt = `Summarize the following text in 2-3 sentences:\n\n${output}`
    return await streamLLM(summaryPrompt, engine, () => {})
  }
  
  if (transform === 'extract') {
    const extractPrompt = `Extract only the key facts and numbers from this text:\n\n${output}`
    return await streamLLM(extractPrompt, engine, () => {})
  }
  
  if (transform === 'validate') {
    const validatePrompt = `Review this text for accuracy and flag any potential issues:\n\n${output}`
    return await streamLLM(validatePrompt, engine, () => {})
  }
  
  return output
}

const CHAINS_KEY = 'prompt_chains'

export function getAllChains(): PromptChain[] {
  try {
    const stored = localStorage.getItem(CHAINS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

export function saveChain(chain: PromptChain): void {
  try {
    const chains = getAllChains()
    const existing = chains.findIndex(c => c.id === chain.id)
    
    if (existing >= 0) {
      chains[existing] = chain
    } else {
      chains.unshift(chain)
    }
    
    localStorage.setItem(CHAINS_KEY, JSON.stringify(chains.slice(0, 50)))
  } catch (error) {
    console.error('Failed to save chain:', error)
  }
}

export function deleteChain(id: string): void {
  try {
    const chains = getAllChains().filter(c => c.id !== id)
    localStorage.setItem(CHAINS_KEY, JSON.stringify(chains))
  } catch (error) {
    console.error('Failed to delete chain:', error)
  }
}

export function exportChain(chain: PromptChain): void {
  const json = JSON.stringify(chain, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chain-${chain.name.toLowerCase().replace(/\s+/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importChain(jsonString: string): PromptChain {
  const chain = JSON.parse(jsonString)
  return {
    ...chain,
    id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}
