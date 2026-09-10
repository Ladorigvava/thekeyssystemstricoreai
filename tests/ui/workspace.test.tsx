import { beforeEach, afterEach, test, expect, vi } from 'vitest'
import {
  render,
  screen,
  waitFor,
  cleanup,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createApp } from '../../server/app.js'
import { mockProvider, testEnv } from '../fixtures.mjs'
import { WorkspaceGate } from '../../src/components/WorkspaceGate'
import App from '../../src/App'
import { flushStorage, resetStorage } from '../../src/lib/storage'
import { transferableAbortController } from 'node:util'
import {
  cacheResponse,
  getCachedResponse,
  getAllCachedResponses,
} from '../../src/lib/cache'

const nativeFetch = globalThis.fetch
let server: ReturnType<ReturnType<typeof createApp>['app']['listen']>
let runtime: ReturnType<typeof createApp>
let failAnthropic = false
let stallProviders = false
beforeEach(async () => {
  failAnthropic = false
  stallProviders = false
  window.history.replaceState({}, '', '/')
  localStorage.clear()
  runtime = createApp({
    env: testEnv,
    staticDirectory: process.cwd() + '/dist',
    databasePath: ':memory:',
    fetchImpl: (url, init) =>
      stallProviders
        ? new Promise((_resolve, reject) =>
            init.signal.addEventListener('abort', () =>
              reject(new Error('Cancelled fixture')),
            ),
          )
        : failAnthropic && String(url).includes('anthropic')
          ? Promise.resolve(
              Response.json({ error: 'test outage' }, { status: 503 }),
            )
          : mockProvider(url, init),
  })
  server = runtime.app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as { port: number }
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    // Bridge JSDOM signals into Node's fetch realm without disabling cancellation.
    const controller = transferableAbortController()
    if (init?.signal?.aborted) controller.abort()
    else
      init?.signal?.addEventListener('abort', () => controller.abort(), {
        once: true,
      })
    return nativeFetch(`http://127.0.0.1:${address.port}${url}`, {
      ...init,
      signal: controller.signal,
    })
  })
})
afterEach(async () => {
  await flushStorage().catch(() => {})
  cleanup()
  resetStorage()
  if (server)
    await new Promise<void>((resolve) => server.close(() => resolve()))
  runtime?.close()
  vi.stubGlobal('fetch', nativeFetch)
})
const mount = () =>
  render(
    <WorkspaceGate>
      <App />
    </WorkspaceGate>,
  )

test('three-core analysis, model provenance, export controls and history survive reopening', async () => {
  const user = userEvent.setup()
  let view = mount()
  const prompt = await screen.findByLabelText('Command input')
  await user.type(prompt, 'Plan an internal workshop.')
  await user.click(
    screen.getByRole('button', { name: 'Run Tri-Core Analysis' }),
  )
  await screen.findByText('Run status: completed')
  expect(screen.getAllByText(/Response: test_/)).toHaveLength(3)
  expect(screen.getByRole('button', { name: 'Export Markdown' })).toBeTruthy()
  expect(screen.getByText('1 entry')).toBeTruthy()
  await flushStorage()
  view.unmount()
  view = mount()
  await screen.findByText('1 entry')
  expect(
    (screen.getByLabelText('Command input') as HTMLTextAreaElement).value,
  ).toBe('Plan an internal workshop.')
  await user.click(screen.getByRole('button', { name: 'View', exact: true }))
  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByText('Status: completed')).toBeTruthy()
  expect(within(dialog).getAllByText(/VERIFICATION FIXTURE/)).toHaveLength(3)
})
test('one failed provider keeps the other outputs and records partial status', async () => {
  failAnthropic = true
  const user = userEvent.setup()
  mount()
  await user.type(
    await screen.findByLabelText('Command input'),
    'Check a proposal.',
  )
  await user.click(
    screen.getByRole('button', { name: 'Run Tri-Core Analysis' }),
  )
  await screen.findByText('Run status: partial')
  expect(screen.getAllByText(/Response: test_/)).toHaveLength(2)
  expect(screen.getByRole('alert').textContent).toContain('503')
  expect(screen.getByText('1 entry')).toBeTruthy()
})
test('custom system prompts persist and single core navigation resets component state', async () => {
  const user = userEvent.setup()
  mount()
  await screen.findByLabelText('Command input')
  const novaPanel = screen.getByRole('region', { name: 'Nova Core panel' })
  await user.click(
    within(novaPanel).getByRole('button', { name: 'Edit System Prompt' }),
  )
  const editor = screen.getByLabelText('System Prompt')
  await user.clear(editor)
  await user.type(editor, 'Return a concise critique.')
  await user.click(screen.getByRole('button', { name: 'Save Changes' }))
  await flushStorage()
  expect(
    JSON.parse(
      runtime.db
        .prepare("SELECT value FROM kv WHERE key='custom-prompt-nova'")
        .get()!.value as string,
    ),
  ).toBe('Return a concise critique.')
  await user.click(
    screen.getByRole('button', { name: 'Nova Core', exact: true }),
  )
  await screen.findByRole('button', { name: 'Refine Narrative' })
  expect(
    screen.getByRole('combobox', { name: 'AI model' }).textContent,
  ).toContain('Claude Sonnet 5')
  await user.type(
    screen.getByLabelText('Input Console'),
    'Review the workshop outline.',
  )
  await user.click(screen.getByRole('button', { name: 'Refine Narrative' }))
  await waitFor(() =>
    expect(
      runtime.db.prepare("SELECT value FROM kv WHERE key='history-nova'").get(),
    ).toBeTruthy(),
  )
  await user.click(
    screen.getByRole('button', { name: 'Triad Core', exact: true }),
  )
  await screen.findByRole('button', { name: 'Create Plan' })
  expect(
    screen.getByRole('combobox', { name: 'AI model' }).textContent,
  ).toContain('Gemini 2.5 Pro')
})
test('audio studio applies its system prompt and saves a reusable production brief', async () => {
  const user = userEvent.setup()
  mount()
  await screen.findByLabelText('Command input')
  await user.click(
    screen.getByRole('button', { name: 'Audio Studio', exact: true }),
  )
  const description = await screen.findByLabelText('Main Idea / Description')
  await user.type(
    description,
    'A short welcome voiceover for an internal workshop.',
  )
  const generate = screen
    .getAllByRole('button')
    .find((button) => /generate.*audio/i.test(button.textContent || ''))
  expect(generate).toBeTruthy()
  await user.click(generate!)
  await waitFor(() =>
    expect(
      runtime.db
        .prepare("SELECT value FROM kv WHERE key='history-audio'")
        .get(),
    ).toBeTruthy(),
  )
  expect(screen.getByText('1 entry')).toBeTruthy()
  expect(screen.getAllByText(/VERIFICATION FIXTURE/).length).toBeGreaterThan(0)
})

