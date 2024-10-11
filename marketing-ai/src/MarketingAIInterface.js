import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChakraProvider, Box, VStack, HStack, Heading, Text, Input, Textarea, Button, Checkbox, useColorMode, useColorModeValue, Progress, Alert, AlertIcon, SimpleGrid, Container, Avatar, Step, StepDescription, StepIcon, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, Stepper, Card, CardBody } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import axios from 'axios';
import FilePreview from './FilePreview';

const API_URL = 'http://localhost:5001';

const AI_AVATAR = "/ai-avatar.png";
const RESEARCHER_AVATAR = "/researcher-avatar.png";
const WRITER_AVATAR = "/writer-avatar.png";
const SOCIAL_MEDIA_AVATAR = "/social-media-avatar.png";

const ChatMessage = ({ message, sender }) => {
  const bgColor = useColorModeValue(
    sender === 'System' ? "blue.100" : 
    sender === 'Researcher' ? "green.100" :
    sender === 'Writer' ? "purple.100" :
    sender === 'Social Media Manager' ? "orange.100" :
    sender === 'Final Answer' ? "pink.100" : "gray.100",
    sender === 'System' ? "blue.700" : 
    sender === 'Researcher' ? "green.700" :
    sender === 'Writer' ? "purple.700" :
    sender === 'Social Media Manager' ? "orange.700" :
    sender === 'Final Answer' ? "pink.700" : "gray.700"
  );
  const textColor = useColorModeValue("gray.800", "white");
  const avatarSrc = sender === 'Researcher' ? RESEARCHER_AVATAR :
                    sender === 'Writer' ? WRITER_AVATAR :
                    sender === 'Social Media Manager' ? SOCIAL_MEDIA_AVATAR :
                    AI_AVATAR;

  return (
    <Box display="flex" justifyContent={sender === 'System' ? "center" : "flex-start"} mb={3} width="100%">
      <Box maxWidth={sender === 'System' ? "100%" : "80%"} display="flex" flexDirection="row">
        {sender !== 'System' && (
          <Avatar src={avatarSrc} mr={2} size="sm" />
        )}
        <Box bg={bgColor} p={2} borderRadius="lg" color={textColor} width="100%">
          {sender !== 'System' && (
            <Text fontWeight="bold" mb={1} fontSize="sm">{sender}</Text>
          )}
          <Text whiteSpace="pre-wrap" wordBreak="break-word" fontSize="sm">{message}</Text>
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fileContents, setFileContents] = useState({});
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [conversation, setConversation] = useState([
    { sender: 'System', message: "Welcome to Snackable Content! Here's a preview of how our AI agents will collaborate to create your content." },
    { sender: 'Researcher', message: "Hello! I'm Richard the research specialist. I am responsible to research your topic through offline or online research." },
    { sender: 'Writer', message: "Hi! My name is Will and i am your personal ghostwriter. I am responsible to create engaging blog post posts that resonate with your target audience. I am also a language talent, so feel free to request any language" },
    { sender: 'Social Media Manager', message: "Howdy! I am Rudy and I love creating social media content. My task is to transform the research into high quality snackable content that you can use on social media." },
    { sender: 'System', message: "Once you fill in the details and hit 'Generate', you'll see us in action here!" },
  ]);
  
  const { colorMode, toggleColorMode } = useColorMode();
  const chatContainerRef = useRef(null);
  const eventSourceRef = useRef(null);
  const inputRef = useRef(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const color = useColorModeValue("gray.800", "white");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");

  const setInputRef = useCallback(element => {
    inputRef.current = element;
  }, []);

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
  
    setConversation(prev => [
      ...prev,
      { sender: 'System', message: "The agents are now working on your content. Here's their conversation:" }
    ]);
  
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

    setConversation(prev => [...prev, { sender: 'System', message: "The agents have completed their work on your content." }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFileContents({});
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
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };
  
    scrollToBottom();
    // Use a setTimeout to ensure scrolling happens after the DOM has updated
    setTimeout(scrollToBottom, 0);
  }, [conversation]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep]);

  const steps = useMemo(() => [
    { title: 'Topic', description: 'Enter the main topic' },
    { title: 'Description', description: 'Provide more details' },
    { title: 'Audience', description: 'Define target audience' },
    { title: 'Language', description: 'Specify the language' },
    { title: 'Research', description: 'Choose research option' },
  ], []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  }, [currentStep, steps.length]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  }, [currentStep]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep === steps.length - 1) {
        handleSubmit(e);
      } else {
        handleNext();
      }
    }
  };

  const formatLabel = useCallback((key) => {
    return key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase());
  }, []);

  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg={bgColor} color={color} py={4}>
        <Container maxWidth="1400px">
          <VStack spacing={4} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">Snackable Content</Heading>
            <Button onClick={toggleColorMode} alignSelf="flex-end" size="sm">
              {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </Button>
            <SimpleGrid columns={[1, null, 2]} spacing={4}>
              <VStack spacing={4} align="stretch" height="100%">
                <Stepper index={currentStep} orientation="vertical" gap={2}>
                  {steps.map((step, index) => (
                    <Step key={index}>
                      <StepIndicator>
                        <StepStatus
                          complete={<StepIcon />}
                          incomplete={<StepNumber />}
                          active={<StepNumber />}
                        />
                      </StepIndicator>
                      <Box flexShrink="0">
                        <StepTitle fontSize="sm">{step.title}</StepTitle>
                        <StepDescription fontSize="xs">{step.description}</StepDescription>
                      </Box>
                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>
                <Card bg={cardBgColor} boxShadow="md" borderRadius="lg" flex={1}>
                  <CardBody py={3} display="flex" flexDirection="column" height="100%">
                    <VStack spacing={3} align="stretch" flex={1}>
                      <Text fontWeight="bold" fontSize="sm">{formatLabel(Object.keys(inputs)[currentStep])}</Text>
                      {Object.entries(inputs).map(([key, value], index) => (
                        <Box key={key} display={index === currentStep ? 'block' : 'none'} flex={1}>
                          {key === 'description' ? (
                            <Textarea
                              ref={setInputRef}
                              name={key}
                              value={value}
                              onChange={handleInputChange}
                              onKeyDown={handleKeyDown}
                              placeholder={`Enter ${formatLabel(key).toLowerCase()}...`}
                              bg={inputBgColor}
                              borderColor={inputBorderColor}
                              size="sm"
                              rows={2}
                              height="100%"
                            />
                          ) : key === 'useOnlineResearch' ? (
                            <Checkbox
                              ref={setInputRef}
                              name={key}
                              isChecked={value}
                              onChange={handleInputChange}
                              size="sm"
                            >
                              Use Online Research
                            </Checkbox>
                          ) : (
                            <Input
                              ref={setInputRef}
                              name={key}
                              value={value}
                              onChange={handleInputChange}
                              onKeyDown={handleKeyDown}
                              placeholder={`Enter ${formatLabel(key).toLowerCase()}...`}
                              bg={inputBgColor}
                              borderColor={inputBorderColor}
                              size="sm"
                            />
                          )}
                        </Box>
                      ))}
                      <HStack justify="flex-start" mt="auto" spacing={2}>
                        <Button onClick={handleBack} disabled={currentStep === 0} size="sm">
                          Back
                        </Button>
                        {currentStep === steps.length - 1 ? (
                          <Button onClick={handleSubmit} colorScheme="blue" isLoading={isLoading} loadingText="Generating..." size="sm">
                            Generate
                          </Button>
                        ) : (
                          <Button onClick={handleNext} size="sm">Next</Button>
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
              
              <Card bg={cardBgColor} boxShadow="md" borderRadius="lg" height="100%">
                <CardBody p={3} display="flex" flexDirection="column" height="100%">
                  <VStack spacing={2} align="stretch" height="100%">
                    {isLoading && (
                      <Box>
                        <Text mb={1} fontSize="xs">{status}</Text>
                        <Progress size="xs" isIndeterminate colorScheme="blue" />
                      </Box>
                    )}
  
                    {error && (
                      <Alert status="error" fontSize="xs">
                        <AlertIcon />
                        <Text>{error}</Text>
                      </Alert>
                    )}
                    <Box height="400px" overflowY="auto" ref={chatContainerRef}>
                      <Heading as="h3" size="xs" mb={2}>Agent Conversation</Heading>
                      <VStack spacing={2} align="stretch">
                        {conversation.map((msg, index) => (
                          <ChatMessage key={index} message={msg.message} sender={msg.sender} />
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
  
            {Object.keys(fileContents).length > 0 && (
              <VStack spacing={4} align="stretch" mt={4}>
                <Heading as="h2" size="md" color={color}>Generated Content</Heading>
                <SimpleGrid columns={[1, null, 2]} spacing={4}>
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

export default MarketingAIInterface;