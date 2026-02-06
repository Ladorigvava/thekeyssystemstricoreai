import { AIEngine } from './engines'
import { withRetryAndFallback } from './retry'
import { getParametersForEngine, type ModelParameters } from './model-parameters'

// Backend API proxy URL (keeps API keys secure on server)
// In development: http://localhost:3001
// In production (Heroku): relative to same server
const getAPIBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001'
  }
  // Production: use current host (same server)
  // IMPORTANT: This empty string means requests go to /api/openai on the SAME domain
  return ''
}

// Legacy: Direct API keys (only for non-proxied providers)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const GOOGLE_AI_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY
const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY

export async function callLLM(
  prompt: string, 
  model: AIEngine, 
  customParams?: Partial<ModelParameters>
): Promise<string> {
  // Check if window.spark exists (for backward compatibility if Spark returns)
  // BUT ignore it on localhost to force using our local proxy
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  
  if (!isLocalhost && window.spark && typeof window.spark.llm === 'function') {
    return window.spark.llm(prompt, model)
  }

  // Get parameters for this model
  const params = { ...getParametersForEngine(model), ...customParams }

  // Use retry logic with automatic fallback
  const result = await withRetryAndFallback(
    async (engine) => {
      if (engine.startsWith('gpt-') || engine.startsWith('o1')) {
        return callOpenAI(prompt, engine, params)
      } else if (engine.startsWith('claude-')) {
        return callAnthropic(prompt, engine, params)
      } else if (engine.startsWith('gemini-')) {
        return callGoogleAI(prompt, engine, params)
      } else if (engine.startsWith('mistral-') || engine.startsWith('codestral-')) {
        return callMistral(prompt, engine, params)
      } else if (engine.startsWith('command-')) {
        return callCohere(prompt, engine, params)
      } else if (engine.startsWith('groq-')) {
        return callGroq(prompt, engine, params)
      } else if (engine.startsWith('deepseek-')) {
        return callDeepSeek(prompt, engine, params)
      } else if (engine.startsWith('perplexity-')) {
        return callPerplexity(prompt, engine, params)
      } else if (engine.startsWith('huggingface-')) {
        return callHuggingFace(prompt, engine, params)
      }
      throw new Error('Unsupported model: ' + engine)
    },
    model
  )

  if (result.success && result.data) {
    if (result.fallbackUsed) {
      console.log(`Used fallback engine: ${result.fallbackEngine}`)
    }
    return result.data
  }

  throw result.error || new Error('Unknown error occurred')
}

export async function streamLLM(
  prompt: string, 
  model: AIEngine, 
  onChunk: (chunk: string) => void,
  customParams?: Partial<ModelParameters>
): Promise<string> {
  // Check if window.spark exists (for backward compatibility if Spark returns)
  // BUT ignore it on localhost to force using our local proxy
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'

  if (!isLocalhost && window.spark && typeof window.spark.llm === 'function') {
    // Fallback to non-streaming for Spark
    const result = await window.spark.llm(prompt, model)
    onChunk(result)
    return result
  }

  // Get parameters for this model
  const params = { ...getParametersForEngine(model), ...customParams }

  // Use retry logic with automatic fallback for streaming
  const result = await withRetryAndFallback(
    async (engine) => {
      if (engine.startsWith('gpt-') || engine.startsWith('o1')) {
        return streamOpenAI(prompt, engine, onChunk, params)
      } else if (engine.startsWith('claude-')) {
        return streamAnthropic(prompt, engine, onChunk, params)
      } else if (engine.startsWith('gemini-')) {
        return streamGoogleAI(prompt, engine, onChunk, params)
      }
      // Most new providers don't support streaming yet, fallback to non-streaming
      const response = await callLLM(prompt, engine, customParams)
      onChunk(response)
      return response
    },
    model
  )

  if (result.success && result.data) {
    if (result.fallbackUsed) {
      console.log(`Used fallback engine: ${result.fallbackEngine}`)
    }
    return result.data
  }

  throw result.error || new Error('Unknown error occurred')
}

