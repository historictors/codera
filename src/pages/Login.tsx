
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/problems');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('An unknown error occurred');
        toast.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] via-[#111827] to-[#1f2937] relative overflow-hidden">
      {/* Background Glow Animation */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'radial-gradient(circle at 30% 30%, #7c3aed33, transparent 60%)',
        }}
      />

      {/* Frosted Glass Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl backdrop-blur-lg bg-white/5 border border-white/10 shadow-xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-gray-400">Sign in to your Codera account</p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-500 text-sm text-red-200 rounded-md px-4 py-3 mb-5 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-800/60 border border-gray-600 text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-800/60 border border-gray-600 text-white rounded-lg pl-10 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-300">
              <input
                type="checkbox"
                className="form-checkbox text-blue-500 rounded border-gray-500 bg-gray-700 mr-2"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
