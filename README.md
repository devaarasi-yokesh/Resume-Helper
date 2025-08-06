# 📝 Resume Matcher (AI-Powered)

This project is an AI-powered Resume Matcher that compares a user's resume with a job description, calculates a match score using OpenAI embeddings, identifies matched and missing skills, and even generates a personalized cover letter.

## 🚀 Features

- Upload a **resume (PDF/DOCX)** and a **job description (PDF/DOCX)**
- Extracts and compares content using OpenAI Embeddings API
- Calculates a **match score** between resume and JD
- Highlights **matched** and **missing** skills
- Generates a **personalized cover letter**
- Simple and interactive **React frontend**
- Clean, modular **Express backend** with OpenAI integration

---
## 🧠 How It Works

1. User uploads a resume and job description.
2. Backend extracts raw text using `pdf-parse` and `mammoth`.
3. Both texts are embedded using OpenAI’s `text-embedding-3-small`.
4. Cosine similarity gives a **match score**.
5. Skills are extracted and compared.
6. A tailored cover letter is generated using GPT.

---

## ⚙️ Prerequisites

- Node.js (v18+ recommended)
- OpenAI API key (set up billing in your [OpenAI dashboard](https://platform.openai.com/account/billing))

---

🧰 Built With
React – Frontend

Express.js – Backend

OpenAI API – Embeddings & GPT

pdf-parse / mammoth – Resume & JD parsing

multer – File upload handling

🙌 Future Enhancements
Save history of uploads and results

Multi-language support

Export analysis as PDF

Authentication

---

📄 License
This project is open-source under the MIT License.

---
🤝 Acknowledgments
Thanks to OpenAI for the powerful APIs and to all the open-source libraries that made this project smooth to build!