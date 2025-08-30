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
  SimpleGrid,
  Circle,
  Divider,
  Box,
  Tooltip,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaFire, FaSnowflake } from 'react-icons/fa';
import { LotteryDraw } from '../services/lotteryService';
import { HotColdAnalysis, NumberFrequency } from '../../../lib/services/lotteryAnalyticsService';

interface RecentDrawsProps {
  draws: LotteryDraw[];
  frequencyAnalysis?: NumberFrequency[];
  hotColdAnalysis?: HotColdAnalysis;
}

export function RecentDraws({ draws, frequencyAnalysis, hotColdAnalysis }: RecentDrawsProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const getNumberInfo = (number: number) => {
    const frequency = frequencyAnalysis?.find(f => f.number === number);
    let classification = 'normal';
    if (hotColdAnalysis) {
      if (hotColdAnalysis.hotNumbers.includes(number)) classification = 'hot';
      if (hotColdAnalysis.coldNumbers.includes(number)) classification = 'cold';
    }
    return { frequency, classification };
  };

  if (!draws || draws.length === 0) {
    return (
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md">Recent Draws</Heading>
        </CardHeader>
        <CardBody>
          <Text color={textColor}>No recent draws available...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={cardBg}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Recent Draws with Frequency Context</Heading>
          <Badge colorScheme="green">{draws.length} draws</Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {draws.slice(0, 10).map((draw, index) => (
            <Box key={draw.id}>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Badge colorScheme="blue" variant="subtle">
                      {draw.lotteryName}
                    </Badge>
                    <Text fontSize="sm" color={textColor}>
                      {new Date(draw.drawDate).toLocaleDateString()}
                    </Text>
                  </HStack>
                  {draw.jackpotAmount && (
                    <Badge colorScheme="green" variant="outline">
                      ${draw.jackpotAmount.toLocaleString()}
                    </Badge>
                  )}
                </HStack>

                <HStack spacing={2}>
                  <Text fontSize="sm" color={textColor} minW="fit-content">
                    Numbers:
                  </Text>
                  <SimpleGrid columns={{ base: 3, md: 6 }} spacing={2} flex="1">
                    {draw.winningNumbers.map((number, numberIndex) => {
                      const { frequency, classification } = getNumberInfo(number);
                      return (
                        <Tooltip
                          key={numberIndex}
                          label={
                            <Box>
                              <Text fontWeight="bold">Number {number}</Text>
                              {frequency && (
                                <>
                                  <Text>Frequency: {frequency.frequency} times</Text>
                                  <Text>Percentage: {frequency.percentage.toFixed(1)}%</Text>
                                </>
                              )}
                              <HStack>
                                <Text>Status:</Text>
                                {classification === 'hot' && <Icon as={FaFire} color="red.400" />}
                                {classification === 'cold' && <Icon as={FaSnowflake} color="blue.400" />}
                                <Text>{classification}</Text>
                              </HStack>
                            </Box>
                          }
                          placement="top"
                        >
                          <Circle
                            size="32px"
                            bg={classification === 'hot' ? 'red.500' : classification === 'cold' ? 'blue.500' : 'gray.500'}
                            color="white"
                            fontWeight="bold"
                            fontSize="sm"
                          >
                            {number}
                          </Circle>
                        </Tooltip>
                      );
                    })}
                  </SimpleGrid>
                  {draw.bonusNumber && (
                     <Tooltip
                     label={`Bonus Number: ${draw.bonusNumber}`}
                     placement="top"
                   >
                    <Circle
                      size="32px"
                      bg="orange.500"
                      color="white"
                      fontWeight="bold"
                      fontSize="sm"
                      ml={2}
                    >
                      {draw.bonusNumber}
                    </Circle>
                    </Tooltip>
                  )}
                </HStack>
              </VStack>
              
              {index < draws.slice(0, 10).length - 1 && <Divider mt={4} />}
            </Box>
          ))}
          
          {draws.length > 10 && (
            <Box textAlign="center" pt={2}>
              <Text fontSize="sm" color={textColor}>
                Showing 10 of {draws.length} recent draws
              </Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}
