# Vercel Deployment Guide

This guide will help you deploy the ERPNext API Tester to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Deploy the Server (API)

### 1.1 Create New Vercel Project for Server

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the **Root Directory** to `erpnext-api-tester/server`
5. Click "Deploy"

### 1.2 Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erpnext-api-tester
NODE_ENV=production
CORS_ORIGIN=https://your-client-domain.vercel.app
```

3. Click "Save"

### 1.3 Note the Server URL

After deployment, note your server URL (e.g., `https://erpnext-api-tester-server.vercel.app`)

## Step 2: Deploy the Client (Frontend)

### 2.1 Create New Vercel Project for Client

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import the same GitHub repository
4. **Important**: Set the **Root Directory** to `erpnext-api-tester/client`
5. Click "Deploy"

### 2.2 Configure Environment Variables

In your client Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:

```
VITE_API_URL=https://your-server-domain.vercel.app
```

Replace `your-server-domain.vercel.app` with your actual server URL from Step 1.3

3. Click "Save"

### 2.3 Redeploy

After adding environment variables, trigger a new deployment:
1. Go to **Deployments** tab
2. Click "Redeploy" on the latest deployment

## Step 3: Test the Deployment

1. Open your client URL (e.g., `https://erpnext-api-tester-client.vercel.app`)
2. Test creating a connection
3. Test sending API requests
4. Verify that the client can communicate with the server

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CORS_ORIGIN` in server environment variables matches your client URL
2. **API Not Found**: Verify `VITE_API_URL` in client environment variables points to your server URL
3. **Database Connection**: Check MongoDB URI and ensure your IP is whitelisted in MongoDB Atlas

### Environment Variables Reference:

**Server (.env):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erpnext-api-tester
NODE_ENV=production
CORS_ORIGIN=https://your-client-domain.vercel.app
```

**Client (.env):**
```
VITE_API_URL=https://your-server-domain.vercel.app
```

## URLs After Deployment:

- **Client**: `https://your-client-project.vercel.app`
- **Server**: `https://your-server-project.vercel.app`

## Support

If you encounter any issues, check the Vercel deployment logs in your dashboard.
