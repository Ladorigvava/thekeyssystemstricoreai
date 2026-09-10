import catalog from '../shared/models.json' with { type: 'json' }
import { readSSE } from '../shared/sse.js'

export const PROVIDERS = {
  openai: { key: 'OPENAI_API_KEY', url: 'https://api.openai.com/v1/responses' },
  anthropic: {
    key: 'ANTHROPIC_API_KEY',
    url: 'https://api.anthropic.com/v1/messages',
  },
  google: {
    key: 'GOOGLE_AI_API_KEY',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/',
  },
  mistral: {
    key: 'MISTRAL_API_KEY',
    url: 'https://api.mistral.ai/v1/chat/completions',
  },
  cohere: { key: 'COHERE_API_KEY', url: 'https://api.cohere.com/v2/chat' },
  groq: {
    key: 'GROQ_API_KEY',
    url: 'https://api.groq.com/openai/v1/chat/completions',
  },
  deepseek: {
    key: 'DEEPSEEK_API_KEY',
    url: 'https://api.deepseek.com/chat/completions',
  },
  perplexity: {
    key: 'PERPLEXITY_API_KEY',
    url: 'https://api.perplexity.ai/chat/completions',
  },
  huggingface: {
    key: 'HUGGINGFACE_API_KEY',
    url: 'https://router.huggingface.co/v1/chat/completions',
  },
}
export class AppError extends Error {
  constructor(message, status = 500, code = 'REQUEST_FAILED') {
    super(message)
    this.status = status
    this.code = code
  }
}
export function configuredProviders(env) {
  return Object.fromEntries(
    Object.entries(PROVIDERS).map(([id, config]) => [
      id,
      Boolean(env[config.key] || (id === 'google' && env.GEMINI_API_KEY)),
    ]),
  )
}
export function buildRequest(input, env) {
  const config = Object.hasOwn(catalog, input.model)
    ? catalog[input.model]
    : null
  if (!config)
    throw new AppError(
      'Choose a supported model from the model selector.',
      400,
      'INVALID_MODEL',
    )
  const provider = config.provider
  const endpoint = PROVIDERS[provider]
  const key = env[endpoint.key] || (provider === 'google' && env.GEMINI_API_KEY)
  if (!key)
    throw new AppError(
      `${config.name} is not configured. Add ${endpoint.key} on the server.`,
      503,
      'PROVIDER_NOT_CONFIGURED',
    )
  const model = config.model || config.id
  const maxTokens = input.max_tokens ?? 8192
  const instructions = input.instructions || ''
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  }
  let url = endpoint.url
  let body
  const stream = input.stream && provider !== 'cohere'
  if (provider === 'openai') {
    body = {
      model,
      input: input.prompt,
      max_output_tokens: maxTokens,
      store: false,
      stream,
    }
    if (instructions) body.instructions = instructions
    if (/^(gpt-[56]|o[134])/.test(model)) body.reasoning = { effort: 'medium' }
    else {
      body.temperature = input.temperature ?? 0.7
      body.top_p = input.top_p ?? 1
    }
  } else if (provider === 'anthropic') {
    delete headers.Authorization
    headers['x-api-key'] = key
    headers['anthropic-version'] = '2023-06-01'
    body = {
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: input.prompt }],
      stream,
    }
    if (instructions) body.system = instructions
    // New Claude models do not accept temperature/top_p together; use provider defaults.
    if (input.stop_sequences?.length) body.stop_sequences = input.stop_sequences
  } else if (provider === 'google') {
    delete headers.Authorization
    headers['x-goog-api-key'] = key
    url += `${encodeURIComponent(model)}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`
    body = {
      contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: input.temperature ?? 1,
      },
    }
    if (instructions)
      body.systemInstruction = { parts: [{ text: instructions }] }
  } else {
    body = {
      model,
      messages: [
        ...(instructions ? [{ role: 'system', content: instructions }] : []),
        { role: 'user', content: input.prompt },
      ],
      max_tokens: maxTokens,
      stream,
    }
    if (provider !== 'deepseek' || model !== 'deepseek-reasoner')
      body.temperature = input.temperature ?? 0.7
  }
  return { provider, model, url, headers, body, stream }
}
function checkFinish(reason) {
  if (['length', 'max_tokens', 'MAX_TOKENS'].includes(reason))
    throw new AppError(
      'The model reached the response limit. Increase maximum output tokens and run again.',
      502,
      'INCOMPLETE_RESPONSE',
    )
  if (
    [
      'SAFETY',
      'RECITATION',
      'BLOCKLIST',
      'PROHIBITED_CONTENT',
      'content_filter',
      'refusal',
    ].includes(reason)
  )
    throw new AppError(
      'The provider declined this request. Revise the input and try again.',
      422,
      'PROVIDER_REFUSAL',
    )
}
export async function generate(
  input,
  { env, fetchImpl = fetch, signal, onDelta },
) {
  const request = buildRequest(input, env)
  const response = await fetchImpl(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(request.body),
    signal,
  })
  if (!response.ok) {
    // Never forward provider error bodies: some include request contents or credentials.
    const messages = {
      401: 'Provider authentication failed. Replace the server credential.',
      403: 'This provider account cannot access the selected model.',
      404: 'The selected model is unavailable to this provider account.',
      429: 'Provider rate or quota limit reached. Check the account and retry later.',
    }
    throw new AppError(
      messages[response.status] ||
        `The provider returned an error (${response.status}).`,
      response.status === 429 ? 429 : 502,
      `PROVIDER_${response.status}`,
    )
  }
  let answer = '',
    responseId = response.headers.get('x-request-id') || null,
    usage = null,
    completed = false
  const append = (text) => {
    if (typeof text === 'string' && text) {
      answer += text
      onDelta?.(answer)
    }
  }
  if (request.stream) {
    for await (const event of readSSE(response.body)) {
      if (
        event.error ||
        event.type === 'error' ||
        event.type === 'response.failed'
      )
        throw new AppError(
          'The provider interrupted the response. Try again.',
          502,
          'STREAM_FAILED',
        )
      if (request.provider === 'openai') {
        if (event.type === 'response.output_text.delta') append(event.delta)
        if (event.type === 'response.refusal.delta') append(event.delta)
        if (event.type === 'response.incomplete')
          throw new AppError(
            'The response is incomplete. Increase the output limit and retry.',
            502,
            'INCOMPLETE_RESPONSE',
          )
        if (event.type === 'response.completed') {
          completed = true
          responseId = event.response?.id || responseId
          usage = event.response?.usage
        }
      } else if (request.provider === 'anthropic') {
        if (event.type === 'message_start') {
          responseId = event.message?.id || responseId
          usage = event.message?.usage
        }
        if (
          event.type === 'content_block_delta' &&
          event.delta?.type === 'text_delta'
        )
          append(event.delta.text)
        if (event.type === 'message_delta') {
          checkFinish(event.delta?.stop_reason)
          usage = { ...usage, ...event.usage }
        }
        if (event.type === 'message_stop') completed = true
      } else if (request.provider === 'google') {
        if (event.promptFeedback?.blockReason)
          throw new AppError(
            'Google declined the input.',
            422,
            'PROVIDER_REFUSAL',
          )
        const candidate = event.candidates?.[0]
        for (const part of candidate?.content?.parts || [])
          if (!part.thought) append(part.text)
        checkFinish(candidate?.finishReason)
        if (candidate?.finishReason) completed = true
        responseId = event.responseId || responseId
        usage = event.usageMetadata || usage
      } else {
        append(event.choices?.[0]?.delta?.content)
        checkFinish(event.choices?.[0]?.finish_reason)
        if (event.choices?.[0]?.finish_reason) completed = true
        responseId = event.id || responseId
        usage = event.usage || usage
      }
    }
    if (!completed)
      throw new AppError(
        'Connection ended before the provider confirmed completion.',
        502,
        'INCOMPLETE_STREAM',
      )
  } else {
    const data = await response.json()
    responseId = data.id || data.responseId || responseId
    usage = data.usage || data.usageMetadata || null
    if (request.provider === 'openai') {
      if (data.status !== 'completed')
        throw new AppError(
          'The model returned an incomplete response.',
          502,
          'INCOMPLETE_RESPONSE',
        )
      append(
        data.output
          ?.flatMap((item) => item.content || [])
          .map((item) => item.text || item.refusal || '')
          .join(''),
      )
    } else if (request.provider === 'anthropic') {
      checkFinish(data.stop_reason)
      append(
        data.content
          ?.filter((item) => item.type === 'text')
          .map((item) => item.text)
          .join(''),
      )
    } else if (request.provider === 'google') {
      checkFinish(data.candidates?.[0]?.finishReason)
      append(
        data.candidates?.[0]?.content?.parts
          ?.filter((item) => !item.thought)
          .map((item) => item.text || '')
          .join(''),
      )
    } else if (request.provider === 'cohere') {
      checkFinish(data.finish_reason)
      append(
        data.message?.content
          ?.filter((item) => item.type === 'text')
          .map((item) => item.text)
          .join(''),
      )
    } else {
      checkFinish(data.choices?.[0]?.finish_reason)
      append(data.choices?.[0]?.message?.content)
    }
  }
  if (!answer.trim())
    throw new AppError(
      'The model returned no text. Try a larger output limit or revise the input.',
      502,
      'EMPTY_RESPONSE',
    )
  return {
    answer,
    responseId,
    provider: request.provider,
    model: request.model,
    usage,
  }
}
