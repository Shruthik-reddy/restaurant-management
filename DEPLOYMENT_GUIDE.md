# 🚀 Deploy to Vercel + Render

## 📋 Overview
- **Frontend**: Vercel (Free hosting)
- **Backend**: Render (Free tier)
- **Database**: Render PostgreSQL (Free tier)

---

## 🎯 Step 1: Deploy Backend to Render

### 1. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2. Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. **Name**: `restaurant-db`
3. **Database Name**: `restaurant_db`
4. **User**: `restaurant_user`
5. **Region**: Oregon (US West)
6. **Plan**: `Free`
7. Click **"Create Database"**

### 3. Initialize Database
1. After database is created, click on it
2. Go to **"Query"** tab
3. Copy-paste the contents of `init.sql` file
4. Click **"Run"** to create tables and sample data

### 4. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `restaurant-management-backend`
   - **Environment**: `Docker`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Plan**: `Free`

### 5. Set Environment Variables
Get the database connection details from your PostgreSQL database page and set:
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/restaurant_db
SPRING_DATASOURCE_USERNAME=restaurant_user
SPRING_DATASOURCE_PASSWORD=your_db_password
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## 🎯 Step 2: Deploy Frontend to Vercel

### 1. Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2. Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository
3. **Root Directory**: `src/frontend`
4. Click **"Deploy"**

### 3. Update API URL
After deployment, update the `BASE_URL` in `script.js`:
```javascript
const BASE_URL = "https://your-app-name.onrender.com";
```

---

## 🔧 Configuration Files

### Frontend Configuration (`src/frontend/vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-app-name.onrender.com/$1"
    }
  ]
}
```

### Backend Configuration (`render.yaml`)
- Auto-configures Docker deployment
- Sets up health checks
- Handles environment variables

### Database Initialization (`init.sql`)
- Creates all necessary tables
- Inserts sample data
- Sets up indexes for performance

---

## 🎉 Deployment URLs

After deployment:
- **Frontend**: `https://your-restaurant-app.vercel.app`
- **Backend**: `https://your-app-name.onrender.com`
- **API Docs**: `https://your-app-name.onrender.com/actuator/health`

---

## 🔄 Auto-Deploy Setup

### Render (Backend)
- ✅ Auto-deploys on push to `main`
- ✅ Health checks enabled
- ✅ Zero-downtime deployments

### Vercel (Frontend)
- ✅ Auto-deploys on push to `main`
- ✅ Preview deployments for PRs
- ✅ Automatic HTTPS

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. CORS Errors
Update backend CORS configuration:
```properties
spring.web.cors.allowed-origins=https://your-vercel-app.vercel.app
```

#### 2. Database Connection
Ensure database is running and credentials are correct:
```bash
# Test connection with PostgreSQL client
psql -h your-db-host -U restaurant_user -d restaurant_db
```

#### 3. Build Failures
Check Render logs for specific error messages.

---

## 📊 Monitoring

### Render Dashboard
- Service health
- Resource usage
- Deployment logs

### Vercel Dashboard
- Build status
- Analytics
- Function logs

---

## 💰 Cost Breakdown

### Free Tier Limits
- **Render**: 750 hours/month, 100GB bandwidth
- **Vercel**: 100GB bandwidth, unlimited projects
- **Database**: 256MB storage, 90 days backup

### Upgrade Path
- **Render Pro**: $7/month for better performance
- **Vercel Pro**: $20/month for more bandwidth

---

## 🚀 Next Steps

1. **Deploy both services**
2. **Test all functionality**
3. **Set up custom domain** (optional)
4. **Configure monitoring**
5. **Set up backups**

Your restaurant management system will be live and accessible to anyone! 🎉
