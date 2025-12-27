const { generateFlashcards, extractText } = require('./_aiService');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() }).single('file');

/**
 * Helper to run middleware in serverless functions
 */
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

/**
 * Flashcards endpoint: POST /api/generate-flashcards
 */
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let text = '';
    
    // Check if it's a multipart form (file upload)
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      await runMiddleware(req, res, upload);
      if (req.file) {
        text = await extractText(req.file.buffer, req.file.originalname);
      }
    } else {
      // JSON text input
      text = req.body.text;
    }

    if (!text) {
      return res.status(400).json({ error: 'No text or file provided' });
    }

    const flashcards = await generateFlashcards(text);
    return res.status(200).json({ flashcards });
  } catch (error) {
    console.error('Error in flashcards endpoint:', error);
    return res.status(500).json({ 
      error: 'Flashcard generation failed', 
      details: error.message 
    });
  }
};
