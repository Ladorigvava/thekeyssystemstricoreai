import { AIEngine } from './engines'
import { kv } from './storage'
import { getParametersForEngine } from './model-parameters'

export interface CachedResponse {
  id: string
  prompt: string
  response: string
  engine: AIEngine
  timestamp: number
  coreId?: string
  hitCount: number
  costSaved: number
  lastAccessed: number
  parameters?: string
}

export interface CacheStats {
  totalCached: number
  cacheSize: string
  oldestEntry: number | null
  newestEntry: number | null
  totalHits: number
  totalCostSaved: number
  hitRate: number
  topHits: Array<{ prompt: string; hits: number; saved: number }>
}

export interface SemanticMatch {
  entry: CachedResponse
  similarity: number
}

const CACHE_KEY = 'ai-response-cache'
const MAX_CACHE_SIZE = 100
const CACHE_STATS_KEY = 'cache-statistics'

export async function getCachedResponse(
  prompt: string,
  engine: AIEngine,
  coreId?: string,
): Promise<string | null> {
  try {
    const cache = ((await kv.get(CACHE_KEY)) || []) as CachedResponse[]

    const normalizedPrompt = normalizePrompt(prompt)

    // Try exact match first using optimized comparison
    let match: CachedResponse | undefined
    for (const entry of cache) {
      // Early exit conditions to avoid unnecessary string normalization
      if (entry.engine !== engine) continue
      if (entry.parameters !== JSON.stringify(getParametersForEngine(engine)))
        continue
      if (coreId && entry.coreId !== coreId) continue

      if (normalizePrompt(entry.prompt) === normalizedPrompt) {
        match = entry
        break
      }
    }

    if (match) {
      // Update hit statistics
      await updateCacheHit(match.id)
      return match.response
    }

    return null
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

export async function cacheResponse(
  prompt: string,
  response: string,
  engine: AIEngine,
  coreId?: string,
): Promise<void> {
  try {
    const newEntry: CachedResponse = {
      id: generateCacheId(),
      prompt,
      response,
      engine,
      timestamp: Date.now(),
      coreId,
      hitCount: 0,
      costSaved: 0,
      lastAccessed: Date.now(),
      parameters: JSON.stringify(getParametersForEngine(engine)),
    }

    await kv.update<CachedResponse[]>(CACHE_KEY, (previous) =>
      [newEntry, ...(previous || [])].slice(0, MAX_CACHE_SIZE),
    )
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

async function updateCacheHit(cacheId: string): Promise<void> {
  try {
    const cache = ((await kv.get(CACHE_KEY)) || []) as CachedResponse[]
    const updated = cache.map((entry) => {
      if (entry.id === cacheId) {
        // Estimate cost saved (approximate API call cost)
        const estimatedCost = 0.002 // $0.002 per cache hit
        return {
          ...entry,
          hitCount: entry.hitCount + 1,
          costSaved: entry.costSaved + estimatedCost,
          lastAccessed: Date.now(),
        }
      }
      return entry
    })
    await kv.set(CACHE_KEY, updated)

    // Update global stats
    await incrementGlobalStats(0.002)
  } catch (error) {
    console.error('Cache hit update error:', error)
  }
}

async function incrementGlobalStats(costSaved: number): Promise<void> {
  try {
    const stats = ((await kv.get(CACHE_STATS_KEY)) || {
      totalHits: 0,
      totalSaved: 0,
    }) as { totalHits: number; totalSaved: number }

    stats.totalHits += 1
    stats.totalSaved += costSaved

    await kv.set(CACHE_STATS_KEY, stats)
  } catch (error) {
    console.error('Stats update error:', error)
  }
}

export async function clearCache(): Promise<void> {
  try {
    await kv.delete(CACHE_KEY)
  } catch (error) {
    console.error('Cache clear error:', error)
  }
}

export async function getCacheStats(): Promise<CacheStats> {
  try {
    const cache = ((await kv.get(CACHE_KEY)) || []) as CachedResponse[]
    const globalStats = ((await kv.get(CACHE_STATS_KEY)) || {
      totalHits: 0,
      totalSaved: 0,
    }) as { totalHits: number; totalSaved: number }

    const timestamps = cache.map((entry) => entry.timestamp)
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : null

    const cacheSize = formatCacheSize(JSON.stringify(cache).length)

    const totalHits = cache.reduce((sum, entry) => sum + entry.hitCount, 0)
    const totalCostSaved = cache.reduce(
      (sum, entry) => sum + entry.costSaved,
      0,
    )
    const totalRequests = cache.length + globalStats.totalHits
    const hitRate =
      totalRequests > 0 ? (globalStats.totalHits / totalRequests) * 100 : 0

    // Top cache hits
    const topHits = cache
      .filter((e) => e.hitCount > 0)
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 5)
      .map((e) => ({
        prompt: e.prompt.substring(0, 50) + (e.prompt.length > 50 ? '...' : ''),
        hits: e.hitCount,
        saved: e.costSaved,
      }))

    return {
      totalCached: cache.length,
      cacheSize,
      oldestEntry,
      newestEntry,
      totalHits: globalStats.totalHits,
      totalCostSaved: globalStats.totalSaved,
      hitRate,
      topHits,
    }
  } catch (error) {
    console.error('Cache stats error:', error)
    return {
      totalCached: 0,
      cacheSize: '0 KB',
      oldestEntry: null,
      newestEntry: null,
      totalHits: 0,
      totalCostSaved: 0,
      hitRate: 0,
      topHits: [],
    }
  }
}

export async function getAllCachedResponses(): Promise<CachedResponse[]> {
  try {
    return ((await kv.get(CACHE_KEY)) || []) as CachedResponse[]
  } catch (error) {
    console.error('Cache retrieval error:', error)
    return []
  }
}

export async function deleteCachedResponse(id: string): Promise<void> {
  try {
    const cache = ((await kv.get(CACHE_KEY)) || []) as CachedResponse[]
    const filtered = cache.filter((entry) => entry.id !== id)
    await kv.set(CACHE_KEY, filtered)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

function normalizePrompt(prompt: string): string {
  return prompt
}

function generateCacheId(): string {
  return `cache-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function formatCacheSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
