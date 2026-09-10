import { useEffect, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import { initializeStorage, resetStorage } from '@/lib/storage'

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'login' | 'error'>(
    'loading',
  )
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function load() {
    setStatus('loading')
    setError('')
    try {
      const session = await (await apiFetch('/api/session')).json()
      if (!session.authenticated) {
        setStatus('login')
        return
      }
      await initializeStorage()
      setStatus('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Workspace unavailable.')
      setStatus('error')
    }
  }
  useEffect(() => {
    void load()
    const expired = () => {
      resetStorage()
      setStatus('login')
      setError('Your session expired. Sign in again.')
    }
    window.addEventListener('session-expired', expired)
    return () => window.removeEventListener('session-expired', expired)
  }, [])
  if (status === 'ready') return children
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 space-y-5">
        <p className="text-sm uppercase tracking-widest text-accent">
          The Keys Systems
        </p>
        <h1 className="text-2xl font-semibold">Tri-Core workspace</h1>
        {status === 'loading' ? (
          <p role="status">Opening your workspace…</p>
        ) : status === 'error' ? (
          <>
            <p role="alert">Unable to open the workspace: {error}</p>
            <Button onClick={load}>Try again</Button>
          </>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setBusy(true)
              setError('')
              try {
                await apiFetch('/api/session', {
                  method: 'POST',
                  body: JSON.stringify({ password }),
                })
                setPassword('')
                await load()
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Sign-in failed.')
              } finally {
                setBusy(false)
              }
            }}
          >
            <label htmlFor="workspace-password" className="block text-sm">
              Workspace password
            </label>
            <Input
              id="workspace-password"
              type="password"
              autoComplete="current-password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        )}
      </section>
    </main>
  )
}
