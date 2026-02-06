import { useState, useEffect } from 'react'
import { WifiSlash, WifiHigh } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineToast, setShowOfflineToast] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineToast(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineToast(true)
      setTimeout(() => setShowOfflineToast(false), 5000)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {showOfflineToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 glass-panel px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
          >
            <WifiSlash size={20} className="text-destructive" weight="bold" />
            <div>
              <p className="text-sm font-medium text-foreground">You're offline</p>
              <p className="text-xs text-muted-foreground">Using cached responses when available</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOnline && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/30 border border-border/50">
          <WifiSlash size={16} className="text-muted-foreground" weight="bold" />
          <span className="text-xs text-muted-foreground">Offline Mode</span>
        </div>
      )}

      {isOnline && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/30">
          <WifiHigh size={16} className="text-primary" weight="bold" />
          <span className="text-xs text-primary">Online</span>
        </div>
      )}
    </>
  )
}
