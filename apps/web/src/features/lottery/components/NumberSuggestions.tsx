'use client';

import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  SimpleGrid,
  Circle,
  Text,
  VStack,
  HStack,
  Badge,
  Divider,
  Box,
} from '@chakra-ui/react';
import { LotteryPrediction } from '../services/lotteryService';

interface NumberSuggestionsProps {
  predictions: LotteryPrediction | null;
}

export function NumberSuggestions({ predictions }: NumberSuggestionsProps) {
  if (!predictions) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Number Suggestions</Heading>
        </CardHeader>
        <CardBody>
          <Text color="gray.500">Loading suggestions...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Number Suggestions</Heading>
          <Badge colorScheme="blue">AI Powered</Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Suggested Numbers */}
          <Box>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Suggested Numbers
            </Text>
            <SimpleGrid columns={6} spacing={3}>
              {predictions.suggestedNumbers.map((number, index) => (
                <Circle
                  key={index}
                  size="50px"
                  bg="blue.500"
                  color="white"
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {number}
                </Circle>
              ))}
            </SimpleGrid>
          </Box>

          <Divider />

          {/* Hot Numbers */}
          <Box>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Hot Numbers (Most Frequent)
            </Text>
            <SimpleGrid columns={5} spacing={2}>
              {predictions.hotNumbers.slice(0, 10).map((number, index) => (
                <Circle
                  key={index}
                  size="40px"
                  bg="red.500"
                  color="white"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {number}
                </Circle>
              ))}
            </SimpleGrid>
          </Box>

          <Divider />

          {/* Cold Numbers */}
          <Box>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Cold Numbers (Least Frequent)
            </Text>
            <SimpleGrid columns={5} spacing={2}>
              {predictions.coldNumbers.slice(0, 10).map((number, index) => (
                <Circle
                  key={index}
                  size="40px"
                  bg="blue.300"
                  color="white"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {number}
                </Circle>
              ))}
            </SimpleGrid>
          </Box>

          {/* Analysis Info */}
          <Box bg="gray.50" p={3} borderRadius="md">
            <Text fontSize="xs" color="gray.600">
              Analysis based on {predictions.frequencyAnalysis.length} unique numbers 
              from historical lottery data. Last updated: {new Date(predictions.analysisDate).toLocaleString()}
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}