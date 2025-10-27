import { useState, useEffect } from "react";
import React from "react";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Textarea } from "./components/ui/textarea";
import FileUploader from "./components/ui/FileUploader";
import jsPDF from "jspdf";
import "./App.css";

export default function App() {
  const [jobFile, setJobFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [matchScore, setMatchScore] = useState(0);
  const [coverLetter, setCoverLetter] = useState("");

 // Load initial upload history from localStorage
// This will run once when the component mounts
// and populate the uploadHistory state with any saved data.
// This allows the app to remember previous uploads even after a page refresh.
useEffect(() => {
  const savedHistory = localStorage.getItem("uploadHistory");
  if (savedHistory) setUploadHistory(JSON.parse(savedHistory));
}, []);

const history = JSON.parse(localStorage.getItem('uploadHistory'));
console.log(history);

// if (!history || history.length === 0) {
//   console.log("No upload history found.");
// } else {
// history.forEach(file => {
//   console.log(file.name, file.type, file.data.slice(0, 50) + '...');
// });
// }


// Suggestions for missing skills
  const skillSuggestions = {
  "GraphQL": "Consider learning GraphQL basics via tutorials or courses to improve your API querying skills.",
  "Unit Testing": "Explore testing frameworks like Jest or Mocha to write effective unit tests for your projects.",
  // Add more if needed
};


  const handleAnalyze = async () => {
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job", jobFile);

    try {
      const res = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data.result);
      console.log(data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze files");
      }
      setMatchScore(data.result.matchScore || 83);
      setMatchedSkills(data.result.matchedSkills || ["React", "JavaScript", "Node.js"]);
      setMissingSkills(data.result.missingSkills || ["GraphQL", "Unit Testing"]);
      setCoverLetter(data.coverLetter || `Dear Hiring Manager,\n\nI'm excited to apply for the role...`);
    } catch (error) {
      setError(error.message || "An error occurred while analyzing the files");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to download the cover letter
 const handleDownload = async () => {
  console.log(`Downloading cover letter: ${result.coverLetter}`);
  let coverLetter = result.coverLetter || "Dear Hiring Manager,\n\nI'm excited to apply for the role...";

  try {
    const response = await fetch('http://localhost:3001/download-cover-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ coverLetter }), // make sure `coverLetter` is available
    });

    if (!response.ok) {
      throw new Error('Failed to download cover letter');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Set filename — same as backend's format
    a.download = `cover-letter-${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    alert('Something went wrong while downloading the file.');
  }
};

const handleDownloadPDF = () => {
  const doc = new jsPDF();
  
  let coverLetter = result.coverLetter || "Dear Hiring Manager,\n\nI'm excited to apply for the role...";

  const lines = coverLetter.split('\n');
  lines.forEach((line, index) => {
    doc.text(line, 10, 10 + index * 10);
  });

  doc.save(`cover-letter-${Date.now()}.pdf`);
};

  return (
      <div
  style={{
    width: "100%",
    maxWidth: "1200px",
    //margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "2.5rem",
    padding: "0.2rem",
    fontFamily: "'Inter', sans-serif",
    color: "#1f2937", // dark gray
  }}
>
  {/* Title */}
  <h1
    style={{
      textAlign: "center",
      fontSize: "3rem",
      fontWeight: 700,
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      lineHeight: 1.2,
      color: "#111827",
      backgroundColor: "#e0e7ff",
      padding: "1rem",
      borderRadius: "0.75rem",
    }}
  >
    JOBMATCH <span style={{ color: "orange" }}>AI</span>
  </h1>

  <p
    style={{
      textAlign: "center",
      fontSize: "1.25rem",
      color: "#4b5563",
      lineHeight: 1.6,
    }}
  >
    Upload your resume & job description to get instant feedback.
  </p>

  {/* Upload Section */}
  <div
    style={{
      backgroundColor: "#ffffff",
      borderRadius: "1rem",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    }}
  >
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#374151",
          marginBottom: "0.5rem",
        }}
      >
        Upload Job Description
      </label>
      <FileUploader
        label="Job Description"
        file={jobFile}
        setFile={setJobFile}
        setUploadHistory={setUploadHistory}
      />
      {jobFile && (
        <p className="file-name" style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
          📄 {jobFile.name}
        </p>
      )}
    </div>

    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#374151",
          marginBottom: "0.5rem",
        }}
      >
        Upload Your Resume
      </label>
      <FileUploader
        label="Resume"
        file={resumeFile}
        setFile={setResumeFile}
        setUploadHistory={setUploadHistory}
      />
      {resumeFile && (
        <p className="file-name" style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
          📄 {resumeFile.name}
        </p>
      )}
    </div>

    <Button
     className='button'
      style={{
        width: "100%",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontWeight: 600,
        padding: "0.75rem",
        borderRadius: "0.5rem",
        cursor: "pointer",
        border: "none",
        fontSize: "1rem",
      }}
      onClick={handleAnalyze}
      disabled={!jobFile || !resumeFile || loading}
    >
      {loading ? "Analyzing..." : "Analyze Job Match"}
    </Button>

    {uploadHistory.length > 0 && (
      <div style={{ paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
        <h3
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "0.5rem",
          }}
        >
          Upload History
        </h3>
        <ul style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "0.5rem" }}>
          {uploadHistory.map((file, index) => (
            <li key={index}>
              {file.name} ({file.type}) – {file.date}
            </li>
          ))}
        </ul>
        <button
         className='button'
          style={{
            fontSize: "0.75rem",
            color: "#ef4444",
            cursor: "pointer",
            textDecoration: "underline",
            background: "none",
            border: "none",
            padding: 0,
          }}
          onClick={() => {
            setUploadHistory([]);
            localStorage.removeItem("uploadHistory");
          }}
        >
          Clear History
        </button>
      </div>
    )}
  </div>

  {/* Results Section */}
  {result && (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "1rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
       className="fade-in"
    >
      {/* Match Score */}
      <div>
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "0.5rem",
          }}
        >
          Match Score
        </h2>
        <Progress className='progress-bar-fill' value={result.matchScore} style={{ marginBottom: "0.5rem" }} />
        <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
          {result.matchScore}% match with this role
        </p>
      </div>

      {/* Skills */}
      <div>
        <h3 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Matched Skills</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {result.matchedSkills.map((skill) => (
            <span
              key={skill}
              className="skill-badge"
              style={{
                backgroundColor: "#dcfce7",
                color: "#15803d",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.875rem",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Missing Skills</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {result.missingSkills.map((skill) => (
            <span
              key={skill}
              style={{
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                fontSize: "0.875rem",
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Cover Letter */}
      {result.coverLetter && (
        <div>
          <h3
            style={{
              fontWeight: 600,
              color: "#374151",
              marginBottom: "0.5rem",
            }}
          >
            Generated Cover Letter
          </h3>
          <Textarea
            value={result.coverLetter}
            readOnly
            style={{
              width: "100%",
              fontSize: "0.875rem",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              resize: "vertical",
            }}
            rows={10}
          />
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
            <Button
              variant="secondary"
              className='button'
              onClick={() => navigator.clipboard.writeText(result.coverLetter)}
              style={{ backgroundColor: "#f3f4f6", color: "#1f2937", fontWeight: 500 }}
            >
              Copy
            </Button>
            <Button  className='button' onClick={handleDownload}>Download DOCX</Button>
            <Button  className='button' onClick={handleDownloadPDF} variant="outline">
              Download PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  )}

    {/* Error */}
    {error && (
      <div
        style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#b91c1c",
          padding: "0.75rem 1rem",
          borderRadius: "0.5rem",
        }}
      >
        <strong>Error:</strong> {error}
      </div>
    )}
</div>

   
  );
}
