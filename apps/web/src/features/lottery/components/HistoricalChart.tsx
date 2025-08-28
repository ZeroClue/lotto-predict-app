'use client';

import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Box,
  SimpleGrid,
} from '@chakra-ui/react';
import { LotteryPrediction } from '../services/lotteryService';

interface HistoricalChartProps {
  predictions: LotteryPrediction | null;
}

export function HistoricalChart({ predictions }: HistoricalChartProps) {
  if (!predictions) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Number Frequency Analysis</Heading>
        </CardHeader>
        <CardBody>
          <Text color="gray.500">Loading frequency analysis...</Text>
        </CardBody>
      </Card>
    );
  }

  // Sort frequency analysis by frequency for better visualization
  const sortedAnalysis = [...predictions.frequencyAnalysis]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20); // Show top 20 most frequent numbers

  const maxFrequency = sortedAnalysis[0]?.frequency || 1;

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Number Frequency Analysis</Heading>
          <Badge colorScheme="purple">Top 20</Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="sm" color="gray.600" mb={2}>
            Most frequently drawn numbers in historical data
          </Text>
          
          <VStack spacing={3} align="stretch">
            {sortedAnalysis.map((item, index) => (
              <Box key={item.number}>
                <HStack justify="space-between" mb={1}>
                  <HStack spacing={3}>
                    <Badge
                      colorScheme={index < 5 ? 'red' : index < 10 ? 'orange' : 'blue'}
                      minW="40px"
                      textAlign="center"
                    >
                      {item.number}
                    </Badge>
                    <Text fontSize="sm">
                      {item.frequency} times
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {item.percentage.toFixed(1)}%
                  </Text>
                </HStack>
                <Progress
                  value={(item.frequency / maxFrequency) * 100}
                  size="sm"
                  colorScheme={index < 5 ? 'red' : index < 10 ? 'orange' : 'blue'}
                  bg="gray.100"
                />
              </Box>
            ))}
          </VStack>

          <Box bg="gray.50" p={4} borderRadius="md" mt={4}>
            <SimpleGrid columns={2} spacing={4}>
              <VStack spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  Most Frequent
                </Text>
                <HStack spacing={2}>
                  {predictions.hotNumbers.slice(0, 3).map((number, index) => (
                    <Badge key={index} colorScheme="red">
                      {number}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  Least Frequent
                </Text>
                <HStack spacing={2}>
                  {predictions.coldNumbers.slice(0, 3).map((number, index) => (
                    <Badge key={index} colorScheme="blue">
                      {number}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </SimpleGrid>
          </Box>

          <Text fontSize="xs" color="gray.500" textAlign="center">
            Analysis includes {predictions.frequencyAnalysis.length} unique numbers from historical draws
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
}