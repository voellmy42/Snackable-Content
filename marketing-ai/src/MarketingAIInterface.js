import React, { useState } from 'react';
import { ChakraProvider, Box, VStack, Heading, Text, Input, Textarea, Button, useColorMode, useColorModeValue, Tooltip, Progress, Alert, AlertIcon, SimpleGrid } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import axios from 'axios';
import FilePreview from './FilePreview';

const API_URL = 'http://localhost:5001';

const MarketingAIInterface = () => {
  const [inputs, setInputs] = useState({
    topic: '',
    description: '',
    targetAudience: '',
    language: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fileContents, setFileContents] = useState({});
  const [error, setError] = useState(null);
  const [verboseOutput, setVerboseOutput] = useState([]);
  
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const color = useColorModeValue("gray.800", "white");
  const verboseOutputBgColor = useColorModeValue("gray.100", "gray.700");

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFileContents({});
    setVerboseOutput([]);
    try {
      const response = await axios.post(`${API_URL}/api/generate`, inputs);
      setVerboseOutput(response.data.verbose_output);

      // Fetch the content of each generated file
      const contents = {};
      for (const [key, filePath] of Object.entries(response.data)) {
        if (key !== 'verbose_output') {
          const fileResponse = await axios.get(`${API_URL}${filePath}`);
          contents[key] = fileResponse.data;
        }
      }
      setFileContents(contents);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    }
    setIsLoading(false);
  };

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg={bgColor} color={color} p={8}>
        <VStack spacing={8} align="stretch" maxWidth="1000px" margin="auto">
          <Heading as="h1" size="2xl" textAlign="center">Marketing AI</Heading>
          <Button onClick={toggleColorMode} alignSelf="flex-end">
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
          <SimpleGrid columns={[1, null, 2]} spacing={8}>
            <Box>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  {Object.entries(inputs).map(([key, value]) => (
                    <Tooltip key={key} label={getTooltip(key)} placement="top-start">
                      <Box>
                        <Text mb={2} fontWeight="bold">{formatLabel(key)}</Text>
                        {key === 'description' ? (
                          <Textarea
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            placeholder={`Enter ${formatLabel(key).toLowerCase()}...`}
                          />
                        ) : (
                          <Input
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            placeholder={`Enter ${formatLabel(key).toLowerCase()}...`}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  ))}
                  <Button type="submit" colorScheme="blue" isLoading={isLoading} loadingText="Generating...">
                    Generate
                  </Button>
                </VStack>
              </form>
            </Box>
            
            <Box>
              {isLoading && <Progress size="xs" isIndeterminate />}

              {error && (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {verboseOutput.length > 0 && (
                <Box mt={4}>
                  <Heading as="h3" size="md" mb={2}>Verbose Output</Heading>
                  <Box
                    bg={verboseOutputBgColor}
                    p={4}
                    borderRadius="md"
                    overflow="auto"
                    maxHeight="400px"
                  >
                    <pre>
                      <code>{verboseOutput.join('')}</code>
                    </pre>
                  </Box>
                </Box>
              )}

              {Object.keys(fileContents).length > 0 && (
                <VStack spacing={6} align="stretch" mt={4}>
                  <Heading as="h2" size="lg">Generated Content</Heading>
                  {Object.entries(fileContents).map(([key, content]) => (
                    <FilePreview
                      key={key}
                      fileName={formatLabel(key)}
                      content={content}
                    />
                  ))}
                </VStack>
              )}
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

const formatLabel = (key) => {
  return key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase());
};

const getTooltip = (key) => {
  const tooltips = {
    topic: "Enter the main subject of your content",
    description: "Provide additional details or context about the topic",
    targetAudience: "Specify who the content is intended for",
    language: "Enter the desired language for the generated content"
  };
  return tooltips[key] || "";
};

export default MarketingAIInterface;