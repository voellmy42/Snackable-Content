import React, { useState } from 'react';
import axios from 'axios';

const MarketingAIInterface = () => {
  const [inputs, setInputs] = useState({
    topic: '',
    description: '',
    targetAudience: '',
    language: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/generate', inputs);
      setOutput(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const openFile = (filePath) => {
    // This is a placeholder. You'll need to implement file opening/downloading based on your backend setup.
    console.log(`Opening file: ${filePath}`);
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
                {key}: {value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingAIInterface;