require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const { runAutoComplete } = require('./utils/autoComplete');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://vivalogistics.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// CRON JOB: Auto-complete bookings — runs daily at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[Cron] Running auto-complete job...');
  try {
    const result = await runAutoComplete();
    console.log('[Cron] Auto-complete job finished:', result);
  } catch (error) {
    console.error('[Cron] Auto-complete job failed:', error);
  }
});

// Dev: run on startup
if (process.env.NODE_ENV === 'development') {
  console.log('[Dev] Running auto-complete check on startup...');
  runAutoComplete().catch(console.error);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚗 Viva Logistics API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});