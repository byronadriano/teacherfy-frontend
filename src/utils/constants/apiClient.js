// src/utils/apiClient.js
import { API } from './constants/api';

export const createApiClient = () => {
  const defaultOptions = {
    credentials: 'include',
    mode: 'cors',
    headers: { ...API.HEADERS }
  };

  return {
    async fetch(endpoint, options = {}) {
      const url = `${API.BASE_URL}${endpoint}`;
      const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT);

      try {
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: response.statusText
          }));
          throw new Error(errorData.message || 'Network response was not ok');
        }

        return response;
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  };
};

export const apiClient = createApiClient();