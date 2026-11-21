import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// ✅ Helper: Token se user info nikalna
const getUserFromToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return {
            id: decoded.id,
            role_id: decoded.role_id,
            first_name: decoded.first_name || 'User',
            last_name: decoded.last_name || '',
            email_id: decoded.email_id || '',
            type: decoded.type || 'customer',
        };
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
};

// ✅ Helper: Token expiry check
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp && decoded.exp < currentTime;
    } catch {
        return true;
    }
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const savedToken = localStorage.getItem('token');
        // ✅ Agar token expired hai toh clear kar do
        if (savedToken && isTokenExpired(savedToken)) {
            localStorage.removeItem('token');
            return null;
        }
        return savedToken;
    });

    // ✅ User state token se derive hota hai (localStorage me save nahi)
    const [user, setUser] = useState(() => getUserFromToken(token));

    // ✅ Token change hone pe user update karo
    useEffect(() => {
        if (token) {
            const decodedUser = getUserFromToken(token);
            setUser(decodedUser);
        } else {
            setUser(null);
        }
    }, [token]);

    const login = (userData, userToken) => {
        // ✅ Sirf token save karo, user object nahi
        localStorage.setItem('token', userToken);
        setToken(userToken);
        // User state effect se auto-update hoga
    };

    const logout = () => {
        localStorage.removeItem('token');
        // ✅ Purane data cleanup (agar pehle save hua ho)
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);