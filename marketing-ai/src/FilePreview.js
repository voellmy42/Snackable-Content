import React from 'react';
import { Box, Button, Text, useClipboard, VStack, useColorModeValue } from "@chakra-ui/react";

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

  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <Text key={index} fontSize="2xl" fontWeight="bold" mb={2}>{line.slice(2)}</Text>;
      } else if (line.startsWith('## ')) {
        return <Text key={index} fontSize="xl" fontWeight="bold" mb={2}>{line.slice(3)}</Text>;
      } else if (line.startsWith('### ')) {
        return <Text key={index} fontSize="lg" fontWeight="bold" mb={2}>{line.slice(4)}</Text>;
      } else if (line.startsWith('- ')) {
        return <Text key={index} ml={4} mb={1}>• {line.slice(2)}</Text>;
      } else {
        return <Text key={index} mb={2}>{line}</Text>;
      }
    });
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
        {renderMarkdown(content)}
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