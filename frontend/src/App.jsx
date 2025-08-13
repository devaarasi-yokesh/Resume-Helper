import { useState,useEffect } from "react";

import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Textarea } from "./components/ui/textarea";
import { Input } from "./components/ui/input";
import './App.css';
import jsPDF from "jspdf";




export default function App() {
  const [jobFile, setJobFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]); 
  const [matchScore, setMatchScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
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
      className="min-h-screen p-8"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-foreground)",
      }}
    >
      <div
        className="max-w-3xl mx-auto shadow-xl p-6 space-y-6"
        style={{
          backgroundColor: "var(--color-card)",
          color: "var(--color-card-foreground)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <h1 className="text-2xl font-bold text-center">JobMatch AI</h1>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Upload Job Description</span>
            <Input type="file" onChange={(e) =>  {
              const file = e.target.files[0];
              if (!file) return;
              if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
                alert("Only PDF or DOCX files are allowed");
                return;
              }
              setJobFile(file);
            }}
            /> 
            {jobFile && (
              <p className="text-sm text-gray-600 mt-1">📄 {jobFile.name}</p>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium">Upload Your Resume</span>
            <Input type="file" onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
                alert("Only PDF or DOCX files are allowed");
                return;
              }
              setResumeFile(file);

              const reader = new FileReader();
                reader.onload = () => {
                  const fileData = reader.result; // this is base64 string

                  const uploadHistory = JSON.parse(localStorage.getItem("uploadHistory")) || [];

              // Save to history
              const newEntry = {
                name: file.name,
                type: file.type,
                date: new Date().toLocaleString()
              };
              const updatedHistory = [newEntry, ...uploadHistory];
              setUploadHistory(updatedHistory);
              localStorage.setItem("uploadHistory", JSON.stringify(updatedHistory));
            };
              reader.readAsDataURL(file);
            }} />
            {resumeFile && (
              <p className="text-sm text-gray-600 mt-1">📄 {resumeFile.name}</p>
            )}
          </label>

          {/* Display upload history */}
          {uploadHistory.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <h3>Upload History</h3>
              <ul>
                {uploadHistory.map((file, index) => (
                  <li key={index}>
                    {file.name} ({file.type}) - {file.date}
                  </li>
                ))}
              </ul>
              <button onClick={() => {
                setUploadHistory([]);
                localStorage.removeItem("uploadHistory");
              }}>Clear History</button>
            </div>
          )}


          <Button
            className="w-full"
            onClick={handleAnalyze}
            disabled={!jobFile || !resumeFile || loading}
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {loading ? "Analyzing..." : "Analyze Job Match"}
          </Button>
        </div>

        {loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <svg
                className="animate-spin h-2 w-2 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 108 108"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              <span className="text-sm">Analyzing your resume & job description...</span>
            </div>
          )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">{error}</span>
          </div>
        )}


      {result && (
        <div>
          <h2>Match Score: {result.matchScore}%</h2>
          <progress value={result.matchScore} max="100" style={{ width: '100%' }}></progress>

          <h3>Matched Skills:</h3>
          <ul>
            {result.matchedSkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <h3>Missing Skills:</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <ul>
            {result.missingSkills.map((skill) => (
              <li
                key={skill}
                style={{ backgroundColor: 'red', color: 'white', padding: '4px 8px', borderRadius: '4px' }}
                className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </li>
            ))}
            </ul>
          </div>

          {/* Suggestions for Missing Skills: */}
          {result.missingSkills.length > 0 && (
          <section style={{ marginTop: "1rem" }}>
            <h3>Suggestions for Missing Skills:</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
              {result.missingSkills.map(skill => (
                <li key={skill} style={{ marginBottom: "0.5rem" }}>
                  <strong>{skill}:</strong> {skillSuggestions[skill] || "No suggestion available yet."}
                </li>
              ))}
            </ul>
          </section>
        )}



          {result.coverLetter && !loading && (
        <div className="animate-fadeIn" style={{ marginTop: '2rem' }}>
          <h3>Generated Cover Letter</h3>
          <textarea
            value={result.coverLetter}
            readOnly
            rows={12}
            style={{ width: '100%', padding: '1rem', fontFamily: 'monospace', fontSize: '1rem' }}
          />
          <button
            onClick={() => navigator.clipboard.writeText(result.coverLetter)}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Copy Cover Letter
          </button>
          {coverLetter && 
          <button onClick={handleDownload}  style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                borderRadius: "var(--radius-md)",
              }}  disabled={loading || !result}>Download Cover Letter</button>
          }
          <button
              onClick={handleDownloadPDF}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                background: '#1976D2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginLeft: '0.5rem'
              }}
            >
              Download PDF
            </button>

        </div>
      )}

              </div>
            )}
        

            </div>
    </div>
  );
}
