import express, { json } from "express";
import cors from "cors";
import multer from "multer";
import { config } from "dotenv";
import analyzeRoute from "./routes/analyze.js";
import downloadRoute from "./routes/download.js";

config();
const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

app.use("/analyze", analyzeRoute);
app.use("/download-cover-letter", downloadRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
