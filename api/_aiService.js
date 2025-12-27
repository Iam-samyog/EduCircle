const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Summarize text using Google Gemini
 */
async function summarizeText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert educational content summarizer. Create a comprehensive yet concise summary of the following text.
    
Your summary should:
1. Capture ALL main ideas and key concepts
2. Maintain logical flow and structure
3. Include important details, examples, and definitions
4. Be clear and easy to understand for students
5. Use bullet points or numbered lists for better readability when appropriate
6. Highlight any critical formulas, dates, or terminology

Text to summarize:
${text}

Provide a well-structured summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error in Gemini summarization:', error);
    return fallbackSummarize(text);
  }
}

/**
 * Generate flashcards using Google Gemini
 */
async function generateFlashcards(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert educator creating study flashcards. Based on the following text, create 8-12 high-quality flashcards that will help students learn and retain the material.

Guidelines for creating effective flashcards:
1. Focus on ONE concept per flashcard
2. Questions should be clear, specific, and test understanding (not just memorization)
3. Include a mix of:
   - Definition questions ("What is...?", "Define...")
   - Concept questions ("Explain...", "Why does...?")
   - Application questions ("How would you...?", "What happens if...?")
   - Comparison questions ("What's the difference between...?")
4. Answers should be concise but complete (2-4 sentences max)
5. Use simple, clear language
6. Cover the most important concepts from the text
7. Avoid yes/no questions - make them thought-provoking

Text:
${text}

Return ONLY a JSON array of objects with 'question' and 'answer' fields. No markdown, no code blocks, just the JSON array:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let resultText = response.text().trim();

    // Clean up markdown if present
    if (resultText.includes('```')) {
      resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    try {
      return JSON.parse(resultText);
    } catch (e) {
      console.error('Failed to parse JSON, trying regex:', e);
      const match = resultText.match(/\[.*\]/s);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('Could not parse AI response as JSON');
    }
  } catch (error) {
    console.error('Error in Gemini flashcard generation:', error);
    return fallbackGenerateFlashcards(text);
  }
}

/**
 * Extract text from Buffer based on file extension
 */
async function extractText(buffer, filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  if (ext === 'pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (ext === 'docx' || ext === 'doc') {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } else if (ext === 'txt') {
    return buffer.toString('utf-8');
  }
  
  throw new Error('Unsupported file format');
}

/**
 * Fallback summarization
 */
function fallbackSummarize(text) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length === 0) return "No summary available.";
  const summarySentences = sentences.slice(0, 3);
  return summarySentences.join('. ') + '.';
}

/**
 * Fallback flashcards
 */
function fallbackGenerateFlashcards(text) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).filter(s => s.length > 30);
  const flashcards = sentences.slice(0, 5).map(s => {
    const words = s.split(' ');
    const keyword = words[Math.floor(words.length / 2)];
    return {
      question: s.replace(keyword, '____'),
      answer: keyword
    };
  });
  return flashcards.length > 0 ? flashcards : [{ question: "Review the notes", answer: "Refer to the original text." }];
}

module.exports = {
  summarizeText,
  generateFlashcards,
  extractText
};
