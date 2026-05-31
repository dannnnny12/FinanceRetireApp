const mongoose = require('mongoose');

const LiabilitySchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'demo-user', index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: ['mortgage', 'car_loan', 'credit_card', 'student_loan', 'other'], required: true },
    amount: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, default: 0 }, // 年利率 %
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Liability', LiabilitySchema);
