const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';

function tmdbGet(endpoint, params = {}) {
    return axios.get(`${TMDB_BASE}${endpoint}`, {
        params: { api_key: process.env.TMDB_API_KEY, language: 'tr-TR', ...params },
    });
}

// Film veya dizi detayı — kütüphaneye eklemeden görüntüleme
router.get('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    if (!['movie', 'tv'].includes(type))
        return res.status(400).json({ error: 'type movie veya tv olmalı' });

    try {
        const [detail, credits, videos] = await Promise.all([
            tmdbGet(`/${type}/${id}`, { append_to_response: 'external_ids' }),
            tmdbGet(`/${type}/${id}/credits`),
            tmdbGet(`/${type}/${id}/videos`),
        ]);

        const d = detail.data;
        const trailer = videos.data.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        const cast = credits.data.cast?.slice(0, 10).map(c => ({
            name: c.name,
            character: c.character,
            profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
        }));

        res.json({
            tmdb_id: d.id,
            type,
            title: d.title || d.name,
            original_title: d.original_title || d.original_name,
            poster_path: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
            backdrop_path: d.backdrop_path ? `https://image.tmdb.org/t/p/w1280${d.backdrop_path}` : null,
            overview: d.overview,
            release_date: d.release_date || d.first_air_date,
            vote_average: d.vote_average,
            genres: d.genres?.map(g => g.name) || [],
            total_seasons: d.number_of_seasons || null,
            total_episodes: d.number_of_episodes || null,
            runtime: d.runtime || null,
            status: d.status,
            trailer_key: trailer?.key || null,
            cast,
        });
    } catch (err) {
        console.error('TMDB detay hatası:', err.response?.status, err.message);
        res.status(err.response?.status || 500).json({ error: 'TMDB detayı alınamadı' });
    }
});

module.exports = router;
