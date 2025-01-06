// OutlineFormatter.js
export const OUTLINE_PROMPT_TEMPLATE = `
CRITICAL REQUIREMENTS TO ADDRESS FIRST:
THIS LESSON MUST BE SPECIFICALLY ABOUT: {topic}
Additional Requirements:
{custom_prompt}

Based on these requirements, create a detailed {numSlides}-slide lesson outline in {language} for a {gradeLevel} {subject} lesson on {topic} for {district}.

Essential Guidelines:
1. ALL content must directly align with and implement the above requirements
2. Every slide should explicitly support these specified needs
3. Examples and activities should be chosen to reinforce these priorities

Structure each slide with:
1. Title: Clear, descriptive title in {language} that connects to core requirements.
2. Content: Main teaching points in {language} that implement key requirements.
    - Include direct explanations and examples rather than descriptions of what to teach.
    - Include concrete examples that are age-appropriate and relatable.
    - Use student-friendly {gradeLevel} language with clear, simple explanations.
    - Build understanding progressively, connecting new concepts to requirements
    - Note: Use two-column layouts for comparisons when it serves requirements
    - Note: Slide 1 should include a paragraph about the lesson objective in the form, "Students will be able to ..." in {language}.
3. Teacher Notes: Practical, Ready-to-Implement Classroom Strategies (in English)
    - Provide SPECIFIC, MINIMAL-PREP engagement techniques
    - Include EXACT language for instructions
    - Create READY-TO-USE assessment methods
    - Offer IMMEDIATE differentiation strategies
4. Visual Elements: Supporting Visual Resources (in English) chosen for requirements
    - Provide EXACT visual aid descriptions
    - Include SPECIFIC creation instructions
    - Suggest NO-PREP or LOW-PREP visual reso

Format each slide as:

Slide X: [Title - Connected to Requirements]
Content:
- [Main teaching points implementing requirements]

Teacher Notes:
- ENGAGEMENT: [Specific 3-5 minute activity supporting requirements]
- ASSESSMENT: [Exact method aligned with core objectives]
- DIFFERENTIATION: [Strategy implementing key requirements]

Visual Elements:
- [Visual aid supporting stated needs]
- [Interactive activity reinforcing requirements]

[Repeat for remaining slides, maintaining focus on requirements]

Implementation Guidelines:
- Every component must explicitly support the critical requirements
- All activities and examples should directly implement stated needs
- Ensure consistent alignment between requirements and instruction
- Maintain focus on key objectives throughout the lesson

Crucial Guidance for Teacher Notes:
- ALL notes must be IMMEDIATELY implementable
- Include SPECIFIC time allocations that work within constraints
- Give PRECISE step-by-step instructions supporting objectives

Crucial Guidance for Content:
- Teach directly to students in {language}
- Use age-appropriate language for {gradeLevel} students
- Explain technical terms clearly while supporting requirements
- Include key vocabulary that aligns with stated objectives
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

const extractBulletPoints = (text) => {
  if (!text) return [];
  
  return text
    .split('\n')
    .map(line => line.trim())
    // Convert any bullet point character to '-'
    .map(line => line.replace(/^[•*]/, '-'))
    // Then filter for lines starting with '-'
    .filter(line => line.startsWith('-') || line.match(/^\d+\./))
    .map(line => {
      // Remove bullet point or number and trim
      return line.replace(/^[-•*]\s*|^\d+\.\s*/, '').trim();
    })
    .filter(line => line.length > 0); // Remove empty lines
};

export const parseOutlineToStructured = (outlineText, numSlides) => {
  // More robust parsing that handles variations in formatting
  console.log("Raw Outline Text:", outlineText);

  const slides = outlineText.split(/(?=Slide \d+:)/i).filter(Boolean);
  const structuredSlides = [];

  for (let i = 0; i < Math.min(slides.length, numSlides); i++) {
    const slide = slides[i];
    const slideObj = {
      title: '',
      content: [],
      teacher_notes: [],
      visual_elements: [],
      left_column: [],
      right_column: []
    };

    // Extract title (case-insensitive, more flexible)
    const titleMatch = slide.match(/Slide \d+:\s*(.+)/i);
    if (titleMatch) {
      slideObj.title = titleMatch[1].trim();
    }

    // Flexible section extraction
    const extractSection = (sectionName) => {
      const regex = new RegExp(`${sectionName}:\\s*\n(.*?)(?=\n\n|$)`, 'is');
      const match = slide.match(regex);
      return match ? extractBulletPoints(match[1]) : [];
    };

    // Extract sections
    slideObj.content = extractSection('Content');
    slideObj.teacher_notes = extractSection('Teacher Notes');
    slideObj.visual_elements = extractSection('Visual Elements');

    // Check for two-column layout
    if (slideObj.content.length === 0) {
      const leftColumnMatch = slide.match(/Left Column:\n(.*?)(?=\n\n|Right Column:|$)/is);
      const rightColumnMatch = slide.match(/Right Column:\n(.*?)(?=\n\n|$)/is);

      if (leftColumnMatch) {
        slideObj.left_column = extractBulletPoints(leftColumnMatch[1]);
      }
      if (rightColumnMatch) {
        slideObj.right_column = extractBulletPoints(rightColumnMatch[1]);
      }
    }

    // Determine layout
    slideObj.layout = slideObj.left_column.length > 0 || slideObj.right_column.length > 0 
      ? 'TWO_COLUMN' 
      : 'TITLE_AND_CONTENT';

    structuredSlides.push(slideObj);
  }

  return structuredSlides;
};

export const formatOutlineForDisplay = (structuredContent, rawOutlineText) => {
  // Find where the slides actually start
  const slidesStartIndex = rawOutlineText.indexOf('Slide 1:');
  let markdownOutput = '';

  if (slidesStartIndex !== -1) {
    const preambleText = rawOutlineText.substring(0, slidesStartIndex).trim();
    
    if (preambleText) {
      // Split preamble into paragraphs and quote each one
      const paragraphs = preambleText.split('\n\n');
      markdownOutput += paragraphs.map(para => `> ${para}`).join('\n>\n') + '\n\n---\n\n';
    }
  }
  
  structuredContent.forEach((slide, index) => {
    markdownOutput += `Slide ${index + 1}: ${slide.title}\n\n`;
    
    // Always include content section, even if empty
    markdownOutput += 'Content:\n';
    
    // Add content from different possible sources
    const contentSources = [
      slide.content || [],
      slide.left_column || [],
      slide.right_column || []
    ];

    let hasContent = false;
    contentSources.forEach(contentList => {
      contentList.forEach(item => {
        if (item) {
          hasContent = true;
          // Change from '-' to '*'
          markdownOutput += `* ${item.replace(/^[-]/, '').trim()}\n`;
        }
      });
    });

    if (!hasContent) {
      markdownOutput += '* No content specified\n';
    }
    
    markdownOutput += '\n';
    
    // Teacher Notes section - show even if empty
    markdownOutput += 'Teacher Notes:\n';
    if (slide.teacher_notes && slide.teacher_notes.length > 0) {
      slide.teacher_notes.forEach(note => {
        // Change from '-' to '*'
        markdownOutput += `* ${note.replace(/^[-]/, '').trim()}\n`;
      });
    } else {
      markdownOutput += '* No teacher notes specified\n';
    }
    markdownOutput += '\n';
    
    // Visual Elements section - show even if empty
    markdownOutput += 'Visual Elements:\n';
    if (slide.visual_elements && slide.visual_elements.length > 0) {
      slide.visual_elements.forEach(visual => {
        // Change from '-' to '*'
        markdownOutput += `* ${visual.replace(/^[-]/, '').trim()}\n`;
      });
    } else {
      markdownOutput += '* No visual elements specified\n';
    }
    markdownOutput += '\n';
  });
  
  return markdownOutput.trim();
};