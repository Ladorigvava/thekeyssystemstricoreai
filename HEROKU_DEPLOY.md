# Heroku Deployment Guide

## Quick Deploy to Heroku

This guide will help you deploy The Keys System (Tri-Core AI) to Heroku.

### Prerequisites

1. **Heroku Account**: Sign up at [https://heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Ensure your code is in a Git repository
4. **API Keys**: Obtain API keys for at least one AI provider:
   - OpenAI: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Anthropic: [https://console.anthropic.com/](https://console.anthropic.com/)
   - Google AI: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Deployment Steps

#### 1. Login to Heroku

```bash
heroku login
```

#### 2. Create a New Heroku App

```bash
# Create app with a custom name (optional)
heroku create your-app-name

# Or let Heroku generate a random name
heroku create
```

#### 3. Set Environment Variables

Add your API keys as environment variables:

```bash
# OpenAI (required if using GPT models)
heroku config:set VITE_OPENAI_API_KEY=your-openai-api-key

# Anthropic (required if using Claude models)
heroku config:set VITE_ANTHROPIC_API_KEY=your-anthropic-api-key

# Google AI (required if using Gemini models)
heroku config:set VITE_GOOGLE_AI_API_KEY=your-google-ai-api-key
```

**Note**: You need at least ONE API key for the app to function properly.

#### 4. Configure Node.js Version (Optional)

Add this to your `package.json` if not already present:

```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

#### 5. Deploy to Heroku

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Prepare for Heroku deployment"

# Push to Heroku
git push heroku main
```

If your main branch is named `master`:
```bash
git push heroku master
```

#### 6. Open Your App

```bash
heroku open
```

### Buildpack Configuration

Heroku should automatically detect your Node.js app. If not, set the buildpack manually:

```bash
heroku buildpacks:set heroku/nodejs
```

### Verify Deployment

1. **Check Build Logs**:
   ```bash
   heroku logs --tail
   ```

2. **Verify Environment Variables**:
   ```bash
   heroku config
   ```

3. **Check App Status**:
   ```bash
   heroku ps
   ```

### Deployment Files Explained

- **`Procfile`**: Tells Heroku how to run your app
  ```
  web: npm run start
  ```

- **`server.js`**: Express server that serves the built React app
  - Serves static files from `dist/` directory
  - Handles client-side routing (SPA)

- **`static.json`**: Configuration for serving static files
  - Routes all requests to `index.html` for React Router
  - Sets cache headers for assets

- **`package.json`**: 
  - Build command: `npm run build`
  - Start command: `npm run start`

### Troubleshooting

#### Build Fails

1. **Check Node version**:
   ```bash
   node --version
   ```
   Ensure it matches the version in `package.json` engines field.

2. **Clear build cache**:
   ```bash
   heroku repo:purge_cache -a your-app-name
   git commit --allow-empty -m "Rebuild"
   git push heroku main
   ```

3. **Check build logs**:
   ```bash
   heroku logs --tail
   ```

#### App Crashes After Deploy

1. **Check logs**:
   ```bash
   heroku logs --tail
   ```

2. **Verify environment variables**:
   ```bash
   heroku config
   ```
   Ensure at least one `VITE_*_API_KEY` is set.

3. **Check dyno status**:
   ```bash
   heroku ps
   ```

#### AI Features Not Working

1. **Verify API keys are set**:
   ```bash
   heroku config | grep VITE_
   ```

2. **Check browser console** (F12):
   - Look for API key errors
   - Check for CORS issues
   - Verify API calls are being made

3. **Test API keys locally** first before deploying

#### Port Issues

The app automatically uses the `PORT` environment variable provided by Heroku. The server is configured to use `process.env.PORT || 3000`.

### Manual Build Locally

To test the production build locally before deploying:

```bash
# Build the app
npm run build

# Start the production server
npm run start
```

Then visit `http://localhost:3000` (or whatever PORT is set).

### Updating Your Heroku App

After making changes to your code:

```bash
git add .
git commit -m "Your update message"
git push heroku main
```

### Scaling Your App

For better performance, you can upgrade your Heroku dyno:

```bash
# List current dynos
heroku ps

# Scale to hobby dyno (7$/month)
heroku ps:scale web=1:hobby

# Scale to standard dyno (25$/month)
heroku ps:scale web=1:standard-1x
```

### Environment-Specific Configuration

The app uses Vite environment variables:
- Variables must be prefixed with `VITE_` to be exposed to the client
- They are bundled at build time
- Set them using `heroku config:set`

### Security Notes

1. **Never commit `.env` files** with real API keys
2. **Use Heroku config vars** for sensitive data
3. **Rotate API keys** regularly
4. **Monitor API usage** to detect unauthorized access

### Cost Considerations

- **Free Tier**: Heroku offers a free tier with some limitations
- **Hobby Dyno**: $7/month for always-on apps
- **Standard Dyno**: $25+/month for production apps
- **AI API Costs**: Separate from Heroku; monitor your usage with each provider

### Additional Resources

- [Heroku Node.js Docs](https://devcenter.heroku.com/articles/deploying-nodejs)
- [Heroku Configuration](https://devcenter.heroku.com/articles/config-vars)
- [Heroku Logs](https://devcenter.heroku.com/articles/logging)
- [Heroku CLI Commands](https://devcenter.heroku.com/articles/heroku-cli-commands)

### Support

If you encounter issues:
1. Check logs: `heroku logs --tail`
2. Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Check Heroku status: [https://status.heroku.com](https://status.heroku.com)
4. Open an issue on GitHub

---

**Happy Deploying! 🚀**
