# The Keys Systems – Tri-Core AI

A multi-mode AI reasoning and creative production assistant that provides five distinct capabilities: structural analysis (Chadrak Core), narrative refinement (Nova Core), execution planning (Triad Core), professional audio brief generation (Audio Studio), and professional video brief generation (Video Studio).

## 🧠 What Is This?

The Keys Systems Tri-Core AI allows you to examine your ideas through different cognitive lenses:
- **Chadrak Core** - Structural & analytical reasoning (logic, risks, clarity)
- **Nova Core** - Narrative & communication (clarity, tone, impact)
- **Triad Core** - Execution & planning (actionable steps, workflows)
- **Tri-Core Mode** - Run all three cores simultaneously for comprehensive analysis
- **Audio Studio** - Generate professional audio scripts and prompts for AI tools
- **Video Studio** - Create production-ready video scripts and storyboards

Video Studio also includes an **OpenAI-anchored Google Flow handoff**: prepare a
brief with OpenAI, review and copy it, then open Flow to generate and edit scenes.
This is a manual handoff, not automatic Flow project or video synchronization.
See [Google Flow integration](GOOGLE_FLOW_INTEGRATION.md) for setup and limitations.

## ⚡ Setup & API Keys

**IMPORTANT:** GitHub Spark is no longer available. This app now uses direct API integration.

### Get Your API Keys:

