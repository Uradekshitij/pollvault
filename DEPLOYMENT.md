# Deployment Guide - Render

This guide walks through deploying **live-polls** to [Render.com](https://render.com).

## Prerequisites

1. **GitHub Account** – Push your code to GitHub
2. **Render Account** – Sign up at [render.com](https://render.com)
3. **MongoDB Atlas** – Get a connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## Step 1: Push Code to GitHub

Make sure your code is committed and pushed:

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## Step 2: Set Up MongoDB Atlas (if not already done)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Go to **Database** → your cluster → **Connect**
4. Select **Drivers** and copy your connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/live-polls?retryWrites=true&w=majority
   ```
5. Replace `USERNAME`, `PASSWORD`, and `CLUSTER` with your actual credentials

---

## Step 3: Create a Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **+ New** → **Web Service**
3. **Connect a Repository:**
   - Select your GitHub repository (live-polls)
   - Click **Connect**

4. **Configure the Service:**
   - **Name:** `live-polls` (or any name you prefer)
   - **Environment:** `Node`
   - **Region:** `Oregon` (or closest to you)
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Starter for production)

5. **Add Environment Variables:**
   Click **Add Environment Variable** and add:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | Your MongoDB connection string (from Step 2) |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (Render assigns this automatically) |
   | `FRONTEND_URL` | `https://your-app-name.onrender.com` (after first deploy, update this) |

6. Click **Create Web Service** and wait for deployment

---

## Step 4: Update Environment Variables (After First Deploy)

Once deployment succeeds and you have your Render URL:

1. Go to your service on Render Dashboard
2. Click **Environment** on the left sidebar
3. Update `FRONTEND_URL`:
   - Change to: `https://your-service-name.onrender.com`
4. Click **Save** and the app will redeploy

---

## Step 5: Test Your Deployment

1. Visit `https://your-service-name.onrender.com` in your browser
2. Create a poll to test the full flow
3. Check Render logs if there are issues:
   - Dashboard → your service → **Logs** tab

---

## Common Issues & Fixes

### Issue: "Cannot find module" errors

**Fix:** Ensure all `npm install` steps complete. The build command should handle this:

```bash
npm run build
```

### Issue: "MONGO_URI is not defined"

**Fix:** Go to Render Dashboard → **Environment** and verify `MONGO_URI` is set correctly.

### Issue: "Port already in use"

**Fix:** The backend uses `process.env.PORT || 5000`. Render sets `PORT=10000`, so this should work automatically. No action needed.

### Issue: Frontend shows "Cannot GET /" or 404 errors

**Fix:** Make sure `NODE_ENV=production` is set in environment variables. This enables static file serving from `frontend/dist`.

---

## File Structure for Deployment

Your project root should look like:

```
live-polls/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── models/
│   ├── routes/
│   └── .env (DO NOT push to GitHub, only local)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   └── dist/ (created by build)
├── package.json
├── render.yaml (optional, can use manual config instead)
└── .env.example (reference only)
```

---

## Using `render.yaml` (Alternative)

Instead of manual configuration, you can use the included `render.yaml`:

1. Push `render.yaml` to GitHub
2. On Render, click **Infrastructure** → **Import Blueprint**
3. Select your GitHub repo
4. Render will auto-configure based on `render.yaml`

---

## Summary

- ✅ Code is in GitHub
- ✅ MongoDB connection string ready
- ✅ Build & start scripts configured
- ✅ Environment variables set on Render
- ✅ Service deployed at `https://your-service-name.onrender.com`

Once deployed, your live-polls app will:
- Serve the React frontend from `/`
- Serve API routes from `/api/*`
- Store polls in MongoDB
- Run on Node.js with Express

Happy polling! 🎉
