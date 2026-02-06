import { AIEngine, ENGINE_CONFIGS } from './engines'
import { HistoryEntry } from './history'

  avgQualityScore: number
  avgCost: number
  sampleSize: numb

  engine: AIEngine
  reasoning: stri
}
export interface Per
 

  recentTrends: Array<{ date: string; q

const TASK_CLAS
interface Performan
  taskType: string
 

}
/**
 */
  engine: AIEngine,
  qualityScore: number,
  cost: number,
  recentTrends: Array<{ date: string; queries: number; avgQuality: number }>
}

const PERFORMANCE_STORAGE_KEY = 'performance_analytics'
const TASK_CLASSIFICATION_KEY = 'task_classifications'

interface PerformanceRecord {
  engine: AIEngine
  taskType: string
  qualityScore: number
  responseTime: number
  cost: number
  success: boolean
  timestamp: number
}

/**
 * Log performance for analytics
 */
export function logPerformance(
  engine: AIEngine,
  taskType: string,
  qualityScore: number,
  responseTime: number,
  cost: number,
  success: boolean = true
    retur
  try {
    const records = getPerformanceRecords()
    records.push({
      engine,
      taskType,
  
      responseTime,
  if (lower
      success,
      timestamp: Date.now()
    })
  
    // Keep last 1000 records
    const trimmed = records.slice(-1000)
    localStorage.setItem(PERFORMANCE_STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to log performance:', error)
  
}

function getPerformanceRecords(): PerformanceRecord[] {
      t
    const stored = localStorage.getItem(PERFORMANCE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
  const total
  }
 

   
 * Classify task type from prompt (simple keyword-based for now)
   
export function classifyTask(prompt: string): string {
  const lower = prompt.toLowerCase()
  
  if (lower.match(/code|program|function|debug|algorithm/)) return 'coding'
  if (lower.match(/write|essay|article|story|creative/)) return 'writing'
  if (lower.match(/analyze|research|study|investigate/)) return 'analysis'
  if (lower.match(/explain|teach|learn|understand/)) return 'education'
  if (lower.match(/summarize|tldr|brief|overview/)) return 'summarization'
  if (lower.match(/translate|language|french|spanish/)) return 'translation'
  if (lower.match(/data|stats|numbers|calculate/)) return 'data-analysis'
  if (lower.match(/strategy|business|plan|decision/)) return 'business'
  
  return 'general'
 

   
 * Get performance metrics for dashboard
  
export function getPerformanceMetrics(): PerformanceMetrics {
 */
  
): EngineRecommendation[] {
  const task
  if (taskRecords.leng
    return getDefau
  
  const engineScores 
  taskRecords.forEach(r
    engineScores.set(r
     
   
  
  const recommendations: EngineRecomm
  engineScores.forEach((stats, engine) => {
    const avgSpeed = stats.speed / stats.count
  
    let reasoning = ''
    if (priority === 'quality') {
      reasoning = `Best 
      score = 10 - (avgSpeed / 1000) // Lower time = higher score
    } else {
      reasoning = `Most cost-effective for ${taskType}
    
      
    
  
  
    .sort((a, b) => b.score - a.
}
function getDefaultRecommendations(priority
    ret
      { engine: 'claude-3-5-sonnet-202
    ]
  
      { engine: 'gpt-4o-min
    ]
    return [
      { engine: 'claude-3-5-haiku-202
    ]
}
/**
 */
  try {
    l
    console.error('Failed to clear analy
}

























































 */
export function recommendEngine(
  taskType: string,
  priority: 'quality' | 'speed' | 'cost' = 'quality'
): EngineRecommendation[] {
  const records = getPerformanceRecords()
  const taskRecords = records.filter(r => r.taskType === taskType)
  
  if (taskRecords.length < 10) {
    // Not enough data, return default recommendations
    return getDefaultRecommendations(priority)
  }
  
  // Calculate scores based on priority
  const engineScores = new Map<AIEngine, { quality: number; speed: number; cost: number; count: number }>()
  
  taskRecords.forEach(r => {
    const current = engineScores.get(r.engine) || { quality: 0, speed: 0, cost: 0, count: 0 }
    engineScores.set(r.engine, {
      quality: current.quality + r.qualityScore,
      speed: current.speed + r.responseTime,
      cost: current.cost + r.cost,
      count: current.count + 1
    })
  })
  
  const recommendations: EngineRecommendation[] = []
  
  engineScores.forEach((stats, engine) => {
    const avgQuality = stats.quality / stats.count
    const avgSpeed = stats.speed / stats.count
    const avgCost = stats.cost / stats.count
    
    let score = 0
    let reasoning = ''
    
    if (priority === 'quality') {
      score = avgQuality
      reasoning = `Best quality for ${taskType} tasks (${avgQuality.toFixed(1)}/10 avg)`
    } else if (priority === 'speed') {
      score = 10 - (avgSpeed / 1000) // Lower time = higher score
      reasoning = `Fastest for ${taskType} tasks (${(avgSpeed / 1000).toFixed(1)}s avg)`
    } else {
      score = 10 - avgCost // Lower cost = higher score
      reasoning = `Most cost-effective for ${taskType} tasks ($${avgCost.toFixed(4)} avg)`
    }
    
    recommendations.push({
      engine,
      score,
      reasoning,
      confidence: Math.min(100, (stats.count / 20) * 100) // Confidence based on sample size
    })
  })
  
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

function getDefaultRecommendations(priority: 'quality' | 'speed' | 'cost'): EngineRecommendation[] {
  if (priority === 'quality') {
    return [
      { engine: 'gpt-4o', score: 9, reasoning: 'Strong all-around performance', confidence: 50 },
      { engine: 'claude-3-5-sonnet-20241022', score: 9, reasoning: 'Excellent for complex tasks', confidence: 50 },
      { engine: 'gemini-2.0-flash-thinking-exp', score: 8, reasoning: 'Good reasoning capabilities', confidence: 50 }
    ]
  } else if (priority === 'speed') {
    return [
      { engine: 'gemini-2.0-flash-exp', score: 9, reasoning: 'Very fast responses', confidence: 50 },
      { engine: 'gpt-4o-mini', score: 8, reasoning: 'Quick and efficient', confidence: 50 },
      { engine: 'claude-3-5-haiku-20241022', score: 8, reasoning: 'Fast lightweight model', confidence: 50 }
    ]
  } else {
    return [
      { engine: 'gpt-4o-mini', score: 9, reasoning: 'Most cost-effective', confidence: 50 },
      { engine: 'claude-3-5-haiku-20241022', score: 8, reasoning: 'Good value', confidence: 50 },
      { engine: 'gemini-2.0-flash-exp', score: 8, reasoning: 'Affordable and fast', confidence: 50 }
    ]
  }
}

/**
 * Clear analytics data
 */
export function clearAnalytics(): void {
  try {
    localStorage.removeItem(PERFORMANCE_STORAGE_KEY)
    localStorage.removeItem(TASK_CLASSIFICATION_KEY)
  } catch (error) {
    console.error('Failed to clear analytics:', error)
  }
}
