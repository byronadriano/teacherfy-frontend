// src/services/http.js - CLEANED VERSION
import { config } from '../utils/config';

const DEFAULT_TIMEOUT = 100000; // 100 seconds for OpenAI API calls
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

class HttpClient {
  constructor(baseURL = config.apiUrl) {
    this.baseURL = baseURL;
  }

  async fetch(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        credentials: 'include',
        headers: {
          ...DEFAULT_HEADERS,
          ...options.headers,
        },
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText
        }));
        throw new Error(errorData.message || 'Network response was not ok');
      }

      // Handle different content types
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

export const httpClient = new HttpClient();