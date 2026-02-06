import { useEffect } from 'react'

interface EdgeSwipeOptions {
  onSwipeFromLeft?: () => void
  onSwipeFromRight?: () => void
  edgeWidth?: number
  minSwipeDistance?: number
}

export function useEdgeSwipe({
  onSwipeFromLeft,
  onSwipeFromRight,
  edgeWidth = 20,
  minSwipeDistance = 100
}: EdgeSwipeOptions) {
  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0
    let isEdgeSwipe = false

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartX = touch.clientX
      touchStartY = touch.clientY

      if (onSwipeFromLeft && touchStartX < edgeWidth) {
        isEdgeSwipe = true
      } else if (onSwipeFromRight && touchStartX > window.innerWidth - edgeWidth) {
        isEdgeSwipe = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isEdgeSwipe) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isEdgeSwipe = false
        return
      }

      if (Math.abs(deltaX) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isEdgeSwipe) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartX

      if (onSwipeFromLeft && touchStartX < edgeWidth && deltaX > minSwipeDistance) {
        onSwipeFromLeft()
      } else if (onSwipeFromRight && touchStartX > window.innerWidth - edgeWidth && deltaX < -minSwipeDistance) {
        onSwipeFromRight()
      }

      isEdgeSwipe = false
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeFromLeft, onSwipeFromRight, edgeWidth, minSwipeDistance])
}
