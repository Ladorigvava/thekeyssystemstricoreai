import { useState, useEffect, lazy, Suspense } from 'react'
import { SparkStatus } from '@/components/SparkStatus'
import { decodeShareableLink } from '@/lib/export'
import { HistoryDetailModal } from '@/components/HistoryDetailModal'
const LandingView = lazy(() =>
  import('@/components/LandingView').then((module) => ({
    default: module.LandingView,
  })),
)
const SingleCoreView = lazy(() =>
  import('@/components/SingleCoreView').then((module) => ({
    default: module.SingleCoreView,
  })),
)
import { TriCoreView } from '@/components/TriCoreView'
const AudioVideoView = lazy(() =>
  import('@/components/AudioVideoView').then((module) => ({
    default: module.AudioVideoView,
  })),
)
const ComparisonView = lazy(() =>
  import('@/components/ComparisonView').then((module) => ({
    default: module.ComparisonView,
  })),
)
const TemplateLibrary = lazy(() =>
  import('@/components/TemplateLibrary').then((module) => ({
    default: module.TemplateLibrary,
  })),
)
const DebateView = lazy(() =>
  import('@/components/DebateView').then((module) => ({
    default: module.DebateView,
  })),
)
const StreamingRaceView = lazy(() =>
  import('@/components/StreamingRaceView').then((module) => ({
    default: module.StreamingRaceView,
  })),
)
const PersonasView = lazy(() =>
  import('@/components/PersonasView').then((module) => ({
    default: module.PersonasView,
  })),
)
const ResearchAgentView = lazy(() =>
  import('@/components/ResearchAgentView').then((module) => ({
    default: module.ResearchAgentView,
  })),
)
const EnsembleVotingView = lazy(() =>
  import('@/components/EnsembleVotingView').then((module) => ({
    default: module.EnsembleVotingView,
  })),
)
import { Sidebar } from '@/components/Sidebar'
import { ParticleBackground } from '@/components/ParticleBackground'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SwipeIndicator } from '@/components/SwipeIndicator'
const CostDashboard = lazy(() =>
  import('@/components/CostDashboard').then((module) => ({
    default: module.CostDashboard,
  })),
)
import { CORE_CONFIGS, CoreMode } from '@/lib/cores'
import { Toaster } from '@/components/ui/sonner'
import { List } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useEdgeSwipe } from '@/hooks/use-edge-swipe'

type View =
  | 'landing'
  | CoreMode
  | 'comparison'
  | 'templates'
  | 'debate'
  | 'race'
  | 'personas'
  | 'research'
  | 'ensemble'

function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    const view = location.hash.slice(1)
    return [
      'landing',
      'tricore',
      'chadrak',
      'nova',
      'triad',
      'video',
      'audio',
      'comparison',
      'templates',
      'debate',
      'race',
      'ensemble',
      'research',
      'personas',
    ].includes(view)
      ? (view as View)
      : 'tricore'
  })
  const [sharedEntry, setSharedEntry] = useState(() => {
    try {
      const raw = location.hash.startsWith('#share=')
        ? decodeURIComponent(location.hash.slice(7))
        : new URLSearchParams(location.search).get('share')
      return raw ? decodeShareableLink(raw) : null
    } catch {
      return null
    }
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMenuHint, setShowMenuHint] = useState(true)
  const [costDashboardOpen, setCostDashboardOpen] = useState(false)

  useEffect(() => {
    if (!sharedEntry) location.hash = currentView
  }, [currentView, sharedEntry])
  useEffect(() => {
    const changed = () => {
      const view = location.hash.slice(1)
      if (
        [
          'landing',
          'tricore',
          'chadrak',
          'nova',
          'triad',
          'video',
          'audio',
          'comparison',
          'templates',
          'debate',
          'race',
          'ensemble',
          'research',
          'personas',
        ].includes(view)
      )
        setCurrentView(view as View)
    }
    window.addEventListener('hashchange', changed)
    return () => window.removeEventListener('hashchange', changed)
  }, [])

  useEdgeSwipe({
    onSwipeFromLeft: () => setSidebarOpen(true),
    edgeWidth: 30,
    minSwipeDistance: 80,
  })

  const handleSelectMode = (mode: CoreMode) => {
    setCurrentView(mode)
  }

  const handleBackToHome = () => {
    setCurrentView('landing')
  }

  const handleMenuOpen = () => {
    setSidebarOpen(true)
    setShowMenuHint(false)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex overflow-x-hidden">
        <ParticleBackground />

        <Sidebar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCostDashboard={() => setCostDashboardOpen(true)}
        />

        <SwipeIndicator isOpen={sidebarOpen} />

        <div className="app-content flex-1 min-w-0 lg:ml-72 relative z-10 w-full">
          <motion.div
            className="lg:hidden fixed top-4 left-4 z-30"
            whileTap={{ scale: 0.9 }}
          >
            <Button
              aria-label="Open navigation"
              onClick={handleMenuOpen}
              size="icon"
              variant="outline"
              className="glass-panel glow-primary shadow-lg hover:shadow-primary/50 transition-shadow relative"
            >
              <motion.div
                animate={sidebarOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ type: 'spring', damping: 20 }}
              >
                <List size={20} weight="bold" />
              </motion.div>

              {showMenuHint && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </Button>
          </motion.div>

          <SparkStatus />
          <Suspense
            fallback={
              <p role="status" className="p-8">
                Opening workspace…
              </p>
            }
          >
            {currentView === 'landing' && (
              <LandingView onSelectMode={handleSelectMode} />
            )}

            {currentView === 'chadrak' && (
              <SingleCoreView
                key="chadrak"
                config={CORE_CONFIGS.chadrak}
                onBack={handleBackToHome}
              />
            )}

            {currentView === 'nova' && (
              <SingleCoreView
                key="nova"
                config={CORE_CONFIGS.nova}
                onBack={handleBackToHome}
              />
            )}

            {currentView === 'triad' && (
              <SingleCoreView
                key="triad"
                config={CORE_CONFIGS.triad}
                onBack={handleBackToHome}
              />
            )}

            {currentView === 'tricore' && (
              <TriCoreView onBack={handleBackToHome} />
            )}

            {currentView === 'audio' && (
              <AudioVideoView
                key="audio"
                config={CORE_CONFIGS.audio}
                onBack={handleBackToHome}
              />
            )}

            {currentView === 'video' && (
              <AudioVideoView
                key="video"
                config={CORE_CONFIGS.video}
                onBack={handleBackToHome}
              />
            )}

            {currentView === 'comparison' && (
              <ComparisonView onBack={handleBackToHome} />
            )}

            {currentView === 'templates' && (
              <TemplateLibrary onBack={handleBackToHome} />
            )}

            {currentView === 'debate' && (
              <DebateView onBack={handleBackToHome} />
            )}

            {currentView === 'race' && (
              <StreamingRaceView onBack={handleBackToHome} />
            )}

            {currentView === 'personas' && (
              <PersonasView onBack={handleBackToHome} />
            )}

            {currentView === 'research' && (
              <ResearchAgentView onBack={handleBackToHome} />
            )}

            {currentView === 'ensemble' && (
              <EnsembleVotingView onBack={handleBackToHome} />
            )}
          </Suspense>
        </div>

        {costDashboardOpen && (
          <Suspense fallback={null}>
            <CostDashboard onClose={() => setCostDashboardOpen(false)} />
          </Suspense>
        )}

        <HistoryDetailModal
          entry={sharedEntry}
          open={Boolean(sharedEntry)}
          onOpenChange={(open) => {
            if (!open) setSharedEntry(null)
          }}
        />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
