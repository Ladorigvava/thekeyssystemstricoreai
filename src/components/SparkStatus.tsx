import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { storageState, flushStorage } from '@/lib/storage'
export function SparkStatus() {
  const [providers, setProviders] = useState<Record<string, boolean> | null>(
    null,
  )
  const [storage, setStorage] = useState(storageState)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [auth, setAuth] = useState(false)
  async function refresh() {
    setChecking(true)
    try {
      const config = await (await apiFetch('/api/config')).json()
      setProviders(config.providers)
      setAuth(config.authenticationRequired)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to check connections')
    } finally {
      setChecking(false)
    }
  }
  useEffect(() => {
    void refresh()
    const listener = () => setStorage(storageState)
    window.addEventListener('storage-status', listener)
    return () => window.removeEventListener('storage-status', listener)
  }, [])
  return (
    <section className="service-status" aria-label="Workspace services">
      <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
        {['openai', 'anthropic', 'google'].map((id) => (
          <span key={id} className="text-sm">
            <strong>
              {id === 'openai'
                ? 'OpenAI'
                : id === 'anthropic'
                  ? 'Anthropic'
                  : 'Google'}
            </strong>
            <span
              className={
                providers?.[id] ? 'text-primary' : 'text-muted-foreground'
              }
            >
              {' '}
              ·{' '}
              {providers
                ? providers[id]
                  ? 'Configured'
                  : 'Needs setup'
                : 'Checking…'}
            </span>
          </span>
        ))}
        <span className="text-sm text-muted-foreground">
          {storage === 'saved'
            ? 'Changes saved'
            : storage === 'saving'
              ? 'Saving…'
              : 'Unsaved changes — keep this tab open'}
        </span>
        <Button size="sm" variant="ghost" disabled={checking} onClick={refresh}>
          {checking ? 'Checking…' : 'Check connections'}
        </Button>
        {auth && (
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              try {
                await flushStorage()
                await apiFetch('/api/session', { method: 'DELETE' })
                window.location.reload()
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Unable to sign out')
              }
            }}
          >
            Sign out
          </Button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive mt-2">
          {error}
        </p>
      ) : providers &&
        !['openai', 'anthropic', 'google'].every((id) => providers[id]) ? (
        <p className="text-sm text-muted-foreground mt-2">
          Configure the missing providers on the app server to use all three
          cores. Account subscriptions do not supply API credentials.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mt-2">
          Configured credentials are verified when a model responds. Drive
          Fabric is not linked to this app.
        </p>
      )}
      {storage === 'unsaved' && (
        <p role="alert" className="text-sm text-destructive mt-2">
          A save failed or this workspace changed in another tab. Export
          completed work before reloading.
        </p>
      )}
    </section>
  )
}
