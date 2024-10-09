import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChakraProvider, Box, VStack, Heading, Text, Input, Textarea, Button, Checkbox, useColorMode, useColorModeValue, Progress, Alert, AlertIcon, SimpleGrid, Container, Fade, Avatar } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import axios from 'axios';
import FilePreview from './FilePreview';

const API_URL = 'http://localhost:5001';

const AI_AVATAR = "/ai-avatar.png";

const ChatMessage = ({ message, sender }) => {
  const bgColor = useColorModeValue(
    sender === 'System' ? "gray.100" : 
    sender === 'Final Answer' ? "green.100" : "blue.100",
    sender === 'System' ? "gray.700" : 
    sender === 'Final Answer' ? "green.700" : "blue.700"
  );
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box display="flex" justifyContent="flex-start" mb={4} width="100%">
      <Box maxWidth="100%" display="flex" flexDirection="row">
        <Avatar 
          src={AI_AVATAR}
          mr={2}
        />
        <Box bg={bgColor} p={3} borderRadius="lg" color={textColor} width="100%">
          {sender !== 'System' && (
            <Text fontWeight="bold" mb={1}>{sender}</Text>
          )}
          <Text whiteSpace="pre-wrap" wordBreak="break-word">{message}</Text>
        </Box>
      </Box>
    </Box>
  );
};

