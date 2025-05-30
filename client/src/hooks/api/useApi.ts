// src/hooks/api/useApi.ts
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost:5000/api";

type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  field?: string;
};

export function useApi() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshTokens, logout } = useAuth();
  const router = useRouter();

  const makeRequest = useCallback(
    async (endpoint: string, options: RequestInit = {}): Promise<ApiResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        const customHeaders = options.headers ?? {};

        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...customHeaders,
        };

        const url = endpoint.startsWith("http")
          ? endpoint
          : `${API_BASE_URL}${endpoint}`;

        let response = await fetch(url, { ...options, headers });

        // Handle 401 (Unauthorized) responses with token refresh
        if (response.status === 401 && refreshTokens) {
          console.log("Token expired, attempting refresh...");
          const refreshSuccessful = await refreshTokens();

          if (refreshSuccessful) {
            console.log("Token refresh successful, retrying request...");
            const newToken = localStorage.getItem("accessToken");
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            };
            response = await fetch(url, { ...options, headers: retryHeaders });
          } else {
            console.log("Token refresh failed, logging out...");
            logout();
            return null;
          }
        }

        // Parse response
        const result: ApiResponse = await response.json();

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 403) {
            setError("Akses ditolak. Anda tidak memiliki izin yang cukup.");
          } else if (response.status === 404) {
            setError("Data yang diminta tidak ditemukan.");
          } else if (response.status >= 500) {
            setError("Terjadi kesalahan server. Silakan coba lagi nanti.");
          } else {
            setError(result.message || "Terjadi kesalahan yang tidak diketahui.");
          }

          console.error("API Error:", {
            status: response.status,
            url,
            result
          });

          return result; // Return the error response for handling specific field errors
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : "Terjadi kesalahan jaringan. Periksa koneksi internet Anda.";
        
        setError(errorMessage);
        console.error("Network error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshTokens, logout]
  );

  const fetchData = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      return makeRequest(endpoint, { method: "GET", ...options });
    },
    [makeRequest]
  );

  const mutateData = useCallback(
    async (
      endpoint: string,
      method: "POST" | "PUT" | "DELETE" = "POST",
      body?: any,
      options: RequestInit = {}
    ) => {
      return makeRequest(endpoint, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });
    },
    [makeRequest]
  );

  // Utility function to clear errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    fetchData,
    mutateData,
    clearError,
  };
}