'use client';

import {
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  Badge,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGem, FaStar, FaRegStar } from 'react-icons/fa';
import { NFT } from '../../../lib/types';

interface NFTCardProps {
  nft: NFT;
  onFeatureToggle?: (isFeatured: boolean) => void;
  onDetailsClick?: () => void;
  showFeatureButton?: boolean;
  isCompact?: boolean;
}

export default function NFTCard({
  nft,
  onFeatureToggle,
  onDetailsClick,
  showFeatureButton = true,
  isCompact = false,
}: NFTCardProps) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

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
    <Card 
      bg={cardBg} 
      shadow="md" 
      _hover={{ 
        shadow: 'lg', 
        transform: 'translateY(-2px)',
        cursor: onDetailsClick ? 'pointer' : 'default'
      }} 
      transition="all 0.2s"
      onClick={onDetailsClick}
      data-testid="nft-card"
    >
      <CardBody>
        <VStack spacing={isCompact ? 3 : 4} align="stretch">
          {/* NFT Image */}
          <div style={{ position: 'relative' }}>
            <Image
              src={nft.imageUrl}
              alt={nft.name}
              w="100%"
              h={isCompact ? "150px" : "200px"}
              objectFit="cover"
              borderRadius="md"
              fallbackSrc="https://via.placeholder.com/280x200?text=NFT+Image"
            />
            {nft.isFeatured && (
              <Badge 
                colorScheme="yellow" 
                position="absolute" 
                top={2} 
                left={2}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <FaStar size={12} />
                Featured
              </Badge>
            )}
          </div>

          {/* NFT Info */}
          <VStack spacing={isCompact ? 2 : 3} align="stretch">
            <HStack justify="space-between" align="start">
              <VStack spacing={1} align="start" flex={1}>
                <Heading size={isCompact ? "sm" : "md"} noOfLines={1}>
                  {nft.name}
                </Heading>
                {!isCompact && nft.description && (
                  <Text color={textColor} fontSize="sm" noOfLines={2}>
                    {nft.description}
                  </Text>
                )}
              </VStack>
              <Badge 
                colorScheme={getRarityColor(nft.rarity)} 
                variant="solid"
                display="flex"
                alignItems="center"
                gap={1}
                flexShrink={0}
              >
                <FaGem size={10} />
                {nft.rarity}
              </Badge>
            </HStack>

            {/* Details Row */}
            <HStack justify="space-between" fontSize="sm">
              <Text color={textColor}>
                Value: {nft.baseValue} crypto
              </Text>
              {!isCompact && (
                <Text color={textColor}>
                  {new Date(nft.mintDate).toLocaleDateString()}
                </Text>
              )}
            </HStack>

            {/* Action Button */}
            {showFeatureButton && (
              <Button
                size="sm"
                variant={nft.isFeatured ? "solid" : "outline"}
                colorScheme="yellow"
                leftIcon={nft.isFeatured ? <FaStar /> : <FaRegStar />}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click when clicking button
                  handleFeatureClick();
                }}
              >
                {nft.isFeatured ? 'Featured' : 'Set Featured'}
              </Button>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}