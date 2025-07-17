const express = require('express');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new contest (teachers only)
router.post('/create', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create contests' });
    }

    const {
      title,
      description,
      problems,
      startTime,
      duration,
      settings
    } = req.body;

    const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

    const contest = new Contest({
      title,
      description,
      creator: req.user.userId,
      problems: problems.map((p, index) => ({
        problem: p.problemId,
        points: p.points || 100,
        order: index + 1
      })),
      startTime: new Date(startTime),
      endTime,
      duration,
      settings: settings || {}
    });

    await contest.save();
    await contest.populate('creator', 'username email');
    await contest.populate('problems.problem', 'title difficulty');

    res.status(201).json({
      message: 'Contest created successfully',
      contest
    });
  } catch (error) {
    console.error('Create contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contests
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (!status) {
      // Update contest statuses
      const contests = await Contest.find({});
      for (const contest of contests) {
        contest.updateStatus();
        await contest.save();
      }
    }

    const contests = await Contest.find(query)
      .populate('creator', 'username')
      .populate('problems.problem', 'title difficulty')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contest.countDocuments(query);

    res.json({
      contests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single contest
router.get('/:contestId', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId)
      .populate('creator', 'username email teacherProfile')
      .populate('problems.problem', 'title description difficulty examples constraints starterCode')
      .populate('participants.user', 'username avatar')
      .populate('leaderboard.user', 'username avatar');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    contest.updateStatus();
    await contest.save();

    res.json({ contest });
  } catch (error) {
    console.error('Get contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join contest
router.post('/:contestId/join', auth, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    contest.updateStatus();

    if (contest.status === 'finished') {
      return res.status(400).json({ message: 'Contest has ended' });
    }

    // Check if already joined
    const alreadyJoined = contest.participants.some(
      p => p.user.toString() === req.user.userId
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this contest' });
    }

    // Check max participants
    if (contest.settings.maxParticipants && 
        contest.participants.length >= contest.settings.maxParticipants) {
      return res.status(400).json({ message: 'Contest is full' });
    }

    contest.participants.push({
      user: req.user.userId,
      joinedAt: new Date()
    });

    await contest.save();

    res.json({ message: 'Successfully joined contest' });
  } catch (error) {
    console.error('Join contest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit solution in contest
router.post('/:contestId/submit', auth, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    contest.updateStatus();

    if (contest.status !== 'active') {
      return res.status(400).json({ message: 'Contest is not active' });
    }

    // Check if user is participant
    const participant = contest.participants.find(
      p => p.user.toString() === req.user.userId
    );

    if (!participant) {
      return res.status(403).json({ message: 'Not a participant in this contest' });
    }

    // Create submission (reuse existing submission logic)
    const submission = new Submission({
      user: req.user.userId,
      problem: problemId,
      code,
      language,
      contest: contest._id
    });

    // Here you would integrate with Judge0 API (similar to existing submission route)
    // For now, we'll simulate a result
    submission.status = 'accepted'; // This would come from Judge0
    submission.score = 100; // This would be calculated based on test results

    await submission.save();

    // Update participant's submission
    const existingSubmission = participant.submissions.find(
      s => s.problem.toString() === problemId
    );

    const timeTaken = Math.floor((new Date() - contest.startTime) / 1000);

    if (existingSubmission) {
      existingSubmission.submission = submission._id;
      existingSubmission.score = submission.score;
      existingSubmission.submittedAt = new Date();
      existingSubmission.timeTaken = timeTaken;
    } else {
      participant.submissions.push({
        problem: problemId,
        submission: submission._id,
        score: submission.score,
        submittedAt: new Date(),
        timeTaken
      });
    }

    // Recalculate total score
    participant.totalScore = participant.submissions.reduce((sum, s) => sum + (s.score || 0), 0);

    // Update leaderboard
    updateLeaderboard(contest);

    await contest.save();

    res.json({
      message: 'Solution submitted successfully',
      submission: {
        id: submission._id,
        status: submission.status,
        score: submission.score
      }
    });
  } catch (error) {
    console.error('Contest submit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get contest leaderboard
router.get('/:contestId/leaderboard', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId)
      .populate('participants.user', 'username avatar')
      .populate('leaderboard.user', 'username avatar');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Sort participants by score and time
    const leaderboard = contest.participants
      .filter(p => p.submissions.length > 0)
      .map(p => ({
        user: p.user,
        totalScore: p.totalScore,
        submissions: p.submissions.length,
        lastSubmission: p.submissions.length > 0 
          ? Math.max(...p.submissions.map(s => new Date(s.submittedAt).getTime()))
          : null
      }))
      .sort((a, b) => {
        if (a.totalScore !== b.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return (a.lastSubmission || 0) - (b.lastSubmission || 0);
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add announcement (teachers only)
router.post('/:contestId/announce', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (contest.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only contest creator can make announcements' });
    }

    contest.announcements.push({
      message,
      author: req.user.userId,
      timestamp: new Date()
    });

    await contest.save();

    res.json({ message: 'Announcement added successfully' });
  } catch (error) {
    console.error('Add announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update leaderboard
function updateLeaderboard(contest) {
  const leaderboard = contest.participants
    .filter(p => p.submissions.length > 0)
    .map(p => ({
      user: p.user,
      score: p.totalScore,
      submissions: p.submissions.length,
      lastSubmission: p.submissions.length > 0 
        ? Math.max(...p.submissions.map(s => new Date(s.submittedAt).getTime()))
        : null
    }))
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return (a.lastSubmission || 0) - (b.lastSubmission || 0);
    })
    .map((entry, index) => ({
      user: entry.user,
      score: entry.score,
      rank: index + 1,
      submissions: entry.submissions,
      lastSubmission: entry.lastSubmission ? new Date(entry.lastSubmission) : null
    }));

  contest.leaderboard = leaderboard;
}

module.exports = router;