import pdfParse from "pdf-parse";
import { extractRawText } from "mammoth";

/**
 * Parse a buffer based on file type and return plain text.
 * Supports PDF and DOCX.
 * 
 * @param {Buffer} fileBuffer - File data
 * @param {string} filename - Original filename to detect extension
 * @returns {Promise<string>} Parsed plain text
 */
console.log("Resume file:", req.files["resume"]);
console.log("Job file:", req.files["job"]);

export async function parseResume(fileBuffer, filename) {
  const extension = filename.split(".").pop().toLowerCase();

  if (extension === "pdf") {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } else if (extension === "docx") {
    const { value } = await extractRawText({ buffer: fileBuffer });
    return value;
  } else {
    throw new Error("Unsupported file format. Use PDF or DOCX.");
  }
}

