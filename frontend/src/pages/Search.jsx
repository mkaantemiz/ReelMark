import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
    movie: { label: 'Film', badge: 'badge-movie' },
    tv: { label: 'Dizi', badge: 'badge-tv' },
};

export default function Search() {
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('multi');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [addingId, setAddingId] = useState(null);

    const handleSearch = useCallback(async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/search?q=${encodeURIComponent(query)}&type=${typeFilter}`);
            setResults(data.results || []);
            setSearched(true);
        } catch {
            toast.error('Arama başarısız oldu');
        } finally {
            setLoading(false);
        }
    }, [query, typeFilter]);

    const handleAdd = async (item, status = 'watchlist') => {
        const key = `${item.tmdb_id}-${item.type}`;
        setAddingId(key);
        try {
            await axios.post('/api/library', { ...item, status });
            toast.success(`"${item.title}" kütüphaneye eklendi!`);
        } catch (err) {
            if (err.response?.status === 409)
                toast('Bu içerik zaten kütüphanende var');
            else
                toast.error('Eklenemedi, tekrar dene');
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="page-container">
            <div className="mb-8">
                <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    İçerik Keşfet
                </h1>
                <p className="text-gray-400">TMDB üzerinden milyonlarca film ve dizi ara</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </span>
                        <input
                            className="input-field pl-11"
                            type="text"
                            placeholder="Film veya dizi adı yaz..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2">
                        {[['multi', 'Tümü'], ['movie', 'Film'], ['tv', 'Dizi']].map(([val, label]) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setTypeFilter(val)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${typeFilter === val
                                    ? 'text-white border border-red-500/50' : 'btn-secondary'
                                    }`}
                                style={typeFilter === val ? { background: 'rgba(229,9,20,0.2)' } : {}}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <button type="submit" className="btn-primary px-6" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                                </svg>
                                Aranıyor...
                            </span>
                        ) : 'Ara'}
                    </button>
                </div>
            </form>

            {/* Results */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />)}
                </div>
            )}

            {!loading && searched && results.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">🎭</div>
                    <p className="text-gray-400">"{query}" için sonuç bulunamadı</p>
                </div>
            )}

            {!loading && results.length > 0 && (
                <>
                    <p className="text-sm text-gray-500 mb-4">{results.length} sonuç bulundu</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {results.map(item => {
                            const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS.movie;
                            const key = `${item.tmdb_id}-${item.type}`;
                            const isAdding = addingId === key;
                            return (
                                <div key={key} className="group relative glass-hover rounded-xl overflow-hidden">
                                    {/* Poster — tıklayarak detaya git */}
                                    <Link to={`/tmdb/${item.type || 'movie'}/${item.tmdb_id}`} className="block">
                                        <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
                                            {item.poster_path ? (
                                                <img
                                                    src={item.poster_path}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-dark-700 flex items-center justify-center text-4xl">
                                                    {typeInfo.emoji}
                                                </div>
                                            )}
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 gap-2">
                                                <button
                                                    onClick={e => { e.preventDefault(); handleAdd(item, 'watchlist'); }}
                                                    disabled={isAdding}
                                                    className="w-full py-2 rounded-lg text-xs font-semibold transition-all bg-white/10 hover:bg-white/20 border border-white/20"
                                                >
                                                    {isAdding ? '⏳' : '📋 İzlenecekler'}
                                                </button>
                                                <button
                                                    onClick={e => { e.preventDefault(); handleAdd(item, 'watching'); }}
                                                    disabled={isAdding}
                                                    className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
                                                    style={{ background: 'linear-gradient(135deg,#e50914,#c1070f)' }}
                                                >
                                                    {isAdding ? '⏳' : '▶️ İzliyorum'}
                                                </button>
                                            </div>
                                            {/* Type badge */}
                                            <div className="absolute top-2 left-2">
                                                <span className={typeInfo.badge}>{typeInfo.emoji} {typeInfo.label}</span>
                                            </div>
                                            {/* Rating */}
                                            {item.vote_average > 0 && (
                                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(0,0,0,0.7)' }}>
                                                    ⭐ {item.vote_average.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    {/* Info */}
                                    <div className="p-3">
                                        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">{item.title}</h3>
                                        {item.release_date && (
                                            <p className="text-xs text-gray-500 mt-1">{item.release_date.slice(0, 4)}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {!searched && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎬</div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">Ne izlemek istiyorsun?</h3>
                    <p className="text-gray-600">Yukarıdaki arama kutusuna film veya dizi adı yaz</p>
                </div>
            )}
        </div>
    );
}
