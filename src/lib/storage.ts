import { useCallback, useSyncExternalStore } from 'react'
import { apiFetch } from './api'

type Entry = { value: unknown; revision: number }
const values = new Map<string, Entry>()
const listeners = new Set<() => void>()
const queues = new Map<string, Promise<void>>()
const failedKeys = new Set<string>()
const emit = () => listeners.forEach((listener) => listener())
export let storageState: 'saved' | 'saving' | 'unsaved' = 'saved'
const state = (next: typeof storageState) => {
  storageState = next
  window.dispatchEvent(new Event('storage-status'))
}
const refreshState = () =>
  state(failedKeys.size ? 'unsaved' : queues.size ? 'saving' : 'saved')
export async function initializeStorage() {
  const data = await (await apiFetch('/api/kv')).json()
  values.clear()
  for (const entry of data.entries)
    values.set(entry.key, { value: entry.value, revision: entry.revision })
  failedKeys.clear()
  refreshState()
  emit()
}
export function resetStorage() {
  values.clear()
  emit()
}
function ensure<T>(key: string, initial: T): Entry {
  if (!values.has(key)) values.set(key, { value: initial, revision: 0 })
  return values.get(key)!
}
function update<T>(
  key: string,
  updater: (old: T | undefined) => T,
): Promise<void> {
  const entry = ensure(key, undefined)
  const next = updater(entry.value as T | undefined)
  entry.value = next
  emit()
  const pending = (queues.get(key) || Promise.resolve())
    .catch(() => {})
    .then(async () => {
      const response = await apiFetch(`/api/kv/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify({ value: next, revision: entry.revision }),
      })
      entry.revision = (await response.json()).revision
    })
  queues.set(key, pending)
  refreshState()
  pending
    .then(() => {
      failedKeys.delete(key)
      if (queues.get(key) === pending) queues.delete(key)
      refreshState()
    })
    .catch(() => {
      failedKeys.add(key)
      if (queues.get(key) === pending) queues.delete(key)
      refreshState()
    })
  return pending
}
export const kv = {
  get: async <T>(key: string) => values.get(key)?.value as T | undefined,
  set: <T>(key: string, value: T) => update<T>(key, () => value),
  update,
  delete: (key: string) => update(key, () => null),
}
export function useKV<T>(
  key: string,
  initial: T,
): [T, (value: T | ((previous: T) => T)) => void] {
  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])
  const get = useCallback(() => ensure(key, initial).value as T, [key, initial])
  const value = useSyncExternalStore(subscribe, get)
  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      void update<T>(key, (previous) =>
        typeof next === 'function'
          ? (next as (previous: T) => T)(previous ?? initial)
          : next,
      ).catch(() => {})
    },
    [key, initial],
  )
  return [value, setValue]
}
export async function flushStorage() {
  await Promise.all([...queues.values()])
  if (failedKeys.size)
    throw new Error(
      'Some workspace changes are unsaved. Export your work before reloading.',
    )
}
window.addEventListener('beforeunload', (event) => {
  if (storageState !== 'saved') {
    event.preventDefault()
    event.returnValue = ''
  }
})
