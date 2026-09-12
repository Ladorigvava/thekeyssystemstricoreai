import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'

async function loadModule(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, platform: 'node', format: 'esm' })
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
}
const engines = await loadModule('src/lib/engines.ts')
const analytics = await loadModule('src/lib/performance-analytics.ts')
const costs = await loadModule('src/lib/cost-tracking.ts')
const storage = new Map()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
} })

test('registry preserves every model with a cost mapping and stable storage keys', () => {
  assert.deepEqual(Object.keys(engines.ENGINE_CONFIGS).sort(), Object.keys(costs.MODEL_COSTS).sort())
  assert.equal(engines.DEFAULT_ENGINE, 'gpt-4o')
  assert.equal(engines.getEngineStorageKey('video'), 'tri-core-engine-video')
  for (const [id, config] of Object.entries(engines.ENGINE_CONFIGS)) {
    assert.equal(id, config.id)
    assert.ok(config.name && config.provider && config.capabilities.includes('text'))
  }
})

test('metrics distinguish successful quality from failed requests and retain all costs', () => {
  storage.clear()
  analytics.logPerformance('gpt-4o', 'coding', 8, 1000, 0.1)
  analytics.logPerformance('gpt-4o', 'coding', 6, 3000, 0.2)
  analytics.logPerformance('gpt-4o-mini', 'coding', 0, 500, 0.1, false)
  const result = analytics.getPerformanceMetrics()
  assert.equal(result.totalQueries, 3)
  assert.equal(result.avgQualityScore, 7)
  assert.equal(result.avgResponseTime, 2000)
  assert.ok(Math.abs(result.totalCost - 0.4) < 1e-10)
  assert.equal(result.topEngines[0].sampleSize, 2)
  assert.equal(result.recentTrends[0].queries, 3)
})

test('malformed storage and invalid records are ignored without crashing', () => {
  for (const value of ['broken', '{}', 'null', '[null,{}, {"engine":"toString"}]']) {
    storage.set('performance_analytics', value)
    assert.equal(analytics.getPerformanceMetrics().totalQueries, 0)
  }
  analytics.logPerformance('gpt-4o', 'coding', NaN, 1, 1)
  assert.equal(analytics.getPerformanceMetrics().totalQueries, 0)
})

test('recommendations use successful observations and express missing evidence', () => {
  storage.clear()
  assert.equal(analytics.recommendEngine('coding')[0].confidence, 0)
  for (let i = 0; i < 10; i++) {
    analytics.logPerformance('gpt-4o', 'coding', 9, 2000, 0.2)
    analytics.logPerformance('gpt-4o-mini', 'coding', 7, 1000, 0.1)
  }
  assert.equal(analytics.recommendEngine('coding', 'quality')[0].engine, 'gpt-4o')
  assert.equal(analytics.recommendEngine('coding', 'speed')[0].engine, 'gpt-4o-mini')
  assert.equal(analytics.recommendEngine('coding', 'cost')[0].engine, 'gpt-4o-mini')
  analytics.clearAnalytics()
  assert.equal(analytics.getPerformanceMetrics().totalQueries, 0)
})

test('analytics storage is bounded at 1000 records', () => {
  storage.clear()
  for (let i = 0; i < 1005; i++) analytics.logPerformance('gpt-4o', 'general', 5, 1, 0)
  assert.equal(analytics.getPerformanceMetrics().totalQueries, 1000)
})
