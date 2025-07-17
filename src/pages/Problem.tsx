import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { problemsAPI, submissionsAPI } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
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
  stats: {
    acceptanceRate: number;
    totalSubmissions: number;
  };
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
}

export const Problem: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProblem();
    }
  }, [slug]);

  useEffect(() => {
    if (problem && problem.starterCode) {
      setCode(problem.starterCode[language as keyof typeof problem.starterCode] || '');
    }
  }, [problem, language]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getProblem(slug!);
      setProblem(response.data);
    } catch (error) {
      toast.error('Failed to fetch problem');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;

    try {
      setSubmitting(true);
      setShowResults(false);
      
      const response = await submissionsAPI.submit({
        problemId: problem._id,
        code,
        language
      });

      const { submission } = response.data;
      setSubmissionStatus(submission.status);
      setTestResults(submission.testResults || []);
      setShowResults(true);

      if (submission.status === 'accepted') {
        toast.success('Solution accepted!');
      } else {
        toast.error('Solution failed some test cases');
      }
    } catch (error) {
      toast.error('Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-900/30 border-green-500';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
      case 'Hard':
        return 'text-red-400 bg-red-900/30 border-red-500';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'wrong_answer':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'runtime_error':
        return <AlertCircle className="h-5 w-5 text-orange-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Problem not found</h1>
        <p className="text-gray-400">The problem you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Problem Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 rounded-lg border border-gray-700 p-6"
        >
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Category: {problem.category}</span>
              <span>Acceptance: {problem.stats.acceptanceRate}%</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 mb-6" dangerouslySetInnerHTML={{ __html: problem.description }} />

            {/* Examples */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Examples</h3>
              {problem.examples.map((example, index) => (
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
                {problem.constraints.map((constraint, index) => (
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
            onCodeChange={setCode}
            onLanguageChange={setLanguage}
            height="500px"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results */}
          {showResults && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                {getStatusIcon(submissionStatus || '')}
                <h3 className="text-lg font-semibold text-white">
                  {submissionStatus === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                </h3>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {result.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-white font-semibold">
                          Test Case {index + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Input:</span>
                          <pre className="text-gray-300 bg-gray-800 p-2 rounded mt-1">{result.input}</pre>
                        </div>
                        <div>
                          <span className="text-gray-400">Expected:</span>
                          <pre className="text-gray-300 bg-gray-800 p-2 rounded mt-1">{result.expectedOutput}</pre>
                        </div>
                        <div>
                          <span className="text-gray-400">Actual:</span>
                          <pre className={`p-2 rounded mt-1 ${result.passed ? 'text-green-300 bg-green-900/30' : 'text-red-300 bg-red-900/30'}`}>
                            {result.actualOutput}
                          </pre>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-400">
                        Execution time: {result.executionTime}ms
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};