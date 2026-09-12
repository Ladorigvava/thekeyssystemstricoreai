import { ENGINE_CONFIGS, type AIEngine } from './engines'

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
  avgResponseTime: number
  successRate: number
  topEngines: Array<{ engine: AIEngine; score: number; sampleSize: number }>
  recentTrends: Array<{ date: string; queries: number; avgQuality: number }>
}
interface PerformanceRecord {
  engine: AIEngine
  taskType: string
  qualityScore: number
  responseTime: number
  cost: number
  success: boolean
  timestamp: number
}
const PERFORMANCE_STORAGE_KEY = 'performance_analytics'
const TASK_CLASSIFICATION_KEY = 'task_classifications'

function validRecord(value: unknown): value is PerformanceRecord {
  if (!value || typeof value !== 'object') return false
  const r = value as PerformanceRecord
  return Object.prototype.hasOwnProperty.call(ENGINE_CONFIGS, r.engine) && typeof r.taskType === 'string' &&
    typeof r.success === 'boolean' &&
    [r.qualityScore, r.responseTime, r.cost, r.timestamp].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0) &&
    r.qualityScore <= 10 && r.timestamp <= 8.64e15
}
function getPerformanceRecords(): PerformanceRecord[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(PERFORMANCE_STORAGE_KEY) || '[]')
    return Array.isArray(data) ? data.filter(validRecord).slice(-1000) : []
  } catch {
    return []
  }
}
export function logPerformance(engine: AIEngine, taskType: string, qualityScore: number,
  responseTime: number, cost: number, success = true): void {
  const record = { engine, taskType, qualityScore, responseTime, cost, success, timestamp: Date.now() }
  if (!validRecord(record)) return
  try {
    localStorage.setItem(PERFORMANCE_STORAGE_KEY, JSON.stringify([...getPerformanceRecords(), record].slice(-1000)))
  } catch {
    // Analytics must never prevent a generation when browser storage is unavailable.
  }
}
export function classifyTask(prompt: string): string {
  const lower = prompt.toLowerCase()
  if (/code|program|function|debug|algorithm/.test(lower)) return 'coding'
  if (/write|essay|article|story|creative/.test(lower)) return 'writing'
  if (/analyze|research|study|investigate/.test(lower)) return 'analysis'
  if (/explain|teach|learn|understand/.test(lower)) return 'education'
  if (/summarize|tldr|brief|overview/.test(lower)) return 'summarization'
  if (/translate|language|french|spanish/.test(lower)) return 'translation'
  if (/data|stats|numbers|calculate/.test(lower)) return 'data-analysis'
  if (/strategy|business|plan|decision/.test(lower)) return 'business'
  return 'general'
}
export function getPerformanceMetrics(): PerformanceMetrics {
  const records = getPerformanceRecords()
  const successful = records.filter(r => r.success)
  const engines = new Map<AIEngine, { sum: number; count: number }>()
  const days = new Map<string, { queries: number; sum: number; count: number }>()
  for (const r of records) {
    const date = new Date(r.timestamp).toISOString().slice(0, 10)
    const day = days.get(date) || { queries: 0, sum: 0, count: 0 }
    day.queries++
    if (r.success) {
      day.sum += r.qualityScore
      day.count++
      const engine = engines.get(r.engine) || { sum: 0, count: 0 }
      engine.sum += r.qualityScore
      engine.count++
      engines.set(r.engine, engine)
    }
    days.set(date, day)
  }
  return {
    totalQueries: records.length,
    totalCost: records.reduce((sum, r) => sum + r.cost, 0),
    avgQualityScore: successful.length ? successful.reduce((sum, r) => sum + r.qualityScore, 0) / successful.length : 0,
    avgResponseTime: successful.length ? successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length : 0,
    successRate: records.length ? successful.length / records.length * 100 : 0,
    topEngines: [...engines].map(([engine, stats]) => ({ engine, score: stats.sum / stats.count, sampleSize: stats.count }))
      .sort((a, b) => b.score - a.score),
    recentTrends: [...days].sort(([a], [b]) => a.localeCompare(b)).slice(-30)
      .map(([date, stats]) => ({ date, queries: stats.queries, avgQuality: stats.count ? stats.sum / stats.count : 0 })),
  }
}
export function recommendEngine(taskType: string, priority: 'quality' | 'speed' | 'cost' = 'quality'): EngineRecommendation[] {
  const records = getPerformanceRecords().filter(r => r.taskType === taskType && r.success)
  if (records.length < 10) {
    return [{
      engine: priority === 'quality' ? 'gpt-4o' : 'gpt-4o-mini',
      score: 0, confidence: 0, reasoning: 'Default selection; not enough successful task history to rank engines.',
    }]
  }
  const grouped = new Map<AIEngine, PerformanceRecord[]>()
  for (const record of records) grouped.set(record.engine, [...(grouped.get(record.engine) || []), record])
  return [...grouped].map(([engine, samples]) => {
    const value = samples.reduce((sum, r) => sum +
      (priority === 'quality' ? r.qualityScore : priority === 'speed' ? r.responseTime : r.cost), 0) / samples.length
    return {
      engine,
      score: priority === 'quality' ? value : -value,
      reasoning: priority === 'quality' ? `Average quality: ${value.toFixed(1)}/10` :
        priority === 'speed' ? `Average response: ${(value / 1000).toFixed(1)}s` : `Average cost: $${value.toFixed(4)}`,
      confidence: Math.min(100, samples.length / 20 * 100),
    }
  }).sort((a, b) => b.score - a.score).slice(0, 3)
}
export function clearAnalytics(): void {
  try {
    localStorage.removeItem(PERFORMANCE_STORAGE_KEY)
    localStorage.removeItem(TASK_CLASSIFICATION_KEY)
  } catch {
    // Storage can be disabled by the browser.
  }
}
