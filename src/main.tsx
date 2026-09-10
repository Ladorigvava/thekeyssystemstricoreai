import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'

import App from './App.tsx'
import { WorkspaceGate } from './components/WorkspaceGate'
import { ErrorFallback } from './ErrorFallback.tsx'

import './main.css'
import './styles/theme.css'
import './index.css'
import './workspace.css'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <WorkspaceGate>
      <App />
    </WorkspaceGate>
  </ErrorBoundary>,
)
