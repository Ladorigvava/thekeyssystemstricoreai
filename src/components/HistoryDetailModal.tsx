import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { HistoryEntry, formatTimestamp } from '@/lib/history'
import { CORE_CONFIGS } from '@/lib/cores'
import { OutputPanel } from '@/components/OutputPanel'

interface HistoryDetailModalProps {
  entry: HistoryEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HistoryDetailModal({
  entry,
  open,
  onOpenChange,
}: HistoryDetailModalProps) {
  if (!entry) return null

  const isTriCore = entry.mode === 'tricore' && typeof entry.output === 'object'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/50 text-primary">
              {CORE_CONFIGS[entry.mode]?.name || entry.mode}
            </Badge>
            <DialogDescription className="text-xs">
              {formatTimestamp(entry.timestamp)}
            </DialogDescription>
          </div>
          <DialogTitle className="text-xl">Historical Analysis</DialogTitle>
          {entry.status && <p className="text-sm">Status: {entry.status}</p>}
          {entry.engine && (
            <p className="text-sm break-words text-muted-foreground">
              {entry.engine}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2 uppercase tracking-wide text-muted-foreground">
                  Input
                </h4>
                <div className="rounded-md border border-border bg-secondary/30 p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {entry.input}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-4 uppercase tracking-wide text-muted-foreground">
                  {isTriCore ? 'Tri-Core Results' : 'Output'}
                </h4>

                {isTriCore ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="h-[400px]">
                      <OutputPanel
                        title="Chadrak Core"
                        content={
                          (
                            entry.output as {
                              chadrak: string
                              nova: string
                              triad: string
                            }
                          ).chadrak
                        }
                        badge="Structure"
                      />
                    </div>
                    <div className="h-[400px]">
                      <OutputPanel
                        title="Nova Core"
                        content={
                          (
                            entry.output as {
                              chadrak: string
                              nova: string
                              triad: string
                            }
                          ).nova
                        }
                        badge="Narrative"
                      />
                    </div>
                    <div className="h-[400px]">
                      <OutputPanel
                        title="Triad Core"
                        content={
                          (
                            entry.output as {
                              chadrak: string
                              nova: string
                              triad: string
                            }
                          ).triad
                        }
                        badge="Execution"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-border bg-secondary/30 p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {entry.output as string}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
