import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usersAPI } from '../services/api';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaderboardUser {
  _id: string;
  username: string;
  avatar: string;
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    arenaWins: number;
    arenaLosses: number;
    rating: number;
  };
}

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getLeaderboard({ page: currentPage, limit: 50 });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-400" />;
      default:
        return <Award className="h-6 w-6 text-gray-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-600 p-4 rounded-full">
              <Trophy className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-xl text-gray-300">Top performers on Codera</p>
        </div>

        {/* Top 3 */}
        {users.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center order-2 md:order-1"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {users[1].username[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white">{users[1].username}</h3>
                <p className="text-gray-400">2nd Place</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="text-white">{users[1].stats.rating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Solved</span>
                  <span className="text-white">{users[1].stats.totalSolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Arena Wins</span>
                  <span className="text-white">{users[1].stats.arenaWins}</span>
                </div>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-yellow-400/20 to-orange-600/20 rounded-lg border border-yellow-400 p-6 text-center order-1 md:order-2 transform md:scale-110"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {users[0].username[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <Crown className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{users[0].username}</h3>
                <p className="text-yellow-400">Champion</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="text-white font-bold">{users[0].stats.rating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Solved</span>
                  <span className="text-white font-bold">{users[0].stats.totalSolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Arena Wins</span>
                  <span className="text-white font-bold">{users[0].stats.arenaWins}</span>
                </div>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center order-3"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {users[2].username[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <Medal className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-white">{users[2].username}</h3>
                <p className="text-gray-400">3rd Place</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating</span>
                  <span className="text-white">{users[2].stats.rating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Solved</span>
                  <span className="text-white">{users[2].stats.totalSolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Arena Wins</span>
                  <span className="text-white">{users[2].stats.arenaWins}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-700 border-b border-gray-600 text-sm font-medium text-gray-300">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">User</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-2">Problems Solved</div>
            <div className="col-span-2">Arena Wins</div>
            <div className="col-span-2">Arena W/L</div>
          </div>

          {users.map((user, index) => {
            const rank = (currentPage - 1) * 50 + index + 1;
            const winRate = user.stats.arenaWins + user.stats.arenaLosses > 0
              ? Math.round((user.stats.arenaWins / (user.stats.arenaWins + user.stats.arenaLosses)) * 100)
              : 0;

            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors ${
                  rank <= 3 ? 'bg-gray-700/50' : ''
                }`}
              >
                <div className="col-span-1 flex items-center">
                  <div className="flex items-center space-x-2">
                    {rank <= 3 && getRankIcon(rank)}
                    <span className="text-white font-semibold">{rank}</span>
                  </div>
                </div>
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white font-medium">{user.username}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-white font-semibold">{user.stats.rating}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-white">{user.stats.totalSolved}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-white">{user.stats.arenaWins}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-400">{winRate}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};