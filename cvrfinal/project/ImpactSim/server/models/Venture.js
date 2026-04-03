const mongoose = require('mongoose');

const ventureSchema = new mongoose.Schema({
  track: { type: String, required: true },
  mission: { type: String, required: true },
  founderStyle: { type: String, required: true },
  credits: { type: Number, default: 5000 },
  socialCapital: { type: Number, default: 100 },
  communityTrust: { type: Number, default: 50 },
  burnRate: { type: Number, default: 200 },
  impactScore: { type: Number, default: 0 },
  quarter: { type: Number, default: 1 },
  week: { type: Number, default: 1 },
  isGameOver: { type: Boolean, default: false },
  history: [{
    turn: Number,
    scenarioTitle: String,
    choiceMade: String,
    impacts: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true });

module.exports = mongoose.model('Venture', ventureSchema);
