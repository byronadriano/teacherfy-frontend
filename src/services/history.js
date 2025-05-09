// src/services/history.js
import { httpClient } from './http';
import { API } from '../utils/constants/api';

// Cache storage
let historyCache = {
  data: null,
  timestamp: 0,
  expiresIn: 30000 // 30 seconds in milliseconds
};

export const historyService = {
  /**
   * Fetches user history from the server.
   * Implements caching to avoid too many requests.
   */
  async getUserHistory() {
    try {
      // Check if we have fresh cached data
      const now = Date.now();
      if (historyCache.data && (now - historyCache.timestamp < historyCache.expiresIn)) {
        console.log('Using cached history data');
        return historyCache.data;
      }
      
      console.log('Fetching user history from server...');
      const response = await httpClient.get(API.ENDPOINTS.USER_HISTORY);
      
      // Cache the successful response
      if (response && !response.error) {
        historyCache.data = response;
        historyCache.timestamp = now;
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching user history:', error);
      
      // If we have cached data, return it even if expired
      if (historyCache.data) {
        console.log('Returning stale cached history due to error');
        return historyCache.data;
      }
      
      // Return empty history on error
      return { 
        history: [], 
        user_authenticated: false,
        error: error.message
      };
    }
  },

  /**
   * Invalidates the history cache, forcing the next getUserHistory call to fetch fresh data
   */
  invalidateCache() {
    historyCache.data = null;
    historyCache.timestamp = 0;
  },

  /**
   * Saves a history item to the server.
   * For authenticated users, it saves to the database.
   * For anonymous users, it saves to the session.
   * 
   * @param {Object} data - The history item data to save
   */
  async saveHistoryItem(data) {
    try {
      // First save to local storage as backup
      this.saveLocalHistory({
        id: Date.now(),
        title: data.title,
        types: [data.resourceType],
        date: 'Today',
        lessonData: data.lessonData
      });
      
      // Then try to save to server
      const serverResponse = await httpClient.post(API.ENDPOINTS.USER_HISTORY, data);
      
      // Invalidate the cache so next getUserHistory call will fetch fresh data
      this.invalidateCache();
      
      return serverResponse;
    } catch (error) {
      console.error('Error saving history item to server:', error);
      // Save to local storage if server save fails
      this.saveLocalHistory({
        id: Date.now(),
        title: data.title,
        types: [data.resourceType],
        date: 'Today',
        lessonData: data.lessonData
      });
      throw error;
    }
  },

  /**
   * Clear history for the current user
   */
  async clearHistory() {
    try {
      // First clear local storage
      this.clearLocalHistory();
      
      // Then try to clear server history
      const clearResponse = await httpClient.post(API.ENDPOINTS.CLEAR_HISTORY);
      
      // Invalidate the cache
      this.invalidateCache();
      
      return { success: true, response: clearResponse };
    } catch (error) {
      console.error('Error clearing history from server:', error);
      return { 
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Track lesson generation for history.
   * 
   * @param {Object} formState - The form state with lesson details
   * @param {Object} contentState - The content state with structured content
   */
  async trackLessonGeneration(formState, contentState) {
    try {
      const historyItem = {
        title: formState.lessonTopic || formState.subjectFocus || 'Untitled Lesson',
        resourceType: formState.resourceType || 'PRESENTATION',
        lessonData: {
          ...formState,
          structuredContent: contentState.structuredContent.map(slide => ({
            title: slide.title || '',
            layout: slide.layout || 'TITLE_AND_CONTENT',
            content: Array.isArray(slide.content) ? [...slide.content] : [],
            teacher_notes: Array.isArray(slide.teacher_notes) ? [...slide.teacher_notes] : [],
            visual_elements: Array.isArray(slide.visual_elements) ? [...slide.visual_elements] : [],
            left_column: Array.isArray(slide.left_column) ? [...slide.left_column] : [],
            right_column: Array.isArray(slide.right_column) ? [...slide.right_column] : []
          })),
          finalOutline: contentState.finalOutline || ''
        }
      };
      
      return await this.saveHistoryItem(historyItem);
    } catch (error) {
      console.error('Error tracking lesson generation:', error);
      // Continue even if tracking fails
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Gets the history from local storage for anonymous users.
   */
  getLocalHistory() {
    try {
      const localHistory = localStorage.getItem('anonymous_history');
      
      if (!localHistory) {
        return [];
      }
      
      return JSON.parse(localHistory);
    } catch (error) {
      console.error('Error reading local history:', error);
      return [];
    }
  },
  
  /**
   * Saves history to local storage for anonymous users.
   * 
   * @param {Object} historyItem - The history item to save
   */
  saveLocalHistory(historyItem) {
    try {
      let history = this.getLocalHistory();
      
      // Create a unique ID if one doesn't exist
      if (!historyItem.id) {
        historyItem.id = Date.now();
      }
      
      // Check if an item with the same title and resource type already exists
      const existingIndex = history.findIndex(item => 
        item.title === historyItem.title && 
        JSON.stringify(item.types) === JSON.stringify(historyItem.types)
      );
      
      if (existingIndex >= 0) {
        // Update existing item instead of adding a new one
        history[existingIndex] = historyItem;
      } else {
        // Add new item to the beginning of the array
        history.unshift(historyItem);
      }
      
      // Limit to 10 items
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      
      localStorage.setItem('anonymous_history', JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error saving local history:', error);
      return false;
    }
  },
  
  /**
   * Clears local history for anonymous users.
   */
  clearLocalHistory() {
    localStorage.removeItem('anonymous_history');
  }
};

export default historyService;