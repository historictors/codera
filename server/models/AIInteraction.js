const mongoose = require('mongoose');

const aiInteractionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['code_review', 'roadmap', 'hint', 'explanation', 'debug_help'],
    required: true
  },
  context: {
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    code: String,
    language: String,
    error: String,
    userLevel: String,
    goals: [String]
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  feedback: {
    helpful: Boolean,
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  },
  tokens_used: Number,
  response_time: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('AIInteraction', aiInteractionSchema);