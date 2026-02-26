const express = require('express');
const db = require('../db/database');
const axios = require('axios');
const router = express.Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';
function tmdbGet(endpoint, params = {}) {
    return axios.get(`${TMDB_BASE}${endpoint}`, {
        params: { api_key: process.env.TMDB_API_KEY, language: 'tr-TR', ...params },
    });
}

// Tüm kütüphane (kullanıcıya ait)
router.get('/', (req, res) => {
    const { status } = req.query;
    const uid = req.user.id;
    const items = status
        ? db.prepare('SELECT * FROM media_items WHERE user_id = ? AND status = ? ORDER BY updated_at DESC').all(uid, status)
        : db.prepare('SELECT * FROM media_items WHERE user_id = ? ORDER BY updated_at DESC').all(uid);
    res.json({ items });
});

// Devam edilenler
router.get('/continue', (req, res) => {
    const items = db.prepare("SELECT * FROM media_items WHERE user_id = ? AND type = 'tv' AND status = 'watching' ORDER BY updated_at DESC").all(req.user.id);
    res.json({ items });
});

// İstatistikler
router.get('/stats', (req, res) => {
    const uid = req.user.id;
    const total = db.prepare('SELECT COUNT(*) as c FROM media_items WHERE user_id = ?').get(uid).c;
    const watching = db.prepare("SELECT COUNT(*) as c FROM media_items WHERE user_id = ? AND status = 'watching'").get(uid).c;
    const watched = db.prepare("SELECT COUNT(*) as c FROM media_items WHERE user_id = ? AND status = 'watched'").get(uid).c;
    const watchlist = db.prepare("SELECT COUNT(*) as c FROM media_items WHERE user_id = ? AND status = 'watchlist'").get(uid).c;
    res.json({ total, watching, watched, watchlist });
});

// Tek içerik
router.get('/:id', (req, res) => {
    const item = db.prepare('SELECT * FROM media_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Bulunamadı' });
    res.json({ item });
});

// Kütüphaneye ekle
router.post('/', async (req, res) => {
    const { tmdb_id, type, title, original_title, poster_path, backdrop_path, overview, release_date, vote_average, status = 'watchlist' } = req.body;
    if (!tmdb_id || !type || !title) return res.status(400).json({ error: 'tmdb_id, type ve title zorunlu' });

    const existing = db.prepare('SELECT id FROM media_items WHERE user_id = ? AND tmdb_id = ? AND type = ?').get(req.user.id, tmdb_id, type);
    if (existing) return res.status(409).json({ error: 'Bu içerik zaten kütüphanende var', id: existing.id });

    let total_seasons = null, genres = null;
    try {
        const endpoint = type === 'tv' ? `/tv/${tmdb_id}` : `/movie/${tmdb_id}`;
        const detail = await tmdbGet(endpoint);
        total_seasons = detail.data.number_of_seasons || null;
        genres = JSON.stringify(detail.data.genres?.map(g => g.name) || []);
    } catch (_) { }

    const result = db.prepare(`
    INSERT INTO media_items (user_id, tmdb_id, type, title, original_title, poster_path, backdrop_path, overview, release_date, vote_average, total_seasons, genres, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, tmdb_id, type, title, original_title, poster_path, backdrop_path, overview, release_date, vote_average, total_seasons, genres, status);

    const newItem = db.prepare('SELECT * FROM media_items WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ item: newItem });
});

// Güncelle (status, rating, watch_link)
router.patch('/:id', (req, res) => {
    const { status, user_rating, watch_link } = req.body;
    const item = db.prepare('SELECT * FROM media_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Bulunamadı' });

    db.prepare(`
    UPDATE media_items SET
      status = COALESCE(?, status),
      user_rating = CASE WHEN ? IS NOT NULL THEN ? ELSE user_rating END,
      watch_link = CASE WHEN ? IS NOT NULL THEN ? ELSE watch_link END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(
        status ?? null,
        user_rating !== undefined ? 1 : null, user_rating ?? null,
        watch_link !== undefined ? 1 : null, watch_link ?? null,
        req.params.id, req.user.id
    );

    const updated = db.prepare('SELECT * FROM media_items WHERE id = ?').get(req.params.id);
    res.json({ item: updated });
});

// Sil
router.delete('/:id', (req, res) => {
    const result = db.prepare('DELETE FROM media_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Bulunamadı' });
    res.json({ success: true });
});

module.exports = router;
