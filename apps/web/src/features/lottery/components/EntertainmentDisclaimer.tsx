'use client';

import { Alert, AlertIcon, Text, VStack, Box } from '@chakra-ui/react';

export function EntertainmentDisclaimer() {
  return (
    <Alert status="warning" borderRadius="md" mb={6}>
      <AlertIcon />
      <VStack align="start" spacing={1} flex="1">
        <Text fontWeight="bold" fontSize="sm">
          For Entertainment Only
        </Text>
        <Text fontSize="sm">
          These predictions are generated for entertainment purposes only and do not guarantee winning results. 
          Lottery games are games of chance. Please play responsibly.
        </Text>
      </VStack>
    </Alert>
  );
}