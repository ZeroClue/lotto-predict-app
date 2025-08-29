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
  Image,
  Icon,
  Select,
  useColorModeValue,
  Flex,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { FaGem, FaStar, FaRegStar, FaFilter } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { NFT } from '../../../../lib/types';
import { useNFTStore } from '../../../../stores/nftStore';
import { nftClientService } from '../../../../features/nfts/services/nftService';

export default function NFTGalleryPage() {
  const [sortBy, setSortBy] = useState<'mintDate' | 'rarity' | 'name' | 'baseValue'>('mintDate');
  const [filterBy, setFilterBy] = useState<'all' | 'featured' | string>('all');

  const {
    nfts,
    isLoadingNFTs: loading,
    nftsError: error,
    fetchNFTs,
    setNFTFeatured,
  } = useNFTStore();

  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    if (nfts.length === 0 && !loading && !error) {
      fetchNFTs().catch(console.error);
    }
  }, [nfts.length, loading, error, fetchNFTs]);

  const handleFeatureToggle = async (nftId: string, isFeatured: boolean) => {
    try {
      await setNFTFeatured(nftId, isFeatured);
    } catch (err) {
      console.error('Error updating NFT featured status:', err);
    }
  };

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

  const getSortedAndFilteredNFTs = () => {
    let filtered = nfts;

    // Apply filters
    if (filterBy === 'featured') {
      filtered = nftClientService.getFeaturedNFTs(nfts);
    } else if (filterBy !== 'all') {
      filtered = nftClientService.filterNFTsByRarity(nfts, filterBy);
    }

    // Apply sorting
    return nftClientService.sortNFTs(filtered, sortBy);
  };

  const uniqueRarities = Array.from(new Set(nfts.map(nft => nft.rarity)));

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading your NFT collection...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={6}>
          💎 NFT Gallery
        </Heading>
        <Text color="red.500">Error: {error}</Text>
        <Button mt={4} onClick={() => fetchNFTs().catch(console.error)}>
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
            💎 NFT Gallery
          </Heading>
          <Text color={textColor}>
            Your collection of unique digital assets earned through gameplay.
          </Text>
        </Box>

        {/* Controls */}
        {nfts.length > 0 && (
          <Flex gap={4} wrap="wrap" align="center">
            <HStack>
              <Icon as={FaFilter} color={textColor} />
              <Text fontSize="sm" color={textColor}>Sort by:</Text>
              <Select 
                size="sm" 
                w="140px" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="mintDate">Date Added</option>
                <option value="rarity">Rarity</option>
                <option value="name">Name</option>
                <option value="baseValue">Value</option>
              </Select>
            </HStack>

            <HStack>
              <Text fontSize="sm" color={textColor}>Filter:</Text>
              <Select 
                size="sm" 
                w="120px" 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="all">All ({nfts.length})</option>
                <option value="featured">Featured ({nfts.filter(n => n.isFeatured).length})</option>
                {uniqueRarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity} ({nfts.filter(n => n.rarity === rarity).length})
                  </option>
                ))}
              </Select>
            </HStack>
          </Flex>
        )}

        {/* NFT Grid */}
        <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6}>
          {getSortedAndFilteredNFTs().map((nft) => (
            <Card key={nft.id} bg={cardBg} shadow="md" _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.2s">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* NFT Image */}
                  <Box position="relative">
                    <Image
                      src={nft.imageUrl}
                      alt={nft.name}
                      w="100%"
                      h="200px"
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
                  </Box>

                  {/* NFT Info */}
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between" align="start">
                      <VStack spacing={1} align="start">
                        <Heading size="md" noOfLines={1}>{nft.name}</Heading>
                        {nft.description && (
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
                      >
                        <FaGem size={10} />
                        {nft.rarity}
                      </Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm" color={textColor}>
                        Value: {nft.baseValue} crypto
                      </Text>
                      <Text fontSize="sm" color={textColor}>
                        {new Date(nft.mintDate).toLocaleDateString()}
                      </Text>
                    </HStack>

                    {/* Feature Toggle */}
                    <Button
                      size="sm"
                      variant={nft.isFeatured ? "solid" : "outline"}
                      colorScheme="yellow"
                      leftIcon={nft.isFeatured ? <FaStar /> : <FaRegStar />}
                      onClick={() => handleFeatureToggle(nft.id, !nft.isFeatured)}
                    >
                      {nft.isFeatured ? 'Remove from Featured' : 'Set as Featured'}
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>

        {/* Empty State */}
        {nfts.length === 0 && (
          <Box textAlign="center" py={12}>
            <VStack spacing={4}>
              <Icon as={FaGem} size={50} color={textColor} />
              <Heading size="md" color={textColor}>No NFTs Yet</Heading>
              <Text color={textColor}>
                Start playing games to earn your first NFTs!
              </Text>
              <Button colorScheme="blue" as="a" href="/games">
                Play Games
              </Button>
            </VStack>
          </Box>
        )}

        {/* Filtered Results Empty */}
        {nfts.length > 0 && getSortedAndFilteredNFTs().length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color={textColor}>No NFTs match the current filter.</Text>
            <Button 
              mt={2} 
              size="sm" 
              variant="outline" 
              onClick={() => setFilterBy('all')}
            >
              Show All NFTs
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
}