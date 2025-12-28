import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
// import { generateSummaryAndFlashcards } from './api/_aiService.js'; // AI service removed

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

// AI analyze endpoint disabled
app.post('/api/ai/analyze', upload.single('file'), async (req, res) => {
  // Return empty result since AI is removed
  const result = { summary: '', flashcards: [] };
  res.json(result);
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
