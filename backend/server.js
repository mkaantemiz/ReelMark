require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Güvenlik başlıkları ───────────────────────────────────────────────────
app.use(helmet());

// ─── CORS: sadece bilinen origin'lere izin ver ─────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    // origin null = aynı domain, Postman, curl vb.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Bu kaynağa izin verilmiyor'));
    }
  },
  credentials: true,
}));

// ─── Global rate limit: 15 dk içinde max 200 istek ─────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderildi, lütfen bekle.' },
});
app.use(globalLimiter);

// ─── Auth rate limit: brute-force koruması (15 dk içinde max 20 istek) ─────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla giriş denemesi, 15 dakika bekle.' },
});

app.use(express.json({ limit: '1mb' })); // Body boyutu sınırı

// Public route — auth gerektirmez
const authRouter = require('./src/routes/auth');
app.use('/api/auth', authLimiter, authRouter);

// Korumalı route'lar — JWT gerekir
const authMiddleware = require('./src/middleware/auth');
app.use('/api', authMiddleware);

const searchRouter = require('./src/routes/search');
const libraryRouter = require('./src/routes/library');
const progressRouter = require('./src/routes/progress');
const tmdbRouter = require('./src/routes/tmdb');

app.use('/api/search', searchRouter);
app.use('/api/library', libraryRouter);
app.use('/api/library', progressRouter);
app.use('/api/tmdb', tmdbRouter);

app.get('/', (req, res) => {
  res.json({ message: '🎬 ReelMark API çalışıyor!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
