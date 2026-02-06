import { useState } from 'react'
import { LandingView } from '@/components/LandingView'
import { SingleCoreView } from '@/components/SingleCoreView'
import { TriCoreView } from '@/components/TriCoreView'
import { AudioVideoView } from '@/components/AudioVideoView'
import { ComparisonView } from '@/components/ComparisonView'
import { TemplateLibrary } from '@/components/TemplateLibrary'
import { DebateView } from '@/components/DebateView'
import { StreamingRaceView } from '@/components/StreamingRaceView'
import { PersonasView } from '@/components/PersonasView'
import { ResearchAgentView } from '@/components/ResearchAgentView'
import { EnsembleVotingView } from '@/components/EnsembleVotingView'
import { Sidebar } from '@/components/Sidebar'
import { ParticleBackground } from '@/components/ParticleBackground'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SwipeIndicator } from '@/components/SwipeIndicator'
import { CostDashboard } from '@/components/CostDashboard'
import { CORE_CONFIGS, CoreMode } from '@/lib/cores'
import { Toaster } from '@/components/ui/sonner'
import { List } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useEdgeSwipe } from '@/hooks/use-edge-swipe'

type View = 'landing' | CoreMode | 'comparison' | 'templates' | 'debate' | 'race' | 'personas' | 'research' | 'ensemble'

function App() {
  const [currentView, setCurrentView] = useState<View>('landing')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMenuHint, setShowMenuHint] = useState(true)
  const [costDashboardOpen, setCostDashboardOpen] = useState(false)

  useEdgeSwipe({
    onSwipeFromLeft: () => setSidebarOpen(true),
    edgeWidth: 30,
    minSwipeDistance: 80
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
        
        <div className="flex-1 lg:ml-80 relative z-10 w-full overflow-x-hidden">
          <motion.div 
            className="lg:hidden fixed top-4 left-4 z-30"
            whileTap={{ scale: 0.9 }}
          >
            <Button
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
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: 'easeInOut'
                  }}
                />
              )}
            </Button>
          </motion.div>

          {currentView === 'landing' && (
            <LandingView onSelectMode={handleSelectMode} />
          )}
          
          {currentView === 'chadrak' && (
            <SingleCoreView 
              config={CORE_CONFIGS.chadrak}
              onBack={handleBackToHome}
            />
          )}
          
          {currentView === 'nova' && (
            <SingleCoreView 
              config={CORE_CONFIGS.nova}
              onBack={handleBackToHome}
            />
          )}
          
          {currentView === 'triad' && (
            <SingleCoreView 
              config={CORE_CONFIGS.triad}
              onBack={handleBackToHome}
            />
          )}
          
          {currentView === 'tricore' && (
            <TriCoreView onBack={handleBackToHome} />
          )}
          
          {currentView === 'audio' && (
            <AudioVideoView 
              config={CORE_CONFIGS.audio}
              onBack={handleBackToHome}
            />
          )}
          
          {currentView === 'video' && (
            <AudioVideoView 
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
        </div>
        
        {costDashboardOpen && (
          <CostDashboard onClose={() => setCostDashboardOpen(false)} />
        )}
        
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App