import { AIEngine, ENGINE_CONFIGS } from './engines'
import { HistoryEntry } from './history'

export interface TaskPerformance {
  engine: AIEngine
  taskType: string
  avgQualityScore: number
  avgResponseTime: number
  avgCost: number
  successRate: number
  sampleSize: number
}

export interface EngineRecommendation {
  engine: AIEngine
  score: number
  reasoning: string
  confidence: number
}

export interface PerformanceMetrics {
  totalQueries: number
  totalCost: number
  avgQualityScore: number
  topEngines: Array<{ engine: AIEngine; score: number }>
  taskInsights: TaskPerformance[]
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
): void {
  try {
    const records = getPerformanceRecords()
    records.push({
      engine,
      taskType,
      qualityScore,
      responseTime,
      cost,
      success,
      timestamp: Date.now()
    })
    
    // Keep last 1000 records
    const trimmed = records.slice(-1000)
    localStorage.setItem(PERFORMANCE_STORAGE_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to log performance:', error)
  }
}

function getPerformanceRecords(): PerformanceRecord[] {
  try {
    const stored = localStorage.getItem(PERFORMANCE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

/**
 * Classify task type from prompt (simple keyword-based for now)
 */
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
}

/**
 * Get performance metrics for dashboard
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  const records = getPerformanceRecords()
  
  if (records.length === 0) {
    return {
      totalQueries: 0,
      totalCost: 0,
      avgQualityScore: 0,
      topEngines: [],
      taskInsights: [],
      recentTrends: []
    }
  }
  
  const totalQueries = records.length
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0)
  const avgQualityScore = records.reduce((sum, r) => sum + r.qualityScore, 0) / totalQueries
  
  // Calculate engine scores
  const engineStats = new Map<AIEngine, { totalScore: number; count: number }>()
  records.forEach(r => {
    const current = engineStats.get(r.engine) || { totalScore: 0, count: 0 }
    engineStats.set(r.engine, {
      totalScore: current.totalScore + r.qualityScore,
      count: current.count + 1
    })
  })
  
  const topEngines = Array.from(engineStats.entries())
    .map(([engine, stats]) => ({
      engine,
      score: stats.totalScore / stats.count
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
  
  // Task-specific insights
  const taskStats = new Map<string, Map<AIEngine, PerformanceRecord[]>>()
  records.forEach(r => {
    if (!taskStats.has(r.taskType)) {
      taskStats.set(r.taskType, new Map())
    }
    const engineRecords = taskStats.get(r.taskType)!
    if (!engineRecords.has(r.engine)) {
      engineRecords.set(r.engine, [])
    }
    engineRecords.get(r.engine)!.push(r)
  })
  
  const taskInsights: TaskPerformance[] = []
  taskStats.forEach((engineMap, taskType) => {
    engineMap.forEach((recs, engine) => {
      if (recs.length >= 3) { // Minimum sample size
        taskInsights.push({
          engine,
          taskType,
          avgQualityScore: recs.reduce((sum, r) => sum + r.qualityScore, 0) / recs.length,
          avgResponseTime: recs.reduce((sum, r) => sum + r.responseTime, 0) / recs.length,
          avgCost: recs.reduce((sum, r) => sum + r.cost, 0) / recs.length,
          successRate: recs.filter(r => r.success).length / recs.length,
          sampleSize: recs.length
        })
      }
    })
  })
  
  // Recent trends (last 7 days)
  const recentTrends = calculateRecentTrends(records)
  
  return {
    totalQueries,
    totalCost,
    avgQualityScore,
    topEngines,
    taskInsights,
    recentTrends
  }
}

function calculateRecentTrends(records: PerformanceRecord[]): Array<{ date: string; queries: number; avgQuality: number }> {
  const now = Date.now()
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)
  const recent = records.filter(r => r.timestamp >= sevenDaysAgo)
  
  // Group by day
  const byDay = new Map<string, PerformanceRecord[]>()
  recent.forEach(r => {
    const date = new Date(r.timestamp).toLocaleDateString()
    if (!byDay.has(date)) {
      byDay.set(date, [])
    }
    byDay.get(date)!.push(r)
  })
  
  return Array.from(byDay.entries())
    .map(([date, recs]) => ({
      date,
      queries: recs.length,
      avgQuality: recs.reduce((sum, r) => sum + r.qualityScore, 0) / recs.length
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Get AI-powered engine recommendation for a task
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
