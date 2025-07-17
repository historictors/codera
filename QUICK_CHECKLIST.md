# Quick Setup Checklist for Codera

## ✅ Pre-Setup Checklist
- [ ] Node.js installed (v16+)
- [ ] Text editor ready (VS Code recommended)
- [ ] Terminal/Command prompt access

## ✅ Dependencies Installation
```bash
# Root directory
npm install

# Server directory
cd server && npm install && cd ..
```

## ✅ Database Setup
**Choose ONE option:**

### Option A: MongoDB Atlas (Cloud)
- [ ] Create MongoDB Atlas account
- [ ] Create free cluster
- [ ] Create database user with password
- [ ] Allow network access (0.0.0.0/0 for development)
- [ ] Copy connection string

### Option B: Local MongoDB
- [ ] Install MongoDB Community Server
- [ ] Start MongoDB service
- [ ] Use connection: `mongodb://localhost:27017/codera`

## ✅ API Keys Required
- [ ] **Judge0 API Key**: Get from [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
- [ ] **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/)

## ✅ Environment Configuration
```bash
cd server
cp .env.example .env
# Edit .env with your values:
# - MONGODB_URI
# - JUDGE0_API_KEY  
# - OPENAI_API_KEY
# - JWT_SECRET (any long random string)
```

## ✅ Database Seeding
```bash
cd server
npm run seed
```

## ✅ Start Application
**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## ✅ Test Access
- [ ] Open browser to `http://localhost:5173`
- [ ] Backend running on `http://localhost:5000`
- [ ] Test login with: admin@codera.com / admin123

## ✅ Feature Testing
- [ ] Register new account (try teacher role)
- [ ] Solve a coding problem
- [ ] Send friend request
- [ ] Try 1v1 arena match
- [ ] Test AI assistant
- [ ] Create contest (as teacher)

## 🚨 Common Issues
- **Port in use**: Kill processes on ports 5000/5173
- **MongoDB connection**: Check connection string and network access
- **API errors**: Verify Judge0 and OpenAI API keys
- **CORS issues**: Ensure CLIENT_URL=http://localhost:5173

## 🎯 Success Indicators
- ✅ Both servers running without errors
- ✅ Can access homepage at localhost:5173
- ✅ Can login with test accounts
- ✅ Database operations working (register, login, problems)
- ✅ Real-time features working (arena, friends)