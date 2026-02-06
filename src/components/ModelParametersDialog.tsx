import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  ModelParameters,
  getParametersForEngine,
  saveParametersForEngine,
  resetParametersForEngine,
  getConstraintsForEngine,
  PARAMETER_PRESETS,
  getParameterDescription
} from '@/lib/model-parameters'
import { AIEngine, ENGINE_CONFIGS } from '@/lib/engines'
import { Sliders, ArrowClockwise, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ModelParametersDialogProps {
  engine: AIEngine
  onParametersChange?: (params: ModelParameters) => void
  trigger?: React.ReactNode
}

export function ModelParametersDialog({ 
  engine, 
  onParametersChange,
  trigger 
}: ModelParametersDialogProps) {
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState<ModelParameters>(getParametersForEngine(engine))
  const constraints = getConstraintsForEngine(engine)
  const engineConfig = ENGINE_CONFIGS[engine]

  // Load parameters when dialog opens or engine changes
  useEffect(() => {
    if (open) {
      setParams(getParametersForEngine(engine))
    }
  }, [open, engine])

  const handleSave = () => {
    saveParametersForEngine(engine, params)
    if (onParametersChange) {
      onParametersChange(params)
    }
    toast.success('Parameters saved', {
      description: `Custom settings saved for ${engineConfig.name}`
    })
    setOpen(false)
  }

  const handleReset = () => {
    const defaults = resetParametersForEngine(engine)
    setParams(defaults)
    if (onParametersChange) {
      onParametersChange(defaults)
    }
    toast.success('Parameters reset to defaults')
  }

  const handlePreset = (presetKey: string) => {
    const preset = PARAMETER_PRESETS[presetKey as keyof typeof PARAMETER_PRESETS]
    if (preset) {
      const newParams = { ...params, ...preset.params }
      setParams(newParams)
      toast.success(`Applied ${preset.name} preset`)
    }
  }

  const ParameterSlider = ({
    label,
    value,
    onChange,
    min,
    max,
    step,
    disabled,
    description
  }: {
    label: string
    value: number
    onChange: (value: number) => void
    min: number
    max: number
    step: number
    disabled?: boolean
    description: string
  }) => (
    <div className={`space-y-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Sliders size={16} />
            Parameters
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            Model Parameters - {engineConfig.name}
          </DialogTitle>
          <DialogDescription>
            Fine-tune generation parameters for {engineConfig.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Presets */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PARAMETER_PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreset(key)}
                    className="justify-start gap-2 h-auto py-3"
                  >
                    <div className="text-left">
                      <div className="font-medium text-sm">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Temperature */}
            <ParameterSlider
              label="Temperature"
              value={params.temperature}
              onChange={(val) => setParams({ ...params, temperature: val })}
              min={constraints.temperature.min}
              max={constraints.temperature.max}
              step={constraints.temperature.step}
              disabled={constraints.temperature.disabled}
              description={getParameterDescription('temperature')}
            />

            {/* Max Tokens */}
            <ParameterSlider
              label="Max Tokens"
              value={params.maxTokens}
              onChange={(val) => setParams({ ...params, maxTokens: val })}
              min={constraints.maxTokens.min}
              max={constraints.maxTokens.max}
              step={constraints.maxTokens.step}
              description={getParameterDescription('maxTokens')}
            />

            {/* Top P */}
            <ParameterSlider
              label="Top P"
              value={params.topP}
              onChange={(val) => setParams({ ...params, topP: val })}
              min={constraints.topP.min}
              max={constraints.topP.max}
              step={constraints.topP.step}
              disabled={constraints.topP.disabled}
              description={getParameterDescription('topP')}
            />

            {/* Frequency Penalty */}
            <ParameterSlider
              label="Frequency Penalty"
              value={params.frequencyPenalty}
              onChange={(val) => setParams({ ...params, frequencyPenalty: val })}
              min={constraints.frequencyPenalty.min}
              max={constraints.frequencyPenalty.max}
              step={constraints.frequencyPenalty.step}
              disabled={constraints.frequencyPenalty.disabled}
              description={getParameterDescription('frequencyPenalty')}
            />

            {/* Presence Penalty */}
            <ParameterSlider
              label="Presence Penalty"
              value={params.presencePenalty}
              onChange={(val) => setParams({ ...params, presencePenalty: val })}
              min={constraints.presencePenalty.min}
              max={constraints.presencePenalty.max}
              step={constraints.presencePenalty.step}
              disabled={constraints.presencePenalty.disabled}
              description={getParameterDescription('presencePenalty')}
            />

            {/* Model Info */}
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-start gap-3">
                <Sparkle size={20} className="text-muted-foreground mt-0.5" />
                <div className="space-y-1 text-sm">
                  <div className="font-medium">Model Capabilities</div>
                  <div className="text-muted-foreground space-y-1">
                    {constraints.temperature.disabled && (
                      <div>• Temperature: Fixed (not adjustable for this model)</div>
                    )}
                    {constraints.frequencyPenalty.disabled && (
                      <div>• Frequency/Presence Penalty: Not supported</div>
                    )}
                    {!constraints.temperature.disabled && !constraints.frequencyPenalty.disabled && (
                      <div>• Full parameter control available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <ArrowClockwise size={16} />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Sliders size={16} />
            Save Parameters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
