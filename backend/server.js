import express, { json } from "express";
import cors from "cors";
import multer from "multer";
import { config } from "dotenv";
import analyzeRoute from "./routes/analyze.js";
import downloadRoute from "./routes/download.js";
import path from "path";
import { fileURLToPath } from "url";

config();
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
const buildPath = path.join(__dirname, "../frontend/dist");;
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});
  
// Routes
app.use("/analyze", analyzeRoute);
app.use("/download-cover-letter", downloadRoute);

const PORT = process.env.PORT || 3001;

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
