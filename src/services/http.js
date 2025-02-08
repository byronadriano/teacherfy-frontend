// src/services/http.js
import { API } from '../utils/constants';

class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async fetch(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        credentials: 'include',
        headers: {
          ...API.HEADERS,
          ...options.headers,
        },
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      // Handle OPTIONS preflight response
      if (options.method === 'OPTIONS') {
        return response;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText
        }));
        throw new Error(errorData.message || 'Network response was not ok');
      }

      // Check if the response is a blob (for file downloads)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
        return response.blob();
      }

      return response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Helper methods for common HTTP methods
  async get(endpoint, options = {}) {
    return this.fetch(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data, options = {}) {
    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, options = {}) {
    return this.fetch(endpoint, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient(API.BASE_URL);