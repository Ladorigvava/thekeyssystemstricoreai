import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Scroll, ArrowCounterClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SystemPromptEditorProps {
  coreId: string
  coreName: string
  currentPrompt: string
  defaultPrompt: string
  onSave: (newPrompt: string) => void
  onReset: () => void
}

export function SystemPromptEditor({ 
  coreId, 
  coreName, 
  currentPrompt, 
  defaultPrompt,
  onSave,
  onReset
}: SystemPromptEditorProps) {
  const [open, setOpen] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState(currentPrompt)
  const isCustomized = currentPrompt !== defaultPrompt

  const handleOpen = () => {
    setEditedPrompt(currentPrompt)
    setOpen(true)
  }

  const handleSave = () => {
    onSave(editedPrompt)
    setOpen(false)
    toast.success('System prompt updated')
  }

  const handleReset = () => {
    setEditedPrompt(defaultPrompt)
    onReset()
    setOpen(false)
    toast.success('System prompt reset to default')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isCustomized ? "default" : "outline"} 
          size="sm"
          onClick={handleOpen}
          className="gap-2"
        >
          <Scroll size={16} weight={isCustomized ? "fill" : "regular"} />
          {isCustomized ? 'Custom Prompt' : 'Edit System Prompt'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Customize System Prompt</DialogTitle>
          <DialogDescription>
            Fine-tune how {coreName} responds by editing its system prompt. This controls the AI's behavior and output style.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor={`prompt-${coreId}`} className="block text-sm font-medium mb-2">
              System Prompt
            </label>
            <Textarea
              id={`prompt-${coreId}`}
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              className="h-80 font-mono text-sm resize-none"
              placeholder="Enter custom system prompt..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              {editedPrompt.length} characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <ArrowCounterClockwise size={16} />
            Reset to Default
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
