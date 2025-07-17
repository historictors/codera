const mongoose = require('mongoose');

const arenaMatchSchema = new mongoose.Schema({
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
    status: { type: String, enum: ['waiting', 'coding', 'submitted', 'finished'], default: 'waiting' },
    submittedAt: Date,
    score: { type: Number, default: 0 },
    testsPassed: { type: Number, default: 0 }
  }],
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'finished', 'cancelled'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startTime: Date,
  endTime: Date,
  duration: { type: Number, default: 1800 }, // 30 minutes in seconds
  chatMessages: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isRanked: { type: Boolean, default: true },
  roomId: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArenaMatch', arenaMatchSchema);