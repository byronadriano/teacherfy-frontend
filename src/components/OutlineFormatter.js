// OutlineFormatter.js
export const OUTLINE_PROMPT_TEMPLATE = `
CRITICAL REQUIREMENTS:
THIS LESSON MUST BE ABOUT: {topic}
Additional Requirements:
{custom_prompt}

Create a detailed {numSlides}-slide lesson outline in {language} for a {gradeLevel} {subject} lesson on {topic} for {district}. Each slide must adhere to the following structure:

1. Title: Clear and concise, written in {language}, directly tied to the lesson's objectives.
2. Content: Main teaching points in {language} that fully address the topic.
    - The content should directly provide the exact teaching points, examples, and activities, rather than describe them vaguely
    - Use precise, age-appropriate language for {gradeLevel}.
    - Progressively build understanding by linking new concepts to prior knowledge.
    - Utilize two-column layouts where comparisons or parallels enhance clarity.
    - Slide 1 Note: Include the lesson objective in the format: "Students will be able to ..." in {language}.
3. Teacher Notes: Ready-to-implement strategies (in English).
    - Include minimal-prep engagement activities with specific instructions.
    - Provide precise assessment methods aligned with objectives.
    - Suggest practical differentiation strategies for diverse learning needs.
4. **Visual Elements**: Supporting resources (in English).
    - Describe relevant visuals or aids.
    - Suggest no-prep or low-prep resources where feasible.

Format each slide as:

Slide X: [Title]
Content:
- [Exact teaching points and examples in {language}]

Teacher Notes:
- ENGAGEMENT: [Activity idea with step-by-step guidance]
- ASSESSMENT: [Exact method to measure understanding]
- DIFFERENTIATION: [Specific examples for diverse needs]

Visual Elements:
- [Descriptions of visual aids or interactive activities]

[Repeat for remaining slides, maintaining focus on requirements]

Implementation Guidelines:
- Every slide must explicitly address the critical requirements.
- Examples and activities must directly align with the learning objectives.
- Ensure consistent alignment between objectives, teaching points, and supporting materials.
- Avoid redundancy by using concise, precise, and actionable language.
- Focus on creating content that is immediately usable by educators.

Additional Notes:
- All "Content" must be written in {language}, while "Teacher Notes" and "Visual Elements" should remain in English.
- Provide exact examples, questions, and activities to minimize ambiguity and maximize usability.
- Prioritize specificity and practicality to reduce teacher preparation time.
`;

export const generateFullPrompt = (formState) => {
  return OUTLINE_PROMPT_TEMPLATE
    .replace(/{topic}/g, formState.lessonTopic || 'Not specified')
    .replace(/{language}/g, formState.language)
    .replace(/{gradeLevel}/g, formState.gradeLevel)
    .replace(/{subject}/g, formState.subjectFocus)
    .replace(/{district}/g, formState.district || 'Not specified')
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
    .replace(/{custom_prompt}/g, `
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
`)
};


export const parseOutlineToStructured = (outlineText, numSlides) => {
  console.log("Raw Outline Text:", outlineText);
  const cleanedText = outlineText.replace(/^Raw Outline Text:\s*/, '');
  
  // Split slides, preserving formatting
  const slides = cleanedText
    .split(/(?=Slide \d+:)/)
    .map(slide => slide.trim())
    .filter(Boolean);

  const structuredSlides = [];

  for (let i = 0; i < Math.min(slides.length, numSlides); i++) {
    const slide = slides[i];
    
    const slideObj = {
      title: '',
      content: [],
      teacher_notes: [],
      visual_elements: []
    };

    // Extract title without markdown
    const titleMatch = slide.match(/Slide \d+:(\s*[^\n]+)/);
    if (titleMatch) {
      slideObj.title = titleMatch[1].trim();
    }

    // Helper function to extract and format section content
    const extractSection = (sectionName) => {
      const sectionRegex = new RegExp(
        `${sectionName}:\\s*\n([\\s\\S]*?)(?=\\n(?:Content:|Teacher Notes:|Visual Elements:|Slide \\d+:|$))`,
        'i'
      );
      const match = slide.match(sectionRegex);
      if (!match) return [];

      // Split into bullet points, handling both • and -
      const rawContent = match[1];
      const bulletPoints = rawContent.split(/(?:\r?\n|\r)(?=[-•])/);
      
      return bulletPoints
        .map(point => point.trim())
        .filter(point => point.length > 0)
        .map(point => {
          // Remove existing bullet point and trim
          const cleanPoint = point.replace(/^[-•]\s*/, '').trim();
          if (cleanPoint) {
            return '- ' + cleanPoint;
          }
          return null;
        })
        .filter(Boolean);
    };

    // Extract all sections
    slideObj.content = extractSection('Content');
    slideObj.teacher_notes = extractSection('Teacher Notes');
    slideObj.visual_elements = extractSection('Visual Elements');

    structuredSlides.push(slideObj);
  }

  return structuredSlides;
};

export const formatOutlineForDisplay = (structuredContent) => {
  let output = '';
  
  structuredContent.forEach((slide, index) => {
    // Format slide title without markdown
    output += `Slide ${index + 1}: ${slide.title}\n\n`;
    
    // Format content section with proper line breaks
    if (slide.content?.length > 0) {
      output += 'Content:\n';
      slide.content.forEach(item => {
        output += `${item}\n`;
      });
      output += '\n';
    }
    
    // Format teacher notes section
    if (slide.teacher_notes?.length > 0) {
      output += 'Teacher Notes:\n';
      slide.teacher_notes.forEach(note => {
        output += `${note}\n`;
      });
      output += '\n';
    }
    
    // Format visual elements section
    if (slide.visual_elements?.length > 0) {
      output += 'Visual Elements:\n';
      slide.visual_elements.forEach(element => {
        output += `${element}\n`;
      });
      output += '\n';
    }
    
    // Add separator between slides
    if (index < structuredContent.length - 1) {
      output += '---\n\n';
    }
  });
  
  return output.trim();
};

// Helper function for final display formatting
export const formatForDisplay = (outline) => {
  return outline
    .replace(/\n{3,}/g, '\n\n')          // Normalize multiple newlines
    .replace(/(?<=:)\n\n/g, '\n')        // Remove extra newline after colons
    .replace(/([^.\n])(?=\n- )/g, '$1.') // Add periods at end of sentences before bullets
    .replace(/\n +/g, '\n')              // Remove excess indentation
    .replace(/^\s+|\s+$/gm, '')          // Trim line whitespace
    .trim();
};

