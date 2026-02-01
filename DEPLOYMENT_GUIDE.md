# MediSync - Complete Deployment Guide for Resume

This guide walks you through deploying MediSync on the internet **end-to-end** using **free tiers** where possible. Perfect for adding to your resume!

---

## 📋 Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Recommended Stack (Free/Low-Cost)](#recommended-stack)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Environment Variables](#environment-variables)
6. [Custom Domain (Optional)](#custom-domain)
7. [Resume Tips](#resume-tips)
8. [Troubleshooting](#troubleshooting)

---

## Overview & Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Railway       │     │   PlanetScale   │
│   (Frontend)    │────▶│   (Backend API) │────▶│   (MySQL DB)    │
│   React + Vite  │     │   Node + Express│     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                         │
        │                         │ File uploads (local on Railway)
        │                         │ OR Cloudinary (recommended)
        └─────────────────────────┘
```

**What gets deployed where:**
- **Frontend** → Vercel (free, auto-deploys from GitHub)
- **Backend** → Railway or Render (free tier)
- **Database** → PlanetScale or Railway MySQL (free tier)
- **File Uploads** → Stored on backend server (Railway) OR Cloudinary (more reliable)

---

## Pre-Deployment Checklist

### 1. API URLs (✅ Already Fixed!)

All frontend components now use `API_BASE` from config, which reads from `VITE_API_URL` environment variable. When you deploy:
- Set `VITE_API_URL=https://your-backend-url.com` in Vercel
- The app will automatically use your deployed backend

### 2. Push Code to GitHub

```bash
cd mini-project-pres
git init
git add .
git commit -m "Initial commit - MediSync clinic management system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/medisync.git
git push -u origin main
```

### 3. Create Accounts (All Free)

- [GitHub](https://github.com) - Code hosting
- [Vercel](https://vercel.com) - Frontend hosting
- [Railway](https://railway.app) - Backend + Database (or use Render)
- [PlanetScale](https://planetscale.com) - MySQL database (optional, Railway has MySQL too)

---

## Recommended Stack

| Component | Service | Free Tier | Why |
|-----------|---------|-----------|-----|
| Frontend | **Vercel** | ✅ Yes | Best for React/Vite, auto-deploy, fast CDN |
| Backend | **Railway** | $5 credit/month | Easy Node.js deploy, MySQL addon, file storage |
| Database | **PlanetScale** or **Railway MySQL** | ✅ Yes | Managed MySQL, no credit card for PlanetScale |
| Alternative Backend | **Render** | ✅ Yes | Free tier, but sleeps after 15 min inactivity |

**Budget:** $0/month (Render free tier) or ~$5/month (Railway - more reliable)

---

## Step-by-Step Deployment

### STEP 1: Deploy Database (PlanetScale)

1. Go to [planetscale.com](https://planetscale.com) → Sign up (free)
2. Create new database: **"medisync"**
3. Go to **Connect** → Get connection details
4. Copy: **Host, Username, Password, Database name**
5. Run your `mediSyncDB.sql` schema:
   - Use PlanetScale's **Console** (SQL editor) or
   - Use MySQL client: `mysql -h HOST -u USER -p DATABASE < mediSyncDB.sql`

**Note:** PlanetScale uses `mysql://` connection string. Your app uses host/user/pass - ensure `.env` format matches.

---

### STEP 2: Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app) → Login with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. Select your `medisync` or `mini-project-pres` repo
4. **Important:** Set **Root Directory** to `backend` (your backend is in a subfolder!)
5. Railway will auto-detect Node.js
6. Add **Environment Variables** (see [Environment Variables](#environment-variables) section below)
7. Click **Deploy**
8. Once deployed, go to **Settings** → **Generate Domain** → Copy your backend URL (e.g., `https://medisync-backend.up.railway.app`)

**Railway Environment Variables:**
```
NODE_ENV=production
PORT=5000
DB_HOST=your-planetscale-host
DB_USER=your-planetscale-user
DB_PASSWORD=your-planetscale-password
DB_NAME=medisync
DB_PORT=3306
JWT_SECRET=your-super-secret-random-string-min-32-chars
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://medisync.vercel.app
```

**If using Railway MySQL instead of PlanetScale:**
- Add **MySQL** plugin to your Railway project
- Railway will auto-inject `DATABASE_URL` or `MYSQL_HOST`, etc.
- Update your `db.js` if Railway uses different env var names

---

### STEP 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → Login with GitHub
2. **Add New** → **Project** → Import your repo
3. **Configure Project:**
   - **Root Directory:** `frontend` (your frontend is in a subfolder!)
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-railway-backend-url.up.railway.app
   ```
   (Use the backend URL from Step 2)
5. Click **Deploy**
6. Once done, you'll get a URL like `https://medisync-xxx.vercel.app`

---

### STEP 4: Update CORS & Finalize

1. Go back to **Railway** → Your backend project → **Variables**
2. Update `ALLOWED_ORIGINS` to include your actual Vercel URL:
   ```
   ALLOWED_ORIGINS=https://medisync-xxx.vercel.app,https://your-custom-domain.com
   ```
3. Redeploy the backend (Railway auto-redeploys when env vars change, or trigger manually)

---

## Environment Variables

### Backend (.env for Railway/Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | production | `production` |
| `PORT` | Server port | `5000` |
| `DB_HOST` | MySQL host | `aws.connect.psdb.cloud` |
| `DB_USER` | MySQL user | `xxxxx` |
| `DB_PASSWORD` | MySQL password | `xxxxx` |
| `DB_NAME` | Database name | `medisync` |
| `DB_PORT` | MySQL port | `3306` |
| `JWT_SECRET` | Secret for tokens (min 32 chars) | `random-long-string-here` |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs | `https://app.vercel.app` |
| `EMAIL_USER` | (Optional) Gmail for reminders | `your@gmail.com` |
| `EMAIL_PASS` | (Optional) Gmail App Password | `xxxx xxxx xxxx xxxx` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend.railway.app` |

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Custom Domain (Optional)

### Vercel (Frontend)
1. Project → **Settings** → **Domains**
2. Add your domain (e.g., `medisync.yourdomain.com`)
3. Follow DNS instructions (add CNAME record)

### Railway (Backend)
1. Project → **Settings** → **Networking**
2. Add custom domain
3. Add CNAME record pointing to Railway

### Free Domain Options
- [Freenom](https://freenom.com) - Free .tk, .ml domains
- [GitHub Student Pack](https://education.github.com/pack) - Free .me domain, credits

---

## Resume Tips

### 1. Live Demo Link
Add to resume: **"Live Demo: https://medisync.vercel.app"**

### 2. GitHub Repository
Make it public and add a good README with:
- Project description
- Tech stack
- Screenshots
- Live demo link
- Setup instructions

### 3. Resume Bullet Points (Examples)

```
• Developed full-stack medical clinic management system (React, Node.js, MySQL)
  deployed on Vercel and Railway; supports appointment booking, prescription
  management, and medical record uploads

• Built responsive web app with JWT authentication, role-based access (Patient/Doctor),
  and real-time appointment scheduling with email reminders

• Implemented secure file uploads, input validation, rate limiting, and CORS
  protection for production deployment
```

### 4. Portfolio Section Format

```
MediSync - Clinic Management System
Tech: React, Node.js, Express, MySQL, Tailwind CSS
• Live: https://medisync.vercel.app
• Code: https://github.com/yourusername/medisync
```

---

## Alternative: Render (100% Free)

If you want **zero cost**:

1. **Backend on Render:**
   - [render.com](https://render.com) → New Web Service
   - Connect GitHub, select repo, set root to `backend`
   - Build: `npm install` | Start: `node server.js`
   - **Note:** Free tier sleeps after 15 min - first request may take 30-60 sec

2. **Database on Render:**
   - New PostgreSQL (free) - but you'd need to migrate from MySQL
   - OR use [PlanetScale](https://planetscale.com) (free MySQL)

3. **Frontend on Vercel** (same as above)

---

## File Uploads in Production

**Important:** Railway and Render have **ephemeral filesystems** - uploaded files may be lost on redeploy!

**Options:**
1. **Accept limitation** - Files work until next deploy (ok for demo/resume)
2. **Use Cloudinary** (free tier) - Requires code changes to upload to Cloudinary instead of local disk
3. **Use Railway Volumes** - Persistent storage (paid feature)

For resume/demo: Option 1 is fine. Mention in README: "File uploads persist during session; for production use cloud storage (S3/Cloudinary)."

---

## Troubleshooting

### "CORS policy violation"
- Add your exact Vercel URL to `ALLOWED_ORIGINS` (no trailing slash)
- Include both `https://` and `http://` if needed during testing

### "Database connection failed"
- Check PlanetScale allows connections from Railway IPs (usually allowed by default)
- PlanetScale may require SSL: add `?ssl={"rejectUnauthorized":true}` to connection
- Verify all DB_* env vars are correct

### "Cannot GET /api/..."
- Your backend might use `/auth`, `/appointments` directly (not under `/api`)
- Check `server.js` - routes might be at root level
- Frontend should call `https://backend.com/auth/login` not `https://backend.com/api/auth/login`

### Frontend shows "Network Error"
- Verify `VITE_API_URL` is set in Vercel (must start with `VITE_` for Vite)
- Rebuild frontend after adding env var
- Check backend is running (visit `https://your-backend.com/` - should show "MediSync Backend is Running!")

### Build fails on Vercel
- Ensure `frontend` is set as root directory
- Check `package.json` has `"build": "vite build"`
- Check Node version: Add `"engines": { "node": ">=18" }` to package.json if needed

---

## Quick Reference: Deployment URLs

After deployment, you'll have:

| Service | URL Format |
|---------|------------|
| Frontend | `https://your-project.vercel.app` |
| Backend | `https://your-project.up.railway.app` |
| Health Check | `https://your-backend.com/health` |

---

## Summary Checklist

- [ ] Push code to GitHub
- [ ] Replace all hardcoded `localhost:5000` with `API_BASE`
- [ ] Create PlanetScale database, run schema
- [ ] Deploy backend to Railway, add env vars
- [ ] Deploy frontend to Vercel, set `VITE_API_URL`
- [ ] Update `ALLOWED_ORIGINS` with Vercel URL
- [ ] Test: Register, Login, Book appointment, Upload record
- [ ] Add live link to resume & GitHub README

---

**Good luck with your deployment! 🚀**

*Last updated: January 2026*
