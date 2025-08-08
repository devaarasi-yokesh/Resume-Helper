// routes/download.js
import express from 'express';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { coverLetter } = req.body;

    if (!coverLetter) {
      return res.status(400).json({ error: 'Cover letter text is required' });
    }

    const paragraphs = coverLetter.split('\n').map(line =>
      new Paragraph({
        children: [new TextRun(line)],
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    console.log(
        'Cover letter generated successfully, preparing to send as download...'
    )

    // Optional: use current timestamp for filename
    const filename = `cover-letter-${Date.now()}.docx`;

    // Send as downloadable file
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

export default router;
