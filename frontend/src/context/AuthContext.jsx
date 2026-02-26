import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('ct_token'));
    const [user, setUser] = useState(() => localStorage.getItem('ct_user'));

    useEffect(() => {
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        else delete axios.defaults.headers.common['Authorization'];
    }, [token]);

    useEffect(() => {
        const id = axios.interceptors.response.use(
            r => r,
            err => { if (err.response?.status === 401) logout(); return Promise.reject(err); }
        );
        return () => axios.interceptors.response.eject(id);
    }, []);

    const _setAuth = (data) => {
        localStorage.setItem('ct_token', data.token);
        localStorage.setItem('ct_user', data.username);
        setToken(data.token);
        setUser(data.username);
    };

    const login = async ({ login: loginField, email, username, password, isRegister }) => {
        let data;
        if (isRegister) {
            ({ data } = await axios.post('/api/auth/register', { email, username, password }));
        } else {
            ({ data } = await axios.post('/api/auth/login', { login: loginField, password }));
        }
        _setAuth(data);
    };

    const logout = () => {
        localStorage.removeItem('ct_token');
        localStorage.removeItem('ct_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
