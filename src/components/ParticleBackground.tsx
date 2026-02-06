import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  pulsePhase: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const mouseRef = useRef({ x: 0, y: 0 })
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const darkColors = [
      'rgba(6, 182, 212, ',
      'rgba(99, 102, 241, ',
      'rgba(16, 185, 129, ',
      'rgba(168, 162, 158, ',
    ]

    const lightColors = [
      'rgba(6, 120, 140, ',
      'rgba(75, 70, 180, ',
      'rgba(12, 140, 100, ',
      'rgba(100, 95, 90, ',
    ]

    const colors = theme === 'dark' ? darkColors : lightColors

    const particleCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 15000))

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulsePhase: Math.random() * Math.PI * 2,
    }))

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)

    let lastTime = 0
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      const clearColor = theme === 'dark' ? 'rgba(6, 10, 26, 0.1)' : 'rgba(250, 250, 252, 0.15)'
      ctx.fillStyle = clearColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      const lineColor = theme === 'dark' ? 'rgba(6, 182, 212, ' : 'rgba(6, 120, 140, '

      // First pass: update positions and draw particles
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          const force = (150 - distance) / 150
          particle.vx -= (dx / distance) * force * 0.02
          particle.vy -= (dy / distance) * force * 0.02
        }

        particle.vx *= 0.99
        particle.vy *= 0.99

        particle.pulsePhase += 0.02
        const pulse = Math.sin(particle.pulsePhase) * 0.2 + 0.8

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${particle.opacity * pulse})`
        ctx.fill()
      }

      // Second pass: draw connections (only check j > i to avoid duplicate checks)
      // This reduces connection checks from O(n²) to O(n²/2)
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const otherParticle = particles[j]
          const dx = otherParticle.x - particle.x
          const dy = otherParticle.y - particle.y
          const distanceSquared = dx * dx + dy * dy

          // Use squared distance comparison to avoid sqrt when possible
          if (distanceSquared < 14400) { // 120 * 120
            const distance = Math.sqrt(distanceSquared)
            const opacity = (1 - distance / 120) * 0.15
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `${lineColor}${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
