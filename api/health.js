export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    mode: 'direct-serverless',
    status: 'ok',
    mode: 'direct-serverless',
    timestamp: new Date().toISOString()
  });
}
