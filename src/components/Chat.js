import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Logo from "../assets/Teacherfyoai.png";
import "./Chat.css";

const gradeOptions = [
  "Preschool", "Kindergarten", "1st grade", "2nd grade", "3rd grade", "4th grade", 
  "5th grade", "6th grade", "7th grade", "8th grade", "9th grade", "10th grade",
  "11th grade", "12th grade", "Adult education"
];

const subjectOptions = [
  "Arts & music",
  "English language arts",
  "Holidays/seasonal",
  "Math",
  "Science",
  "Social studies",
  "Specialty",
  "World languages"
];

const Chat = () => {
  const [lessonTopic, setLessonTopic] = useState("");
  const [district, setDistrict] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subjectFocus, setSubjectFocus] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [numSlides, setNumSlides] = useState(3);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finalOutline, setFinalOutline] = useState("");
  const [outlineFinalized, setOutlineFinalized] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Update BASE_URL based on your environment
  // For local testing: "http://localhost:3000"
  // For production (example):
  const BASE_URL = "https://teacherfy-gma6hncme7cpghda.westus-01.azurewebsites.net";

  const handleGenerateOutline = async () => {
    if (!gradeLevel || !subjectFocus) {
      alert("Please select both a grade and a subject before generating the outline.");
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = {
        grade_level: gradeLevel,
        subject_focus: subjectFocus,
        custom_prompt: customPrompt,
        num_slides: numSlides,
      };

      const { data } = await axios.post(`${BASE_URL}/outline`, requestBody);
      const botResponses = data.messages || [];

      // Add user message to show we requested an outline
      setMessages((prev) => [
        ...prev,
        { role: "user", content: `Generate an outline for a ${gradeLevel} ${subjectFocus} lesson.` }
      ]);

      // Add bot responses
      botResponses.forEach((botResponse) => {
        setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);
      });
    } catch (error) {
      console.error("Error generating outline:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, there was an error generating the outline." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeOutline = () => {
    const botMessages = messages.filter((msg) => msg.role === "bot");
    if (botMessages.length === 0) {
      alert("No outline from the assistant to finalize yet.");
      return;
    }
    const lastBotMessage = botMessages[botMessages.length - 1].content;
    setFinalOutline(lastBotMessage);
    setOutlineFinalized(true);
    alert("Outline finalized! Now you can generate the presentation.");
  };

  const generatePresentation = async () => {
    try {
      const response = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson_topic: lessonTopic,
          district: district,
          grade_level: gradeLevel,
          subject_focus: subjectFocus,
          custom_prompt: customPrompt,
          num_slides: Number(numSlides),
          lesson_outline: finalOutline
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate the presentation. Please try again.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${lessonTopic || "lesson"}_lesson.pptx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="chat-page-container">
      <header className="chat-header">
        <img src={Logo} alt="Teacherfy Logo" className="chat-logo" />
        <h1>Teacherfy.ai - Lesson Generator</h1>
      </header>

      <div className="instructions">
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Select a Grade and Subject by hovering over the boxes and choosing an option.</li>
          <li>Optionally, add a Custom Prompt to guide the lesson content.</li>
          <li>Choose the Number of Slides you’d like.</li>
          <li>Enter a Lesson Topic and District if desired.</li>
          <li>Click "Generate Outline" to have the assistant create a draft lesson outline.</li>
          <li>Refine the outline in the "Assistant Chat" section. Once satisfied, click "Finalize Outline" and then "Generate Presentation".</li>
        </ol>
      </div>

      <div className="controls-section">
        <div className="input-card">
          <div className="hover-container">
            <div className="hover-label">
              Select Grade: {gradeLevel || "Hover to select"}
            </div>
            <div className="hover-content">
              {gradeOptions.map((g) => (
                <label key={g} className="option-label">
                  <input
                    type="radio"
                    value={g}
                    checked={gradeLevel === g}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="input-card">
          <div className="hover-container">
            <div className="hover-label">
              Select Subject: {subjectFocus || "Hover to select"}
            </div>
            <div className="hover-content">
              {subjectOptions.map((s) => (
                <label key={s} className="option-label">
                  <input
                    type="radio"
                    value={s}
                    checked={subjectFocus === s}
                    onChange={(e) => setSubjectFocus(e.target.value)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="input-card">
          <label><strong>Lesson Topic:</strong></label>
          <input
            type="text"
            value={lessonTopic}
            onChange={(e) => setLessonTopic(e.target.value)}
            placeholder="Enter lesson topic"
          />
        </div>

        <div className="input-card">
          <label><strong>District:</strong></label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Enter district"
          />
        </div>

        <div className="input-card large-card">
          <label><strong>Custom Prompt (Optional):</strong></label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add specific instructions or details..."
          ></textarea>
        </div>

        <div className="input-card">
          <label><strong>Number of Slides (1-10):</strong></label>
          <input
            type="number"
            value={numSlides}
            onChange={(e) => setNumSlides(e.target.value)}
            min="1"
            max="10"
          />
        </div>

        <button className="generate-button" onClick={handleGenerateOutline} disabled={isLoading || outlineFinalized}>
          Generate Outline
        </button>
      </div>

      <div className="assistant-chat-section">
        <h2>Assistant Chat</h2>
        <p className="chat-instructions">Refine your lesson outline here. Once satisfied, click "Finalize Outline" and then "Generate Presentation".</p>

        <div className="chat-container">
          <div className="messages-container">
            {messages.map((msg, i) => (
              <p key={i} className={msg.role}>
                <strong>{msg.role}:</strong> {msg.content}
              </p>
            ))}
            {isLoading && <p>Sending...</p>}
            <div ref={messagesEndRef} />
          </div>

          <div className="finalize-buttons">
            {!outlineFinalized && (
              <button onClick={finalizeOutline} disabled={!messages.some(m => m.role === "bot")}>
                Finalize Outline
              </button>
            )}

            {outlineFinalized && (
              <button onClick={generatePresentation}>
                Generate Presentation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
