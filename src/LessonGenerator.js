import React, { useState } from "react";

const LessonGenerator = () => {
    const [lessonTopic, setLessonTopic] = useState("");
    const [district, setDistrict] = useState("");
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setError(null); // Clear any previous errors

        try {
            // Make a request to your backend API
            const response = await fetch("https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ lesson_topic: lessonTopic, district }),
            });

            if (!response.ok) {
                // Log the response for debugging
                const errorData = await response.json();
                console.error("Backend Error:", errorData);
                throw new Error(errorData.error || "Failed to generate the presentation. Please try again.");
            }

            // Trigger download of the PowerPoint file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${lessonTopic}_lesson.pptx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Frontend Error:", err); // Log the error for debugging
            setError(err.message);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Teacherfy.ai - Lesson Generator</h1>
            <div>
                <label>Lesson Topic: </label>
                <input
                    type="text"
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    placeholder="Enter lesson topic"
                    style={{ marginLeft: "10px", padding: "5px" }}
                />
            </div>
            <div style={{ marginTop: "10px" }}>
                <label>District: </label>
                <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Enter district"
                    style={{ marginLeft: "10px", padding: "5px" }}
                />
            </div>
            <button
                onClick={handleGenerate}
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                Generate Presentation
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default LessonGenerator;
