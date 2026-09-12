// Legacy model identifiers are preserved for existing saved selections and routes.
// Metadata is descriptive, not a guarantee of current provider availability/pricing.
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere' | 'groq' | 'deepseek' | 'perplexity' | 'huggingface'
export type AIEngine = 'gpt-4o'
  | 'gpt-4o-mini'
  | 'o1'
  | 'o1-mini'
  | 'o3-mini'
  | 'gpt-4-turbo'
  | 'claude-3-7-sonnet-20250219'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229'
  | 'gemini-2.0-flash-exp'
  | 'gemini-2.0-flash-thinking-exp'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'mistral-large-latest'
  | 'mistral-small-latest'
  | 'codestral-latest'
  | 'command-r-plus-08-2024'
  | 'command-r-08-2024'
  | 'groq-llama-3.3-70b'
  | 'groq-llama-3.1-8b'
  | 'groq-mixtral-8x7b'
  | 'deepseek-chat'
  | 'deepseek-reasoner'
  | 'perplexity-sonar-pro'
  | 'perplexity-sonar'
  | 'huggingface-meta-llama-3.3-70b'
  | 'huggingface-qwen-2.5-72b'
export interface EngineConfig {
  id: AIEngine
  name: string
  description: string
  speed: 'fast' | 'balanced' | 'powerful' | 'ultra'
  costTier: 'economy' | 'standard' | 'premium' | 'ultra-premium'
  provider: AIProvider
  capabilities: string[]
}
export const ENGINE_CONFIGS: Record<AIEngine, EngineConfig> = {
  'gpt-4o': { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', speed: 'powerful', costTier: 'standard', description: 'GPT-4o via openai', capabilities: ['text'] },
  'gpt-4o-mini': { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', speed: 'fast', costTier: 'economy', description: 'GPT-4o Mini via openai', capabilities: ['text'] },
  'o1': { id: 'o1', name: 'OpenAI o1', provider: 'openai', speed: 'ultra', costTier: 'ultra-premium', description: 'OpenAI o1 via openai', capabilities: ['text'] },
  'o1-mini': { id: 'o1-mini', name: 'OpenAI o1 Mini', provider: 'openai', speed: 'powerful', costTier: 'premium', description: 'OpenAI o1 Mini via openai', capabilities: ['text'] },
  'o3-mini': { id: 'o3-mini', name: 'OpenAI o3 Mini', provider: 'openai', speed: 'balanced', costTier: 'premium', description: 'OpenAI o3 Mini via openai', capabilities: ['text'] },
  'gpt-4-turbo': { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', speed: 'powerful', costTier: 'premium', description: 'GPT-4 Turbo via openai', capabilities: ['text'] },
  'claude-3-7-sonnet-20250219': { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'anthropic', speed: 'powerful', costTier: 'premium', description: 'Claude 3.7 Sonnet via anthropic', capabilities: ['text'] },
  'claude-3-5-sonnet-20241022': { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', speed: 'powerful', costTier: 'premium', description: 'Claude 3.5 Sonnet via anthropic', capabilities: ['text'] },
  'claude-3-5-haiku-20241022': { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', speed: 'fast', costTier: 'economy', description: 'Claude 3.5 Haiku via anthropic', capabilities: ['text'] },
  'claude-3-opus-20240229': { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', speed: 'ultra', costTier: 'ultra-premium', description: 'Claude 3 Opus via anthropic', capabilities: ['text'] },
  'gemini-2.0-flash-exp': { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental', provider: 'google', speed: 'fast', costTier: 'economy', description: 'Gemini 2.0 Flash Experimental via google', capabilities: ['text'] },
  'gemini-2.0-flash-thinking-exp': { id: 'gemini-2.0-flash-thinking-exp', name: 'Gemini 2.0 Flash Thinking Experimental', provider: 'google', speed: 'powerful', costTier: 'standard', description: 'Gemini 2.0 Flash Thinking Experimental via google', capabilities: ['text'] },
  'gemini-1.5-pro': { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', speed: 'powerful', costTier: 'premium', description: 'Gemini 1.5 Pro via google', capabilities: ['text'] },
  'gemini-1.5-flash': { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', speed: 'fast', costTier: 'economy', description: 'Gemini 1.5 Flash via google', capabilities: ['text'] },
  'mistral-large-latest': { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'mistral', speed: 'powerful', costTier: 'premium', description: 'Mistral Large via mistral', capabilities: ['text'] },
  'mistral-small-latest': { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'mistral', speed: 'balanced', costTier: 'economy', description: 'Mistral Small via mistral', capabilities: ['text'] },
  'codestral-latest': { id: 'codestral-latest', name: 'Codestral', provider: 'mistral', speed: 'balanced', costTier: 'standard', description: 'Codestral via mistral', capabilities: ['text'] },
  'command-r-plus-08-2024': { id: 'command-r-plus-08-2024', name: 'Command R+', provider: 'cohere', speed: 'powerful', costTier: 'premium', description: 'Command R+ via cohere', capabilities: ['text'] },
  'command-r-08-2024': { id: 'command-r-08-2024', name: 'Command R', provider: 'cohere', speed: 'balanced', costTier: 'standard', description: 'Command R via cohere', capabilities: ['text'] },
  'groq-llama-3.3-70b': { id: 'groq-llama-3.3-70b', name: 'Groq Llama 3.3 70B', provider: 'groq', speed: 'fast', costTier: 'economy', description: 'Groq Llama 3.3 70B via groq', capabilities: ['text'] },
  'groq-llama-3.1-8b': { id: 'groq-llama-3.1-8b', name: 'Groq Llama 3.1 8B', provider: 'groq', speed: 'fast', costTier: 'economy', description: 'Groq Llama 3.1 8B via groq', capabilities: ['text'] },
  'groq-mixtral-8x7b': { id: 'groq-mixtral-8x7b', name: 'Groq Mixtral 8x7B', provider: 'groq', speed: 'fast', costTier: 'economy', description: 'Groq Mixtral 8x7B via groq', capabilities: ['text'] },
  'deepseek-chat': { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', speed: 'balanced', costTier: 'economy', description: 'DeepSeek Chat via deepseek', capabilities: ['text'] },
  'deepseek-reasoner': { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'deepseek', speed: 'powerful', costTier: 'standard', description: 'DeepSeek Reasoner via deepseek', capabilities: ['text'] },
  'perplexity-sonar-pro': { id: 'perplexity-sonar-pro', name: 'Perplexity Sonar Pro', provider: 'perplexity', speed: 'powerful', costTier: 'premium', description: 'Perplexity Sonar Pro via perplexity', capabilities: ['text'] },
  'perplexity-sonar': { id: 'perplexity-sonar', name: 'Perplexity Sonar', provider: 'perplexity', speed: 'fast', costTier: 'standard', description: 'Perplexity Sonar via perplexity', capabilities: ['text'] },
  'huggingface-meta-llama-3.3-70b': { id: 'huggingface-meta-llama-3.3-70b', name: 'HF Llama 3.3 70B', provider: 'huggingface', speed: 'balanced', costTier: 'economy', description: 'HF Llama 3.3 70B via huggingface', capabilities: ['text'] },
  'huggingface-qwen-2.5-72b': { id: 'huggingface-qwen-2.5-72b', name: 'HF Qwen 2.5 72B', provider: 'huggingface', speed: 'balanced', costTier: 'economy', description: 'HF Qwen 2.5 72B via huggingface', capabilities: ['text'] },
}
export const DEFAULT_ENGINE: AIEngine = 'gpt-4o'
export function getEngineStorageKey(coreId: string): string {
  return `tri-core-engine-${coreId}`
}

