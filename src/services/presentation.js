// src/services/presentation.js
import { httpClient } from './http';
import { API } from '../utils/constants';

export const presentationService = {
  async generatePptx(formData, contentState, token) {
    const response = await httpClient.fetch(API.ENDPOINTS.GENERATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        lesson_outline: contentState.finalOutline,
        structured_content: contentState.structuredContent,
        ...formData,
      }),
    });
    return response.blob();
  },

  async generateGoogleSlides(formData, contentState, token) {
    const { response, data } = await httpClient.fetch(API.ENDPOINTS.GENERATE_SLIDES, {
      method: 'POST',
      credentials: 'include',
      headers: {
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