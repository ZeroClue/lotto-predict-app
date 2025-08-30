'use client';

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  useColorModeValue,
  Grid,
  Progress,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';

interface ColorMemoryGameProps {
  onComplete: () => void;
  isCompleting?: boolean;
}

type GameColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

interface GameState {
  sequence: GameColor[];
  userSequence: GameColor[];
  currentRound: number;
  isDisplaying: boolean;
  isUserTurn: boolean;
  gameComplete: boolean;
  gameOver: boolean;
  feedback: string;
}

const COLORS: GameColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const MAX_ROUNDS = 5;
const DISPLAY_SPEED = 800; // ms
const DISPLAY_PAUSE = 200; // ms between colors

export function ColorMemoryGame({ onComplete, isCompleting = false }: ColorMemoryGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    sequence: [],
    userSequence: [],
    currentRound: 1,
    isDisplaying: false,
    isUserTurn: false,
    gameComplete: false,
    gameOver: false,
    feedback: 'Watch the color sequence, then repeat it!',
  });

  const [activeColor, setActiveColor] = useState<GameColor | null>(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const getColorValue = (color: GameColor): string => {
    const colorMap = {
      red: '#E53E3E',
      blue: '#3182CE',
      green: '#38A169',
      yellow: '#D69E2E',
      purple: '#805AD5',
      orange: '#DD6B20',
    };
    return colorMap[color];
  };

  const generateSequence = useCallback((round: number): GameColor[] => {
    const sequence: GameColor[] = [];
    for (let i = 0; i < round + 2; i++) {
      sequence.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    return sequence;
  }, []);

  const displaySequence = useCallback(async (sequence: GameColor[]) => {
    setGameState(prev => ({ ...prev, isDisplaying: true, isUserTurn: false }));
    
    for (let i = 0; i < sequence.length; i++) {
      setActiveColor(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, DISPLAY_SPEED));
      setActiveColor(null);
      await new Promise(resolve => setTimeout(resolve, DISPLAY_PAUSE));
    }
    
    setGameState(prev => ({ 
      ...prev, 
      isDisplaying: false, 
      isUserTurn: true,
      feedback: 'Now repeat the sequence!'
    }));
  }, []);

  const startNewRound = useCallback(() => {
    const newSequence = generateSequence(gameState.currentRound);
    setGameState(prev => ({
      ...prev,
      sequence: newSequence,
      userSequence: [],
      feedback: `Round ${prev.currentRound}: Watch carefully...`,
    }));
    displaySequence(newSequence);
  }, [gameState.currentRound, generateSequence, displaySequence]);

  useEffect(() => {
    startNewRound();
  }, []); // Only run on mount

  const handleColorClick = (color: GameColor) => {
    if (!gameState.isUserTurn || gameState.gameComplete || gameState.gameOver) return;

    const newUserSequence = [...gameState.userSequence, color];
    const currentIndex = gameState.userSequence.length;

    // Check if the clicked color is correct
    if (color !== gameState.sequence[currentIndex]) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        isUserTurn: false,
        feedback: `❌ Wrong color! The correct sequence was: ${prev.sequence.join(' → ')}. Try again!`,
      }));
      return;
    }

    // Update user sequence
    setGameState(prev => ({ ...prev, userSequence: newUserSequence }));

    // Check if round is complete
    if (newUserSequence.length === gameState.sequence.length) {
      if (gameState.currentRound >= MAX_ROUNDS) {
        // Game complete!
        setGameState(prev => ({
          ...prev,
          gameComplete: true,
          isUserTurn: false,
          feedback: `🎉 Congratulations! You completed all ${MAX_ROUNDS} rounds! Memory champion!`,
        }));
      } else {
        // Next round
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentRound: prev.currentRound + 1,
            userSequence: [],
            feedback: `✅ Round ${prev.currentRound} complete! Get ready for round ${prev.currentRound + 1}...`,
          }));
          
          setTimeout(() => {
            const nextSequence = generateSequence(gameState.currentRound + 1);
            setGameState(prev => ({
              ...prev,
              sequence: nextSequence,
              feedback: `Round ${prev.currentRound}: Watch carefully...`,
            }));
            displaySequence(nextSequence);
          }, 1500);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setGameState({
      sequence: [],
      userSequence: [],
      currentRound: 1,
      isDisplaying: false,
      isUserTurn: false,
      gameComplete: false,
      gameOver: false,
      feedback: 'Watch the color sequence, then repeat it!',
    });
    setActiveColor(null);
    
    setTimeout(() => {
      startNewRound();
    }, 500);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="lg"
      shadow="md"
      maxW="lg"
      mx="auto"
    >
      <VStack spacing={6}>
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            Color Memory Challenge
          </Text>
          <Text color={textColor} fontSize="sm">
            Remember and repeat the color sequence!
          </Text>
          <Text color={textColor} fontSize="xs" mt={1}>
            Complete {MAX_ROUNDS} rounds to win crypto rewards.
          </Text>
        </Box>

        <VStack spacing={4} width="100%">
          <HStack spacing={4} width="100%">
            <Text fontSize="sm" color={textColor}>
              Round: {gameState.currentRound}/{MAX_ROUNDS}
            </Text>
            <Text fontSize="sm" color={textColor}>
              Progress: {gameState.userSequence.length}/{gameState.sequence.length}
            </Text>
          </HStack>
          
          <Progress
            value={(gameState.userSequence.length / Math.max(gameState.sequence.length, 1)) * 100}
            colorScheme="blue"
            width="100%"
            height="8px"
            borderRadius="md"
          />
        </VStack>

        <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%">
          {COLORS.map((color) => (
            <Button
              key={color}
              h="60px"
              bg={getColorValue(color)}
              _hover={{ opacity: 0.8 }}
              _active={{ transform: 'scale(0.95)' }}
              onClick={() => handleColorClick(color)}
              isDisabled={!gameState.isUserTurn || isCompleting}
              border={activeColor === color ? '4px solid white' : 'none'}
              shadow={activeColor === color ? 'lg' : 'md'}
              transform={activeColor === color ? 'scale(1.1)' : 'scale(1)'}
              transition="all 0.2s"
            >
              <Text color="white" fontWeight="bold" textShadow="1px 1px 2px rgba(0,0,0,0.5)">
                {color.toUpperCase()}
              </Text>
            </Button>
          ))}
        </Grid>

        {gameState.feedback && (
          <Alert
            status={
              gameState.gameComplete ? 'success' : 
              gameState.gameOver ? 'error' : 
              'info'
            }
            variant="subtle"
            borderRadius="md"
          >
            <AlertIcon />
            <Text fontSize="sm">{gameState.feedback}</Text>
          </Alert>
        )}

        {gameState.gameComplete && (
          <Button
            colorScheme="green"
            size="lg"
            onClick={handleComplete}
            isLoading={isCompleting}
            loadingText="Awarding crypto..."
          >
            Claim Reward (12 coins)
          </Button>
        )}

        {gameState.gameOver && (
          <Button colorScheme="blue" onClick={resetGame}>
            Try Again
          </Button>
        )}

        {gameState.isDisplaying && (
          <Text fontSize="sm" color={textColor} fontStyle="italic">
            👀 Watch the sequence...
          </Text>
        )}
      </VStack>
    </Box>
  );
}