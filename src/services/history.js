// src/services/history.js - CLEANED VERSION
import { API } from '../utils/constants/api';

// Cache storage
let historyCache = {
  data: null,
  timestamp: 0,
  expiresIn: process.env.NODE_ENV === 'development' ? 1000 : 5000 // 1 second in dev for debugging
};

export const historyService = {
  /**
   * Fetches user history from the server with caching
   */
  async getUserHistory() {
    try {
      // Check cache first - but be more aggressive about cache invalidation
      const now = Date.now();
      if (historyCache.data && (now - historyCache.timestamp < historyCache.expiresIn)) {
        // For development, always return fresh data to help debug issues
        if (process.env.NODE_ENV === 'development') {
          console.log('Using cached history data');
        }
        return historyCache.data;
      }
      
      // Fetch logging removed to reduce noise

      const response = await fetch(`${API.BASE_URL}${API.ENDPOINTS.USER_HISTORY}`, {
        method: 'GET',
        credentials: 'include',
        headers: API.HEADERS,
      });
      
      // Response status logging removed to reduce noise
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Raw response logging removed to reduce noise
      
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
   * Clean up duplicate entries from cache and local storage
   */
  cleanupDuplicates() {
    try {
      // Clean local storage
      const localHistory = this.getLocalHistory();
      const uniqueHistory = [];
      const seenItems = new Set();
      
      localHistory.forEach(item => {
        const key = `${item.title}_${item.lessonData?.lessonTopic}_${Math.floor((item.timestamp || 0) / 300000)}`;
        if (!seenItems.has(key)) {
          seenItems.add(key);
          uniqueHistory.push(item);
        }
      });
      
      if (uniqueHistory.length !== localHistory.length) {
        localStorage.setItem('anonymous_history', JSON.stringify(uniqueHistory));
        console.log(`Cleaned up ${localHistory.length - uniqueHistory.length} duplicate local history items`);
      }
      
      // Invalidate cache to force fresh fetch
      this.invalidateCache();
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
    }
  },

  /**
   * Saves a history item to the server with enhanced details
   */
  async saveHistoryItem(data) {
    try {
      // Backend now handles duplicate detection with content hashing
      
      // Create enhanced history item with more details
      // Detect actual generated resource types from generatedResources
      const getActualResourceTypes = () => {
        if (data.generatedResources && typeof data.generatedResources === 'object') {
          const generatedTypes = Object.keys(data.generatedResources).filter(key => 
            data.generatedResources[key] && 
            (Array.isArray(data.generatedResources[key]) ? data.generatedResources[key].length > 0 : true)
          );
          
          if (generatedTypes.length > 0) {
            // Capitalize first letter of each type
            return generatedTypes.map(type => 
              type.charAt(0).toUpperCase() + type.slice(1)
            );
          }
        }
        
        // Fallback to original logic - support both resourceType and resourceTypes
        if (data.resourceTypes && Array.isArray(data.resourceTypes)) {
          return data.resourceTypes;
        }
        return Array.isArray(data.resourceType) ? data.resourceType : [data.resourceType || 'Presentation'];
      };
      
      const historyItem = {
        id: Date.now(),
        title: data.title || data.lessonTopic || 'Untitled Resource',
        types: getActualResourceTypes(),
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
        console.log('💾 Attempting to save history item to backend:', {
          title: historyItem.title,
          types: historyItem.types,
          endpoint: `${API.BASE_URL}${API.ENDPOINTS.USER_HISTORY}`,
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 Save history response status:', response.status);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Save history failed:', errorText);
        }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const serverResponse = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Save history server response:', serverResponse);
      }
      
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
      
      // Handle resource types properly - support both resourceType and resourceTypes
      let resourceTypes;
      if (formState.resourceTypes && Array.isArray(formState.resourceTypes)) {
        // Multi-resource request uses resourceTypes (plural)
        resourceTypes = formState.resourceTypes;
      } else if (formState.resourceType) {
        // Single resource request uses resourceType (singular)
        resourceTypes = Array.isArray(formState.resourceType) 
          ? formState.resourceType 
          : [formState.resourceType];
      } else {
        resourceTypes = ['Presentation'];
      }
      
      // Create single history item with all resource types
      const historyItemData = {
        title: lessonTitle,
        lessonTopic: formState.lessonTopic || lessonTitle,
        resourceType: resourceTypes, // Keep as array
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
      
      // Save single item instead of multiple
      const result = await this.saveHistoryItem(historyItemData);
      
      // Force invalidate cache after save
      this.invalidateCache();
      
      // Dispatch custom event to notify components to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('historyUpdated'));
      }
      
      return { success: true, result };
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
      
      // Simple duplicate detection for local storage
      const existingIndex = history.findIndex(item => 
        item.title === historyItem.title && 
        item.lessonData?.lessonTopic === historyItem.lessonData?.lessonTopic
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