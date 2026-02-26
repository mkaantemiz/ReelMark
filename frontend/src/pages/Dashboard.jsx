import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ICONS = {
    total: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>,
    watching: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
    watched: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
    watchlist: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
};

const STAT_CONFIG = [
    { key: 'total', label: 'Toplam', icon: ICONS.total, color: '#e50914', status: null },
    { key: 'watching', label: 'İzliyorum', icon: ICONS.watching, color: '#3b82f6', status: 'watching' },
    { key: 'watched', label: 'İzlendi', icon: ICONS.watched, color: '#22c55e', status: 'watched' },
    { key: 'watchlist', label: 'İzlenecek', icon: ICONS.watchlist, color: '#f59e0b', status: 'watchlist' },
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
                    Merhaba, <span className="text-gradient">{user}</span>
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
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="scale-75 origin-left">{STAT_CONFIG.find(s => s.key === activeFilter)?.icon}</span>
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
                                            : <div className="w-full h-full bg-dark-700 flex items-center justify-center text-gray-500">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                            </div>
                                        }
                                        {item.type === 'tv' && item.status === 'watching' && (
                                            <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold px-2 py-1 rounded-lg"
                                                style={{ background: 'rgba(0,0,0,0.8)', color: '#3b82f6' }}>
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
                    <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        Devam Et
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {continuing.slice(0, 6).map(item => (
                            <div key={item.id}
                                onClick={() => navigate(`/detail/${item.id}`)}
                                className="glass-hover rounded-xl overflow-hidden flex gap-4 p-3 group transition-transform hover:scale-[1.02] cursor-pointer">
                                <div className="flex-shrink-0 w-14 rounded-lg overflow-hidden" style={{ aspectRatio: '2/3' }}>
                                    {item.poster_path
                                        ? <img src={item.poster_path} alt={item.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full bg-dark-700 flex items-center justify-center text-gray-500">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path></svg>
                                        </div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0 py-1">
                                    <p className="font-semibold text-white text-sm line-clamp-2">{item.title}</p>
                                    <p className="text-xs font-bold mt-1" style={{ color: '#3b82f6' }}>
                                        S{item.current_season} · E{item.current_episode}
                                    </p>
                                    {item.watch_link && (
                                        <a href={item.watch_link} target="_blank" rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="inline-flex items-center mt-2 text-xs px-3 py-1 rounded-full transition-all hover:opacity-80 font-bold"
                                            style={{ background: 'linear-gradient(135deg,#e50914,#b20710)', color: 'white' }}>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                            İzle
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
                <div className="text-center py-20 flex flex-col items-center">
                    <div className="text-gray-600 mb-6">
                        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">Kütüphanen boş</h3>
                    <p className="text-gray-600 mb-6">Keşfet sayfasından film ve diziler ekleyebilirsin</p>
                    <button onClick={() => navigate('/search')} className="btn-primary inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        Keşfet
                    </button>
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
