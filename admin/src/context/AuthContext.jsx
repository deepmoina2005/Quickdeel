import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../services/admin.service';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.getToken());
  const [admin, setAdmin] = useState(() => storage.getUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogout = () => logout(false);
    window.addEventListener('quickdeal:logout', handleLogout);
    return () => window.removeEventListener('quickdeal:logout', handleLogout);
  }, []);

  const login = async (values) => {
    setLoading(true);
    try {
      const response = await adminService.login(values);
      if (response.user?.role !== 'ADMIN') {
        toast.error('Admin access required');
        return false;
      }
      storage.setToken(response.token);
      storage.setUser(response.user);
      setToken(response.token);
      setAdmin(response.user);
      toast.success('Welcome back');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = (showToast = true) => {
    storage.clearAuth();
    setToken(null);
    setAdmin(null);
    if (showToast) toast.success('Logged out');
  };

  const value = useMemo(
    () => ({ admin, token, isAuthenticated: Boolean(token), loading, login, logout }),
    [admin, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
