# Quick Start: Worldwide AI & Databases

## 🚀 Instant Setup (3 Steps)

### Step 1: Add API Keys (Optional)
Create `.env` file:
```bash
# Start with existing providers (you probably have these)
VITE_OPENAI_API_KEY=sk-proj-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_API_KEY=...

# Add NEW worldwide providers (get free keys below)
VITE_GROQ_API_KEY=...              # FREE tier: console.groq.com
VITE_MISTRAL_API_KEY=...           # FREE tier: console.mistral.ai
VITE_DEEPSEEK_API_KEY=...          # CHEAP: platform.deepseek.com
VITE_HUGGINGFACE_API_KEY=...       # FREE: huggingface.co/settings/tokens
```

### Step 2: Try FREE Knowledge Databases
No API keys needed! These work immediately:
- ✅ Wikipedia (enabled by default)
- ✅ arXiv (scientific papers)
- ✅ PubMed (medical research)

### Step 3: Test It!
```typescript
// Ultra-fast free model (Groq)
const response = await callLLM('Hello world', 'groq-llama-3.3-70b')

// Free knowledge search
const wiki = await searchWikipedia('quantum computing')
```

---

## 🆓 Best Free Options

### Free AI Engines
1. **Groq** - Ultra-fast (500+ tokens/sec), generous free tier
   - Get key: https://console.groq.com
   - Models: `groq-llama-3.3-70b`, `groq-mixtral-8x7b`

2. **Hugging Face** - Open source models
   - Get key: https://huggingface.co/settings/tokens
   - Models: `huggingface-meta-llama-3.3-70b`

3. **Mistral** - European alternative, free tier
   - Get key: https://console.mistral.ai
   - Models: `mistral-small-latest`

### Free Knowledge Databases (No Setup!)
- **Wikipedia** - Already works!
- **arXiv** - Scientific papers
- **PubMed** - Medical research

---

## 💎 Best Premium Options

### For Speed: Groq ($$$)
- **500+ tokens/second** via LPU
- Model: `groq-llama-3.3-70b`
- Use case: Real-time chat, streaming

### For Web Search: Perplexity ($)
- **Real-time Google search** with citations
- Model: `perplexity-sonar-pro`
- Use case: Current events, research

### For Coding: Codestral ($)
- **Code-specialized** Mistral model
- Model: `codestral-latest`
- Use case: Code generation, debugging

### For Enterprise: Cohere ($$$)
- **RAG & retrieval** optimized
- Model: `command-r-plus`
- Use case: Document analysis, Q&A

---

## 🌍 27 Models Available

| Provider | Models | Free Tier | Best For |
|----------|--------|-----------|----------|
| **OpenAI** | 5 | ❌ | GPT-4o, o1 reasoning |
| **Anthropic** | 4 | ❌ | Claude coding |
| **Google** | 4 | ❌ | Gemini multimodal |
| **Groq** | 3 | ✅ | **Ultra-fast** |
| **Mistral** | 3 | ✅ | European, multilingual |
| **DeepSeek** | 2 | ✅ | **Cheapest coding** |
| **Cohere** | 2 | ❌ | Enterprise RAG |
| **Perplexity** | 2 | ❌ | **Web search** |
| **Hugging Face** | 2 | ✅ | Open source |

---

## 📚 5 Knowledge Databases

| Database | Cost | Best For |
|----------|------|----------|
| **Wikipedia** | FREE | General knowledge |
| **arXiv** | FREE | Scientific papers |
| **PubMed** | FREE | Medical research |
| **Wolfram Alpha** | $5/mo | Math, calculations |
| **Serper (Google)** | $50/mo | Real-time search |

---

## 💡 Recommended Combos

### For Developers (Free)
```bash
VITE_OPENAI_API_KEY=...        # GPT-4o Mini
VITE_GROQ_API_KEY=...          # Ultra-fast responses
VITE_HUGGINGFACE_API_KEY=...   # Open source backup
```
Models: `gpt-4o-mini`, `groq-llama-3.3-70b`, `huggingface-mistral-7b`

### For Researchers (Free + $5/mo)
```bash
VITE_ANTHROPIC_API_KEY=...     # Claude reasoning
VITE_WOLFRAM_ALPHA_API_KEY=... # Calculations
```
Databases: Wikipedia, arXiv, PubMed, Wolfram Alpha

### For Real-Time Apps ($$$)
```bash
VITE_GROQ_API_KEY=...          # Ultra-fast
VITE_PERPLEXITY_API_KEY=...    # Web search
VITE_SERPER_API_KEY=...        # Google search
```
Models: `groq-llama-3.3-70b`, `perplexity-sonar-pro`

---

## ⚡ Performance Guide

### Speed Rankings (Fastest → Slowest)
1. 🚀 **Groq** - 500+ tokens/sec (LPU-powered)
2. ⚡ GPT-4o Mini, Claude Haiku, Gemini Flash
3. 🔄 Standard models (GPT-4o, Claude Sonnet)
4. 🧠 Reasoning models (o1, Claude Opus)

### Cost Rankings (Cheapest → Most Expensive)
1. 💰 **DeepSeek** - Ultra-cheap Chinese models
2. 💵 Groq, Hugging Face (free tiers)
3. 💳 Standard models
4. 💎 Premium models (o1, Claude Opus, Command R+)

---

## 🎯 Use Cases

### "I need FREE and FAST"
→ **Groq Llama 3.3 70B** (`groq-llama-3.3-70b`)  
Free tier, 500+ tokens/sec, good quality

### "I need real-time web search"
→ **Perplexity Sonar Pro** (`perplexity-sonar-pro`)  
Searches web automatically, provides citations

### "I need multilingual support"
→ **Mistral Large** (`mistral-large-latest`)  
European model, excellent multilingual

### "I need scientific research"
→ Enable: Wikipedia + arXiv + PubMed  
All free, no setup needed

### "I need coding help"
→ **Codestral** or **DeepSeek Coder**  
Code-specialized models

### "I need calculations"
→ **Wolfram Alpha** database  
$5/mo, computational engine

---

## 🔥 Pro Tips

1. **Start with Groq** - Free, fast, great quality
2. **Enable Wikipedia** - Already configured!
3. **Use Perplexity** for current events
4. **Try DeepSeek** for cheap coding
5. **Combine multiple databases** for research

---

## 📖 Full Documentation
See `WORLDWIDE_AI_GUIDE.md` for complete setup instructions.

---

**You now have access to 27 AI models and 5 knowledge databases! 🌍**
