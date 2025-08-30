'use client';

import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Link,
  Button,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { EntertainmentDisclaimer } from '../../../../features/lottery/components/EntertainmentDisclaimer';
import { AnalyticsFilters } from '../../../../features/lottery/components/AnalyticsFilters';
import { NumberFrequencyChart } from '../../../../features/lottery/components/NumberFrequencyChart';
import { TrendAnalysisChart } from '../../../../features/lottery/components/TrendAnalysisChart';

export default function AdvancedAnalyticsPage() {
  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Box>
            <Heading size="lg" mb={2}>
              Advanced Lottery Analytics
            </Heading>
            <Text color="gray.600">
              In-depth analysis and data visualization tools
            </Text>
          </Box>
          <HStack>
            <Link as={NextLink} href="/predictions" passHref>
              <Button colorScheme="blue" size="sm">
                Back to Predictions
              </Button>
            </Link>
          </HStack>
        </HStack>
      </Box>

      {/* Entertainment Disclaimer */}
      <EntertainmentDisclaimer />

      {/* Analytics Dashboard */}
      <VStack spacing={6} align="stretch">
        {/* Filters */}
        <AnalyticsFilters />

        {/* Main Content */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Left Column */}
          <VStack spacing={6} align="stretch">
            <NumberFrequencyChart />
          </VStack>

          {/* Right Column */}
          <VStack spacing={6} align="stretch">
            <TrendAnalysisChart />
          </VStack>
        </SimpleGrid>
      </VStack>
    </VStack>
  );
}
