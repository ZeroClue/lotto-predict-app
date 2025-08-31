'use client';

import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Badge,
  keyframes,
} from '@chakra-ui/react';
import { FaCoins, FaTrophy } from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface CryptoRewardProps {
  earnedAmount: number;
  gameName?: string;
  gameSpecificMessage?: string;
}

// Keyframes for animations
const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -15px, 0); }
  70% { transform: translate3d(0, -7px, 0); }
  90% { transform: translate3d(0, -3px, 0); }
`;

const sparkle = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 1; }
  50% { transform: scale(1) rotate(180deg); opacity: 0.8; }
  100% { transform: scale(0) rotate(360deg); opacity: 0; }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

export function CryptoReward({ earnedAmount, gameName, gameSpecificMessage }: CryptoRewardProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.700');
  const goldColor = useColorModeValue('yellow.500', 'yellow.400');

  // Game-specific configurations
  const getGameConfig = () => {
    switch (gameName) {
      case 'Color Memory Challenge':
        return {
          emoji: '🎨🧠💫',
          successMessage: gameSpecificMessage || 'Amazing memory skills!',
          celebrationText: 'Memory Master!'
        };
      case 'Lucky Number Puzzle':
        return {
          emoji: '🎲🍀✨',
          successMessage: gameSpecificMessage || 'Lucky guess!',
          celebrationText: 'Number Wizard!'
        };
      default:
        return {
          emoji: '🪙✨💎',
          successMessage: gameSpecificMessage || 'You completed the game!',
          celebrationText: 'Game Champion!'
        };
    }
  };

  const gameConfig = getGameConfig();

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Create sparkle elements
  const createSparkles = () => {
    const sparkles = [];
    for (let i = 0; i < 12; i++) {
      const delay = i * 0.1;
      const randomX = Math.random() * 200 - 100;
      const randomY = Math.random() * 200 - 100;
      
      sparkles.push(
        <Box
          key={i}
          position="absolute"
          left={`50%`}
          top={`50%`}
          width="4px"
          height="4px"
          bg="yellow.400"
          borderRadius="50%"
          animation={`${sparkle} 1.5s ease-out ${delay}s`}
          transform={`translate(${randomX}px, ${randomY}px)`}
          opacity={0}
        />
      );
    }
    return sparkles;
  };

  return (
    <Box
      bg={cardBg}
      p={8}
      borderRadius="xl"
      shadow="xl"
      textAlign="center"
      position="relative"
      overflow="hidden"
      maxW="md"
      mx="auto"
      animation={`${fadeInUp} 0.6s ease-out`}
    >
      {/* Background sparkles */}
      {showConfetti && (
        <Box position="absolute" inset={0} pointerEvents="none">
          {createSparkles()}
        </Box>
      )}

      <VStack spacing={6}>
        {/* Trophy and coin animation */}
        <Box position="relative">
          <Icon
            as={FaTrophy}
            boxSize={16}
            color="yellow.500"
            animation={`${bounce} 1s ease-in-out`}
          />
          <Icon
            as={FaCoins}
            boxSize={8}
            color={goldColor}
            position="absolute"
            top="-2"
            right="-2"
            animation={`${bounce} 1s ease-in-out 0.2s`}
          />
        </Box>

        {/* Success message */}
        <VStack spacing={2}>
          <Text fontSize="2xl" fontWeight="bold" color="green.500">
            🎉 Congratulations!
          </Text>
          <Text fontSize="lg" fontWeight="semibold" color="purple.600" dark={{ color: 'purple.400' }}>
            {gameConfig.celebrationText}
          </Text>
          <Text fontSize="md" color="gray.600" dark={{ color: 'gray.300' }}>
            {gameConfig.successMessage}
          </Text>
        </VStack>

        {/* Earned amount display */}
        <Box
          bg="yellow.50"
          dark={{ bg: 'yellow.900' }}
          p={4}
          borderRadius="lg"
          border="2px solid"
          borderColor={goldColor}
          animation={`${bounce} 1s ease-in-out 0.4s`}
        >
          <HStack justify="center" spacing={2}>
            <Icon as={FaCoins} color={goldColor} boxSize={6} />
            <Text fontSize="2xl" fontWeight="bold" color={goldColor}>
              +{earnedAmount}
            </Text>
            <Badge colorScheme="yellow" variant="solid" fontSize="sm">
              CRYPTO
            </Badge>
          </HStack>
        </Box>

        {/* Success description */}
        <Text color="gray.600" dark={{ color: 'gray.300' }} fontSize="sm">
          Your crypto balance has been updated!
        </Text>

        {/* Game-specific celebration emoji */}
        <Text fontSize="3xl" animation={`${bounce} 2s ease-in-out infinite`}>
          {gameConfig.emoji}
        </Text>
      </VStack>

      {/* Decorative border animation */}
      <Box
        position="absolute"
        inset={0}
        border="2px solid"
        borderColor={goldColor}
        borderRadius="xl"
        opacity={0.5}
        animation={`${sparkle} 2s ease-in-out infinite`}
        pointerEvents="none"
      />
    </Box>
  );
}