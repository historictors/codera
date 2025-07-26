const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'cpp', 'java']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded', 'compilation_error'],
    default: 'pending'
  },
  testResults: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    executionTime: Number,
    memory: Number
  }],
  executionTime: Number,
  memory: Number,
  score: { type: Number, default: 0 },
  feedback: String,
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);