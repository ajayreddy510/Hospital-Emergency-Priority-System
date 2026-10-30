# Cloud Deployment Guide: Vercel & Render 🚀

This document outlines the step-by-step production deployment for the **Hospital Emergency Priority System**:
- **Backend API**: Deployed on **Render** (via Docker & Spring Boot 3 / Java 21)
- **Frontend SPA**: Deployed on **Vercel** (via React 18 + Vite)
- **Database**: **MongoDB Atlas** (Free M0 Cluster)

---

## 1. Backend Deployment on Render

### Method A: Blueprint Deployment (Fastest & Automated)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Blueprint**.
3. Connect your repository: `https://github.com/ajayreddy510/Hospital-Emergency-Priority-System`.
4. Render will automatically detect [`render.yaml`](../render.yaml) and configure:
   - **Service Name**: `hospital-emergency-backend`
   - **Environment**: Docker (`./backend/Dockerfile`)
   - **Health Check Path**: `/api/health`
5. Fill in the required environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (e.g., `mongodb+srv://admin:<password>@cluster0.mongodb.net/hospital_emergency_db?retryWrites=true&w=majority`)
   - `FRONTEND_URL`: Leave empty initially, or set to your Vercel URL once deployed.
6. Click **Apply**. Render will build the Docker container and deploy your live Spring Boot API (e.g., `https://hospital-emergency-backend.onrender.com`).

---

### Method B: Manual Web Service on Render
If you prefer manual setup:
1. Click **New +** > **Web Service**.
2. Select your GitHub repository: `ajayreddy510/Hospital-Emergency-Priority-System`.
3. Configure the settings:
   - **Name**: `hospital-emergency-backend`
   - **Language / Runtime**: **Docker**
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `.` or `./backend`
   - **Instance Type**: **Free**
4. Under **Environment Variables**, add:
   - `PORT`: `10000` (or leave default, Render sets this automatically)
   - `DEV_SEED_ENABLED`: `true`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Random 256-bit string (e.g. `hospital_emergency_priority_jwt_secret_key_2026_super_secure_random`)
   - `FRONTEND_URL`: Your Vercel domain URL
5. Click **Create Web Service**.

---

## 2. Frontend Deployment on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `ajayreddy510/Hospital-Emergency-Priority-System`.
4. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend` (or leave as `./` since [`vercel.json`](../vercel.json) at root automatically handles monorepo build).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-render-backend-name>.onrender.com/api`
   - `VITE_WS_URL`: `wss://<your-render-backend-name>.onrender.com/ws-hospital`
6. Click **Deploy**. Vercel will build the frontend bundle and publish your production website (e.g. `https://hospital-emergency-priority-system.vercel.app`).

---

## 3. Connecting Frontend and Backend (CORS & Environment)

Once both are deployed:
1. In **Render Backend Settings** > **Environment Variables**:
   - Set `FRONTEND_URL` = `https://<your-app-name>.vercel.app`
   - Save changes (Render will automatically redeploy with the allowed CORS origin).
2. In **Vercel Frontend Settings** > **Environment Variables**:
   - Verify `VITE_API_URL` points to your live Render backend URL (`https://<your-backend-name>.onrender.com/api`).
   - Trigger a redeployment if you updated this variable.

---

## 4. Live Health & Verification Checklist

- [ ] Backend Health: `GET https://<your-backend>.onrender.com/api/health` returns `{"success": true, "data": "HEALTHY"}`
- [ ] Frontend Live: Visit `https://<your-frontend>.vercel.app`
- [ ] Admin Sign-In: Log in with `admin@hospital.org` / `Admin123!`
- [ ] Real-time WebSocket: Open live queue at `/queue` and verify WebSocket connected indicator
