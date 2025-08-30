'use client';

import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCoins } from 'react-icons/fa';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Game } from '../../../../lib/types';
import { LuckyNumberPuzzle } from '../../../../features/games/components/LuckyNumberPuzzle';
import { ColorMemoryGame } from '../../../../features/games/components/ColorMemoryGame';
import { CryptoReward } from '../../../../features/games/components/CryptoReward';
import { useGameStore } from '../../../../stores/gameStore';
import { useNFTStore } from '../../../../stores/nftStore';
import NFTAward, { NFTAwardResult } from '../../../../features/nfts/components/NFTAward';

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params?.gameId as string;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [awardedNFTs, setAwardedNFTs] = useState<NFTAwardResult[]>([]);
  const [showNFTAward, setShowNFTAward] = useState(false);

  const { completeGame, isCompletingGame, completionError } = useGameStore();
  const { refreshNFTs } = useNFTStore();
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/games/${gameId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch game');
      }

      setGame(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game');
    } finally {
      setLoading(false);
    }
  };

  const handleGameComplete = async () => {
    if (!game) return;

    try {
      const result = await completeGame(game.id);
      setEarnedAmount(result.earnedAmount);
      
      // Check for NFT awards
      if (result.mintedNFTs && result.mintedNFTs.length > 0) {
        setAwardedNFTs(result.mintedNFTs);
        setShowNFTAward(true);
      } else {
        setGameCompleted(true);
      }
    } catch (err) {
      console.error('Failed to complete game:', err);
    }
  };

  const handlePlayAgain = () => {
    setGameCompleted(false);
    setEarnedAmount(0);
    setAwardedNFTs([]);
    setShowNFTAward(false);
  };

  const handleNFTAwardClose = () => {
    setShowNFTAward(false);
    setGameCompleted(true);
    // Refresh NFTs in the store to update the header count
    if (awardedNFTs.length > 0) {
      refreshNFTs().catch(console.error);
    }
  };

  const handleBackToGames = () => {
    router.push('/games');
  };

  const getGameSpecificMessage = () => {
    if (!game) return undefined;
    
    switch (game.name) {
      case 'Color Memory Challenge':
        return `You completed all 5 rounds! Your memory is incredible!`;
      case 'Lucky Number Puzzle':
        return `You found the lucky number! Fortune favors you!`;
      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <Box p={6}>
        <HStack spacing={4} mb={6}>
          <Spinner size="lg" />
          <Text>Loading game...</Text>
        </HStack>
      </Box>
    );
  }

  if (error || !game) {
    return (
      <Box p={6}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error || 'Game not found'}
        </Alert>
        <Button onClick={handleBackToGames} leftIcon={<FaArrowLeft />}>
          Back to Games
        </Button>
      </Box>
    );
  }

  if (gameCompleted) {
    return (
      <Box p={6}>
        <VStack spacing={6}>
          <CryptoReward 
            earnedAmount={earnedAmount} 
            gameName={game?.name}
            gameSpecificMessage={getGameSpecificMessage()}
          />
          <VStack spacing={4}>
            <Button colorScheme="blue" onClick={handlePlayAgain}>
              Play Again
            </Button>
            <Button variant="outline" onClick={handleBackToGames}>
              Back to Games
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      {/* NFT Award Modal */}
      <NFTAward
        isOpen={showNFTAward}
        onClose={handleNFTAwardClose}
        awardedNFTs={awardedNFTs}
        earnedAmount={earnedAmount}
      />

      <Box p={6}>
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button
              variant="ghost"
              leftIcon={<FaArrowLeft />}
              onClick={handleBackToGames}
            >
              Back to Games
            </Button>
          </HStack>

        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            {game.name}
          </Heading>
          {game.description && (
            <Text color={textColor} mb={4}>
              {game.description}
            </Text>
          )}
          <HStack justify="center" spacing={2}>
            <FaCoins color="yellow" />
            <Text fontWeight="bold" color="yellow.600">
              Reward: {game.rewardAmount} crypto
            </Text>
          </HStack>
        </Box>

        {completionError && (
          <Alert status="error">
            <AlertIcon />
            Failed to complete game: {completionError}
          </Alert>
        )}

        <Box>
          {game.name === 'Lucky Number Puzzle' && (
            <LuckyNumberPuzzle
              onComplete={handleGameComplete}
              isCompleting={isCompletingGame}
            />
          )}
          {game.name === 'Color Memory Challenge' && (
            <ColorMemoryGame
              onComplete={handleGameComplete}
              isCompleting={isCompletingGame}
            />
          )}
          {/* Add other game components here based on game.name */}
        </Box>
        </VStack>
      </Box>
    </>
  );
}