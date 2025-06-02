// src/services/history.js - CLEANED VERSION
import { API } from '../utils/constants/api';

// Cache storage
let historyCache = {
  data: null,
  timestamp: 0,
  expiresIn: 30000 // 30 seconds
};

export const historyService = {
  /**
   * Fetches user history from the server with caching
   */
  async getUserHistory() {
    try {
      // Check cache first
      const now = Date.now();
      if (historyCache.data && (now - historyCache.timestamp < historyCache.expiresIn)) {
        return historyCache.data;
      }
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.USER_HISTORY}`, {
        method: 'GET',
        credentials: 'include',
        headers: API.HEADERS,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Cache successful response
      if (responseData && !responseData.error) {
        historyCache.data = responseData;
        historyCache.timestamp = now;
      }
      
      return responseData;
    } catch (error) {
      console.error('Error fetching user history:', error);
      
      // Return cached data if available
      if (historyCache.data) {
        return historyCache.data;
      }
      
      return { 
        history: [], 
        user_authenticated: false,
        error: error.message
      };
    }
  },

  /**
   * Invalidates the history cache
   */
  invalidateCache() {
    historyCache.data = null;
    historyCache.timestamp = 0;
  },

  /**
   * Saves a history item to the server
   */
  async saveHistoryItem(data) {
    try {
      // Save to local storage as backup
      this.saveLocalHistory({
        id: Date.now(),
        title: data.title,
        types: [data.resourceType],
        date: 'Today',
        lessonData: data.lessonData
      });
      
      // Try to save to server
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.USER_HISTORY}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...API.HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const serverResponse = await response.json();
      
      // Invalidate cache to force refresh
      this.invalidateCache();
      
      return serverResponse;
    } catch (error) {
      console.error('Error saving history item to server:', error);
      
      // Ensure local storage backup
      this.saveLocalHistory({
        id: Date.now(),
        title: data.title,
        types: [data.resourceType],
        date: 'Today',
        lessonData: data.lessonData
      });
      
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear history for the current user
   */
  async clearHistory() {
    try {
      // Clear local storage first
      this.clearLocalHistory();
      
      // Clear server history
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.CLEAR_HISTORY}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...API.HEADERS,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const clearResponse = await response.json();
      
      // Invalidate cache
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
   * Track lesson generation for history
   */
  async trackLessonGeneration(formState, contentState) {
    try {
      const lessonTitle = contentState.title || 
                        formState.lessonTopic || 
                        formState.subjectFocus || 
                        'Untitled Lesson';
      
      // Handle resource types properly
      let resourceTypes = Array.isArray(formState.resourceType) 
        ? formState.resourceType 
        : formState.resourceType ? [formState.resourceType] : ['Presentation'];
      
      // Save each resource type separately
      const historyPromises = resourceTypes.map(async (resourceType) => {
        const historyItem = {
          title: lessonTitle,
          resourceType: resourceType,
          lessonData: {
            ...formState,
            generatedTitle: contentState.title,
            resourceType: resourceType,
            structuredContent: contentState.structuredContent?.map(slide => ({
              title: slide.title || '',
              layout: slide.layout || 'TITLE_AND_CONTENT',
              content: Array.isArray(slide.content) ? [...slide.content] : [],
              teacher_notes: Array.isArray(slide.teacher_notes) ? [...slide.teacher_notes] : [],
              visual_elements: Array.isArray(slide.visual_elements) ? [...slide.visual_elements] : [],
              left_column: Array.isArray(slide.left_column) ? [...slide.left_column] : [],
              right_column: Array.isArray(slide.right_column) ? [...slide.right_column] : []
            })) || [],
            finalOutline: contentState.finalOutline || '',
            generatedResources: contentState.generatedResources || {}
          }
        };
        
        return await this.saveHistoryItem(historyItem);
      });
      
      const results = await Promise.allSettled(historyPromises);
      return { success: true, results };
    } catch (error) {
      console.error('Error tracking lesson generation:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Local storage methods for anonymous users
   */
  getLocalHistory() {
    try {
      const localHistory = localStorage.getItem('anonymous_history');
      return localHistory ? JSON.parse(localHistory) : [];
    } catch (error) {
      console.error('Error reading local history:', error);
      return [];
    }
  },
  
  saveLocalHistory(historyItem) {
    try {
      let history = this.getLocalHistory();
      
      if (!historyItem.id) {
        historyItem.id = Date.now();
      }
      
      // Ensure good title
      if (!historyItem.title || historyItem.title === 'Untitled Lesson') {
        if (historyItem.lessonData) {
          historyItem.title = historyItem.lessonData.generatedTitle || 
                             historyItem.lessonData.lessonTopic || 
                             historyItem.lessonData.subjectFocus || 
                             'Educational Resource';
        }
      }
      
      // Check for existing item
      const existingIndex = history.findIndex(item => 
        item.title === historyItem.title && 
        JSON.stringify(item.types) === JSON.stringify(historyItem.types)
      );
      
      if (existingIndex >= 0) {
        history[existingIndex] = historyItem;
      } else {
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
  
  clearLocalHistory() {
    localStorage.removeItem('anonymous_history');
  }
};

export default historyService;