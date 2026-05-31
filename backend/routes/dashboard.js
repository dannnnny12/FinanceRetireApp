const router = require('express').Router();
const Asset = require('../models/Asset');
const Liability = require('../models/Liability');
const User = require('../models/User');

router.get('/', async (_req, res, next) => {
  try {
    const userId = 'demo-user';
    const [assets, liabilities, user] = await Promise.all([
      Asset.find({ userId }),
      Liability.find({ userId }),
      User.findOneAndUpdate({ _id: userId }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }),
    ]);

    const totalAssets = assets.reduce((s, a) => s + a.quantity * a.price, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.amount, 0);
    const netWorth = totalAssets - totalLiabilities;
    const goal = user.retirementGoal || 0;
    const progress = goal > 0 ? Math.max(0, Math.min(1, netWorth / goal)) : 0;

    // 資產配置（給未來圓餅圖用）
    const allocation = assets.reduce((acc, a) => {
      const v = a.quantity * a.price;
      acc[a.type] = (acc[a.type] || 0) + v;
      return acc;
    }, {});

    res.json({
      totalAssets,
      totalLiabilities,
      netWorth,
      retirementGoal: goal,
      progress,            // 0~1
      progressPercent: +(progress * 100).toFixed(2),
      allocation,
      counts: { assets: assets.length, liabilities: liabilities.length },
    });
  } catch (e) { next(e); }
});

router.put('/goal', async (req, res, next) => {
  try {
    const goal = Number(req.body.retirementGoal);
    if (!Number.isFinite(goal) || goal < 0) return res.status(400).json({ error: 'Invalid goal' });
    const user = await User.findOneAndUpdate(
      { _id: 'demo-user' }, { retirementGoal: goal },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(user);
  } catch (e) { next(e); }
});

module.exports = router;
