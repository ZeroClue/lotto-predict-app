'use client';

import { useState } from 'react';
import {
  Box,
  HStack,
  Select,
  Input,
  Button,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { usePredictionStore } from '../../../stores/predictionStore';
import { convertToCSV, downloadCSV } from '../../../lib/csvUtils';
import { AnalyticsFilters as AnalyticsFiltersType } from '../../../lib/services/lotteryAnalyticsService';

export const AnalyticsFilters = () => {
  const [lottery, setLottery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { fetchAnalytics, analyticsData, loading } = usePredictionStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: AnalyticsFiltersType = {
      lotteryName: lottery || undefined,
    };

    if (startDate && endDate) {
      filters.dateRange = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
    }
    
    fetchAnalytics(filters);
  };

  const handleExport = () => {
    if (analyticsData) {
      const csv = convertToCSV(analyticsData.frequencyAnalysis);
      downloadCSV(csv, 'frequency_analysis.csv');
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4} borderWidth={1} borderRadius="md" shadow="sm">
      <HStack spacing={4} justify="space-between">
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Lottery</FormLabel>
            <Select 
              placeholder="All Lotteries"
              value={lottery}
              onChange={(e) => setLottery(e.target.value)}
            >
              <option value="Powerball">Powerball</option>
              <option value="Mega Millions">Mega Millions</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormControl>
        </HStack>
        <HStack alignSelf="flex-end">
          <Button type="submit" colorScheme="blue" isLoading={loading}>
            Apply
          </Button>
          <Button colorScheme="green" onClick={handleExport} isDisabled={!analyticsData}>
            Export CSV
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};
