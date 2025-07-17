import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { problemsAPI } from '../services/api';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  stats: {
    acceptanceRate: number;
    totalSubmissions: number;
  };
  createdAt: string;
}

export const Problems: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    category: '',
    sort: 'createdAt'
  });

  useEffect(() => {
    fetchProblems();
  }, [currentPage, filters]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getProblems({
        page: currentPage,
        limit: 20,
        ...filters
      });
      
      setProblems(response.data.problems);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-900/30 border-green-500';
      case 'Medium':
        return 'bg-yellow-900/30 border-yellow-500';
      case 'Hard':
        return 'bg-red-900/30 border-red-500';
      default:
        return 'bg-gray-900/30 border-gray-500';
    }
  };

  if (loading && problems.length === 0) {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Problems</h1>
          <p className="text-gray-400">Challenge yourself with our curated problem set</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            {/* Difficulty */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="">All Categories</option>
              <option value="Array">Array</option>
              <option value="String">String</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Tree">Tree</option>
              <option value="Graph">Graph</option>
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="createdAt">Newest First</option>
              <option value="difficulty">Difficulty</option>
              <option value="acceptance">Acceptance Rate</option>
              <option value="submissions">Most Submissions</option>
            </select>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-700 border-b border-gray-600 text-sm font-medium text-gray-300">
            <div className="col-span-6">Problem</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Acceptance</div>
          </div>

          {problems.map((problem, index) => (
            <motion.div
              key={problem._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={`/problem/${problem.slug}`}
                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
              >
                <div className="col-span-6">
                  <h3 className="text-white hover:text-blue-400 transition-colors">
                    {problem.title}
                  </h3>
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 rounded text-xs border ${getDifficultyBg(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">{problem.category}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">
                    {problem.stats.acceptanceRate}%
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            
            <span className="text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};