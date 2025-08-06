import express from 'express';
import multer from 'multer';
import pdf from 'pdf-parse'; 
import fs from 'fs';
import mammoth from 'mammoth'; 
import {OpenAI} from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
});


// Function to get OpenAI embeddings
// This function takes a text input and returns its embedding vector
async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    throw error;
  }
}

// Function to compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) { 
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}


// Function to extract text from PDF or DOCX files
async function extractText(file) {
  const buffer = fs.readFileSync(file.path);

  if (file.mimetype === 'application/pdf') {
    return (await pdf(buffer)).text;
  } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    throw new Error('Unsupported file type');
  }
}

// Function to extract skills from text using OpenAI
async function extractSkillsFromText(text, label) {
  if (!text || !label) {
  return res.status(400).json({ error: 'Missing resume or job description text.' });
  }

  const prompt = `Extract only a JSON array (no explanations) of skills mentioned in this ${label}. Return result like ["JavaScript", "Teamwork", "Agile"]:"${text}"`;



  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  // Parse JSON array from the response
  const raw = response.choices[0].message.content.trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse skills JSON:', raw);
    return [];
  }
  
}

// Function to generate a cover letter using OpenAI
async function generateCoverLetter(resumeText, jobText) {
  const prompt = `
Using the following resume and job description, write a personalized and concise cover letter tailored for this role. Address the hiring manager, highlight relevant experience, and keep the tone professional and enthusiastic. Keep it under 300 words.

Resume:
${resumeText}

Job Description:
${jobText}

Cover Letter:
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4", // or "gpt-3.5-turbo"
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}


// Route to handle file uploads and analysis
router.post('/', upload.fields([{ name: 'resume' }, { name: 'job' }]), async (req, res) => {
  try {
    const resumeFile = req.files['resume'][0];
    const jobFile = req.files['job'][0];

    console.log('Received files:', resumeFile.originalname, jobFile.originalname);

    const resumeText = await extractText(resumeFile);
    const jobText = await extractText(jobFile);

    // Get OpenAI embeddings
    const resumeEmbedding = await getEmbedding(resumeText);
    const jobEmbedding = await getEmbedding(jobText);

    // Compute similarity
    const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
    const matchScore = Math.round(similarity * 100); 
    

    const resumeSkills = await extractSkillsFromText(resumeText, 'resume');
    const jobSkills = await extractSkillsFromText(jobText, 'job description');

    const coverLetter = await generateCoverLetter(resumeText, jobText);

    // Normalize (e.g., lowercase and trim)
    const normalize = (arr) => arr.map((s) => s.toLowerCase().trim());

    const matchedSkills = normalize(resumeSkills).filter((skill) =>
      normalize(jobSkills).includes(skill)
    );

    const missingSkills = normalize(jobSkills).filter(
      (skill) => !normalize(resumeSkills).includes(skill)
    );

    // Optional: Capitalize results for UI
    function capitalize(s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    const result = {
       matchScore:Math.round((matchedSkills.length / jobSkills.length) * 100),
  // Optional: stub values or remove these for now
     matchedSkills: matchedSkills.map(capitalize),
     missingSkills: missingSkills.map(capitalize),
     coverLetter: coverLetter 
};


    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  } finally {
    // Clean up uploaded files
    if (req.files['resume']) fs.unlinkSync(req.files['resume'][0].path);
    if (req.files['job']) fs.unlinkSync(req.files['job'][0].path);
  }
});

export default router;
