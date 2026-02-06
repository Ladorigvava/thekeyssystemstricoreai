# Vercel Deployment Guide

## Quick Deploy to Vercel

This app is ready to deploy to Vercel in minutes!

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Your Repository**
   - Click "Import Git Repository"
   - Select: `Ladorigvava/the-keys-system-duck`
   - Click "Import"

3. **Configure Environment Variables**
   
   Add these in the Vercel dashboard (at least one required):
   
   ```
   VITE_OPENAI_API_KEY = sk-proj-...
   VITE_ANTHROPIC_API_KEY = sk-ant-...
   VITE_GOOGLE_AI_API_KEY = AIza...
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_ANTHROPIC_API_KEY
vercel env add VITE_GOOGLE_AI_API_KEY

# Deploy to production
vercel --prod
```

### Environment Variables Setup

**Get your API keys:**
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google AI**: https://aistudio.google.com/app/apikey

**Add to Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each key with its value
4. Redeploy if already deployed

### Build Settings (Auto-detected)

Vercel will automatically detect these from `vercel.json`:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Post-Deployment

After deployment:
1. Visit your Vercel URL
2. The app will show API key status
3. All AI features will work immediately
4. No 404 errors!

### Automatic Deployments

Every push to `main` branch will trigger automatic deployment on Vercel.

### Custom Domain (Optional)

1. Go to project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Troubleshooting

**If AI features don't work:**
- Check environment variables are set in Vercel dashboard
- Make sure variables start with `VITE_` prefix
- Redeploy after adding/changing variables

**If build fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Monitoring

Vercel provides:
- Real-time logs
- Analytics
- Performance monitoring
- Error tracking

Access these in your Vercel project dashboard.

## Ready to Deploy?

✅ Build configuration: Complete
✅ Environment variables: Documented
✅ Vercel config: Created
✅ Repository: Pushed to GitHub

Just click "Deploy" on Vercel! 🚀