const MarketingAIInterface = () => {
  const [inputs, setInputs] = useState({
    topic: '',
    description: '',
    targetAudience: '',
    language: '',
    useOnlineResearch: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fileContents, setFileContents] = useState({});
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [conversation, setConversation] = useState([]);
  
  const { colorMode, toggleColorMode } = useColorMode();
  const eventSourceRef = useRef(null);
  const chatContainerRef = useRef(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.800", "white");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");
  const verboseOutputBgColor = useColorModeValue("gray.50", "gray.600");

  const handleInputChange = useCallback((e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setInputs(prevInputs => ({ ...prevInputs, [e.target.name]: value }));
  }, []);

  const processOutput = (output) => {
    const lines = output.split('\n');
    let currentSpeaker = 'System';
    let currentMessage = '';
  
    const cleanMessage = (msg) => {
      return msg
        .replace(/\[\d+m/g, '')
        .replace(/\d+m/g, '')
        .replace(/[[\]#]/g, '')
        .replace(/^\s*\d+\s*/, '')
        .trim();
    };
  
    lines.forEach(line => {
      const cleanLine = cleanMessage(line);
      if (line.includes('Agent:')) {
        if (currentMessage) {
          setConversation(prev => [...prev, { sender: currentSpeaker, message: currentMessage.trim() }]);
          currentMessage = '';
        }
        currentSpeaker = cleanLine.replace('Agent:', '').trim();
      } else if (line.includes('Task:')) {
        setConversation(prev => [...prev, { sender: 'System', message: cleanLine.replace('Task:', '').trim() }]);
      } else if (line.includes('Final Answer:')) {
        if (currentMessage) {
          setConversation(prev => [...prev, { sender: currentSpeaker, message: currentMessage.trim() }]);
          currentMessage = '';
        }
        currentSpeaker = 'Final Answer';
        currentMessage = cleanLine.replace('Final Answer:', '').trim();
      } else if (cleanLine) {
        currentMessage += cleanLine + ' ';
      }
    });
  
    if (currentMessage) {
      setConversation(prev => [...prev, { sender: currentSpeaker, message: currentMessage.trim() }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFileContents({});
    setConversation([]);
    setStatus('Initializing...');

    try {
      console.log('Sending POST request to initiate content generation');
      await axios.post(`${API_URL}/api/generate`, inputs, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('POST request successful, initiating SSE connection');

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      eventSourceRef.current = new EventSource(`${API_URL}/api/stream`);

      eventSourceRef.current.onmessage = (event) => {
        console.log('Received SSE message:', event.data);
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'status':
            setStatus(data.data);
            break;
          case 'output':
            processOutput(data.data);
            break;
          case 'complete':
            setIsLoading(false);
            setStatus('Generation complete!');
            fetchGeneratedContent(data.data);
            eventSourceRef.current.close();
            break;
          case 'error':
            setIsLoading(false);
            setError(data.data);
            eventSourceRef.current.close();
            break;
          case 'keepalive':
            console.log('Received keepalive');
            break;
          default:
            console.log('Unhandled message type:', data.type);
            break;
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('EventSource failed:', error);
        setIsLoading(false);
        setError('An error occurred while receiving updates');
        eventSourceRef.current.close();
      };

    } catch (error) {
      console.error('Error initiating content generation:', error);
      setIsLoading(false);
      setError('An error occurred while initiating content generation');
    }
  };

  const fetchGeneratedContent = async (output) => {
    try {
      console.log('Fetching generated content');
      const contents = {};
      for (const [key, filePath] of Object.entries(output)) {
        if (key !== 'verbose_output') {
          const fileResponse = await axios.get(`${API_URL}${filePath}`);
          contents[key] = fileResponse.data;
        }
      }
      setFileContents(contents);
      console.log('Generated content fetched successfully');
    } catch (error) {
      console.error('Error fetching generated content:', error);
      setError('An error occurred while fetching generated content');
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log('Closing SSE connection');
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const inputFields = useMemo(() => (
    <>
      {Object.entries(inputs).map(([key, value]) => {
        if (key === 'useOnlineResearch') {
          return (
            <Box key={key}>
              <Checkbox
                name={key}
                isChecked={value}
                onChange={handleInputChange}
              >
                Use Online Research
              </Checkbox>
            </Box>
          );
        }
        return (
          <Box key={key}>
            <Text mb={2} fontWeight="bold">{formatLabel(key)}</Text>
            {key === 'description' ? (
              <Textarea
                name={key}
                value={value}
                onChange={handleInputChange}
                placeholder={`Enter ${formatLabel(key).toLowerCase()}...`}
                bg={inputBgColor}
                borderColor={inputBorderColor}
              />
            ) : (
              <Input
                name={key}
                value={value}
                onChange={handleInputChange}
                placeholder={`Enter ${formatLabel(key).toLowerCase()}...`}
                bg={inputBgColor}
                borderColor={inputBorderColor}
              />
            )}
          </Box>
        );
      })}
    </>
  ), [inputs, handleInputChange, inputBgColor, inputBorderColor]);

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg={bgColor} color={color} py={8}>
        <Container maxWidth="1400px">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="2xl" textAlign="center">Snackable Content</Heading>
            <Button onClick={toggleColorMode} alignSelf="flex-end" size="sm">
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
            <SimpleGrid columns={[1, null, 2]} spacing={8}>
              <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={inputBorderColor} borderWidth={1}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="stretch">
                    {inputFields}
                    <Button type="submit" colorScheme="blue" isLoading={isLoading} loadingText="Generating...">
                      Generate
                    </Button>
                  </VStack>
                </form>
              </Box>
              
              <Box>
                {isLoading && (
                  <Box mb={4}>
                    <Text mb={2}>{status}</Text>
                    <Progress size="xs" isIndeterminate colorScheme="blue" />
                  </Box>
                )}

                {error && (
                  <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {conversation.length > 0 && (
                  <Box mb={4} bg={cardBgColor} p={4} borderRadius="lg" boxShadow="md" borderColor={inputBorderColor} borderWidth={1}>
                    <Heading as="h3" size="md" mb={2}>Agent Conversation</Heading>
                    <Box
                      ref={chatContainerRef}
                      bg={verboseOutputBgColor}
                      p={4}
                      borderRadius="md"
                      overflow="auto"
                      maxHeight="400px"
                      fontSize="sm"
                    >
                      {conversation.map((msg, index) => (
                        <Fade in={true} key={index}>
                          <ChatMessage message={msg.message} sender={msg.sender} />
                        </Fade>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </SimpleGrid>

            {Object.keys(fileContents).length > 0 && (
              <VStack spacing={6} align="stretch" mt={4}>
                <Heading as="h2" size="lg" color={color}>Generated Content</Heading>
                <SimpleGrid columns={[1, null, 2]} spacing={6}>
                  {Object.entries(fileContents).map(([key, content]) => (
                    <FilePreview
                      key={key}
                      fileName={formatLabel(key)}
                      content={content}
                      bg={cardBgColor}
                      borderColor={inputBorderColor}
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            )}
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

const formatLabel = (key) => {
  return key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase());
};

export default MarketingAIInterface;