import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { aiAPI } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import { Brain, Code, Map, Lightbulb, Bug, History, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIInteraction {
  _id: string;
  type: string;
  query: string;
  response: string;
  createdAt: string;
  context?: {
    problem?: {
      title: string;
      difficulty: string;
    };
    language?: string;
  };
}

export const AIAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'code-review' | 'roadmap' | 'hint' | 'debug' | 'history'>('code-review');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AIInteraction[]>([]);
  
  // Code Review State
  const [codeReview, setCodeReview] = useState({
    code: '',
    language: 'javascript',
    problemId: '',
    result: null as any
  });

  // Roadmap State
  const [roadmapForm, setRoadmapForm] = useState({
    goals: [] as string[],
    currentLevel: 'beginner',
    timeCommitment: '5',
    preferredTopics: [] as string[],
    result: null as any
  });

  // Hint State
  const [hintForm, setHintForm] = useState({
    problemId: '',
    currentCode: '',
    language: 'javascript',
    result: null as any
  });

  // Debug State
  const [debugForm, setDebugForm] = useState({
    code: '',
    language: 'javascript',
    error: '',
    problemId: '',
    result: null as any
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const response = await aiAPI.getHistory();
      setHistory(response.data.interactions);
    } catch (error) {
      toast.error('Failed to fetch AI history');
    }
  };

  const handleCodeReview = async () => {
    console.log(codeReview.code);
    
    if (!codeReview.code) {
      toast.error('Please enter code to review');
      return;
    }

    try {
      setLoading(true);
      
      const response = await aiAPI.reviewCode({
        code: codeReview.code,
        language: codeReview.language,
        problemId: codeReview.problemId ? codeReview.problemId as string : undefined
      });
      console.log(response);
      
      setCodeReview(prev => {
        return { ...prev, result: response.data }
      });
      if(codeReview.result =='ERROR' || codeReview.result == null) toast.error('Failed to review code')
        else toast.success('Code review completed!');
    } catch (error) {
      toast.error('Failed to review code');
    } finally {
      setLoading(false);
    }
  };

  const handleRoadmapGeneration = async () => {
    if (roadmapForm.goals.length === 0) {
      toast.error('Please select at least one goal');
      return;
    }

    try {
      setLoading(true);
      const response = await aiAPI.getRoadmap(roadmapForm);
      
      setRoadmapForm(prev => ({ ...prev, result: response.data }));
      if(roadmapForm.result == 'ERROR') toast.error('Failed to generate roadmap')
      else toast.success('Roadmap generated!');
    } catch (error) {
      toast.error('Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleHintRequest = async () => {
    if (!hintForm.problemId) {
      toast.error('Please select a problem');
      return;
    }

    try {
      setLoading(true);
      const response = await aiAPI.getHint(hintForm);
      
      setHintForm(prev => ({ ...prev, result: response.data }));
      toast.success('Hint generated!');
    } catch (error) {
      toast.error('Failed to get hint');
    } finally {
      setLoading(false);
    }
  };

  const handleDebugHelp = async () => {
    if (!debugForm.code.trim() || !debugForm.error.trim()) {
      toast.error('Please provide both code and error message');
      return;
    }

    try {
      setLoading(true);
      const response = await aiAPI.getDebugHelp(debugForm);
      
      setDebugForm(prev => ({ ...prev, result: response.data }));
      toast.success('Debug help provided!');
    } catch (error) {
      toast.error('Failed to get debug help');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (interactionId: string, helpful: boolean) => {
    try {
      await aiAPI.provideFeedback(interactionId, { helpful });
      toast.success('Feedback submitted!');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const tabs = [
    { key: 'code-review', label: 'Code Review', icon: <Code className="h-4 w-4" /> },
    { key: 'roadmap', label: 'Learning Roadmap', icon: <Map className="h-4 w-4" /> },
    { key: 'hint', label: 'Get Hint', icon: <Lightbulb className="h-4 w-4" /> },
    { key: 'debug', label: 'Debug Help', icon: <Bug className="h-4 w-4" /> },
    { key: 'history', label: 'History', icon: <History className="h-4 w-4" /> }
  ];

  const goalOptions = [
    'Get better at algorithms',
    'Prepare for interviews',
    'Learn new programming language',
    'Improve problem-solving skills',
    'Master data structures',
    'Build projects',
    'Competitive programming'
  ];

  const topicOptions = [
    'Arrays & Strings',
    'Linked Lists',
    'Trees & Graphs',
    'Dynamic Programming',
    'Sorting & Searching',
    'System Design',
    'Database Design'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Assistant</h1>
          <p className="text-gray-400">Get personalized help with coding, learning, and debugging</p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="flex border-b border-gray-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Code Review Tab */}
            {activeTab === 'code-review' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Code Review & Analysis</h3>
                  <p className="text-gray-400 mb-6">
                    Get detailed feedback on your code quality, complexity, and suggestions for improvement.
                  </p>
                </div>

                <CodeEditor
                  initialCode={codeReview.code}
                  language={codeReview.language}
                  onCodeChange={(code) => setCodeReview(prev => ({ ...prev, code }))}
                  onLanguageChange={(language) => setCodeReview(prev => ({ ...prev, language }))}
                  height="300px"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleCodeReview}
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Code className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Analyzing...' : 'Review Code'}</span>
                  </button>
                </div>

                {codeReview.result && (
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Review Results</h4>
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-300">{codeReview.result.review?codeReview.result.review:"limit Exceede"}</div>
                    </div>
                    
                    {codeReview.result.suggestions && codeReview.result.suggestions.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-white mb-2">Key Suggestions:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                          {codeReview.result.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Roadmap Tab */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Personalized Learning Roadmap</h3>
                  <p className="text-gray-400 mb-6">
                    Get a customized learning path based on your goals and current skill level.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Level
                    </label>
                    <select
                      value={roadmapForm.currentLevel}
                      onChange={(e) => setRoadmapForm(prev => ({ ...prev, currentLevel: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Time Commitment (hours/week)
                    </label>
                    <input
                      type="number"
                      value={roadmapForm.timeCommitment}
                      onChange={(e) => setRoadmapForm(prev => ({ ...prev, timeCommitment: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                      min="1"
                      max="40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Learning Goals (select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {goalOptions.map((goal) => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={roadmapForm.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoadmapForm(prev => ({ ...prev, goals: [...prev.goals, goal] }));
                            } else {
                              setRoadmapForm(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Topics (select multiple)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {topicOptions.map((topic) => (
                      <label key={topic} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={roadmapForm.preferredTopics.includes(topic)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoadmapForm(prev => ({ ...prev, preferredTopics: [...prev.preferredTopics, topic] }));
                            } else {
                              setRoadmapForm(prev => ({ ...prev, preferredTopics: prev.preferredTopics.filter(t => t !== topic) }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-gray-300 text-sm">{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleRoadmapGeneration}
                    disabled={loading}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Map className="h-4 w-4" />
                    )}
                    <span>{loading ? 'Generating...' : 'Generate Roadmap'}</span>
                  </button>
                </div>

                {roadmapForm.result && (
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Your Learning Roadmap</h4>
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-300">{roadmapForm.result.roadmap?roadmapForm.result.roadmap:"Limit EXceede"}</div>
                      
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">AI Interaction History</h3>
                  <p className="text-gray-400 mb-6">
                    View your previous AI interactions and responses.
                  </p>
                </div>

                <div className="space-y-4">
                  {history.map((interaction) => (
                    <div key={interaction._id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                            {interaction.type.replace('_', ' ')}
                          </span>
                          {interaction.context?.problem && (
                            <span className="text-gray-400 text-sm">
                              {interaction.context.problem.title}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">
                          {new Date(interaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-gray-300 text-sm mb-2">Query:</div>
                        <div className="text-gray-400 text-sm">{interaction.query}</div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-gray-300 text-sm mb-2">Response:</div>
                        <div className="text-gray-400 text-sm whitespace-pre-wrap">
                          {interaction.response.substring(0, 200)}
                          {interaction.response.length > 200 && '...'}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-xs">Was this helpful?</span>
                        <button
                          onClick={() => handleFeedback(interaction._id, true)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(interaction._id, false)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {history.length === 0 && (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No AI interactions yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};