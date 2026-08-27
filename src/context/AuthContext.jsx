import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAPI, registerAPI, getProfile, setTokens, clearTokens, getAccessToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('cc_user') && !!localStorage.getItem('cc_access_token');
  });
  const [error, setError] = useState(null);

  // ─── Restore session on mount ───────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const profile = await getProfile();
          if (profile) {
            const userData = {
              id: profile.id,
              username: profile.username,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              role: profile.role,
              is_verified: profile.is_verified,
            };
            setUser(userData);
            localStorage.setItem('cc_user', JSON.stringify(userData));
          }
        } catch {
          // If backend is unreachable or token expired, keep cached user if valid, or clear
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginAPI(username, password);
      setTokens(data.access, data.refresh);
      const userData = data.user;
      setUser(userData);
      localStorage.setItem('cc_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn('Backend server unreachable. Falling back to local authentication mode.');
        const fallbackUser = {
          id: Date.now(),
          username: username,
          email: `${username}@craftconnect.app`,
          first_name: username,
          last_name: '',
          role: username.includes('artisan') || username.includes('seller') ? 'artisan' : 'consumer',
          is_verified: true,
        };
        setUser(fallbackUser);
        localStorage.setItem('cc_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Register ───────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Register the user
      await registerAPI(formData);
      // Auto-login after registration
      const data = await loginAPI(formData.username, formData.password);
      setTokens(data.access, data.refresh);
      const userData = data.user;
      setUser(userData);
      localStorage.setItem('cc_user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn('Backend server unreachable during registration. Creating local account.');
        const fallbackUser = {
          id: Date.now(),
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name || formData.username,
          last_name: formData.last_name || '',
          role: formData.role || 'consumer',
          is_verified: formData.role === 'artisan',
        };
        setUser(fallbackUser);
        localStorage.setItem('cc_user', JSON.stringify(fallbackUser));
        return fallbackUser;
      }
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setError(null);
  }, []);

  // ─── Clear error ────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem('cc_is_premium') === 'true';
  });

  const togglePremium = useCallback(() => {
    setIsPremium(prev => {
      const next = !prev;
      localStorage.setItem('cc_is_premium', String(next));
      return next;
    });
  }, []);

  const upgradeToPremium = useCallback(() => {
    setIsPremium(true);
    localStorage.setItem('cc_is_premium', 'true');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      clearError,
      isBuyer: user?.role === 'consumer',
      isSeller: user?.role === 'artisan',
      isPremium,
      togglePremium,
      upgradeToPremium,
    }}>
      {children}
    </AuthContext.Provider>
  );
};