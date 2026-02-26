const express = require('express');
const db = require('../db/database');
const axios = require('axios');
const router = express.Router();
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function getSeasonEpisodeCount(tmdbId, season) {
  try {
    const res = await axios.get(`${TMDB_BASE}/tv/${tmdbId}/season/${season}`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'tr-TR' },
    });
    return res.data.episodes?.length || null;
  } catch { return null; }
}

router.patch('/:id/progress', async (req, res) => {
  const { current_season, current_episode, action } = req.body;
  const item = db.prepare('SELECT * FROM media_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ error: 'Bulunamadı' });
  if (item.type !== 'tv') return res.status(400).json({ error: 'Sadece diziler için geçerli' });

  let newSeason = item.current_season || 1;
  let newEpisode = item.current_episode || 1;

  if (action === 'next') {
    const totalEps = await getSeasonEpisodeCount(item.tmdb_id, newSeason);
    if (totalEps && newEpisode >= totalEps) {
      if (!item.total_seasons || newSeason < item.total_seasons) {
        newSeason++;
        newEpisode = 1;
      }
    } else {
      newEpisode++;
    }
  } else if (action === 'prev') {
    if (newEpisode > 1) {
      newEpisode--;
    } else if (newSeason > 1) {
      newSeason--;
      const prevSeasonEps = await getSeasonEpisodeCount(item.tmdb_id, newSeason);
      newEpisode = prevSeasonEps || 1;
    }
  } else {
    if (current_season !== undefined && current_season >= 1) newSeason = parseInt(current_season);
    if (current_episode !== undefined && current_episode >= 1) newEpisode = parseInt(current_episode);
  }

  db.prepare(`
    UPDATE media_items SET current_season = ?, current_episode = ?, status = 'watching', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `).run(newSeason, newEpisode, req.params.id, req.user.id);

  const updated = db.prepare('SELECT * FROM media_items WHERE id = ?').get(req.params.id);
  res.json({ item: updated });
});

module.exports = router;
