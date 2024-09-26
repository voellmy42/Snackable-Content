from flask import Flask, request, jsonify, send_file
from marketing_ai.crew import MarketingAiCrew
import os

app = Flask(__name__)

@app.route('/api/generate', methods=['POST'])
def generate_content():
    data = request.json
    
    inputs = {
        'topic': data.get('topic', ''),
        'description': data.get('description', ''),
        'target_audience': data.get('targetAudience', ''),
        'language': data.get('language', ''),
    }
    
    try:
        result = MarketingAiCrew().crew().kickoff(inputs=inputs)
        
        # Assuming result contains file paths
        output = {
            "blog_post": f"/output/blog_post_{inputs['topic']}.md",
            "linkedin_post": f"/output/linkedin_post_{inputs['topic']}.md",
            "twitter_post": f"/output/twitter_post_{inputs['topic']}.md",
            "research": f"/output/research_{inputs['topic']}.md"
        }
        
        return jsonify(output), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/output/<path:filename>')
def serve_file(filename):
    return send_file(os.path.join('output', filename))

if __name__ == '__main__':
    app.run(debug=True)