const express = require('express');
const { v4: uuidv4 } = require('uuid');
const ArenaMatch = require('../models/ArenaMatch');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create new arena match
router.post('/create', auth, async (req, res) => {
  try {
    const { difficulty = 'Medium', isPrivate = false } = req.body;
    
    // Get random problem
    const problemCount = await Problem.countDocuments({
      difficulty,
      isPublic: true
    });

    const randomSkip = Math.floor(Math.random() * problemCount);
    const problem = await Problem.findOne({
      difficulty,
      isPublic: true
    }).skip(randomSkip);

    if (!problem) {
      return res.status(404).json({ message: 'No problems found for this difficulty' });
    }

    // Create match
    const match = new ArenaMatch({
      players: [{
        user: req.user.userId,
        status: 'waiting'
      }],
      problem: problem._id,
      roomId: uuidv4(),
      status: 'waiting',
      duration: 1800 // 30 minutes
    });

    await match.save();
    await match.populate('players.user', 'username avatar stats');
    await match.populate('problem', 'title description difficulty examples constraints starterCode');

    res.json({
      match: {
        id: match._id,
        roomId: match.roomId,
        players: match.players,
        problem: match.problem,
        status: match.status,
        duration: match.duration
      }
    });
  } catch (error) {
    console.error('Create arena match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join arena match
router.post('/join/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    const match = await ArenaMatch.findOne({ roomId, status: 'waiting' });
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found or already started' });
    }

    // Check if user is already in match
    const isAlreadyInMatch = match.players.some(
      player => player.user.toString() === userId
    );

    if (isAlreadyInMatch) {
      return res.status(400).json({ message: 'Already in this match' });
    }

    // Check if match is full
    if (match.players.length >= 2) {
      return res.status(400).json({ message: 'Match is full' });
    }

    // Add player to match
    match.players.push({
      user: userId,
      status: 'waiting'
    });

    // Start match if 2 players
    if (match.players.length === 2) {
      match.status = 'active';
      match.startTime = new Date();
      
      // Update player status
      match.players.forEach(player => {
        player.status = 'coding';
      });
    }

    await match.save();
    await match.populate('players.user', 'username avatar stats');
    await match.populate('problem', 'title description difficulty examples constraints starterCode');

    res.json({
      match: {
        id: match._id,
        roomId: match.roomId,
        players: match.players,
        problem: match.problem,
        status: match.status,
        startTime: match.startTime,
        duration: match.duration
      }
    });
  } catch (error) {
    console.error('Join arena match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get match details
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const match = await ArenaMatch.findOne({ roomId })
      .populate('players.user', 'username avatar stats')
      .populate('problem', 'title description difficulty examples constraints starterCode')
      .populate('winner', 'username avatar stats');

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Check if user is in match
    const isInMatch = match.players.some(
      player => player.user._id.toString() === req.user.userId
    );

    if (!isInMatch) {
      return res.status(403).json({ message: 'Not authorized to view this match' });
    }

    res.json({ match });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find random opponent
router.post('/find-opponent', auth, async (req, res) => {
  try {
    const { difficulty = 'Medium' } = req.body;
    const userId = req.user.userId;

    // Look for waiting matches
    const waitingMatch = await ArenaMatch.findOne({
      status: 'waiting',
      'players.user': { $ne: userId },
      'players.1': { $exists: false } // Only one player
    })
      .populate('players.user', 'username avatar stats')
      .populate('problem', 'title description difficulty examples constraints starterCode');

    if (waitingMatch) {
      // Join existing match
      waitingMatch.players.push({
        user: userId,
        status: 'coding'
      });

      waitingMatch.status = 'active';
      waitingMatch.startTime = new Date();
      waitingMatch.players[0].status = 'coding';

      await waitingMatch.save();
      await waitingMatch.populate('players.user', 'username avatar stats');

      return res.json({
        match: {
          id: waitingMatch._id,
          roomId: waitingMatch.roomId,
          players: waitingMatch.players,
          problem: waitingMatch.problem,
          status: waitingMatch.status,
          startTime: waitingMatch.startTime,
          duration: waitingMatch.duration
        }
      });
    }

    // Create new match if no waiting matches
    const problemCount = await Problem.countDocuments({
      difficulty,
      isPublic: true
    });

    const randomSkip = Math.floor(Math.random() * problemCount);
    const problem = await Problem.findOne({
      difficulty,
      isPublic: true
    }).skip(randomSkip);

    if (!problem) {
      return res.status(404).json({ message: 'No problems found for this difficulty' });
    }

    const match = new ArenaMatch({
      players: [{
        user: userId,
        status: 'waiting'
      }],
      problem: problem._id,
      roomId: uuidv4(),
      status: 'waiting',
      duration: 1800
    });

    await match.save();
    await match.populate('players.user', 'username avatar stats');
    await match.populate('problem', 'title description difficulty examples constraints starterCode');

    res.json({
      match: {
        id: match._id,
        roomId: match.roomId,
        players: match.players,
        problem: match.problem,
        status: match.status,
        duration: match.duration
      }
    });
  } catch (error) {
    console.error('Find opponent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;