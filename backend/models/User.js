const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'demo-user' }, // MVP 先寫死
    retirementGoal: { type: Number, default: 1_000_000 },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('User', UserSchema);