async function callOpenAI(prompt: string, model: string, params: ModelParameters): Promise<string> {
  const response = await fetch(`${getAPIBase()}/api/openai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`OpenAI API error (${response.status}): ${error.error || response.statusText}`)
  }

  const data = await response.json()
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('OpenAI API returned invalid response structure')
  }
  return data.choices[0].message.content
}

async function streamOpenAI(
  prompt: string, 
  model: string, 
  onChunk: (chunk: string) => void,
  params: ModelParameters
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to .env file')
  }

  // Special handling for o1 models - they don't support streaming
  const isO1Model = model.startsWith('o1')
  
  if (isO1Model) {
    // Fallback to non-streaming for o1 models
    const result = await callOpenAI(prompt, model, params)
    onChunk(result)
    return result
  }

  const requestBody: any = {
    model: model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: params.maxTokens,
    temperature: params.temperature,
    top_p: params.topP,
    frequency_penalty: params.frequencyPenalty,
    presence_penalty: params.presencePenalty,
    stream: true
  }

  if (params.stopSequences && params.stopSequences.length > 0) {
    requestBody.stop = params.stopSequences
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`OpenAI API error (${response.status}): ${error.error?.message || response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('OpenAI streaming: Failed to get response reader')

  const decoder = new TextDecoder()
  let fullText = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              fullText += content
              onChunk(fullText)
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullText
}

async function callAnthropic(prompt: string, model: string, params: ModelParameters): Promise<string> {
  const response = await fetch(`${getAPIBase()}/api/anthropic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP,
      stop_sequences: params.stopSequences
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Anthropic API error (${response.status}): ${error.error || response.statusText}`)
  }

  const data = await response.json()
  if (!data.content?.[0]?.text) {
    throw new Error('Anthropic API returned invalid response structure')
  }
  return data.content[0].text
}

async function streamAnthropic(
  prompt: string,
  model: string,
  onChunk: (chunk: string) => void,
  params: ModelParameters
): Promise<string> {
  const response = await fetch(`${getAPIBase()}/api/anthropic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP,
      stop_sequences: params.stopSequences,
      stream: true
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Anthropic API error (${response.status}): ${error.error || response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Anthropic streaming: Failed to get response reader')

  const decoder = new TextDecoder()
  let fullText = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          try {
            const parsed = JSON.parse(data)
            
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullText += parsed.delta.text
              onChunk(fullText)
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullText
}

async function callGoogleAI(prompt: string, model: string, params: ModelParameters): Promise<string> {
  const response = await fetch(`${getAPIBase()}/api/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      top_p: params.topP
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Google AI API error (${response.status}): ${error.error || response.statusText}`)
  }

  const data = await response.json()
  
  // Handle safety blocks or other filter reasons
  if (data.candidates?.[0]?.finishReason && data.candidates[0].finishReason !== 'STOP') {
    throw new Error(`Google AI blocked response: ${data.candidates[0].finishReason}`)
  }
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Google AI API returned invalid response structure')
  }
  
  return data.candidates[0].content.parts[0].text
}

async function streamGoogleAI(
  prompt: string,
  model: string,
  onChunk: (chunk: string) => void,
  params: ModelParameters
): Promise<string> {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key not configured. Add VITE_GOOGLE_AI_API_KEY to .env file')
  }

  const requestBody: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: params.temperature,
      topP: params.topP,
      maxOutputTokens: params.maxTokens
    }
  }

  if (params.stopSequences && params.stopSequences.length > 0) {
    requestBody.generationConfig.stopSequences = params.stopSequences
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${GOOGLE_AI_API_KEY}&alt=sse`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Google AI API error (${response.status}): ${error.error?.message || response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Google AI streaming: Failed to get response reader')

  const decoder = new TextDecoder()
  let fullText = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          try {
            const parsed = JSON.parse(data)
            
            // Check for safety blocks
            const finishReason = parsed.candidates?.[0]?.finishReason
            if (finishReason && finishReason !== 'STOP' && finishReason !== '') {
              throw new Error(`Google AI blocked response: ${finishReason}`)
            }
            
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              fullText += text
              onChunk(fullText)
            }
          } catch (e) {
            // Re-throw safety blocks, skip malformed JSON
            if (e instanceof Error && e.message.includes('blocked')) {
              throw e
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullText
}

// Mistral AI
async function callMistral(prompt: string, model: string, params: ModelParameters): Promise<string> {
  if (!MISTRAL_API_KEY) {
    throw new Error('Mistral API key not configured. Add VITE_MISTRAL_API_KEY to .env file')
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: params.temperature,
      top_p: params.topP,
      max_tokens: params.maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Mistral API error (${response.status}): ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Cohere
async function callCohere(prompt: string, model: string, params: ModelParameters): Promise<string> {
  if (!COHERE_API_KEY) {
    throw new Error('Cohere API key not configured. Add VITE_COHERE_API_KEY to .env file')
  }

  const response = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COHERE_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      message: prompt,
      temperature: params.temperature,
      p: params.topP,
      max_tokens: params.maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Cohere API error (${response.status}): ${error.message || response.statusText}`)
  }

  const data = await response.json()
  return data.text
}

// Groq (Ultra-fast LPU inference)
async function callGroq(prompt: string, model: string, params: ModelParameters): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to .env file')
  }

  // Map our model names to Groq's actual model names
  const modelMap: Record<string, string> = {
    'groq-llama-3.3-70b': 'llama-3.3-70b-versatile',
    'groq-llama-3.1-8b': 'llama-3.1-8b-instant',
    'groq-mixtral-8x7b': 'mixtral-8x7b-32768'
  }
  
  const actualModel = modelMap[model] || model.replace('groq-', '')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: actualModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: params.temperature,
      top_p: params.topP,
      max_tokens: params.maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Groq API error (${response.status}): ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// DeepSeek
async function callDeepSeek(prompt: string, model: string, params: ModelParameters): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not configured. Add VITE_DEEPSEEK_API_KEY to .env file')
  }

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: params.temperature,
      top_p: params.topP,
      max_tokens: params.maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`DeepSeek API error (${response.status}): ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Perplexity (with web search)
async function callPerplexity(prompt: string, model: string, params: ModelParameters): Promise<string> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured. Add VITE_PERPLEXITY_API_KEY to .env file')
  }

  // Map our model names to Perplexity's actual model names
  const modelMap: Record<string, string> = {
    'perplexity-sonar-pro': 'sonar-pro',
    'perplexity-sonar': 'sonar'
  }
  
  const actualModel = modelMap[model] || model.replace('perplexity-', '')

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
    },
    body: JSON.stringify({
      model: actualModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: params.temperature,
      top_p: params.topP,
      max_tokens: params.maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Perplexity API error (${response.status}): ${error.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Hugging Face Inference API
async function callHuggingFace(prompt: string, model: string, params: ModelParameters): Promise<string> {
  if (!HUGGINGFACE_API_KEY) {
    throw new Error('Hugging Face API key not configured. Add VITE_HUGGINGFACE_API_KEY to .env file')
  }

  const modelMap: Record<string, string> = {
    'huggingface-meta-llama-3.3-70b': 'meta-llama/Llama-3.3-70B-Instruct',
    'huggingface-mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.3'
  }

  const hfModel = modelMap[model] || model.replace('huggingface-', '')

  const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        temperature: params.temperature,
        top_p: params.topP,
        max_new_tokens: params.maxTokens,
        return_full_text: false,
        do_sample: true
      },
      options: {
        wait_for_model: true,
        use_cache: false
      }
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(`Hugging Face API error (${response.status}): ${error.error || response.statusText}`)
  }

  const data = await response.json()
  
  // Handle various HF response formats
  if (Array.isArray(data)) {
    if (data[0]?.generated_text) {
      return data[0].generated_text
    }
  } else if (data.generated_text) {
    return data.generated_text
  } else if (typeof data === 'string') {
    return data
  }
  
  throw new Error('Hugging Face API returned invalid response structure')
}
