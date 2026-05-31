const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'demo-user', index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    type: {
      type: String,
      enum: ['stock', 'etf', 'bond', 'cash', 'deposit', 'crypto', 'other'],
      required: true,
    },
    symbol: { type: String, trim: true, uppercase: true }, // e.g. AAPL, 0050.TW
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 }, // 單位市價
    currency: { type: String, default: 'USD' },
    lastPriceUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AssetSchema.virtual('value').get(function () {
  return this.quantity * this.price;
});
AssetSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Asset', AssetSchema);
