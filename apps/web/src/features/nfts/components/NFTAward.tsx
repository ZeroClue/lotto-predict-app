'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Image,
  Badge,
  Button,
  useColorModeValue,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaGem, FaStar, FaTimes } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { NFT } from '../../../lib/types';

// Animation keyframes
const sparkle = keyframes`
  0% { opacity: 0; transform: rotate(0deg) scale(0); }
  50% { opacity: 1; transform: rotate(180deg) scale(1); }
  100% { opacity: 0; transform: rotate(360deg) scale(0); }
`;

const bounceIn = keyframes`
  0% { opacity: 0; transform: scale(0.3); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
  50% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.8), 0 0 30px rgba(66, 153, 225, 0.6); }
`;

export interface NFTAwardResult {
  nft: NFT;
  awardReason: string;
}

interface NFTAwardProps {
  isOpen: boolean;
  onClose: () => void;
  awardedNFTs: NFTAwardResult[];
  earnedAmount?: number;
}

export default function NFTAward({ isOpen, onClose, awardedNFTs, earnedAmount }: NFTAwardProps) {
  const [currentNFTIndex, setCurrentNFTIndex] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const overlayBg = useColorModeValue('blackAlpha.700', 'blackAlpha.800');

  useEffect(() => {
    if (isOpen && awardedNFTs.length > 0) {
      setCurrentNFTIndex(0);
      setShowSparkles(true);
      
      // Hide sparkles after animation
      const sparkleTimer = setTimeout(() => {
        setShowSparkles(false);
      }, 2000);

      return () => clearTimeout(sparkleTimer);
    }
  }, [isOpen, awardedNFTs]);

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'gray';
      case 'rare':
        return 'blue';
      case 'legendary':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const handleNext = () => {
    if (currentNFTIndex < awardedNFTs.length - 1) {
      setCurrentNFTIndex(currentNFTIndex + 1);
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);
    } else {
      onClose();
    }
  };

  const handleSkipToEnd = () => {
    onClose();
  };

  if (!isOpen || awardedNFTs.length === 0) {
    return null;
  }

  const currentNFT = awardedNFTs[currentNFTIndex];
  const isLastNFT = currentNFTIndex === awardedNFTs.length - 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay bg={overlayBg} backdropFilter="blur(4px)" />
      <ModalContent
        bg={cardBg}
        animation={`${bounceIn} 0.6s ease-out`}
        position="relative"
        overflow="hidden"
      >
        {/* Sparkle Effects */}
        {showSparkles && (
          <>
            {[...Array(12)].map((_, i) => (
              <Box
                key={i}
                position="absolute"
                top={`${10 + (i * 7)}%`}
                left={`${5 + (i * 8)}%`}
                w="20px"
                h="20px"
                animation={`${sparkle} 1.5s ease-in-out ${i * 0.1}s infinite`}
                zIndex={10}
                pointerEvents="none"
              >
                <Icon as={FaStar} color="yellow.400" />
              </Box>
            ))}
          </>
        )}

        {/* Close button */}
        <Box position="absolute" top={4} right={4} zIndex={20}>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            opacity={0.7}
            _hover={{ opacity: 1 }}
          >
            <FaTimes />
          </Button>
        </Box>

        <ModalBody p={8}>
          <VStack spacing={6} textAlign="center">
            {/* Congratulations Header */}
            <VStack spacing={2}>
              <Heading 
                size="lg" 
                bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
                bgClip="text"
                animation={`${shimmer} 3s ease-in-out infinite`}
                backgroundSize="1000px 100%"
              >
                🎉 NFT Awarded! 🎉
              </Heading>
              {earnedAmount && (
                <Text color="green.500" fontSize="sm" fontWeight="medium">
                  Plus {earnedAmount} crypto earned!
                </Text>
              )}
            </VStack>

            {/* NFT Display */}
            <Box
              position="relative"
              animation={`${glow} 2s ease-in-out infinite`}
              borderRadius="xl"
              overflow="hidden"
            >
              <Image
                src={currentNFT.nft.imageUrl}
                alt={currentNFT.nft.name}
                w="300px"
                h="300px"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/300x300?text=NFT+Image"
                borderRadius="xl"
              />
              
              {/* Rarity Badge */}
              <Badge
                position="absolute"
                top={4}
                left={4}
                colorScheme={getRarityColor(currentNFT.nft.rarity)}
                variant="solid"
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <FaGem size={12} />
                {currentNFT.nft.rarity}
              </Badge>
            </Box>

            {/* NFT Info */}
            <VStack spacing={3}>
              <Heading size="md" color="blue.600">
                {currentNFT.nft.name}
              </Heading>
              
              {currentNFT.nft.description && (
                <Text color="gray.600" textAlign="center" maxW="300px">
                  {currentNFT.nft.description}
                </Text>
              )}

              <Text 
                fontSize="lg" 
                fontWeight="bold"
                color="purple.600"
                textAlign="center"
                maxW="350px"
              >
                {currentNFT.awardReason}
              </Text>

              <HStack spacing={6} pt={2}>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Base Value</Text>
                  <Text fontWeight="bold" color="yellow.600">
                    {currentNFT.nft.baseValue} crypto
                  </Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.500">Minted</Text>
                  <Text fontWeight="bold">
                    {new Date(currentNFT.nft.mintDate).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Progress and Actions */}
            <VStack spacing={4} w="100%">
              {awardedNFTs.length > 1 && (
                <HStack spacing={2}>
                  {awardedNFTs.map((_, index) => (
                    <Box
                      key={index}
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg={index <= currentNFTIndex ? 'blue.500' : 'gray.300'}
                      transition="background-color 0.3s"
                    />
                  ))}
                </HStack>
              )}

              <Flex gap={3} w="100%">
                {awardedNFTs.length > 1 && !isLastNFT && (
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    onClick={handleSkipToEnd}
                    size="sm"
                    flex={1}
                  >
                    Skip ({awardedNFTs.length - currentNFTIndex - 1} more)
                  </Button>
                )}
                
                <Button
                  colorScheme="blue"
                  onClick={isLastNFT ? onClose : handleNext}
                  size="lg"
                  flex={1}
                  leftIcon={isLastNFT ? <FaStar /> : undefined}
                >
                  {isLastNFT ? 'Awesome!' : `Next (${awardedNFTs.length - currentNFTIndex - 1} more)`}
                </Button>
              </Flex>

              {currentNFTIndex === 0 && (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Check your collection to view all your NFTs!
                </Text>
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}