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
  
  // Dynamic require for PDF to handle Vercel issues
  let pdf;
  try {
    const pdf_parse = require('pdf-parse');
    console.log('Require pdf-parse result type:', typeof pdf_parse);
    if (typeof pdf_parse === 'function') {
      pdf = pdf_parse;
    } else if (pdf_parse && typeof pdf_parse.default === 'function') {
      pdf = pdf_parse.default;
    } else {
      console.warn('pdf-parse is not a function, trying internal path...');
      pdf = require('pdf-parse/lib/pdf-parse.js');
    }
  } catch (e) {
    console.error('PDF require error:', e.message);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    let text = manualText || '';

    if (file) {
      console.log('Processing file:', file.originalname, 'mime:', file.mimetype);
      if (file.mimetype === 'application/pdf') {
        if (typeof pdf !== 'function') {
          throw new Error('PDF extraction is currently unavailable on the server. Please copy-paste the text instead.');
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
        throw new Error('Unsupported file type');
      }
    }

    if (!text || text.trim().length < 50) {
      throw new Error('The document content seems too short for AI analysis. Please provide more text.');
    }

    console.log('Extracted text length:', text.length);

    // Using gemini-1.5-flash which is standard. If it 404s, we'll try gemini-pro.
    let model;
    try {
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (e) {
      console.warn('Failed to load gemini-1.5-flash, falling back to gemini-pro');
      model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

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

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonText = response.text();
    console.log('Received response from Gemini');
    
    // Improved JSON extraction: Find the first '{' and last '}'
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      console.error('Raw AI Response:', jsonText);
      throw new Error('AI returned an unexpected format. Please try again.');
    }
    
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    
    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', jsonText);
      throw new Error('AI returned data that couldn\'t be processed. Try a shorter segment of text.');
    }
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
};
