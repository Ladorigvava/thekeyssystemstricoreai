import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Trash, 
  Eye, 
  Clock,
  HardDrives 
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { 
  CachedResponse, 
  CacheStats, 
  getCacheStats, 
  getAllCachedResponses,
  deleteCachedResponse,
  clearCache 
} from '@/lib/cache'
import { ENGINE_CONFIGS } from '@/lib/engines'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CacheManagementPanelProps {
  onClose?: () => void
}

export function CacheManagementPanel({ onClose }: CacheManagementPanelProps) {
  const [stats, setStats] = useState<CacheStats>({
    totalCached: 0,
    cacheSize: '0 KB',
    oldestEntry: null,
    newestEntry: null
  })
  const [cachedResponses, setCachedResponses] = useState<CachedResponse[]>([])
  const [selectedEntry, setSelectedEntry] = useState<CachedResponse | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const loadCacheData = async () => {
    const cacheStats = await getCacheStats()
    const responses = await getAllCachedResponses()
    setStats(cacheStats)
    setCachedResponses(responses)
  }

  useEffect(() => {
    loadCacheData()
  }, [])

  const handleClearAll = async () => {
    await clearCache()
    toast.success('Cache cleared')
    loadCacheData()
  }

  const handleDeleteEntry = async (id: string) => {
    await deleteCachedResponse(id)
    toast.success('Cached response deleted')
    loadCacheData()
  }

  const handleViewEntry = (entry: CachedResponse) => {
    setSelectedEntry(entry)
    setShowDetailModal(true)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 glow-primary">
              <Database size={24} className="text-primary" weight="bold" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Response Cache</h2>
              <p className="text-xs text-muted-foreground">Offline mode storage</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <HardDrives size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Cached</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalCached}</p>
          </div>

          <div className="glass-panel p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Cache Size</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.cacheSize}</p>
          </div>
        </div>

        {stats.totalCached > 0 && (
          <Button
            onClick={handleClearAll}
            variant="destructive"
            size="sm"
            className="w-full mt-4"
          >
            <Trash size={16} weight="bold" />
            Clear All Cache
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="py-4 space-y-3">
          {cachedResponses.length === 0 ? (
            <div className="text-center py-12">
              <Database size={48} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No cached responses yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Responses will be cached automatically
              </p>
            </div>
          ) : (
            cachedResponses.map((entry) => {
              const engineConfig = ENGINE_CONFIGS[entry.engine]
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-4 rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium mb-1">
                        {truncateText(entry.prompt, 80)}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {engineConfig.name}
                        </Badge>
                        {entry.coreId && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {entry.coreId}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={12} />
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewEntry(entry)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye size={16} weight="bold" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleDeleteEntry(entry.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash size={16} weight="bold" />
                    </Button>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Cached Response Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Engine</h3>
                  <Badge variant="outline">
                    {ENGINE_CONFIGS[selectedEntry.engine].name}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Prompt</h3>
                  <div className="glass-panel p-4 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedEntry.prompt}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Response</h3>
                  <div className="glass-panel p-4 rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedEntry.response}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Cached At</h3>
                  <p className="text-sm text-foreground">
                    {formatDate(selectedEntry.timestamp)}
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
