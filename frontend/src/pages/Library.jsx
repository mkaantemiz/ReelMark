import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MediaCard from '../components/MediaCard';

import { Link } from 'react-router-dom';

const STATUS_TABS = [
    { key: 'all', label: 'Tümü', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> },
    { key: 'watching', label: 'İzliyorum', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
    { key: 'watchlist', label: 'İzlenecek', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> },
    { key: 'watched', label: 'İzlendi', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> },
];

const TYPE_FILTERS = [
    { key: 'all', label: 'Hepsi' },
    { key: 'movie', label: 'Film' },
    { key: 'tv', label: 'Dizi' },
];

export default function Library() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const url = activeTab === 'all' ? '/api/library' : `/api/library?status=${activeTab}`;
            const { data } = await axios.get(url);
            setItems(data.items || []);
        } catch {
            toast.error('Kütüphane yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const handleDelete = async (id) => {
        if (!window.confirm('Bu içeriği kütüphanenden kaldırmak istiyor musun?')) return;
        try {
            await axios.delete(`/api/library/${id}`);
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success('Kütüphaneden kaldırıldı');
        } catch {
            toast.error('Silinemedi');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const { data } = await axios.patch(`/api/library/${id}`, { status });
            setItems(prev => prev.map(i => i.id === id ? data.item : i));
            toast.success('Durum güncellendi');
        } catch {
            toast.error('Güncellenemedi');
        }
    };

    const filtered = typeFilter === 'all' ? items : items.filter(i => i.type === typeFilter);

    return (
        <div className="page-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1 flex items-center gap-2">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        Kütüphanem
                    </h1>
                    <p className="text-gray-400">{items.length} içerik</p>
                </div>
                {/* Type & View filter */}
                <div className="flex flex-wrap gap-2 items-center">
                    {TYPE_FILTERS.map(f => (
                        <button key={f.key} onClick={() => setTypeFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === f.key ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                            {f.label}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
                    <div className="flex bg-white/5 rounded-lg p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Status tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {STATUS_TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${activeTab === tab.key
                            ? 'text-white shadow-lg'
                            : 'glass text-gray-400 hover:text-white'
                            }`}
                        style={activeTab === tab.key ? { background: 'linear-gradient(135deg, rgba(229,9,20,0.3), rgba(178,7,16,0.3))', border: '1px solid rgba(229,9,20,0.3)' } : {}}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-gray-600 mb-6 flex justify-center">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                    </div>
                    <p className="text-gray-400">Bu kategoride içerik yok</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map(item => (
                        <MediaCard
                            key={item.id}
                            item={item}
                            showControls
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            onRefresh={fetchItems}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(item => (
                        <div key={item.id} className="glass rounded-xl p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                            <Link to={`/detail/${item.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                                <div className="hidden sm:flex w-10 h-10 rounded-lg bg-dark-700 items-center justify-center text-gray-400">
                                    {item.type === 'tv' ?
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> :
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                                    }
                                </div>
                                <div className="min-w-0 pr-4">
                                    <h3 className="text-white font-semibold truncate group-hover:text-red-400 transition-colors">{item.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <span>{item.type === 'movie' ? 'Film' : 'Dizi'}</span>
                                        {item.release_date && <span>• {item.release_date.split('-')[0]}</span>}
                                        {item.status === 'watching' && item.type === 'tv' && (
                                            <span className="text-blue-400 font-medium">
                                                • S{item.current_season} E{item.current_episode}
                                            </span>
                                        )}
                                        {item.vote_average > 0 && <span>• ★ {item.vote_average.toFixed(1)}</span>}
                                    </p>
                                </div>
                            </Link>

                            {/* Controls */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <select
                                    value={item.status}
                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                    className="bg-dark-800 text-xs text-white border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-white/30"
                                >
                                    <option value="watchlist">İzlenecek</option>
                                    <option value="watching">İzliyorum</option>
                                    <option value="watched">İzlendi</option>
                                </select>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item.id); }}
                                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Kütüphaneden Çıkar"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                                {item.watch_link && (
                                    <a href={item.watch_link} target="_blank" rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" title="İzle"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
