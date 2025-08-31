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
  Box,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { LotteryPrediction } from '../services/lotteryService';
import { HotColdAnalysis } from '../../../lib/services/lotteryAnalyticsService';

interface HistoricalChartProps {
  predictions: LotteryPrediction | null;
  hotColdAnalysis?: HotColdAnalysis;
  showTrendIndicators?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const trendScore = (parseInt(label, 10) % 3) - 1; // Mock trend
    let trendIcon;
    if (trendScore > 0) {
      trendIcon = <Icon as={FiTrendingUp} color="green.500" />;
    } else if (trendScore < 0) {
      trendIcon = <Icon as={FiTrendingDown} color="red.500" />;
    } else {
      trendIcon = <Icon as={FiMinus} color="gray.500" />;
    }

    return (
      <Box bg={cardBg} p={3} borderRadius="md" boxShadow="lg" color={textColor}>
        <HStack>
          <Text fontWeight="bold">{`Number: ${label}`}</Text>
          {trendIcon}
        </HStack>
        <Text>{`Frequency: ${payload[0].value}`}</Text>
      </Box>
    );
  }

  return null;
};


export function HistoricalChart({
  predictions,
  hotColdAnalysis,
  showTrendIndicators = true,
}: HistoricalChartProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const axisColor = useColorModeValue('gray.500', 'gray.400');

  if (!predictions) {
    return (
      <Card bg={cardBg}>
        <CardHeader>
          <Heading size="md">Number Frequency Analysis</Heading>
        </CardHeader>
        <CardBody>
          <Text color={textColor}>Loading frequency analysis...</Text>
        </CardBody>
      </Card>
    );
  }

  const sortedAnalysis = [...predictions.frequencyAnalysis]
    .sort((a, b) => a.number - b.number); // Sort by number for chart axis

  const getNumberClassification = (number: number) => {
    if (hotColdAnalysis) {
      if (hotColdAnalysis.hotNumbers.includes(number)) return 'hot';
      if (hotColdAnalysis.coldNumbers.includes(number)) return 'cold';
    }
    return 'normal';
  };

  const getBarFillColor = (number: number) => {
    const classification = getNumberClassification(number);
    switch (classification) {
      case 'hot':
        return '#E53E3E'; // red.500
      case 'cold':
        return '#3182CE'; // blue.500
      default:
        return '#805AD5'; // purple.500
    }
  };

  const chartData = sortedAnalysis.map(item => ({
    name: item.number.toString(),
    frequency: item.frequency,
  }));

  return (
    <Card bg={cardBg}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Enhanced Frequency Analysis</Heading>
          <Badge colorScheme="purple">Frequency Chart</Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="sm" color={textColor} mb={2}>
            Frequency of each number in historical draws.
          </Text>
          <HStack justify="center" spacing={6} py={2} flexWrap="wrap">
            <HStack spacing={1}>
              <Box bg="red.500" w="12px" h="12px" borderRadius="sm" />
              <Text fontSize="xs" color={textColor}>Hot Numbers</Text>
            </HStack>
            <HStack spacing={1}>
              <Box bg="blue.500" w="12px" h="12px" borderRadius="sm" />
              <Text fontSize="xs" color={textColor}>Cold Numbers</Text>
            </HStack>
            <HStack spacing={1}>
              <Box bg="purple.500" w="12px" h="12px" borderRadius="sm" />
              <Text fontSize="xs" color={textColor}>Normal Numbers</Text>
            </HStack>
            {showTrendIndicators && (
              <>
              <HStack spacing={1}>
                <Icon as={FiTrendingUp} color="green.500" />
                <Text fontSize="xs" color={textColor}>Trending Up</Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FiTrendingDown} color="red.500" />
                <Text fontSize="xs" color={textColor}>Trending Down</Text>
              </HStack>
              </>
            )}
          </HStack>
          <Box h="400px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: -10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('gray.200', 'gray.700')} />
                <XAxis dataKey="name" stroke={axisColor} fontSize="12px" />
                <YAxis stroke={axisColor} fontSize="12px" />
                <RechartsTooltip
                  content={<CustomTooltip />}
                />
                <Bar dataKey="frequency" name="Frequency">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarFillColor(parseInt(entry.name, 10))} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}
