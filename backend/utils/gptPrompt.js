export function buildPrompt(resume, job) {
  return `
You are a job-matching assistant.

1. Analyze the following resume and job description.
2. Provide a match score (0-100).
3. List matched skills and missing keywords.
4. Generate a professional, personalized cover letter.

Resume:
${resume}

Job Description:
${job}

Respond in this format:
- Match Score: XX%
- Skills Matched: [...]
- Missing Keywords: [...]
- Cover Letter:
<full letter>
`;
}


