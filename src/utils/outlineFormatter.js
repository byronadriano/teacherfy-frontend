// src/utils/outlineFormatter.js - CLEANED VERSION

export const OUTLINE_PROMPT_TEMPLATE = `
CRITICAL REQUIREMENTS:
THIS MUST BE A: {resourceType}
THIS LESSON MUST BE ABOUT: {topic}
STANDARDS ALIGNMENT: {standard}
Additional Requirements:
{custom_prompt}

Create a detailed {numSlides}-slide lesson outline in {language} for a {gradeLevel} {subject} lesson on {topic} for {district} in SIMPLE MARKDOWN OR REGULAR TEXT. Each slide must be immediately usable with minimal teacher preparation. Ensure that each slide follows the structure below and includes actual examples or problems where relevant.

1. Title (in {language}):
   - A clear, concise title directly tied to the lesson's objectives.

2. Content (in {language}):
   - Provide complete, specific teaching points, definitions, and examples (not placeholders).
   - Use clear language that is age-appropriate for {gradeLevel} and builds on prior knowledge.
   - For maximum clarity, consider using a two-column layout for complex comparisons or step-by-step procedures.
   - Slide 1 Note: Include the lesson objective in the format: "Students will be able to ..." (in {language}).

3. Teacher Notes (in English):
   - ENGAGEMENT: Provide step-by-step, *fully written out* activities. 
     - Example: If students must solve practice problems, list the actual problems (e.g., "1. ___, 2. ___, 3. ___") so they can be posted or displayed as-is.
   - ASSESSMENT: Describe a clear, direct method to measure understanding, aligned with the exact problems or examples introduced.
     - Example: "Have each group present their solution for Problem #2, explaining how they determined the answer."
   - DIFFERENTIATION: Offer ready-to-use scaffolds (e.g., a printed worksheet with hints) or challenge tasks (e.g., more advanced problems) with explicit details.
     - Example: "Scaffolded Worksheet: 3-step prompt with partially completed examples; Advanced Worksheet: 5 multi-step problems requiring higher-level reasoning."

4. Visual Elements (in English):
   - If referencing problems, list them fully here as well, so teachers can copy or project them instantly.
   - For other aids (e.g., slides, videos, diagrams), specify exactly what they are and how to use them.
   - Provide minimal-prep resources or instructions (e.g., "Use the attached printable fraction chart" or "Draw this simple shape on the board").

FORMAT EACH SLIDE AS FOLLOWS:

Slide X: [Title in {language}]
Content:
- [Exact teaching points, definitions, and examples in {language}]

Teacher Notes:
- ENGAGEMENT: 
  - [List SPECIFIC, ACTUAL, REAL activities or tasks in English with *all* required prompts/steps or problems spelled out fully]
- ASSESSMENT:
  - [Direct SPECIFIC, ACTUAL, REAL methods to measure understanding, in English, referencing the specific tasks introduced under ENGAGEMENT]
- DIFFERENTIATION:
  - [Concrete strategies, e.g., specific worksheets with problems laid out, actual and specific challenge questions, or pairing methods, in English]

Visual Elements:
- [Exact visuals or resources in English, with instructions on how to display or distribute them]

[Repeat for each slide]

IMPLEMENTATION GUIDELINES:
- Avoid any vague wording; provide actual problems, examples, and instructions.
- Maintain a consistent link between the Content (in {language}) and the Teacher Notes + Visual Elements (in English).
- The final product should allow a teacher to copy and paste or read directly with no extra prep or guesswork.

ADDITIONAL NOTES:
- All "Content" must be in {language}. 
- "Teacher Notes" and "Visual Elements" remain in English, containing specific details.
- If students need to see certain problems or examples, ensure those exact items are listed under "Visual Elements" or "Teacher Notes."
- Think of each slide as a ready-made segment of a presentation: Title, actual teaching content, teacher instructions, and prepared visuals/resources.
`;

export const generateFullPrompt = (formState) => {
  return OUTLINE_PROMPT_TEMPLATE
    .replace(/{resourceType}/g, formState.resourceType || 'Not specified')
    .replace(/{topic}/g, formState.lessonTopic || 'Not specified')
    .replace(/{standard}/g, (formState.selectedStandards && formState.selectedStandards.join(', ')) || 'Not specified')
    .replace(/{language}/g, formState.language)
    .replace(/{gradeLevel}/g, formState.gradeLevel)
    .replace(/{subject}/g, formState.subjectFocus)
    .replace(/{numSlides}/g, formState.numSlides)
    .replace(/{custom_prompt}/g, formState.customPrompt || 'None')
    .replace(/{district}/g, formState.district || 'Not specified');
};

export const generateRegenerationPrompt = (formState, modifiedPrompt) => {
  return OUTLINE_PROMPT_TEMPLATE
    .replace(/{numSlides}/g, formState.numSlides)
    .replace(/{language}/g, formState.language)
    .replace(/{gradeLevel}/g, formState.gradeLevel)
    .replace(/{subject}/g, formState.subjectFocus)
    .replace(/{topic}/g, formState.lessonTopic || 'Not specified')
    .replace(/{district}/g, formState.district || 'Not specified')
    .replace(
      /{custom_prompt}/g,
      `
PRIMARY REQUIREMENTS TO ADDRESS:
${formState.customPrompt || 'None'}

ADDITIONAL CRITICAL REQUIREMENTS:
${modifiedPrompt}

INTEGRATION INSTRUCTIONS:
1. Start by fully understanding both sets of requirements.
2. Identify any potential conflicts or overlaps.
3. Prioritize requirements in this order:
   - Additional critical requirements (newest guidance)
   - Primary requirements (original custom prompt)
   - Standard lesson structure and format.
4. Ensure EVERY component of the lesson plan:
   - Explicitly addresses additional requirements.
   - Maintains alignment with original requirements.
   - Follows the standard lesson structure.
5. When modifying content:
   - Make comprehensive changes to fully implement new requirements.
   - Preserve original requirements where compatible.
   - Adapt examples and activities to serve both sets of needs.
6. Review final outline to verify: 
   - Complete implementation of additional requirements.
   - Maintenance of original requirements.
   - Coherent integration of all elements.
`
    );
};

export const formatOutlineForDisplay = (structuredContent) => {
  if (!structuredContent || !Array.isArray(structuredContent)) {
    console.warn('formatOutlineForDisplay: Invalid structured content provided');
    return 'No content available';
  }

  let output = '';

  structuredContent.forEach((item, index) => {
    if (index > 0) {
      output += '\n\n';
    }
    
    const title = item?.title || `Item ${index + 1}`;
    output += `## ${title}\n\n`;
    
    output += '### Content\n\n';
    const content = item?.content || [];
    if (Array.isArray(content)) {
      content.forEach(contentItem => {
        if (contentItem && typeof contentItem === 'string') {
          output += `• ${contentItem}\n`;
        }
      });
    }
    output += '\n';
    
    if (index < structuredContent.length - 1) {
      output += '\n---\n';
    }
  });

  return output.trim();
};