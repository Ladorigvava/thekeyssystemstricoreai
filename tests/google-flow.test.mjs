import test from 'node:test'
import assert from 'node:assert/strict'
import { generateFlowBrief, buildFlowPrompt } from '../src/lib/google-flow.ts'

test('blank descriptions never reach a provider', async () => {
  let calls = 0
  await assert.rejects(generateFlowBrief({ description: ' ' }, '', undefined,
    async () => { calls++; throw new Error('unexpected request') }), /video idea/)
  assert.equal(calls, 0)
})

test('all creative settings reach OpenAI and the result is returned', async () => {
  const input = { description: 'A city at dawn', audience: 'Architects', duration: '30 seconds', platform: 'tiktok', tone: 'Calm' }
  const signal = new AbortController().signal
  const result = await generateFlowBrief(input, 'https://tks.example/', signal, async (url, options) => {
    assert.equal(url, 'https://tks.example/api/openai')
    assert.equal(options.signal, signal)
    const body = JSON.parse(options.body)
    assert.equal(body.model, 'gpt-4o')
    assert.equal(body.stream, false)
    for (const value of Object.values(input)) assert.ok(body.prompt.includes(value))
    return new Response(JSON.stringify({ choices: [{ message: { content: 'Scene 1: Sunrise' } }] }))
  })
  assert.equal(result, 'Scene 1: Sunrise')
})

test('OpenAI failure is surfaced without fallback or retry to another provider', async () => {
  let calls = 0
  await assert.rejects(generateFlowBrief({ description: 'City' }, '', undefined, async () => {
    calls++
    return new Response(JSON.stringify({ error: 'OpenAI key missing' }), { status: 500 })
  }), /OpenAI key missing/)
  assert.equal(calls, 1)
})

test('HTML from a static host and empty model output cannot masquerade as a brief', async () => {
  for (const body of ['<html>App</html>', JSON.stringify({ choices: [] }), JSON.stringify({ choices: [{ message: { content: ' ' } }] })]) {
    await assert.rejects(generateFlowBrief({ description: 'City' }, '', undefined,
      async () => new Response(body)), /no brief/)
  }
})

test('handoff prompt preserves the distinction between planning and generated video', () => {
  const prompt = buildFlowPrompt({ description: 'City' })
  assert.ok(prompt.includes('Do not claim a video was generated'))
  assert.ok(prompt.includes('Lado\napproves the final result'))
})
