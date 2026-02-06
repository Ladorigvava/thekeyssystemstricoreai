import { AIEngine } from './engines'

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  engine?: AIEngine
  timestamp: number
  tokens?: number
  cost?: number
}

export interface ConversationBranch {
  id: string
  parentMessageId: string
  messages: ConversationMessage[]
  createdAt: number
}

export interface Conversation {
  id: string
  title: string
  messages: ConversationMessage[]
  branches: ConversationBranch[]
  engine: AIEngine
  createdAt: number
  updatedAt: number
  archived: boolean
  tags: string[]
}

const CONVERSATIONS_KEY = 'conversations'
const MAX_CONVERSATIONS = 100

export function createConversation(title: string, engine: AIEngine): Conversation {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    messages: [],
    branches: [],
    engine,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    archived: false,
    tags: []
  }
}

export function addMessage(
  conversation: Conversation,
  role: 'user' | 'assistant',
  content: string,
  engine?: AIEngine,
  tokens?: number,
  cost?: number
): Conversation {
  const message: ConversationMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    engine: engine || conversation.engine,
    timestamp: Date.now(),
    tokens,
    cost
  }
  
  return {
    ...conversation,
    messages: [...conversation.messages, message],
    updatedAt: Date.now()
  }
}

export function createBranch(
  conversation: Conversation,
  fromMessageId: string
): { conversation: Conversation; branchId: string } {
  const messageIndex = conversation.messages.findIndex(m => m.id === fromMessageId)
  if (messageIndex === -1) {
    throw new Error('Message not found')
  }
  
  const branch: ConversationBranch = {
    id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    parentMessageId: fromMessageId,
    messages: [],
    createdAt: Date.now()
  }
  
  return {
    conversation: {
      ...conversation,
      branches: [...conversation.branches, branch],
      updatedAt: Date.now()
    },
    branchId: branch.id
  }
}

export function getAllConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load conversations:', error)
    return []
  }
}

export function getConversation(id: string): Conversation | undefined {
  return getAllConversations().find(c => c.id === id)
}

export function saveConversation(conversation: Conversation): void {
  try {
    const all = getAllConversations()
    const existing = all.findIndex(c => c.id === conversation.id)
    
    if (existing >= 0) {
      all[existing] = conversation
    } else {
      all.unshift(conversation)
    }
    
    // Keep only recent conversations
    const trimmed = all.slice(0, MAX_CONVERSATIONS)
    
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Failed to save conversation:', error)
  }
}

export function deleteConversation(id: string): void {
  try {
    const all = getAllConversations()
    const filtered = all.filter(c => c.id !== id)
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to delete conversation:', error)
  }
}

export function exportConversation(conversation: Conversation): void {
  const markdown = `# ${conversation.title}

**Created:** ${new Date(conversation.createdAt).toLocaleString()}
**Engine:** ${conversation.engine}
**Messages:** ${conversation.messages.length}

---

${conversation.messages.map(msg => `### ${msg.role === 'user' ? '👤 User' : '🤖 Assistant'}
${msg.content}

*${new Date(msg.timestamp).toLocaleString()}${msg.cost ? ` • $${msg.cost.toFixed(4)}` : ''}*`).join('\n\n---\n\n')}

${conversation.branches.length > 0 ? `\n## Branches (${conversation.branches.length})\n\n${conversation.branches.map(b => `### Branch from message\nCreated: ${new Date(b.createdAt).toLocaleString()}\nMessages: ${b.messages.length}`).join('\n\n')}` : ''}

---

*Exported from The Keys System*`

  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `conversation-${conversation.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function buildConversationContext(conversation: Conversation): Array<{ role: 'user' | 'assistant'; content: string }> {
  return conversation.messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))
}

export function searchConversations(query: string): Conversation[] {
  const all = getAllConversations()
  const lowerQuery = query.toLowerCase()
  
  return all.filter(conv => 
    conv.title.toLowerCase().includes(lowerQuery) ||
    conv.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    conv.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))
  )
}

export function archiveConversation(id: string): void {
  const conv = getConversation(id)
  if (conv) {
    saveConversation({ ...conv, archived: true, updatedAt: Date.now() })
  }
}

export function addTags(conversation: Conversation, tags: string[]): Conversation {
  const uniqueTags = Array.from(new Set([...conversation.tags, ...tags]))
  return { ...conversation, tags: uniqueTags, updatedAt: Date.now() }
}
