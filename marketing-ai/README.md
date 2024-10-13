# Marketing AI Crew

Marketing AI Crew is a powerful tool that leverages CrewAI to generate marketing content using a team of AI agents. This project combines a Flask backend, React frontend, and CrewAI to create a user-friendly interface for content generation.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Project Structure](#project-structure)
5. [Running the Application](#running-the-application)
6. [Customizing the AI Crew](#customizing-the-ai-crew)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Troubleshooting](#troubleshooting)

## Project Overview

The Marketing AI Crew project consists of three main components:
1. A Flask backend that manages the CrewAI integration and serves API endpoints.
2. A React frontend that provides a user interface for interacting with the AI crew.
3. A CrewAI setup that defines agents and tasks for content generation.

## Prerequisites

- Python 3.10 or higher
- Node.js 14.0 or higher
- npm 6.0 or higher

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/marketing-ai-crew.git
   cd marketing-ai-crew
   ```

2. Set up the backend:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the `backend` directory and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ```

## Project Structure

```
marketing-ai-crew/
├── backend/
│   ├── app.py
│   ├── marketing_ai/
│   │   ├── crew.py
│   │   ├── config/
│   │   │   ├── agents.yaml
│   │   │   └── tasks.yaml
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── MarketingAIInterface.js
│   │   └── FilePreview.js
│   ├── package.json
│   └── ...
└── README.md
```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   python app.py
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` to use the application.

## Customizing the AI Crew

To customize the AI agents and tasks:

1. Modify `backend/marketing_ai/config/agents.yaml` to define your agents.
2. Modify `backend/marketing_ai/config/tasks.yaml` to define your tasks.
3. Update `backend/marketing_ai/crew.py` to add your own logic, tools, and specific arguments.

## API Endpoints

- POST `/api/generate`: Initiates content generation
- GET `/api/stream`: Streams real-time updates during content generation
- GET `/api/output/<filename>`: Retrieves generated content files

## Frontend Components

- `MarketingAIInterface.js`: Main component that handles user input and displays results
- `FilePreview.js`: Component for previewing and downloading generated content

## Troubleshooting

- If you encounter CORS issues, ensure that the `CORS` configuration in `app.py` matches your frontend URL.
- Make sure all required environment variables are set in the `.env` file.
- Check the console logs in both the backend terminal and browser developer tools for error messages.

For additional support or questions, please open an issue on the GitHub repository.