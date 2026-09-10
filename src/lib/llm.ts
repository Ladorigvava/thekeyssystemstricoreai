import { AIEngine } from './engines'
import {
  getParametersForEngine,
  type ModelParameters,
} from './model-parameters'
import { apiFetch } from './api'
import { readSSE } from '../../shared/sse.js'

export interface LLMResult {
  answer: string
  responseId: string | null
  runId: string
  provider: string
  model: string
}
export type LLMOptions = Partial<ModelParameters> & {
  signal?: AbortSignal
  instructions?: string
  onResult?: (result: LLMResult) => void
}
export async function runLLM(
  prompt: string,
  model: AIEngine,
  onChunk?: (text: string) => void,
  options: LLMOptions = {},
): Promise<LLMResult> {
  const params = { ...getParametersForEngine(model), ...options }
  const response = await apiFetch('/api/ai', {
    method: 'POST',
    signal: options.signal,
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({
      prompt,
      model,
      instructions: options.instructions,
      stream: Boolean(onChunk),
      max_tokens: Math.max(256, Math.min(32768, params.maxTokens)),
      temperature: params.temperature,
      top_p: params.topP,
      stop_sequences: params.stopSequences,
    }),
  })
  let result: LLMResult | undefined
  if (response.headers.get('content-type')?.includes('text/event-stream')) {
    for await (const event of readSSE(response.body)) {
      if (event.type === 'error') throw new Error(event.error)
      if (event.type === 'delta') onChunk?.(event.text)
      if (event.type === 'done') result = event as LLMResult
    }
    if (!result)
      throw new Error('The response ended before completion. Please try again.')
  } else result = (await response.json()) as LLMResult
  if (!result?.answer?.trim())
    throw new Error('The model returned an empty response.')
  onChunk?.(result.answer)
  options.onResult?.(result)
  return result
}
export async function callLLM(
  prompt: string,
  model: AIEngine,
  options?: LLMOptions,
): Promise<string> {
  return (await runLLM(prompt, model, undefined, options)).answer
}
export async function streamLLM(
  prompt: string,
  model: AIEngine,
  onChunk: (text: string) => void,
  options?: LLMOptions,
): Promise<string> {
  return (await runLLM(prompt, model, onChunk, options)).answer
}
