import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestOptions<T = any> {
  method?: HttpMethod;
  body?: T;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export const useApiRequest = <T = any>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getToken } = useAuth();

  const request = useCallback(
    async <TData = T>(
      options: ApiRequestOptions = { method: 'GET' },
      urlParams: Record<string, string> = {}
    ): Promise<{ data: TData | null; error: Error | null }> => {
      setLoading(true);
      setError(null);

      try {
        // Replace URL parameters in the endpoint
        let url = endpoint;
        Object.entries(urlParams).forEach(([key, value]) => {
          url = url.replace(`:${key}`, encodeURIComponent(value));
        });

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add auth token if not skipped
        if (!options.skipAuth) {
          const token = await getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        // Merge custom headers
        if (options.headers) {
          Object.assign(headers, options.headers);
        }

        const response = await fetch(`/api${url}`, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          credentials: 'include',
        });

        if (!response.ok) {
          let errorMessage = `Request failed with status ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If response is not JSON, use default error message
          }
          throw new Error(errorMessage);
        }

        // For 204 No Content responses
        if (response.status === 204) {
          return { data: null as any, error: null };
        }

        const responseData = await response.json();
        setData(responseData);
        return { data: responseData, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        return { data: null, error };
      } finally {
        setLoading(false);
      }
    },
    [endpoint, getToken]
  );

  const get = useCallback(
    <TData = T>(params?: Record<string, string>) => 
      request<TData>({ method: 'GET' }, params),
    [request]
  );

  const post = useCallback(
    <TData = T>(body: any, params?: Record<string, string>) => 
      request<TData>({ method: 'POST', body }, params),
    [request]
  );

  const put = useCallback(
    <TData = T>(body: any, params?: Record<string, string>) => 
      request<TData>({ method: 'PUT', body }, params),
    [request]
  );

  const del = useCallback(
    <TData = T>(params?: Record<string, string>) => 
      request<TData>({ method: 'DELETE' }, params),
    [request]
  );

  const patch = useCallback(
    <TData = T>(body: any, params?: Record<string, string>) => 
      request<TData>({ method: 'PATCH', body }, params),
    [request]
  );

  return {
    data,
    loading,
    error,
    request,
    get,
    post,
    put,
    del,
    patch,
    setData,
    setError,
  };
};

// Helper hook for authentication endpoints
export const useAuthEndpoints = () => {
  const login = useApiRequest<{ access_token: string }>('/auth/login');
  const register = useApiRequest('/auth/register');
  const logout = useApiRequest('/auth/logout');
  const refresh = useApiRequest<{ access_token: string }>('/auth/refresh');
  const user = useApiRequest('/auth/me');

  return {
    login,
    register,
    logout,
    refresh,
    user,
  };
};
