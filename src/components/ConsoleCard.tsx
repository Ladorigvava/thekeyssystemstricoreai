import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ConsoleCardProps {
  children: ReactNode
  className?: string
  glow?: 'primary' | 'secondary' | 'accent' | 'chadrak' | 'nova' | 'triad' | 'none'
  glass?: boolean
}

export function ConsoleCard({ children, className, glow = 'none', glass = false }: ConsoleCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border transition-all',
        glass ? 'glass-panel' : 'bg-card/80 backdrop-blur-sm border-border/50',
        glow !== 'none' && `glow-${glow}`,
        'hover:border-border/70',
        className
      )}
    >
      {children}
    </div>
  )
}
