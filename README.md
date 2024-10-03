# Marketing AI Project

This project consists of a React frontend and a Python backend that work together to generate marketing content using AI.

## Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── MarketingAIInterface.js
│   │   └── FilePreview.js
│   ├── package.json
│   └── README.md
├── backend/
│   ├── app.py
│   ├── crew.py
│   ├── main.py
│   ├── tasks.yaml
│   ├── agents.yaml
│   └── requirements.txt
├── .gitignore
└── README.md
```

## Setup

### Frontend

1. Navigate to the `frontend` directory
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server

### Backend

1. Navigate to the `backend` directory
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS and Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the backend server: `python app.py`

## Usage

1. Start both the frontend and backend servers
2. Open your browser and navigate to `http://localhost:3000`
3. Fill in the required fields and click "Generate" to create marketing content

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details