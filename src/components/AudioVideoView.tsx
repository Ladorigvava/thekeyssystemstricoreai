import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConsoleCard } from '@/components/ConsoleCard'
import { EngineSelect } from '@/components/EngineSelect'
import { SystemPromptEditor } from '@/components/SystemPromptEditor'
import { ArrowLeft, Waveform, VideoCamera, CircleNotch, Copy, CheckCircle } from '@phosphor-icons/react'
import { CoreConfig } from '@/lib/cores'
import { AIEngine, DEFAULT_ENGINE, getEngineStorageKey } from '@/lib/engines'
import { callLLM, streamLLM } from '@/lib/llm'
import { categorizeError } from '@/lib/retry'
import { logCost } from '@/lib/cost-tracking'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { generateQuantumAudioBrief, generateQuantumVideoBrief, type AudioGenerationParams, type VideoGenerationParams } from '@/lib/multimodal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AudioVideoViewProps {
  config: CoreConfig
  onBack: () => void
}

type MediaType = 'audio' | 'video'

interface BriefFormData {
  audience?: string
  duration?: string
  platform?: string
  tone?: string
  genre?: string
  tempo?: string
  mode?: string
}

export function AudioVideoView({ config, onBack }: AudioVideoViewProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedBrief, setGeneratedBrief] = useState('')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [selectedEngine, setSelectedEngine] = useKV<AIEngine>(getEngineStorageKey(config.id), DEFAULT_ENGINE)
  const [customPrompt, setCustomPrompt] = useKV<string>(`custom-prompt-${config.id}`, config.systemPrompt)
  
  const [formData, setFormData] = useState<BriefFormData>({
    audience: '',
    duration: '',
    platform: '',
    tone: '',
    genre: '',
    tempo: '',
    mode: config.id === 'audio' ? 'voiceover' : 'explainer'
  })

  const mediaType: MediaType = config.id as MediaType

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description')
      return
    }

    setIsGenerating(true)
    setGeneratedBrief('')

    try {
      let result
      
      if (mediaType === 'audio') {
        // Use quantum audio generation
        const audioParams: AudioGenerationParams = {
          type: (formData.mode as any) || 'voiceover',
          duration: formData.duration,
          voice: formData.tone,
          genre: formData.genre,
          tempo: formData.tempo,
          mood: formData.tone,
          quality: 'production'
        }
        
        result = await generateQuantumAudioBrief(
          prompt,
          audioParams,
          selectedEngine || DEFAULT_ENGINE
        )
        
        setGeneratedBrief(result.brief)
        logCost(selectedEngine || DEFAULT_ENGINE, prompt, result.brief, config.id)
        
      } else {
        // Use quantum video generation
        const videoParams: VideoGenerationParams = {
          type: formData.mode as any || 'explainer',
          duration: formData.duration,
          aspectRatio: formData.platform === 'tiktok' ? '9:16' : '16:9',
          style: formData.tone,
          resolution: '1080p',
          fps: 24
        }
        
        result = await generateQuantumVideoBrief(
          prompt,
          videoParams,
          selectedEngine || DEFAULT_ENGINE
        )
        
        setGeneratedBrief(result.brief)
        logCost(selectedEngine || DEFAULT_ENGINE, prompt, result.brief, config.id)
      }
      
      toast.success(`🎬 Quantum ${mediaType === 'audio' ? 'Audio' : 'Video'} brief generated!`, {
        description: `${result.recommendedTools.length} AI tools recommended`,
        duration: 4000
      })
    } catch (error) {
      console.error('Generation error:', error)
      const errorInfo = categorizeError(error instanceof Error ? error : new Error(String(error)))
      toast.error('Brief generation failed', {
        description: errorInfo.isRetryable 
          ? `${errorInfo.message} All retry attempts exhausted.`
          : errorInfo.message,
        duration: 6000
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSavePrompt = (newPrompt: string) => {
    setCustomPrompt(newPrompt)
  }

  const handleResetPrompt = () => {
    setCustomPrompt(config.systemPrompt)
  }

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(generatedBrief)
      setCopiedSection('all')
      toast.success('Entire brief copied to clipboard!')
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 w-full overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="border-b border-border/30 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-10 bg-gradient-to-b from-secondary to-transparent rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-0.5">
                  {mediaType === 'audio' ? 'Audio Production' : 'Video Production'} Lab
                </div>
                <div className="flex items-center gap-2">
                  {mediaType === 'audio' ? (
                    <Waveform size={24} weight="duotone" className="text-secondary shrink-0" />
                  ) : (
                    <VideoCamera size={24} weight="duotone" className="text-secondary shrink-0" />
                  )}
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">{config.name}</h1>
                </div>
              </div>
              <SystemPromptEditor
                coreId={config.id}
                coreName={config.name}
                currentPrompt={customPrompt || config.systemPrompt}
                defaultPrompt={config.systemPrompt}
                onSave={handleSavePrompt}
                onReset={handleResetPrompt}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 ml-7">{config.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          <ConsoleCard glass className="p-4 md:p-5" glow="secondary">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary">
                {mediaType === 'audio' ? '🎙️ Audio Input Console' : '🎥 Video Input Console'}
              </h2>
            </div>
            <div className="space-y-3">
              <EngineSelect 
                value={selectedEngine || DEFAULT_ENGINE}
                onValueChange={setSelectedEngine}
              />

              {mediaType === 'audio' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="audio-mode" className="text-xs">Mode</Label>
                      <Select
                        value={formData.mode}
                        onValueChange={(value) => setFormData({ ...formData, mode: value })}
                      >
                        <SelectTrigger id="audio-mode" className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="voiceover">Voiceover Script</SelectItem>
                          <SelectItem value="music">Music Brief</SelectItem>
                          <SelectItem value="soundscape">Sound Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.mode === 'music' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="genre" className="text-xs">Genre</Label>
                          <Input
                            id="genre"
                            placeholder="e.g., Lo-fi Hip-Hop, Ambient"
                            value={formData.genre || ''}
                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tempo" className="text-xs">Tempo/BPM</Label>
                          <Input
                            id="tempo"
                            placeholder="e.g., 120 BPM, Slow"
                            value={formData.tempo || ''}
                            onChange={(e) => setFormData({ ...formData, tempo: e.target.value })}
                            className="h-9 text-sm"
                          />
                        </div>
                      </>
                    )}

                    {formData.mode === 'voiceover' && (
                      <div className="space-y-2">
                        <Label htmlFor="tone" className="text-xs">Voice Tone</Label>
                        <Input
                          id="tone"
                          placeholder="e.g., Calm, Authoritative"
                          value={formData.tone || ''}
                          onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="audio-duration" className="text-xs">Duration</Label>
                      <Input
                        id="audio-duration"
                        placeholder="e.g., 30 seconds, 2 minutes"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {mediaType === 'video' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-xs">Platform</Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value) => setFormData({ ...formData, platform: value })}
                    >
                      <SelectTrigger id="platform" className="h-9">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok / Reels</SelectItem>
                        <SelectItem value="training">Internal Training</SelectItem>
                        <SelectItem value="marketing">Marketing / Ads</SelectItem>
                        <SelectItem value="explainer">Explainer Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-duration" className="text-xs">Video Length</Label>
                    <Input
                      id="video-duration"
                      placeholder="e.g., 30 seconds"
                      value={formData.duration || ''}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-audience" className="text-xs">Target Audience</Label>
                    <Input
                      id="video-audience"
                      placeholder="e.g., Young professionals"
                      value={formData.audience || ''}
                      onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-tone" className="text-xs">Tone</Label>
                    <Input
                      id="video-tone"
                      placeholder="e.g., Serious, Inspiring"
                      value={formData.tone || ''}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="main-idea" className="text-xs">Main Idea / Description</Label>
                <Textarea
                  id="main-idea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    mediaType === 'audio'
                      ? formData.mode === 'voiceover'
                        ? 'Describe the voiceover you need (topic, key points, message)...'
                        : 'Describe the music you need (mood, use case, reference artists)...'
                      : 'Describe your video idea (purpose, key scenes, message)...'
                  }
                  className="min-h-24 resize-none text-sm"
                  disabled={isGenerating}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full md:w-auto glow-secondary"
              >
                {isGenerating ? (
                  <>
                    <CircleNotch className="mr-2 animate-spin" size={18} />
                    Generating Brief...
                  </>
                ) : (
                  <>
                    {config.buttonLabel}
                  </>
                )}
              </Button>
            </div>
          </ConsoleCard>

          {generatedBrief && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ConsoleCard glass className="overflow-hidden">
                <div className="p-4 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-accent">
                        📡 {mediaType === 'audio' ? 'Audio' : 'Video'} Brief Output
                      </h2>
                    </div>
                    <Button
                      onClick={handleCopyAll}
                      variant="outline"
                      size="sm"
                      className="glow-accent h-8"
                    >
                      {copiedSection === 'all' ? (
                        <>
                          <CheckCircle className="mr-1.5" size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5" size={14} />
                          Copy All
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-4 md:p-5">
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">
                        {generatedBrief}
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">
                        <strong>Next Steps:</strong> Use the prompts above with AI tools like{' '}
                        {mediaType === 'audio' 
                          ? 'ElevenLabs, Murf (voiceover) or Suno, Udio (music)'
                          : 'Runway, Pika, Synthesia, or other text-to-video services'
                        }.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </ConsoleCard>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
