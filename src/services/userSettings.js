// services/userSettings.js

const USER_SETTINGS_KEY = 'userSettings';

// Default settings structure
export const DEFAULT_SETTINGS = {
  defaultGrade: '',
  defaultSubject: '',
  defaultLanguage: 'English',
  defaultSlides: 5,
  alwaysIncludeImages: false
};

/**
 * User Settings Service
 * Currently uses localStorage for persistence.
 * Can be extended to use backend API for cross-device sync.
 */
export class UserSettingsService {
  /**
   * Load user settings from storage
   * @returns {Object} User settings object
   */
  static loadSettings() {
    try {
      const savedSettings = localStorage.getItem(USER_SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      // Clear corrupted data
      localStorage.removeItem(USER_SETTINGS_KEY);
    }
    return DEFAULT_SETTINGS;
  }

  /**
   * Save user settings to storage
   * @param {Object} settings - Settings object to save
   * @returns {boolean} Success status
   */
  static saveSettings(settings) {
    try {
      const settingsToSave = { ...DEFAULT_SETTINGS, ...settings };
      localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settingsToSave));
      console.log('User settings saved:', settingsToSave);
      return true;
    } catch (error) {
      console.error('Error saving user settings:', error);
      return false;
    }
  }

  /**
   * Clear all user settings
   */
  static clearSettings() {
    try {
      localStorage.removeItem(USER_SETTINGS_KEY);
      console.log('User settings cleared');
      return true;
    } catch (error) {
      console.error('Error clearing user settings:', error);
      return false;
    }
  }

  /**
   * Check if settings exist
   * @returns {boolean} True if settings exist
   */
  static hasSettings() {
    return localStorage.getItem(USER_SETTINGS_KEY) !== null;
  }

  /**
   * Apply settings to form state (helper function)
   * @param {Object} settings - Settings to apply
   * @param {Object} currentFormState - Current form state
   * @param {Function} handleFormChange - Form change handler
   */
  static applySettingsToForm(settings, currentFormState, handleFormChange) {
    // Only apply defaults if the field is empty
    if (settings.defaultGrade && !currentFormState.gradeLevel) {
      handleFormChange('gradeLevel', settings.defaultGrade);
    }
    
    if (settings.defaultSubject && !currentFormState.subjectFocus) {
      handleFormChange('subjectFocus', settings.defaultSubject);
    }
    
    if (settings.defaultLanguage && !currentFormState.language) {
      handleFormChange('language', settings.defaultLanguage);
    }
    
    if (settings.defaultSlides && !currentFormState.numSlides) {
      handleFormChange('numSlides', settings.defaultSlides);
    }
    
    if (settings.alwaysIncludeImages && currentFormState.includeImages === undefined) {
      handleFormChange('includeImages', true);
    }
  }
}

// TODO: Backend API integration
// Uncomment and implement when backend is ready
/*
export class BackendUserSettingsService extends UserSettingsService {
  static async loadSettings(userId, token) {
    try {
      const response = await fetch(`/api/users/${userId}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const settings = await response.json();
        return { ...DEFAULT_SETTINGS, ...settings };
      }
    } catch (error) {
      console.error('Error loading settings from backend:', error);
    }
    
    // Fallback to localStorage
    return super.loadSettings();
  }

  static async saveSettings(settings, userId, token) {
    try {
      const response = await fetch(`/api/users/${userId}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        // Also save to localStorage as backup
        super.saveSettings(settings);
        return true;
      }
    } catch (error) {
      console.error('Error saving settings to backend:', error);
    }
    
    // Fallback to localStorage
    return super.saveSettings(settings);
  }
}
*/

export default UserSettingsService;
