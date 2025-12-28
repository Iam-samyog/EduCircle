import express from 'express';
import cors from 'cors';
import multer from 'multer';

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
    // aiReady flag removed
    // keyLength flag removed
    timestamp: new Date().toISOString()
  });
});

// AI analyze endpoint disabled
app.post('/api/ai/analyze', upload.single('file'), async (req, res) => {
  // AI functionality disabled; return empty result
  const result = { summary: '', flashcards: [] };
  res.json(result);
});

// Handle 404s for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

export default app;
