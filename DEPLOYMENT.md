# 🚀 Deployment Guide

## Pre-Deployment Setup

### 1. Environment Variables
- Copy `env.production.example` to `.env.production`
- Fill in your production Supabase credentials
- Ensure your Supabase project is configured for production

### 2. Build the App
```bash
npm run build
```

This creates a `dist` folder with your production-ready app.

## Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
vercel
```

Follow the prompts:
- Link to existing project or create new
- Set project name
- Set build command: `npm run build`
- Set output directory: `dist`
- Set install command: `npm install`

#### Step 3: Environment Variables
In Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add your production environment variables

### Option 2: Netlify

#### Step 1: Build and Deploy
```bash
npm run build
```

#### Step 2: Deploy to Netlify
- Drag and drop the `dist` folder to [Netlify](https://app.netlify.com/)
- Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

#### Step 1: Add GitHub Pages Script
Add to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

#### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

#### Step 3: Deploy
```bash
npm run deploy
```

### Option 4: Firebase Hosting

#### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

#### Step 2: Initialize Firebase
```bash
firebase init hosting
```

#### Step 3: Deploy
```bash
firebase deploy
```

## Post-Deployment

### 1. Test Your App
- Verify all features work correctly
- Check environment variables are loaded
- Test database connections

### 2. Set Up Custom Domain (Optional)
- Configure DNS settings
- Set up SSL certificates
- Update Supabase CORS settings

### 3. Monitor Performance
- Use browser dev tools
- Check network requests
- Monitor Supabase usage

## Troubleshooting

### Common Issues:
1. **Environment Variables Not Loading**
   - Check if they're set in your hosting platform
   - Ensure they start with `VITE_`

2. **Build Errors**
   - Run `npm run build` locally first
   - Check for TypeScript errors

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check CORS settings in Supabase

4. **Routing Issues**
   - Configure redirects for SPA routing
   - Set up 404 handling

## Security Considerations

- Never commit `.env` files to Git
- Use environment variables for sensitive data
- Enable HTTPS in production
- Configure proper CORS settings in Supabase
- Set up proper authentication rules

## Performance Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize images
- Enable caching headers
