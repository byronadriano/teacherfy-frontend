// src/services/presentation.js
import { httpClient } from './http';
import { API } from '../utils/constants';

export const presentationService = {
  async generatePptx(formData, contentState, token) {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Only add auth header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await httpClient.fetch(API.ENDPOINTS.GENERATE, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        lesson_outline: contentState.finalOutline,
        structured_content: contentState.structuredContent,
        ...formData,
      }),
    });
    return response.blob();
  },

  async generateGoogleSlides(formData, contentState, token) {
    if (!token) {
      throw new Error('Authentication required for Google Slides generation');
    }

    const { response, data } = await httpClient.fetch(API.ENDPOINTS.GENERATE_SLIDES, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        structured_content: contentState.structuredContent,
        meta: {
          lesson_topic: formData.lessonTopic,
          district: formData.district,
          grade_level: formData.gradeLevel,
          subject_focus: formData.subjectFocus,
        },
      }),
    }).then(async res => ({
      response: res,
      data: await res.json()
    }));

    return { response, data };
  }
};