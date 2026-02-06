export type AIEngine = 
  | 'gpt-4o' 
  | 'gpt-4o-mini'
  | 'o1'
  | 'o1-mini'
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
  | 'command-r-plus'
  | 'command-r'
  | 'groq-llama-3.3-70b'
  | 'groq-llama-3.1-8b'
  | 'groq-mixtral-8x7b'
  | 'deepseek-chat'
  | 'deepseek-coder'
  | 'perplexity-sonar-pro'
  | 'perplexity-sonar'
  | 'huggingface-meta-llama-3.3-70b'
  | 'huggingface-mistral-7b'

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mistral' | 'cohere' | 'groq' | 'deepseek' | 'perplexity' | 'huggingface'

export interface EngineConfig {
  id: AIEngine
  name: string
  description: string
  speed: 'fast' | 'balanced' | 'powerful' | 'ultra'
  costTier: 'economy' | 'standard' | 'premium' | 'ultra-premium'
  provider: AIProvider
  capabilities?: string[]
}

export const ENGINE_CONFIGS: Record<AIEngine, EngineConfig> = {
  'o1': {
    id: 'o1',
    name: 'OpenAI o1',
    description: 'Ultimate reasoning model with extended thinking',
    speed: 'ultra',
    costTier: 'ultra-premium',
    provider: 'openai',
    capabilities: ['text', 'deep-reasoning', 'complex-analysis', 'extended-thinking']
  },
  'o1-mini': {
    id: 'o1-mini',
    name: 'OpenAI o1-mini',
    description: 'Efficient reasoning at lower cost',
    speed: 'balanced',
    costTier: 'premium',
    provider: 'openai',
    capabilities: ['text', 'reasoning', 'analytical-tasks']
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Advanced reasoning & multimodal',
    speed: 'powerful',
    costTier: 'premium',
    provider: 'openai',
    capabilities: ['text', 'vision', 'multimodal', 'advanced-reasoning']
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast & efficient analysis',
    speed: 'fast',
    costTier: 'economy',
    provider: 'openai',
    capabilities: ['text', 'vision', 'fast-processing']
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Previous flagship with 128K context',
    speed: 'powerful',
    costTier: 'premium',
    provider: 'openai',
    capabilities: ['text', 'vision', 'long-context', 'advanced-reasoning']
  },
  'claude-3-7-sonnet-20250219': {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    description: 'Latest flagship with enhanced reasoning',
    speed: 'ultra',
    costTier: 'premium',
    provider: 'anthropic',
    capabilities: ['text', 'vision', 'advanced-reasoning', 'long-context', 'coding', 'extended-thinking']
  },
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Top-tier reasoning & coding',
    speed: 'ultra',
    costTier: 'premium',
    provider: 'anthropic',
    capabilities: ['text', 'vision', 'advanced-reasoning', 'long-context', 'coding']
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Lightning-fast intelligence',
    speed: 'fast',
    costTier: 'economy',
    provider: 'anthropic',
    capabilities: ['text', 'vision', 'fast-processing']
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Ultimate reasoning power',
    speed: 'ultra',
    costTier: 'ultra-premium',
    provider: 'anthropic',
    capabilities: ['text', 'vision', 'advanced-reasoning', 'long-context', 'complex-tasks']
  },
  'gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    description: 'Next-gen multimodal speed',
    speed: 'fast',
    costTier: 'economy',
    provider: 'google',
    capabilities: ['text', 'vision', 'multimodal', 'fast-processing']
  },
  'gemini-2.0-flash-thinking-exp': {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking',
    description: 'Experimental reasoning with thinking mode',
    speed: 'ultra',
    costTier: 'premium',
    provider: 'google',
    capabilities: ['text', 'vision', 'multimodal', 'deep-reasoning', 'extended-thinking']
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Massive context & reasoning',
    speed: 'powerful',
    costTier: 'premium',
    provider: 'google',
    capabilities: ['text', 'vision', 'multimodal', 'ultra-long-context', 'advanced-reasoning']
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Efficient multimodal AI',
    speed: 'balanced',
    costTier: 'standard',
    provider: 'google',
    capabilities: ['text', 'vision', 'multimodal', 'fast-processing']
  },
  'mistral-large-latest': {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    description: 'European flagship model',
    speed: 'powerful',
    costTier: 'premium',
    provider: 'mistral',
    capabilities: ['text', 'multilingual', 'advanced-reasoning', 'long-context']
  },
  'mistral-small-latest': {
    id: 'mistral-small-latest',
    name: 'Mistral Small',
    description: 'Cost-effective European AI',
    speed: 'fast',
    costTier: 'economy',
    provider: 'mistral',
    capabilities: ['text', 'multilingual', 'fast-processing']
  },
  'codestral-latest': {
    id: 'codestral-latest',
    name: 'Codestral',
    description: 'Code-specialized Mistral model',
    speed: 'balanced',
    costTier: 'standard',
    provider: 'mistral',
    capabilities: ['text', 'coding', 'code-completion', 'debugging']
  },
  'command-r-plus': {
    id: 'command-r-plus',
    name: 'Command R+',
    description: 'Enterprise RAG & retrieval',
    speed: 'powerful',
    costTier: 'premium',
    provider: 'cohere',
    capabilities: ['text', 'rag', 'retrieval', 'enterprise', 'multilingual']
  },
  'command-r': {
    id: 'command-r',
    name: 'Command R',
    description: 'Efficient retrieval model',
    speed: 'balanced',
    costTier: 'standard',
    provider: 'cohere',
    capabilities: ['text', 'rag', 'retrieval', 'multilingual']
  },
  'groq-llama-3.3-70b': {
    id: 'groq-llama-3.3-70b',
    name: 'Groq Llama 3.3 70B',
    description: 'Ultra-fast inference engine',
    speed: 'fast',
    costTier: 'economy',
    provider: 'groq',
    capabilities: ['text', 'ultra-fast', 'open-source']
  },
  'groq-llama-3.1-8b': {
    id: 'groq-llama-3.1-8b',
    name: 'Groq Llama 3.1 8B',
    description: 'Lightning-fast small model',
    speed: 'fast',
    costTier: 'economy',
    provider: 'groq',
    capabilities: ['text', 'ultra-fast', 'open-source', 'lightweight']
  },
  'groq-mixtral-8x7b': {
    id: 'groq-mixtral-8x7b',
    name: 'Groq Mixtral 8x7B',
    description: 'Fast mixture-of-experts',
    speed: 'fast',
    costTier: 'economy',
    provider: 'groq',
    capabilities: ['text', 'ultra-fast', 'moe', 'multilingual']
  },
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    description: 'Chinese competitive model',
    speed: 'balanced',
    costTier: 'economy',
    provider: 'deepseek',
    capabilities: ['text', 'multilingual', 'chinese', 'reasoning']
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    description: 'Specialized coding model',
    speed: 'balanced',
    costTier: 'economy',
    provider: 'deepseek',
    capabilities: ['text', 'coding', 'chinese', 'debugging']
  },
  'perplexity-sonar-pro': {
    id: 'perplexity-sonar-pro',
    name: 'Perplexity Sonar Pro',
    description: 'Web-connected reasoning',
    speed: 'powerful',
    costTier: 'premium',
    provider: 'perplexity',
    capabilities: ['text', 'web-search', 'real-time', 'citations']
  },
  'perplexity-sonar': {
    id: 'perplexity-sonar',
    name: 'Perplexity Sonar',
    description: 'Fast web-connected AI',
    speed: 'fast',
    costTier: 'standard',
    provider: 'perplexity',
    capabilities: ['text', 'web-search', 'real-time']
  },
  'huggingface-meta-llama-3.3-70b': {
    id: 'huggingface-meta-llama-3.3-70b',
    name: 'HF Llama 3.3 70B',
    description: 'Open-source via Hugging Face',
    speed: 'balanced',
    costTier: 'economy',
    provider: 'huggingface',
    capabilities: ['text', 'open-source', 'customizable']
  },
  'huggingface-mistral-7b': {
    id: 'huggingface-mistral-7b',
    name: 'HF Mistral 7B',
    description: 'Lightweight open model',
    speed: 'fast',
    costTier: 'economy',
    provider: 'huggingface',
    capabilities: ['text', 'open-source', 'lightweight', 'multilingual']
  }
}

export const DEFAULT_ENGINE: AIEngine = 'gpt-4o'

export function getEngineStorageKey(coreId: string): string {
  return `engine-${coreId}`
}
