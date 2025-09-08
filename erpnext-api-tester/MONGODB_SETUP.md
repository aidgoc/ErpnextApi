# MongoDB Atlas Setup Guide

## Quick Setup for ERPNext API Tester

### Step 1: Create MongoDB Atlas Account
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Click "Try Free" or "Sign Up"
3. Create your account

### Step 2: Create a Cluster
1. Choose "Free" tier (M0 Sandbox)
2. Select a region close to you
3. Name your cluster (e.g., "erpnext-api-tester")
4. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Whitelist IP Addresses
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IPs
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

### Step 6: Format Your Connection String
Replace the placeholders in your connection string:

**Original:**
```
mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**Updated (replace with your actual values):**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/erpnext-api-tester?retryWrites=true&w=majority
```

**Changes made:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Add `/erpnext-api-tester` before the `?` (this is your database name)

### Step 7: Test Your Connection
You can test your connection string using MongoDB Compass or any MongoDB client.

## Example Connection String:
```
mongodb+srv://erpnextuser:MySecurePassword123@cluster0.abc123.mongodb.net/erpnext-api-tester?retryWrites=true&w=majority
```

## Security Best Practices:
1. Use a strong password for your database user
2. Don't share your connection string
3. Consider using IP whitelisting for production
4. Regularly rotate your database passwords
5. Monitor your database access logs

## Troubleshooting:
- **Connection timeout**: Check your IP whitelist
- **Authentication failed**: Verify username and password
- **Database not found**: The database will be created automatically when you first connect
