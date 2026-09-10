export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  variables: string[]
  recommendedEngine?: string
  coreMode?: string
}

export const TEMPLATE_CATEGORIES = [
  'Business Strategy',
  'Content Creation',
  'Code & Development',
  'Analysis & Research',
  'Creative Writing',
  'Marketing & Sales',
  'Education & Learning',
  'Problem Solving',
] as const

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Business Strategy
  {
    id: 'business-plan',
    name: 'Business Plan Generator',
    description:
      'Create a comprehensive business plan for a startup or new venture',
    category: 'Business Strategy',
    prompt: `Create a detailed business plan for {{BUSINESS_NAME}}, a {{BUSINESS_TYPE}} company targeting {{TARGET_MARKET}}.

Include:
1. Executive Summary
2. Market Analysis
3. Competitive Landscape
4. Business Model & Revenue Streams
5. Marketing Strategy
6. Financial Projections (3-year)
7. Risk Assessment
8. Key Milestones

Make it professional, data-driven, and investor-ready.`,
    variables: ['BUSINESS_NAME', 'BUSINESS_TYPE', 'TARGET_MARKET'],
    recommendedEngine: 'gpt-5.2',
    coreMode: 'triad',
  },
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    description: 'Analyze strengths, weaknesses, opportunities, and threats',
    category: 'Business Strategy',
    prompt: `Perform a comprehensive SWOT analysis for {{COMPANY_NAME}} in the {{INDUSTRY}} industry.

Context: {{ADDITIONAL_CONTEXT}}

Provide:
- Strengths (internal advantages)
- Weaknesses (internal limitations)
- Opportunities (external factors to leverage)
- Threats (external challenges)

Include specific, actionable insights and strategic recommendations.`,
    variables: ['COMPANY_NAME', 'INDUSTRY', 'ADDITIONAL_CONTEXT'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'chadrak',
  },
  {
    id: 'market-research',
    name: 'Market Research Brief',
    description: 'Generate market research questions and methodology',
    category: 'Business Strategy',
    prompt: `Design a market research plan for {{PRODUCT_NAME}} targeting {{TARGET_AUDIENCE}}.

Research objectives: {{OBJECTIVES}}

Provide:
1. Key research questions
2. Recommended methodology (surveys, interviews, focus groups)
3. Sample size and demographics
4. Timeline and budget estimate
5. Success metrics`,
    variables: ['PRODUCT_NAME', 'TARGET_AUDIENCE', 'OBJECTIVES'],
    recommendedEngine: 'gpt-4o',
    coreMode: 'triad',
  },

  // Content Creation
  {
    id: 'blog-post',
    name: 'SEO Blog Post',
    description: 'Write an SEO-optimized blog post with proper structure',
    category: 'Content Creation',
    prompt: `Write a comprehensive, SEO-optimized blog post about {{TOPIC}}.

Target keyword: {{KEYWORD}}
Target audience: {{AUDIENCE}}
Tone: {{TONE}}

Requirements:
- 1500-2000 words
- Engaging introduction with hook
- Clear H2/H3 structure
- Include statistics and examples
- Actionable takeaways
- Meta description (160 chars)
- 3-5 internal linking opportunities`,
    variables: ['TOPIC', 'KEYWORD', 'AUDIENCE', 'TONE'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'nova',
  },
  {
    id: 'social-media-campaign',
    name: 'Social Media Campaign',
    description: 'Create a multi-platform social media campaign',
    category: 'Content Creation',
    prompt: `Design a 30-day social media campaign for {{BRAND_NAME}} promoting {{PRODUCT_SERVICE}}.

Goals: {{CAMPAIGN_GOALS}}
Platforms: {{PLATFORMS}}
Budget: {{BUDGET}}

Provide:
- Campaign theme and key messages
- Content calendar (30 posts)
- Platform-specific content variations
- Hashtag strategy
- Engagement tactics
- Success metrics and KPIs`,
    variables: [
      'BRAND_NAME',
      'PRODUCT_SERVICE',
      'CAMPAIGN_GOALS',
      'PLATFORMS',
      'BUDGET',
    ],
    recommendedEngine: 'gpt-4o',
    coreMode: 'triad',
  },

  // Code & Development
  {
    id: 'code-review',
    name: 'Code Review Assistant',
    description: 'Get detailed code review with best practices',
    category: 'Code & Development',
    prompt: `Review the following {{LANGUAGE}} code and provide detailed feedback:

\`\`\`{{LANGUAGE}}
{{CODE}}
\`\`\`

Analyze:
1. Code quality and readability
2. Performance optimizations
3. Security vulnerabilities
4. Best practices adherence
5. Potential bugs or edge cases
6. Suggested improvements with examples`,
    variables: ['LANGUAGE', 'CODE'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'chadrak',
  },
  {
    id: 'api-documentation',
    name: 'API Documentation Generator',
    description: 'Generate comprehensive API documentation',
    category: 'Code & Development',
    prompt: `Create professional API documentation for {{API_NAME}}.

Endpoints:
{{ENDPOINTS}}

Include:
- Overview and authentication
- Complete endpoint reference (method, URL, parameters)
- Request/response examples (JSON)
- Error codes and handling
- Rate limiting information
- Code examples in {{LANGUAGES}}
- Best practices guide`,
    variables: ['API_NAME', 'ENDPOINTS', 'LANGUAGES'],
    recommendedEngine: 'gpt-4o',
    coreMode: 'nova',
  },
  {
    id: 'debug-assistant',
    name: 'Debug Assistant',
    description: 'Help debug code with detailed analysis',
    category: 'Code & Development',
    prompt: `Help debug this {{LANGUAGE}} code. I'm experiencing: {{ERROR_DESCRIPTION}}

Code:
\`\`\`{{LANGUAGE}}
{{CODE}}
\`\`\`

Error message (if any):
{{ERROR_MESSAGE}}

Provide:
1. Root cause analysis
2. Step-by-step debugging approach
3. Fixed code with explanations
4. Prevention tips for future`,
    variables: ['LANGUAGE', 'ERROR_DESCRIPTION', 'CODE', 'ERROR_MESSAGE'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'chadrak',
  },

  // Analysis & Research
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Analyze competitors and market positioning',
    category: 'Analysis & Research',
    prompt: `Perform a competitive analysis for {{YOUR_COMPANY}} against {{COMPETITORS}}.

Industry: {{INDUSTRY}}
Focus areas: {{FOCUS_AREAS}}

Provide:
1. Competitor positioning matrix
2. Feature/pricing comparison
3. Market share estimates
4. Unique value propositions
5. Gaps and opportunities
6. Strategic recommendations`,
    variables: ['YOUR_COMPANY', 'COMPETITORS', 'INDUSTRY', 'FOCUS_AREAS'],
    recommendedEngine: 'gpt-5.2',
    coreMode: 'chadrak',
  },
  {
    id: 'research-summary',
    name: 'Research Paper Summary',
    description: 'Summarize academic papers with key insights',
    category: 'Analysis & Research',
    prompt: `Summarize this research paper/article about {{TOPIC}}:

{{FULL_TEXT}}

Provide:
- Executive summary (200 words)
- Key findings and methodology
- Implications and applications
- Limitations and critiques
- Related research areas
- Citation in APA format`,
    variables: ['TOPIC', 'FULL_TEXT'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'chadrak',
  },

  // Creative Writing
  {
    id: 'story-outline',
    name: 'Story Outline Creator',
    description: 'Generate detailed story outlines for fiction',
    category: 'Creative Writing',
    prompt: `Create a detailed story outline for a {{GENRE}} story with this premise:

{{PREMISE}}

Setting: {{SETTING}}
Target audience: {{AUDIENCE}}

Include:
- Three-act structure breakdown
- Main characters (protagonist, antagonist, supporting)
- Key plot points and turning moments
- Character arcs and development
- Themes and symbolism
- Potential chapter/scene breakdown (12-15 chapters)`,
    variables: ['GENRE', 'PREMISE', 'SETTING', 'AUDIENCE'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'nova',
  },
  {
    id: 'script-dialogue',
    name: 'Screenplay Dialogue',
    description: 'Write natural, character-driven dialogue',
    category: 'Creative Writing',
    prompt: `Write a screenplay scene with natural dialogue for:

Scene: {{SCENE_DESCRIPTION}}
Characters: {{CHARACTERS}}
Tone: {{TONE}}
Goal: {{SCENE_GOAL}}

Requirements:
- Proper screenplay format
- Distinct character voices
- Subtext and conflict
- Natural pacing
- Action lines between dialogue
- 2-3 pages`,
    variables: ['SCENE_DESCRIPTION', 'CHARACTERS', 'TONE', 'SCENE_GOAL'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'nova',
  },

  // Marketing & Sales
  {
    id: 'product-launch',
    name: 'Product Launch Plan',
    description: 'Create a comprehensive product launch strategy',
    category: 'Marketing & Sales',
    prompt: `Develop a product launch plan for {{PRODUCT_NAME}}.

Product description: {{PRODUCT_DESCRIPTION}}
Target market: {{TARGET_MARKET}}
Launch date: {{LAUNCH_DATE}}
Budget: {{BUDGET}}

Include:
- Pre-launch strategy (30 days before)
- Launch day tactics
- Post-launch momentum (30 days after)
- Channel mix and messaging
- Influencer/PR strategy
- Success metrics`,
    variables: [
      'PRODUCT_NAME',
      'PRODUCT_DESCRIPTION',
      'TARGET_MARKET',
      'LAUNCH_DATE',
      'BUDGET',
    ],
    recommendedEngine: 'gpt-4o',
    coreMode: 'triad',
  },
  {
    id: 'sales-email',
    name: 'Sales Email Sequence',
    description: 'Write a high-converting email sequence',
    category: 'Marketing & Sales',
    prompt: `Create a 5-email sales sequence for {{PRODUCT_SERVICE}}.

Target: {{TARGET_PERSONA}}
Pain points: {{PAIN_POINTS}}
Unique value: {{VALUE_PROPOSITION}}

Each email should:
- Have compelling subject line
- Address specific pain point
- Build on previous email
- Include clear CTA
- Be 150-250 words

Provide all 5 emails with timing recommendations.`,
    variables: [
      'PRODUCT_SERVICE',
      'TARGET_PERSONA',
      'PAIN_POINTS',
      'VALUE_PROPOSITION',
    ],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'nova',
  },

  // Education & Learning
  {
    id: 'lesson-plan',
    name: 'Lesson Plan Generator',
    description: 'Create engaging lesson plans for educators',
    category: 'Education & Learning',
    prompt: `Create a comprehensive lesson plan for teaching {{SUBJECT}} to {{GRADE_LEVEL}}.

Topic: {{TOPIC}}
Duration: {{DURATION}}
Learning objectives: {{OBJECTIVES}}

Include:
- Introduction/hook (5-10 min)
- Main instruction activities
- Guided practice
- Independent work
- Assessment methods
- Differentiation strategies
- Required materials
- Homework assignment`,
    variables: ['SUBJECT', 'GRADE_LEVEL', 'TOPIC', 'DURATION', 'OBJECTIVES'],
    recommendedEngine: 'gpt-4o',
    coreMode: 'triad',
  },
  {
    id: 'explain-concept',
    name: 'Concept Explainer',
    description: 'Explain complex concepts simply',
    category: 'Education & Learning',
    prompt: `Explain {{CONCEPT}} to a {{AUDIENCE_LEVEL}} audience.

Context: {{CONTEXT}}

Requirements:
- Start with simple analogy
- Build up complexity gradually
- Use real-world examples
- Include visual description (if applicable)
- Common misconceptions
- Practical applications
- Further learning resources`,
    variables: ['CONCEPT', 'AUDIENCE_LEVEL', 'CONTEXT'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'nova',
  },

  // Problem Solving
  {
    id: 'decision-framework',
    name: 'Decision-Making Framework',
    description: 'Analyze decisions with structured framework',
    category: 'Problem Solving',
    prompt: `Help me make a decision about: {{DECISION}}

Options:
{{OPTIONS}}

Constraints: {{CONSTRAINTS}}
Timeframe: {{TIMEFRAME}}

Use a structured framework to:
1. Define decision criteria (weighted)
2. Evaluate each option against criteria
3. Identify risks and mitigation strategies
4. Consider second-order effects
5. Provide recommendation with rationale
6. Outline implementation steps`,
    variables: ['DECISION', 'OPTIONS', 'CONSTRAINTS', 'TIMEFRAME'],
    recommendedEngine: 'gpt-5.2',
    coreMode: 'chadrak',
  },
  {
    id: 'root-cause-analysis',
    name: 'Root Cause Analysis',
    description: 'Identify root causes using 5 Whys technique',
    category: 'Problem Solving',
    prompt: `Perform a root cause analysis for this problem:

Problem: {{PROBLEM_DESCRIPTION}}

Context: {{CONTEXT}}
Impact: {{IMPACT}}

Use:
1. 5 Whys technique
2. Fishbone diagram categories (People, Process, Technology, Environment)
3. Contributing factors analysis
4. Root cause identification
5. Recommended solutions (short-term and long-term)
6. Prevention strategies`,
    variables: ['PROBLEM_DESCRIPTION', 'CONTEXT', 'IMPACT'],
    recommendedEngine: 'claude-sonnet-5',
    coreMode: 'chadrak',
  },
]

// Template management functions
export function getTemplatesByCategory(
  category: TemplateCategory,
): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter((t) => t.category === category)
}

export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase()
  return PROMPT_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery),
  )
}

export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((t) => t.id === id)
}

export function fillTemplate(
  template: PromptTemplate,
  values: Record<string, string>,
): string {
  let filled = template.prompt
  template.variables.forEach((variable) => {
    const value = values[variable] || `[${variable}]`
    filled = filled.replace(new RegExp(`{{${variable}}}`, 'g'), value)
  })
  return filled
}

// Save custom user templates
const CUSTOM_TEMPLATES_KEY = 'custom-prompt-templates'

export function saveCustomTemplate(
  template: Omit<PromptTemplate, 'id'>,
): PromptTemplate {
  const customTemplates = getCustomTemplates()
  const newTemplate: PromptTemplate = {
    ...template,
    id: `custom-${Date.now()}`,
  }
  customTemplates.push(newTemplate)
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates))
  return newTemplate
}

export function getCustomTemplates(): PromptTemplate[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function deleteCustomTemplate(id: string): void {
  const customTemplates = getCustomTemplates()
  const filtered = customTemplates.filter((t) => t.id !== id)
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(filtered))
}

export function getAllTemplates(): PromptTemplate[] {
  return [...PROMPT_TEMPLATES, ...getCustomTemplates()]
}
