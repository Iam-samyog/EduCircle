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
    console.log('--- AI Analysis Start ---');
    const bb = busboy({ headers: req.headers });
    let fileBuffer = null;
    let fileName = '';
    let fileMimeType = '';
    let manualText = '';

    const bbPromise = new Promise((resolve, reject) => {
      bb.on('file', (name, file, info) => {
        const { filename, mimeType } = info;
        console.log(`Receiving file: ${filename} (${mimeType})`);
        fileName = filename;
        fileMimeType = mimeType;
        const chunks = [];
        file.on('data', (chunk) => chunks.push(chunk));
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
          console.log(`File received: ${fileBuffer.length} bytes`);
        });
      });

      bb.on('field', (name, val) => {
        if (name === 'text') manualText = val;
      });

      bb.on('finish', () => resolve());
      bb.on('error', (err) => {
        console.error('Busboy error:', err);
        reject(err);
      });
    });

    req.pipe(bb);
    await bbPromise;
    console.log('Busboy parsing complete');

    const file = fileBuffer ? {
      buffer: fileBuffer,
      originalname: fileName,
      mimetype: fileMimeType
    } : null;

    if (!file && !manualText) {
      console.warn('No content provided');
      return res.status(400).json({ error: 'No file or text provided' });
    }

    console.log('Calling generateSummaryAndFlashcards...');
    const result = await generateSummaryAndFlashcards(file, manualText);
    console.log('AI Analysis Success');
    res.status(200).json(result);
  } catch (error) {
    console.error('--- AI Analysis CRITICAL FAILURE ---');
    console.error('Error Object:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'AI Analysis Failed', 
      message: error.message,
      detail: 'See server logs for stack trace'
    });
  }
}
