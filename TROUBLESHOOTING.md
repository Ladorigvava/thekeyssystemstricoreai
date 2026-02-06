# Troubleshooting Guide

## AI Engines Not Responding

If Claude, Gemini, OpenAI, or other AI engines are not responding, follow these steps:

### 1. Check GitHub Spark Runtime Connection

This application requires the **GitHub Spark runtime** to function. The Spark runtime provides access to AI models without requiring your own API keys.

**Symptoms:**
- Error: "GitHub Spark runtime not available"
- AI engines don't respond
- Audio/Video generation fails
- No output after clicking analyze/generate buttons

**Solutions:**

#### A. Ensure You're Running in GitHub Spark Environment

This app is designed to run within the GitHub Spark platform:

1. Visit [GitHub Spark](https://githubnext.com/projects/spark)
2. Deploy or run this app through the Spark interface
3. Make sure you're authenticated with your GitHub account

#### B. Check Your Internet Connection

The Spark runtime requires an active internet connection to call AI APIs:

```bash
# Test your connection
ping github.com
```

#### C. Verify Dev Server is Running Correctly

```bash
# Stop the server
# Press Ctrl+C in the terminal

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart the dev server
npm run dev
```

### 2. Browser Console Errors

Open your browser's Developer Tools (F12) and check the Console tab for errors:

**Common Issues:**

- **`window.spark is not defined`** - You're not running in the Spark environment
- **CORS errors** - The Spark runtime can't reach AI APIs (network issue)
- **Authentication errors** - Your GitHub session may have expired

**Fix:**
- Refresh the page while logged into GitHub
- Clear browser cache and cookies
- Try in an incognito/private window

### 3. Cached Responses

If you've used the app successfully before, it may have cached responses:

**To use cache:**
1. Run the same prompt you used before
2. The app will automatically use the cached result if the AI engine fails

**To clear cache:**
1. Open browser DevTools (F12)
2. Go to Application > Storage
3. Find IndexedDB or localStorage
4. Clear the cache entries

### 4. Model-Specific Issues

Different AI providers may have different availability:

| Provider | Models | Common Issues |
|----------|--------|---------------|
| OpenAI | GPT-4o, GPT-4o Mini | API rate limits, quota exceeded |
| Anthropic | Claude 3.5 Sonnet, Haiku, Opus | Regional restrictions, rate limits |
| Google | Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash | Beta access required, quota limits |

**Fix:**
- Try a different AI engine from the dropdown
- Use an economy model (GPT-4o Mini, Claude Haiku, Gemini Flash) which have higher rate limits
- Wait a few minutes and try again

### 5. Audio/Video Studio Issues

The Audio and Video studios generate **briefs and prompts** for external AI tools - they don't generate actual media files.

**Expected behavior:**
- You input a description
- The AI generates a professional script/brief
- You copy the prompts to external tools (ElevenLabs, Suno, Runway, etc.)

**If generation fails:**
- Same troubleshooting as above (check Spark runtime)
- Try a different AI engine
- Simplify your input description

### 6. Network Issues Behind Corporate Firewalls

Some corporate networks block API calls to AI services.

**Fix:**
- Use a personal network/hotspot
- Contact your IT department about whitelisting GitHub Spark endpoints
- Use a VPN (if permitted by your organization)

### 7. Restart Checklist

If nothing works, try this complete reset:

```bash
# 1. Stop the dev server
# Press Ctrl+C

# 2. Clear all dependencies
rm -rf node_modules package-lock.json

# 3. Reinstall
npm install

# 4. Restart dev server
npm run dev
```

Then in your browser:
1. Clear cache (Ctrl+Shift+Delete)
2. Close all tabs
3. Restart browser
4. Navigate to the app again
5. Make sure you're logged into GitHub

## Still Having Issues?

### Check Application Logs

Look for detailed error messages in:
1. Browser DevTools Console (F12)
2. Terminal where you ran `npm run dev`
3. Network tab in DevTools to see failed requests

### Verify Package Versions

Check your installed Spark package version:

```bash
npm list @github/spark
```

Make sure it matches the version in `package.json` (^0.39.0 or higher).

### GitHub Spark Status

Check if there are any known issues with GitHub Spark:
- [GitHub Spark Status Page](https://www.githubstatus.com/)
- [GitHub Spark Discussions](https://github.com/orgs/community/discussions)

## Contact Support

If you've tried all the above:

1. Note the exact error message from browser console
2. Note which AI engine you were trying to use
3. Note your browser and OS version
4. Create an issue in the repository with these details

## Emergency Fallback: Use Cached Data

If you need to access previous analyses while debugging:

1. Open browser DevTools (F12)
2. Go to Application > IndexedDB
3. Look for your cached responses
4. You can manually copy previous outputs while troubleshooting
