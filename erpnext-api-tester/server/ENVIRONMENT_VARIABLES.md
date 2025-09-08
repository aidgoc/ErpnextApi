# Environment Variables for Vercel Deployment

## Server Environment Variables

Add these to your Vercel project dashboard under Settings → Environment Variables:

### Required Variables:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/erpnext-api-tester?retryWrites=true&w=majority
NODE_ENV=production
CORS_ORIGIN=https://YOUR_CLIENT_DOMAIN.vercel.app
```

### How to Get These Values:

#### 1. MongoDB URI:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in to your account
3. Go to your cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<username>` and `<password>` with your actual credentials
7. Replace `<dbname>` with `erpnext-api-tester`

**Example:**
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/erpnext-api-tester?retryWrites=true&w=majority
```

#### 2. CORS Origin:
This should be your client Vercel URL. It will look like:
```
CORS_ORIGIN=https://erpnext-api-tester-client.vercel.app
```

## Client Environment Variables

Add this to your client Vercel project dashboard:

```
VITE_API_URL=https://YOUR_SERVER_DOMAIN.vercel.app
```

**Example:**
```
VITE_API_URL=https://erpnext-api-tester-server.vercel.app
```

## Step-by-Step Setup:

### 1. Set up MongoDB Atlas (if not done):
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Whitelist your IP (or use 0.0.0.0/0 for all IPs)
6. Get your connection string

### 2. Deploy Server First:
1. Deploy server to Vercel
2. Note the server URL (e.g., `https://erpnext-api-tester-server.vercel.app`)
3. Add server environment variables

### 3. Deploy Client:
1. Deploy client to Vercel
2. Note the client URL (e.g., `https://erpnext-api-tester-client.vercel.app`)
3. Add client environment variable with server URL
4. Update server CORS_ORIGIN with client URL

### 4. Update Server CORS:
1. Go back to server Vercel project
2. Update CORS_ORIGIN with your actual client URL
3. Redeploy server

## Example Complete Setup:

**Server Environment Variables:**
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/erpnext-api-tester?retryWrites=true&w=majority
NODE_ENV=production
CORS_ORIGIN=https://erpnext-api-tester-client.vercel.app
```

**Client Environment Variables:**
```
VITE_API_URL=https://erpnext-api-tester-server.vercel.app
```

## Security Notes:

1. **Never commit real credentials to Git**
2. **Use environment variables for all sensitive data**
3. **Keep your MongoDB credentials secure**
4. **Use strong passwords for database users**
