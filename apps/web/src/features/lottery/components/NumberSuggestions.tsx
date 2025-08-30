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
  Tooltip,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaFire, FaSnowflake } from 'react-icons/fa';
import { LotteryPrediction } from '../services/lotteryService';
import { HotColdAnalysis } from '../../../lib/services/lotteryAnalyticsService';

interface NumberSuggestionsProps {
  predictions: LotteryPrediction | null;
  hotColdAnalysis?: HotColdAnalysis;
  showClassifications?: boolean;
}

export function NumberSuggestions({ 
  predictions, 
  hotColdAnalysis,
  showClassifications = true 
}: NumberSuggestionsProps) {
  // Color schemes
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  // Helper function to classify numbers
  const classifyNumber = (number: number) => {
    if (hotColdAnalysis) {
      if (hotColdAnalysis.hotNumbers.includes(number)) return 'hot';
      if (hotColdAnalysis.coldNumbers.includes(number)) return 'cold';
    }
    return 'normal';
  };

  // Helper to get frequency data for a number
  const getNumberFrequency = (number: number) => {
    return predictions?.frequencyAnalysis?.find(f => f.number === number);
  };

  if (!predictions) {
    return (
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md">Number Suggestions</Heading>
        </CardHeader>
        <CardBody>
          <Text color={textColor}>Loading suggestions...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Enhanced Number Suggestions</Heading>
          <HStack spacing={2}>
            {showClassifications && (
              <Badge colorScheme="purple" variant="outline" fontSize="xs">
                Classification System
              </Badge>
            )}
            <Badge colorScheme="blue">AI Powered</Badge>
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Classification Legend */}
          {showClassifications && (
            <HStack justify="center" spacing={6} py={2} flexWrap="wrap">
              <HStack spacing={1}>
                <Icon as={FaFire} color="red.500" boxSize={4} />
                <Text fontSize="sm" color={textColor}>Hot Numbers</Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaSnowflake} color="blue.500" boxSize={4} />
                <Text fontSize="sm" color={textColor}>Cold Numbers</Text>
              </HStack>
              <HStack spacing={1}>
                <Circle size="12px" bg="gray.400" />
                <Text fontSize="sm" color={textColor}>Normal Numbers</Text>
              </HStack>
            </HStack>
          )}

          {/* Suggested Numbers with Classifications */}
          <Box>
            <Text fontSize="sm" color={textColor} mb={3}>
              AI-Generated Suggestions {showClassifications && '(with Classifications)'}
            </Text>
            <SimpleGrid columns={[3, 6]} spacing={3}>
              {predictions.suggestedNumbers.map((number, index) => {
                const classification = classifyNumber(number);
                const frequencyData = getNumberFrequency(number);
                const bgColor = classification === 'hot' ? 'red.500' 
                              : classification === 'cold' ? 'blue.500' 
                              : 'purple.500';
                
                return (
                  <Tooltip
                    key={index}
                    label={
                      <Box>
                        <Text fontWeight="bold">Number {number}</Text>
                        <Text>Classification: {classification.charAt(0).toUpperCase() + classification.slice(1)}</Text>
                        {frequencyData && (
                          <>
                            <Text>Frequency: {frequencyData.frequency} times</Text>
                            <Text>Percentage: {frequencyData.percentage.toFixed(1)}%</Text>
                          </>
                        )}
                      </Box>
                    }
                    placement="top"
                  >
                    <Box position="relative">
                      <Circle
                        size="50px"
                        bg={bgColor}
                        color="white"
                        fontWeight="bold"
                        fontSize="lg"
                        cursor="pointer"
                        transition="transform 0.2s"
                        _hover={{ transform: 'scale(1.1)' }}
                      >
                        {number}
                      </Circle>
                      {showClassifications && classification !== 'normal' && (
                        <Box position="absolute" top="-2px" right="-2px">
                          <Icon
                            as={classification === 'hot' ? FaFire : FaSnowflake}
                            boxSize={3}
                            color="white"
                          />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
            {showClassifications && (
              <Text fontSize="xs" color={textColor} mt={2} textAlign="center">
                Hover over numbers to see detailed frequency information
              </Text>
            )}
          </Box>

          <Divider />

          {/* Hot Numbers Section */}
          <Box>
            <HStack spacing={2} mb={3}>
              <Icon as={FireIcon} color="red.500" boxSize={5} />
              <Text fontSize="sm" color={textColor} fontWeight="bold">
                Hot Numbers (Most Frequent)
              </Text>
              {hotColdAnalysis && (
                <Badge colorScheme="red" size="sm">
                  ≥{hotColdAnalysis.threshold.hot} times
                </Badge>
              )}
            </HStack>
            <SimpleGrid columns={[4, 5, 6]} spacing={3}>
              {(hotColdAnalysis?.hotNumbers || predictions.hotNumbers).slice(0, 12).map((number, index) => {
                const frequencyData = getNumberFrequency(number);
                return (
                  <Tooltip
                    key={index}
                    label={
                      <Box>
                        <Text fontWeight="bold">Hot Number {number}</Text>
                        {frequencyData && (
                          <>
                            <Text>Drawn {frequencyData.frequency} times</Text>
                            <Text>Frequency: {frequencyData.percentage.toFixed(1)}%</Text>
                          </>
                        )}
                        <Text>Above average frequency</Text>
                      </Box>
                    }
                    placement="top"
                  >
                    <Circle
                      size="40px"
                      bg="red.500"
                      color="white"
                      fontWeight="bold"
                      fontSize="sm"
                      cursor="pointer"
                      transition="transform 0.2s"
                      _hover={{ transform: 'scale(1.1)' }}
                      position="relative"
                    >
                      {number}
                    </Circle>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </Box>

          <Divider />

          {/* Cold Numbers Section */}
          <Box>
            <HStack spacing={2} mb={3}>
              <Icon as={FaSnowflake} color="blue.500" boxSize={5} />
              <Text fontSize="sm" color={textColor} fontWeight="bold">
                Cold Numbers (Least Frequent)
              </Text>
              {hotColdAnalysis && (
                <Badge colorScheme="blue" size="sm">
                  ≤{hotColdAnalysis.threshold.cold} times
                </Badge>
              )}
            </HStack>
            <SimpleGrid columns={[4, 5, 6]} spacing={3}>
              {(hotColdAnalysis?.coldNumbers || predictions.coldNumbers).slice(0, 12).map((number, index) => {
                const frequencyData = getNumberFrequency(number);
                return (
                  <Tooltip
                    key={index}
                    label={
                      <Box>
                        <Text fontWeight="bold">Cold Number {number}</Text>
                        {frequencyData && (
                          <>
                            <Text>Drawn {frequencyData.frequency} times</Text>
                            <Text>Frequency: {frequencyData.percentage.toFixed(1)}%</Text>
                          </>
                        )}
                        <Text>Below average frequency</Text>
                      </Box>
                    }
                    placement="top"
                  >
                    <Circle
                      size="40px"
                      bg="blue.500"
                      color="white"
                      fontWeight="bold"
                      fontSize="sm"
                      cursor="pointer"
                      transition="transform 0.2s"
                      _hover={{ transform: 'scale(1.1)' }}
                    >
                      {number}
                    </Circle>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* Enhanced Analysis Info */}
          <Box bg="gray.50" p={4} borderRadius="md">
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between" flexWrap="wrap">
                <Text fontSize="xs" color="gray.600">
                  <strong>Dataset:</strong> {predictions.frequencyAnalysis.length} unique numbers analyzed
                </Text>
                {hotColdAnalysis && (
                  <HStack spacing={4}>
                    <Text fontSize="xs" color="gray.600">
                      <strong>Hot Numbers:</strong> {hotColdAnalysis.hotNumbers.length}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      <strong>Cold Numbers:</strong> {hotColdAnalysis.coldNumbers.length}
                    </Text>
                  </HStack>
                )}
              </HStack>
              <Text fontSize="xs" color="gray.600">
                <strong>Last Updated:</strong> {new Date(predictions.analysisDate).toLocaleString()}
              </Text>
              {showClassifications && (
                <Text fontSize="xs" color="gray.600" fontStyle="italic">
                  Classifications based on historical frequency patterns and statistical thresholds
                </Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}