// src/services/presentation.js
import { config } from '../utils/config';

export const presentationService = {
  async generatePptx(formState, contentState) {
    try {
      const response = await fetch(`${config.apiUrl}/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        },
        body: JSON.stringify({
          lesson_outline: contentState.finalOutline || '',
          structured_content: contentState.structuredContent,
          ...formState,
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;

    } catch (error) {
      console.error('Presentation generation error:', error);
      throw error;
    }
  }
};