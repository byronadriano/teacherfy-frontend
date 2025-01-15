// src/pages/LessonBuilder/services/googleSlides.js

import { BASE_URL } from "../utils/constants";

/**
 * generateSlides
 * Calls the server to create Google Slides. Server may require Google OAuth.
 */
export async function generateSlides(formState, contentState, token) {
  const response = await fetch(`${BASE_URL}/generate_slides`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      structured_content: contentState.structuredContent,
      meta: {
        lesson_topic: formState.lessonTopic,
        district: formState.district,
        grade_level: formState.gradeLevel,
        subject_focus: formState.subjectFocus,
      },
    }),
  });

  const data = await response.json();
  return { response, data };
}

/**
 * retryGenerateSlides
 * Retries creating Google Slides after the user has completed the OAuth flow.
 */
export async function retryGenerateSlides(token) {
  const pendingData = localStorage.getItem("pendingSlideGeneration");
  if (!pendingData) {
    throw new Error("No pending slide generation data found");
  }

  const response = await fetch(`${BASE_URL}/generate_slides`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: pendingData,
  });

  if (!response.ok) {
    throw new Error("Failed to generate slides after authorization");
  }

  return response.json();
}
