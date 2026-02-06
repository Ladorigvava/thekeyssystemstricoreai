# Heroku Deployment Checklist

## Pre-Deployment Steps

- [ ] All code changes committed to Git
- [ ] Dependencies installed locally (`npm install`)
- [ ] Local build successful (`npm run build`)
- [ ] Local server test successful (`npm run start`)
- [ ] At least one API key obtained (OpenAI, Anthropic, or Google AI)
- [ ] Heroku CLI installed
- [ ] Logged into Heroku (`heroku login`)

## Heroku Setup

- [ ] Heroku app created (`heroku create your-app-name`)
- [ ] Environment variables set:
  - [ ] `VITE_OPENAI_API_KEY` (if using GPT models)
  - [ ] `VITE_ANTHROPIC_API_KEY` (if using Claude models)
  - [ ] `VITE_GOOGLE_AI_API_KEY` (if using Gemini models)
- [ ] Node.js buildpack configured (auto-detected)

## Deployment

- [ ] Code committed: `git add .` && `git commit -m "Deploy to Heroku"`
- [ ] Pushed to Heroku: `git push heroku main`
- [ ] Build completed successfully
- [ ] App started successfully

## Post-Deployment Verification

- [ ] App opens: `heroku open`
- [ ] No errors in logs: `heroku logs --tail`
- [ ] Environment variables verified: `heroku config`
- [ ] Landing page loads
- [ ] Can select a core (Chadrak, Nova, or Triad)
- [ ] AI chat works (test with a simple prompt)
- [ ] Theme toggle works
- [ ] History saves properly
- [ ] All three cores work
- [ ] Tri-Core mode functions
- [ ] Audio/Video studios accessible (if applicable)

## Troubleshooting

If issues occur:

1. **Check logs**: `heroku logs --tail`
2. **Verify config**: `heroku config`
3. **Check dyno status**: `heroku ps`
4. **Restart dyno**: `heroku restart`
5. **Clear cache**: `heroku repo:purge_cache -a your-app-name`
6. **Rebuild**: Push an empty commit

## Common Issues

### Build Fails
- Check Node version in `package.json` engines
- Verify all dependencies are in `package.json`
- Check for TypeScript errors locally
- Review build logs for specific errors

### App Crashes
- Ensure `PORT` environment variable is used correctly
- Verify at least one API key is set
- Check for missing dependencies
- Review application logs

### AI Not Working
- Verify API keys are set correctly
- Check API key validity
- Test API keys locally first
- Review browser console for errors

## Files Added for Heroku

- ✅ `Procfile` - Tells Heroku how to run the app
- ✅ `server.js` - Express server for production
- ✅ `static.json` - Static file serving configuration
- ✅ `app.json` - Heroku app metadata
- ✅ `.slugignore` - Files to ignore during build
- ✅ `HEROKU_DEPLOY.md` - Detailed deployment guide

## Deployment Command Reference

```bash
# Create app
heroku create your-app-name

# Set environment variables
heroku config:set VITE_OPENAI_API_KEY=your-key
heroku config:set VITE_ANTHROPIC_API_KEY=your-key
heroku config:set VITE_GOOGLE_AI_API_KEY=your-key

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail

# Restart
heroku restart
```

## Success Criteria

✅ App builds without errors
✅ App starts and responds on assigned port
✅ Environment variables are accessible
✅ At least one AI model works
✅ UI is fully functional
✅ No console errors in browser
✅ Theme persistence works
✅ History is saved and retrieved

---

**Ready to Deploy! 🚀**

For detailed instructions, see [HEROKU_DEPLOY.md](HEROKU_DEPLOY.md)
