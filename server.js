import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { generateSummaryAndFlashcards } from './api/_aiService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({ storage: multer.memoryStorage() });

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
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

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
