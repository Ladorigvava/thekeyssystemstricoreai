# Local Development Guide

## Important: GitHub Spark Runtime Limitation

This application is designed to run in the **GitHub Spark environment**. When running locally with `npm run dev`, the AI engines will **NOT work** because:

1. The `window.spark.llm()` function requires the Spark backend service
2. The Spark runtime handles authentication and API calls to OpenAI, Anthropic, and Google
3. Local development doesn't have access to this runtime

## Running Locally

### What Works Locally:
- ✅ UI and navigation
- ✅ Theme switching
- ✅ System prompt editing
- ✅ Input forms and validation
- ✅ Cached responses (if you have previous data)
- ✅ History viewing

### What Doesn't Work Locally:
- ❌ AI engine calls (Claude, GPT, Gemini)
- ❌ Audio/Video brief generation
- ❌ New AI analysis or generation

### Expected Errors:
When running locally, you'll see:
```
AI engine error: LLM request failed: 404 - The page could not be found NOT_FOUND
```

This is **normal** for local development. The 404 error means the Spark backend endpoint isn't available.

## Development Options

### Option 1: Deploy to GitHub Spark (Recommended)
1. Go to [GitHub Spark](https://githubnext.com/projects/spark)
2. Deploy this repository through Spark
3. All AI features will work automatically with no API keys needed

### Option 2: Mock Development (UI Only)
If you just want to develop the UI locally:
1. Run `npm run dev`
2. Test UI components and interactions
3. Use cached responses for testing (run same prompts multiple times)
4. Deploy to Spark to test AI features

### Option 3: Use Your Own API Keys (Advanced)
If you want to implement direct API calls for local development, you would need to:

1. Create a `.env` file with your API keys:
```bash
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_API_KEY=...
```

2. Create a fallback LLM service that uses these keys when `window.spark` isn't available

⚠️ **Note**: This requires modifying the code to add direct API integration, which defeats the purpose of using Spark. This option is **not recommended**.

## Testing AI Features

To test AI features during development:

1. **Use the cache system**: Run the same prompt twice - the second time will use cache
2. **Test with mock data**: Temporarily hardcode responses for testing
3. **Deploy to Spark**: For real AI testing, deploy to the Spark environment

## Development Workflow

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (UI testing only)
npm run dev

# 3. Make UI/UX changes
# - Component styling
# - Layout adjustments
# - Navigation flow
# - Theme customization

# 4. Test locally (cached responses only)
# - Input validation
# - Error handling
# - History management
# - UI interactions

# 5. Deploy to Spark for AI testing
# - Push to GitHub
# - Deploy through Spark interface
# - Test with real AI engines
```

## Why This Architecture?

GitHub Spark provides:
- **Zero API key management**: Users don't need their own AI API keys
- **Unified backend**: One service handles all AI providers
- **Rate limiting**: Built-in controls to prevent abuse
- **Authentication**: GitHub OAuth for security
- **Persistent storage**: Automatic KV store integration

Running locally bypasses these benefits and requires significant additional work.

## Recommended Approach

**For UI Development:**
- Run locally with `npm run dev`
- Expect AI features to fail
- Focus on component development

**For AI Feature Testing:**
- Deploy to GitHub Spark
- Test in production environment
- Verify all engines work correctly

**For Production:**
- Always deploy through GitHub Spark
- Users get full functionality automatically
- No configuration needed

## Common Questions

**Q: Can I make the AI work locally?**
A: Not without significant code changes to add direct API integration. The app is designed for Spark.

**Q: Why do I see 404 errors?**
A: The Spark backend service isn't available locally. This is expected.

**Q: Should I add my own API keys?**
A: No. Deploy to Spark instead - it's the intended deployment method.

**Q: How do I test changes?**
A: UI changes can be tested locally. AI features must be tested in Spark.

## Getting Help

- Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for deployment issues
- Check [GitHub Spark Docs](https://githubnext.com/projects/spark)
- Verify you're using the latest Spark runtime version
