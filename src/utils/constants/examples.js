// src/utils/constants/examples.js
export const EXAMPLE_FORM_DATA = {
    resourceType: "Presentation",
    gradeLevel: "4th grade",
    subjectFocus: "Math",
    selectedStandards: ["4.NF.1"], // Updated for new array format
    language: "English",
    customPrompt: "Create a lesson plan that introduces and reinforces key vocabulary. Include at least three new terms with definitions and examples. Incorporate a variety of interactive checks for understanding—such as quick formative assessments, short activities, or exit tickets—to ensure students are grasping the concepts throughout the lesson.",
    numSlides: 5,
    includeImages: true,
    numQuestions: 5,
    includeAnswerKey: true,
    includeDifferentiation: true
  };
  
  // Helper function to check if current form matches example configuration
  export const isExampleConfig = (formState) => {
    return (
      formState.resourceType === EXAMPLE_FORM_DATA.resourceType &&
      formState.gradeLevel === EXAMPLE_FORM_DATA.gradeLevel &&
      formState.subjectFocus === EXAMPLE_FORM_DATA.subjectFocus &&
      JSON.stringify(formState.selectedStandards) === JSON.stringify(EXAMPLE_FORM_DATA.selectedStandards) &&
      formState.language === EXAMPLE_FORM_DATA.language &&
      formState.customPrompt === EXAMPLE_FORM_DATA.customPrompt &&
      formState.numSlides === EXAMPLE_FORM_DATA.numSlides
    );
  };


export const EXAMPLE_OUTLINE = {
"messages": [
    `Slide 1: Let's Explore Equivalent Fractions!
Content:
- Students will be able to recognize and create equivalent fractions in everyday situations, like sharing cookies, pizza, or our favorite Colorado trail mix.
- Students will be able to explain why different fractions can show the same amount using pictures and numbers.

Teacher Notes:
- ENGAGEMENT: Begin with students sharing their experiences with fractions in their daily lives.
- ASSESSMENT: Ask questions about daily fraction use and note which students grasp the concept.
- DIFFERENTIATION: Use culturally relevant examples from Denver communities, and encourage bilingual students to share fraction terms in their home language.

Visual Elements:
- Interactive display showing local treats divided into equivalent parts
- Student-friendly vocabulary cards with pictures


Slide 2: What Are Equivalent Fractions?
Content:
- Let's learn our fraction vocabulary!
- Imagine sharing a breakfast burrito with your friend - you can cut it in half (1/2) or into four equal pieces and take two (2/4). You get the same amount!
- The top number (numerator) tells us how many pieces we have
- The bottom number (denominator) tells us how many total equal pieces
- When fractions show the same amount, we call them equivalent

Teacher Notes:
- ENGAGEMENT: Use local food examples (burritos, pizza) familiar to Denver students.
- ASSESSMENT: Connect math vocabulary to real experiences; gauge student responses.
- DIFFERENTIATION: Encourage students to create their own examples or use fraction strips.

Visual Elements:
- Animation of a burrito being cut into different equivalent portions
- Interactive fraction wall labeled in English and Spanish
- Hands-on fraction strips for each student`
],
"structured_content": [
    {
    "title": "Let's Explore Equivalent Fractions!",
    "layout": "TITLE_AND_CONTENT",
    "content": [
        "Students will be able to recognize and create equivalent fractions in everyday situations, like sharing cookies, pizza, or our favorite Colorado trail mix",
        "Students will be able to explain why different fractions can show the same amount using pictures and numbers"
    ],
    "teacher_notes": [
        "ENGAGEMENT: Begin with students sharing their experiences with fractions in their daily lives",
        "ASSESSMENT: Ask questions about daily fraction use and note which students grasp the concept",
        "DIFFERENTIATION: Use culturally relevant examples from Denver communities; encourage bilingual students to share fraction terms in their home language"
    ],
    "visual_elements": [
        "Interactive display showing local treats divided into equivalent parts",
        "Student-friendly vocabulary cards with pictures"
    ],
    "left_column": [],
    "right_column": []
    },
    {
    "title": "What Are Equivalent Fractions?",
    "layout": "TITLE_AND_CONTENT",
    "content": [
        "Let's learn our fraction vocabulary!",
        "Imagine sharing a breakfast burrito with your friend - you can cut it in half (1/2) or into four equal pieces and take two (2/4). You get the same amount!",
        "The top number (numerator) tells us how many pieces we have",
        "The bottom number (denominator) tells us how many total equal pieces",
        "When fractions show the same amount, we call them equivalent"
    ],
    "teacher_notes": [
        "ENGAGEMENT: Use local food examples (burritos, pizza) familiar to Denver students",
        "ASSESSMENT: Connect math vocabulary to real experiences; gauge student responses",
        "DIFFERENTIATION: Encourage students to create their own examples or use fraction strips"
    ],
    "visual_elements": [
        "Animation of a burrito being cut into different equivalent portions",
        "Interactive fraction wall labeled in English and Spanish",
        "Hands-on fraction strips for each student"
    ],
    "left_column": [],
    "right_column": []
    }
]
};