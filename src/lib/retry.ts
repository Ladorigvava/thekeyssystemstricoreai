import { AIEngine, ENGINE_CONFIGS } from './engines'

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryableErrors?: string[]
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attemptCount: number
  fallbackUsed?: boolean
  fallbackEngine?: AIEngine
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'rate_limit',
    'timeout',
    'network',
    'server_error',
    'service_unavailable',
    'too_many_requests',
    '429',
    '500',
    '502',
    '503',
    '504',
  ],
}

/**
 * Determines if an error is retryable based on error message/type
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  const errorMessage = error.message.toLowerCase()
  return retryableErrors.some((pattern) =>
    errorMessage.includes(pattern.toLowerCase()),
  )
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
): number {
  const exponentialDelay =
    initialDelay * Math.pow(backoffMultiplier, attempt - 1)
  const delay = Math.min(exponentialDelay, maxDelay)
  // Add jitter (±25% randomness) to prevent thundering herd
  const jitter = delay * 0.25 * (Math.random() * 2 - 1)
  return Math.max(0, delay + jitter)
}

/**
 * Wait for a specified duration
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get a fallback engine of the same provider but lower tier
 */
export function getFallbackEngine(engine: AIEngine): AIEngine | null {
  const config = ENGINE_CONFIGS[engine]
  if (!config) return null

  const provider = config.provider

  // Find a cheaper/faster alternative from the same provider
  const fallbackOptions: Record<string, AIEngine[]> = {
    openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-5.2'],
    anthropic: [
      'claude-haiku-4-5-20251001',
      'claude-sonnet-5',
      'claude-sonnet-5',
    ],
    google: ['gemini-2.5-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  }

  const alternatives = fallbackOptions[provider] || []

  // Find first alternative that's different from current engine
  for (const alt of alternatives) {
    if (alt !== engine) {
      return alt
    }
  }

  return null
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | undefined
  let attemptCount = 0

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    attemptCount = attempt

    try {
      const data = await fn()
      return {
        success: true,
        data,
        attemptCount,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      const shouldRetry = isRetryableError(lastError, opts.retryableErrors)

      // If last attempt or not retryable, don't retry
      if (attempt === opts.maxRetries || !shouldRetry) {
        break
      }

      // Calculate delay and wait before retry
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier,
      )

      console.log(
        `Retry attempt ${attempt}/${opts.maxRetries} after ${Math.round(delay)}ms. Error: ${lastError.message}`,
      )
      await wait(delay)
    }
  }

  return {
    success: false,
    error: lastError,
    attemptCount,
  }
}

/**
 * Execute with retry and automatic fallback to alternative engine
 */
export async function withRetryAndFallback<T>(
  fn: (engine: AIEngine) => Promise<T>,
  primaryEngine: AIEngine,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  // First try with primary engine and retry
  const primaryResult = await withRetry(() => fn(primaryEngine), options)

  if (primaryResult.success) {
    return primaryResult
  }

  // If primary failed, try fallback engine
  const fallbackEngine = getFallbackEngine(primaryEngine)

  if (!fallbackEngine) {
    // No fallback available, return primary error
    return primaryResult
  }

  console.log(
    `Primary engine ${primaryEngine} failed. Trying fallback: ${fallbackEngine}`,
  )

  // Try fallback with reduced retry count (1 attempt only)
  const fallbackResult = await withRetry(() => fn(fallbackEngine), {
    ...options,
    maxRetries: 1,
  })

  if (fallbackResult.success) {
    return {
      ...fallbackResult,
      fallbackUsed: true,
      fallbackEngine,
    }
  }

  // Both failed, return original error
  return primaryResult
}

/**
 * Detect specific error types for better handling
 */
export function categorizeError(error: Error): {
  type: 'rate_limit' | 'auth' | 'network' | 'server' | 'client' | 'unknown'
  isRetryable: boolean
  message: string
} {
  const errorMsg = error.message.toLowerCase()

  if (
    errorMsg.includes('429') ||
    errorMsg.includes('rate limit') ||
    errorMsg.includes('too many requests')
  ) {
    return {
      type: 'rate_limit',
      isRetryable: true,
      message: 'Rate limit exceeded. Retrying with delay...',
    }
  }

  if (
    errorMsg.includes('401') ||
    errorMsg.includes('403') ||
    errorMsg.includes('unauthorized') ||
    errorMsg.includes('forbidden')
  ) {
    return {
      type: 'auth',
      isRetryable: false,
      message: 'Authentication failed. Please check your API keys.',
    }
  }

  if (
    errorMsg.includes('network') ||
    errorMsg.includes('fetch') ||
    errorMsg.includes('connection')
  ) {
    return {
      type: 'network',
      isRetryable: true,
      message: 'Network error. Retrying...',
    }
  }

  if (
    errorMsg.includes('500') ||
    errorMsg.includes('502') ||
    errorMsg.includes('503') ||
    errorMsg.includes('504')
  ) {
    return {
      type: 'server',
      isRetryable: true,
      message: 'Server error. Retrying...',
    }
  }

  if (errorMsg.includes('400') || errorMsg.includes('invalid')) {
    return {
      type: 'client',
      isRetryable: false,
      message: 'Invalid request. Please check your input.',
    }
  }

  return {
    type: 'unknown',
    isRetryable: true,
    message: 'Request failed. Retrying...',
  }
}
