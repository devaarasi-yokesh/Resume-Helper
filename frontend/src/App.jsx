import { useState } from "react";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Textarea } from "./components/ui/textarea";
import { Input } from "./components/ui/input";
import './App.css'; // or './index.css'


export default function App() {
  const [jobFile, setJobFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [coverLetter, setCoverLetter] = useState("");

const handleAnalyze = async () => {
  setLoading(true);

  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("job", jobFile);

  try {
    const res = await fetch("http://localhost:3001/analyze", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    console.log(data.result);

    // Example: update state based on API response
    setMatchScore(data.matchScore || 83);
    setMatchedSkills(data.matchedSkills || ["React", "JavaScript", "Node.js"]);
    setMissingSkills(data.missingSkills || ["GraphQL", "Unit Testing"]);
    setCoverLetter(data.coverLetter || `Dear Hiring Manager,\n\nI'm excited to apply for the role...`);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">JobMatch AI</h1>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Upload Job Description</span>
            <Input type="file" onChange={(e) => setJobFile(e.target.files[0])} />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Upload Your Resume</span>
            <Input type="file" onChange={(e) => setResumeFile(e.target.files[0])} />
          </label>

          <Button
            className="w-full"
            onClick={handleAnalyze}
            disabled={!jobFile || !resumeFile || loading}
          >
            {loading ? "Analyzing..." : "Analyze Job Match"}
          </Button>
        </div>

        {matchScore !== null && (
          <div className="pt-6 space-y-4">
            <div>
              <h2 className="font-semibold">Match Score</h2>
              <Progress value={matchScore} />
              <p className="text-sm mt-1">{matchScore}% match</p>
            </div>

            <div>
              <h2 className="font-semibold">Matched Skills</h2>
              <ul className="list-disc list-inside text-green-600">
                {matchedSkills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-semibold">Missing Skills</h2>
              <ul className="list-disc list-inside text-red-500">
                {missingSkills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Generated Cover Letter</h2>
              <Textarea value={coverLetter} rows={10} readOnly />
              <div className="mt-2 flex gap-2">
                <Button onClick={() => navigator.clipboard.writeText(coverLetter)}>
                  Copy
                </Button>
                <Button variant="outline">Download PDF</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
