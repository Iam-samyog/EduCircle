import busboy from 'busboy';
import { generateSummaryAndFlashcards } from './_aiService.js';

export const config = {
  api: {
    bodyParser: false, // Disabling bodyParser to handle multipart manually
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const bb = busboy({ headers: req.headers });
    let fileBuffer = null;
    let fileName = '';
    let fileMimeType = '';
    let manualText = '';

    const bbPromise = new Promise((resolve, reject) => {
      bb.on('file', (name, file, info) => {
        const { filename, mimeType } = info;
        fileName = filename;
        fileMimeType = mimeType;
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on('field', (name, val) => {
        if (name === 'text') manualText = val;
      });

      bb.on('finish', () => resolve());
      bb.on('error', (err) => reject(err));
    });

    req.pipe(bb);
    await bbPromise;

    const file = fileBuffer ? {
      buffer: fileBuffer,
      originalname: fileName,
      mimetype: fileMimeType
    } : null;

    if (!file && !manualText) {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    const result = await generateSummaryAndFlashcards(file, manualText);
    res.status(200).json(result);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ 
      error: 'AI Analysis Failed', 
      message: error.message 
    });
  }
}
