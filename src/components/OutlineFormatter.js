// OutlineFormatter.js
export const OUTLINE_PROMPT_TEMPLATE = `
CRITICAL REQUIREMENTS:
THIS LESSON MUST BE ABOUT: {topic}
Additional Requirements:
{custom_prompt}

Create a detailed {numSlides}-slide lesson outline in {language} for a {gradeLevel} {subject} lesson on {topic} for {district}. Each slide must adhere to the following structure:

1. **Title**: Clear and concise, written in {language}, directly tied to the lesson's objectives.
2. **Content**: Main teaching points in {language} that fully address the topic.
    - The content should directly provide the exact teaching points, examples, and activities, rather than describe them vaguely
    - Use precise, age-appropriate language for {gradeLevel}.
    - Progressively build understanding by linking new concepts to prior knowledge.
    - Utilize two-column layouts where comparisons or parallels enhance clarity.
    - **Slide 1 Note**: Include the lesson objective in the format: "Students will be able to ..." in {language}.
3. **Teacher Notes**: Ready-to-implement strategies (in English).
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