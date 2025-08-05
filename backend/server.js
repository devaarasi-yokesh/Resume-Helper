import express, { json } from "express";
import cors from "cors";
import multer from "multer";
import { config } from "dotenv";
import analyzeRoute from "./routes/analyze.js";

config();
const app = express();
const upload = multer();

app.use(cors());
app.use(json());

app.post("/analyze", upload.fields([{ name: "resume" }, { name: "job" }]), analyzeRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
