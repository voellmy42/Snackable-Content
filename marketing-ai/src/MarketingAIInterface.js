import React, { useState } from 'react';
import { ChakraProvider, Box, VStack, Heading, Text, Input, Textarea, Button, useColorMode, useColorModeValue, Tooltip, Progress, Alert, AlertIcon, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
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
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const color = useColorModeValue("gray.800", "white");

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/api/generate`, inputs);
      setOutput(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    }
    setIsLoading(false);
  };

  const openFile = (filePath) => {
    window.open(`${API_URL}${filePath}`, '_blank');
  };

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg={bgColor} color={color} p={8}>
        <VStack spacing={8} align="stretch" maxWidth="800px" margin="auto">
          <Heading as="h1" size="2xl" textAlign="center">Marketing AI</Heading>
          <Button onClick={toggleColorMode} alignSelf="flex-end">
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {Object.entries(inputs).map(([key, value]) => (
                <Tooltip key={key} label={getTooltip(key)} placement="top-start">
                  <Box width="100%">
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

          {isLoading && <Progress size="xs" isIndeterminate />}

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {output && (
            <Accordion allowToggle>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Generated Content
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack spacing={2} align="stretch">
                    {Object.entries(output).map(([key, value]) => (
                      <Button key={key} onClick={() => openFile(value)} variant="outline">
                        {formatLabel(key)}
                      </Button>
                    ))}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
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