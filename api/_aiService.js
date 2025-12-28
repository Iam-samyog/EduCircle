import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not defined in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey || '');

export const generateSummaryAndFlashcards = async (file, manualText) => {
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.');
  }
  try {
    let text = manualText || '';

    if (file) {
      if (file.mimetype === 'application/pdf') {
        const data = await pdf(file.buffer);
        text = data.text;
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const data = await mammoth.extractRawText({ buffer: file.buffer });
        text = data.value;
      } else if (file.mimetype.startsWith('text/')) {
        text = file.buffer.toString('utf-8');
      } else {
        throw new Error('Unsupported file type');
      }
    }

    if (!text || text.trim().length < 50) {
      throw new Error('Content too short for analysis');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Analyze the following educational content and provide:
      1. A concise summary (max 300 words) using LaTeX for all mathematical formulas, scientific notations, and technical terms where appropriate. Use standard LaTeX delimiters like $...$ for inline and $$...$$ for blocks.
      2. 5-10 key points formatted in LaTeX.
      3. 5-10 study flashcards in JSON format: [{"question": "...", "answer": "..."}].

      Return ONLY a JSON object with this exact structure:
      {
        "summary": "...",
        "keyPoints": ["...", "..."],
        "flashcards": [{"question": "...", "answer": "..."}]
      }

      Ensure all text inside the JSON strings is properly escaped for JSON compatibility, especially LaTeX backslashes.

      Content:
      ${text.substring(0, 10000)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text();
    
    // Improved JSON extraction: Find the first '{' and last '}'
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      console.error('Raw AI Response:', jsonText);
      throw new Error('AI returned invalid format (No JSON found)');
    }
    
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    
    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', jsonText);
      throw new Error('AI returned unparseable content');
    }
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};
