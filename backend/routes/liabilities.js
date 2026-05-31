const router = require('express').Router();
const { z } = require('zod');
const Liability = require('../models/Liability');

const Input = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(['mortgage', 'car_loan', 'credit_card', 'student_loan', 'other']),
  amount: z.number().nonnegative(),
  interestRate: z.number().min(0).max(100).default(0),
  currency: z.string().default('USD'),
});

router.get('/', async (_req, res, next) => {
  try { res.json(await Liability.find({ userId: 'demo-user' }).sort('-createdAt')); }
  catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const data = Input.parse(req.body);
    res.status(201).json(await Liability.create({ ...data, userId: 'demo-user' }));
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    const data = Input.partial().parse(req.body);
    const updated = await Liability.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try { await Liability.findByIdAndDelete(req.params.id); res.status(204).end(); }
  catch (e) { next(e); }
});

module.exports = router;
