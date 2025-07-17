# Complete Setup Guide for Codera - Step by Step

## 📋 Prerequisites

Before starting, make sure you have:
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- Git (optional but recommended) - [Download here](https://git-scm.com/)
- A text editor (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🗂️ Step 1: Project Structure Setup

Your project should have this structure:
```
codera/
├── src/                    # Frontend React code
├── server/                 # Backend Express code
├── package.json           # Frontend dependencies
├── index.html
├── vite.config.ts
└── other frontend files...
```

## 📦 Step 2: Install Dependencies

### Frontend Dependencies
```bash
# In the root directory (codera/)
npm install
```

### Backend Dependencies
```bash
# Navigate to server directory
cd server
npm install
cd ..
```

## 🗄️ Step 3: Database Setup (Choose One Option)

### Option A: MongoDB Atlas (Recommended - Cloud)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free" and create account
   - Verify your email

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "Shared" (Free tier)
   - Select cloud provider and region
   - Choose M0 cluster tier (Free)
   - Name your cluster (e.g., "codera-cluster")
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `codera-admin`
   - Click "Autogenerate Secure Password" and SAVE IT
   - Select "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version "4.1 or later"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://codera-admin:<password>@codera-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

### Option B: Local MongoDB

#### Windows:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run installer and follow setup wizard
3. Choose "Complete" installation
4. Install as Windows Service
5. Connection string: `mongodb://localhost:27017/codera`

#### macOS:
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```
Connection string: `mongodb://localhost:27017/codera`

#### Linux (Ubuntu):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```
Connection string: `mongodb://localhost:27017/codera`

## 🔑 Step 4: Get API Keys

### Judge0 API Key (Required)
1. Go to [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up for RapidAPI account
3. Subscribe to Judge0 CE API (free tier available)
4. Go to your RapidAPI dashboard
5. Find Judge0 CE API and copy your API key

### OpenAI API Key (Required for AI features)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with sk-...)

## ⚙️ Step 5: Configure Environment Variables

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Create .env file**
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

3. **Edit .env file** (use any text editor)
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
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-123456789

   # Client URL
   CLIENT_URL=http://localhost:5173

   # Judge0 API Configuration
   JUDGE0_API_KEY=your-judge0-rapidapi-key-here

   # OpenAI API Configuration
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Replace the placeholders:**
   - `YOUR_PASSWORD`: Your MongoDB Atlas password
   - `your-judge0-rapidapi-key-here`: Your Judge0 API key
   - `your-openai-api-key-here`: Your OpenAI API key
   - `your-super-secret-jwt-key-here...`: Any long random string

## 🌱 Step 6: Seed the Database

```bash
# Make sure you're in the server directory
cd server

# Run the seed script to populate sample data
npm run seed
```

This creates:
- Sample coding problems
- Test user accounts
- Sample contest data

## 🚀 Step 7: Start the Application

You need to run both backend and frontend servers:

### Terminal 1 - Backend Server
```bash
# Navigate to server directory
cd server

# Start backend server
npm run dev
```

You should see:
```
Server running on port 5000
Connected to MongoDB
```

### Terminal 2 - Frontend Server
```bash
# Navigate to root directory (codera/)
cd ..

# Start frontend server
npm run dev
```

You should see:
```
Local:   http://localhost:5173/
```

## 🌐 Step 8: Access Your Application

1. **Open your browser**
2. **Go to:** `http://localhost:5173`
3. **You should see the Codera homepage**

## 👥 Step 9: Test the Application

### Test Accounts (created by seed script):
- **Admin**: admin@codera.com / admin123
- **Student**: alice@example.com / password123
- **Student**: bob@example.com / password123
- **Student**: charlie@example.com / password123

### Test Features:
1. **Register new account** (try both student and teacher roles)
2. **Login with test accounts**
3. **Browse problems** at `/problems`
4. **Try solving a problem**
5. **Test friend requests** in `/friends`
6. **Try 1v1 arena** at `/arena`
7. **Check AI assistant** at `/ai-assistant`
8. **View contests** at `/contests` (teachers can create)

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running (local)
   mongod --version
   
   # For Atlas: verify connection string and network access
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

3. **Judge0 API Error**
   - Verify API key in .env file
   - Check RapidAPI subscription status

4. **OpenAI API Error**
   - Verify API key is correct
   - Check OpenAI account has credits

5. **CORS Issues**
   ```env
   # Ensure CLIENT_URL in server/.env matches frontend URL
   CLIENT_URL=http://localhost:5173
   ```

## 📁 Project Structure Overview

```
codera/
├── src/                          # Frontend React application
│   ├── components/              # Reusable React components
│   ├── contexts/               # React contexts (Auth, Socket)
│   ├── pages/                  # Page components
│   ├── services/               # API service functions
│   └── App.tsx                 # Main App component
├── server/                      # Backend Express application
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   ├── socket/                 # Socket.io handlers
│   ├── scripts/                # Database seed scripts
│   └── index.js                # Server entry point
├── package.json                # Frontend dependencies
└── server/package.json         # Backend dependencies
```

## 🎯 Next Steps

1. **Customize the application** to your needs
2. **Add more problems** through the admin interface
3. **Create contests** as a teacher
4. **Invite friends** to compete
5. **Deploy to production** when ready

## 🚀 Production Deployment Tips

1. **Environment**: Set NODE_ENV=production
2. **Database**: Use MongoDB Atlas for production
3. **Security**: Update CORS settings and JWT secrets
4. **Build**: Run `npm run build` for frontend
5. **Process Manager**: Use PM2 for backend

Your Codera application is now fully functional with all features including teacher roles, live contests, AI assistance, friend requests, and 1v1 arena competitions! 🎉