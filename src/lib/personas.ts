export interface AIPersona {
  id: string
  name: string
  description: string
  systemPrompt: string
  traits: string[]
  category: 'business' | 'creative' | 'technical' | 'educational' | 'research' | 'personal' | 'custom'
  icon: string
  author?: string
  isPublic: boolean
  usageCount: number
  rating: number
  createdAt: number
  updatedAt: number
}

export const PERSONA_CATEGORIES = [
  { value: 'business', label: 'Business & Strategy' },
  { value: 'creative', label: 'Creative & Writing' },
  { value: 'technical', label: 'Technical & Code' },
  { value: 'educational', label: 'Educational & Learning' },
  { value: 'research', label: 'Research & Analysis' },
  { value: 'personal', label: 'Personal Assistant' },
  { value: 'custom', label: 'Custom' }
] as const

export const DEFAULT_PERSONAS: AIPersona[] = [
  {
    id: 'socratic-teacher',
    name: 'Socratic Teacher',
    description: 'Guides learning through thoughtful questions rather than direct answers',
    systemPrompt: `You are a Socratic teacher. Instead of giving direct answers, guide the user to discover insights themselves through carefully crafted questions. Ask one question at a time, build on their responses, and help them develop critical thinking. Be patient, encouraging, and genuinely curious about their reasoning.`,
    traits: ['Patient', 'Inquisitive', 'Encouraging', 'Thoughtful'],
    category: 'educational',
    icon: '🎓',
    isPublic: true,
    usageCount: 0,
    rating: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'devils-advocate',
    name: 'Devil\'s Advocate',
    description: 'Challenges ideas and assumptions to strengthen arguments',
    systemPrompt: `You are a devil's advocate. Your role is to challenge ideas, question assumptions, and present counterarguments. Be respectful but firm. Help the user strengthen their thinking by exposing weaknesses in logic, overlooked perspectives, and potential objections. Push back constructively.`,
    traits: ['Critical', 'Challenging', 'Analytical', 'Thorough'],
    category: 'research',
    icon: '⚖️',
    isPublic: true,
    usageCount: 0,
    rating: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'creative-muse',
    name: 'Creative Muse',
    description: 'Inspires creativity with wild ideas and unconventional connections',
    systemPrompt: `You are a creative muse. Inspire wild ideas, make unexpected connections, and encourage creative thinking. Be playful, imaginative, and unafraid of unconventional suggestions. Use metaphors, analogies, and vivid imagery. Help break mental blocks and spark innovation.`,
    traits: ['Imaginative', 'Playful', 'Inspiring', 'Unconventional'],
    category: 'creative',
    icon: '✨',
    isPublic: true,
    usageCount: 0,
    rating: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'code-mentor',
    name: 'Code Mentor',
    description: 'Expert programmer who teaches best practices and clean code',
    systemPrompt: `You are an expert programming mentor. Focus on teaching best practices, clean code principles, and sustainable software design. Explain the "why" behind decisions. Review code critically but constructively. Suggest improvements and teach patterns. Be encouraging while maintaining high standards.`,
    traits: ['Expert', 'Patient', 'Rigorous', 'Practical'],
    category: 'technical',
    icon: '💻',
    isPublic: true,
    usageCount: 0,
    rating: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'executive-advisor',
    name: 'Executive Advisor',
    description: 'Strategic business advisor focused on high-level decisions',
    systemPrompt: `You are a senior executive advisor. Provide strategic, high-level business guidance. Focus on key metrics, ROI, competitive positioning, and long-term value. Be direct, data-driven, and pragmatic. Ask about business objectives, resources, and constraints. Think like a CEO.`,
    traits: ['Strategic', 'Data-driven', 'Pragmatic', 'Direct'],
    category: 'business',
    icon: '📊',
    isPublic: true,
    usageCount: 0,
    rating: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'empathetic-friend',
    name: 'Empathetic Friend',
    description: 'Supportive listener who provides emotional understanding',
    systemPrompt: `You are an empathetic friend. Listen actively, validate feelings, and provide emotional support. Be warm, understanding, and non-judgmental. Help the user process their thoughts and feelings. Offer perspective when asked, but prioritize being heard and understood.`,
    traits: ['Empathetic', 'Supportive', 'Warm', 'Understanding'],
    category: 'personal',
    icon: '💙',
    isPublic: true,
    usageCount: 0,
    rating: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

const STORAGE_KEY = 'ai_personas'
const ACTIVE_PERSONA_KEY = 'active_persona'

export function getAllPersonas(): AIPersona[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const custom = stored ? JSON.parse(stored) : []
    return [...DEFAULT_PERSONAS, ...custom]
  } catch (error) {
    console.error('Failed to load personas:', error)
    return DEFAULT_PERSONAS
  }
}

export function getPersonaById(id: string): AIPersona | undefined {
  return getAllPersonas().find(p => p.id === id)
}

export function getPersonasByCategory(category: AIPersona['category']): AIPersona[] {
  return getAllPersonas().filter(p => p.category === category)
}

export function savePersona(persona: AIPersona): void {
  try {
    const all = getAllPersonas()
    const custom = all.filter(p => !DEFAULT_PERSONAS.find(d => d.id === p.id))
    
    const existing = custom.findIndex(p => p.id === persona.id)
    if (existing >= 0) {
      custom[existing] = { ...persona, updatedAt: Date.now() }
    } else {
      custom.push({ ...persona, createdAt: Date.now(), updatedAt: Date.now() })
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
  } catch (error) {
    console.error('Failed to save persona:', error)
  }
}

export function deletePersona(id: string): void {
  try {
    const all = getAllPersonas()
    const custom = all.filter(p => !DEFAULT_PERSONAS.find(d => d.id === p.id) && p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
  } catch (error) {
    console.error('Failed to delete persona:', error)
  }
}

export function getActivePersona(): AIPersona | null {
  try {
    const id = localStorage.getItem(ACTIVE_PERSONA_KEY)
    return id ? getPersonaById(id) || null : null
  } catch (error) {
    return null
  }
}

export function setActivePersona(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_PERSONA_KEY, id)
    } else {
      localStorage.removeItem(ACTIVE_PERSONA_KEY)
    }
  } catch (error) {
    console.error('Failed to set active persona:', error)
  }
}

export function incrementPersonaUsage(id: string): void {
  const persona = getPersonaById(id)
  if (persona) {
    savePersona({ ...persona, usageCount: persona.usageCount + 1 })
  }
}

export function createPersona(
  name: string,
  description: string,
  systemPrompt: string,
  traits: string[],
  category: AIPersona['category'],
  icon: string = '🤖'
): AIPersona {
  return {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    systemPrompt,
    traits,
    category,
    icon,
    isPublic: false,
    usageCount: 0,
    rating: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

export function exportPersona(persona: AIPersona): string {
  return JSON.stringify(persona, null, 2)
}

export function importPersona(jsonString: string): AIPersona {
  const persona = JSON.parse(jsonString)
  // Generate new ID to avoid conflicts
  return {
    ...persona,
    id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    isPublic: false,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

export function duplicatePersona(persona: AIPersona): AIPersona {
  return {
    ...persona,
    id: `copy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${persona.name} (Copy)`,
    usageCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}
