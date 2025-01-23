// OutlineFormatter.js
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
  - [Concrete strategies, e.g., specific worksheets with problems layed out, actual and specific challenge questions, or pairing methods, in English]

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

export const parseOutlineToStructured = (outlineText, numSlides) => {
  // First, normalize the markdown bold syntax
  const normalizedText = outlineText.replace(/\*\*Slide (\d+):/g, 'Slide $1:');
  
  // Split by Slide markers, handling both formats
  const slides = normalizedText
    .split(/\n(?=(?:\*\*)?Slide \d+:)/)
    .filter(Boolean)
    .map(slide => slide.trim());

  const structuredSlides = [];

  const extractSection = (slideText, sectionName) => {
    // Handle both regular and bold markdown section headers
    const sectionPattern = new RegExp(`(?:\\*\\*)?${sectionName}:`, 'i');
    const sectionStart = slideText.search(sectionPattern);
    
    if (sectionStart === -1) {
      console.debug(`Section ${sectionName} not found in slide text`);
      return [];
    }

    // Find the next section start or end of text
    const nextSections = ['Content:', 'Teacher Notes:', 'Visual Elements:'];
    let sectionEnd = slideText.length;
    
    nextSections.forEach(nextSection => {
      if (nextSection === `${sectionName}:`) return;
      // Handle both regular and bold markdown headers for next sections
      const nextPattern = new RegExp(`(?:\\*\\*)?${nextSection}`, 'i');
      const nextIndex = slideText.slice(sectionStart).search(nextPattern);
      if (nextIndex !== -1 && nextIndex + sectionStart < sectionEnd) {
        sectionEnd = nextIndex + sectionStart;
      }
    });

    // Extract the content between section start and end
    const sectionHeader = slideText.slice(sectionStart).match(sectionPattern)[0];
    let sectionContent = slideText
      .substring(sectionStart + sectionHeader.length, sectionEnd)
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.length > 0 && !line.match(/^(?:\*\*)?(?:Content|Teacher Notes|Visual Elements):/i))
      .map(line => {
        // Remove list markers and trim
        return line
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
      });

    console.debug(`Extracted ${sectionName}:`, sectionContent);
    return sectionContent;
  };

  for (let i = 0; i < slides.length && i < numSlides; i++) {
    const slideText = slides[i];
    
    // Extract title, handling both formats
    const titleMatch = slideText.match(/(?:\*\*)?Slide \d+:\s*([^*\n]+?)(?:\*\*)?(?=\n|$)/);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Determine layout based on content
    const layout = slideText.toLowerCase().includes('comparison') || 
                  slideText.toLowerCase().includes('vs') ? 
                  'TWO_COLUMN' : 'TITLE_AND_CONTENT';

    // Extract sections
    const content = extractSection(slideText, 'Content');
    const teacherNotes = extractSection(slideText, 'Teacher Notes');
    const visualElements = extractSection(slideText, 'Visual Elements');

    // Handle two-column layout content distribution
    let leftColumn = [];
    let rightColumn = [];
    
    if (layout === 'TWO_COLUMN') {
      // Split content evenly between columns
      const midpoint = Math.ceil(content.length / 2);
      leftColumn = content.slice(0, midpoint);
      rightColumn = content.slice(midpoint);
    }

    // Create structured slide
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

// Helper function to format the outline for display
export const formatOutlineForDisplay = (structuredContent) => {
  let output = '';

  structuredContent.forEach((slide, index) => {
    // Add extra padding at the start of each slide except the first
    if (index > 0) {
      output += '\n\n';
    }

    // Title with clear separation
    output += `## Slide ${index + 1}: ${slide.title}\n\n`;

    // Content section with clear structure
    output += '### Content\n\n';
    slide.content.forEach(item => {
      // Wrap long content lines
      const wrappedContent = item.split(/(?<=\. )/g).join('\n  ');
      output += `• ${wrappedContent}\n`;
    });
    output += '\n';

    // Teacher Notes with subsections
    output += '### Teacher Notes\n\n';
    
    // Group teacher notes by type
    const noteTypes = ['ENGAGEMENT', 'ASSESSMENT', 'DIFFERENTIATION'];
    noteTypes.forEach(type => {
      const typeNotes = slide.teacher_notes.filter(note => note.startsWith(type));
      if (typeNotes.length > 0) {
        output += `**${type}:**\n`;
        typeNotes.forEach(note => {
          // Remove the type prefix and format the note
          const cleanNote = note.replace(`${type}: `, '').trim();
          output += `  • ${cleanNote}\n`;
        });
        output += '\n';
      }
    });
    
    // Visual Elements with clear structure
    output += '### Visual Elements\n\n';
    if (slide.visual_elements && slide.visual_elements.length > 0) {
      slide.visual_elements.forEach(element => {
        if (element !== '--') {  // Skip divider markers
          output += `• ${element}\n`;
        }
      });
    } else {
      output += '• (None provided)\n';
    }
    output += '\n';

    // Add clear separator between slides
    if (index < structuredContent.length - 1) {
      output += '\n---\n';
    }
  });

  return output.trim();
};

export const generateFullPrompt = (formState) => {
  return OUTLINE_PROMPT_TEMPLATE
    .replace(/{resourceType}/g, formState.resourceType || 'Not specified')
    .replace(/{topic}/g, formState.lessonTopic || 'Not specified')
    .replace(/{standard}/g, formState.standard || 'Not specified')
    .replace(/{language}/g, formState.language)
    .replace(/{gradeLevel}/g, formState.gradeLevel)
    .replace(/{subject}/g, formState.subjectFocus)
    .replace(/{numSlides}/g, formState.numSlides)
    .replace(/{custom_prompt}/g, formState.customPrompt || 'None');
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
1. Start by fully understanding both sets of requirements
2. Identify any potential conflicts or overlaps
3. Prioritize requirements in this order:
   - Additional critical requirements (newest guidance)
   - Primary requirements (original custom prompt)
   - Standard lesson structure and format
4. Ensure EVERY component of the lesson plan:
   - Explicitly addresses additional requirements
   - Maintains alignment with original requirements
   - Follows standard lesson structure
5. When modifying content:
   - Make comprehensive changes to fully implement new requirements
   - Preserve original requirements where compatible
   - Adapt examples and activities to serve both sets of needs
6. Review final outline to verify:
   - Complete implementation of additional requirements
   - Maintenance of original requirements
   - Coherent integration of all elements
`
    );
};


export const formatForDisplay = (outline) => {
  return outline
    .replace(/\n{3,}/g, "\n\n")        // Normalize multiple newlines
    .replace(/(?<=:)\n\n/g, "\n")      // Remove extra newline after colons
    .replace(/([^.\n])(?=\n- )/g, "$1.")
    .replace(/\n +/g, "\n")            // Remove excess indentation
    .replace(/^\s+|\s+$/gm, "")        // Trim each line's whitespace

    // ADD THIS LINE:
    .replace(/^•\s/gm, "- ")           // Convert "• " at the start of a line into "- "
    
    .trim();
};

