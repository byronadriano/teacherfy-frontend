// src/services/outline.js
import { httpClient } from './http';
import { API } from '../utils/constants';

export const outlineService = {
  async generate(formData, token) {
    const response = await httpClient.fetch(API.ENDPOINTS.OUTLINE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    return response.json();
  },

  async regenerate(formData, token, regenerationPrompt) {
    const response = await httpClient.fetch(API.ENDPOINTS.OUTLINE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        regeneration_prompt: regenerationPrompt,
      }),
    });
    return response.json();
  }
};