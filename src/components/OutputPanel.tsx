import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ConsoleCard } from '@/components/ConsoleCard'
import { Database } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface OutputPanelProps {
  title: string
  content: string
  isLoading?: boolean
  badge?: string
  usedCache?: boolean
}

export function OutputPanel({
  title,
  content,
  isLoading,
  badge,
  usedCache,
}: OutputPanelProps) {
  const hasContent = content && content.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      <ConsoleCard glass className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={
                isLoading
                  ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }
                  : hasContent
                    ? { scale: 1, opacity: 1 }
                    : { scale: 1, opacity: 0.3 }
              }
              transition={
                isLoading
                  ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.3 }
              }
            />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {usedCache && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Badge
                  variant="outline"
                  className="border-accent/50 text-accent text-xs flex items-center gap-1"
                >
                  <Database size={12} weight="bold" />
                  Cached
                </Badge>
              </motion.div>
            )}
            {badge && (
              <Badge
                variant="outline"
                className="border-primary/50 text-primary text-xs"
              >
                {badge}
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          {isLoading && !content ? (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          ) : content ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="prose prose-invert prose-sm max-w-none"
            >
              <div
                aria-live="polite"
                className="whitespace-pre-wrap break-words leading-relaxed text-foreground/90 text-base"
              >
                {content}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground text-xs">
              Awaiting transmission...
            </div>
          )}
        </ScrollArea>
      </ConsoleCard>
    </motion.div>
  )
}
