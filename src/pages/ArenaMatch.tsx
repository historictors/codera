import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import { arenaAPI } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import { Trophy, Clock, Users, Send, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Player {
  user: {
    _id: string;
    username: string;
    avatar: string;
    stats: {
      rating: number;
      arenaWins: number;
      arenaLosses: number;
    };
  };
  status: string;
  submittedAt?: string;
}

interface Match {
  _id: string;
  roomId: string;
  players: Player[];
  problem: {
    title: string;
    description: string;
    difficulty: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    constraints: string[];
    starterCode: {
      javascript: string;
      python: string;
      cpp: string;
      java: string;
    };
  };
  status: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  winner?: {
    _id: string;
    username: string;
    avatar: string;
  };
}

interface ChatMessage {
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  message: string;
  timestamp: Date;
}

export const ArenaMatch: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchMatch();
    }
  }, [roomId]);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join-arena', roomId);

      socket.on('arena-joined', (data) => {
        setMatch(data.match);
        setLoading(false);
      });

      socket.on('match-started', (data) => {
        setMatch(data.match);
        toast.success('Match started!');
      });

      socket.on('player-joined', (data) => {
        toast.success(`${data.user.username} joined the match`);
      });

      socket.on('player-submitted', (data) => {
        toast.info(`${data.playerName} submitted their solution!`);
      });

      socket.on('match-finished', (data) => {
        setMatch(data.match);
        if (data.winner) {
          toast.success(`${data.winner.username} won the match!`);
        }
      });

      socket.on('opponent-coding', (data) => {
        // Handle opponent typing indicator
      });

      socket.on('arena-chat', (data) => {
        setChatMessages(prev => [...prev, data]);
      });

      socket.on('arena-error', (data) => {
        toast.error(data.message);
        navigate('/arena');
      });

      return () => {
        socket.off('arena-joined');
        socket.off('match-started');
        socket.off('player-joined');
        socket.off('player-submitted');
        socket.off('match-finished');
        socket.off('opponent-coding');
        socket.off('arena-chat');
        socket.off('arena-error');
      };
    }
  }, [socket, roomId, navigate]);

  useEffect(() => {
    if (match && match.status === 'active' && match.startTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const startTime = new Date(match.startTime!).getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, match.duration - elapsed);
        
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
          toast.info('Time\'s up!');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [match]);

  useEffect(() => {
    if (match && match.problem) {
      const starterCode = match.problem.starterCode[language as keyof typeof match.problem.starterCode];
      setCode(starterCode || '');
    }
  }, [match, language]);

  const fetchMatch = async () => {
    try {
      const response = await arenaAPI.getMatch(roomId!);
      setMatch(response.data.match);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch match details');
      navigate('/arena');
    }
  };

  const handleSubmit = () => {
    if (socket && roomId) {
      socket.emit('submit-code', {
        roomId,
        code,
        language
      });
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (socket && roomId) {
      socket.emit('code-update', {
        roomId,
        code: newCode,
        language
      });
    }
  };

  const handleSendMessage = () => {
    if (socket && roomId && newMessage.trim()) {
      socket.emit('arena-chat', {
        roomId,
        message: newMessage.trim()
      });
      setNewMessage('');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Match not found</h1>
        <p className="text-gray-400">The match you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Arena Match</h1>
              <p className="text-gray-400">{match.problem.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {match.status === 'active' && (
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-mono text-white">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            
            <div className="text-right">
              <div className="text-sm text-gray-400">Status</div>
              <div className="text-white font-semibold capitalize">
                {match.status}
              </div>
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-2 gap-4">
          {match.players.map((player, index) => (
            <div key={player.user._id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {player.user.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold">{player.user.username}</h3>
                    {match.winner && match.winner._id === player.user._id && (
                      <Crown className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    Rating: {player.user.stats.rating} | 
                    W: {player.user.stats.arenaWins} | 
                    L: {player.user.stats.arenaLosses}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  player.status === 'submitted' 
                    ? 'bg-green-900/30 text-green-400 border border-green-500'
                    : player.status === 'coding'
                    ? 'bg-blue-900/30 text-blue-400 border border-blue-500'
                    : 'bg-gray-900/30 text-gray-400 border border-gray-500'
                }`}>
                  {player.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Problem Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">{match.problem.title}</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-yellow-900/30 text-yellow-400 border border-yellow-500">
              {match.problem.difficulty}
            </span>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 mb-6" dangerouslySetInnerHTML={{ __html: match.problem.description }} />

            {/* Examples */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Examples</h3>
              {match.problem.examples.map((example, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="mb-2">
                    <span className="text-gray-400">Input:</span>
                    <pre className="text-gray-300 bg-gray-800 p-2 rounded mt-1">{example.input}</pre>
                  </div>
                  <div className="mb-2">
                    <span className="text-gray-400">Output:</span>
                    <pre className="text-gray-300 bg-gray-800 p-2 rounded mt-1">{example.output}</pre>
                  </div>
                  {example.explanation && (
                    <div>
                      <span className="text-gray-400">Explanation:</span>
                      <p className="text-gray-300 mt-1">{example.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Constraints</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {match.problem.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Code Editor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <CodeEditor
            initialCode={code}
            language={language}
            onCodeChange={handleCodeChange}
            onLanguageChange={setLanguage}
            height="400px"
            readOnly={match.status === 'finished'}
          />

          {match.status === 'active' && (
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Trophy className="h-4 w-4" />
                <span>Submit Solution</span>
              </button>
            </div>
          )}

          {/* Chat */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>Chat</span>
              </button>
            </div>
            
            {showChat && (
              <div className="p-4">
                <div className="h-40 overflow-y-auto mb-4 space-y-2">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-blue-400">{msg.user.username}:</span>
                      <span className="text-gray-300 ml-2">{msg.message}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};