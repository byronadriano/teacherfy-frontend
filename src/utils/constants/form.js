// src/utils/constants/form.js
export const FORM = {
    GRADES: [
      "Preschool",
      "Kindergarten",
      ...Array.from({ length: 12 }, (_, i) => `${i + 1}th grade`)
    ],
    SUBJECTS: [
      "Arts & music",
      "English language arts",
      "Holidays/seasonal",
      "Math",
      "Science",
      "Social studies",
      "Specialty",
      "World languages"
    ],
    LANGUAGES: [
      "English",
      "Spanish",
      "Chinese (Mandarin)",
      "Tagalog",
      "Vietnamese",
      "Arabic",
      "French",
      "Korean",
      "Russian",
      "Hindi"
    ]
  };