// src/utils/outlineFormatter.js

export const OUTLINE_PROMPT_TEMPLATE = `
CRITICAL REQUIREMENTS:
THIS MUST BE A: {resourceType}
THIS LESSON MUST BE ABOUT: {topic}
STANDARDS ALIGNMENT: {standard}
Additional Requirements:
{custom_prompt}

Create a detailed {numSlides}-slide lesson outline in {language} for a {gradeLevel} {subject} lesson on {topic} for {district} in SIMPLE MARKDOWN OR REGULAR TEXT. Each slide must be immediately usable with minimal teacher preparation. Ensure that each slide follows the structure below and includes actual examples or problems where relevant.

1. Title (in {language}):
   - A clear, concise title directly tied to the lesson’s objectives.

2. Content (in {language}):
   - Provide complete, specific teaching points, definitions, and examples (not placeholders).
   - Use clear language that is age-appropriate for {gradeLevel} and builds on prior knowledge.
   - For maximum clarity, consider using a two-column layout for complex comparisons or step-by-step procedures.
   - Slide 1 Note: Include the lesson objective in the format: "Students will be able to ..." (in {language}).

3. Teacher Notes (in English):
   - ENGAGEMENT: Provide step-by-step, *fully written out* activities. 
     - Example: If students must solve practice problems, list the actual problems (e.g., “1. ___, 2. ___, 3. ___”) so they can be posted or displayed as-is.
   - ASSESSMENT: Describe a clear, direct method to measure understanding, aligned with the exact problems or examples introduced.
     - Example: “Have each group present their solution for Problem #2, explaining how they determined the answer.”
   - DIFFERENTIATION: Offer ready-to-use scaffolds (e.g., a printed worksheet with hints) or challenge tasks (e.g., more advanced problems) with explicit details.
     - Example: “Scaffolded Worksheet: 3-step prompt with partially completed examples; Advanced Worksheet: 5 multi-step problems requiring higher-level reasoning.”

4. Visual Elements (in English):
   - If referencing problems, list them fully here as well, so teachers can copy or project them instantly.
   - For other aids (e.g., slides, videos, diagrams), specify exactly what they are and how to use them.
   - Provide minimal-prep resources or instructions (e.g., “Use the attached printable fraction chart” or “Draw this simple shape on the board”).

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
- All “Content” must be in {language}. 
- “Teacher Notes” and “Visual Elements” remain in English, containing specific details.
- If students need to see certain problems or examples, ensure those exact items are listed under “Visual Elements” or “Teacher Notes.”
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
    // .replace(/{district}/g, formState.district || 'Not specified');
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
  let output = '';

  structuredContent.forEach((slide, index) => {
    if (index > 0) {
      output += '\n\n';
    }
    output += `## Slide ${index + 1}: ${slide.title}\n\n`;
    output += '### Content\n\n';
    slide.content.forEach(item => {
      const wrappedContent = item.split(/(?<=\. )/g).join('\n  ');
      output += `• ${wrappedContent}\n`;
    });
    output += '\n';
    output += '### Teacher Notes\n\n';
    const noteTypes = ['ENGAGEMENT', 'ASSESSMENT', 'DIFFERENTIATION'];
    noteTypes.forEach(type => {
      const typeNotes = slide.teacher_notes.filter(note => note.startsWith(type));
      if (typeNotes.length > 0) {
        output += `**${type}:**\n`;
        typeNotes.forEach(note => {
          const cleanNote = note.replace(`${type}: `, '').trim();
          output += `  • ${cleanNote}\n`;
        });
        output += '\n';
      }
    });
    output += '### Visual Elements\n\n';
    if (slide.visual_elements && slide.visual_elements.length > 0) {
      slide.visual_elements.forEach(element => {
        if (element !== '--') {
          output += `• ${element}\n`;
        }
      });
    } else {
      output += '• (None provided)\n';
    }
    output += '\n';
    if (index < structuredContent.length - 1) {
      output += '\n---\n';
    }
  });

  return output.trim();
};

export const parseOutlineToStructured = (outlineText, numSlides) => {
  // Normalize markdown bold syntax.
  const normalizedText = outlineText.replace(/\*\*Slide (\d+):/g, 'Slide $1:');
  
  // Split the text by slide markers.
  const slides = normalizedText
    .split(/\n(?=(?:\*\*)?Slide \d+:)/)
    .filter(Boolean)
    .map(slide => slide.trim());

  const structuredSlides = [];

  const extractSection = (slideText, sectionName) => {
    // Create a regex for the section header (handles bold and non-bold).
    const sectionPattern = new RegExp(`(?:\\*\\*)?${sectionName}:`, 'i');
    const sectionStart = slideText.search(sectionPattern);
    
    if (sectionStart === -1) {
      console.debug(`Section ${sectionName} not found in slide text`);
      return [];
    }

    // Determine where the section ends by looking for the next section header.
    const nextSections = ['Content:', 'Teacher Notes:', 'Visual Elements:'];
    let sectionEnd = slideText.length;
    
    nextSections.forEach(nextSection => {
      if (nextSection === `${sectionName}:`) return;
      const nextPattern = new RegExp(`(?:\\*\\*)?${nextSection}`, 'i');
      const nextIndex = slideText.slice(sectionStart).search(nextPattern);
      if (nextIndex !== -1 && nextIndex + sectionStart < sectionEnd) {
        sectionEnd = nextIndex + sectionStart;
      }
    });

    // Extract the section's content.
    const sectionHeader = slideText.slice(sectionStart).match(sectionPattern)[0];
    let sectionContent = slideText
      .substring(sectionStart + sectionHeader.length, sectionEnd)
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.length > 0 && !line.match(/^(?:\*\*)?(?:Content|Teacher Notes|Visual Elements):/i))
      .map(line => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim());

    console.debug(`Extracted ${sectionName}:`, sectionContent);
    return sectionContent;
  };

  for (let i = 0; i < slides.length && i < numSlides; i++) {
    const slideText = slides[i];
    const titleMatch = slideText.match(/(?:\*\*)?Slide \d+:\s*([^*\n]+?)(?:\*\*)?(?=\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const layout = slideText.toLowerCase().includes('comparison') || slideText.toLowerCase().includes('vs')
      ? 'TWO_COLUMN'
      : 'TITLE_AND_CONTENT';

    const content = extractSection(slideText, 'Content');
    const teacherNotes = extractSection(slideText, 'Teacher Notes');
    const visualElements = extractSection(slideText, 'Visual Elements');

    let leftColumn = [];
    let rightColumn = [];
    if (layout === 'TWO_COLUMN') {
      const midpoint = Math.ceil(content.length / 2);
      leftColumn = content.slice(0, midpoint);
      rightColumn = content.slice(midpoint);
    }

    structuredSlides.push({
      title,
      layout,
      content,
      teacher_notes: teacherNotes,
      visual_elements: visualElements,
      left_column: leftColumn,
      right_column: rightColumn
    });
  }

  return structuredSlides;
};
