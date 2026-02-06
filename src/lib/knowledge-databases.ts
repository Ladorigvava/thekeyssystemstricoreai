/**
 * Knowledge Database Integrations
 * Connects to worldwide knowledge sources for AI-enhanced responses
 */

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const WOLFRAM_ALPHA_API_KEY = import.meta.env.VITE_WOLFRAM_ALPHA_API_KEY
const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY // Google Search API

export interface WikipediaResult {
  title: string
  extract: string
  url: string
  thumbnail?: string
}

export interface WolframAlphaResult {
  queryresult: {
    success: boolean
    pods: Array<{
      title: string
      subpods: Array<{
        plaintext: string
        img?: { src: string }
      }>
    }>
  }
}

export interface WebSearchResult {
  title: string
  link: string
  snippet: string
  position: number
}

export interface KnowledgeSource {
  source: 'wikipedia' | 'wolfram' | 'web-search' | 'arxiv' | 'pubmed'
  title: string
  content: string
  url: string
  relevance?: number
}

/**
 * Search Wikipedia for factual information
 */
export async function searchWikipedia(query: string, limit: number = 3): Promise<WikipediaResult[]> {
  try {
    // First, search for matching articles
    const searchUrl = `${WIKIPEDIA_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=${limit}`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    
    if (!searchData.query?.search || searchData.query.search.length === 0) {
      return []
    }

    // Get full extracts for top results
    const results: WikipediaResult[] = []
    
    for (const item of searchData.query.search.slice(0, limit)) {
      const pageId = item.pageid
      const extractUrl = `${WIKIPEDIA_API}?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&pageids=${pageId}&format=json&origin=*`
      
      const extractResponse = await fetch(extractUrl)
      const extractData = await extractResponse.json()
      
      const page = extractData.query?.pages?.[pageId]
      if (page) {
        results.push({
          title: page.title,
          extract: page.extract || '',
          url: `https://en.wikipedia.org/?curid=${pageId}`,
          thumbnail: page.thumbnail?.source
        })
      }
    }
    
    return results
  } catch (error) {
    console.error('Wikipedia search error:', error)
    return []
  }
}

/**
 * Query Wolfram Alpha for computational knowledge
 */
export async function queryWolframAlpha(query: string): Promise<string> {
  if (!WOLFRAM_ALPHA_API_KEY) {
    throw new Error('Wolfram Alpha API key not configured. Add VITE_WOLFRAM_ALPHA_API_KEY to .env file')
  }

  try {
    const url = `https://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&format=plaintext&output=JSON&appid=${WOLFRAM_ALPHA_API_KEY}`
    
    const response = await fetch(url)
    const data: WolframAlphaResult = await response.json()
    
    if (!data.queryresult?.success) {
      return 'No computational result found'
    }

    // Extract relevant pods (answer sections)
    const results: string[] = []
    
    for (const pod of data.queryresult.pods || []) {
      if (pod.title && pod.subpods?.[0]?.plaintext) {
        results.push(`${pod.title}: ${pod.subpods[0].plaintext}`)
      }
    }
    
    return results.join('\n\n') || 'No results available'
  } catch (error) {
    console.error('Wolfram Alpha error:', error)
    throw new Error('Failed to query Wolfram Alpha')
  }
}

/**
 * Perform web search using Serper API (Google Search)
 */
export async function searchWeb(query: string, limit: number = 5): Promise<WebSearchResult[]> {
  if (!SERPER_API_KEY) {
    throw new Error('Serper API key not configured. Add VITE_SERPER_API_KEY to .env file')
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: limit
      })
    })

    const data = await response.json()
    
    return data.organic?.map((result: any, index: number) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      position: index + 1
    })) || []
  } catch (error) {
    console.error('Web search error:', error)
    return []
  }
}

/**
 * Search arXiv for scientific papers
 */
