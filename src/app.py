from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from marketing_ai.crew import MarketingAiCrew
import os
import logging
import traceback
import queue
import threading
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Define the base directory for output files
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'output'))

# Create a queue for storing crew output
crew_output_queue = queue.Queue()

@app.route('/api/generate', methods=['POST'])
def generate_content():
    logger.info('Received a request to /api/generate')
    data = request.json
    logger.info(f'Request data: {data}')
    
    inputs = {
        'topic': data.get('topic', ''),
        'description': data.get('description', ''),
        'target_audience': data.get('targetAudience', ''),
        'language': data.get('language', ''),
    }
    
    logger.info(f'Processed inputs: {inputs}')
    
    def run_crew():
        try:
            logger.info('Initializing MarketingAiCrew')
            crew = MarketingAiCrew()
            logger.info('MarketingAiCrew initialized successfully')

            logger.info('Running crew')
            result, captured_output = crew.run_crew(inputs)
            logger.info('Crew run completed')
            
            # Stream the captured output
            for line in captured_output.split('\n'):
                if line.strip():  # Only send non-empty lines
                    message = json.dumps({'type': 'output', 'data': line})
                    logger.debug(f'Sending SSE message: {message}')
                    crew_output_queue.put(message)
            
            output = {
                "research": "/api/output/research.md",
                "blog_post": "/api/output/blog_post.md",
                "linkedin_post": "/api/output/linkedin_post.md",
                "twitter_post": "/api/output/twitter_post.md",
            }
            
            complete_message = json.dumps({'type': 'complete', 'data': output})
            logger.info(f'Sending complete message: {complete_message}')
            crew_output_queue.put(complete_message)
        except Exception as e:
            logger.error(f'An error occurred: {str(e)}')
            logger.error(traceback.format_exc())
            error_message = json.dumps({'type': 'error', 'data': str(e)})
            logger.error(f'Sending error message: {error_message}')
            crew_output_queue.put(error_message)

    threading.Thread(target=run_crew).start()
    
    return jsonify({"message": "Content generation started"}), 202

@app.route('/api/stream')
def stream():
    logger.info('SSE connection established')
    def generate():
        while True:
            try:
                message = crew_output_queue.get(timeout=30)  # 30 second timeout
                logger.debug(f'Yielding SSE message: {message}')
                yield f"data: {message}\n\n"
            except queue.Empty:
                logger.debug('Queue empty, sending keepalive')
                yield f"data: {json.dumps({'type': 'keepalive'})}\n\n"

    return Response(generate(), mimetype='text/event-stream')

@app.route('/api/output/<path:filename>')
def serve_file(filename):
    logger.info(f'Received request for file: {filename}')
    try:
        # Ensure the filename doesn't contain any path traversal
        filename = os.path.basename(filename)
        file_path = os.path.join(OUTPUT_DIR, filename)
        
        logger.info(f'Attempting to serve file: {file_path}')
        
        if not os.path.exists(file_path):
            logger.error(f'File not found: {file_path}')
            return jsonify({"error": "File not found"}), 404
        
        return send_file(file_path, as_attachment=False)
    except Exception as e:
        logger.error(f'Error serving file: {str(e)}')
        return jsonify({"error": "Error serving file"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)