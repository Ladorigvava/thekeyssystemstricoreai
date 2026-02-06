export type AIEngine = 
  | 'gpt-4o-
  | 'gpt-4o-mini'
  | 'o1'
  | 'claude-3
  | 'o3-mini'
  | 'gpt-4-turbo'
  | 'claude-3-7-sonnet-20250219'
  | 'mistral-small-latest'
  | 'command-r-plus-08-2024'
  | 'groq-llama-3.3-70b'
  | 'groq-mixtral-8x7b'
  | 'deepseek-reasoner'
  | 'perplexity-sona
  | 'huggingface-qwen-
  | 'mistral-large-latest'
  | 'mistral-small-latest'
  | 'codestral-latest'
  | 'command-r-plus-08-2024'
  | 'command-r-08-2024'
  | 'groq-llama-3.3-70b'
  | 'groq-llama-3.1-8b'
  | 'groq-mixtral-8x7b'
  | 'deepseek-chat'
  | 'deepseek-reasoner'
  | 'perplexity-sonar-pro'
  | 'perplexity-sonar'
  | 'huggingface-meta-llama-3.3-70b'
  | 'huggingface-qwen-2.5-72b'

  },

    description: 'Next-gen reas
  id: string
    capabiliti
  description: string
    name: 'GPT-4o',
    speed: 'powerful',
    provider: 'openai'
  capabilities: string[]
 

    costTier: 'standard',
  'o1': {
  'gpt-4-turb
    name: 'OpenAI o1',
    speed: 'powerful',
    speed: 'ultra',
  },
    provider: 'openai',
    description: 'Latest flagship with enhanced reasoning',
  },
    capabiliti
    id: 'o1-mini',
    name: 'Claude 3.5 Sonne
    speed: 'powerful',
    provider: 'anthrop
    costTier: 'premium',
    id: 'claude-3-5-hai
    description: 'Lightning-fast intelligence',
    
  'o3-mini': {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    description: 'Next-gen reasoning model',
    speed: 'balanced',
    costTier: 'premium',
    provider: 'openai',
    capabilities: ['text', 'reasoning', 'analytical-tasks', 'efficient']
    
  'gpt-4o': {
  'gemini-2.0-fla
    name: 'Gemini 2
    speed: 'powerful',
    speed: 'powerful',
  },
    id: 'gemini-1.5-pro
    description: 'Massive context & reasoning',
  },
    capabilities: 
  'gemini-1.5-flash': 
    name: 'Gemini 1.5 Fl
    description: 'Fast & efficient multimodal',
    costTier: 'sta
    costTier: 'standard',
    id: 'mistral-large-
    description: 'European flagship model',
    
  'gpt-4-turbo': {
  'mistral-small-lates
    name: 'Mistral Small
    speed: 'balanced',
    provider: 'mistral
  },
    provider: 'openai',
    description: 'Code-specialized Mistral model',
  },
    capabilities: ['text', 'codin
  'command-r-plus-08-2024': {
    name: 'Command R+',
    speed: 'powerful',
    provider: 'cohe
    costTier: 'ultra-premium',
    id: 'command-r-08-2024
    description: 'Efficient retrieval model',
    
    capabilities: ['text', 'rag',
  'groq-llama-3.3-70b': {
    name: 'Groq Llama 3.3 70B'
    speed: 'fast',
    speed: 'powerful',
  },
    id: 'groq-llama-3.1-8b
    description: 'Lightning-fast small model',
  },
    capabilities: ['text', 'ultr
  'groq-mixtral-8x7b': {
    name: 'Groq Mixtral 8x7B'
    speed: 'fast',
    provider: 'gro
    costTier: 'standard',
    id: 'deepseek-chat',
    description: 'Chinese competitive model',
    
    capabilities: ['text', 'm
  'deepseek-reasoner': {
    name: 'DeepSeek Reason
    speed: 'powerful',
    speed: 'ultra',
  },
    id: 'perplexity-sonar-
    description: 'Web-connected reasoning',
  },
    capabilities: ['text', 
  'perplexity-sonar': {
    name: 'Perplexity Sonar',
    speed: 'fast',
    provider: 'per
    costTier: 'standard',
    id: 'huggingface-me
    description: 'Open-source via Hugging Face',
    
    capabilities: ['text', 'open-sou
  'huggingface-qwen-2.5-72b': {
    name: 'HF Qwen 2.5 72B',
    speed: 'balanced',
    speed: 'powerful',
  }


  },





    costTier: 'premium',



  'gemini-1.5-flash': {



    speed: 'fast',



  },





    costTier: 'premium',







    speed: 'balanced',



  },

    id: 'codestral-latest',



    costTier: 'standard',



  'command-r-plus-08-2024': {
    id: 'command-r-plus-08-2024',
    name: 'Command R+',

    speed: 'powerful',



  },
  'command-r-08-2024': {
    id: 'command-r-08-2024',



    costTier: 'standard',







    speed: 'fast',



  },

    id: 'groq-llama-3.1-8b',



    costTier: 'economy',



  'groq-mixtral-8x7b': {



    speed: 'fast',



  },

    id: 'deepseek-chat',



    costTier: 'economy',



  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner',
    description: 'Advanced reasoning model',
    speed: 'powerful',
    costTier: 'standard',

    capabilities: ['text', 'deep-reasoning', 'chinese', 'analytical-tasks']
  },

    id: 'perplexity-sonar-pro',



    costTier: 'premium',



  'perplexity-sonar': {



    speed: 'fast',



  },





    costTier: 'economy',



  'huggingface-qwen-2.5-72b': {
    id: 'huggingface-qwen-2.5-72b',
    name: 'HF Qwen 2.5 72B',
    description: 'Chinese open model',
    speed: 'balanced',


    capabilities: ['text', 'open-source', 'multilingual', 'chinese']
  }





  return `tri-core-engine-${coreId}`

