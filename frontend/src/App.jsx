import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Library from './pages/Library';
import Detail from './pages/Detail';
import TmdbDetail from './pages/TmdbDetail';

function ProtectedRoutes() {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/detail/:id" element={<Detail />} />
                    <Route path="/tmdb/:type/:tmdbId" element={<TmdbDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-dark-900">
                    <Routes>
                        <Route path="/login" element={<LoginGuard />} />
                        <Route path="/*" element={<ProtectedRoutes />} />
                    </Routes>
                </div>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: '#1a1a2e',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                        },
                        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#e50914', secondary: '#fff' } },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

function LoginGuard() {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <Navigate to="/" replace /> : <Login />;
}
