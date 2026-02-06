import { House, Atom, VideoCamera, Waveform, List, X, Database, Coin, ChartBar, FileText, Brain, Scales, Rabbit, UserCircle, Detective, Checks } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { CoreMode } from '@/lib/cores'
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { QualityAnalyticsDashboard } from '@/components/QualityAnalyticsDashboard'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { CacheManagementPanel } from '@/components/CacheManagementPanel'

type ExtendedView = 'landing' | CoreMode | 'comparison' | 'templates' | 'debate' | 'race' | 'personas' | 'research' | 'ensemble'

interface SidebarProps {
  currentView: ExtendedView
  onNavigate: (view: ExtendedView) => void
  isOpen: boolean
  onClose: () => void
  onOpenCostDashboard: () => void
}

const navItems = [
  { id: 'landing', label: 'Dashboard', icon: House, highlight: false },
  { id: 'tricore', label: 'Tri-Core Engine', icon: Atom, highlight: true },
  { id: 'comparison', label: 'Model Comparison', icon: ChartBar, highlight: true },
  { id: 'debate', label: 'AI Debate Arena', icon: Scales, highlight: true },
  { id: 'race', label: 'Streaming Race', icon: Rabbit, highlight: true },
  { id: 'ensemble', label: 'Ensemble Voting', icon: Checks, highlight: true },
  { id: 'research', label: 'Research Agent', icon: Detective, highlight: true },
  { id: 'personas', label: 'AI Personas', icon: UserCircle, highlight: true },
  { id: 'templates', label: 'Prompt Templates', icon: FileText, highlight: true },
  { id: 'chadrak', label: 'Chadrak Core', icon: Atom, highlight: false },
  { id: 'nova', label: 'Nova Core', icon: Atom, highlight: false },
  { id: 'triad', label: 'Triad Core', icon: Atom, highlight: false },
  { id: 'video', label: 'Video Studio', icon: VideoCamera, highlight: false },
  { id: 'audio', label: 'Audio Studio', icon: Waveform, highlight: false },
] as const

export function Sidebar({ currentView, onNavigate, isOpen, onClose, onOpenCostDashboard }: SidebarProps) {
  const [qualityDashboardOpen, setQualityDashboardOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-320, 0], [0, 1])
  const swipeIndicatorScale = useTransform(x, [-320, 0], [0, 1])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const shouldClose = info.offset.x < -100 || info.velocity.x < -500
    if (shouldClose) {
      onClose()
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        drag={isMobile && isOpen ? "x" : false}
        dragConstraints={{ left: -320, right: 0 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x: isMobile ? x : 0 }}
        initial={false}
        animate={{ x: isOpen || !isMobile ? 0 : -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-screen w-80 glass-panel border-r border-border/50 z-50 lg:translate-x-0 lg:z-0 flex flex-col touch-pan-y"
      >
        <div className="p-6 border-b border-border/30">
          {isMobile && isOpen && (
            <div className="absolute top-3 right-3 w-1 h-12 bg-muted-foreground/20 rounded-full overflow-hidden">
              <motion.div
                className="w-full h-full bg-primary/60"
                style={{ 
                  scaleY: swipeIndicatorScale,
                  transformOrigin: 'top'
                }}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-accent font-medium mb-1">
                The Keys Systems
              </div>
              <div className="text-xl font-bold tracking-tight text-foreground">
                Tri-Core AI Engine
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden -mr-2 hover:bg-destructive/20 hover:text-destructive"
            >
              <X size={20} />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Multi-Mode AI Command Bridge
          </div>
          {isMobile && isOpen && (
            <div className="text-[10px] text-muted-foreground/60 mt-3 flex items-center gap-1">
              <motion.div
                animate={{ x: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                ←
              </motion.div>
              Swipe left to close
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id as any)
                  onClose()
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                  ${isActive
                    ? 'bg-primary/20 text-primary border border-primary/30 glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                  }
                  ${item.highlight && !isActive ? 'hover:border-primary/20' : ''}
                `}
              >
                <Icon 
                  size={20} 
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-primary' : ''}
                />
                <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
                {item.highlight && !isActive && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                    PRO
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Connection</div>
            <OfflineIndicator />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start glow-accent"
            onClick={() => {
              onOpenCostDashboard()
              onClose()
            }}
          >
            <Coin size={16} weight="bold" />
            Cost Tracking
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start glow-purple"
            onClick={() => {
              setQualityDashboardOpen(true)
              onClose()
            }}
          >
            <Brain size={16} weight="bold" />
            Quality Analytics
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Database size={16} weight="bold" />
                Response Cache
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] p-0">
              <CacheManagementPanel />
            </DialogContent>
          </Dialog>
          
          <QualityAnalyticsDashboard 
            open={qualityDashboardOpen}
            onOpenChange={setQualityDashboardOpen}
          />
          
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="text-xs text-muted-foreground">Theme</div>
            <ThemeToggle />
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div>AI Control Center v2.0</div>
            <div className="text-[10px] opacity-60">Powered by Multi-Engine Architecture</div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
