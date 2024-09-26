from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from marketing_ai.crew import MarketingAiCrew
import os
import logging

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)

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
        app.logger.info('Starting MarketingAiCrew().crew().kickoff')
        result = MarketingAiCrew().crew().kickoff(inputs=inputs)
        app.logger.info(f'MarketingAiCrew result: {result}')
        
        output = {
            "research": "/output/research.md",
            "blog_post": "/output/blog_post.md",
            "linkedin_post": "/output/linkedin_post.md",
            "twitter_post": "/output/twitter_post.md"
        }
        
        app.logger.info(f'Sending response: {output}')
        return jsonify(output), 200
    except Exception as e:
        app.logger.error(f'An error occurred: {str(e)}', exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/output/<path:filename>')
def serve_file(filename):
    app.logger.info(f'Received request for file: {filename}')
    return send_file(os.path.join('output', filename))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)