// src/utils/constants/examples.js
export const EXAMPLE_FORM_DATA = {
    gradeLevel: "4th grade",
    subjectFocus: "Math",
    lessonTopic: "Equivalent Fractions",
    district: "Denver Public Schools",
    language: "English",
    customPrompt: [
      "Create a lesson plan that introduces and reinforces key vocabulary.",
      "Include at least three new terms with definitions and examples.",
      "Incorporate a variety of interactive checks for understanding—such as quick formative assessments, short activities, or exit tickets—to ensure students are grasping the concepts throughout the lesson.",
      "Finally, suggest opportunities for students to engage in collaborative or hands-on learning to deepen their understanding and retention"
    ].join(" "),
    numSlides: 5
  };
  
  // Helper function to check if current form matches example configuration
  export const isExampleConfig = (formState) => {
    return (
      formState.gradeLevel === EXAMPLE_FORM_DATA.gradeLevel &&
      formState.subjectFocus === EXAMPLE_FORM_DATA.subjectFocus &&
      formState.lessonTopic === EXAMPLE_FORM_DATA.lessonTopic &&
      formState.district === EXAMPLE_FORM_DATA.district &&
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
- Hands-on fraction strips for each student


Slide 3: Finding Equivalent Fractions Together
Content:
- When we multiply 1/2 by 2/2, we get 2/4
- It's like taking a hiking trail that's 1/2 mile long and marking it every quarter mile - you'll have 2/4 of the trail at the same spot as 1/2!
- Your turn: Try finding an equivalent fraction for 2/3

Teacher Notes:
- ENGAGEMENT: Use Rocky Mountain National Park trail maps for real-world connections; encourage peer discussion in preferred language.
- ASSESSMENT: Model think-aloud strategy and ask students to share their reasoning.
- DIFFERENTIATION: Provide scaffolds like step-by-step multiplication visuals; advanced learners can find multiple equivalent fractions (e.g., 2/3 = 4/6 = 6/9).

Visual Elements:
- Trail map showing different fraction representations
- Digital manipulatives for student exploration


Slide 4: Your Turn to Create!
Content:
- Time to become fraction experts!
- Work with your partner to create equivalent fraction cards
- Use different colors to show equal parts
- Challenge: Can you find three different fractions that equal 1/2?
- Bonus: Create a story problem using equivalent fractions and your favorite Denver activity

Teacher Notes:
- ENGAGEMENT: Provide bilingual instruction cards; allow student choice in examples.
- ASSESSMENT: Check each pair’s fraction cards and see if they are correct matches.
- DIFFERENTIATION: Offer visual support or partially completed fraction cards for struggling students; challenge advanced learners to create multi-step word problems.

Visual Elements:
- Sample fraction cards with local themes
- Student workspace organization guide
- Visual success criteria


Slide 5: Show What You Know!
Content:
- Let's celebrate what we learned!
- Create three equivalent fractions for 3/4
- Draw a picture showing how you know they're equal
- Write a story about using equivalent fractions in your neighborhood
- Share your favorite way to remember equivalent fractions

Teacher Notes:
- ENGAGEMENT: Have students explain their fractions to a partner or small group.
- ASSESSMENT: Provide multiple ways to demonstrate understanding; accept explanations in English or home language.
- DIFFERENTIATION: Use exit ticket responses to plan next lesson; advanced students can convert any improper fraction results to mixed numbers.

Visual Elements:
- Culturally responsive exit ticket template
- Digital portfolio upload guide
- Self-assessment checklist in multiple languages`
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
    },
    {
    "title": "Finding Equivalent Fractions Together",
    "layout": "TWO_COLUMNS",
    "content": [],
    "teacher_notes": [
        "ENGAGEMENT: Use Rocky Mountain National Park trail maps for real-world connections; encourage peer discussion in preferred language",
        "ASSESSMENT: Model think-aloud strategy and ask students to share their reasoning",
        "DIFFERENTIATION: Provide step-by-step multiplication visuals for extra support; advanced learners can find multiple equivalents"
    ],
    "visual_elements": [
        "Trail map showing different fraction representations",
        "Digital manipulatives for student exploration"
    ],
    "left_column": [
        "Let's practice together!",
        "When we multiply 1/2 by 2/2, we get 2/4",
        "It's like taking a hiking trail that's 1/2 mile long and marking it every quarter mile - you'll have 2/4 of the trail at the same spot as 1/2!",
        "Your turn: Try finding an equivalent fraction for 2/3"
    ],
    "right_column": [
        "Check your understanding:",
        "Use your fraction strips to show how 1/2 = 2/4",
        "Draw a picture to prove your answer",
        "Share your strategy with your partner"
    ]
    },
    {
    "title": "Your Turn to Create!",
    "layout": "TITLE_AND_CONTENT",
    "content": [
        "Time to become fraction experts!",
        "Work with your partner to create equivalent fraction cards",
        "Use different colors to show equal parts",
        "Challenge: Can you find three different fractions that equal 1/2?",
        "Bonus: Create a story problem using equivalent fractions and your favorite Denver activity"
    ],
    "teacher_notes": [
        "ENGAGEMENT: Provide bilingual instruction cards; allow student choice in examples",
        "ASSESSMENT: Check each pair’s fraction cards for correctness",
        "DIFFERENTIATION: Offer visual support or partially completed fraction cards for struggling students; challenge advanced learners with multi-step word problems"
    ],
    "visual_elements": [
        "Sample fraction cards with local themes",
        "Student workspace organization guide",
        "Visual success criteria"
    ],
    "left_column": [],
    "right_column": []
    },
    {
    "title": "Show What You Know!",
    "layout": "TITLE_AND_CONTENT",
    "content": [
        "Let's celebrate what we learned!",
        "Create three equivalent fractions for 3/4",
        "Draw a picture showing how you know they're equal",
        "Write a story about using equivalent fractions in your neighborhood",
        "Share your favorite way to remember equivalent fractions"
    ],
    "teacher_notes": [
        "ENGAGEMENT: Have students explain their fractions to a partner or small group",
        "ASSESSMENT: Provide multiple ways to demonstrate understanding; accept explanations in English or home language",
        "DIFFERENTIATION: Use exit ticket responses to plan next lesson; advanced students can convert any improper results to mixed numbers"
    ],
    "visual_elements": [
        "Culturally responsive exit ticket template",
        "Digital portfolio upload guide",
        "Self-assessment checklist in multiple languages"
    ],
    "left_column": [],
    "right_column": []
    }
]
};