You need at least one API key (you don't need all three):

1. **OpenAI** (for GPT-4o, GPT-4o Mini)
   - Get key: https://platform.openai.com/api-keys
   
2. **Anthropic** (for Claude 3.5 Sonnet, Haiku, Opus)
   - Get key: https://console.anthropic.com/settings/keys
   
3. **Google AI** (for Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash)
   - Get key: https://aistudio.google.com/app/apikey

### Configure Environment

1. Create a `.env` file in the project root:
```bash
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_API_KEY=...
```

2. Add at least one API key (you can add all three for access to all models)

### Local Development

```bash
npm install
npm run dev
```

**What you'll get:**
- ✅ All AI engines work with your API keys
- ✅ Full functionality locally
- ✅ No deployment needed

The app will show a warning if no API keys are configured.

## 🚀 Deployment Options

### Option 1: Heroku (Recommended)

Deploy to Heroku with full AI capabilities:

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

**Quick Deploy:**
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set API keys (at least one required)
heroku config:set VITE_OPENAI_API_KEY=your-key
heroku config:set VITE_ANTHROPIC_API_KEY=your-key
heroku config:set VITE_GOOGLE_AI_API_KEY=your-key

# Deploy
git push heroku main

# Open
heroku open
```

📖 **Full Guide**: See [HEROKU_DEPLOY.md](HEROKU_DEPLOY.md) for detailed instructions
✅ **Checklist**: See [HEROKU_CHECKLIST.md](HEROKU_CHECKLIST.md) for deployment verification

### Option 2: GitHub Spark (Original)

> **Note**: GitHub Spark is no longer available, but the app was originally designed for it.

Deploy through [GitHub Spark](https://githubnext.com/projects/spark) - no API keys needed.

For GitHub Spark deployment, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Option 3: Vercel

For Vercel deployment instructions, see [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md).

### Available AI Engines

The app supports best-in-class AI models from multiple providers through the Spark runtime:

**OpenAI Models:**
- **OpenAI o1** - Ultimate reasoning model with extended thinking (ultra-premium)
- **OpenAI o1-mini** - Efficient reasoning at lower cost (premium)
- **GPT-4o** - Advanced reasoning & multimodal capabilities (premium)
- **GPT-4o Mini** - Fast & efficient analysis (economy)
- **GPT-4 Turbo** - Previous flagship with 128K context (premium)

**Anthropic Models:**
- **Claude 3.7 Sonnet** - Latest flagship with enhanced reasoning (premium) 🆕
- **Claude 3.5 Sonnet** - Top-tier reasoning & coding expertise (premium)
- **Claude 3.5 Haiku** - Lightning-fast intelligence (economy)
- **Claude 3 Opus** - Ultimate reasoning power (ultra-premium)

**Google Models:**
- **Gemini 2.0 Flash Thinking** - Experimental reasoning with thinking mode (premium) 🆕
- **Gemini 2.0 Flash** - Next-gen multimodal speed (economy)
- **Gemini 1.5 Pro** - Massive context & advanced reasoning (premium)
- **Gemini 1.5 Flash** - Efficient multimodal AI (standard)

> **Note**: Engine selection persists across sessions, and you can choose different engines for each core independently. Filter by provider (All/OpenAI/Anthropic/Google) to find the best model for your task.

## 🚀 Features

### 🎯 Quantum-Grade AI Engines (13 Total)
- **Production-Ready Reliability** - Automatic retry with exponential backoff (3 attempts)
- **Smart Fallback System** - Auto-switches to cheaper models if primary fails
- **Real-Time Streaming** - Watch responses generate live (11/13 models)
- **Multi-Provider Support** - OpenAI, Anthropic, and Google AI
- **Provider Filtering** - Quickly filter by All/OpenAI/Anthropic/Google
- **Rate Limit Handling** - Intelligent jitter to prevent thundering herd
- **Error Categorization** - Clear, actionable error messages (auth, network, rate limit, server, client)
- **Response Validation** - Ensures API responses are properly structured
- **Safety Filtering** - Handles Google AI safety blocks gracefully

### AI Analysis Modes
- **Multi-Provider Engine Selection** - Choose from 13 cutting-edge models for each core
- **Independent Core Selection** - Different engines for Chadrak, Nova, and Triad
- **Parallel Tri-Core Execution** - All three cores run simultaneously with independent state
- **Custom System Prompts** - Fine-tune how each core behaves
- **History Tracking** - Review past analyses per core with full context
- **Offline Cache** - Reuse previous responses when offline
- **Dark/Light Themes** - Switch between visual modes

### Creative Production Tools
- **Audio Studio** - Generate voiceover scripts, music briefs, and AI tool prompts with quantum-grade AI
- **Video Studio** - Create timestamped scripts, scene breakdowns, and storyboards with advanced reasoning
- **Full Engine Access** - Use any of the 13 AI models for audio/video generation
- **Copy to Clipboard** - Easily export briefs to external AI tools
- **Advanced Reasoning** - Leverage o1, Claude 3.7, and Gemini 2.0 Thinking for professional-grade briefs

### Smart UX
- **Mobile-Optimized** - Hamburger menu with swipe gestures
- **Responsive Layout** - No horizontal scrolling, clean single-page dashboard
- **Particle Background** - Futuristic sci-fi atmosphere
- **Console-Style UI** - Professional AI control center aesthetic

## 🛠️ Development

This is a Spark application built with:
- React + TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- shadcn/ui components
- GitHub Spark runtime for AI and storage

### Local Development

> **⚠️ CRITICAL**: This app is designed for GitHub Spark and **AI features will NOT work** when running locally with `npm run dev`. See [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for details.

```bash
npm install
npm run dev
```

**What you'll see locally:**
- ✅ UI, navigation, and styling work perfectly
- ❌ AI engines fail with 404 errors (this is expected)
- ❌ No AI analysis or generation possible

**To use AI features:**
- Deploy this app through [GitHub Spark](https://githubnext.com/projects/spark)
- All AI engines work automatically with no API keys needed

For troubleshooting deployment issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

#### Quick Troubleshooting

If Claude, Gemini, OpenAI, or other AI engines don't respond:

1. **Check Spark Connection**: Look for the connection status indicator on the landing page
2. **Verify Authentication**: Ensure you're logged into GitHub and running in the Spark environment
3. **Check Console**: Open browser DevTools (F12) and check for errors
4. **Try Different Engine**: Switch to a different AI model from the dropdown
5. **Use Cache**: If you've run the same prompt before, the app will use cached results

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## 📝 How It Works

1. **Select a Mode** - Choose from the five AI capabilities
2. **Pick an Engine** - Select from 13 quantum-grade models based on your needs (speed/quality/cost)
3. **Filter by Provider** - Use the provider filter buttons (All/OpenAI/Anthropic/Google) to narrow choices
4. **Enter Your Input** - Provide text, ideas, or descriptions
5. **Get Results** - Receive structured analysis or production-ready briefs with streaming responses
6. **Iterate** - Refine prompts, try different engines, review history

### Automatic Reliability Features

The app automatically handles errors with enterprise-grade reliability:
- ✅ **3 retry attempts** with exponential backoff (1s → 2s → 4s)
- ✅ **Smart fallback** to cheaper/faster models from the same provider
- ✅ **Rate limit handling** with jitter (±25%) to prevent service overload
- ✅ **Cached responses** used automatically when API fails
- ✅ **Clear error messages** tell you exactly what went wrong and if it's retryable

### Error Handling

If you see error messages:
- **"Rate limit exceeded"** - System already retried 3x, then tried fallback. Try again in a few minutes.
- **"Authentication failed"** - Check your API key in `.env` file
- **"Network error"** - Check your internet connection
- **"Safety block"** (Google AI only) - Content was filtered; try rephrasing or use different provider
- **"All retry attempts exhausted"** - Multiple attempts failed; see console for details

The app automatically falls back to cached responses when available.

## 🎨 Customization

- **System Prompts** - Click the settings icon on any core to customize its behavior
- **Themes** - Toggle between dark and light modes using the theme switcher
- **Engine Preferences** - Each core remembers your engine selection

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
