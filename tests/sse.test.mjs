import test from 'node:test'
import assert from 'node:assert/strict'
import { readSSE } from '../shared/sse.js'
import { eventStream } from './fixtures.mjs'
test('SSE decoder preserves Georgian characters across one-byte boundaries', async () => {
  const expected = [
    { type: 'delta', text: 'გამარჯობა 🌍' },
    { type: 'done', answer: 'café' },
  ]
  const actual = []
  for await (const event of readSSE(eventStream(expected, 1).body))
    actual.push(event)
  assert.deepEqual(actual, expected)
})
test('SSE decoder refuses silently truncated event data', async () => {
  const stream = new Response('data: {"type":"done"}')
  await assert.rejects(async () => {
    for await (const _ of readSSE(stream.body)) {
    }
  }, /final event/)
})
