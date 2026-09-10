import { createApp } from '../server/app.js'
import { testEnv, mockProvider } from './fixtures.mjs'
const { app } = createApp({
  env: testEnv,
  fetchImpl: mockProvider,
  databasePath: '/tmp/tri-core-browser-fixture.sqlite',
})
app.listen(3002, '127.0.0.1', () =>
  console.log(
    'Verification fixture only: http://127.0.0.1:3002 — no live AI calls.',
  ),
)
