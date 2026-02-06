import { AIEngine, ENGINE_CONFIGS } from './engines'

// Cost per 1M tokens (input + output averaged, as of Dec 2025)
export const MODEL_COSTS: Record<AIEngine, { input: number; output: number }> = {
  'o1': { input: 15.00, output: 60.00 },
  'o1-mini': { input: 3.00, output: 12.00 },
  'o3-mini': { input: 1.10, output: 4.40 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'claude-3-7-sonnet-20250219': { input: 3.00, output: 15.00 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'gemini-2.0-flash-exp': { input: 0.00, output: 0.00 },
  'gemini-2.0-flash-thinking-exp': { input: 0.00, output: 0.00 },
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'mistral-large-latest': { input: 2.00, output: 6.00 },
  'mistral-small-latest': { input: 0.20, output: 0.60 },
  'codestral-latest': { input: 0.20, output: 0.60 },
  'command-r-plus-08-2024': { input: 2.50, output: 10.00 },
  'command-r-08-2024': { input: 0.15, output: 0.75 },
  'groq-llama-3.3-70b': { input: 0.00, output: 0.00 },
  'groq-llama-3.1-8b': { input: 0.00, output: 0.00 },
  'groq-mixtral-8x7b': { input: 0.00, output: 0.00 },
  'deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek-reasoner': { input: 0.55, output: 2.19 },
  'perplexity-sonar-pro': { input: 3.00, output: 15.00 },
  'perplexity-sonar': { input: 1.00, output: 1.00 },
  'huggingface-meta-llama-3.3-70b': { input: 0.00, output: 0.00 },
  'huggingface-qwen-2.5-72b': { input: 0.00, output: 0.00 }
}

export interface CostEntry {
  timestamp: number
  engine: AIEngine
  inputTokens: number
  outputTokens: number
  cost: number
  mode: string // 'chadrak', 'nova', 'tricore', etc.
}

export interface UsageStats {
  totalCost: number
  totalQueries: number
  costByEngine: Record<AIEngine, number>
  costByMode: Record<string, number>
  queriesByEngine: Record<AIEngine, number>
  entriesThisMonth: CostEntry[]
  budgetRemaining?: number
}

const STORAGE_KEY = 'cost-tracking-entries'
const BUDGET_KEY = 'monthly-budget'

// Estimate token count (rough approximation: 1 token ≈ 4 characters)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Calculate cost for a query
export function calculateCost(
  engine: AIEngine,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[engine]
  const inputCost = (inputTokens / 1_000_000) * costs.input
  const outputCost = (outputTokens / 1_000_000) * costs.output
  return inputCost + outputCost
}

// Log a query
export function logCost(
  engine: AIEngine,
  inputText: string,
  outputText: string,
  mode: string
): CostEntry {
  const inputTokens = estimateTokens(inputText)
  const outputTokens = estimateTokens(outputText)
  const cost = calculateCost(engine, inputTokens, outputTokens)

  const entry: CostEntry = {
    timestamp: Date.now(),
    engine,
    inputTokens,
    outputTokens,
    cost,
    mode
  }

  // Get existing entries
  const entries = getCostEntries()
  entries.push(entry)

  // Store (keep last 1000 entries to prevent storage overflow)
  const trimmed = entries.slice(-1000)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))

  return entry
}

// Get all cost entries
export function getCostEntries(): CostEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Get entries from current month
export function getThisMonthEntries(): CostEntry[] {
  const entries = getCostEntries()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  return entries.filter(e => e.timestamp >= monthStart)
}

// Get usage statistics
export function getUsageStats(): UsageStats {
  const entries = getThisMonthEntries()
  const budget = getMonthlyBudget()

  const stats: UsageStats = {
    totalCost: 0,
    totalQueries: entries.length,
    costByEngine: {} as Record<AIEngine, number>,
    costByMode: {},
    queriesByEngine: {} as Record<AIEngine, number>,
    entriesThisMonth: entries
  }

  // Initialize counters
  Object.keys(ENGINE_CONFIGS).forEach(engine => {
    stats.costByEngine[engine as AIEngine] = 0
    stats.queriesByEngine[engine as AIEngine] = 0
  })

  // Aggregate stats
  entries.forEach(entry => {
    stats.totalCost += entry.cost
    stats.costByEngine[entry.engine] += entry.cost
    stats.queriesByEngine[entry.engine]++
    stats.costByMode[entry.mode] = (stats.costByMode[entry.mode] || 0) + entry.cost
  })

  if (budget > 0) {
    stats.budgetRemaining = budget - stats.totalCost
  }

  return stats
}

// Budget management
export function getMonthlyBudget(): number {
  try {
    const stored = localStorage.getItem(BUDGET_KEY)
    return stored ? parseFloat(stored) : 0
  } catch {
    return 0
  }
}

export function setMonthlyBudget(amount: number): void {
  localStorage.setItem(BUDGET_KEY, amount.toString())
}

// Estimate cost before running
export function estimateQueryCost(
  engine: AIEngine,
  inputText: string,
  estimatedOutputLength: number = 1000
): number {
  const inputTokens = estimateTokens(inputText)
  const outputTokens = Math.ceil(estimatedOutputLength / 4)
  return calculateCost(engine, inputTokens, outputTokens)
}

// Check if query would exceed budget
export function wouldExceedBudget(estimatedCost: number): boolean {
  const budget = getMonthlyBudget()
  if (budget === 0) return false // No budget set
  
  const stats = getUsageStats()
  return (stats.totalCost + estimatedCost) > budget
}

// Format cost for display
export function formatCost(cost: number): string {
  if (cost === 0) return 'Free'
  if (cost < 0.01) return '< $0.01'
  return `$${cost.toFixed(cost < 1 ? 3 : 2)}`
}

// Clear all cost data
export function clearCostData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// Export cost data as CSV
export function exportCostDataCSV(): string {
  const entries = getCostEntries()
  const header = 'Timestamp,Engine,Mode,Input Tokens,Output Tokens,Cost\n'
  const rows = entries.map(e => 
    `${new Date(e.timestamp).toISOString()},${e.engine},${e.mode},${e.inputTokens},${e.outputTokens},${e.cost.toFixed(6)}`
  ).join('\n')
  return header + rows
}
