import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contestsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Clock, Users, Plus, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface Contest {
  _id: string;
  title: string;
  description: string;
  creator: {
    username: string;
  };
  startTime: string;
  endTime: string;
  duration: number;
  status: 'upcoming' | 'active' | 'finished';
  participants: any[];
  problems: any[];
  settings: {
    isPublic: boolean;
    maxParticipants?: number;
  };
}

export const Contests: React.FC = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'finished'>('all');

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await contestsAPI.getContests(params);
      setContests(response.data.contests);
    } catch (error) {
      toast.error('Failed to fetch contests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-900/30 text-blue-400 border-blue-500';
      case 'active':
        return 'bg-green-900/30 text-green-400 border-green-500';
      case 'finished':
        return 'bg-gray-900/30 text-gray-400 border-gray-500';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-500';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeUntilStart = (startTime: string) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const diff = start - now;
    
    if (diff <= 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Contests</h1>
            <p className="text-gray-400">Participate in coding competitions and challenges</p>
          </div>
          
          {user?.role === 'teacher' && (
            <Link
              to="/contests/create"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Contest</span>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex space-x-4">
            {['all', 'upcoming', 'active', 'finished'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Contests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest, index) => (
            <motion.div
              key={contest._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{contest.title}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{contest.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(contest.status)}`}>
                  {contest.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Starts: {formatDateTime(contest.startTime)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {contest.duration} minutes</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{contest.participants.length} participants</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Trophy className="h-4 w-4" />
                  <span>{contest.problems.length} problems</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  by {contest.creator.username}
                </div>
                
                {contest.status === 'upcoming' && (
                  <div className="text-sm text-blue-400">
                    Starts in {getTimeUntilStart(contest.startTime)}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Link
                  to={`/contests/${contest._id}`}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  {contest.status === 'active' ? (
                    <>
                      <Trophy className="h-4 w-4" />
                      <span>Join Contest</span>
                    </>
                  ) : contest.status === 'upcoming' ? (
                    <>
                      <Calendar className="h-4 w-4" />
                      <span>View Details</span>
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4" />
                      <span>View Results</span>
                    </>
                  )}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {contests.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No contests found</h3>
            <p className="text-gray-400 mb-4">
              {filter === 'all' 
                ? 'There are no contests available at the moment'
                : `No ${filter} contests found`
              }
            </p>
            {user?.role === 'teacher' && (
              <Link
                to="/contests/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Contest</span>
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};