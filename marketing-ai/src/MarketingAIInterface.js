import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001';

const MarketingAIInterface = () => {
  const [inputs, setInputs] = useState({
    topic: '',
    description: '',
    targetAudience: '',
    language: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending request with inputs:', inputs);
      const response = await axios.post(`${API_URL}/api/generate`, inputs);
      console.log('Received response:', response.data);
      setOutput(response.data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        setError(`Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from server');
      } else {
        console.error('Error message:', error.message);
        setError('Error sending request');
      }
    }
    setIsLoading(false);
  };

  const openFile = (filePath) => {
    window.open(`${API_URL}${filePath}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Marketing AI</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['topic', 'description', 'targetAudience', 'language'].map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block font-medium mb-1 capitalize">
              {field === 'targetAudience' ? 'Target Audience' : field}
            </label>
            <input
              type="text"
              id={field}
              name={field}
              value={inputs[field]}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {isLoading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full w-full animate-pulse"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {output && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Generated Content</h2>
          <div className="space-y-2">
            {Object.entries(output).map(([key, value]) => (
              <button
                key={key}
                onClick={() => openFile(value)}
                className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                {key.replace('_', ' ')}: View
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingAIInterface;