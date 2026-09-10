import { AIEngine } from './engines'
export interface PerformanceRecord {
  engine: AIEngine
  taskType: string
  qualityScore: number
  responseTime: number
  cost: number
  success: boolean
  timestamp: number
}
export interface EngineRecommendation {
  engine: AIEngine
  score: number
  reasoning: string
  confidence: number
}
const KEY = 'performance_analytics'
function records(): PerformanceRecord[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}
export function logPerformance(
  engine: AIEngine,
  taskType: string,
  qualityScore: number,
  responseTime: number,
  cost: number,
  success = true,
) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(
        [
          ...records(),
          {
            engine,
            taskType,
            qualityScore,
            responseTime,
            cost,
            success,
            timestamp: Date.now(),
          },
        ].slice(-1000),
      ),
    )
  } catch {
    /* Optional analytics must not fail a completed run. */
  }
}
export function classifyTask(prompt: string): string {
  const categories = {
    coding: /code|program|debug|algorithm/i,
    writing: /essay|article|story|creative/i,
    analysis: /analyze|research|investigate/i,
    education: /explain|teach|learn/i,
    summarization: /summarize|tldr|brief/i,
    translation: /translate|language/i,
    business: /strategy|business|plan/i,
  }
  return (
    Object.entries(categories).find(([, pattern]) =>
      pattern.test(prompt),
    )?.[0] || 'general'
  )
}
export function getPerformanceMetrics() {
  const items = records()
  const good = items.filter((r) => r.success)
  return {
    totalQueries: items.length,
    totalCost: items.reduce((sum, r) => sum + r.cost, 0),
    avgQualityScore: good.length
      ? good.reduce((sum, r) => sum + r.qualityScore, 0) / good.length
      : 0,
    successRate: items.length ? (good.length / items.length) * 100 : 0,
    recentTrends: [
      ...new Set(
        items.map((r) => new Date(r.timestamp).toISOString().slice(0, 10)),
      ),
    ]
      .sort()
      .map((date) => {
        const daily = items.filter((r) =>
          new Date(r.timestamp).toISOString().startsWith(date),
        )
        return {
          date,
          queries: daily.length,
          avgQuality:
            daily.reduce((s, r) => s + r.qualityScore, 0) / daily.length,
        }
      }),
  }
}
export function recommendEngine(
  taskType: string,
  priority: 'quality' | 'speed' | 'cost' = 'quality',
): EngineRecommendation[] {
  const items = records().filter((r) => r.taskType === taskType && r.success)
  return [...new Set(items.map((r) => r.engine))]
    .map((engine) => {
      const group = items.filter((r) => r.engine === engine)
      const score =
        group.reduce(
          (sum, r) =>
            sum +
            (priority === 'quality'
              ? r.qualityScore
              : priority === 'speed'
                ? -r.responseTime
                : -r.cost),
          0,
        ) / group.length
      return {
        engine,
        score,
        reasoning: `${group.length} recorded ${taskType} runs`,
        confidence: Math.min(100, group.length * 5),
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}
export function clearAnalytics() {
  localStorage.removeItem(KEY)
}
