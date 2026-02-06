import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ConsoleCard } from '@/components/ConsoleCard'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PROMPT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TemplateCategory,
  PromptTemplate,
  getTemplatesByCategory,
  searchTemplates,
  fillTemplate,
  saveCustomTemplate,
  getCustomTemplates,
  deleteCustomTemplate,
  getAllTemplates
} from '@/lib/templates'
import { ENGINE_CONFIGS } from '@/lib/engines'
import { 
  ArrowLeft, 
  MagnifyingGlass, 
  FileText, 
  Copy, 
  Play,
  Sparkle,
  Plus,
  Trash
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface TemplateLibraryProps {
  onBack: () => void
  onUseTemplate?: (prompt: string, engine?: string, mode?: string) => void
}

export function TemplateLibrary({ onBack, onUseTemplate }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [allTemplates, setAllTemplates] = useState(getAllTemplates())

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory === 'all'
    ? allTemplates
    : getTemplatesByCategory(selectedCategory)

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    // Initialize empty values for all variables
    const initialValues: Record<string, string> = {}
    template.variables.forEach(v => {
      initialValues[v] = ''
    })
    setTemplateValues(initialValues)
  }

  const handleCopyPrompt = () => {
    if (!selectedTemplate) return
    const filled = fillTemplate(selectedTemplate, templateValues)
    navigator.clipboard.writeText(filled)
    toast.success('Template copied to clipboard!')
  }

  const handleUseTemplate = () => {
    if (!selectedTemplate) return
    const filled = fillTemplate(selectedTemplate, templateValues)
    
    if (onUseTemplate) {
      onUseTemplate(filled, selectedTemplate.recommendedEngine, selectedTemplate.coreMode)
    }
    
    toast.success('Template applied!', {
      description: selectedTemplate.coreMode 
        ? `Opening in ${selectedTemplate.coreMode} mode...`
        : 'Prompt ready to use'
    })
  }

  const handleDeleteCustomTemplate = (id: string) => {
    if (confirm('Delete this custom template?')) {
      deleteCustomTemplate(id)
      setAllTemplates(getAllTemplates())
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null)
      }
      toast.success('Template deleted')
    }
  }

  const handleCreateCustomTemplate = (data: {
    name: string
    description: string
    category: string
    prompt: string
    variables: string
  }) => {
    const newTemplate = saveCustomTemplate({
      name: data.name,
      description: data.description,
      category: data.category,
      prompt: data.prompt,
      variables: data.variables.split(',').map(v => v.trim()).filter(Boolean)
    })
    
    setAllTemplates(getAllTemplates())
    setShowCreateDialog(false)
    toast.success('Custom template created!')
    handleSelectTemplate(newTemplate)
  }

  const customTemplates = getCustomTemplates()

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8 w-full overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="border-b border-border/30 pb-4 mb-6">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="mb-4 hover:bg-secondary/50"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-10 bg-gradient-to-b from-primary to-transparent rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-0.5">
                    Prompt Engineering Library
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={24} weight="duotone" className="text-primary shrink-0" />
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                      Expert Prompt Templates
                    </h1>
                  </div>
                </div>
              </div>
              <Button onClick={() => setShowCreateDialog(true)} className="glow-primary">
                <Plus size={16} className="mr-2" />
                Create Template
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3 ml-7">
              Pre-built, professional prompts for common tasks. Customize and use instantly.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Search & Categories */}
          <div className="space-y-4">
            <ConsoleCard glass className="p-4">
              <div className="relative mb-4">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-10"
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-1.5">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full justify-start ${selectedCategory === 'all' ? 'glow-primary' : ''}`}
                >
                  All Templates ({allTemplates.length})
                </Button>
                
                {TEMPLATE_CATEGORIES.map((category) => {
                  const count = getTemplatesByCategory(category).length
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full justify-start ${selectedCategory === category ? 'glow-primary' : ''}`}
                    >
                      {category} ({count})
                    </Button>
                  )
                })}
              </div>

              {customTemplates.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="text-xs text-muted-foreground mb-2">Custom Templates</div>
                  <div className="text-sm font-medium">{customTemplates.length} custom template{customTemplates.length !== 1 ? 's' : ''}</div>
                </>
              )}
            </ConsoleCard>

            {selectedTemplate && (
              <ConsoleCard glass className="p-4" glow="accent">
                <div className="text-xs text-muted-foreground mb-2">Selected Template</div>
                <div className="font-semibold mb-1">{selectedTemplate.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{selectedTemplate.category}</div>
                
                {selectedTemplate.recommendedEngine && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkle size={14} className="text-accent" />
                    <span className="text-xs">
                      Recommended: {ENGINE_CONFIGS[selectedTemplate.recommendedEngine as keyof typeof ENGINE_CONFIGS]?.name}
                    </span>
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleCopyPrompt} variant="outline" size="sm" className="flex-1">
                    <Copy size={14} className="mr-1.5" />
                    Copy
                  </Button>
                  <Button onClick={handleUseTemplate} size="sm" className="flex-1 glow-accent">
                    <Play size={14} className="mr-1.5" />
                    Use
                  </Button>
                </div>
              </ConsoleCard>
            )}
          </div>

          {/* Middle Column - Template List */}
          <div>
            <ConsoleCard glass className="p-4">
              <h3 className="text-sm font-semibold mb-3">
                {searchQuery ? `Search Results (${filteredTemplates.length})` : 
                 selectedCategory === 'all' ? `All Templates (${filteredTemplates.length})` :
                 `${selectedCategory} (${filteredTemplates.length})`}
              </h3>
              
              <ScrollArea className="h-[700px]">
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {filteredTemplates.map((template) => {
                      const isCustom = template.id.startsWith('custom-')
                      return (
                        <motion.div
                          key={template.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTemplate?.id === template.id
                              ? 'bg-primary/10 border-primary/30'
                              : 'bg-secondary/5 border-border/30 hover:border-primary/20'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="font-medium text-sm">{template.name}</div>
                            {isCustom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteCustomTemplate(template.id)
                                }}
                              >
                                <Trash size={14} />
                              </Button>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {template.description}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            {template.variables.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                            {isCustom && (
                              <Badge variant="outline" className="text-xs text-accent border-accent/30">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  
                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No templates found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </ConsoleCard>
          </div>

          {/* Right Column - Template Details & Variables */}
          <div>
            {selectedTemplate ? (
              <ConsoleCard glass className="p-4">
                <h3 className="text-sm font-semibold mb-3">Fill Template Variables</h3>
                
                <ScrollArea className="h-[700px]">
                  <div className="space-y-4">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <Label htmlFor={variable} className="text-xs">
                          {variable.replace(/_/g, ' ')}
                        </Label>
                        <Textarea
                          id={variable}
                          value={templateValues[variable] || ''}
                          onChange={(e) => setTemplateValues({
                            ...templateValues,
                            [variable]: e.target.value
                          })}
                          placeholder={`Enter ${variable.toLowerCase().replace(/_/g, ' ')}...`}
                          className="mt-1.5 min-h-20 resize-none text-sm"
                        />
                      </div>
                    ))}

                    <Separator />

                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">Preview</div>
                      <div className="p-3 bg-secondary/10 rounded border border-border/30 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                        {fillTemplate(selectedTemplate, templateValues)}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </ConsoleCard>
            ) : (
              <ConsoleCard glass className="p-8 text-center h-full flex items-center justify-center">
                <div>
                  <FileText size={64} weight="duotone" className="text-muted-foreground/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a template from the list to customize and use
                  </p>
                </div>
              </ConsoleCard>
            )}
          </div>
        </div>

        {/* Create Custom Template Dialog */}
        <CreateTemplateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreate={handleCreateCustomTemplate}
        />
      </div>
    </div>
  )
}

// Create Template Dialog Component
function CreateTemplateDialog({ 
  open, 
  onOpenChange, 
  onCreate 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (data: any) => void
}) {
  const [formData, setFormData] = useState<{
    name: string
    description: string
    category: TemplateCategory
    prompt: string
    variables: string
  }>({
    name: '',
    description: '',
    category: TEMPLATE_CATEGORIES[0],
    prompt: '',
    variables: ''
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.prompt) {
      toast.error('Name and prompt are required')
      return
    }
    onCreate(formData)
    setFormData({
      name: '',
      description: '',
      category: TEMPLATE_CATEGORIES[0],
      prompt: '',
      variables: ''
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Custom Template</DialogTitle>
          <DialogDescription>
            Create your own reusable prompt template with variables
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Custom Template"
            />
          </div>

          <div>
            <Label htmlFor="template-description">Description</Label>
            <Input
              id="template-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What this template does..."
            />
          </div>

          <div>
            <Label htmlFor="template-category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as TemplateCategory })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="template-prompt">Prompt Template</Label>
            <Textarea
              id="template-prompt"
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Your prompt here. Use {{VARIABLE_NAME}} for variables..."
              className="min-h-32"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {`{{VARIABLE_NAME}}`} syntax for variables
            </p>
          </div>

          <div>
            <Label htmlFor="template-variables">Variables (comma-separated)</Label>
            <Input
              id="template-variables"
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              placeholder="VARIABLE_ONE, VARIABLE_TWO, VARIABLE_THREE"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="glow-primary">Create Template</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
