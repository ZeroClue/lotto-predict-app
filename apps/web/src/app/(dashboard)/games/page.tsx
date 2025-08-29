'use client';

import {
  Box,
  Heading,
  Grid,
  Card,
  CardBody,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGamepad, FaCoins } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Game } from '../../../lib/types';

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch games');
      }

      setGames(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = (gameId: string) => {
    router.push(`/games/${gameId}`);
  };

  if (loading) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={6}>
          🎮 Games Hub
        </Heading>
        <Text>Loading games...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={6}>
          🎮 Games Hub
        </Heading>
        <Text color="red.500">Error: {error}</Text>
        <Button mt={4} onClick={fetchGames}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            🎮 Games Hub
          </Heading>
          <Text color={textColor}>
            Play games and earn crypto rewards! Each game completion earns you cryptocurrency.
          </Text>
        </Box>

        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {games.map((game) => (
            <Card key={game.id} bg={cardBg} shadow="md" _hover={{ shadow: 'lg' }}>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <FaGamepad color="blue" size={24} />
                    <Heading size="md">{game.name}</Heading>
                  </HStack>

                  {game.description && (
                    <Text color={textColor} fontSize="sm">
                      {game.description}
                    </Text>
                  )}

                  <HStack justify="space-between">
                    <HStack>
                      <FaCoins color="gold" size={16} />
                      <Text fontWeight="bold" color="yellow.600">
                        {game.rewardAmount} crypto
                      </Text>
                    </HStack>
                    
                    {game.nftAwardThreshold && (
                      <Badge colorScheme="purple" variant="subtle">
                        NFT @ {game.nftAwardThreshold} wins
                      </Badge>
                    )}
                  </HStack>

                  <Button
                    colorScheme="blue"
                    onClick={() => handlePlayGame(game.id)}
                    leftIcon={<FaGamepad />}
                  >
                    Play Game
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {games.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color={textColor}>No games available at the moment.</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}