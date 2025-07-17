const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problems: [{
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    points: { type: Number, default: 100 },
    order: Number
  }],
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    submissions: [{
      problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
      submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
      score: Number,
      submittedAt: Date,
      timeTaken: Number // in seconds
    }],
    totalScore: { type: Number, default: 0 },
    rank: Number,
    finished: { type: Boolean, default: false }
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'finished', 'cancelled'],
    default: 'upcoming'
  },
  settings: {
    isPublic: { type: Boolean, default: true },
    allowLateSubmissions: { type: Boolean, default: false },
    showLeaderboard: { type: Boolean, default: true },
    maxParticipants: Number,
    requireApproval: { type: Boolean, default: false }
  },
  leaderboard: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number,
    rank: Number,
    submissions: Number,
    lastSubmission: Date
  }],
  announcements: [{
    message: String,
    timestamp: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  inviteCode: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate invite code before saving
contestSchema.pre('save', function(next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Update contest status based on time
contestSchema.methods.updateStatus = function() {
  const now = new Date();
  if (now < this.startTime) {
    this.status = 'upcoming';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'active';
  } else {
    this.status = 'finished';
  }
};

module.exports = mongoose.model('Contest', contestSchema);