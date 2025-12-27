from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_service import summarize_text, generate_flashcards, extract_text_from_file
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/summarize', methods=['POST'])
def summarize():
    try:
        text = ""
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            _, ext = os.path.splitext(file.filename)
            text = extract_text_from_file(file, ext.lower())
        else:
            data = request.get_json(silent=True)
            if data:
                text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        summary = summarize_text(text)
        return jsonify({'summary': summary, 'extractedText': text}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def flashcards():
    try:
        text = ""
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            _, ext = os.path.splitext(file.filename)
            text = extract_text_from_file(file, ext.lower())
        else:
            data = request.get_json(silent=True)
            if data:
                text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        flashcards = generate_flashcards(text)
        return jsonify({'flashcards': flashcards}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'source': 'vercel-serverless'}), 200

# Vercel needs the app variable
app = app
