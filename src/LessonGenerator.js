import React, { useState } from "react";
import Logo from './assets/Teacherfyoai.png'; // Import the logo

const LessonGenerator = () => {
    const [lessonTopic, setLessonTopic] = useState("");
    const [district, setDistrict] = useState("");
    const [gradeLevel, setGradeLevel] = useState("");
    const [subjectFocus, setSubjectFocus] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");
    const [numSlides, setNumSlides] = useState(3);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setError(null);

        try {
            const response = await fetch("https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lesson_topic: lessonTopic,
                    district,
                    grade_level: gradeLevel,
                    subject_focus: subjectFocus,
                    custom_prompt: customPrompt,
                    num_slides: Number(numSlides),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate the presentation. Please try again.");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${lessonTopic}_lesson.pptx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <img src={Logo} alt="Teacherfy Logo" className="logo" />
                <h1>Teacherfy.ai - Lesson Generator</h1>
            </header>
            <div className="form">
                <div className="form-group">
                    <label>Lesson Topic:</label>
                    <input
                        type="text"
                        value={lessonTopic}
                        onChange={(e) => setLessonTopic(e.target.value)}
                        placeholder="Enter lesson topic"
                    />
                </div>
                <div className="form-group">
                    <label>District:</label>
                    <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Enter district"
                    />
                </div>
                <div className="form-group">
                    <label>Grade Level:</label>
                    <input
                        type="text"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        placeholder="Enter grade level"
                    />
                </div>
                <div className="form-group">
                    <label>Subject Focus:</label>
                    <input
                        type="text"
                        value={subjectFocus}
                        onChange={(e) => setSubjectFocus(e.target.value)}
                        placeholder="Enter subject focus"
                    />
                </div>
                <div className="form-group">
                    <label>Custom Prompt (Optional):</label>
                    <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Add specific instructions or details"
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Number of Slides (1-10):</label>
                    <input
                        type="number"
                        value={numSlides}
                        onChange={(e) => setNumSlides(e.target.value)}
                        min="1"
                        max="10"
                    />
                </div>
                <button className="generate-button" onClick={handleGenerate}>
                    Generate Presentation
                </button>
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
};

export default LessonGenerator;
