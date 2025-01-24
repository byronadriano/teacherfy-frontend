// utils/constants/form.js
export const FORM = {
  RESOURCE_TYPES: [
    "Presentation",
    "Lesson Plan",
    "Worksheet",
    "Quiz/Test"
  ],
  RESOURCE_OPTIONS: {
    Presentation: {
      options: ['Number of slides', 'Include images'],
      slideRange: Array.from({ length: 18 }, (_, i) => `${i + 1} slides`)
    },
    'Lesson Plan': {
      options: ['Include objectives', 'Include assessment']
    },
    Worksheet: {
      options: ['Include answer key', 'Include rubric']
    },
    'Quiz/Test': {
      options: ['Include answer key', 'Include scoring guide']
    },
  },
  GRADES: [
    "Preschool",
    "Kindergarten",
    "1st grade",
    "2nd grade",
    "3rd grade",
    "4th grade",
    "5th grade",
    "6th grade",
    "7th grade",
    "8th grade",
    "9th grade",
    "10th grade",
    "11th grade",
    "12th grade"
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
  ],
STANDARDS: {
    "COMMON_CORE_STANDARDS": {
      "Kindergarten": {
        "ELA": {
          "Key Ideas and Details": [
            { "code": "RL.K.1", "description": "With prompting and support, ask and answer questions about key details in a text." },
            { "code": "RL.K.2", "description": "With prompting and support, retell familiar stories, including key details." },
            { "code": "RL.K.3", "description": "With prompting and support, identify characters, settings, and major events in a story." }
          ],
          "Craft and Structure": [
            { "code": "RL.K.4", "description": "Ask and answer questions about unknown words in a text." },
            { "code": "RL.K.5", "description": "Recognize common types of texts (e.g., storybooks, poems)." },
            { "code": "RL.K.6", "description": "With prompting and support, name the author and illustrator of a story and define the role of each in telling the story." }
          ],
          "Integration of Knowledge and Ideas": [
            { "code": "RL.K.7", "description": "With prompting and support, describe the relationship between illustrations and the story in which they appear." },
            { "code": "RL.K.9", "description": "With prompting and support, compare and contrast the adventures and experiences of characters in familiar stories." }
          ],
          "Range of Reading and Level of Text Complexity": [
            { "code": "RL.K.10", "description": "Actively engage in group reading activities with purpose and understanding." }
          ]
        },
        "Mathematics": {
          "Counting and Cardinality": [
            { "code": "K.CC.1", "description": "Count to 100 by ones and by tens." },
            { "code": "K.CC.2", "description": "Count forward beginning from a given number within the known sequence." },
            { "code": "K.CC.3", "description": "Write numbers from 0 to 20. Represent a number of objects with a written numeral 0-20." }
          ],
          "Operations and Algebraic Thinking": [
            { "code": "K.OA.1", "description": "Represent addition and subtraction with objects, fingers, mental images, drawings, sounds, acting out situations, verbal explanations, expressions, or equations." },
            { "code": "K.OA.2", "description": "Solve addition and subtraction word problems, and add and subtract within 10." },
            { "code": "K.OA.3", "description": "Decompose numbers less than or equal to 10 into pairs in more than one way." }
          ],
          "Number and Operations in Base Ten": [
            { "code": "K.NBT.1", "description": "Compose and decompose numbers from 11 to 19 into ten ones and some further ones." }
          ],
          "Measurement and Data": [
            { "code": "K.MD.1", "description": "Describe measurable attributes of objects, such as length or weight." },
            { "code": "K.MD.2", "description": "Directly compare two objects with a measurable attribute in common." },
            { "code": "K.MD.3", "description": "Classify objects into given categories; count the objects in each category and sort the categories by count." }
          ],
          "Geometry": [
            { "code": "K.G.1", "description": "Describe objects in the environment using names of shapes, and describe the relative positions of these objects." },
            { "code": "K.G.2", "description": "Correctly name shapes regardless of their orientations or overall size." },
            { "code": "K.G.3", "description": "Identify shapes as two-dimensional or three-dimensional." }
          ]
        }
      },
      "Grade1": {
        "ELA": {
          "Key Ideas and Details": [
            { "code": "RL.1.1", "description": "Ask and answer questions about key details in a text." },
            { "code": "RL.1.2", "description": "Retell stories, including key details, and demonstrate understanding of their central message or lesson." },
            { "code": "RL.1.3", "description": "Describe characters, settings, and major events in a story, using key details." }
          ],
          "Craft and Structure": [
            { "code": "RL.1.4", "description": "Identify words and phrases in stories or poems that suggest feelings or appeal to the senses." },
            { "code": "RL.1.5", "description": "Explain major differences between books that tell stories and books that give information." },
            { "code": "RL.1.6", "description": "Identify who is telling the story at various points in a text." }
          ],
          "Integration of Knowledge and Ideas": [
            { "code": "RL.1.7", "description": "Use illustrations and details in a story to describe its characters, setting, or events." },
            { "code": "RL.1.9", "description": "Compare and contrast the adventures and experiences of characters in stories." }
          ],
          "Range of Reading and Level of Text Complexity": [
            { "code": "RL.1.10", "description": "With prompting and support, read prose and poetry of appropriate complexity for grade 1." }
          ]
        },
        "Mathematics": {
          "Operations and Algebraic Thinking": [
            { "code": "1.OA.1", "description": "Use addition and subtraction within 20 to solve word problems." },
            { "code": "1.OA.2", "description": "Solve word problems that call for addition of three whole numbers whose sum is less than or equal to 20." },
            { "code": "1.OA.3", "description": "Apply properties of operations as strategies to add and subtract." }
          ],
          "Number and Operations in Base Ten": [
            { "code": "1.NBT.1", "description": "Count to 120, starting at any number less than 120." },
            { "code": "1.NBT.2", "description": "Understand that the two digits of a two-digit number represent amounts of tens and ones." },
            { "code": "1.NBT.3", "description": "Compare two two-digit numbers based on meanings of the tens and ones digits." }
          ],
          "Measurement and Data": [
            { "code": "1.MD.1", "description": "Order three objects by length; compare the lengths of two objects indirectly by using a third object." },
            { "code": "1.MD.2", "description": "Express the length of an object as a whole number of length units." },
            { "code": "1.MD.3", "description": "Tell and write time in hours and half-hours using analog and digital clocks." }
          ],
          "Geometry": [
            { "code": "1.G.1", "description": "Distinguish between defining attributes versus non-defining attributes of shapes." },
            { "code": "1.G.2", "description": "Compose two-dimensional shapes or three-dimensional shapes to create a composite shape." },
            { "code": "1.G.3", "description": "Partition circles and rectangles into two and four equal shares." }
          ]
        }
      },
      "Grade2": {
        "ELA": {
          "Key Ideas and Details": [
            { "code": "RL.2.1", "description": "Ask and answer such questions as who, what, where, when, why, and how to demonstrate understanding of key details in a text." },
            { "code": "RL.2.2", "description": "Recount stories, including fables and folktales from diverse cultures, and determine their central message, lesson, or moral." },
            { "code": "RL.2.3", "description": "Describe how characters in a story respond to major events and challenges." }
          ],
          "Craft and Structure": [
            { "code": "RL.2.4", "description": "Describe how words and phrases supply rhythm and meaning in a story, poem, or song." },
            { "code": "RL.2.5", "description": "Describe the overall structure of a story, including describing how the beginning introduces the story and the ending concludes the action." },
            { "code": "RL.2.6", "description": "Acknowledge differences in the points of view of characters, including by speaking in a different voice for each character when reading dialogue aloud." }
          ],
          "Integration of Knowledge and Ideas": [
            { "code": "RL.2.7", "description": "Use information gained from the illustrations and words in a print or digital text to demonstrate understanding of its characters, setting, or plot." },
            { "code": "RL.2.9", "description": "Compare and contrast two or more versions of the same story by different authors or from different cultures." }
          ],
          "Range of Reading and Level of Text Complexity": [
            { "code": "RL.2.10", "description": "By the end of the year, read and comprehend literature in the grades 2-3 text complexity band proficiently." }
          ]
        },
        "Mathematics": {
          "Operations and Algebraic Thinking": [
            { "code": "2.OA.1", "description": "Use addition and subtraction within 100 to solve one- and two-step word problems." },
            { "code": "2.OA.2", "description": "Fluently add and subtract within 20 using mental strategies." },
            { "code": "2.OA.3", "description": "Determine whether a group of objects has an odd or even number of members." }
          ],
          "Number and Operations in Base Ten": [
            { "code": "2.NBT.1", "description": "Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones." },
            { "code": "2.NBT.2", "description": "Count within 1000; skip-count by 5s, 10s, and 100s." },
            { "code": "2.NBT.3", "description": "Read and write numbers to 1000 using base-ten numerals, number names, and expanded form." }
          ],
          "Measurement and Data": [
            { "code": "2.MD.1", "description": "Measure the length of an object by selecting and using appropriate tools." },
            { "code": "2.MD.2", "description": "Measure the length of an object twice, using length units of different lengths for the two measurements." },
            { "code": "2.MD.3", "description": "Estimate lengths using units of inches, feet, centimeters, and meters." }
          ],
          "Geometry": [
            { "code": "2.G.1", "description": "Recognize and draw shapes having specified attributes." },
            { "code": "2.G.2", "description": "Partition a rectangle into rows and columns of same-size squares and count to find the total number." },
            { "code": "2.G.3", "description": "Partition circles and rectangles into two, three, or four equal shares." }
          ]
        }
      },
      "Grade3": {
        "ELA": {
          "Key Ideas and Details": [
            { "code": "RL.3.1", "description": "Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers." },
            { "code": "RL.3.2", "description": "Recount stories, including fables, folktales, and myths from diverse cultures; determine the central message, lesson, or moral and explain how it is conveyed through key details in the text." },
            { "code": "RL.3.3", "description": "Describe characters in a story and explain how their actions contribute to the sequence of events." }
          ],
          "Craft and Structure": [
            { "code": "RL.3.4", "description": "Determine the meaning of words and phrases as they are used in a text, distinguishing literal from nonliteral language." },
            { "code": "RL.3.5", "description": "Refer to parts of stories, dramas, and poems when writing or speaking about a text, using terms such as chapter, scene, and stanza." },
            { "code": "RL.3.6", "description": "Distinguish their own point of view from that of the narrator or those of the characters." }
          ],
          "Integration of Knowledge and Ideas": [
            { "code": "RL.3.7", "description": "Explain how specific aspects of a text's illustrations contribute to what is conveyed by the words in a story." },
            { "code": "RL.3.9", "description": "Compare and contrast the themes, settings, and plots of stories written by the same author about the same or similar characters." }
          ],
          "Range of Reading and Level of Text Complexity": [
            { "code": "RL.3.10", "description": "By the end of the year, read and comprehend literature at the high end of the grades 2-3 text complexity band independently and proficiently." }
          ]
        },
        "Mathematics": {
          "Operations and Algebraic Thinking": [
            { "code": "3.OA.1", "description": "Interpret products of whole numbers." },
            { "code": "3.OA.2", "description": "Interpret whole-number quotients of whole numbers." },
            { "code": "3.OA.3", "description": "Use multiplication and division within 100 to solve word problems." }
          ],
          "Number and Operations in Base Ten": [
            { "code": "3.NBT.1", "description": "Use place value understanding to round whole numbers to the nearest 10 or 100." },
            { "code": "3.NBT.2", "description": "Fluently add and subtract within 1000." },
            { "code": "3.NBT.3", "description": "Multiply one-digit whole numbers by multiples of 10." }
          ],
          "Number and Operations—Fractions": [
            { "code": "3.NF.1", "description": "Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts." },
            { "code": "3.NF.2", "description": "Understand a fraction as a number on the number line." },
            { "code": "3.NF.3", "description": "Explain equivalence of fractions in special cases, and compare fractions by reasoning about their size." }
          ],
          "Measurement and Data": [
            { "code": "3.MD.1", "description": "Tell and write time to the nearest minute and measure time intervals in minutes." },
            { "code": "3.MD.2", "description": "Measure and estimate liquid volumes and masses of objects using standard units." },
            { "code": "3.MD.3", "description": "Draw a scaled picture graph and a scaled bar graph to represent a data set with several categories." }
          ],
          "Geometry": [
            { "code": "3.G.1", "description": "Understand that shapes in different categories may share attributes." },
            { "code": "3.G.2", "description": "Partition shapes into parts with equal areas. Express the area of each part as a unit fraction of the whole." }
          ]
        }
      },
      "Grade4": {
        "ELA": {
          "Key Ideas and Details": [
            { "code": "RL.4.1", "description": "Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text." },
            { "code": "RL.4.2", "description": "Determine a theme of a story, drama, or poem from details in the text; summarize the text." },
            { "code": "RL.4.3", "description": "Describe in depth a character, setting, or event in a story or drama, drawing on specific details in the text." }
          ],
          "Craft and Structure": [
            { "code": "RL.4.4", "description": "Determine the meaning of words and phrases as they are used in a text, including those that allude to significant characters found in mythology." },
            { "code": "RL.4.5", "description": "Explain major differences between poems, drama, and prose, and refer to the structural elements of poems and drama." },
            { "code": "RL.4.6", "description": "Compare and contrast the point of view from which different stories are narrated, including the difference between first- and third-person narrations." }
          ],
          "Integration of Knowledge and Ideas": [
            { "code": "RL.4.7", "description": "Make connections between the text of a story or drama and a visual or oral presentation of the text." },
            { "code": "RL.4.9", "description": "Compare and contrast the treatment of similar themes and topics and patterns of events in stories, myths, and traditional literature from different cultures." }
          ],
          "Range of Reading and Level of Text Complexity": [
            { "code": "RL.4.10", "description": "By the end of the year, read and comprehend literature in the grades 4-5 text complexity band proficiently." }
          ]
        },
        "Mathematics": {
          "Operations and Algebraic Thinking": [
            { "code": "4.OA.1", "description": "Interpret a multiplication equation as a comparison, e.g., interpret 35 = 5 × 7 as a statement that 35 is 5 times as many as 7." },
            { "code": "4.OA.2", "description": "Multiply or divide to solve word problems involving multiplicative comparison." },
            { "code": "4.OA.3", "description": "Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations." }
          ],
          "Number and Operations in Base Ten": [
            { "code": "4.NBT.1", "description": "Recognize that in a multi-digit whole number, a digit in one place represents ten times what it represents in the place to its right." },
            { "code": "4.NBT.2", "description": "Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded form." },
            { "code": "4.NBT.3", "description": "Use place value understanding to round multi-digit whole numbers to any place." }
          ],
          "Number and Operations—Fractions": [
            { "code": "4.NF.1", "description": "Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b) by using visual fraction models." },
            { "code": "4.NF.2", "description": "Compare two fractions with different numerators and different denominators." },
            { "code": "4.NF.3", "description": "Understand a fraction a/b with a > 1 as a sum of fractions 1/b." }
          ],
          "Measurement and Data": [
            { "code": "4.MD.1", "description": "Know relative sizes of measurement units within one system of units." },
            { "code": "4.MD.2", "description": "Use the four operations to solve word problems involving distances, intervals of time, liquid volumes, masses of objects, and money." },
            { "code": "4.MD.3", "description": "Apply the area and perimeter formulas for rectangles in real world and mathematical problems." }
          ],
          "Geometry": [
            { "code": "4.G.1", "description": "Draw points, lines, line segments, rays, angles (right, acute, obtuse), and perpendicular and parallel lines." },
            { "code": "4.G.2", "description": "Classify two-dimensional figures based on the presence or absence of parallel or perpendicular lines, or angles of a specified size." },
            { "code": "4.G.3", "description": "Recognize a line of symmetry for a two-dimensional figure as a line across the figure such that the figure can be folded along the line into matching parts." }
          ]
        }
    }
  }
}
};

// Add this to your form.js file, after your existing FORM constant

export const getAllStandards = () => {
  const standards = {
    ELA: [],
    Mathematics: []
  };
  
  // Iterate through all grades
  Object.values(FORM.STANDARDS.COMMON_CORE_STANDARDS).forEach(gradeStandards => {
    // For each grade, look at ELA and Mathematics
    Object.entries(gradeStandards).forEach(([subject, domains]) => {
      // For each domain in the subject
      Object.entries(domains).forEach(([domain, standardsList]) => {
        if (subject === 'ELA') {
          standards.ELA.push(...standardsList.map(s => ({
            ...s,
            domain,
            grade: subject
          })));
        } else if (subject === 'Mathematics') {
          standards.Mathematics.push(...standardsList.map(s => ({
            ...s,
            domain,
            grade: subject
          })));
        }
      });
    });
  });
  
  return standards;
};