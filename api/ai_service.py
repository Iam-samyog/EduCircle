"""
AI Service using Google Gemini for text summarization and flashcard generation
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables")
    model = None

def summarize_text(text):
    """
    Summarize text using Google Gemini with enhanced prompting
    """
    if not model:
        return fallback_summarize(text)
    
    try:
        prompt = f"""You are an expert educational content summarizer. Create a comprehensive yet concise summary of the following text.

Your summary should:
1. Capture ALL main ideas and key concepts
2. Maintain logical flow and structure
3. Include important details, examples, and definitions
4. Be clear and easy to understand for students
5. Use bullet points or numbered lists for better readability when appropriate
6. Highlight any critical formulas, dates, or terminology

Text to summarize:
{text}

Provide a well-structured summary:"""
        
        response = model.generate_content(prompt)
        return response.text.strip()
    
    except Exception as e:
        print(f'Error in Gemini summarization: {str(e)}')
        # Fallback to simple summarization
        return fallback_summarize(text)

def generate_flashcards(text):
    """
    Generate high-quality educational flashcards using Google Gemini
    """
    if not model:
        return fallback_generate_flashcards(text)
    
    try:
        prompt = f"""You are an expert educator creating study flashcards. Based on the following text, create 8-12 high-quality flashcards that will help students learn and retain the material.

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
{text}

Return ONLY a JSON array of objects with 'question' and 'answer' fields. No markdown, no code blocks, just the JSON array:"""
        
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Try to parse as JSON
        import json
        # Remove markdown code blocks if present
        if result_text.startswith('```'):
            result_text = result_text.split('```')[1]
            if result_text.startswith('json'):
                result_text = result_text[4:]
        
        flashcards = json.loads(result_text.strip())
        
        # Validate format
        if isinstance(flashcards, list) and len(flashcards) > 0:
            # Ensure each flashcard has question and answer
            valid_flashcards = []
            for card in flashcards:
                if isinstance(card, dict) and 'question' in card and 'answer' in card:
                    valid_flashcards.append(card)
            
            if valid_flashcards:
                return valid_flashcards
        
        # If parsing failed, use fallback
        return fallback_generate_flashcards(text)
    
    except Exception as e:
        print(f'Error in Gemini flashcard generation: {str(e)}')
        return fallback_generate_flashcards(text)

import io
from pypdf import PdfReader
from docx import Document

# ... (previous imports)

def extract_text_from_file(file_storage, file_ext):
    """
    Extract text from uploaded file based on extension
    """
    try:
        text = ""
        if file_ext == '.pdf':
            reader = PdfReader(file_storage)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif file_ext in ['.docx', '.doc']:
            doc = Document(file_storage)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        elif file_ext == '.txt':
            text = file_storage.read().decode('utf-8', errors='ignore')
        
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from {file_ext}: {str(e)}")
        # Raise generic error for caller to handle
        raise ValueError(f"Could not extract text from {file_ext} file")

# ... (rest of simple fallbacks)

def fallback_summarize(text):
    """Simple extractive summarization fallback"""
    import re
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    summary_sentences = sentences[:min(3, len(sentences))]
    summary = '. '.join(summary_sentences) + '.'
    if len(summary) < 100 and len(sentences) > 3:
        summary_sentences = sentences[:5]
        summary = '. '.join(summary_sentences) + '.'
    return summary

def fallback_generate_flashcards(text):
    """Simple pattern-based flashcard generation fallback"""
    import re
    flashcards = []
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip() and len(s) > 20]
    
    for i, sentence in enumerate(sentences[:10]):
        if ' is ' in sentence.lower():
            parts = sentence.split(' is ', 1)
            if len(parts) == 2:
                flashcards.append({
                    'question': f'What is {parts[0].strip()}?',
                    'answer': parts[1].strip()
                })
        elif ' are ' in sentence.lower():
            parts = sentence.split(' are ', 1)
            if len(parts) == 2:
                flashcards.append({
                    'question': f'What are {parts[0].strip()}?',
                    'answer': parts[1].strip()
                })
        elif len(sentence) > 30:
            words = sentence.split()
            if len(words) > 5:
                key_word = words[len(words)//2]
                question = sentence.replace(key_word, '____', 1)
                flashcards.append({
                    'question': question,
                    'answer': key_word
                })
    
    if not flashcards and sentences:
        for sentence in sentences[:5]:
            flashcards.append({
                'question': f'What does this mean: "{sentence[:50]}..."?',
                'answer': sentence
            })
    
    return flashcards if flashcards else [{
        'question': 'What is the main topic of this text?',
        'answer': 'Review the uploaded notes for details.'
    }]
