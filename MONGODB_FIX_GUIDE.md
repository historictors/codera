# MongoDB Connection Error Fix Guide

## 🚨 **Error Analysis**
Your error `connect ECONNREFUSED 127.0.0.1:27017` means:
- MongoDB is not running on your local machine
- The application is trying to connect to `localhost:27017` but MongoDB service is not started

## 🔧 **Solution Options**

### Option 1: Install and Start Local MongoDB (Ubuntu/Linux)

#### Step 1: Install MongoDB
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org
```

#### Step 2: Start MongoDB Service
```bash
# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check if MongoDB is running
sudo systemctl status mongod
```

#### Step 3: Verify MongoDB is Running
```bash
# Check if MongoDB is listening on port 27017
sudo netstat -tlnp | grep :27017

# Or use this command
sudo ss -tlnp | grep :27017
```

You should see output like:
```
tcp        0      0 127.0.0.1:27017         0.0.0.0:*               LISTEN      1234/mongod
```

### Option 2: Use MongoDB Atlas (Cloud - Recommended)

If you prefer not to install MongoDB locally, use MongoDB Atlas:

#### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create account
3. Verify your email

#### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "Shared" (Free tier)
3. Select cloud provider and region
4. Choose M0 cluster tier (Free)
5. Name your cluster (e.g., "codera-cluster")
6. Click "Create Cluster"

#### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `codera-admin`
5. Click "Autogenerate Secure Password" and **SAVE IT**
6. Select "Read and write to any database"
7. Click "Add User"

#### Step 4: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

#### Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

#### Step 6: Update Your .env File
```bash
cd server
nano .env  # or use any text editor
```

Replace the MONGODB_URI with your Atlas connection string:
```env
# Replace this line:
MONGODB_URI=mongodb://localhost:27017/codera

# With your Atlas connection string (replace <password> with actual password):
MONGODB_URI=mongodb+srv://codera-admin:<password>@codera-cluster.xxxxx.mongodb.net/codera?retryWrites=true&w=majority
```

## 🚀 **Quick Fix Commands**

### If you want to use Local MongoDB:
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Check if it's running
sudo systemctl status mongodb
```

### Alternative MongoDB installation (if above doesn't work):
```bash
# Install MongoDB Community Edition
sudo apt install mongodb-server

# Start the service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify it's running
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

## 🔍 **Verify Connection**

After starting MongoDB (local) or setting up Atlas, test the connection:

```bash
cd server
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codera')
  .then(() => { console.log('✅ MongoDB connected successfully!'); process.exit(0); })
  .catch(err => { console.error('❌ MongoDB connection failed:', err.message); process.exit(1); });
"
```

## 🏃‍♂️ **Restart Your Application**

After fixing MongoDB:

```bash
# Terminal 1 - Backend
cd server
npm run seed  # Populate database with sample data
npm run dev   # Start backend server

# Terminal 2 - Frontend
npm run dev   # Start frontend server
```

## 🎯 **Expected Success Output**

When MongoDB is working, you should see:
```
Server running on port 5000
Connected to MongoDB
```

## 🆘 **Still Having Issues?**

### Check MongoDB Status:
```bash
sudo systemctl status mongod
# or
sudo systemctl status mongodb
```

### Check MongoDB Logs:
```bash
sudo journalctl -u mongod
# or
sudo tail -f /var/log/mongodb/mongod.log
```

### Restart MongoDB:
```bash
sudo systemctl restart mongod
# or
sudo systemctl restart mongodb
```

Choose **Option 1** for local development or **Option 2** for cloud-based setup. I recommend **Option 2 (MongoDB Atlas)** as it's easier to set up and doesn't require local installation.