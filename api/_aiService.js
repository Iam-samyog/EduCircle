const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Sanity check for API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

/**
 * Summarize text using Google Gemini
 */
async function summarizeText(text) {
  if (!text || text.length < 10) {
    console.warn('summarizeText: Input text is too short, returning fallback.');
    return fallbackSummarize(text || '');
  }

  try {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert educational content summarizer. Create a comprehensive yet concise summary of the following text.
    
Your summary should:
1. Capture ALL main ideas and key concepts
2. Maintain logical flow and structure
3. Include important details, examples, and definitions
4. Be clear and easy to understand for students
5. Use bullet points or numbered lists for better readability when appropriate
6. Highlight any critical terminology

Text to summarize:
${text.substring(0, 30000)} // Safety cap for context window

Provide a well-structured summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();
    
    if (!summary) throw new Error('Gemini returned an empty summary');
    return summary;

  } catch (error) {
    console.error('CRITICAL: Gemini summarization failed:', error.message);
    // Log more details if it's a Gemini error
    if (error.response) {
      console.error('Gemini Error Response:', JSON.stringify(error.response, null, 2));
    }
    return fallbackSummarize(text);
  }
}

/**
 * Generate flashcards using Google Gemini
 */
async function generateFlashcards(text) {
  if (!text || text.length < 20) {
    console.warn('generateFlashcards: Input text is too short, returning fallback.');
    return fallbackGenerateFlashcards(text || '');
  }

  try {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert educator creating study flashcards. Based on the following text, create 8-12 high-quality flashcards.

Guidelines:
1. Focus on ONE concept per flashcard
2. Return ONLY a JSON array of objects with 'question' and 'answer' fields. 
3. No markdown, no code blocks.

Text:
${text.substring(0, 20000)}

JSON Array:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let resultText = response.text().trim();

    // Aggressive cleaning of markdown
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(resultText);
      if (!Array.isArray(parsed)) throw new Error('Expected array but got ' + typeof parsed);
      return parsed;
    } catch (e) {
      console.error('JSON parsing failed, attempting regex extraction:', e.message);
      const match = resultText.match(/\[\s*\{.*\}\s*\]/s);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('AI response was not valid JSON: ' + resultText.substring(0, 50));
    }
  } catch (error) {
    console.error('CRITICAL: Gemini flashcard generation failed:', error.message);
    return fallbackGenerateFlashcards(text);
  }
}

/**
 * Extract text from Buffer based on file extension
 */
async function extractText(buffer, filename) {
  if (!buffer || buffer.length === 0) throw new Error('Empty buffer provided');
  
  const ext = filename.split('.').pop().toLowerCase();
  console.log(`Extracting text from ${filename} (${buffer.length} bytes)...`);

  try {
    if (ext === 'pdf') {
      const data = await pdf(buffer);
      if (!data || !data.text) throw new Error('pdf-parse returned no text');
      return data.text;
    } else if (ext === 'docx' || ext === 'doc') {
      const data = await mammoth.extractRawText({ buffer });
      if (!data || !data.value) throw new Error('mammoth returned no text');
      return data.value;
    } else if (ext === 'txt') {
      return buffer.toString('utf-8');
    }
    throw new Error('Unsupported file format: ' + ext);
  } catch (err) {
    console.error(`Text extraction failed for ${filename}:`, err.message);
    throw err;
  }
}

/**
 * Fallback summarization
 */
function fallbackSummarize(text) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length === 0) return "The document was processed but no summary could be generated. Please check the content for readability.";
  const summarySentences = sentences.slice(0, 3);
  return summarySentences.join('. ') + '.';
}

/**
 * Fallback flashcards
 */
function fallbackGenerateFlashcards(text) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).filter(s => s.length > 20);
  const flashcards = sentences.slice(0, 6).map(s => {
    const words = s.split(' ');
    if (words.length < 5) return null;
    const hideIndex = Math.floor(words.length / 2);
    const answer = words[hideIndex];
    const question = words.map((w, i) => i === hideIndex ? '____' : w).join(' ');
    return { question, answer };
  }).filter(Boolean);
  
  return flashcards.length > 0 ? flashcards : [{ question: "Review your notes", answer: "Refer to the original text." }];
}

module.exports = {
  summarizeText,
  generateFlashcards,
  extractText
};
