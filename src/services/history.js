// src/services/history.js - FIXED VERSION
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
        console.log('📦 Using cached history data');
        return historyCache.data;
      }
      
      console.log('🔍 Fetching user history from server...');
      
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.USER_HISTORY}`, {
        method: 'GET',
        credentials: 'include', // CRITICAL: Include cookies for Flask sessions
        headers: {
          ...API.HEADERS,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Cache the successful response
      if (responseData && !responseData.error) {
        historyCache.data = responseData;
        historyCache.timestamp = now;
        console.log('✅ History cached successfully');
      }
      
      return responseData;
    } catch (error) {
      console.error('❌ Error fetching user history:', error);
      
      // If we have cached data, return it even if expired
      if (historyCache.data) {
        console.log('📦 Returning stale cached history due to error');
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
    console.log('🗑️ History cache invalidated');
  },

  /**
   * Saves a history item to the server.
   * For authenticated users, it saves to the database.
   * For anonymous users, it saves to the session.
   */
  async saveHistoryItem(data) {
    try {
      console.log('💾 Saving history item:', {
        title: data.title,
        resourceType: data.resourceType
      });
      
      // First save to local storage as backup
      this.saveLocalHistory({
        id: Date.now(),
        title: data.title,
        types: [data.resourceType],
        date: 'Today',
        lessonData: data.lessonData
      });
      
      // Then try to save to server with proper session handling
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.USER_HISTORY}`, {
        method: 'POST',
        credentials: 'include', // CRITICAL: Include cookies for Flask sessions
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
      console.log('✅ History saved to server:', serverResponse);
      
      // Invalidate the cache so next getUserHistory call will fetch fresh data
      this.invalidateCache();
      
      return serverResponse;
    } catch (error) {
      console.error('❌ Error saving history item to server:', error);
      
      // Save to local storage if server save fails
      this.saveLocalHistory({
        id: Date.now(),
        title: data.title,
        types: [data.resourceType],
        date: 'Today',
        lessonData: data.lessonData
      });
      
      // Don't throw - allow the app to continue
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear history for the current user
   */
  async clearHistory() {
    try {
      console.log('🗑️ Clearing history...');
      
      // First clear local storage
      this.clearLocalHistory();
      
      // Then try to clear server history
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.CLEAR_HISTORY}`, {
        method: 'POST',
        credentials: 'include', // CRITICAL: Include cookies for Flask sessions
        headers: {
          ...API.HEADERS,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const clearResponse = await response.json();
      console.log('✅ History cleared from server:', clearResponse);
      
      // Invalidate the cache
      this.invalidateCache();
      
      return { success: true, response: clearResponse };
    } catch (error) {
      console.error('❌ Error clearing history from server:', error);
      return { 
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Track lesson generation for history.
   * Enhanced to use the generated title from the outline and proper session handling.
   */
  async trackLessonGeneration(formState, contentState) {
    try {
      // Extract the generated title from contentState if available
      const lessonTitle = contentState.title || 
                        formState.lessonTopic || 
                        formState.subjectFocus || 
                        'Untitled Lesson';
      
      console.log('💾 Tracking lesson generation with title:', lessonTitle);
      
      // Handle resource types properly
      let resourceTypes;
      if (Array.isArray(formState.resourceType)) {
        resourceTypes = formState.resourceType;
      } else if (formState.resourceType) {
        resourceTypes = [formState.resourceType];
      } else {
        resourceTypes = ['Presentation']; // Default fallback
      }
      
      console.log('📝 Resource types to save:', resourceTypes);
      
      // Save each resource type separately for better tracking
      const historyPromises = resourceTypes.map(async (resourceType) => {
        const historyItem = {
          title: lessonTitle,
          resourceType: resourceType, // Single resource type per item
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
      
      // Wait for all history items to be saved
      const results = await Promise.allSettled(historyPromises);
      console.log('✅ All history items processed:', results);
      
      return { success: true, results };
    } catch (error) {
      console.error('❌ Error tracking lesson generation:', error);
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
      console.error('❌ Error reading local history:', error);
      return [];
    }
  },
  
  /**
   * Saves history to local storage for anonymous users.
   */
  saveLocalHistory(historyItem) {
    try {
      let history = this.getLocalHistory();
      
      // Create a unique ID if one doesn't exist
      if (!historyItem.id) {
        historyItem.id = Date.now();
      }
      
      // Ensure we have a good title
      if (!historyItem.title || historyItem.title === 'Untitled Lesson') {
        if (historyItem.lessonData) {
          historyItem.title = historyItem.lessonData.generatedTitle || 
                             historyItem.lessonData.lessonTopic || 
                             historyItem.lessonData.subjectFocus || 
                             'Educational Resource';
        }
      }
      
      console.log('💾 Saving local history item with title:', historyItem.title);
      
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
      console.error('❌ Error saving local history:', error);
      return false;
    }
  },
  
  /**
   * Clears local history for anonymous users.
   */
  clearLocalHistory() {
    localStorage.removeItem('anonymous_history');
    console.log('🗑️ Local history cleared');
  }
};

export default historyService;