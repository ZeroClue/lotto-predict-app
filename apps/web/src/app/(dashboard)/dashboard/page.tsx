'use client';

import { Box, Heading, Text, SimpleGrid, Card, CardBody, Button, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="lg" mb={2}>
          Welcome to LottoPredict Dashboard
        </Heading>
        <Text color="gray.600">
          Your gateway to lottery predictions and number analysis
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        <Card>
          <CardBody>
            <Heading size="md" mb={2} color="blue.600">
              Lottery Predictions
            </Heading>
            <Text mb={4} color="gray.600">
              Get AI-powered number suggestions based on historical analysis
            </Text>
            <Link href="/predictions">
              <Button colorScheme="blue" size="sm">
                View Predictions
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={2} color="green.600">
              Historical Data
            </Heading>
            <Text mb={4} color="gray.600">
              Explore past lottery draws and winning patterns
            </Text>
            <Link href="/predictions">
              <Button colorScheme="green" size="sm">
                View History
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={2} color="purple.600">
              Number Analysis
            </Heading>
            <Text mb={4} color="gray.600">
              Analyze hot and cold numbers with frequency charts
            </Text>
            <Link href="/predictions">
              <Button colorScheme="purple" size="sm">
                View Analysis
              </Button>
            </Link>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
}