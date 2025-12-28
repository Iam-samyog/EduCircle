import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { generateSummaryAndFlashcards } from './_aiService.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({ storage: multer.memoryStorage() });

// Routes inside /api
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mode: 'production-serverless',
    aiReady: !!process.env.GEMINI_API_KEY
  });
});

app.post('/api/ai/analyze', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { text: manualText } = req.body;

    if (!file && !manualText) {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    const result = await generateSummaryAndFlashcards(file, manualText);
    res.json(result);
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Handle 404s for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

export default app;
