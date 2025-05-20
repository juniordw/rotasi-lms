// src/hooks/api/useApi.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

export function useApi() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshTokens } = useAuth();

  const fetchData = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
      
      let response = await fetch(url, { ...options, headers });
      
      // Handle token expiration
      if (response.status === 401) {
        const refreshSuccessful = await refreshTokens();
        
        if (refreshSuccessful) {
          // Retry with new token
          const newToken = localStorage.getItem('accessToken');
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          
          response = await fetch(url, { ...options, headers: retryHeaders });
        } else {
          throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Terjadi kesalahan saat memuat data');
      }
      
      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
      console.error('API error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTokens]);

  const mutateData = useCallback(async (
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST',
    body?: any,
    options: RequestInit = {}
  ) => {
    return fetchData(endpoint, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }, [fetchData]);

  return {
    isLoading,
    error,
    fetchData,
    mutateData,
  };
}