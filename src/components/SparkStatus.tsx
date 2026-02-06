import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { WifiHigh, Warning } from '@phosphor-icons/react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ApiHealth {
  status: string
  keys: {
    anthropic: boolean
    openai: boolean
    google: boolean
  }
}

export function SparkStatus() {
  const [hasApiKeys, setHasApiKeys] = useState<boolean | null>(null)
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [backendError, setBackendError] = useState<string | null>(null)

  useEffect(() => {
    const checkApiKeys = async () => {
      setIsChecking(true)
      
      try {
        // Check backend API server health
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) {
          throw new Error('Backend API server not responding')
        }

        const health: ApiHealth = await response.json()
        setApiHealth(health)
        
        // Check if any API keys are configured on backend
        const keysConfigured = !!(health.keys.anthropic || health.keys.openai || health.keys.google)
        setHasApiKeys(keysConfigured)
        setBackendError(null)
      } catch (error) {
        console.error('Backend API check failed:', error)
        setBackendError(error instanceof Error ? error.message : 'Backend not available')
        setHasApiKeys(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkApiKeys()
  }, [])

  // Don't show anything while initially checking
  if (isChecking) {
    return null
  }

  // Show backend connection error
  if (backendError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Warning className="h-4 w-4" />
        <AlertTitle>Backend API Server Not Running</AlertTitle>
        <AlertDescription>
          The secure API proxy server is not responding. Start it with:
          <pre className="mt-2 text-xs bg-muted p-2 rounded">
npm run dev:api
          </pre>
          <p className="mt-2 text-xs text-muted-foreground">
            Or run both servers at once:
          </p>
          <pre className="mt-1 text-xs bg-muted p-2 rounded">
npm run dev:all
          </pre>
          <p className="mt-2 text-xs text-red-400">
            Error: {backendError}
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  // Show warning if no API keys are configured on backend
  if (!hasApiKeys) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Warning className="h-4 w-4" />
        <AlertTitle>No AI API Keys Configured</AlertTitle>
        <AlertDescription>
          AI features require API keys. Add them to your <code className="bg-muted px-1 py-0.5 rounded">.env</code> file:
          <br /><br />
          <strong>Get API keys from:</strong>
          <ul className="list-disc list-inside mt-2 text-xs space-y-1">
            <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI</a> - For GPT-4o models</li>
            <li><a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline">Anthropic</a> - For Claude models</li>
            <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a> - For Gemini models</li>
          </ul>
          <p className="mt-3 text-xs">
            Add to <code className="bg-muted px-1 py-0.5 rounded">.env</code> (without VITE_ prefix):
          </p>
          <pre className="mt-2 text-xs bg-muted p-2 rounded">
{`OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...`}
          </pre>
          <p className="mt-2 text-xs text-muted-foreground">
            Restart the backend server (npm run dev:api) after adding keys.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  // Show success indicator with which keys are configured
  const configuredKeys = []
  if (apiHealth?.keys.anthropic) configuredKeys.push('Anthropic')
  if (apiHealth?.keys.openai) configuredKeys.push('OpenAI')
  if (apiHealth?.keys.google) configuredKeys.push('Google')

  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
      <WifiHigh size={14} className="text-green-500" weight="bold" />
      <span>AI API Keys Configured: {configuredKeys.join(', ')}</span>
    </div>
  )
}
