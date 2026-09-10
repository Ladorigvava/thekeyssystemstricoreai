import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createApp } from '../server/app.js'
import { readSSE } from '../shared/sse.js'
import { buildRequest } from '../server/providers.js'
import { testEnv, mockProvider, eventStream } from './fixtures.mjs'

async function start(t, options = {}) {
  const runtime = createApp({
    env: testEnv,
    fetchImpl: mockProvider,
    databasePath: ':memory:',
    ...options,
  })
  const server = runtime.app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const url = `http://127.0.0.1:${server.address().port}`
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    runtime.close()
  })
  const post = (path, body, headers = {}) =>
    fetch(url + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    })
  return { ...runtime, url, post }
}
const input = { model: 'gpt-5.2', prompt: 'Plan a small internal workshop.' }

test('each core routes to its own provider with server-only credentials and completion IDs', async (t) => {
  const calls = []
  const { post } = await start(t, {
    fetchImpl: (...args) => {
      calls.push(args)
      return mockProvider(...args)
    },
  })
  const models = ['gpt-5.2', 'claude-sonnet-5', 'gemini-2.5-pro']
  const results = await Promise.all(
    models.map((model) =>
      post('/api/ai', {
        ...input,
        model,
        stream: true,
        instructions: 'Assess the proposal.',
      }),
    ),
  )
  for (const [index, response] of results.entries()) {
    assert.equal(response.status, 200)
    const events = []
    for await (const event of readSSE(response.body)) events.push(event)
    const final = events.at(-1)
    assert.equal(final.type, 'done')
    assert.equal(final.model, models[index])
    assert.ok(final.responseId)
    assert.match(final.answer, /გამარჯობა/)
    assert.ok(events.some((event) => event.type === 'delta'))
    assert.ok(!JSON.stringify(events).includes('test-openai-only'))
  }
  assert.match(calls[0][0], /\/v1\/responses$/)
  assert.equal(JSON.parse(calls[0][1].body).store, false)
  assert.equal(JSON.parse(calls[1][1].body).system, 'Assess the proposal.')
  assert.ok(!calls[2][0].includes('test-google-only'))
  assert.equal(calls[2][1].headers['x-goog-api-key'], 'test-google-only')
})
test('normal response and repeated request return one charged invocation', async (t) => {
  let calls = 0
  const { post } = await start(t, {
    fetchImpl: (...args) => {
      calls++
      return mockProvider(...args)
    },
  })
  const headers = { 'Idempotency-Key': 'same-run' }
  const first = await (await post('/api/ai', input, headers)).json()
  const repeated = await (await post('/api/ai', input, headers)).json()
  assert.equal(first.answer, repeated.answer)
  assert.equal(repeated.replayed, true)
  assert.equal(calls, 1)
  assert.equal(
    (await post('/api/ai', { ...input, prompt: 'Different prompt' }, headers))
      .status,
    409,
  )
})
test('missing credentials, validation, unknown model, malformed JSON and API paths fail explicitly', async (t) => {
  const { post, url } = await start(t, { env: { NODE_ENV: 'test' } })
  const missing = await post('/api/ai', input)
  assert.equal(missing.status, 503)
  assert.equal((await missing.json()).code, 'PROVIDER_NOT_CONFIGURED')
  for (const body of [
    { ...input, prompt: ' ' },
    { ...input, model: 'arbitrary-model' },
    { ...input, max_tokens: 1 },
    { ...input, prompt: 'a'.repeat(100001) },
  ])
    assert.equal((await post('/api/ai', body)).status, 400)
  const invalid = await fetch(url + '/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  })
  assert.equal(invalid.status, 400)
  const unknown = await fetch(url + '/api/missing')
  assert.equal(unknown.status, 404)
  assert.match(unknown.headers.get('content-type'), /json/)
})
test('sessions protect all data and AI routes, reject CSRF and sign out', async (t) => {
  const { post, url } = await start(t, {
    env: { ...testEnv, APP_ACCESS_PASSWORD: 'test-password-not-a-live-secret' },
  })
  assert.equal((await fetch(url + '/api/config')).status, 401)
  assert.equal((await fetch(url + '/api/kv')).status, 401)
  assert.equal((await post('/api/ai', input)).status, 401)
  assert.equal((await post('/api/session', { password: 'wrong' })).status, 401)
  const login = await post('/api/session', {
    password: 'test-password-not-a-live-secret',
  })
  assert.equal(login.status, 200)
  const rawCookie = login.headers.get('set-cookie'),
    cookie = rawCookie.split(';')[0]
  assert.match(rawCookie, /HttpOnly/)
  assert.match(rawCookie, /SameSite=Strict/)
  assert.equal(
    (await fetch(url + '/api/kv', { headers: { cookie } })).status,
    200,
  )
  assert.equal(
    (
      await post('/api/ai', input, {
        cookie,
        origin: 'https://untrusted.example',
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await fetch(url + '/api/session', {
        method: 'DELETE',
        headers: { cookie },
      })
    ).status,
    200,
  )
  assert.equal(
    (await fetch(url + '/api/kv', { headers: { cookie } })).status,
    401,
  )
})
test('production refuses to run without private authentication and an HTTPS origin', () => {
  assert.throws(
    () => createApp({ env: { NODE_ENV: 'production' } }),
    /APP_ACCESS_PASSWORD/,
  )
  assert.throws(
    () =>
      createApp({
        env: {
          NODE_ENV: 'production',
          APP_ACCESS_PASSWORD: 'test-password-at-least-16',
        },
      }),
    /APP_ORIGIN/,
  )
})
test('storage survives restart and refuses stale writes from another tab', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'tri-core-test-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const path = join(dir, 'workspace.sqlite')
  const one = await start(t, { databasePath: path })
  const put = (base, value, revision) =>
    fetch(base + '/api/kv/history-tricore', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, revision }),
    })
  const saved = await put(one.url, [{ input: 'Persisted test' }], 0)
  assert.equal(saved.status, 200)
  assert.equal((await put(one.url, [], 0)).status, 409)
  const two = await start(t, { databasePath: path })
  const loaded = await (await fetch(two.url + '/api/kv/history-tricore')).json()
  assert.equal(loaded.value[0].input, 'Persisted test')
  assert.equal(loaded.revision, 1)
})
test('provider failure cannot become a successful or substituted model run', async (t) => {
  const { post, db } = await start(t, {
    fetchImpl: () =>
      Response.json({ error: 'sensitive details' }, { status: 401 }),
  })
  const response = await post('/api/ai', input)
  assert.equal(response.status, 502)
  const data = await response.json()
  assert.match(data.error, /authentication/)
  assert.ok(!data.error.includes('sensitive'))
  assert.equal(db.prepare('SELECT status FROM ai_runs').get().status, 'failed')
})
test('a truncated stream, provider limit and timeout are failed runs', async (t) => {
  const a = await start(t, {
    fetchImpl: () =>
      eventStream([
        { type: 'response.output_text.delta', delta: 'Partial text' },
      ]),
  })
  const response = await a.post('/api/ai', { ...input, stream: true })
  const events = []
  for await (const event of readSSE(response.body)) events.push(event)
  assert.equal(events.at(-1).type, 'error')
  assert.equal(events.at(-1).code, 'INCOMPLETE_STREAM')
  const b = await start(t, {
    timeoutMs: 20,
    fetchImpl: (_url, options) =>
      new Promise((_resolve, reject) =>
        options.signal.addEventListener('abort', () =>
          reject(options.signal.reason),
        ),
      ),
  })
  assert.equal((await b.post('/api/ai', input)).status, 502)
})
test('request limits are enforced without dropping successful provider results', async (t) => {
  const { post } = await start(t, {
    env: { ...testEnv, REQUESTS_PER_MINUTE: '1' },
  })
  assert.equal((await post('/api/ai', input)).status, 200)
  const limited = await post('/api/ai', input)
  assert.equal(limited.status, 429)
  assert.equal(limited.headers.get('retry-after'), '60')
})
test('knowledge credentials remain behind authenticated server routes', async (t) => {
  const { post } = await start(t)
  assert.equal(
    (await post('/api/knowledge/web', { query: 'test' })).status,
    503,
  )
  assert.equal(
    (await post('/api/knowledge/wolfram', { query: 'test' })).status,
    503,
  )
  assert.equal(
    (await post('/api/knowledge/unknown', { query: 'test' })).status,
    404,
  )
})
test('all supported routes keep secrets out of URLs and use a fixed provider destination', () => {
  const cases = [
    ['gpt-5.2', 'openai'],
    ['claude-sonnet-5', 'anthropic'],
    ['gemini-2.5-pro', 'google'],
  ]
  for (const [model, provider] of cases) {
    const request = buildRequest({ ...input, model }, testEnv)
    assert.equal(request.provider, provider)
    assert.ok(!request.url.includes('test-'))
    assert.ok(request.url.startsWith('https://'))
  }
})
