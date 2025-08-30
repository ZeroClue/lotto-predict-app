'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Text, Spinner, Center, Select, VStack, HStack } from '@chakra-ui/react';
import { usePredictionStore } from '../../../stores/predictionStore';

export const TrendAnalysisChart = () => {
  const { analyticsData, loading } = usePredictionStore();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const availableNumbers = useMemo(() => {
    return analyticsData?.trendAnalysis?.map(t => t.number).sort((a, b) => a - b) || [];
  }, [analyticsData]);

  // Effect to select the first number when data loads
  useEffect(() => {
    if (availableNumbers.length > 0 && selectedNumber === null) {
      setSelectedNumber(availableNumbers[0]);
    }
  }, [availableNumbers, selectedNumber]);

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!analyticsData || !analyticsData.trendAnalysis || analyticsData.trendAnalysis.length === 0) {
    return (
      <Center h="400px">
        <Text>No trend data to display. Apply filters to see results.</Text>
      </Center>
    );
  }

  const trendData = analyticsData.trendAnalysis.find(t => t.number === selectedNumber);
  const chartData = trendData?.trends.map((point) => ({
    name: new Date(point.period).toLocaleDateString(),
    trend: point.movingAverage,
  })) || [];

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="sm" h="400px">
      <VStack align="stretch" h="100%">
        <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">
                Trend Analysis
            </Text>
            <Select
                placeholder="Select Number"
                value={selectedNumber ?? ''}
                onChange={(e) => setSelectedNumber(Number(e.target.value))}
                w="150px"
                size="sm"
            >
                {availableNumbers.map(num => (
                    <option key={num} value={num}>{num}</option>
                ))}
            </Select>
        </HStack>
        
        <ResponsiveContainer width="100%" height="100%">
          {trendData ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="trend" stroke="#82ca9d" name={`MA for ${trendData.number}`} />
            </LineChart>
          ) : (
            <Center h="100%">
              <Text>Select a number to view its trend.</Text>
            </Center>
          )}
        </ResponsiveContainer>
      </VStack>
    </Box>
  );
};
