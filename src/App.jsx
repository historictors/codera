import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Problems } from './pages/Problems';
import { Problem } from './pages/Problem';
import { Profile } from './pages/Profile';
import { Arena } from './pages/Arena';
import { ArenaMatch } from './pages/ArenaMatch';
import { Friends } from './pages/Friends';
import { Leaderboard } from './pages/Leaderboard';
import { Contests } from './pages/Contests';
import { AIAssistant } from './pages/AIAssistant';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/problems" element={
                  <ProtectedRoute>
                    <Problems />
                  </ProtectedRoute>
                } />
                
                <Route path="/problem/:slug" element={
                  <ProtectedRoute>
                    <Problem />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile/:userId?" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/arena" element={
                  <ProtectedRoute>
                    <Arena />
                  </ProtectedRoute>
                } />
                
                <Route path="/arena/:roomId" element={
                  <ProtectedRoute>
                    <ArenaMatch />
                  </ProtectedRoute>
                } />
                
                <Route path="/friends" element={
                  <ProtectedRoute>
                    <Friends />
                  </ProtectedRoute>
                } />
                
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/contests" element={
                  <ProtectedRoute>
                    <Contests />
                  </ProtectedRoute>
                } />
                
                <Route path="/ai-assistant" element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  border: '1px solid #374151'
                }
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;