import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { arenaAPI } from '../services/api';
import { Trophy, Users, Zap, Clock, Swords } from 'lucide-react';
import toast from 'react-hot-toast';

export const Arena: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');
  const navigate = useNavigate();

  const handleFindOpponent = async () => {
    try {
      setLoading(true);
      const response = await arenaAPI.findOpponent({ difficulty });
      const { match } = response.data;
      
      toast.success('Match found!');
      navigate(`/arena/${match.roomId}`);
    } catch (error) {
      toast.error('Failed to find opponent');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrivateMatch = async () => {
    try {
      setLoading(true);
      const response = await arenaAPI.createMatch({ difficulty, isPrivate: true });
      const { match } = response.data;
      
      toast.success('Private match created!');
      navigate(`/arena/${match.roomId}`);
    } catch (error) {
      toast.error('Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Swords className="h-8 w-8" />,
      title: 'Real-time Competition',
      description: 'Compete with other developers in real-time coding battles'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: '30-Minute Rounds',
      description: 'Fast-paced challenges that test your problem-solving speed'
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: 'Earn Trophies',
      description: 'Win matches to earn trophies and climb the leaderboard'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Challenge Friends',
      description: 'Create private matches to challenge your friends'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-full">
            <Trophy className="h-16 w-16 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-4">
          Coding Arena
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Test your skills against other developers in real-time coding competitions
        </p>
      </motion.div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <div className="text-purple-400 mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-300 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Find Opponent */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 rounded-lg p-8 border border-gray-700"
        >
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Quick Match</h2>
            <p className="text-gray-300">Find a random opponent and start competing</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={handleFindOpponent}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Finding opponent...</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  <span>Find Opponent</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Private Match */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 rounded-lg p-8 border border-gray-700"
        >
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-full w-fit mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Private Match</h2>
            <p className="text-gray-300">Create a private room to challenge your friends</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={handleCreatePrivateMatch}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating match...</span>
                </>
              ) : (
                <>
                  <Users className="h-5 w-5" />
                  <span>Create Private Match</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 bg-gray-800 rounded-lg p-8 border border-gray-700"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-8">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-lg font-semibold text-white mb-2">Choose Difficulty</h3>
            <p className="text-gray-300">Select your preferred difficulty level and find an opponent</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-lg font-semibold text-white mb-2">Solve Together</h3>
            <p className="text-gray-300">Both players receive the same problem and race to solve it</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-lg font-semibold text-white mb-2">Win & Earn</h3>
            <p className="text-gray-300">First to submit a correct solution wins and earns trophies</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};