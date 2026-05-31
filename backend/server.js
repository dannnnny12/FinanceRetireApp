require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/assets', require('./routes/assets'));
app.use('/liabilities', require('./routes/liabilities'));
app.use('/dashboard', require('./routes/dashboard'));

// Zod / 任何錯誤統一處理
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() =>
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 http://0.0.0.0:${PORT}`))
);
