'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { usePredictionStore } from '../../../stores/predictionStore';
import { HistoricalChart } from '../../../features/lottery/components/HistoricalChart';
import { NumberSuggestions } from '../../../features/lottery/components/NumberSuggestions';
import { RecentDraws } from '../../../features/lottery/components/RecentDraws';
import { EntertainmentDisclaimer } from '../../../features/lottery/components/EntertainmentDisclaimer';

export default function PredictionsPage() {
  const [selectedLottery, setSelectedLottery] = useState<string>('');
  const {
    predictions,
    recentDraws,
    loading,
    error,
    fetchPredictions,
    fetchRecentDraws,
  } = usePredictionStore();

  useEffect(() => {
    fetchPredictions();
    fetchRecentDraws();
  }, [fetchPredictions, fetchRecentDraws]);

  const handleLotteryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lottery = event.target.value;
    setSelectedLottery(lottery);
    await fetchPredictions(lottery || undefined);
    await fetchRecentDraws(lottery || undefined);
  };

  const refreshData = () => {
    fetchPredictions(selectedLottery || undefined);
    fetchRecentDraws(selectedLottery || undefined);
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Box>
            <Heading size="lg" mb={2}>
              Lottery Predictions
            </Heading>
            <Text color="gray.600">
              AI-powered number analysis and suggestions
            </Text>
          </Box>
          <HStack spacing={4}>
            <Select
              placeholder="All Lotteries"
              value={selectedLottery}
              onChange={handleLotteryChange}
              w="200px"
            >
              <option value="Powerball">Powerball</option>
              <option value="Mega Millions">Mega Millions</option>
            </Select>
            <Button
              onClick={refreshData}
              isLoading={loading}
              colorScheme="blue"
              size="sm"
            >
              Refresh
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Entertainment Disclaimer */}
      <EntertainmentDisclaimer />

      {/* Error State */}
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error loading data!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" />
          <Text mt={4}>Loading predictions...</Text>
        </Box>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Left Column */}
          <VStack spacing={6} align="stretch">
            {/* Number Suggestions */}
            <NumberSuggestions predictions={predictions} />
            
            {/* Recent Draws */}
            <RecentDraws draws={recentDraws} />
          </VStack>

          {/* Right Column */}
          <VStack spacing={6} align="stretch">
            {/* Historical Chart */}
            <HistoricalChart predictions={predictions} />

            {/* Quick Stats */}
            {predictions && (
              <Card>
                <CardHeader>
                  <Heading size="md">Quick Stats</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text>Analysis Date:</Text>
                      <Badge colorScheme="blue">
                        {new Date(predictions.analysisDate).toLocaleDateString()}
                      </Badge>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text>Numbers Analyzed:</Text>
                      <Badge colorScheme="green">
                        {predictions.frequencyAnalysis.length}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Hot Numbers:</Text>
                      <Badge colorScheme="red">
                        {predictions.hotNumbers.length}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Cold Numbers:</Text>
                      <Badge colorScheme="blue">
                        {predictions.coldNumbers.length}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </SimpleGrid>
      )}
    </VStack>
  );
}