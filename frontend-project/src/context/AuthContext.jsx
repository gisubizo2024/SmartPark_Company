import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const res = await axios.post('http://localhost:5000/auth/login', { username, password });
            if (res.data.username) {
                const userData = { username: res.data.username };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return true;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const register = async (username, password) => {
        try {
            await axios.post('http://localhost:5000/auth/register', { username, password });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
