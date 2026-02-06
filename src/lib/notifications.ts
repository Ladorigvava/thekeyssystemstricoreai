import { toast } from 'sonner'

export interface NotificationConfig {
  budgetAlerts: boolean
  qualityAlerts: boolean
  taskCompletionAlerts: boolean
  cacheAlerts: boolean
  budgetThreshold: number // Percentage of budget
  qualityThreshold: number // Quality score below this triggers alert
}

const CONFIG_KEY = 'notification_config'
const NOTIFIED_KEY = 'notified_items'

export function getNotificationConfig(): NotificationConfig {
  try {
    const stored = localStorage.getItem(CONFIG_KEY)
    return stored ? JSON.parse(stored) : {
      budgetAlerts: true,
      qualityAlerts: true,
      taskCompletionAlerts: true,
      cacheAlerts: true,
      budgetThreshold: 80,
      qualityThreshold: 6
    }
  } catch (error) {
    return {
      budgetAlerts: true,
      qualityAlerts: true,
      taskCompletionAlerts: true,
      cacheAlerts: true,
      budgetThreshold: 80,
      qualityThreshold: 6
    }
  }
}

export function saveNotificationConfig(config: NotificationConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save notification config:', error)
  }
}

export function notifyBudgetWarning(current: number, limit: number, percentage: number): void {
  const config = getNotificationConfig()
  if (!config.budgetAlerts) return
  
  if (percentage >= config.budgetThreshold) {
    const key = `budget_${Date.now()}`
    if (!wasNotified(key)) {
      toast.warning(`Budget Alert: ${percentage.toFixed(1)}% Used`, {
        description: `You've used $${current.toFixed(4)} of your $${limit.toFixed(2)} budget`,
        duration: 10000
      })
      markAsNotified(key, 3600000) // Don't repeat for 1 hour
    }
  }
}

export function notifyQualityDrop(score: number, engine: string): void {
  const config = getNotificationConfig()
  if (!config.qualityAlerts) return
  
  if (score < config.qualityThreshold) {
    const key = `quality_${engine}_${Date.now()}`
    if (!wasNotified(key)) {
      toast.error(`Quality Alert: Low Score Detected`, {
        description: `${engine} response scored ${score}/10 - below your threshold of ${config.qualityThreshold}`,
        duration: 8000
      })
      markAsNotified(key, 300000) // Don't repeat for 5 minutes
    }
  }
}

export function notifyTaskComplete(taskName: string, duration: number): void {
  const config = getNotificationConfig()
  if (!config.taskCompletionAlerts) return
  
  toast.success(`${taskName} Complete!`, {
    description: `Finished in ${formatDuration(duration)}`,
    duration: 5000
  })
  
  // Browser notification if supported and permission granted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Task Complete', {
      body: `${taskName} finished in ${formatDuration(duration)}`,
      icon: '/icon.png'
    })
  }
}

export function notifyCacheSavings(saved: number, hitRate: number): void {
  const config = getNotificationConfig()
  if (!config.cacheAlerts) return
  
  if (saved >= 0.10) { // $0.10 saved
    const key = `cache_${Date.now()}`
    if (!wasNotified(key)) {
      toast.success(`Cache Savings: $${saved.toFixed(4)}`, {
        description: `Hit rate: ${hitRate.toFixed(1)}% - You're saving money!`,
        duration: 6000
      })
      markAsNotified(key, 7200000) // Don't repeat for 2 hours
    }
  }
}

export function notifyError(title: string, message: string): void {
  toast.error(title, {
    description: message,
    duration: 8000
  })
}

export function notifyInfo(title: string, message: string): void {
  toast.info(title, {
    description: message,
    duration: 4000
  })
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

function wasNotified(key: string): boolean {
  try {
    const notified = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}')
    const timestamp = notified[key]
    return timestamp && Date.now() - timestamp < 0
  } catch (error) {
    return false
  }
}

function markAsNotified(key: string, duration: number): void {
  try {
    const notified = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}')
    notified[key] = Date.now() + duration
    
    // Clean up old entries
    const cleaned = Object.fromEntries(
      Object.entries(notified).filter(([_, timestamp]) => (timestamp as number) > Date.now())
    )
    
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(cleaned))
  } catch (error) {
    console.error('Failed to mark notification:', error)
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}
