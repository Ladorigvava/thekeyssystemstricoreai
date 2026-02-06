import { AIEngine } from './engines'

// Model parameter interface
export interface ModelParameters {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  stopSequences?: string[]
}

// Default parameters for different model families
export const DEFAULT_PARAMETERS: Record<string, ModelParameters> = {
  // GPT models
  'gpt-4o': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  'gpt-4o-mini': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  'gpt-4-turbo': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  'gpt-3.5-turbo': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  // o1 models have limited parameter support
  'o1': {
    temperature: 1.0, // Fixed, not adjustable
    maxTokens: 16384,
    topP: 1.0, // Not used
    frequencyPenalty: 0.0, // Not supported
    presencePenalty: 0.0, // Not supported
    stopSequences: []
  },
  'o1-mini': {
    temperature: 1.0, // Fixed, not adjustable
    maxTokens: 16384,
    topP: 1.0, // Not used
    frequencyPenalty: 0.0, // Not supported
    presencePenalty: 0.0, // Not supported
    stopSequences: []
  },
  // Claude models
  'claude-3.5-sonnet': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0, // Not directly supported, but we'll track it
    presencePenalty: 0.0, // Not directly supported
    stopSequences: []
  },
  'claude-3-opus': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  'claude-3-sonnet': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  'claude-3-haiku': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  // Gemini models
  'gemini-2.0-flash': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.95,
    frequencyPenalty: 0.0, // Not directly supported
    presencePenalty: 0.0, // Not directly supported
    stopSequences: []
  },
  'gemini-1.5-pro': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  'gemini-1.5-flash': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  },
  'gemini-exp-1114': {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    stopSequences: []
  }
}

// Parameter constraints per model
export interface ParameterConstraints {
  temperature: { min: number; max: number; step: number; disabled?: boolean }
  maxTokens: { min: number; max: number; step: number }
  topP: { min: number; max: number; step: number; disabled?: boolean }
  frequencyPenalty: { min: number; max: number; step: number; disabled?: boolean }
  presencePenalty: { min: number; max: number; step: number; disabled?: boolean }
}

