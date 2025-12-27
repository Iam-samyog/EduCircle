module.exports = async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    source: 'vercel-node-serverless',
    time: new Date().toISOString(),
    aiReady: !!process.env.GEMINI_API_KEY
  });
};
