import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';

export const generateSummaryAndFlashcards = async (file, manualText) => {
  console.log('--- AI Analysis Start (Multimodal) ---');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Gemini 1.5 Flash is highly optimized for multimodal (PDF, Text, images)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    let contents = [];
    let textPrompt = `
      Analyze the provided educational content and return a JSON object with:
      1. "summary": A concise summary (max 300 words) using LaTeX for formulas ($...$ inline, $$...$$ block).
      2. "keyPoints": 5-10 key points in LaTeX format.
      3. "flashcards": 5-10 study flashcards: [{"question": "...", "answer": "..."}].

      Ensure all text is properly escaped for JSON. Return ONLY the JSON object.
    `;

    if (file) {
      console.log(`Processing ${file.mimetype}: ${file.originalname}`);
      
      if (file.mimetype === 'application/pdf') {
        // Direct PDF support via Gemini! 🚀
        contents = [
          {
            inlineData: {
              data: file.buffer.toString('base64'),
              mimeType: 'application/pdf'
            }
          },
          textPrompt
        ];
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const docResult = await mammoth.extractRawText({ buffer: file.buffer });
        contents = [textPrompt + "\n\nContent:\n" + docResult.value];
      } else if (file.mimetype.startsWith('text/')) {
        contents = [textPrompt + "\n\nContent:\n" + file.buffer.toString('utf-8')];
      } else {
        throw new Error('Unsupported file type. Use PDF, DOCX, or TXT.');
      }
    } else if (manualText) {
      contents = [textPrompt + "\n\nContent:\n" + manualText];
    } else {
      throw new Error('No content provided for analysis.');
    }

    console.log('Sending request to Gemini 1.5 Flash...');
    const result = await model.generateContent(contents);
    const response = await result.response;
    let jsonText = response.text();
    
    // Clean JSON response
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      console.error('Raw AI Response:', jsonText);
      throw new Error('AI returned an unexpected format. Please try again.');
    }
    
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonText);

  } catch (error) {
    console.error('AI Service Critical Error:', error);
    throw error;
  }
};
