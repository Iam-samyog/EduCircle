export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    mode: 'direct-serverless',
    aiReady: !!process.env.GEMINI_API_KEY,
    keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    timestamp: new Date().toISOString()
  });
}
