import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const { login } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ login: '', email: '', username: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'register' && form.password !== form.confirm)
            return toast.error('Şifreler eşleşmiyor');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login({ login: form.login, password: form.password });
            } else {
                await login({ email: form.email, username: form.username, password: form.password, isRegister: true });
            }
            toast.success('Hoş geldin!');
        } catch (err) {
            toast.error(err.response?.data?.error || (mode === 'login' ? 'Giriş başarısız' : 'Kayıt başarısız'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{
            background: 'radial-gradient(ellipse at 25% 35%, rgba(229,9,20,0.13) 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(124,58,237,0.11) 0%, transparent 55%), #0a0a0f',
        }}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white shadow-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, #e50914, #b20710)' }}>
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <h1 className="text-4xl font-black mb-1">
                        <span className="text-gradient">Reel</span><span className="text-white">Mark</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Film ve dizi takip uygulaması</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    {/* Tab */}
                    <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {[['login', 'Giriş Yap'], ['register', 'Kayıt Ol']].map(([m, l]) => (
                            <button key={m} onClick={() => setMode(m)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                style={mode === m ? { background: 'linear-gradient(135deg,#e50914,#b20710)' } : {}}
                            >{l}</button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'login' ? (
                            <>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Kullanıcı adı veya email</label>
                                    <input type="text" className="input-field" placeholder="kullanıcı adın ya da email"
                                        value={form.login} onChange={e => update('login', e.target.value)} autoFocus required />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                                    <input type="email" className="input-field" placeholder="ornek@mail.com"
                                        value={form.email} onChange={e => update('email', e.target.value)} autoFocus required />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Kullanıcı Adı</label>
                                    <input type="text" className="input-field" placeholder="kullaniciadi"
                                        value={form.username} onChange={e => update('username', e.target.value)} required />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Şifre {mode === 'register' && <span className="text-gray-600">(en az 6 karakter)</span>}</label>
                            <div className="relative">
                                <input type={showPass ? 'text' : 'password'} className="input-field pr-12" placeholder="••••••••"
                                    value={form.password} onChange={e => update('password', e.target.value)} required />
                                <button type="button" onClick={() => setShowPass(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPass ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">Şifre Tekrar</label>
                                <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="••••••••"
                                    value={form.confirm} onChange={e => update('confirm', e.target.value)} required />
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-white transition-all duration-200 disabled:opacity-60 mt-2"
                            style={{ background: 'linear-gradient(135deg, #e50914, #c1070f)', boxShadow: '0 4px 20px rgba(229,9,20,0.35)' }}>
                            {loading ? '⏳ Lütfen bekle...' : (mode === 'login' ? '→ Giriş Yap' : '→ Hesap Oluştur')}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-600 mt-5">
                        {mode === 'login' ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}{' '}
                        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-red-400 hover:text-red-300 font-medium transition-colors">
                            {mode === 'login' ? 'Kayıt ol' : 'Giriş yap'}
                        </button>
                    </p>
                </div>

                {/* Krediler */}
                <p className="text-center text-xs text-gray-700 mt-6">
                    Designed by{' '}
                    <a href="https://mehmetkaantemiz.com" target="_blank" rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-300 transition-colors">
                        Mehmet Kaan Temiz
                    </a>
                </p>
            </div>
        </div>
    );
}
