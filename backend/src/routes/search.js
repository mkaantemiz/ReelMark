const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';

function tmdbGet(endpoint, params = {}) {
    return axios.get(`${TMDB_BASE}${endpoint}`, {
        params: {
            api_key: process.env.TMDB_API_KEY,
            language: 'tr-TR',
            ...params,
        },
    });
}

router.get('/', async (req, res) => {
    const { q, type } = req.query;
    if (!q) return res.status(400).json({ error: 'Arama terimi gerekli' });

    try {
        const endpoint = type === 'tv'
            ? '/search/tv'
            : type === 'movie'
                ? '/search/movie'
                : '/search/multi';

        const response = await tmdbGet(endpoint, { query: q, page: 1 });

        const results = response.data.results
            .filter(item => item.media_type !== 'person')
            .map(item => ({
                tmdb_id: item.id,
                type: item.media_type || type,
                title: item.title || item.name,
                original_title: item.original_title || item.original_name,
                poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
                backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
                overview: item.overview,
                release_date: item.release_date || item.first_air_date,
                vote_average: item.vote_average,
            }));

        res.json({ results });
    } catch (err) {
        console.error('TMDB Arama hatası:', err.response?.status, err.message);
        res.status(500).json({ error: 'TMDB API hatası', detail: err.response?.data });
    }
});

module.exports = router;
module.exports.tmdbGet = tmdbGet;
