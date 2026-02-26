import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MediaCard from '../components/MediaCard';

const STATUS_TABS = [
    { key: 'all', label: 'Tümü', icon: '🎬' },
    { key: 'watching', label: 'İzliyorum', icon: '▶️' },
    { key: 'watchlist', label: 'İzlenecek', icon: '📋' },
    { key: 'watched', label: 'İzlendi', icon: '✅' },
];

const TYPE_FILTERS = [
    { key: 'all', label: 'Hepsi' },
    { key: 'movie', label: '🎬 Film' },
    { key: 'tv', label: '📺 Dizi' },
];

export default function Library() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

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
                    <h1 className="text-3xl font-black mb-1">📚 Kütüphanem</h1>
                    <p className="text-gray-400">{items.length} içerik</p>
                </div>
                {/* Type filter */}
                <div className="flex gap-2">
                    {TYPE_FILTERS.map(f => (
                        <button key={f.key} onClick={() => setTypeFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${typeFilter === f.key ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                            {f.label}
                        </button>
                    ))}
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
                        style={activeTab === tab.key ? { background: 'linear-gradient(135deg, rgba(229,9,20,0.3), rgba(124,58,237,0.3))', border: '1px solid rgba(229,9,20,0.3)' } : {}}
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
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-gray-400">Bu kategoride içerik yok</p>
                </div>
            ) : (
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
            )}
        </div>
    );
}
