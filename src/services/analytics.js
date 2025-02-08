// src/services/analytics.js
// Temporarily disable ESLint warnings for unused imports
// as we'll use these when analytics is implemented
/* eslint-disable no-unused-vars */
import { httpClient } from './http';
import { API } from '../utils/constants';
/* eslint-enable no-unused-vars */

// Export an empty object for now - we can implement analytics later
export const analyticsService = {
  // Placeholder for future analytics implementation
  async trackActivity(activity, data = {}) {
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Activity tracked:', activity, data);
    }
  }
};