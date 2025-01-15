// src/pages/LessonBuilder/services/api.js

import axios from "axios";
import { BASE_URL } from "../utils/constants";

/**
 * trackUserActivity
 * Logs user activity to the server.
 * @param {String} activity - Type of activity, e.g. "Generated Outline"
 * @param {Object} user - The user object (email, name, etc.)
 * @param {String} token - Authorization token
 * @param {Object} [lessonData] - Optional lesson data to log
 */
export async function trackUserActivity(activity, user, token, lessonData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const payload = {
      activity,
      email: user?.email,
      name: user?.name,
      given_name: user?.given_name,
      family_name: user?.family_name,
    };

    // For certain activities, attach lesson data
    if (activity === "Downloaded Presentation" && lessonData) {
      payload.lesson_data = lessonData;
    }

    const response = await fetch(`${BASE_URL}/track_activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Activity tracking failed:", error);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * getOutline
 * Generates an outline on the server using the provided form data.
 */
export async function getOutline(formState, token, fullPrompt) {
  const { gradeLevel, subjectFocus, lessonTopic, district, language, numSlides } = formState;

  const response = await axios.post(
    `${BASE_URL}/outline`,
    {
      grade_level: gradeLevel,
      subject_focus: subjectFocus,
      lesson_topic: lessonTopic,
      district,
      language,
      custom_prompt: fullPrompt,
      num_slides: Math.min(Math.max(Number(numSlides) || 3, 1), 10),
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

/**
 * regenerateOutline
 * Regenerates an outline with a "regeneration_prompt".
 */
export async function regenerateOutline(formState, token, regenerationPrompt) {
  const {
    gradeLevel,
    subjectFocus,
    lessonTopic,
    district,
    language,
    customPrompt,
    numSlides,
  } = formState;

  const response = await axios.post(
    `${BASE_URL}/outline`,
    {
      grade_level: gradeLevel,
      subject_focus: subjectFocus,
      lesson_topic: lessonTopic,
      district,
      language,
      custom_prompt: customPrompt,
      regeneration_prompt: regenerationPrompt,
      num_slides: numSlides,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

/**
 * generatePptx
 * Requests a PPTX from the server using the final outline and form data.
 */
export async function generatePptx(formState, contentState, token) {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      lesson_outline: contentState.finalOutline,
      structured_content: contentState.structuredContent,
      lesson_topic: formState.lessonTopic,
      district: formState.district,
      grade_level: formState.gradeLevel,
      subject_focus: formState.subjectFocus,
      custom_prompt: formState.customPrompt,
      num_slides: Number(formState.numSlides),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate presentation");
  }

  return response.blob();
}
