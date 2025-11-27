# Netlify Deployment Guide

This guide will help you deploy your full-stack application to Netlify through GitHub.

## Prerequisites

1. A GitHub account
2. A Netlify account (sign up at https://netlify.com)
3. Your code pushed to a GitHub repository

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your repository from the list

## Step 3: Configure Build Settings

Netlify should automatically detect the `netlify.toml` configuration file. Verify these settings:

- **Build command**: `npm install && npm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions`

## Step 4: Set Environment Variables

In the Netlify dashboard, go to:
**Site settings** → **Environment variables** → **Add a variable**

Add the following environment variables:

### Required Variables:

1. **DATABASE_URL**
   - Your database connection string (e.g., PostgreSQL from Neon, Supabase, or Railway)
   - Example: `postgresql://user:password@host:5432/database`

2. **SESSION_SECRET**
   - A random secret string for session encryption
   - Generate one: `openssl rand -base64 32` (or use any random string)

### Optional Variables:

3. **GEMINI_API_KEY** (if using Google AI features)
   - Your Google Gemini API key

4. **NODE_VERSION** (recommended)
   - Set to: `20` or `18`

## Step 5: Deploy

1. Click "Deploy site"
2. Netlify will:
   - Clone your repository
   - Install dependencies
   - Build your client (React/Vite)
   - Build your serverless functions (Express API)
   - Deploy everything

## Step 6: Database Setup

Make sure your database is accessible from Netlify:

1. If using **Neon** (recommended for PostgreSQL):
   - Go to https://neon.tech
   - Create a project
   - Copy the connection string
   - Add it as `DATABASE_URL` in Netlify

2. Run database migrations:
   - You can run `npm run db:push` locally with your production DATABASE_URL
   - Or set up a deploy hook to run migrations automatically

## Project Structure

```
├── client/                 # React frontend
│   └── src/
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   └── index.ts           # Server entry
├── netlify/
│   └── functions/
│       └── api.ts         # Serverless function wrapper
├── dist/
│   └── public/            # Built frontend (published)
├── netlify.toml           # Netlify configuration
└── package.json
```

## How It Works

- **Frontend**: Built as static files and served from `dist/public`
- **Backend**: Wrapped as a Netlify serverless function at `/.netlify/functions/api`
- **API Routes**: Automatically redirected from `/api/*` to the serverless function
- **Client Routing**: All non-API routes serve `index.html` for React Router

## Continuous Deployment

Once connected, Netlify will automatically:
- Deploy on every push to your main branch
- Create preview deployments for pull requests
- Show build logs and deployment status

## Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify `package.json` has all dependencies

### API Not Working
- Check that `DATABASE_URL` is set correctly
- Verify serverless function logs in Netlify dashboard
- Ensure your database allows connections from Netlify's IP ranges

### Database Connection Issues
- Use connection pooling for serverless (e.g., `@neondatabase/serverless`)
- Set appropriate connection limits
- Consider using Neon's serverless driver for better compatibility

## Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow the instructions to configure DNS

## Useful Commands

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Push database schema
npm run db:push
```

## Support

- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://answers.netlify.com
