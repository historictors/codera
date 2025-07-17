import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { friendsAPI } from '../services/api';
import { Search, UserPlus, Check, X, Users, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  stats: {
    totalSolved: number;
    rating: number;
  };
}

interface FriendRequest {
  user: User;
  sentAt: string;
}

export const Friends: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    if (socket) {
      socket.on('friend-request-received', (data) => {
        toast.success(`Friend request from ${data.from.username}`);
        // Refresh user data to update friend requests
        window.location.reload();
      });

      return () => {
        socket.off('friend-request-received');
      };
    }
  }, [socket]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await friendsAPI.searchUsers({ q: searchQuery });
      setSearchResults(response.data.users);
    } catch (error) {
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (username: string) => {
    try {
      await friendsAPI.sendRequest(username);
      toast.success('Friend request sent!');
      
      // Emit socket event to notify the target user
      if (socket) {
        const targetUser = searchResults.find(u => u.username === username);
        if (targetUser) {
          socket.emit('friend-request-sent', { targetUserId: targetUser._id });
        }
      }
      
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.username !== username));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    try {
      await friendsAPI.acceptRequest(userId);
      toast.success('Friend request accepted!');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (userId: string) => {
    try {
      await friendsAPI.declineRequest(userId);
      toast.success('Friend request declined');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to decline friend request');
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      await friendsAPI.removeFriend(userId);
      toast.success('Friend removed');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  const tabs = [
    { key: 'friends', label: 'Friends', count: user?.friends?.length || 0 },
    { key: 'requests', label: 'Requests', count: user?.friendRequests?.received?.length || 0 },
    { key: 'search', label: 'Search', count: 0 }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Friends</h1>
          <p className="text-gray-400">Connect with other developers and track their progress</p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="flex border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by username or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>

                <div className="space-y-4">
                  {searchResults.map((searchUser) => (
                    <div key={searchUser._id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {searchUser.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-semibold">{searchUser.username}</h3>
                            {searchUser.isOnline && (
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {searchUser.stats.totalSolved} problems solved | Rating: {searchUser.stats.rating}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(searchUser.username)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Add Friend</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="space-y-4">
                {user?.friends?.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No friends yet</h3>
                    <p className="text-gray-400 mb-4">Search for users to add as friends</p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Search Users
                    </button>
                  </div>
                ) : (
                  user?.friends?.map((friend) => (
                    <div key={friend.user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {friend.user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-semibold">{friend.user.username}</h3>
                            {friend.user.isOnline && (
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            Rating: {friend.user.stats?.rating || 0} | 
                            Friends since {new Date(friend.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>Message</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.user.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {user?.friendRequests?.received?.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No friend requests</h3>
                    <p className="text-gray-400">You don't have any pending friend requests</p>
                  </div>
                ) : (
                  user?.friendRequests?.received?.map((request) => (
                    <div key={request.user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {request.user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{request.user.username}</h3>
                          <p className="text-gray-400 text-sm">
                            Sent {new Date(request.sentAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.user.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Check className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.user.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};