import React from 'react';
import { Box, Button, Text, useClipboard, VStack, useToast, useColorModeValue } from "@chakra-ui/react";

const FilePreview = ({ fileName, content }) => {
  const { hasCopied, onCopy } = useClipboard(content);
  const toast = useToast();
  const bgColor = useColorModeValue("gray.100", "gray.700");
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
    <Box borderWidth="1px" borderRadius="lg" p={4} borderColor={borderColor}>
      <Text fontWeight="bold" mb={2}>{fileName}</Text>
      <Box bg={bgColor} p={4} borderRadius="md" overflow="auto" maxHeight="200px" mb={4}>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          <code>{content}</code>
        </pre>
      </Box>
      <VStack spacing={2} align="stretch">
        <Button onClick={onCopy} colorScheme="blue">
          {hasCopied ? "Copied!" : "Copy"}
        </Button>
        <Button onClick={handleDownload} colorScheme="green">
          Download
        </Button>
      </VStack>
    </Box>
  );
};

export default FilePreview;