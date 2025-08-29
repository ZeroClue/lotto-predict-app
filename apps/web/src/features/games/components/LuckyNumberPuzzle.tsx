'use client';

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  Alert,
  AlertIcon,
  useColorModeValue,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

interface LuckyNumberPuzzleProps {
  onComplete: () => void;
  isCompleting?: boolean;
}

export function LuckyNumberPuzzle({ onComplete, isCompleting = false }: LuckyNumberPuzzleProps) {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [userGuess, setUserGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [maxAttempts] = useState<number>(5);

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    // Generate random number between 1 and 10
    setTargetNumber(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleGuess = () => {
    const guess = parseInt(userGuess);
    
    if (isNaN(guess) || guess < 1 || guess > 10) {
      setFeedback('Please enter a number between 1 and 10');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess === targetNumber) {
      setGameWon(true);
      setFeedback(`🎉 Congratulations! You guessed it in ${newAttempts} attempt(s)!`);
    } else if (newAttempts >= maxAttempts) {
      setFeedback(`😞 Game over! The lucky number was ${targetNumber}. Try again!`);
    } else {
      const hint = guess < targetNumber ? 'too low' : 'too high';
      setFeedback(`Your guess is ${hint}. ${maxAttempts - newAttempts} attempts left.`);
    }

    setUserGuess('');
  };

  const handleComplete = () => {
    onComplete();
  };

  const resetGame = () => {
    setTargetNumber(Math.floor(Math.random() * 10) + 1);
    setUserGuess('');
    setAttempts(0);
    setGameWon(false);
    setFeedback('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !gameWon && attempts < maxAttempts) {
      handleGuess();
    }
  };

  return (
    <Box
      bg={cardBg}
      p={6}
      borderRadius="lg"
      shadow="md"
      maxW="md"
      mx="auto"
    >
      <VStack spacing={6}>
        <Box textAlign="center">
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            Lucky Number Puzzle
          </Text>
          <Text color={textColor} fontSize="sm">
            Guess the lucky number between 1 and 10!
          </Text>
          <Text color={textColor} fontSize="xs" mt={1}>
            You have {maxAttempts} attempts to win.
          </Text>
        </Box>

        {!gameWon && attempts < maxAttempts && (
          <VStack spacing={4} width="100%">
            <HStack spacing={4} width="100%">
              <NumberInput
                value={userGuess}
                onChange={setUserGuess}
                min={1}
                max={10}
                flex={1}
              >
                <NumberInputField
                  placeholder="Enter 1-10"
                  onKeyPress={handleKeyPress}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button
                colorScheme="blue"
                onClick={handleGuess}
                isDisabled={!userGuess || isCompleting}
              >
                Guess
              </Button>
            </HStack>

            <Text fontSize="sm" color={textColor}>
              Attempts: {attempts}/{maxAttempts}
            </Text>
          </VStack>
        )}

        {feedback && (
          <Alert
            status={gameWon ? 'success' : attempts >= maxAttempts ? 'error' : 'info'}
            variant="subtle"
          >
            <AlertIcon />
            <Text fontSize="sm">{feedback}</Text>
          </Alert>
        )}

        {gameWon && (
          <Button
            colorScheme="green"
            size="lg"
            onClick={handleComplete}
            isLoading={isCompleting}
            loadingText="Awarding crypto..."
          >
            Claim Reward
          </Button>
        )}

        {!gameWon && attempts >= maxAttempts && (
          <Button colorScheme="blue" onClick={resetGame}>
            Try Again
          </Button>
        )}
      </VStack>
    </Box>
  );
}