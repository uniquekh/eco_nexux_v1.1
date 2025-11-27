# Quick Start - Deploy to Netlify

## 🚀 5-Minute Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Ready for Netlify deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. Deploy on Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Netlify will auto-detect settings from `netlify.toml`
5. Click "Deploy site"

### 4. Add Environment Variables
In Netlify dashboard → Site settings → Environment variables:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - Random secret (generate with: `openssl rand -base64 32`)

**Optional:**
- `GEMINI_API_KEY` - If using AI features
- `NODE_VERSION` - Set to `20`

### 5. Done! ✅
Your app will be live at: `https://your-site-name.netlify.app`

---

## 📝 What Changed?

- ✅ Updated `netlify.toml` for full-stack deployment
- ✅ Created serverless function wrapper in `netlify/functions/api.ts`
- ✅ Updated build scripts in `package.json`
- ✅ Added `serverless-http` dependency
- ✅ Created `.gitignore` for clean commits

## 🔄 Continuous Deployment

Every push to `main` branch will automatically deploy to Netlify!

## 📚 Need More Help?

See `NETLIFY_DEPLOYMENT.md` for detailed instructions.
