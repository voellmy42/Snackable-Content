import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChakraProvider, Box, VStack, HStack, Heading, Text, Input, Textarea, Button, Checkbox, useColorMode, useColorModeValue, Progress, Alert, AlertIcon, SimpleGrid, Container, Avatar, Step, StepDescription, StepIcon, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, Stepper, Card, CardBody } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { extendTheme } from "@chakra-ui/react";
import axios from 'axios';
import FilePreview from './FilePreview';

const API_URL = 'http://localhost:5001';

const theme = extendTheme({
  colors: {
    brand: {
      dark: "#0f4c59",
      bright: "#8fbf28",
      light: "#d3de74",
      accent: "#d91a3e",
    },
  },
  components: {
    Stepper: {
      baseStyle: (props) => ({
        indicator: {
          borderColor: props.colorMode === "dark" ? "brand.light" : "brand.dark",
        },
        separator: {
          borderColor: props.colorMode === "dark" ? "brand.light" : "brand.dark",
        },
        stepIconContainer: {
          bg: props.colorMode === "dark" ? "brand.dark" : "brand.light",
          borderColor: props.colorMode === "dark" ? "brand.light" : "brand.dark",
        },
      }),
    },
  },
});

const SYSTEM_AVATAR = "/mario-kondo-avatar.png";
const BELL_BOY_AVATAR = "/bell-boy-avatar.jpg";
const RESEARCHER_AVATAR = "/researcher-avatar.png";
const WRITER_AVATAR = "/writer-avatar.png";
const SOCIAL_MEDIA_AVATAR = "/social-media-avatar.png";

const ChatMessage = ({ message, sender, messageType }) => {
  const isSystemAnnouncement = sender === 'System';
  
  const systemColor = useColorModeValue("blue.100", "blue.700");
  const bellBoyColor = useColorModeValue("gray.100", "gray.700");
  const researcherColor = useColorModeValue("green.100", "green.700");
  const writerColor = useColorModeValue("purple.100", "purple.700");
  const socialMediaColor = useColorModeValue("yellow.100", "yellow.700");

  const getBackgroundColor = (sender) => {
    const colors = {
      'System': systemColor,
      'Bell Boy': bellBoyColor,
      'Senior Researcher': researcherColor,
      'Blog Writer': writerColor,
      'Social Media Manager': socialMediaColor
    };
    return colors[sender] || bellBoyColor; // Default to Bell Boy color if sender not found
  };

  const bgColor = getBackgroundColor(sender);
  const textColor = useColorModeValue("gray.800", "white");
  
  const getAvatarSrc = (sender) => {
    const avatars = {
      'System': SYSTEM_AVATAR,
      'Bell Boy': BELL_BOY_AVATAR,
      'Senior Researcher': RESEARCHER_AVATAR,
      'Blog Writer': WRITER_AVATAR,
      'Social Media Manager': SOCIAL_MEDIA_AVATAR
    };
    return avatars[sender] || BELL_BOY_AVATAR; // Default to Bell Boy avatar if sender not found
  };

  const avatarSrc = getAvatarSrc(sender);

  return (
    <Box display="flex" justifyContent={isSystemAnnouncement ? "flex-end" : "flex-start"} mb={2} width="100%">
      <Box maxWidth="80%" display="flex" flexDirection={isSystemAnnouncement ? "row-reverse" : "row"}>
        <Avatar src={avatarSrc} mr={isSystemAnnouncement ? 0 : 2} ml={isSystemAnnouncement ? 2 : 0} size="xs" />
        <Box bg={bgColor} p={1} borderRadius="lg" color={textColor} width="100%">
          <Text fontWeight="bold" mb={0.5} fontSize="xs">{sender}{messageType ? ` (${messageType})` : ''}</Text>
          <Text whiteSpace="pre-wrap" wordBreak="break-word" fontSize="xs">{message}</Text>
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
    { sender: 'Bell Boy', message: "Hello! I'm the Bell Boy, and I'll be coordinating our AI agents to create your content." },
    { sender: 'Senior Researcher', message: "Hello! I'm Richard the researcher. I can research offline or online." },
    { sender: 'Blog Writer', message: "Hi! My name is Will and I am your personal ghostwriter in any language." },
    { sender: 'Social Media Manager', message: "Howdy! I am Rudy and I love creating snackable social media content." },
    { sender: 'System', message: "Once you fill in the details and hit 'Generate', you'll see our agents in action!" },
  ]);
  
  const { colorMode, toggleColorMode } = useColorMode();
  const chatContainerRef = useRef(null);
  const eventSourceRef = useRef(null);
  const inputRef = useRef(null);

  const bgColor = useColorModeValue("white", "gray.900");
  const color = useColorModeValue("brand.dark", "white");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("brand.dark", "brand.light");

  const setInputRef = useCallback(element => {
    inputRef.current = element;
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setInputs(prevInputs => ({ ...prevInputs, [e.target.name]: value }));
  }, []);

  const processOutput = (output) => {
    const lines = output.split('\n');
    let currentSpeaker = 'Bell Boy';
    let currentMessage = '';
    let messageType = '';
  
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
          setConversation(prev => [...prev, { sender: currentSpeaker, message: currentMessage.trim(), messageType }]);
          currentMessage = '';
          messageType = '';
        }
        currentSpeaker = 'Bell Boy';
        messageType = 'Calling Agent';
        currentMessage = cleanLine.replace('Agent:', '').trim();
      } else if (line.includes('Task:')) {
        if (currentMessage) {
          setConversation(prev => [...prev, { sender: currentSpeaker, message: currentMessage.trim(), messageType }]);
          currentMessage = '';
          messageType = '';
        }
        currentSpeaker = 'Bell Boy';
        messageType = 'Assigning Task';
        currentMessage = cleanLine.replace('Task:', '').trim();
      } else if (line.includes('Final Answer:')) {
        if (currentMessage) {
          setConversation(prev => [...prev, { sender: currentSpeaker, message: currentMessage.trim(), messageType }]);
          currentMessage = '';
          messageType = '';
        }
        currentSpeaker = 'Blog Writer'; // Always use Blog Writer for Final Answer
        messageType = 'Final Answer';
        currentMessage = cleanLine.split(':').slice(1).join(':').trim();
      } else if (cleanLine) {
        currentMessage += cleanLine + ' ';
      }
    });
  
    if (currentMessage) {
      setConversation(prev => [...prev, { sender: currentSpeaker, message: currentMessage.trim(), messageType }]);
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
    <ChakraProvider theme={theme}>
      <Box minHeight="100vh" bg={bgColor} color={color} py={4}>
        <Container maxWidth="1400px">
          <VStack spacing={4} align="stretch">
            <Heading as="h1" size="xl" textAlign="center" color="brand.dark">Snackable Content</Heading>
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
                          <Button 
                          onClick={handleSubmit} 
                          bg="brand.light"
                          color="brand.dark"
                          _hover={{ bg: "brand.bright", color: "white" }}
                          isLoading={isLoading} 
                          loadingText="Generating..." 
                          size="sm"
                        >
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
                        <Progress size="xs" isIndeterminate colorScheme="brand" />
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