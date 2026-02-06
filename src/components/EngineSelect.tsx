import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ENGINE_CONFIGS, AIEngine, AIProvider } from '@/lib/engines'
import { ModelParametersDialog } from '@/components/ModelParametersDialog'
import { Lightning, Rocket, Gauge, Brain } from '@phosphor-icons/react'
import { useState, useMemo } from 'react'

interface EngineSelectProps {
  value: AIEngine
  onValueChange: (engine: AIEngine) => void
  className?: string
}

export function EngineSelect({ value, onValueChange, className }: EngineSelectProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | 'all'>('all')
  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast':
        return <Lightning size={14} weight="fill" />
      case 'balanced':
        return <Gauge size={14} weight="fill" />
      case 'powerful':
        return <Rocket size={14} weight="fill" />
      case 'ultra':
        return <Brain size={14} weight="fill" />
      default:
        return null
    }
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast':
        return 'text-emerald-400'
      case 'balanced':
        return 'text-amber-400'
      case 'powerful':
        return 'text-primary'
      case 'ultra':
        return 'text-violet-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getProviderBadgeStyle = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'anthropic':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'google':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return ''
    }
  }

  const getProviderLabel = (provider: AIProvider) => {
    switch (provider) {
      case 'openai':
        return 'OpenAI'
      case 'anthropic':
        return 'Anthropic'
      case 'google':
        return 'Google'
      default:
        return provider
    }
  }

  const filteredEngines = useMemo(() => {
    const engines = Object.values(ENGINE_CONFIGS)
    if (selectedProvider === 'all') {
      return engines
    }
    return engines.filter(engine => engine.provider === selectedProvider)
  }, [selectedProvider])

  const providers: Array<{ id: AIProvider | 'all', label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'openai', label: 'OpenAI' },
    { id: 'anthropic', label: 'Anthropic' },
    { id: 'google', label: 'Google' }
  ]

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          AI Engine
        </label>
        <div className="flex gap-1">
          {providers.map((provider) => (
            <Button
              key={provider.id}
              variant={selectedProvider === provider.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedProvider(provider.id)}
              className={`h-7 px-2.5 text-xs ${
                selectedProvider === provider.id 
                  ? 'glow-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {provider.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-[500px] w-[500px]">
            {filteredEngines.map((engine) => (
              <SelectItem key={engine.id} value={engine.id} className="py-3 cursor-pointer">
                <div className="flex items-center gap-3 w-full">
                  <span className={`${getSpeedColor(engine.speed)} shrink-0`}>
                    {getSpeedIcon(engine.speed)}
                  </span>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-medium text-sm">{engine.name}</div>
                    <div className="text-xs text-muted-foreground leading-tight mt-0.5">{engine.description}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getProviderBadgeStyle(engine.provider)}`}
                    >
                      {getProviderLabel(engine.provider)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {engine.costTier}
                    </Badge>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ModelParametersDialog engine={value} />
      </div>
    </div>
  )
}
