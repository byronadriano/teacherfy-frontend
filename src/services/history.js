// src/services/history.js - CLEANED VERSION
import { API } from '../utils/constants/api';

// Cache storage
let historyCache = {
  data: null,
  timestamp: 0,
  expiresIn: 5000 // 5 seconds - shorter for development debugging
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
   * Generate a content preview for better identification
   */
  generateContentPreview(data) {
    const structuredContent = data.structuredContent || data.structured_content || [];
    
    if (structuredContent.length > 0) {
      const firstSection = structuredContent[0];
      const sectionTitle = firstSection.title || 'Introduction';
      const hasQuestions = firstSection.structured_questions?.length > 0;
      const hasExercises = firstSection.exercises?.length > 0 || firstSection.structured_activities?.length > 0;
      
      const contentTypes = [];
      if (hasQuestions) contentTypes.push('questions');
      if (hasExercises) contentTypes.push('exercises');
      
      return {
        firstSectionTitle: sectionTitle,
        totalSections: structuredContent.length,
        contentTypes,
        summary: `${structuredContent.length} sections starting with "${sectionTitle}"${contentTypes.length > 0 ? ` (includes ${contentTypes.join(', ')})` : ''}`
      };
    }
    
    return {
      firstSectionTitle: 'Content',
      totalSections: 0,
      contentTypes: [],
      summary: 'No structured content available'
    };
  },

  /**
   * Invalidates the history cache
   */
  invalidateCache() {
    historyCache.data = null;
    historyCache.timestamp = 0;
  },

  /**
   * Saves a history item to the server with enhanced details
   */
  async saveHistoryItem(data) {
    try {
      // Create enhanced history item with more details
      const historyItem = {
        id: Date.now(),
        title: data.title || data.lessonTopic || 'Untitled Resource',
        types: Array.isArray(data.resourceType) ? data.resourceType : [data.resourceType || 'Presentation'],
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        lessonData: {
          lessonTopic: data.lessonTopic,
          subjectFocus: data.subjectFocus,
          gradeLevel: data.gradeLevel,
          language: data.language,
          numSections: data.numSections || data.numSlides,
          resourceType: data.resourceType,
          generatedTitle: data.title || data.generatedTitle,
          // Include structured content length for section count display
          sectionsCount: data.structuredContent?.length || data.structured_content?.length || 0,
          // Include the full form data for restoration
          includeImages: data.includeImages,
          customPrompt: data.customPrompt,
          selectedStandards: data.selectedStandards,
          finalOutline: data.finalOutline,
          structuredContent: data.structuredContent,
          generatedResources: data.generatedResources
        },
        // Include a preview of the content for better identification
        preview: this.generateContentPreview(data)
      };

      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Saving history item:', {
          title: historyItem.title,
          types: historyItem.types,
          lessonData: historyItem.lessonData
        });
      }
      
      // Save to local storage as backup
      this.saveLocalHistory(historyItem);
      
      // Try to save to server
      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.USER_HISTORY}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...API.HEADERS,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(historyItem)
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
        title: data.title || data.lessonTopic || 'Untitled Lesson',
        types: Array.isArray(data.resourceType) ? data.resourceType : [data.resourceType || 'Presentation'],
        date: 'Today',
        lessonData: {
          ...data,
          sectionsCount: data.structuredContent?.length || data.structured_content?.length || 0
        }
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
        // Create the data structure that saveHistoryItem expects
        const historyItemData = {
          title: lessonTitle,
          lessonTopic: formState.lessonTopic || lessonTitle,
          resourceType: resourceType,
          subjectFocus: formState.subjectFocus,
          gradeLevel: formState.gradeLevel,
          language: formState.language,
          numSections: formState.numSlides || formState.numSections,
          includeImages: formState.includeImages,
          customPrompt: formState.customPrompt,
          selectedStandards: formState.selectedStandards,
          // Include structured content for preview generation
          structuredContent: contentState.structuredContent || [],
          structured_content: contentState.structuredContent || [], // alternate format
          finalOutline: contentState.finalOutline || '',
          generatedResources: contentState.generatedResources || {},
          generatedTitle: contentState.title
        };
        
        return await this.saveHistoryItem(historyItemData);
      });
      
      const results = await Promise.allSettled(historyPromises);
      
      // Force invalidate cache after all saves
      this.invalidateCache();
      
      // Dispatch custom event to notify components to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('historyUpdated'));
      }
      
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
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Saving local history item:', {
          original: historyItem,
          title: historyItem.title,
          lessonData: historyItem.lessonData
        });
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Updated local history:', history);
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