import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import MarketingAIInterface from './MarketingAIInterface';

function App() {
  return (
    <ChakraProvider>
      <MarketingAIInterface />
    </ChakraProvider>
  );
}

export default App;