test('cache preserves simultaneous core writes and never reuses a semantically similar input', async () => {
  mount()
  await screen.findByLabelText('Command input')
  await Promise.all([
    cacheResponse('Approve transaction X', 'Approved', 'gpt-5.2', 'chadrak'),
    cacheResponse('Assess narrative', 'Narrative', 'claude-sonnet-5', 'nova'),
    cacheResponse('Plan execution', 'Plan', 'gemini-2.5-pro', 'triad'),
  ])
  expect(await getAllCachedResponses()).toHaveLength(3)
  expect(
    await getCachedResponse('Approve transaction X', 'gpt-5.2', 'chadrak'),
  ).toBe('Approved')
  expect(
    await getCachedResponse(
      'Do NOT approve transaction X',
      'gpt-5.2',
      'chadrak',
    ),
  ).toBeNull()
  localStorage.setItem(
    'model-params-gpt-5.2',
    JSON.stringify({
      temperature: 0.1,
      maxTokens: 8192,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    }),
  )
  expect(
    await getCachedResponse('Approve transaction X', 'gpt-5.2', 'chadrak'),
  ).toBeNull()
})

test('cancel aborts an in-flight three-core run and never marks it complete', async () => {
  stallProviders = true
  const user = userEvent.setup()
  mount()
  await user.type(
    await screen.findByLabelText('Command input'),
    'Cancel this verification.',
  )
  await user.click(
    screen.getByRole('button', { name: 'Run Tri-Core Analysis' }),
  )
  await user.click(
    await screen.findByRole('button', { name: 'Cancel', exact: true }),
  )
  await screen.findByText('Run status: failed')
  expect(
    screen
      .getAllByRole('alert')
      .filter((item) => item.textContent?.includes('Cancelled')),
  ).toHaveLength(3)
  expect(screen.queryByText('Run status: completed')).toBeNull()
})

test('personas and supplied-material research have complete execution and persistence flows', async () => {
  const user = userEvent.setup()
  mount()
  await screen.findByLabelText('Command input')
  await user.click(
    screen.getByRole('button', { name: 'AI Personas', exact: true }),
  )
  await user.type(
    await screen.findByLabelText('Your input'),
    'Review the workshop outline.',
  )
  await user.click(screen.getByRole('button', { name: 'Run AI Personas' }))
  await waitFor(() =>
    expect(
      runtime.db
        .prepare("SELECT value FROM kv WHERE key='history-personas'")
        .get(),
    ).toBeTruthy(),
  )
  await user.click(
    screen.getByRole('button', { name: 'Research Agent', exact: true }),
  )
  await user.type(
    await screen.findByLabelText('Research topic or supplied material'),
    'Analyze this supplied workshop outline.',
  )
  await user.click(
    screen.getByRole('checkbox', { name: /Retrieve web source excerpts/ }),
  )
  await user.click(screen.getByRole('button', { name: 'Run Research Agent' }))
  await waitFor(() =>
    expect(
      runtime.db
        .prepare("SELECT value FROM kv WHERE key='history-research'")
        .get(),
    ).toBeTruthy(),
  )
  const saved = JSON.parse(
    runtime.db
      .prepare("SELECT value FROM kv WHERE key='history-research'")
      .get()!.value as string,
  )[0]
  expect(saved.status).toBe('completed')
  expect(saved.output).toContain('No live sources retrieved')
})

test('ensemble generates candidates, validates three judge votes and saves the result', async () => {
  const user = userEvent.setup()
  mount()
  await screen.findByLabelText('Command input')
  await user.click(
    screen.getByRole('button', { name: 'Ensemble Voting', exact: true }),
  )
  await user.type(
    await screen.findByLabelText('Your input'),
    'Choose a workshop plan.',
  )
  await user.click(screen.getByRole('button', { name: 'Run Ensemble Voting' }))
  await waitFor(() =>
    expect(
      runtime.db
        .prepare("SELECT value FROM kv WHERE key='history-ensemble'")
        .get(),
    ).toBeTruthy(),
  )
  const saved = JSON.parse(
    runtime.db
      .prepare("SELECT value FROM kv WHERE key='history-ensemble'")
      .get()!.value as string,
  )[0]
  expect(saved.status).toBe('completed')
  expect(saved.output).toContain(
    'Selected by majority vote: Candidate 1 (3/3 votes).',
  )
})