export const MODEL_CONSTRAINTS: Record<string, ParameterConstraints> = {
  // GPT models - full parameter support
  'gpt-4o': {
    temperature: { min: 0, max: 2, step: 0.1 },
    maxTokens: { min: 1, max: 16384, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: -2, max: 2, step: 0.1 },
    presencePenalty: { min: -2, max: 2, step: 0.1 }
  },
  'gpt-4o-mini': {
    temperature: { min: 0, max: 2, step: 0.1 },
    maxTokens: { min: 1, max: 16384, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: -2, max: 2, step: 0.1 },
    presencePenalty: { min: -2, max: 2, step: 0.1 }
  },
  'gpt-4-turbo': {
    temperature: { min: 0, max: 2, step: 0.1 },
    maxTokens: { min: 1, max: 4096, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: -2, max: 2, step: 0.1 },
    presencePenalty: { min: -2, max: 2, step: 0.1 }
  },
  'gpt-3.5-turbo': {
    temperature: { min: 0, max: 2, step: 0.1 },
    maxTokens: { min: 1, max: 4096, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: -2, max: 2, step: 0.1 },
    presencePenalty: { min: -2, max: 2, step: 0.1 }
  },
  // o1 models - limited parameter support
  'o1': {
    temperature: { min: 1, max: 1, step: 0, disabled: true },
    maxTokens: { min: 1, max: 100000, step: 1024 },
    topP: { min: 1, max: 1, step: 0, disabled: true },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  'o1-mini': {
    temperature: { min: 1, max: 1, step: 0, disabled: true },
    maxTokens: { min: 1, max: 65536, step: 1024 },
    topP: { min: 1, max: 1, step: 0, disabled: true },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  // Claude models - temperature, top_p, max_tokens
  'claude-3.5-sonnet': {
    temperature: { min: 0, max: 1, step: 0.1 },
    maxTokens: { min: 1, max: 8192, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  'claude-3-opus': {
    temperature: { min: 0, max: 1, step: 0.1 },
    maxTokens: { min: 1, max: 4096, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  'claude-3-sonnet': {
    temperature: { min: 0, max: 1, step: 0.1 },
    maxTokens: { min: 1, max: 4096, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  'claude-3-haiku': {
    temperature: { min: 0, max: 1, step: 0.1 },
    maxTokens: { min: 1, max: 4096, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  // Gemini models - temperature, top_p, max_tokens
  'gemini-2.0-flash': {
    temperature: { min: 0, max: 2, step: 0.1 },
    maxTokens: { min: 1, max: 8192, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  'gemini-1.5-pro': {
    temperature: { min: 0, max: 2, step: 0.1 },
    maxTokens: { min: 1, max: 8192, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  'gemini-1.5-flash': {
    temperature: { min: 0, max: 2, step: 0.1 },
    maxTokens: { min: 1, max: 8192, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  },
  'gemini-exp-1114': {
    temperature: { min: 0, max: 2, step: 0.1 },
    maxTokens: { min: 1, max: 8192, step: 256 },
    topP: { min: 0, max: 1, step: 0.05 },
    frequencyPenalty: { min: 0, max: 0, step: 0, disabled: true },
    presencePenalty: { min: 0, max: 0, step: 0, disabled: true }
  }
}

// Get parameters for an engine (with fallback to defaults)
export function getParametersForEngine(engine: AIEngine): ModelParameters {
  const stored = localStorage.getItem(`model-params-${engine}`)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse stored parameters:', e)
    }
  }
  return DEFAULT_PARAMETERS[engine] || DEFAULT_PARAMETERS['gpt-4o']
}

// Save parameters for an engine
export function saveParametersForEngine(engine: AIEngine, params: ModelParameters): void {
  try {
    localStorage.setItem(`model-params-${engine}`, JSON.stringify(params))
  } catch (e) {
    console.error('Failed to save parameters:', e)
  }
}

// Reset parameters to defaults
export function resetParametersForEngine(engine: AIEngine): ModelParameters {
  localStorage.removeItem(`model-params-${engine}`)
  return DEFAULT_PARAMETERS[engine] || DEFAULT_PARAMETERS['gpt-4o']
}

// Get constraints for an engine
export function getConstraintsForEngine(engine: AIEngine): ParameterConstraints {
  return MODEL_CONSTRAINTS[engine] || MODEL_CONSTRAINTS['gpt-4o']
}

// Parameter presets for common use cases
export const PARAMETER_PRESETS = {
  creative: {
    name: 'Creative',
    description: 'High temperature for creative, diverse outputs',
    params: {
      temperature: 1.2,
      maxTokens: 4096,
      topP: 0.95,
      frequencyPenalty: 0.5,
      presencePenalty: 0.3
    }
  },
  balanced: {
    name: 'Balanced',
    description: 'Default balanced settings',
    params: {
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    }
  },
  precise: {
    name: 'Precise',
    description: 'Low temperature for focused, deterministic outputs',
    params: {
      temperature: 0.3,
      maxTokens: 4096,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    }
  },
  concise: {
    name: 'Concise',
    description: 'Short, to-the-point responses',
    params: {
      temperature: 0.5,
      maxTokens: 1024,
      topP: 0.95,
      frequencyPenalty: 0.2,
      presencePenalty: 0.0
    }
  },
  detailed: {
    name: 'Detailed',
    description: 'Long, comprehensive responses',
    params: {
      temperature: 0.7,
      maxTokens: 8192,
      topP: 1.0,
      frequencyPenalty: -0.2,
      presencePenalty: 0.1
    }
  }
}

// Get description for a parameter
export function getParameterDescription(param: string): string {
  const descriptions: Record<string, string> = {
    temperature: 'Controls randomness. Lower = more focused, higher = more creative',
    maxTokens: 'Maximum length of the response',
    topP: 'Nucleus sampling. Lower = more focused vocabulary',
    frequencyPenalty: 'Reduces repetition of token frequencies',
    presencePenalty: 'Reduces repetition of topics'
  }
  return descriptions[param] || ''
}
