import { useId, useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ENGINE_CONFIGS, AIEngine } from '@/lib/engines'
import { ModelParametersDialog } from '@/components/ModelParametersDialog'
export function EngineSelect({
  value,
  onValueChange,
  className,
  disabled = false,
}: {
  value: AIEngine
  onValueChange: (engine: AIEngine) => void
  className?: string
  disabled?: boolean
}) {
  const [provider, setProvider] = useState('all')
  const id = useId()
  const providers = [
    ...new Set(Object.values(ENGINE_CONFIGS).map((engine) => engine.provider)),
  ]
  const engines = useMemo(
    () =>
      Object.values(ENGINE_CONFIGS).filter(
        (engine) => provider === 'all' || engine.provider === provider,
      ),
    [provider],
  )
  const selected = ENGINE_CONFIGS[value]
  return (
    <div className={`engine-picker ${className || ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          AI model
        </label>
        <select
          aria-label="Filter models by provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          disabled={disabled}
          className="engine-provider"
        >
          <option value="all">All providers</option>
          {providers.map((item) => (
            <option key={item} value={item}>
              {item === 'openai'
                ? 'OpenAI'
                : item === 'google'
                  ? 'Google'
                  : item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 min-w-0">
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            id={id}
            aria-label="AI model"
            className="min-w-0 w-full flex-1 h-auto min-h-11 text-left"
          >
            <SelectValue>
              {selected?.name || 'Select a supported model'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-80 w-[min(24rem,calc(100vw-2rem))]">
            {engines.map((engine) => (
              <SelectItem key={engine.id} value={engine.id} className="py-3">
                <span className="text-sm">{engine.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ModelParametersDialog engine={selected ? value : 'gpt-5.2'} />
      </div>
      <p className="text-sm text-muted-foreground mt-2 break-words">
        {selected
          ? selected.provider === 'openai'
            ? 'OpenAI'
            : selected.provider === 'anthropic'
              ? 'Anthropic'
              : selected.provider === 'google'
                ? 'Google'
                : selected.provider
          : 'The saved model is no longer supported. Choose a model above.'}
      </p>
    </div>
  )
}
