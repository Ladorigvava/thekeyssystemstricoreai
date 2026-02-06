# AI Engines Guide - The Keys System

## 🚀 All Available Engines (13 Total)

### OpenAI Models (5)

1. **o1** - Ultimate reasoning model with extended thinking
   - Speed: Ultra ⚡⚡⚡⚡
   - Cost: Ultra-Premium 💎💎💎💎
   - Best for: Complex analysis, deep reasoning, strategic planning
   - Note: No streaming support, no temperature control

2. **o1-mini** - Efficient reasoning at lower cost
   - Speed: Balanced ⚖️
   - Cost: Premium 💎💎💎
   - Best for: Analytical tasks, structured reasoning

3. **GPT-4o** - Advanced reasoning & multimodal
   - Speed: Powerful 🚀
   - Cost: Premium 💎💎💎
   - Best for: General-purpose, vision tasks, balanced performance

4. **GPT-4o-mini** - Fast & efficient analysis
   - Speed: Fast ⚡
   - Cost: Economy 💰
   - Best for: Quick iterations, cost-effective analysis

5. **GPT-4 Turbo** - Previous flagship with 128K context
   - Speed: Powerful 🚀
   - Cost: Premium 💎💎💎
   - Best for: Long documents, complex reasoning

### Anthropic Models (4)

6. **Claude 3.7 Sonnet** - Latest flagship with enhanced reasoning
   - Speed: Ultra ⚡⚡⚡⚡
   - Cost: Premium 💎💎💎
   - Best for: Extended thinking, coding, advanced reasoning
   - Date: 2025-02-19 (Latest)

7. **Claude 3.5 Sonnet** - Top-tier reasoning & coding
   - Speed: Ultra ⚡⚡⚡⚡
   - Cost: Premium 💎💎💎
   - Best for: Complex reasoning, software development

8. **Claude 3.5 Haiku** - Lightning-fast intelligence
   - Speed: Fast ⚡
   - Cost: Economy 💰
   - Best for: Quick responses, cost-effective processing

9. **Claude 3 Opus** - Ultimate reasoning power
   - Speed: Ultra ⚡⚡⚡⚡
   - Cost: Ultra-Premium 💎💎💎💎
   - Best for: Most complex tasks, highest quality output

### Google Models (4)

10. **Gemini 2.0 Flash Thinking** - Experimental reasoning with thinking mode
    - Speed: Ultra ⚡⚡⚡⚡
    - Cost: Premium 💎💎💎
    - Best for: Deep reasoning, experimental features
    - Note: Experimental model with extended thinking

11. **Gemini 2.0 Flash** - Next-gen multimodal speed
    - Speed: Fast ⚡
    - Cost: Economy 💰
    - Best for: Fast multimodal tasks, cost-effective

12. **Gemini 1.5 Pro** - Massive context & reasoning
    - Speed: Powerful 🚀
    - Cost: Premium 💎💎💎
    - Best for: Ultra-long context (2M tokens), comprehensive analysis

13. **Gemini 1.5 Flash** - Efficient multimodal AI
    - Speed: Balanced ⚖️
    - Cost: Standard 💎💎
    - Best for: Balanced performance and cost

---

## 🔧 Configuration

### 1. Setup API Keys

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Add your API keys to `.env`:
```env
VITE_OPENAI_API_KEY=sk-proj-your-key-here
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
VITE_GOOGLE_AI_API_KEY=AIza-your-key-here
```

### 2. Get API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google AI**: https://aistudio.google.com/app/apikey

---

## ✅ Engine Features

### All Engines Support:
- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ Automatic fallback to cheaper models
- ✅ Rate limit handling with jitter
- ✅ Error categorization (auth, network, rate limit, server, client)
- ✅ Response caching
- ✅ History tracking

### Streaming Support:
- ✅ GPT-4o, GPT-4o-mini, GPT-4 Turbo
- ✅ All Claude models (3.7, 3.5 Sonnet, 3.5 Haiku, 3 Opus)
- ✅ All Gemini models (2.0 Flash, 2.0 Flash Thinking, 1.5 Pro, 1.5 Flash)
- ❌ o1, o1-mini (fallback to non-streaming)

