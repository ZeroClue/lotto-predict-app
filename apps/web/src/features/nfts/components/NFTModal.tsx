'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  Divider,
  Box,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGem, FaStar, FaRegStar } from 'react-icons/fa';
import { NFT } from '../../../lib/types';

interface NFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFT | null;
  onFeatureToggle?: (isFeatured: boolean) => void;
  showFeatureButton?: boolean;
}

export default function NFTModal({
  isOpen,
  onClose,
  nft,
  onFeatureToggle,
  showFeatureButton = true,
}: NFTModalProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  if (!nft) {
    return null;
  }

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

  const handleFeatureClick = () => {
    onFeatureToggle?.(!nft.isFeatured);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={cardBg} data-testid="nft-modal">
        <ModalHeader>
          <HStack justify="space-between" align="center">
            <Text>{nft.name}</Text>
            <Badge 
              colorScheme={getRarityColor(nft.rarity)} 
              variant="solid"
              display="flex"
              alignItems="center"
              gap={1}
              px={3}
              py={1}
              fontSize="sm"
            >
              <FaGem size={12} />
              {nft.rarity}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* NFT Image */}
            <Box position="relative" textAlign="center">
              <Image
                src={nft.imageUrl}
                alt={nft.name}
                maxW="100%"
                maxH="400px"
                objectFit="contain"
                borderRadius="lg"
                fallbackSrc="https://via.placeholder.com/400x400?text=NFT+Image"
                margin="0 auto"
              />
              {nft.isFeatured && (
                <Badge 
                  colorScheme="yellow" 
                  position="absolute" 
                  top={4} 
                  left={4}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  fontSize="sm"
                  px={2}
                  py={1}
                >
                  <FaStar size={14} />
                  Featured NFT
                </Badge>
              )}
            </Box>

            {/* NFT Details */}
            <VStack spacing={4} align="stretch">
              {/* Description */}
              {nft.description && (
                <Box>
                  <Text fontSize="lg" color={textColor}>
                    {nft.description}
                  </Text>
                </Box>
              )}

              <Divider />

              {/* Properties Grid */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">Properties</Text>
                
                <Flex wrap="wrap" gap={4}>
                  <Box flex="1" minW="200px">
                    <Text fontSize="sm" color={textColor} mb={1}>Base Value</Text>
                    <Text fontSize="lg" fontWeight="bold" color="yellow.500">
                      {nft.baseValue} crypto
                    </Text>
                  </Box>

                  <Box flex="1" minW="200px">
                    <Text fontSize="sm" color={textColor} mb={1}>Mint Date</Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {new Date(nft.mintDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </Box>

                  <Box flex="1" minW="200px">
                    <Text fontSize="sm" color={textColor} mb={1}>Owner ID</Text>
                    <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
                      {nft.ownerId}
                    </Text>
                  </Box>

                  <Box flex="1" minW="200px">
                    <Text fontSize="sm" color={textColor} mb={1}>NFT ID</Text>
                    <Text fontSize="sm" fontFamily="mono" wordBreak="break-all">
                      {nft.id}
                    </Text>
                  </Box>
                </Flex>

                {/* Dynamic Properties */}
                {nft.dynamicProperties && Object.keys(nft.dynamicProperties).length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" mb={3}>Dynamic Properties</Text>
                      <VStack align="stretch" spacing={2}>
                        {Object.entries(nft.dynamicProperties).map(([key, value]) => (
                          <HStack key={key} justify="space-between">
                            <Text color={textColor} textTransform="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </Text>
                            <Text fontWeight="medium">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </>
                )}
              </VStack>
            </VStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            {showFeatureButton && (
              <Button
                colorScheme="yellow"
                variant={nft.isFeatured ? "solid" : "outline"}
                leftIcon={nft.isFeatured ? <FaStar /> : <FaRegStar />}
                onClick={handleFeatureClick}
              >
                {nft.isFeatured ? 'Remove from Featured' : 'Set as Featured'}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}