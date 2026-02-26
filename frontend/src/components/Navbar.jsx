import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';


const navLinks = [
    { to: '/', label: 'Ana Sayfa', icon: '🏠' },
    { to: '/search', label: 'Keşfet', icon: '🔍' },
    { to: '/library', label: 'Kütüphanem', icon: '📚' },
];

export default function Navbar() {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); toast.success('Çıkış yapıldı'); };

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                            style={{ background: 'linear-gradient(135deg, #e50914, #7c3aed)' }}>
                            🎬
                        </div>
                        <span className="text-xl font-black tracking-tight">
                            <span className="text-gradient">Reel</span>
                            <span className="text-white">Mark</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.to
                                    ? 'text-white bg-white/10 shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Çıkış yap">
                            <span>👤</span> {user} <span className="text-xs">✕</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 flex flex-col gap-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.to
                                    ? 'text-white bg-white/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
