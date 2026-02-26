import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: 'watchlist', label: '📋 İzlenecek', class: 'badge-watchlist' },
    { value: 'watching', label: '▶️ İzliyorum', class: 'badge-watching' },
    { value: 'watched', label: '✅ İzledim', class: 'badge-watched' },
];

export default function Detail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [progressing, setProgressing] = useState(false);
    const [watchLink, setWatchLink] = useState('');
    const [manualSeason, setManualSeason] = useState('');
    const [manualEpisode, setManualEpisode] = useState('');

    useEffect(() => {
        axios.get(`/api/library/${id}`)
            .then(({ data }) => {
                setItem(data.item);
                setWatchLink(data.item.watch_link || '');
                setManualSeason(data.item.current_season || 1);
                setManualEpisode(data.item.current_episode || 1);
            })
            .catch(() => { toast.error('İçerik bulunamadı'); navigate('/library'); })
            .finally(() => setLoading(false));
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await axios.patch(`/api/library/${id}`, {
                watch_link: watchLink || null,
            });
            setItem(data.item);
            toast.success('Kaydedildi ✓');
        } catch { toast.error('Kaydedilemedi'); }
        finally { setSaving(false); }
    };

    const handleStatusChange = async (status) => {
        try {
            const { data } = await axios.patch(`/api/library/${id}`, { status });
            setItem(data.item);
            toast.success('Durum güncellendi');
        } catch { toast.error('Hata oluştu'); }
    };

    const handleProgress = async (action, overrides = {}) => {
        setProgressing(true);
        try {
            const { data } = await axios.patch(`/api/library/${id}/progress`, { action, ...overrides });
            setItem(data.item);
            setManualSeason(data.item.current_season);
            setManualEpisode(data.item.current_episode);
            if (action === 'next') toast.success(`⏩ S${data.item.current_season}E${data.item.current_episode}`);
            else if (action === 'prev') toast.success(`⏪ S${data.item.current_season}E${data.item.current_episode}`);
            else toast.success(`✅ S${data.item.current_season}E${data.item.current_episode} kaydedildi`);
        } catch { toast.error('Güncellenemedi'); }
        finally { setProgressing(false); }
    };

    const handleManualSet = () => {
        const s = parseInt(manualSeason);
        const e = parseInt(manualEpisode);
        if (!s || s < 1 || !e || e < 1) { toast.error('Geçerli bir sezon/bölüm gir'); return; }
        handleProgress('set', { current_season: s, current_episode: e });
    };

    const handleDelete = async () => {
        if (!window.confirm('Kütüphaneden kaldırmak istiyor musun?')) return;
        await axios.delete(`/api/library/${id}`);
        toast.success('Kaldırıldı');
        navigate('/library');
    };

    if (loading) return (
        <div className="page-container">
            <div className="animate-pulse space-y-6">
                <div className="h-64 rounded-2xl skeleton" />
                <div className="h-8 w-48 skeleton" />
                <div className="h-4 w-full skeleton" />
            </div>
        </div>
    );

    if (!item) return null;

    const genres = item.genres ? JSON.parse(item.genres) : [];
    const statusInfo = STATUS_OPTIONS.find(s => s.value === item.status);

    return (
        <div className="page-container">
            {/* Back */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                ← Geri
            </button>

            {/* Hero section */}
            <div className="relative rounded-2xl overflow-hidden mb-8" style={{ minHeight: '300px' }}>
                {item.backdrop_path ? (
                    <img src={item.backdrop_path} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                ) : (
                    <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #e50914, #7c3aed)' }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/80 to-transparent" />
                <div className="relative p-8 flex gap-6 items-start">
                    {/* Poster */}
                    <div className="hidden sm:block flex-shrink-0 w-36 rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '2/3' }}>
                        {item.poster_path ? (
                            <img src={item.poster_path} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-dark-700 flex items-center justify-center text-4xl">
                                {item.type === 'tv' ? '📺' : '🎬'}
                            </div>
                        )}
                    </div>
                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={item.type === 'tv' ? 'badge-tv badge' : 'badge-movie badge'}>
                                {item.type === 'tv' ? '📺 Dizi' : '🎬 Film'}
                            </span>
                            <span className={statusInfo?.class || 'badge'}>{statusInfo?.label}</span>
                            {item.vote_average > 0 && (
                                <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    ⭐ {item.vote_average?.toFixed(1)} TMDB
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{item.title}</h1>
                        {item.original_title !== item.title && (
                            <p className="text-gray-500 mb-3 italic">{item.original_title}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
                            {item.release_date && <span>📅 {item.release_date.slice(0, 4)}</span>}
                            {item.total_seasons && <span>🎞 {item.total_seasons} Sezon</span>}
                        </div>
                        {genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {genres.map(g => (
                                    <span key={g} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300">{g}</span>
                                ))}
                            </div>
                        )}
                        {item.overview && (
                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{item.overview}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Controls */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status */}
                    <div className="glass rounded-xl p-5">
                        <h3 className="font-bold mb-4 text-gray-300">📌 İzleme Durumu</h3>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map(s => (
                                <button key={s.value} onClick={() => handleStatusChange(s.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${item.status === s.value
                                        ? 'text-white'
                                        : 'glass text-gray-400 hover:text-white'
                                        }`}
                                    style={item.status === s.value ? { background: 'linear-gradient(135deg,#e50914,#7c3aed)', boxShadow: '0 4px 15px rgba(229,9,20,0.3)' } : {}}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* İzleme Linki */}
                    <div className="glass rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-300">🍿 İzleme Linki</h3>
                            {item.watch_link && (
                                <a href={item.watch_link} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-full transition-colors font-bold">▶ Git</a>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Bu içeriği nereden izlediğini kaydet (örn: netflix, dizi sitesi vs.)</p>
                        <input
                            type="url"
                            className="input-field mb-4"
                            placeholder="https://..."
                            value={watchLink}
                            onChange={e => setWatchLink(e.target.value)}
                        />
                        <button onClick={handleSave} disabled={saving} className="btn-secondary w-full">
                            {saving ? '⏳ Kaydediliyor...' : '💾 Linki Kaydet'}
                        </button>
                    </div>

                    {/* ─── Bölüm Takibi (sadece dizi) ─── */}
                    {item.type === 'tv' && (
                        <div className="glass rounded-xl p-5">
                            <h3 className="font-bold mb-5 text-gray-300">📺 Bölüm İlerlemesi</h3>

                            {/* Mevcut konum */}
                            <div className="flex items-center justify-center gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-4xl font-black text-gradient">S{item.current_season}</div>
                                    <div className="text-xs text-gray-500 mt-1">Sezon</div>
                                </div>
                                <div className="text-3xl text-gray-600">·</div>
                                <div className="text-center">
                                    <div className="text-4xl font-black text-gradient">E{item.current_episode}</div>
                                    <div className="text-xs text-gray-500 mt-1">Bölüm</div>
                                </div>
                                {item.total_seasons && (
                                    <>
                                        <div className="text-2xl text-gray-700">/</div>
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-gray-600">{item.total_seasons}</div>
                                            <div className="text-xs text-gray-500 mt-1">Top. Sezon</div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* İleri / Geri butonları */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <button
                                    onClick={() => handleProgress('prev')}
                                    disabled={progressing || (item.current_season <= 1 && item.current_episode <= 1)}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    ⏪ Önceki Bölüm
                                </button>
                                <button
                                    onClick={() => handleProgress('next')}
                                    disabled={progressing}
                                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg,#e50914,#c1070f)', boxShadow: '0 4px 15px rgba(229,9,20,0.3)' }}
                                >
                                    {progressing ? <span className="animate-spin">⏳</span> : '⏩ Sonraki Bölüm'}
                                </button>
                            </div>

                            {/* Manuel giriş */}
                            <div className="border-t border-white/5 pt-5">
                                <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Manuel Konum Ayarla</p>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1.5 block">Sezon</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={item.total_seasons || 99}
                                            className="input-field text-center text-lg font-bold py-2"
                                            value={manualSeason}
                                            onChange={e => setManualSeason(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleManualSet()}
                                        />
                                    </div>
                                    <div className="text-gray-600 pb-2.5 text-lg">×</div>
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 mb-1.5 block">Bölüm</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className="input-field text-center text-lg font-bold py-2"
                                            value={manualEpisode}
                                            onChange={e => setManualEpisode(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleManualSet()}
                                        />
                                    </div>
                                    <button
                                        onClick={handleManualSet}
                                        disabled={progressing}
                                        className="btn-secondary whitespace-nowrap"
                                        style={{ paddingTop: '10px', paddingBottom: '10px' }}
                                    >
                                        ✓ Ayarla
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Quick info */}
                <div className="space-y-4">
                    <div className="glass rounded-xl p-5">
                        <h3 className="font-bold mb-4 text-gray-300">📊 Bilgiler</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between"><dt className="text-gray-500">Tür</dt><dd>{item.type === 'tv' ? '📺 Dizi' : '🎬 Film'}</dd></div>
                            {item.release_date && <div className="flex justify-between"><dt className="text-gray-500">Yıl</dt><dd>{item.release_date.slice(0, 4)}</dd></div>}
                            {item.total_seasons && <div className="flex justify-between"><dt className="text-gray-500">Toplam Sezon</dt><dd>{item.total_seasons}</dd></div>}
                            {item.vote_average > 0 && <div className="flex justify-between"><dt className="text-gray-500">TMDB Puanı</dt><dd>⭐ {item.vote_average?.toFixed(1)}</dd></div>}
                            <div className="flex justify-between"><dt className="text-gray-500">Eklenme</dt><dd>{new Date(item.created_at).toLocaleDateString('tr-TR')}</dd></div>
                        </dl>
                    </div>

                    <button onClick={handleDelete} className="w-full py-3 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all duration-200">
                        🗑 Kütüphaneden Kaldır
                    </button>
                </div>
            </div>
        </div>
    );
}
