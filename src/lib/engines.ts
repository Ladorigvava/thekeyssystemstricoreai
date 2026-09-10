import catalog from '../../shared/models.json'
export type AIEngine = string
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'cohere'
  | 'groq'
  | 'deepseek'
  | 'perplexity'
  | 'huggingface'
export interface EngineConfig {
  id: AIEngine
  name: string
  description: string
  provider: AIProvider
  speed: 'fast' | 'balanced' | 'powerful' | 'ultra'
  costTier: 'economy' | 'standard' | 'premium' | 'ultra-premium'
  capabilities: string[]
  model?: string
}
export const ENGINE_CONFIGS = catalog as Record<AIEngine, EngineConfig>
export const DEFAULT_ENGINE: AIEngine = 'gpt-5.2'
export const CORE_ENGINES: Record<string, AIEngine> = {
  chadrak: 'gpt-5.2',
  nova: 'claude-sonnet-5',
  triad: 'gemini-2.5-pro',
  audio: 'gpt-5.2',
  video: 'gpt-5.2',
}
export const getEngineStorageKey = (coreId: string) =>
  `tri-core-engine-${coreId}`
