import { CoreMode } from '@/lib/cores'
import { Icon } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { ConsoleCard } from '@/components/ConsoleCard'

interface CoreModeCardProps {
  mode: CoreMode
  title: string
  description: string
  onClick: () => void
  icon: Icon
}

const glowMap: Record<CoreMode, 'primary' | 'secondary' | 'accent' | 'chadrak' | 'nova' | 'triad' | 'none'> = {
  tricore: 'primary',
  chadrak: 'chadrak',
  nova: 'nova',
  triad: 'triad',
  audio: 'secondary',
  video: 'accent',
}

export function CoreModeCard({ mode, title, description, onClick, icon: Icon }: CoreModeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <button
        onClick={onClick}
        className="w-full h-full text-left"
      >
        <ConsoleCard 
          glow={glowMap[mode]}
          className="h-full p-6 hover:border-primary/50 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <Icon 
                size={28} 
                weight="duotone" 
                className="text-primary group-hover:text-primary transition-colors"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-2 text-base group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </ConsoleCard>
      </button>
    </motion.div>
  )
}
