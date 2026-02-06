import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface SwipeIndicatorProps {
  isOpen: boolean
}

export function SwipeIndicator({ isOpen }: SwipeIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)

  useEffect(() => {
    if (isOpen) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      setTouchStartX(touch.clientX)
      
      if (touch.clientX < 30) {
        setShowIndicator(true)
      }
    }

    const handleTouchEnd = () => {
      setShowIndicator(false)
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {showIndicator && !isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none lg:hidden"
        >
          <div className="w-1 h-20 bg-gradient-to-r from-primary/60 to-transparent rounded-r-full" />
          <motion.div
            className="absolute left-1 top-1/2 -translate-y-1/2"
            animate={{ x: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <div className="text-primary text-xs">→</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
