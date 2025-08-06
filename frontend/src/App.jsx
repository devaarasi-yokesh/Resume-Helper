import { useState } from "react";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Textarea } from "./components/ui/textarea";
import { Input } from "./components/ui/input";
import './App.css';

export default function App() {
  const [jobFile, setJobFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [coverLetter, setCoverLetter] = useState("");

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
            }} />
            {resumeFile && (
              <p className="text-sm text-gray-600 mt-1">📄 {resumeFile.name}</p>
            )}
          </label>

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

        {loading && <p>Analyzing... Please wait.</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

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
          <ul>
            {result.missingSkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          {result.coverLetter && (
        <div style={{ marginTop: '2rem' }}>
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
        </div>
      )}

              </div>
            )}
        

            </div>
    </div>
  );
}
