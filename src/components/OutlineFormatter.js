// OutlineFormatter.js

export const OUTLINE_PROMPT_TEMPLATE = `
Create a detailed {numSlides}-slide lesson outline in {language} for a {gradeLevel} {subject} lesson on {topic} for {district}.

Please structure each slide with:
1. Title: Clear, descriptive title in {language}.
2. Content: Main teaching points in {language}.
    - Include direct explanations and examples rather than descriptions of what to teach.
    - Include concrete examples.
    - Use student-friendly {gradeLevel} language.
    - Build understanding progressively.
    - Note: Use two-column layouts for comparisons or parallel concepts.
    - Note: Slide 1 should include a paragraph about the lesson objective in the form, "Students will be able to ..." in {language}.
3. Teacher Notes: Instructions or tips (prefixed with 'TEACHER NOTE:') in English.
4. Visual Elements: Any diagrams/images needed (prefixed with 'VISUAL:') in English.

Format each slide as:

Slide X: [Title]
Content:
- [Main teaching points]

Teacher Notes:
- [Instructions or tips]

Visual Elements:
- [Descriptions of visuals needed]

[Repeat for remaining slides with appropriate titles]

Additional requirements:
{custom_prompt}

Each slide should:
- Teach directly to students in {language}.
- Ensure all content under "Content" is in {language}, while "Title," "Teacher Notes," and "Visual Elements" remain in English.
- Use age-appropriate language for {gradeLevel} students.
- If using technical terms, provide clear explanations.
- Include key vocabulary terms with explanations if needed.

`;

export const generateRegenerationPrompt = (formState, modifiedPrompt) => {
  const basePrompt = `
Create a detailed ${formState.numSlides}-slide lesson outline in ${formState.language} for a ${formState.gradeLevel} ${formState.subjectFocus} lesson on ${formState.lessonTopic || 'Not specified'} for ${formState.district || 'Not specified'}.

IMPORTANT MODIFICATIONS REQUESTED:
${modifiedPrompt}

Please structure each slide with:
1. Title: Clear, descriptive title ${formState.language}..
2. Content: Main teaching points in ${formState.language}.
    - Include direct explanations and examples rather than descriptions of what to teach.
    - Include concrete examples.
    - Use student-friendly ${formState.gradeLevel} language.
    - Build understanding progressively.
    - Note: Use two-column layouts for comparisons or parallel concepts.
    - Note: Slide 1 should include a paragraph about the lesson objective in the form, "Students will be able to ..."
3. Teacher Notes: Instructions or tips (prefixed with 'TEACHER NOTE:') in English.
4. Visual Elements: Any diagrams/images needed (prefixed with 'VISUAL:') in English.

**Format each slide as:**

Slide X: [Title]
Content:
- [Main teaching points]

Teacher Notes:
- [Instructions or tips]

Visual Elements:
- [Descriptions of visuals needed]

[Repeat for remaining slides with appropriate titles]

**Additional requirements:**
${formState.customPrompt || 'None'}

**Each slide should:**
- Teach directly to students in ${formState.language}.
- Ensure all content under "Content" is in ${formState.language}, while "Teacher Notes" and "Visual Elements" remain in English.
- Use age-appropriate language for ${formState.gradeLevel} students.
- If using technical terms, provide clear explanations.
- Include key vocabulary terms with explanations if needed.
`;

  return basePrompt.trim();
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

export const formatOutlineForDisplay = (structuredContent) => {
  let markdownOutput = '';
  
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