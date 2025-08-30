'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Text, Spinner, Center } from '@chakra-ui/react';
import { usePredictionStore } from '../../../stores/predictionStore';

export const NumberFrequencyChart = () => {
  const analyticsData = usePredictionStore((state) => state.analyticsData);
  const loading = usePredictionStore((state) => state.loading);

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!analyticsData) {
    return (
      <Center h="400px">
        <Text>No data to display. Apply filters to see results.</Text>
      </Center>
    );
  }

  const chartData = analyticsData.frequencyAnalysis.map((item) => ({
    name: item.number.toString(),
    frequency: item.frequency,
  }));

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="sm" h="400px">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Number Frequency
      </Text>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="frequency" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
