require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Public route — auth gerektirmez
const authRouter = require('./src/routes/auth');
app.use('/api/auth', authRouter);

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
  res.json({ message: '🎬 CineTrack API çalışıyor!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
