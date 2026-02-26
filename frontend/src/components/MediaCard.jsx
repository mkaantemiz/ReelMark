import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_CLASS = {
    watching: 'badge-watching',
    watched: 'badge-watched',
    watchlist: 'badge-watchlist',
};
const STATUS_LABEL = {
    watching: 'İzleniyor',
    watched: 'İzlendi',
    watchlist: 'İzlenecekler',
};

export default function MediaCard({ item, showControls = false, onDelete, onStatusChange, onRefresh }) {
    const isFromLibrary = !!item.id;
    const navigate = useNavigate();

    const handleProgressNext = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await axios.patch(`/api/library/${item.id}/progress`, { action: 'next' });
            toast.success(`S${item.current_season}E${item.current_episode + 1}'e geçildi`);
            onRefresh?.();
        } catch { toast.error('Güncellenemedi'); }
    };

    return (
        <div
            onClick={() => isFromLibrary && navigate(`/detail/${item.id}`)}
            className="group relative glass-hover rounded-xl overflow-hidden cursor-pointer flex flex-col h-full"
        >
            {/* Poster */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
                {item.poster_path ? (
                    <img
                        src={item.poster_path}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-dark-700 flex items-center justify-center text-gray-500">
                        {item.type === 'tv' ?
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> :
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                        }
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4 z-20">
                    {showControls && (
                        <div className="space-y-3 w-full" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                            {item.type === 'tv' && item.status === 'watching' && (
                                <button
                                    onClick={handleProgressNext}
                                    className="w-full py-1.5 rounded-lg text-xs font-bold transition-all text-white hover:opacity-90 flex items-center justify-center gap-1"
                                    style={{ background: 'linear-gradient(135deg,#e50914,#b20710)' }}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg> Sonraki Bölüm
                                </button>
                            )}
                            <div className="flex gap-1">
                                <select
                                    className="flex-1 py-1.5 rounded-lg text-xs text-white cursor-pointer"
                                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
                                    value={item.status}
                                    onChange={e => { e.preventDefault(); e.stopPropagation(); onStatusChange?.(item.id, e.target.value); }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <option value="watchlist">📋 İzlenecek</option>
                                    <option value="watching">▶️ İzliyorum</option>
                                    <option value="watched">✅ İzledim</option>
                                </select>
                                <button
                                    onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete?.(item.id); }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-red-500/40 transition-all"
                                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,0,0,0.3)' }}
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.status && (
                        <span className={`badge text-xs ${STATUS_CLASS[item.status]}`}>
                            {STATUS_LABEL[item.status]}
                        </span>
                    )}
                </div>

                {/* Progress (diziler) */}
                {item.type === 'tv' && item.status === 'watching' && (
                    <div className="absolute bottom-2 left-2 right-2 text-xs font-bold px-2 py-1 rounded-lg text-center"
                        style={{ background: 'rgba(0,0,0,0.75)', border: '1px solid rgba(14,165,233,0.4)' }}>
                        S{item.current_season}E{item.current_episode}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                <div>
                    <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">{item.title}</h3>
                    {item.release_date && (
                        <p className="text-xs text-gray-500 mt-1">{item.release_date.slice(0, 4)}</p>
                    )}
                </div>
                {showControls && (
                    <button
                        onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (item.watch_link) window.open(item.watch_link, '_blank');
                            else navigate(`/detail/${item.id}`);
                        }}
                        className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110 mt-auto"
                        style={{ background: 'linear-gradient(135deg,#e50914,#c1070f)' }}
                    >
                        {item.watch_link ? '▶ İzle' : '➕ Link Ekle'}
                    </button>
                )}
            </div>
        </div >
    );
}
