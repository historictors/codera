const express = require('express');
const axios = require('axios');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const JUDGE0_API_KEY = '054fef72aemsh74c70880308d543p110f8cjsn03350a791e05'
const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

const languageIds = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62
};

// Submit code
router.post('/', auth, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Missing problemId, code, or language' });
    }

    if (code.trim().length === 0) {
      return res.status(400).json({ message: 'Submitted code is empty' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (!JUDGE0_API_KEY || !problem.testCases || problem.testCases.length === 0) {
      return res.status(500).json({ message: 'Judge0 API key or problem test cases not available' });
    }

    const submission = new Submission({
      user: req.user.userId,
      problem: problemId,
      code,
      language,
      status: 'pending'
    });
    await submission.save();

    // Run test cases
    const testResults = await runTestCases(code, language, problem.testCases);
    const passed = testResults.filter(t => t.passed).length;
    const total = testResults.length;

    submission.testResults = testResults;
    submission.status = passed === total ? 'accepted' : 'wrong_answer';
    submission.score = Math.round((passed / total) * 100);

    await submission.save();

    // Update user + problem stats only if accepted
    if (submission.status === 'accepted') {
      await updateUserStats(req.user.userId, problem, language);
    }

    problem.stats.totalSubmissions += 1;
    if (submission.status === 'accepted') {
      problem.stats.acceptedSubmissions += 1;
    }
    problem.stats.acceptanceRate = Math.round(
      (problem.stats.acceptedSubmissions / problem.stats.totalSubmissions) * 100
    );
    await problem.save();

    res.json({
      submission: {
        id: submission._id,
        status: submission.status,
        score: submission.score,
        testResults: submission.testResults.map(r => ({
          input: r.input,
          expectedOutput: r.expectedOutput,
          actualOutput: r.actualOutput,
          passed: r.passed,
          executionTime: r.executionTime
        }))
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user submissions
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const submissions = await Submission.find({ user: req.params.userId })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments({ user: req.params.userId });

    res.json({
      submissions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper: Run test cases
async function runTestCases(code, language, testCases) {
  const results = [];

  for (const test of testCases) {
    try {
      console.log('⏳ Running test case:', test.input);
      const result = await executeJudge0(code, language, test.input);
      console.log('✅ Got result from Judge0:', result);

      const actual = result.stdout?.trim() || '';
      const expected = test.expectedOutput.trim();

      results.push({
        input: test.input,
        expectedOutput: expected,
        actualOutput: actual,
        passed: actual === expected,
        executionTime: result.time || 0,
        memory: result.memory || 0
      });
    } catch (err) {
      console.error('❌ Test case error:', err.message);

      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        actualOutput: err.message || 'Error',
        passed: false,
        executionTime: 0,
        memory: 0
      });
    }
  }

  return results;
}


// Helper: Judge0 Execution
async function executeJudge0(code, language, input) {
  const languageId = languageIds[language];
  if (!languageId) throw new Error('Unsupported language');

  const { data: { token } } = await axios.post(`${JUDGE0_BASE_URL}/submissions`, {
    source_code: code,
    language_id: languageId,
    stdin: input,
    base64_encoded: false  // ⚠️ VERY IMPORTANT
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
  });

  let result;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { data } = await axios.get(`${JUDGE0_BASE_URL}/submissions/${token}`, {
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });
    result = data;
    attempts++;
  } while (result.status.id <= 2 && attempts < maxAttempts);

  if (result.stderr || result.compile_output) {
    throw new Error(result.stderr || result.compile_output || 'Execution failed');
  }

  return {
    stdout: result.stdout || '',
    time: result.time,
    memory: result.memory
  };
}


// Helper: Update user stats
async function updateUserStats(userId, problem, language) {
  const user = await User.findById(userId);
  if (!user) return;

  const alreadySolved = user.solvedProblems.some(
    p => p.problem.toString() === problem._id.toString()
  );

  if (!alreadySolved) {
    user.solvedProblems.push({
      problem: problem._id,
      solvedAt: new Date(),
      language,
      solution: '' // optionally include final code
    });

    user.stats.totalSolved += 1;
    user.stats.totalSubmissions += 1;

    if (problem.difficulty === 'Easy') user.stats.easySolved += 1;
    else if (problem.difficulty === 'Medium') user.stats.mediumSolved += 1;
    else if (problem.difficulty === 'Hard') user.stats.hardSolved += 1;

    await user.save();
  }
}

module.exports = router;
