import { AIEngine } from './engines'
import { streamLLM } from './llm'
import { ModelParameters, getParametersForEngine } from './model-parameters'

export interface RaceProgress {
  engine: AIEngine
  text: string
  wordCount: number
  charsPerSecond: number
  startTime: number
  isComplete: boolean
  error?: string
}

export interface RaceStats {
  engine: AIEngine
  totalTime: number
  totalWords: number
  totalChars: number
  avgSpeed: number // chars per second
  completedAt: number
}

export type RaceUpdateCallback = (progress: Map<AIEngine, RaceProgress>) => void
export type RaceCompleteCallback = (stats: Map<AIEngine, RaceStats>) => void

/**
 * Run a streaming race between multiple AI engines
 * Returns real-time progress updates as each engine generates text
 */
export async function runStreamingRace(
  prompt: string,
  engines: AIEngine[],
  onUpdate: RaceUpdateCallback,
  onComplete?: RaceCompleteCallback
): Promise<Map<AIEngine, string>> {
  const progressMap = new Map<AIEngine, RaceProgress>()
  const resultsMap = new Map<AIEngine, string>()
  const statsMap = new Map<AIEngine, RaceStats>()
  
  // Initialize progress for all engines
  const startTime = Date.now()
  engines.forEach(engine => {
    progressMap.set(engine, {
      engine,
      text: '',
      wordCount: 0,
      charsPerSecond: 0,
      startTime,
      isComplete: false
    })
  })
  
  // Start all engines in parallel
  const promises = engines.map(async (engine) => {
    const engineStartTime = Date.now()
    let fullResponse = ''
    let lastUpdateTime = engineStartTime
    let lastCharCount = 0
    
    try {
      const params = getParametersForEngine(engine)
      
      const response = await streamLLM(
        prompt,
        engine,
        (chunk) => {
          fullResponse += chunk
          const now = Date.now()
          const elapsed = (now - engineStartTime) / 1000 // seconds
          const currentCharCount = fullResponse.length
          const charsSinceLastUpdate = currentCharCount - lastCharCount
          const timeSinceLastUpdate = (now - lastUpdateTime) / 1000
          
          // Calculate instantaneous speed
          const instantSpeed = timeSinceLastUpdate > 0 
            ? charsSinceLastUpdate / timeSinceLastUpdate 
            : 0
          
          // Update progress
          progressMap.set(engine, {
            engine,
            text: fullResponse,
            wordCount: fullResponse.split(/\s+/).filter(w => w.length > 0).length,
            charsPerSecond: elapsed > 0 ? currentCharCount / elapsed : 0,
            startTime: engineStartTime,
            isComplete: false
          })
          
          onUpdate(new Map(progressMap))
          
          lastUpdateTime = now
          lastCharCount = currentCharCount
        },
        params
      )
      
      resultsMap.set(engine, response)
      
      // Mark as complete
      const completedAt = Date.now()
      const totalTime = (completedAt - engineStartTime) / 1000
      const totalChars = response.length
      const totalWords = response.split(/\s+/).filter(w => w.length > 0).length
      
      progressMap.set(engine, {
        engine,
        text: response,
        wordCount: totalWords,
        charsPerSecond: totalChars / totalTime,
        startTime: engineStartTime,
        isComplete: true
      })
      
      statsMap.set(engine, {
        engine,
        totalTime,
        totalWords,
        totalChars,
        avgSpeed: totalChars / totalTime,
        completedAt
      })
      
      onUpdate(new Map(progressMap))
      
    } catch (error) {
      console.error(`Race error for ${engine}:`, error)
      progressMap.set(engine, {
        engine,
        text: fullResponse,
        wordCount: fullResponse.split(/\s+/).filter(w => w.length > 0).length,
        charsPerSecond: 0,
        startTime: engineStartTime,
        isComplete: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      onUpdate(new Map(progressMap))
      return fullResponse
    }
    
    return fullResponse
  })
  
  // Wait for all engines to complete
  await Promise.allSettled(promises)
  
  // Call completion callback with final stats
  if (onComplete && statsMap.size > 0) {
    onComplete(new Map(statsMap))
  }
  
  return resultsMap
}

/**
 * Get the winner based on completion time
 */
export function getSpeedWinner(stats: Map<AIEngine, RaceStats>): AIEngine | null {
  let fastestEngine: AIEngine | null = null
  let fastestTime = Infinity
  
  stats.forEach((stat, engine) => {
    if (stat.totalTime < fastestTime) {
      fastestTime = stat.totalTime
      fastestEngine = engine
    }
  })
  
  return fastestEngine
}

/**
 * Get the winner based on average speed (chars per second)
 */
export function getThroughputWinner(stats: Map<AIEngine, RaceStats>): AIEngine | null {
  let fastestEngine: AIEngine | null = null
  let highestSpeed = 0
  
  stats.forEach((stat, engine) => {
    if (stat.avgSpeed > highestSpeed) {
      highestSpeed = stat.avgSpeed
      fastestEngine = engine
    }
  })
  
  return fastestEngine
}

/**
 * Get the winner based on word count
 */
export function getVerbosityWinner(stats: Map<AIEngine, RaceStats>): AIEngine | null {
  let mostVerboseEngine: AIEngine | null = null
  let highestWords = 0
  
  stats.forEach((stat, engine) => {
    if (stat.totalWords > highestWords) {
      highestWords = stat.totalWords
      mostVerboseEngine = engine
    }
  })
  
  return mostVerboseEngine
}

/**
 * Format time in seconds to human-readable
 */
export function formatTime(seconds: number): string {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`
  }
  return `${seconds.toFixed(2)}s`
}

/**
 * Format speed (chars/sec) to human-readable
 */
export function formatSpeed(charsPerSecond: number): string {
  if (charsPerSecond < 1) {
    return '0 c/s'
  }
  return `${Math.round(charsPerSecond)} c/s`
}
