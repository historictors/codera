const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],
  starterCode: {
    javascript: String,
    python: String,
    cpp: String,
    java: String
  },
  solution: {
    code: String,
    explanation: String,
    timeComplexity: String,
    spaceComplexity: String
  },
  stats: {
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true }
}, {
  timestamps: true
});

problemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Problem', problemSchema);