export async function searchArxiv(query: string, limit: number = 3): Promise<KnowledgeSource[]> {
  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}`
    
    const response = await fetch(url)
    const xmlText = await response.text()
    
    // Simple XML parsing (in production, use a proper XML parser)
    const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || []
    
    const results: KnowledgeSource[] = []
    
    for (const entry of entries) {
      const titleMatch = entry.match(/<title>(.*?)<\/title>/)
      const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/)
      const linkMatch = entry.match(/<id>(.*?)<\/id>/)
      
      if (titleMatch && summaryMatch && linkMatch) {
        results.push({
          source: 'arxiv',
          title: titleMatch[1].trim(),
          content: summaryMatch[1].trim().replace(/\s+/g, ' '),
          url: linkMatch[1].trim()
        })
      }
    }
    
    return results
  } catch (error) {
    console.error('arXiv search error:', error)
    return []
  }
}

/**
 * Search PubMed for medical/scientific literature
 */
export async function searchPubMed(query: string, limit: number = 3): Promise<KnowledgeSource[]> {
  try {
    // Search for article IDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${limit}`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    
    const ids = searchData.esearchresult?.idlist || []
    if (ids.length === 0) return []
    
    // Fetch article details
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
    
    const fetchResponse = await fetch(fetchUrl)
    const fetchData = await fetchResponse.json()
    
    const results: KnowledgeSource[] = []
    
    for (const id of ids) {
      const article = fetchData.result?.[id]
      if (article) {
        results.push({
          source: 'pubmed',
          title: article.title || 'Untitled',
          content: article.abstract || 'No abstract available',
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
        })
      }
    }
    
    return results
  } catch (error) {
    console.error('PubMed search error:', error)
    return []
  }
}

/**
 * Aggregate knowledge from multiple sources
 */
export async function aggregateKnowledge(
  query: string,
  sources: Array<'wikipedia' | 'wolfram' | 'web-search' | 'arxiv' | 'pubmed'> = ['wikipedia', 'web-search']
): Promise<KnowledgeSource[]> {
  const results: KnowledgeSource[] = []
  
  const promises = sources.map(async (source) => {
    try {
      switch (source) {
        case 'wikipedia':
          const wikiResults = await searchWikipedia(query, 2)
          return wikiResults.map(r => ({
            source: 'wikipedia' as const,
            title: r.title,
            content: r.extract,
            url: r.url
          }))
        
        case 'web-search':
          const webResults = await searchWeb(query, 3)
          return webResults.map(r => ({
            source: 'web-search' as const,
            title: r.title,
            content: r.snippet,
            url: r.link,
            relevance: 1 / r.position
          }))
        
        case 'arxiv':
          return await searchArxiv(query, 2)
        
        case 'pubmed':
          return await searchPubMed(query, 2)
        
        case 'wolfram':
          const wolframResult = await queryWolframAlpha(query)
          return [{
            source: 'wolfram' as const,
            title: 'Wolfram Alpha Result',
            content: wolframResult,
            url: `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`
          }]
        
        default:
          return []
      }
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error)
      return []
    }
  })
  
  const allResults = await Promise.all(promises)
  
  return allResults.flat()
}

/**
 * Format knowledge sources for AI context
 */
export function formatKnowledgeForAI(sources: KnowledgeSource[]): string {
  if (sources.length === 0) {
    return 'No external knowledge sources available.'
  }

  let formatted = '=== KNOWLEDGE BASE CONTEXT ===\n\n'
  
  for (const source of sources) {
    formatted += `[${source.source.toUpperCase()}] ${source.title}\n`
    formatted += `${source.content.slice(0, 500)}${source.content.length > 500 ? '...' : ''}\n`
    formatted += `Source: ${source.url}\n\n`
  }
  
  formatted += '=== END KNOWLEDGE BASE ===\n\n'
  
  return formatted
}

/**
 * Enhance AI prompt with knowledge database context
 */
export async function enhancePromptWithKnowledge(
  prompt: string,
  enabledSources: Array<'wikipedia' | 'wolfram' | 'web-search' | 'arxiv' | 'pubmed'> = ['wikipedia']
): Promise<string> {
  // Extract potential search queries from the prompt
  const query = extractSearchQuery(prompt)
  
  if (!query) {
    return prompt // No factual query detected
  }

  try {
    const knowledge = await aggregateKnowledge(query, enabledSources)
    const knowledgeContext = formatKnowledgeForAI(knowledge)
    
    return `${knowledgeContext}\nUser Query: ${prompt}\n\nPlease answer using the provided knowledge base context where relevant, and cite sources.`
  } catch (error) {
    console.error('Failed to enhance prompt with knowledge:', error)
    return prompt // Fall back to original prompt
  }
}

/**
 * Extract searchable query from user prompt
 */
function extractSearchQuery(prompt: string): string | null {
  // Simple heuristic: if prompt contains question words or is asking for facts
  const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'is', 'are', 'was', 'were', 'define', 'explain']
  const lowerPrompt = prompt.toLowerCase()
  
  const hasQuestionWord = questionWords.some(word => lowerPrompt.includes(word))
  
  if (hasQuestionWord || prompt.includes('?')) {
    // Return the prompt itself as the search query
    return prompt.slice(0, 200) // Limit query length
  }
  
  return null
}
