// Polyfills for Vercel/Serverless environments - MUST BE AT THE VERY TOP
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
  };
}
if (typeof globalThis.Image === 'undefined') globalThis.Image = class {};
if (typeof globalThis.ImageData === 'undefined') globalThis.ImageData = class {};
if (typeof globalThis.Path2D === 'undefined') globalThis.Path2D = class {};

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

export const generateSummaryAndFlashcards = async (file, manualText) => {
  console.log('--- generateSummaryAndFlashcards Entry ---');
  
  // Robust PDF require - explicitly checking all possible export shapes
  let pdf;
  try {
    const pdf_parse = require('pdf-parse');
    console.log('PDF module type:', typeof pdf_parse);
    
    if (typeof pdf_parse === 'function') {
      pdf = pdf_parse;
    } else if (pdf_parse && typeof pdf_parse.default === 'function') {
      pdf = pdf_parse.default;
    } else if (pdf_parse && typeof pdf_parse.pdf === 'function') {
      pdf = pdf_parse.pdf;
    } else if (typeof pdf_parse === 'object' && pdf_parse !== null) {
      // Sometimes it's a nested object in certain build environments
      const keys = Object.keys(pdf_parse);
      console.log('PDF module keys:', keys);
      const funcKey = keys.find(k => typeof pdf_parse[k] === 'function');
      if (funcKey) pdf = pdf_parse[funcKey];
    }
  } catch (e) {
    console.error('PDF library require failed:', e.message);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.');
  }

  // FORCE v1 API version to avoid the 404 on v1beta
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    let text = manualText || '';

    if (file) {
      console.log('Processing file:', file.originalname, 'mime:', file.mimetype);
      if (file.mimetype === 'application/pdf') {
        if (typeof pdf !== 'function') {
          console.error('PDF library is not a function after require attempt');
          throw new Error('PDF extraction is currently unavailable on the server. Please copy-paste the text instead or use a .docx file.');
        }
        const data = await pdf(file.buffer, {
          pagerender: () => "" // Skip rendering to avoid canvas/DOMMatrix issues
        });
        text = data.text;
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const data = await mammoth.extractRawText({ buffer: file.buffer });
        text = data.value;
      } else if (file.mimetype.startsWith('text/')) {
        text = file.buffer.toString('utf-8');
      } else {
        throw new Error('Unsupported file type. Please use PDF, DOCX, or TXT.');
      }
    }

    if (!text || text.trim().length < 50) {
      throw new Error('The document content is too short for analysis.');
    }

    // List of reliable models. We prioritize 1.5-flash as it is fastest and most available.
    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro'];
    let lastError = null;
    let result = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Attempting AI analysis with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
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
          ${text.substring(0, 15000)}
        `;

        const aiResult = await model.generateContent(prompt);
        const response = await aiResult.response;
        result = response.text();
        console.log(`Success with model: ${modelName}`);
        break; // Exit loop on success
      } catch (e) {
        console.error(`Failed with model ${modelName}:`, e.message);
        lastError = e;
      }
    }

    if (!result) {
      throw lastError || new Error('All AI models failed to process the content.');
    }

    let jsonText = result;
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('AI returned an unexpected format. Please try again.');
    }
    
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    
    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error('AI returned data that couldn\'t be parsed. Try a shorter segment of text.');
    }
  } catch (error) {
    console.error('Final AI Service Error:', error);
    throw error;
  }
};
