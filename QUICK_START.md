# Codera - Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or Atlas account)
- Judge0 API key from RapidAPI

## Quick Setup Steps

### 1. Clone and Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally (see DATABASE_SETUP.md for detailed instructions)
# Default connection: mongodb://localhost:27017/codera
```

**Option B: MongoDB Atlas (Recommended)**
```bash
# 1. Create account at https://www.mongodb.com/cloud/atlas
# 2. Create a free cluster
# 3. Get connection string
# 4. Update MONGODB_URI in server/.env
```

### 3. Configure Environment Variables
```bash
# Edit server/.env file
cd server
cp .env.example .env
# Update the following:
# - MONGODB_URI (your MongoDB connection string)
# - JUDGE0_API_KEY (get from https://rapidapi.com/judge0-official/api/judge0-ce)
# - JWT_SECRET (generate a strong secret)
```

### 4. Seed Database with Sample Data
```bash
cd server
npm run seed
```

### 5. Start the Application
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend (in new terminal)
cd ..
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Test Accounts
After running the seed script, you can use these accounts:

- **Admin**: admin@codera.com / admin123
- **User 1**: alice@example.com / password123
- **User 2**: bob@example.com / password123
- **User 3**: charlie@example.com / password123

## Key Features to Test

1. **Authentication**: Register/Login
2. **Problems**: Browse and solve coding problems
3. **Friends**: Send/accept friend requests
4. **Arena**: 1v1 coding competitions
5. **Profile**: View stats and achievements
6. **Leaderboard**: Global rankings

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Problems
- GET `/api/problems` - Get all problems
- GET `/api/problems/:slug` - Get specific problem

### Submissions
- POST `/api/submissions` - Submit code solution

### Friends
- POST `/api/friends/request` - Send friend request
- POST `/api/friends/accept` - Accept friend request
- GET `/api/friends/search` - Search users

### Arena
- POST `/api/arena/find-opponent` - Find random opponent
- POST `/api/arena/create` - Create private match
- GET `/api/arena/:roomId` - Get match details

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   # For local: mongod --version
   # For Atlas: verify connection string and network access
   ```

2. **Judge0 API Error**
   ```bash
   # Verify API key in .env file
   # Check RapidAPI subscription status
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

4. **CORS Issues**
   ```bash
   # Ensure CLIENT_URL in server/.env matches frontend URL
   CLIENT_URL=http://localhost:5173
   ```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Database GUI**: Use MongoDB Compass for local DB or Atlas dashboard
3. **API Testing**: Use Postman or Thunder Client for API testing
4. **Real-time Features**: WebSocket connections handle live updates
5. **Code Editor**: Monaco Editor provides VS Code-like experience

## Production Deployment

1. **Environment**: Set NODE_ENV=production
2. **Database**: Use MongoDB Atlas for production
3. **Security**: Update CORS settings and JWT secrets
4. **Build**: Run `npm run build` for frontend
5. **Process Manager**: Use PM2 for backend process management

For detailed setup instructions, see `DATABASE_SETUP.md`.