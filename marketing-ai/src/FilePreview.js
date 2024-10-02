import React from 'react';
import { Box, Button, Text, useClipboard, VStack, useToast, useColorModeValue } from "@chakra-ui/react";

const FilePreview = ({ fileName, content, bg }) => {
  const { hasCopied, onCopy } = useClipboard(content);
  const toast = useToast();
  const contentBgColor = useColorModeValue("gray.50", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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
    
    toast({
      title: "File downloaded",
      description: `${fileName} has been downloaded`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} borderColor={borderColor} bg={bg} boxShadow="md">
      <Text fontWeight="bold" mb={2} fontSize="lg">{fileName}</Text>
      <Box 
        bg={contentBgColor} 
        p={4} 
        borderRadius="md" 
        overflow="auto" 
        maxHeight="200px" 
        mb={4}
        fontSize="sm"
        fontFamily="monospace"
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: useColorModeValue('gray.100', 'gray.700'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('gray.300', 'gray.500'),
            borderRadius: '4px',
          },
        }}
      >
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <code>{content}</code>
        </pre>
      </Box>
      <VStack spacing={2} align="stretch">
        <Button onClick={onCopy} colorScheme="blue" size="sm">
          {hasCopied ? "Copied!" : "Copy"}
        </Button>
        <Button onClick={handleDownload} colorScheme="green" size="sm">
          Download
        </Button>
      </VStack>
    </Box>
  );
};

export default FilePreview;