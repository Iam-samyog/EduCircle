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
        print(f"DEBUG: Processing summarize request. Files: {request.files}, JSON: {request.get_json(silent=True)}")
        text = ""
        # Check if file was uploaded
        if 'file' in request.files:
            file = request.files['file']
            print(f"DEBUG: File uploaded: {file.filename}")
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            # Get extension
            import os
            _, ext = os.path.splitext(file.filename)
            text = extract_text_from_file(file, ext.lower())
            print(f"DEBUG: Extracted text length: {len(text)}")
        else:
            # Check for JSON text
            data = request.get_json(silent=True)
            if data:
                text = data.get('text', '')
                print(f"DEBUG: Text from JSON length: {len(text)}")
            else:
                print("DEBUG: No JSON data found")
        
        if not text:
            print("DEBUG: No text provided or extracted")
            return jsonify({'error': 'No text provided. If using a PDF, ensure it contains selectable text (not scanned images).'}), 400
        
        summary = summarize_text(text)
        return jsonify({'summary': summary, 'extractedText': text}), 200 # Return extracted text too
    
    except ValueError as ve:
        # Known error, e.g., file extraction failed
        print(f'User error in summarize endpoint: {str(ve)}')
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f'Error in summarize endpoint: {str(e)}')
        return jsonify({'error': 'An unexpected error occurred while processing your request.'}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def flashcards():
    """Generate flashcards from text or file using AI"""
    try:
        text = ""
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({'error': 'No file selected'}), 400
            
            import os
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
    
    except ValueError as ve:
        # Known error, e.g., file extraction failed
        print(f'User error in flashcards endpoint: {str(ve)}')
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f'Error in flashcards endpoint: {str(e)}')
        return jsonify({'error': 'An unexpected error occurred while processing your request.'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
