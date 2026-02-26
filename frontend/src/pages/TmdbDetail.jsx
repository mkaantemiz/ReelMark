import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TmdbDetail() {
    const { type, tmdbId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(null);

    useEffect(() => {
        axios.get(`/api/tmdb/${type}/${tmdbId}`)
            .then(({ data }) => setDetail(data))
            .catch(() => { toast.error('Detay alınamadı'); navigate(-1); })
            .finally(() => setLoading(false));
    }, [type, tmdbId]);

    const handleAdd = async (status) => {
        setAdding(status);
        try {
            await axios.post('/api/library', {
                tmdb_id: detail.tmdb_id,
                type: detail.type,
                title: detail.title,
                original_title: detail.original_title,
                poster_path: detail.poster_path,
                backdrop_path: detail.backdrop_path,
                overview: detail.overview,
                release_date: detail.release_date,
                vote_average: detail.vote_average,
                status,
            });
            toast.success(`"${detail.title}" kütüphaneye eklendi! 🎉`);
        } catch (err) {
            if (err.response?.status === 409)
                toast('Zaten kütüphanende var', { icon: 'ℹ️' });
            else
                toast.error('Eklenemedi');
        } finally {
            setAdding(null);
        }
    };

    if (loading) return (
        <div className="page-container">
            <div className="animate-pulse space-y-6">
                <div className="h-72 rounded-2xl skeleton" />
                <div className="h-8 w-64 skeleton" />
                <div className="h-4 w-full skeleton" />
                <div className="h-4 w-3/4 skeleton" />
            </div>
        </div>
    );

    if (!detail) return null;

    return (
        <div className="page-container">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                ← Geri
            </button>

            {/* Hero */}
            <div className="relative rounded-2xl overflow-hidden mb-8" style={{ minHeight: '340px' }}>
                {detail.backdrop_path ? (
                    <img src={detail.backdrop_path} alt={detail.title} className="absolute inset-0 w-full h-full object-cover opacity-25" />
                ) : (
                    <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg,#e50914,#b20710)' }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/80 to-transparent" />

                <div className="relative p-8 flex gap-6 items-start">
                    {/* Poster */}
                    <div className="hidden sm:block flex-shrink-0 w-40 rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '2/3' }}>
                        {detail.poster_path
                            ? <img src={detail.poster_path} alt={detail.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-dark-700 flex items-center justify-center text-gray-500">
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                            </div>
                        }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={type === 'tv' ? 'badge badge-tv' : 'badge badge-movie'}>
                                {type === 'tv' ? 'Dizi' : 'Film'}
                            </span>
                            {detail.vote_average > 0 && (
                                <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    ⭐ {detail.vote_average.toFixed(1)} TMDB
                                </span>
                            )}
                            {detail.status && (
                                <span className="badge bg-white/10 text-gray-300 border border-white/10">{detail.status}</span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{detail.title}</h1>
                        {detail.original_title !== detail.title && (
                            <p className="text-gray-500 mb-2 italic text-sm">{detail.original_title}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                            {detail.release_date && <span>📅 {detail.release_date.slice(0, 4)}</span>}
                            {detail.total_seasons && <span>🎞 {detail.total_seasons} Sezon · {detail.total_episodes} Bölüm</span>}
                            {detail.runtime && <span>⏱ {detail.runtime} dk</span>}
                        </div>

                        {detail.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {detail.genres.map(g => (
                                    <span key={g} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300">{g}</span>
                                ))}
                            </div>
                        )}

                        {/* Kütüphaneye ekle butonları */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <button
                                onClick={() => handleAdd('watchlist')}
                                disabled={!!adding}
                                className="btn-secondary"
                            >
                                {adding === 'watchlist' ? '⏳' : '📋 İzleneceklere Ekle'}
                            </button>
                            <button
                                onClick={() => handleAdd('watching')}
                                disabled={!!adding}
                                className="btn-primary"
                            >
                                {adding === 'watching' ? '⏳' : '▶️ İzliyorum'}
                            </button>
                            <button
                                onClick={() => handleAdd('watched')}
                                disabled={!!adding}
                                className="btn-secondary"
                            >
                                {adding === 'watched' ? '⏳' : '✅ İzledim'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol: Özet + Fragman */}
                <div className="lg:col-span-2 space-y-6">
                    {detail.overview && (
                        <div className="glass rounded-xl p-5">
                            <h3 className="font-bold mb-3 text-gray-300">📖 Özet</h3>
                            <p className="text-gray-300 leading-relaxed">{detail.overview}</p>
                        </div>
                    )}

                    {detail.trailer_key && (
                        <div className="glass rounded-xl p-5">
                            <h3 className="font-bold mb-3 text-gray-300">🎥 Fragman</h3>
                            <div className="rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                <iframe
                                    src={`https://www.youtube.com/embed/${detail.trailer_key}`}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title="Fragman"
                                />
                            </div>
                        </div>
                    )}

                    {/* Oyuncular */}
                    {detail.cast?.length > 0 && (
                        <div className="glass rounded-xl p-5">
                            <h3 className="font-bold mb-4 text-gray-300">🎭 Oyuncular</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {detail.cast.map(actor => (
                                    <div key={actor.name} className="text-center">
                                        <div className="w-full rounded-xl overflow-hidden mb-2 bg-dark-700" style={{ aspectRatio: '1' }}>
                                            {actor.profile_path
                                                ? <img src={actor.profile_path} alt={actor.name} className="w-full h-full object-cover object-top" />
                                                : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                                            }
                                        </div>
                                        <p className="text-xs font-semibold text-white line-clamp-2">{actor.name}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{actor.character}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sağ: Bilgiler */}
                <div>
                    <div className="glass rounded-xl p-5">
                        <h3 className="font-bold mb-4 text-gray-300">📊 Bilgiler</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between"><dt className="text-gray-500">Tür</dt><dd>{type === 'tv' ? 'Dizi' : 'Film'}</dd></div>
                            {detail.release_date && <div className="flex justify-between"><dt className="text-gray-500">Yıl</dt><dd>{detail.release_date.slice(0, 4)}</dd></div>}
                            {detail.total_seasons && <div className="flex justify-between"><dt className="text-gray-500">Sezon</dt><dd>{detail.total_seasons}</dd></div>}
                            {detail.total_episodes && <div className="flex justify-between"><dt className="text-gray-500">Bölüm</dt><dd>{detail.total_episodes}</dd></div>}
                            {detail.runtime && <div className="flex justify-between"><dt className="text-gray-500">Süre</dt><dd>{detail.runtime} dk</dd></div>}
                            {detail.vote_average > 0 && <div className="flex justify-between"><dt className="text-gray-500">TMDB</dt><dd>⭐ {detail.vote_average.toFixed(1)}</dd></div>}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
