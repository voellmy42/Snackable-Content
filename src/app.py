from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from marketing_ai.crew import MarketingAiCrew
import os
import logging
import traceback

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Define the base directory for output files
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'output'))

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
    }
    
    app.logger.info(f'Processed inputs: {inputs}')
    
    try:
        app.logger.info('Initializing MarketingAiCrew')
        crew = MarketingAiCrew()
        app.logger.info('MarketingAiCrew initialized successfully')

        app.logger.info('Running crew')
        result, captured_output = crew.run_crew(inputs)
        app.logger.info('Crew run completed')
        
        output = {
            "research": "/api/output/research.md",
            "blog_post": "/api/output/blog_post.md",
            "linkedin_post": "/api/output/linkedin_post.md",
            "twitter_post": "/api/output/twitter_post.md",
            "verbose_output": captured_output
        }
        
        app.logger.info(f'Sending response: {output}')
        return jsonify(output), 200
    except Exception as e:
        app.logger.error(f'An error occurred: {str(e)}')
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/output/<path:filename>')
def serve_file(filename):
    app.logger.info(f'Received request for file: {filename}')
    try:
        # Ensure the filename doesn't contain any path traversal
        filename = os.path.basename(filename)
        file_path = os.path.join(OUTPUT_DIR, filename)
        
        app.logger.info(f'Attempting to serve file: {file_path}')
        
        if not os.path.exists(file_path):
            app.logger.error(f'File not found: {file_path}')
            return jsonify({"error": "File not found"}), 404
        
        return send_file(file_path, as_attachment=False)
    except Exception as e:
        app.logger.error(f'Error serving file: {str(e)}')
        return jsonify({"error": "Error serving file"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)