from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_service import summarize_text, generate_flashcards, extract_text_from_file
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """Summarize text or file using AI"""
    try:
        text = ""
        # Check if file was uploaded
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            _, ext = os.path.splitext(file.filename)
            text = extract_text_from_file(file, ext.lower())
        else:
            # Check for JSON text
            data = request.get_json(silent=True)
            if data:
                text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        print(f"DEBUG: Processing summarize request. Source: {'file' if 'file' in request.files else 'text'}")
        summary = summarize_text(text)
        print(f"DEBUG: Summarization complete. Success: {bool(summary)}")
        return jsonify({'summary': summary, 'extractedText': text}), 200
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in summarize: {str(e)}")
        print(error_details)
        return jsonify({
            'error': str(e), 
            'details': error_details,
            'message': 'Summarization failed. See browser console for details.'
        }), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def flashcards():
    """Generate flashcards from text or file using AI"""
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
        
        print(f"DEBUG: Processing flashcards request. Source: {'file' if 'file' in request.files else 'text'}")
        flashcards = generate_flashcards(text)
        print(f"DEBUG: Flashcard generation complete. Cards count: {len(flashcards) if flashcards else 0}")
        return jsonify({'flashcards': flashcards}), 200
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in flashcards: {str(e)}")
        print(error_details)
        return jsonify({
            'error': str(e), 
            'details': error_details,
            'message': 'Flashcard generation failed. See browser console for details.'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint with AI diagnostics"""
    from ai_service import model
    return jsonify({
        'status': 'healthy',
        'ai_ready': model is not None,
        'has_api_key': os.getenv('GEMINI_API_KEY') is not None
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f"Starting local backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
