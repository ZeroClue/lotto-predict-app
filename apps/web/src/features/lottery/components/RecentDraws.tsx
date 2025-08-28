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
} from '@chakra-ui/react';
import { LotteryDraw } from '../services/lotteryService';

interface RecentDrawsProps {
  draws: LotteryDraw[];
}

export function RecentDraws({ draws }: RecentDrawsProps) {
  if (!draws || draws.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Recent Draws</Heading>
        </CardHeader>
        <CardBody>
          <Text color="gray.500">No recent draws available...</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Recent Draws</Heading>
          <Badge colorScheme="green">{draws.length} draws</Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {draws.slice(0, 10).map((draw, index) => (
            <Box key={draw.id}>
              <VStack spacing={3} align="stretch">
                {/* Header with lottery name and date */}
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Badge colorScheme="blue" variant="subtle">
                      {draw.lotteryName}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {draw.drawDate.toLocaleDateString()}
                    </Text>
                  </HStack>
                  {draw.jackpotAmount && (
                    <Badge colorScheme="green" variant="outline">
                      ${draw.jackpotAmount.toLocaleString()}
                    </Badge>
                  )}
                </HStack>

                {/* Winning Numbers */}
                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.600" minW="fit-content">
                    Numbers:
                  </Text>
                  <SimpleGrid columns={6} spacing={2} flex="1">
                    {draw.winningNumbers.map((number, numberIndex) => (
                      <Circle
                        key={numberIndex}
                        size="32px"
                        bg="blue.500"
                        color="white"
                        fontWeight="bold"
                        fontSize="sm"
                      >
                        {number}
                      </Circle>
                    ))}
                  </SimpleGrid>
                  {draw.bonusNumber && (
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
                  )}
                </HStack>

                {draw.bonusNumber && (
                  <Text fontSize="xs" color="gray.500" textAlign="right">
                    Bonus: {draw.bonusNumber}
                  </Text>
                )}
              </VStack>
              
              {index < draws.slice(0, 10).length - 1 && <Divider mt={4} />}
            </Box>
          ))}
          
          {draws.length > 10 && (
            <Box textAlign="center" pt={2}>
              <Text fontSize="sm" color="gray.500">
                Showing 10 of {draws.length} recent draws
              </Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
}