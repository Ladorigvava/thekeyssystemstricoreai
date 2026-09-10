import express from 'express'
import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { z } from 'zod'
import { openDatabase } from './database.js'
import { AppError, configuredProviders, generate } from './providers.js'
import catalog from '../shared/models.json' with { type: 'json' }

const digest = (value) => createHash('sha256').update(value).digest('hex')
const schema = z
  .object({
    model: z.string().min(1).max(150),
    prompt: z.string().trim().min(1).max(100000),
    instructions: z.string().max(20000).optional(),
    stream: z.boolean().default(false),
    max_tokens: z.number().int().min(256).max(32768).default(8192),
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    stop_sequences: z.array(z.string().max(100)).max(4).optional(),
  })
  .strict()
export function createApp({
  env = process.env,
  fetchImpl = fetch,
  databasePath,
  staticDirectory,
  timeoutMs = 180000,
} = {}) {
  const production = env.NODE_ENV === 'production'
  const password = env.APP_ACCESS_PASSWORD || ''
  if (production && password.length < 16)
    throw new Error(
      'Set APP_ACCESS_PASSWORD to at least 16 characters before production startup.',
    )
  if (production && !/^https:\/\/[^/]+\/?$/.test(env.APP_ORIGIN || ''))
    throw new Error(
      'Set APP_ORIGIN to the HTTPS app origin before production startup.',
    )
  const db = openDatabase(
    databasePath || env.DATABASE_PATH || resolve('data/tri-core.sqlite'),
  )
  db.prepare(
    "UPDATE ai_runs SET status='failed', error='Server restarted before completion' WHERE status='running'",
  ).run()
  const app = express()
  app.disable('x-powered-by')
  if (env.TRUST_PROXY === '1') app.set('trust proxy', 1)
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'X-Frame-Options': 'DENY',
    })
    if (production) {
      res.set('Strict-Transport-Security', 'max-age=31536000')
      res.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://en.wikipedia.org https://eutils.ncbi.nlm.nih.gov; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
      )
    }
    if (req.path.startsWith('/api/')) res.set('Cache-Control', 'no-store')
    next()
  })
  app.use(express.json({ limit: '2mb' }))
  app.use('/api', (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const expected =
        env.APP_ORIGIN?.replace(/\/$/, '') ||
        `${req.protocol}://${req.get('host')}`
      if (req.get('origin') && req.get('origin') !== expected)
        return res.status(403).json({ error: 'Request origin is not allowed.' })
      if (req.get('sec-fetch-site') === 'cross-site')
        return res.status(403).json({ error: 'Cross-site request rejected.' })
      if (req.method !== 'DELETE' && !req.is('application/json'))
        return res.status(415).json({ error: 'Use application/json.' })
    }
    next()
  })
  function limited(key, maximum, windowMs = 60000) {
    const now = Date.now()
    db.prepare('DELETE FROM limits WHERE expires < ?').run(now)
    db.prepare(
      'INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1',
    ).run(key, now + windowMs)
    return (
      db.prepare('SELECT count FROM limits WHERE key=?').get(key).count >
      maximum
    )
  }
  const sessionHash = (req) =>
    digest(
      (req.get('cookie') || '')
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith('tks_session='))
        ?.slice(12) || '',
    )
  const authenticated = (req) =>
    !password ||
    Boolean(
      db
        .prepare('SELECT 1 FROM sessions WHERE token_hash=? AND expires>?')
        .get(sessionHash(req), Date.now()),
    )
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
  app.get('/api/session', (req, res) =>
    res.json({
      authenticated: authenticated(req),
      authenticationRequired: Boolean(password),
    }),
  )
  app.post('/api/session', (req, res) => {
    if (limited(`login:${req.ip}`, 10, 15 * 60000))
      return res
        .status(429)
        .json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' })
    if (
      !password ||
      typeof req.body.password !== 'string' ||
      req.body.password.length > 1024 ||
      !timingSafeEqual(
        Buffer.from(digest(req.body.password)),
        Buffer.from(digest(password)),
      )
    )
      return res.status(401).json({ error: 'The password is incorrect.' })
    db.prepare('DELETE FROM sessions WHERE expires<? OR token_hash=?').run(
      Date.now(),
      sessionHash(req),
    )
    const token = randomBytes(32).toString('hex')
    db.prepare('INSERT INTO sessions VALUES(?,?)').run(
      digest(token),
      Date.now() + 12 * 3600000,
    )
    res.cookie('tks_session', token, {
      httpOnly: true,
      secure: production,
      sameSite: 'strict',
      path: '/',
      maxAge: 12 * 3600000,
    })
    res.json({ authenticated: true })
  })
  app.delete('/api/session', (req, res) => {
    db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sessionHash(req))
    res.clearCookie('tks_session', {
      httpOnly: true,
      secure: production,
      sameSite: 'strict',
      path: '/',
    })
    res.json({ ok: true })
  })
  app.use('/api', (req, res, next) =>
    authenticated(req)
      ? next()
      : res
          .status(401)
          .json({
            error: 'Sign in to the workspace.',
            code: 'SESSION_REQUIRED',
          }),
  )
  app.get('/api/config', (_req, res) =>
    res.json({
      providers: configuredProviders(env),
      models: catalog,
      storage: 'sqlite',
      fabric: 'not_configured',
      authenticationRequired: Boolean(password),
    }),
  )
  app.get('/api/kv', (_req, res) =>
    res.json({
      entries: db
        .prepare('SELECT * FROM kv')
        .all()
        .map((row) => ({ ...row, value: JSON.parse(row.value) })),
    }),
  )
  app.get('/api/kv/:key', (req, res) => {
    const row = db
      .prepare('SELECT value,revision FROM kv WHERE key=?')
      .get(req.params.key)
    res.json(
      row
        ? { value: JSON.parse(row.value), revision: row.revision }
        : { value: null, revision: 0 },
    )
  })
  const keySchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/)
  app.put('/api/kv/:key', (req, res) => {
    if (
      !keySchema.safeParse(req.params.key).success ||
      !Number.isInteger(req.body.revision) ||
      !Object.hasOwn(req.body, 'value')
    )
      return res.status(400).json({ error: 'Invalid storage request.' })
    const data = JSON.stringify(req.body.value)
    if (data.length > 1500000)
      return res.status(413).json({ error: 'This saved item is too large.' })
    db.exec('BEGIN IMMEDIATE')
    try {
      const current =
        db.prepare('SELECT revision FROM kv WHERE key=?').get(req.params.key)
          ?.revision || 0
      if (current !== req.body.revision) {
        db.exec('ROLLBACK')
        return res
          .status(409)
          .json({
            error: 'This item changed in another tab. Reload before saving.',
            code: 'STORAGE_CONFLICT',
          })
      }
      db.prepare(
        'INSERT INTO kv VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, revision=excluded.revision',
      ).run(req.params.key, data, current + 1)
      db.exec('COMMIT')
      res.json({ revision: current + 1 })
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  })
  let active = 0
  app.post('/api/ai', async (req, res) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success)
      return res
        .status(400)
        .json({
          error:
            'Enter a prompt and a valid model. Maximum input: 100,000 characters; output limit: 256–32,768 tokens.',
          code: 'INVALID_INPUT',
        })
    if (!Object.hasOwn(catalog, parsed.data.model))
      return res
        .status(400)
        .json({ error: 'Choose a supported model.', code: 'INVALID_MODEL' })
    const id = req.get('Idempotency-Key') || randomUUID()
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id))
      return res.status(400).json({ error: 'Invalid request identifier.' })
    const requestHash = digest(
      JSON.stringify({ ...parsed.data, stream: false }),
    )
    const previous = db.prepare('SELECT * FROM ai_runs WHERE id=?').get(id)
    if (previous) {
      if (previous.request_hash !== requestHash)
        return res
          .status(409)
          .json({
            error: 'Request identifier was already used for different input.',
          })
      if (previous.status === 'completed')
        return res.json({
          ...JSON.parse(previous.result),
          runId: id,
          replayed: true,
        })
      return res
        .status(409)
        .json({
          error:
            'This request already ran or is still running. Use a new request to try again.',
          code: 'DUPLICATE_REQUEST',
        })
    }
    if (
      active >= 8 ||
      limited('ai:owner', Number(env.REQUESTS_PER_MINUTE || 60))
    ) {
      res.set('Retry-After', '60')
      return res
        .status(429)
        .json({ error: 'Workspace request limit reached. Try again shortly.' })
    }
    active++
    db.prepare(
      'INSERT INTO ai_runs(id,request_hash,model,status,started) VALUES(?,?,?,?,?)',
    ).run(id, requestHash, parsed.data.model, 'running', Date.now())
    const controller = new AbortController()
    const timer = setTimeout(
      () => controller.abort(new Error('Request timed out.')),
      timeoutMs,
    )
    const disconnected = () => {
      if (!res.writableEnded) controller.abort()
    }
    res.on('close', disconnected)
    const send = (event) => {
      if (!res.destroyed) res.write(`data: ${JSON.stringify(event)}\n\n`)
    }
    try {
      const result = await generate(parsed.data, {
        env,
        fetchImpl,
        signal: controller.signal,
        onDelta: parsed.data.stream
          ? (text) => {
              if (!res.headersSent) {
                res.set({
                  'Content-Type': 'text/event-stream',
                  'X-Accel-Buffering': 'no',
                })
                res.flushHeaders()
              }
              send({ type: 'delta', text })
            }
          : undefined,
      })
      db.prepare(
        "UPDATE ai_runs SET status='completed',result=? WHERE id=?",
      ).run(JSON.stringify(result), id)
      if (parsed.data.stream && res.headersSent) {
        send({ type: 'done', ...result, runId: id })
        res.end()
      } else res.json({ ...result, runId: id })
    } catch (error) {
      const known = error instanceof AppError
      const message = controller.signal.aborted
        ? 'Request cancelled or timed out.'
        : known
          ? error.message
          : 'Unable to reach the provider. Check server connectivity and try again.'
      const code = known
        ? error.code
        : controller.signal.aborted
          ? 'CANCELLED'
          : 'UPSTREAM_UNAVAILABLE'
      db.prepare("UPDATE ai_runs SET status='failed',error=? WHERE id=?").run(
        message,
        id,
      )
      if (!res.destroyed) {
        if (res.headersSent) {
          send({ type: 'error', error: message, code })
          res.end()
        } else
          res.status(known ? error.status : 502).json({ error: message, code })
      }
    } finally {
      active--
      clearTimeout(timer)
      res.off('close', disconnected)
    }
  })
  app.post('/api/knowledge/:source', async (req, res) => {
    const parsed = z
      .object({
        query: z.string().trim().min(1).max(2000),
        limit: z.number().int().min(1).max(10).default(5),
      })
      .safeParse(req.body)
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: 'Enter a query of at most 2,000 characters.' })
    if (limited('knowledge:owner', 30))
      return res
        .status(429)
        .json({ error: 'Search limit reached. Try again shortly.' })
    const { query, limit } = parsed.data
    let url,
      options = { signal: AbortSignal.timeout(20000) }
    if (req.params.source === 'web') {
      if (!env.SERPER_API_KEY)
        return res
          .status(503)
          .json({ error: 'Web search is not configured on the server.' })
      url = 'https://google.serper.dev/search'
      options = {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': env.SERPER_API_KEY,
        },
        body: JSON.stringify({ q: query, num: limit }),
      }
    } else if (req.params.source === 'wolfram') {
      if (!env.WOLFRAM_ALPHA_API_KEY)
        return res
          .status(503)
          .json({ error: 'Wolfram Alpha is not configured on the server.' })
      url = `https://api.wolframalpha.com/v2/query?${new URLSearchParams({ input: query, format: 'plaintext', output: 'JSON', appid: env.WOLFRAM_ALPHA_API_KEY })}`
    } else if (req.params.source === 'arxiv')
      url = `https://export.arxiv.org/api/query?${new URLSearchParams({ search_query: `all:${query}`, start: '0', max_results: String(limit) })}`
    else return res.status(404).json({ error: 'Unknown knowledge source.' })
    try {
      const upstream = await fetchImpl(url, options)
      if (!upstream.ok)
        return res
          .status(502)
          .json({ error: `Knowledge source returned ${upstream.status}.` })
      if (req.params.source === 'arxiv')
        res.type('application/xml').send(await upstream.text())
      else res.json(await upstream.json())
    } catch {
      res
        .status(502)
        .json({ error: 'Knowledge source unavailable. Please retry later.' })
    }
  })
  app.get('/api/runs', (_req, res) =>
    res.json({
      runs: db
        .prepare(
          'SELECT id, model, status, started, error FROM ai_runs ORDER BY started DESC LIMIT 100',
        )
        .all(),
    }),
  )
  app.use('/api', (_req, res) =>
    res.status(404).json({ error: 'API route not found.' }),
  )
  const dist =
    staticDirectory || fileURLToPath(new URL('../dist/', import.meta.url))
  app.use(express.static(dist, { dotfiles: 'deny', index: false }))
  app.get('*', (_req, res) => res.sendFile(resolve(dist, 'index.html')))
  app.use((error, _req, res, _next) => {
    if (!res.headersSent)
      res
        .status(
          error.status === 413 ? 413 : error instanceof SyntaxError ? 400 : 500,
        )
        .json({
          error:
            error.status === 413
              ? 'Request is too large.'
              : 'The request could not be processed.',
        })
  })
  return { app, db, close: () => db.close() }
}
