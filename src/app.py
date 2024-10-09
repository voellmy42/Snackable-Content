from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from flask_caching import Cache
from marketing_ai.crew import MarketingAiCrew, PerplexityResearcher
import os
import logging
import traceback
import json
import queue
import threading
import sys
import io
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Define the base directory for output files
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'output'))

# Global queue for storing messages
message_queue = queue.Queue()

# Load Perplexity API key from environment variable
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

class OutputCapture(io.StringIO):
    def write(self, s):
        super().write(s)
        if s.strip():
            message_queue.put(json.dumps({"type": "output", "data": s.strip()}))

def generate_content_background(inputs):
    try:
        message_queue.put(json.dumps({"type": "status", "data": "Initializing AI Crew..."}))
        use_online_research = inputs.get('useOnlineResearch', False)
        crew = MarketingAiCrew(perplexity_api_key=PERPLEXITY_API_KEY if use_online_research else None)
        message_queue.put(json.dumps({"type": "status", "data": "AI Crew initialized. Starting research..."}))

        # Redirect stdout to our custom OutputCapture
        old_stdout = sys.stdout
        sys.stdout = OutputCapture()

        try:
            result = crew.run_crew(inputs)
        finally:
            # Restore stdout
            captured_output = sys.stdout.getvalue()
            sys.stdout = old_stdout

        message_queue.put(json.dumps({"type": "status", "data": "Content generation completed. Preparing results..."}))
        
        output = {
            "research": "/api/output/research.md",
            "blog_post": "/api/output/blog_post.md",
            "linkedin_post": "/api/output/linkedin_post.md",
            "twitter_post": "/api/output/twitter_post.md",
        }
        
        message_queue.put(json.dumps({"type": "complete", "data": output}))
    except Exception as e:
        app.logger.error(f'An error occurred: {str(e)}')
        app.logger.error(traceback.format_exc())
        message_queue.put(json.dumps({"type": "error", "data": str(e)}))

@app.route('/api/generate', methods=['POST'])
def generate_content():
    app.logger.info('Received a request to /api/generate')
    data = request.json
    app.logger.info(f'Request data: {data}')
    
    inputs = {
        'topic': data.get('topic', ''),
        'description': data.get('description', ''),
        'target_audience': data.get('targetAudience', ''),
        'language': data.get('language', ''),
        'useOnlineResearch': data.get('useOnlineResearch', False)
    }
    
    app.logger.info(f'Processed inputs: {inputs}')
    
    # Start content generation in a background thread
    threading.Thread(target=generate_content_background, args=(inputs,)).start()
    
    return jsonify({"message": "Content generation started"}), 202

@app.route('/api/stream')
def stream():
    def generate():
        while True:
            try:
                message = message_queue.get(timeout=30)  # 30-second timeout
                yield f"data: {message}\n\n"
            except queue.Empty:
                yield f"data: {json.dumps({'type': 'keepalive'})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/api/output/<path:filename>')
def serve_file(filename):
    app.logger.info(f'Received request for file: {filename}')
    try:
        filename = os.path.basename(filename)
        file_path = os.path.join(OUTPUT_DIR, filename)
        
        app.logger.info(f'Attempting to serve file: {file_path}')
        
        if not os.path.exists(file_path):
            app.logger.error(f'File not found: {file_path}')
            return jsonify({"error": "File not found"}), 404
        
        with open(file_path, 'r') as file:
            content = file.read()
        
        return Response(content, mimetype='text/markdown')
    except Exception as e:
        app.logger.error(f'Error serving file: {str(e)}')
        app.logger.error(traceback.format_exc())
        return jsonify({"error": "Error serving file. Please try again later."}), 500

@app.route('/api/test_perplexity', methods=['GET'])
def test_perplexity():
    try:
        query = request.args.get('query', 'What is artificial intelligence?')
        researcher = PerplexityResearcher(PERPLEXITY_API_KEY)
        result = researcher.research(query)
        return jsonify({"result": result})
    except Exception as e:
        app.logger.error(f'An error occurred: {str(e)}')
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/test_researcher', methods=['GET'])
def test_researcher():
    try:
        query = request.args.get('query', 'What is artificial intelligence?')
        crew = MarketingAiCrew(perplexity_api_key=PERPLEXITY_API_KEY)
        researcher = crew.researcher()
        result = researcher.run(query)
        return jsonify({"result": result})
    except Exception as e:
        app.logger.error(f'An error occurred: {str(e)}')
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)