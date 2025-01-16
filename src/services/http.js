// src/services/http.js
import { API } from '../utils/constants';

class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async fetch(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }
}

export const httpClient = new HttpClient(API.BASE_URL);