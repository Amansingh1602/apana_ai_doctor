# Deployment Guide

## 🚀 Deploy Backend to Render

### Step 1: Prepare MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (replace `<password>` with your actual password)
4. Whitelist all IPs: `0.0.0.0/0` in Network Access

### Step 2: Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `Amansingh1602/Apana-ai-doctor`
4. Configure:
   - **Name**: `apna-doctor-backend`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   ADMIN_SECRET=apna-doctor-admin-2024
   GROK_API_KEY=your-grok-api-key
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://apna-doctor-backend.onrender.com`

---

## 🌐 Deploy Frontend to Vercel

### Step 1: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/)
2. Click **Add New** → **Project**
3. Import your GitHub repository: `Amansingh1602/Apana-ai-doctor`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://apna-doctor-backend.onrender.com/api
   ```
   (Use your actual Render backend URL)

6. Click **Deploy**
7. Wait for deployment (2-3 minutes)
8. Your frontend will be live at: `https://your-app.vercel.app`

### Step 2: Update Backend CORS
1. Go back to Render dashboard
2. Edit your backend service
3. Update the `FRONTEND_URL` environment variable with your Vercel URL
4. Redeploy the backend

---

## ✅ Verify Deployment

1. Visit your Vercel frontend URL
2. Try to sign up/login
3. Test symptom analysis
4. Check if everything works!

---

## 🔧 Troubleshooting

### Backend Issues
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Frontend Issues
- Check Vercel deployment logs
- Verify `VITE_API_URL` points to your Render backend
- Check browser console for errors

### CORS Issues
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check Render backend logs for CORS errors

---

## 📱 Alternative: Deploy Backend to Railway

If Render doesn't work, try Railway:

1. Go to [Railway](https://railway.app/)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Add the same environment variables as Render
5. Set root directory to `backend`
6. Deploy!

---

## 💡 Free Tier Limitations

### Render Free Tier
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-50 seconds
- 750 hours/month free

### Vercel Free Tier
- 100 GB bandwidth/month
- Unlimited deployments
- Always active (no spin-down)

### MongoDB Atlas Free Tier
- 512 MB storage
- Shared cluster
- Perfect for development

---

**Made with ❤️ using MERN Stack**
