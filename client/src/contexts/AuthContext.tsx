// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, deleteCookie } from 'cookies-next';

export type User = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{success: boolean, message?: string}>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Setup auth interceptor for handling token expiry
  const setupAuthInterceptor = () => {
    if (typeof window === 'undefined') return;
    
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [url, options = {}] = args;
      
      const token = localStorage.getItem('accessToken');
      
      // Add token to request headers if available
      if (token && options.headers) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`
        };
      } else if (token) {
        options.headers = {
          Authorization: `Bearer ${token}`
        };
      }
      
      try {
        const response = await originalFetch(url, options);
        
        // Handle 401 (Unauthorized) responses
        if (response.status === 401) {
          const refreshSuccessful = await refreshTokens();
          
          // If refresh was successful, retry original request with new token
          if (refreshSuccessful) {
            const newToken = localStorage.getItem('accessToken');
            if (options.headers) {
              options.headers = {
                ...options.headers,
                Authorization: `Bearer ${newToken}`
              };
            } else {
              options.headers = {
                Authorization: `Bearer ${newToken}`
              };
            }
            return originalFetch(url, options);
          } else {
            // If refresh failed, logout and redirect
            logout();
            return response;
          }
        }
        
        return response;
      } catch (error) {
        return Promise.reject(error);
      }
    };
  };
  
  // Function to refresh access token using refresh token
  const refreshTokens = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') return false;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        setCookie('accessToken', data.accessToken, { maxAge: 60 * 60 * 24 });
        return true;
      } else {
        // If refresh failed, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Setup fetch interceptor for auto token refresh
        setupAuthInterceptor();

        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          // Try to refresh token if unauthorized
          const refreshed = await refreshTokens();
          if (!refreshed) {
            // If refresh failed, clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            deleteCookie('accessToken');
            deleteCookie('refreshToken');
          } else {
            // If refresh successful, try fetching user data again
            const newToken = localStorage.getItem('accessToken');
            const retryResponse = await fetch('http://localhost:5000/api/auth/me', {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setUser(data.user);
            } else {
              // If still unsuccessful, clear tokens
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              deleteCookie('accessToken');
              deleteCookie('refreshToken');
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Also set cookies for middleware
        setCookie('accessToken', data.accessToken, { maxAge: 60 * 60 * 24 });
        setCookie('refreshToken', data.refreshToken, { maxAge: 60 * 60 * 24 * 30 });
        
        // Remember email if option is selected
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Set user data
        setUser(data.user);
        
        // Setup fetch interceptor
        setupAuthInterceptor();
        
        return { success: true };
      }
      return { success: false, message: data.message || "Email atau password tidak valid" };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: "Terjadi kesalahan koneksi ke server" };
    }
  };

  const logout = () => {
    try {
      if (typeof window === 'undefined') return;
      
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call logout API if refresh token exists
      if (refreshToken) {
        fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        }).catch(err => console.error('Logout API error:', err));
      }
      
      // Clear local storage and cookies
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      
      // Clear user state
      setUser(null);
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUserData = async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Refresh user data error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUserData,
        refreshTokens
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};