### Special Handling:
- **o1 models**: No temperature control, higher max_tokens (16384)
- **Google AI**: Safety filter detection and proper error messages
- **All models**: Response validation and structure verification

---

## 🎯 Recommended Use Cases

### For Speed (Fastest Response):
1. Claude 3.5 Haiku
2. GPT-4o-mini
3. Gemini 2.0 Flash

### For Deep Reasoning:
1. OpenAI o1
2. Claude 3.7 Sonnet
3. Gemini 2.0 Flash Thinking

### For Cost-Effectiveness:
1. GPT-4o-mini
2. Claude 3.5 Haiku
3. Gemini 2.0 Flash

### For Complex Tasks:
1. Claude 3 Opus
2. OpenAI o1
3. Claude 3.7 Sonnet

### For Long Context:
1. Gemini 1.5 Pro (2M tokens)
2. GPT-4 Turbo (128K tokens)
3. Claude models (200K tokens)

---

## 🔄 Automatic Fallback Chain

If an engine fails after retries, the system automatically tries:

**OpenAI:**
- o1 → o1-mini → gpt-4o → gpt-4o-mini
- o1-mini → gpt-4o → gpt-4o-mini
- gpt-4o → gpt-4o-mini
- gpt-4-turbo → gpt-4o → gpt-4o-mini

**Anthropic:**
- claude-3-7-sonnet → claude-3-5-haiku
- claude-3-5-sonnet → claude-3-5-haiku
- claude-3-opus → claude-3-5-haiku

**Google:**
- gemini-2.0-flash-thinking → gemini-2.0-flash
- gemini-1.5-pro → gemini-1.5-flash

---

## 🐛 Troubleshooting

### "API key not configured"
- Check your `.env` file exists and has the correct keys
- Restart the dev server after adding keys: `npm run dev`

### "Rate limit exceeded"
- System automatically retries with exponential backoff
- Switch to a different provider if one is overloaded

### "Safety block" (Google AI)
- Content was filtered by Google's safety systems
- Try rephrasing your prompt
- Use a different provider (OpenAI or Anthropic)

### Streaming not working
- o1 models don't support streaming (expected behavior)
- Check console for errors
- Verify API key is valid

### Slow responses
- Ultra-tier models (o1, Claude 3.7, Gemini Thinking) take longer
- Switch to "fast" tier models for quicker results
- Check your network connection

---

## 📊 Performance Comparison

| Model | Speed | Quality | Cost | Context |
|-------|-------|---------|------|---------|
| o1 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | 128K |
| o1-mini | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 128K |
| GPT-4o | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 128K |
| GPT-4o-mini | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 128K |
| Claude 3.7 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | 200K |
| Claude 3.5 Sonnet | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | 200K |
| Claude 3.5 Haiku | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 200K |
| Claude 3 Opus | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | 200K |
| Gemini 2.0 Thinking | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | 1M |
| Gemini 2.0 Flash | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 1M |
| Gemini 1.5 Pro | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 2M |
| Gemini 1.5 Flash | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 1M |

---

## 🔐 Security Notes

- Never commit your `.env` file to version control
- Keep API keys secure and rotate them regularly
- Use environment-specific keys (dev, staging, production)
- Monitor API usage in provider dashboards
- Set up billing alerts to avoid unexpected costs

---

## 🎨 Engine Selection UI

The app provides:
- **Provider filter**: All / OpenAI / Anthropic / Google
- **Speed icons**: ⚡ Fast, ⚖️ Balanced, 🚀 Powerful, 🧠 Ultra
- **Cost badges**: Economy, Standard, Premium, Ultra-Premium
- **Visual indicators**: Color-coded by provider
- **Descriptions**: Clear model capabilities

---

**Last Updated**: December 2025
**Total Engines**: 13 (5 OpenAI + 4 Anthropic + 4 Google)
