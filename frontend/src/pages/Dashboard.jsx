import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STAT_CONFIG = [
    { key: 'total', label: 'Toplam', icon: '🎬', color: '#e50914', status: null },
    { key: 'watching', label: 'İzliyorum', icon: '▶️', color: '#7c3aed', status: 'watching' },
    { key: 'watched', label: 'İzlendi', icon: '✅', color: '#22c55e', status: 'watched' },
    { key: 'watchlist', label: 'İzlenecek', icon: '📋', color: '#f59e0b', status: 'watchlist' },
];

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, watching: 0, watched: 0, watchlist: 0 });
    const [continuing, setContinuing] = useState([]);
    const [activeFilter, setActiveFilter] = useState('total');
    const [filteredItems, setFilteredItems] = useState([]);
    const [filterLoading, setFilterLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get('/api/library/stats'),
            axios.get('/api/library/continue'),
            axios.get('/api/library')
        ]).then(([s, c, l]) => {
            setStats(s.data);
            setContinuing(c.data.items || []);
            setFilteredItems(l.data.items || []);
        }).catch(() => toast.error('Veriler yüklenemedi'))
            .finally(() => setLoading(false));
    }, []);

    const handleStatClick = async (stat) => {
        if (activeFilter === stat.key) { setActiveFilter(null); setFilteredItems([]); return; }
        setActiveFilter(stat.key);
        setFilterLoading(true);
        try {
            const url = stat.status ? `/api/library?status=${stat.status}` : '/api/library';
            const { data } = await axios.get(url);
            setFilteredItems(data.items || []);
        } catch { toast.error('Yüklenemedi'); }
        finally { setFilterLoading(false); }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-1">
                    Merhaba, <span className="text-gradient">{user}</span> 👋
                </h1>
                <p className="text-gray-500">Nerede kaldığını biz hatırlıyoruz.</p>
            </div>

            {/* Tıklanabilir İstatistikler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {STAT_CONFIG.map(stat => (
                    <button
                        key={stat.key}
                        onClick={() => handleStatClick(stat)}
                        className={`glass-hover rounded-xl p-5 text-left transition-all duration-300 border ${activeFilter === stat.key
                            ? 'border-white/30 scale-105'
                            : 'border-transparent hover:border-white/10'
                            }`}
                        style={activeFilter === stat.key ? {
                            background: `linear-gradient(135deg, ${stat.color}22, ${stat.color}11)`,
                            boxShadow: `0 0 20px ${stat.color}33`,
                        } : {}}
                    >
                        <div className="text-3xl mb-2">{stat.icon}</div>
                        <div className="text-3xl font-black" style={{ color: activeFilter === stat.key ? stat.color : 'white' }}>
                            {loading ? '–' : stats[stat.key]}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                        {activeFilter === stat.key && (
                            <div className="text-xs mt-2" style={{ color: stat.color }}>▲ Filtre aktif</div>
                        )}
                    </button>
                ))}
            </div>

            {/* Filtrelenmiş İçerikler */}
            {activeFilter && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">
                            {STAT_CONFIG.find(s => s.key === activeFilter)?.icon}{' '}
                            {STAT_CONFIG.find(s => s.key === activeFilter)?.label} ({filteredItems.length})
                        </h2>
                        <button onClick={() => { setActiveFilter(null); setFilteredItems([]); }}
                            className="text-xs text-gray-500 hover:text-white transition-colors">✕ Kapat</button>
                    </div>
                    {filterLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {[...Array(6)].map((_, i) => <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />)}
                        </div>
                    ) : filteredItems.length === 0 && stats.total > 0 ? (
                        <div className="glass rounded-xl p-8 text-center text-gray-500">Bu kategoride içerik yok</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {filteredItems.map(item => (
                                <div key={item.id}
                                    onClick={() => navigate(`/detail/${item.id}`)}
                                    className="group glass-hover rounded-xl overflow-hidden transition-transform hover:scale-105 cursor-pointer">
                                    <div className="relative" style={{ aspectRatio: '2/3' }}>
                                        {item.poster_path
                                            ? <img src={item.poster_path} alt={item.title} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full bg-dark-700 flex items-center justify-center text-3xl">
                                                {item.type === 'tv' ? '📺' : '🎬'}
                                            </div>
                                        }
                                        {item.type === 'tv' && item.status === 'watching' && (
                                            <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold px-2 py-1 rounded-lg"
                                                style={{ background: 'rgba(0,0,0,0.8)', color: '#7c3aed' }}>
                                                S{item.current_season}·E{item.current_episode}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2">
                                        <p className="text-xs font-semibold text-white line-clamp-2">{item.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Devam Edilenler */}
            {!activeFilter && continuing.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-white">▶️ Devam Et</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {continuing.slice(0, 6).map(item => (
                            <div key={item.id}
                                onClick={() => navigate(`/detail/${item.id}`)}
                                className="glass-hover rounded-xl overflow-hidden flex gap-4 p-3 group transition-transform hover:scale-[1.02] cursor-pointer">
                                <div className="flex-shrink-0 w-14 rounded-lg overflow-hidden" style={{ aspectRatio: '2/3' }}>
                                    {item.poster_path
                                        ? <img src={item.poster_path} alt={item.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-dark-700 flex items-center justify-center">📺</div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <p className="font-semibold text-white text-sm line-clamp-2">{item.title}</p>
                                    <p className="text-xs font-bold mt-1" style={{ color: '#7c3aed' }}>
                                        S{item.current_season} · E{item.current_episode}
                                    </p>
                                    {item.watch_link && (
                                        <a href={item.watch_link} target="_blank" rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="inline-block mt-2 text-xs px-3 py-1 rounded-full transition-all hover:opacity-80"
                                            style={{ background: 'linear-gradient(135deg,#e50914,#c1070f)', color: 'white' }}>
                                            ▶ İzle
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Boş durum */}
            {!loading && stats.total === 0 && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">Kütüphanen boş</h3>
                    <p className="text-gray-600 mb-6">Keşfet sayfasından film ve diziler ekleyebilirsin</p>
                    <button onClick={() => navigate('/search')} className="btn-primary">🔍 Keşfet</button>
                </div>
            )}

            {/* Krediler */}
            <div className="mt-16 pt-8 border-t border-white/5 text-center">
                <p className="text-xs text-gray-700">
                    ReelMark — Designed & Built by{' '}
                    <a href="https://mehmetkaantemiz.com" target="_blank" rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-300 transition-colors">
                        Mehmet Kaan Temiz
                    </a>
                </p>
            </div>
        </div>
    );
}
