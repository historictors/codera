# MongoDB Database Setup Guide for Codera

## Option 1: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

### Step 2: Create a New Cluster
1. After logging in, click "Build a Database"
2. Choose "Shared" (Free tier)
3. Select your preferred cloud provider and region
4. Choose cluster tier M0 (Free)
5. Give your cluster a name (e.g., "codera-cluster")
6. Click "Create Cluster"

### Step 3: Create Database User
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username: `codera-admin`
5. Click "Autogenerate Secure Password" and save it
6. Under "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

### Step 4: Configure Network Access
1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String
1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@codera-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB Installation

### For Windows:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Choose "Complete" installation
4. Install MongoDB as a Service
5. Install MongoDB Compass (GUI tool)

### For macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

### For Ubuntu/Linux:
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Step 6: Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For MongoDB Atlas (replace with your actual connection string)
MONGODB_URI=mongodb+srv://codera-admin:YOUR_PASSWORD@codera-cluster.xxxxx.mongodb.net/codera?retryWrites=true&w=majority

# For Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/codera

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Client URL
CLIENT_URL=http://localhost:5173

# Judge0 API Configuration
JUDGE0_API_KEY=your-judge0-rapidapi-key-here
```

## Step 7: Get Judge0 API Key

1. Go to [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up for a RapidAPI account
3. Subscribe to the Judge0 CE API (free tier available)
4. Copy your API key from the dashboard
5. Add it to your `.env` file

## Step 8: Install Dependencies and Start the Application

### Backend Setup:
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

### Frontend Setup:
```bash
# Navigate back to root directory
cd ..

# Install frontend dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

## Step 9: Verify Database Connection

1. Check the server console for "Connected to MongoDB" message
2. If using MongoDB Atlas, you can view your data in the Atlas dashboard
3. If using local MongoDB, you can use MongoDB Compass to connect to `mongodb://localhost:27017`

## Database Schema Overview

The application creates the following collections:

### Users Collection
- Stores user authentication and profile data
- Includes stats, achievements, friends, and solved problems

### Problems Collection
- Contains coding problems with descriptions, test cases, and starter code
- Supports multiple programming languages

### Submissions Collection
- Tracks all code submissions and their results
- Links users to problems with execution results

### Arena Matches Collection
- Manages 1v1 coding competitions
- Includes real-time match state and chat messages

## Troubleshooting

### Common Issues:

1. **Connection Timeout**
   - Check your network access settings in MongoDB Atlas
   - Ensure your IP is whitelisted

2. **Authentication Failed**
   - Verify username and password in connection string
   - Check database user permissions

3. **Database Not Found**
   - MongoDB will create the database automatically when first accessed
   - Run the seed script to populate initial data

4. **Judge0 API Errors**
   - Verify your RapidAPI key is correct
   - Check your subscription status and rate limits

### Useful MongoDB Commands:

```javascript
// Connect to MongoDB shell
mongo

// Switch to codera database
use codera

// View all collections
show collections

// View users
db.users.find().pretty()

// View problems
db.problems.find().pretty()

// Clear all data (be careful!)
db.dropDatabase()
```

## Production Deployment Notes

1. **Security**: Never use "Allow Access from Anywhere" in production
2. **Environment Variables**: Use secure environment variable management
3. **Connection Pooling**: MongoDB driver handles this automatically
4. **Monitoring**: Set up MongoDB Atlas monitoring and alerts
5. **Backups**: Enable automated backups in MongoDB Atlas

## Next Steps

1. Set up your MongoDB database (Atlas or local)
2. Configure your `.env` file with the connection string
3. Get your Judge0 API key from RapidAPI
4. Run the seed script to populate sample data
5. Start both backend and frontend servers
6. Test the application by registering a new user

Your Codera application should now be fully connected to MongoDB and ready for development!