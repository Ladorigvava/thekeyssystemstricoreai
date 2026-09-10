import { CoreMode } from './cores'

export interface HistoryEntry {
  id: string
  timestamp: number
  mode:
    | CoreMode
    | 'comparison'
    | 'debate'
    | 'race'
    | 'personas'
    | 'research'
    | 'ensemble'
    | 'templates'
  input: string
  output:
    | string
    | {
        chadrak: string
        nova: string
        triad: string
      }
  engine?: string
  status?: 'completed' | 'partial' | 'failed'
  coreRuns?: Record<
    string,
    {
      model: string
      status: string
      cached: boolean
      responseId?: string | null
      runId?: string
    }
  >
}

export function createHistoryEntry(
  mode: CoreMode,
  input: string,
  output: string | { chadrak: string; nova: string; triad: string },
): HistoryEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    mode,
    input,
    output,
  }
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
