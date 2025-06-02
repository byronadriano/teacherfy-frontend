// src/services/analytics.js - CLEANED VERSION
export const analyticsService = {
  async trackActivity(activity, data = {}) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Activity tracked:', activity, data);
    }
    // TODO: Implement actual analytics when needed
  }
};