import { useState } from 'react'
import { Button } from './ui/button'
import { ConsoleCard } from './ConsoleCard'
import { Switch } from './ui/switch'
import { Badge } from './ui/badge'
import { Database, Globe, Brain, Flask, BookOpen } from '@phosphor-icons/react'

export interface KnowledgeSettings {
  enableWikipedia: boolean
  enableWebSearch: boolean
  enableWolframAlpha: boolean
  enableArxiv: boolean
  enablePubMed: boolean
  autoEnhance: boolean
}

const DEFAULT_SETTINGS: KnowledgeSettings = {
  enableWikipedia: true,
  enableWebSearch: false,
  enableWolframAlpha: false,
  enableArxiv: false,
  enablePubMed: false,
  autoEnhance: false
}

const KNOWLEDGE_SETTINGS_KEY = 'knowledge-database-settings'

export function getKnowledgeSettings(): KnowledgeSettings {
  const stored = localStorage.getItem(KNOWLEDGE_SETTINGS_KEY)
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_SETTINGS
    }
  }
  return DEFAULT_SETTINGS
}

export function saveKnowledgeSettings(settings: KnowledgeSettings) {
  localStorage.setItem(KNOWLEDGE_SETTINGS_KEY, JSON.stringify(settings))
}

export function KnowledgeDatabasePanel({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<KnowledgeSettings>(getKnowledgeSettings())

  const handleSave = () => {
    saveKnowledgeSettings(settings)
    onClose()
  }

  const updateSetting = (key: keyof KnowledgeSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20 md:pt-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <ConsoleCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Database size={24} weight="duotone" className="text-primary" />
              <h1 className="text-2xl font-bold font-display">Knowledge Databases</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">Save Settings</Button>
              <Button onClick={onClose} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Connect AI responses to worldwide knowledge sources for enhanced accuracy and real-time information.
          </p>

          {/* Auto-Enhancement Toggle */}
          <ConsoleCard glass className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain size={20} className="text-blue-400" />
                <div>
                  <p className="font-semibold">Auto-Enhance Prompts</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically add knowledge context to factual questions
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.autoEnhance}
                onCheckedChange={(checked) => updateSetting('autoEnhance', checked)}
              />
            </div>
          </ConsoleCard>

          {/* Knowledge Sources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">AVAILABLE SOURCES</h3>

            {/* Wikipedia */}
            <ConsoleCard glass className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-green-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Wikipedia</p>
                      <Badge variant="outline" className="text-xs">Free</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      General knowledge encyclopedia - Facts, history, science
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enableWikipedia}
                  onCheckedChange={(checked) => updateSetting('enableWikipedia', checked)}
                />
              </div>
            </ConsoleCard>

            {/* Web Search */}
            <ConsoleCard glass className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-blue-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Web Search (Serper)</p>
                      <Badge variant="outline" className="text-xs">API Key Required</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time Google search results - Current events, news
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enableWebSearch}
                  onCheckedChange={(checked) => updateSetting('enableWebSearch', checked)}
                />
              </div>
            </ConsoleCard>

            {/* Wolfram Alpha */}
            <ConsoleCard glass className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain size={20} className="text-orange-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Wolfram Alpha</p>
                      <Badge variant="outline" className="text-xs">API Key Required</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Computational knowledge - Math, science calculations
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enableWolframAlpha}
                  onCheckedChange={(checked) => updateSetting('enableWolframAlpha', checked)}
                />
              </div>
            </ConsoleCard>

            {/* arXiv */}
            <ConsoleCard glass className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flask size={20} className="text-purple-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">arXiv</p>
                      <Badge variant="outline" className="text-xs">Free</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Scientific papers - Physics, math, computer science
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enableArxiv}
                  onCheckedChange={(checked) => updateSetting('enableArxiv', checked)}
                />
              </div>
            </ConsoleCard>

            {/* PubMed */}
            <ConsoleCard glass className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={20} className="text-red-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">PubMed</p>
                      <Badge variant="outline" className="text-xs">Free</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Medical literature - Health, medicine, biomedical
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.enablePubMed}
                  onCheckedChange={(checked) => updateSetting('enablePubMed', checked)}
                />
              </div>
            </ConsoleCard>
          </div>

          {/* API Keys Guide */}
          <ConsoleCard glass className="p-4 mt-6">
            <h3 className="text-sm font-semibold mb-3">📝 API Key Setup</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Add these to your <code className="bg-background/50 px-1 py-0.5 rounded">.env</code> file:
            </p>
            <pre className="text-xs bg-background/50 p-3 rounded overflow-x-auto">
{`# Knowledge Database APIs
VITE_SERPER_API_KEY=your-serper-key
VITE_WOLFRAM_ALPHA_API_KEY=your-wolfram-key`}
            </pre>
            <div className="mt-3 space-y-1 text-xs">
              <p className="text-muted-foreground">
                • <strong>Serper:</strong> <a href="https://serper.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">serper.dev</a> (Google Search API)
              </p>
              <p className="text-muted-foreground">
                • <strong>Wolfram Alpha:</strong> <a href="https://products.wolframalpha.com/api" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">products.wolframalpha.com/api</a>
              </p>
            </div>
          </ConsoleCard>
        </ConsoleCard>
      </div>
    </div>
  )
}
