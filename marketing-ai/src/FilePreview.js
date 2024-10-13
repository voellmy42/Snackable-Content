import React from 'react';
import { Box, Button, Text, useClipboard, VStack, useColorModeValue, UnorderedList, OrderedList, ListItem, Link } from "@chakra-ui/react";
import ReactMarkdown from 'react-markdown';

const FilePreview = ({ fileName, content, bg, borderColor }) => {
  const { hasCopied, onCopy } = useClipboard(content);
  const contentBgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("brand.dark", "white");

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`${fileName} has been downloaded`);
  };

  const MarkdownComponents = {
    p: (props) => <Text mb={2} {...props} />,
    h1: (props) => <Text fontSize="2xl" fontWeight="bold" mb={3} {...props} />,
    h2: (props) => <Text fontSize="xl" fontWeight="bold" mb={2} {...props} />,
    h3: (props) => <Text fontSize="lg" fontWeight="bold" mb={2} {...props} />,
    ul: (props) => <UnorderedList pl={4} mb={2} {...props} />,
    ol: (props) => <OrderedList pl={4} mb={2} {...props} />,
    li: (props) => <ListItem mb={1} {...props} />,
    a: (props) => <Link color="blue.500" textDecoration="underline" isExternal {...props} />,
    blockquote: (props) => <Box borderLeft="4px" borderColor="gray.300" pl={4} py={2} my={2} {...props} />,
    code: (props) => <Box as="code" bg="gray.100" p={1} borderRadius="sm" {...props} />,
    pre: (props) => <Box as="pre" bg="gray.100" p={2} borderRadius="md" overflowX="auto" my={2} {...props} />,
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={4} 
      borderColor={borderColor} 
      bg={bg} 
      boxShadow="md"
    >
      <Text fontWeight="bold" mb={2} fontSize="lg" color={textColor}>{fileName}</Text>
      <Box 
        bg={contentBgColor} 
        p={4} 
        borderRadius="md" 
        overflow="auto" 
        maxHeight="400px"
        mb={4}
        fontSize="sm"
        color={textColor}
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: useColorModeValue('gray.100', 'gray.600'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('gray.300', 'gray.500'),
            borderRadius: '4px',
          },
        }}
      >
        <ReactMarkdown components={MarkdownComponents}>
          {content}
        </ReactMarkdown>
      </Box>
      <VStack spacing={2} align="stretch">
        <Button 
          onClick={onCopy} 
          bg="brand.light" 
          color="brand.dark" 
          _hover={{ bg: "brand.bright", color: "white" }} 
          size="sm"
        >
          {hasCopied ? "Copied!" : "Copy"}
        </Button>
        <Button 
          onClick={handleDownload} 
          bg="brand.dark" 
          color="white" 
          _hover={{ bg: "brand.bright", color: "white" }} 
          size="sm"
        >
          Download
        </Button>
      </VStack>
    </Box>
  );
};

export default FilePreview;