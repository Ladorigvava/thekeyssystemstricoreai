import { AIEngine } from './engines'
import { streamLLM } from './llm'
import { getParametersForEngine } from './model-parameters'

export interface BatchPrompt {
  id: string
  prompt: string
  variables?: Record<string, string>
}

export interface BatchResult {
  id: string
  prompt: string
  response: string
  engine: AIEngine
  status: 'pending' | 'processing' | 'complete' | 'error'
  error?: string
  timestamp: number
  duration: number
  tokens?: number
  cost?: number
}

export interface BatchJob {
  id: string
  name: string
  prompts: BatchPrompt[]
  results: BatchResult[]
  engine: AIEngine
  status: 'pending' | 'running' | 'paused' | 'complete' | 'failed'
  progress: number
  createdAt: number
  startedAt?: number
  completedAt?: number
  totalCost: number
}

/**
 * Parse CSV into batch prompts
 */
export function parseCSV(csvContent: string, promptColumn: string, variableColumns: string[]): BatchPrompt[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const promptColIndex = headers.indexOf(promptColumn)
  
  if (promptColIndex === -1) {
    throw new Error(`Column "${promptColumn}" not found in CSV`)
  }
  
  const varIndices = variableColumns.map(col => {
    const index = headers.indexOf(col)
    if (index === -1) throw new Error(`Column "${col}" not found in CSV`)
    return { col, index }
  })
  
  const prompts: BatchPrompt[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    
    const variables: Record<string, string> = {}
    varIndices.forEach(({ col, index }) => {
      variables[col] = values[index] || ''
    })
    
    prompts.push({
      id: `prompt_${i}_${Date.now()}`,
      prompt: values[promptColIndex] || '',
      variables
    })
  }
  
  return prompts
}

/**
 * Apply variable substitution to prompt template
 */
export function applyVariables(template: string, variables: Record<string, string>): string {
  let result = template
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, value)
  })
  
  return result
}

/**
 * Execute batch job
 */
export async function executeBatchJob(
  job: BatchJob,
  onProgress: (job: BatchJob) => void,
  onResult: (result: BatchResult) => void
): Promise<BatchJob> {
  let updatedJob: BatchJob = {
    ...job,
    status: 'running',
    startedAt: Date.now(),
    results: []
  }
  
  onProgress(updatedJob)
  
  for (let i = 0; i < job.prompts.length; i++) {
    const prompt = job.prompts[i]
    
    const result: BatchResult = {
      id: prompt.id,
      prompt: prompt.prompt,
      response: '',
      engine: job.engine,
      status: 'processing',
      timestamp: Date.now(),
      duration: 0
    }
    
    onResult(result)
    
    try {
      const startTime = Date.now()
      const finalPrompt = prompt.variables 
        ? applyVariables(prompt.prompt, prompt.variables)
        : prompt.prompt
      
      const params = getParametersForEngine(job.engine)
      const response = await streamLLM(finalPrompt, job.engine, () => {}, params)
      
      const duration = Date.now() - startTime
      
      const completedResult: BatchResult = {
        ...result,
        response,
        status: 'complete',
        duration,
        timestamp: Date.now()
      }
      
      updatedJob.results.push(completedResult)
      updatedJob.progress = ((i + 1) / job.prompts.length) * 100
      
      onResult(completedResult)
      onProgress(updatedJob)
      
    } catch (error) {
      const errorResult: BatchResult = {
        ...result,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - result.timestamp,
        timestamp: Date.now()
      }
      
      updatedJob.results.push(errorResult)
      onResult(errorResult)
    }
  }
  
  updatedJob = {
    ...updatedJob,
    status: 'complete',
    completedAt: Date.now(),
    progress: 100
  }
  
  onProgress(updatedJob)
  
  return updatedJob
}

/**
 * Export batch results as CSV
 */
export function exportBatchResultsCSV(job: BatchJob): void {
  const headers = ['Prompt', 'Response', 'Status', 'Duration (ms)', 'Error']
  const rows = job.results.map(r => [
    `"${r.prompt.replace(/"/g, '""')}"`,
    `"${r.response.replace(/"/g, '""')}"`,
    r.status,
    r.duration.toString(),
    r.error || ''
  ])
  
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `batch-results-${job.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Export batch results as JSON
 */
export function exportBatchResultsJSON(job: BatchJob): void {
  const data = {
    jobName: job.name,
    engine: job.engine,
    totalPrompts: job.prompts.length,
    completedAt: job.completedAt,
    totalCost: job.totalCost,
    results: job.results
  }
  
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `batch-results-${job.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Create batch job from prompts
 */
export function createBatchJob(
  name: string,
  prompts: BatchPrompt[],
  engine: AIEngine
): BatchJob {
  return {
    id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    prompts,
    results: [],
    engine,
    status: 'pending',
    progress: 0,
    createdAt: Date.now(),
    totalCost: 0
  }
}

const BATCH_JOBS_KEY = 'batch_jobs'

export function saveBatchJob(job: BatchJob): void {
  try {
    const jobs = getAllBatchJobs()
    const existing = jobs.findIndex(j => j.id === job.id)
    
    if (existing >= 0) {
      jobs[existing] = job
    } else {
      jobs.unshift(job)
    }
    
    localStorage.setItem(BATCH_JOBS_KEY, JSON.stringify(jobs.slice(0, 50)))
  } catch (error) {
    console.error('Failed to save batch job:', error)
  }
}

export function getAllBatchJobs(): BatchJob[] {
  try {
    const stored = localStorage.getItem(BATCH_JOBS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

export function getBatchJob(id: string): BatchJob | undefined {
  return getAllBatchJobs().find(j => j.id === id)
}

export function deleteBatchJob(id: string): void {
  try {
    const jobs = getAllBatchJobs().filter(j => j.id !== id)
    localStorage.setItem(BATCH_JOBS_KEY, JSON.stringify(jobs))
  } catch (error) {
    console.error('Failed to delete batch job:', error)
  }
}
