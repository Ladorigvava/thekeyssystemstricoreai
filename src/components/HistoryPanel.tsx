import { useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConsoleCard } from '@/components/ConsoleCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HistoryEntry, formatTimestamp } from '@/lib/history'
import { CORE_CONFIGS } from '@/lib/cores'
import { Clock, Trash, Eye } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface HistoryPanelProps {
  history: HistoryEntry[]
  onSelectEntry: (entry: HistoryEntry) => void
  onDeleteEntry: (id: string) => void
  onClearAll: () => void
}

export function HistoryPanel({
  history,
  onSelectEntry,
  onDeleteEntry,
  onClearAll,
}: HistoryPanelProps) {
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => b.timestamp - a.timestamp),
    [history],
  )

  return (
    <ConsoleCard glass className="h-full flex flex-col">
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock size={18} weight="duotone" className="text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Analysis History
            </h3>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Clear analysis history"
              onClick={() => {
                if (
                  window.confirm(
                    'Clear all analysis history? Export anything you want to keep first.',
                  )
                )
                  onClearAll()
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
            >
              <Trash size={14} />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {history.length} {history.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <Clock
              size={40}
              weight="duotone"
              className="text-muted-foreground/50 mb-3"
            />
            <p className="text-muted-foreground text-sm">No history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {sortedHistory.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="group p-3 rounded-lg border border-border/30 hover:border-primary/40 transition-all bg-background/30 backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant="outline"
                            className="border-primary/50 text-primary text-sm px-1.5 py-0"
                          >
                            {CORE_CONFIGS[entry.mode]?.name || entry.mode}
                          </Badge>
                          {entry.status && (
                            <span className="text-sm text-muted-foreground">
                              {entry.status}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/80 line-clamp-2 mb-2 leading-relaxed">
                          {entry.input}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onSelectEntry(entry)}
                            className="h-6 px-2 text-sm text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Eye size={12} className="mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Delete history entry"
                            onClick={() => {
                              if (window.confirm('Delete this history entry?'))
                                onDeleteEntry(entry.id)
                            }}
                            className="h-6 px-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-70 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </ConsoleCard>
  )
}
