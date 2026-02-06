import { Button } from './ui/button'
import { ConsoleCard } from './ConsoleCard'
import { Detective } from '@phosphor-icons/react'

export function ResearchAgentView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen p-4 md:p-8 pt-20 md:pt-8">
      <div className="max-w-7xl mx-auto">
        <ConsoleCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Detective size={24} weight="duotone" className="text-primary" />
              <h1 className="text-2xl font-bold font-display">Autonomous Research Agent</h1>
            </div>
            <Button onClick={onBack} variant="outline" size="sm">Back</Button>
          </div>
          <p className="text-muted-foreground">Multi-step autonomous research - Coming soon!</p>
        </ConsoleCard>
      </div>
    </div>
  )
}
