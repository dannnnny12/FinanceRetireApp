const router = require('express').Router();
const { z } = require('zod');
const Asset = require('../models/Asset');

const AssetInput = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(['stock', 'etf', 'bond', 'cash', 'deposit', 'crypto', 'other']),
  symbol: z.string().trim().max(20).optional(),
  quantity: z.number().nonnegative(),
  price: z.number().nonnegative(),
  currency: z.string().default('USD'),
});

router.get('/', async (_req, res, next) => {
  try { res.json(await Asset.find({ userId: 'demo-user' }).sort('-createdAt')); }
  catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = AssetInput.parse(req.body);
    const created = await Asset.create({ ...data, userId: 'demo-user' });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = AssetInput.partial().parse(req.body);
    const updated = await Asset.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
