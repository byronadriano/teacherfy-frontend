// src/services/analytics.js
import { httpClient } from './http';
import { API } from '../utils/constants';

export const analyticsService = {
  async trackActivity(activity, user, token, data = {}) {
    await httpClient.fetch(API.ENDPOINTS.TRACK_ACTIVITY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        activity,
        email: user?.email,
        name: user?.name,
        ...data,
      }),
    });
  }
};