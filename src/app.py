from flask import Flask, request, jsonify
from marketing_ai.crew import MarketingAiCrew
import json

app = Flask(__name__)

@app.route('/api/generate', methods=['POST'])
def generate_content():
    data = request.json
    
    # Extract inputs from the request
    inputs = {
        'topic': data.get('topic', ''),
        'description': data.get('description', ''),
        'target_audience': data.get('target_audience', ''),
        'language': data.get('language', ''),
        'research': 'output/research.md'
    }
    
    try:
        # Create an instance of MarketingAiCrew and call kickoff
        result = MarketingAiCrew().crew().kickoff(inputs=inputs)
        
        # Convert the result to a JSON-serializable format
        result_dict = result.to_dict()
        
        # Prepare the response
        response = {
            "result": result_dict,
            "research_path": inputs['research']
        }
        
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)