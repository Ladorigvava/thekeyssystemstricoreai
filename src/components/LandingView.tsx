import { CoreModeCard } from '@/components/CoreModeCard'
import { ConsoleCard } from '@/components/ConsoleCard'
import { SparkStatus } from '@/components/SparkStatus'
import { CORE_CONFIGS } from '@/lib/cores'
import { motion } from 'framer-motion'
import {
  Atom,
  Shield,
  Sparkle,
  FlowArrow,
  VideoCamera,
  Waveform,
} from '@phosphor-icons/react'

interface LandingViewProps {
  onSelectMode: (
    mode: 'chadrak' | 'nova' | 'triad' | 'tricore' | 'audio' | 'video',
  ) => void
}

export function LandingView({ onSelectMode }: LandingViewProps) {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 w-full overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-10 bg-gradient-to-b from-primary to-secondary rounded-full" />
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-1">
                AI Control Center
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Command Dashboard
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed ml-7">
            Access your AI reasoning cores and media generation tools. Select a
            system below to begin.
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Atom size={18} className="text-primary" weight="duotone" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                Core Reasoning Systems
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <CoreModeCard
                mode="tricore"
                title={CORE_CONFIGS.tricore.name}
                description={CORE_CONFIGS.tricore.description}
                onClick={() => onSelectMode('tricore')}
                icon={Atom}
              />
              <CoreModeCard
                mode="chadrak"
                title={CORE_CONFIGS.chadrak.name}
                description={CORE_CONFIGS.chadrak.description}
                onClick={() => onSelectMode('chadrak')}
                icon={Shield}
              />
              <CoreModeCard
                mode="nova"
                title={CORE_CONFIGS.nova.name}
                description={CORE_CONFIGS.nova.description}
                onClick={() => onSelectMode('nova')}
                icon={Sparkle}
              />
              <CoreModeCard
                mode="triad"
                title={CORE_CONFIGS.triad.name}
                description={CORE_CONFIGS.triad.description}
                onClick={() => onSelectMode('triad')}
                icon={FlowArrow}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <VideoCamera
                size={18}
                className="text-secondary"
                weight="duotone"
              />
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                Media Generation Studios
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CoreModeCard
                mode="video"
                title={CORE_CONFIGS.video.name}
                description={CORE_CONFIGS.video.description}
                onClick={() => onSelectMode('video')}
                icon={VideoCamera}
              />
              <CoreModeCard
                mode="audio"
                title={CORE_CONFIGS.audio.name}
                description={CORE_CONFIGS.audio.description}
                onClick={() => onSelectMode('audio')}
                icon={Waveform}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <ConsoleCard glass className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 glow-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 text-xs">System Status</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All AI cores operational. Multi-engine architecture active
                    with support for GPT-4, Claude, and Gemini models.
                  </p>
                </div>
              </div>
            </ConsoleCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
