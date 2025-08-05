import pdfParse from "pdf-parse";
import { OpenAI } from "openai";
import { buildPrompt } from "../utils/gptPrompt.js";
import { parseResume } from "../utils/parseResume.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analyzeRoute = async (req, res) => {
  try {
    const resumeText = await parseResume(
      req.files["resume"][0].buffer,
      req.files["resume"][0].originalname
    );
    const jobText = await parseResume(
      req.files["job"][0].buffer,
      req.files["job"][0].originalname
    );

    const prompt = buildPrompt(resumeText, jobText);

    const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
  });

    res.json({ result: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export default analyzeRoute;
