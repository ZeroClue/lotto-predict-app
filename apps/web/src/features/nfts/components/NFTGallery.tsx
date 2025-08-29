'use client';

import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Select,
  Icon,
  Button,
  Center,
  Spinner,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { FaGem, FaFilter } from 'react-icons/fa';
import { useState } from 'react';
import { NFT } from '../../../lib/types';
import NFTCard from './NFTCard';
import NFTModal from './NFTModal';
import { nftClientService } from '../services/nftService';

interface NFTGalleryProps {
  nfts: NFT[];
  isLoading?: boolean;
  error?: string | null;
  onFeatureToggle?: (nftId: string, isFeatured: boolean) => Promise<void>;
  onRetry?: () => void;
  showControls?: boolean;
  isCompact?: boolean;
  maxItems?: number;
}

export default function NFTGallery({
  nfts = [],
  isLoading = false,
  error = null,
  onFeatureToggle,
  onRetry,
  showControls = true,
  isCompact = false,
  maxItems,
}: NFTGalleryProps) {
  const [sortBy, setSortBy] = useState<'mintDate' | 'rarity' | 'name' | 'baseValue'>('mintDate');
  const [filterBy, setFilterBy] = useState<'all' | 'featured' | string>('all');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const textColor = useColorModeValue('gray.600', 'gray.300');

  const getSortedAndFilteredNFTs = () => {
    let filtered = nfts;

    // Apply filters
    if (filterBy === 'featured') {
      filtered = nftClientService.getFeaturedNFTs(nfts);
    } else if (filterBy !== 'all') {
      filtered = nftClientService.filterNFTsByRarity(nfts, filterBy);
    }

    // Apply sorting
    const sorted = nftClientService.sortNFTs(filtered, sortBy);
    
    // Apply max items limit if specified
    return maxItems ? sorted.slice(0, maxItems) : sorted;
  };

  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const handleFeatureToggle = async (nft: NFT, isFeatured: boolean) => {
    if (onFeatureToggle) {
      await onFeatureToggle(nft.id, isFeatured);
      // Update selected NFT if it's the one being toggled
      if (selectedNFT?.id === nft.id) {
        setSelectedNFT({ ...nft, isFeatured });
      }
    }
  };

  const handleModalFeatureToggle = async (isFeatured: boolean) => {
    if (selectedNFT && onFeatureToggle) {
      await onFeatureToggle(selectedNFT.id, isFeatured);
      setSelectedNFT({ ...selectedNFT, isFeatured });
    }
  };

  const uniqueRarities = Array.from(new Set(nfts.map(nft => nft.rarity)));
  const displayedNFTs = getSortedAndFilteredNFTs();

  if (isLoading) {
    return (
      <Center h="200px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading NFTs...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="red.500" mb={4}>Error: {error}</Text>
        {onRetry && (
          <Button colorScheme="blue" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Box>
    );
  }

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Controls */}
        {showControls && nfts.length > 0 && (
          <Flex gap={4} wrap="wrap" align="center">
            <HStack>
              <Icon as={FaFilter} color={textColor} />
              <Text fontSize="sm" color={textColor}>Sort by:</Text>
              <Select 
                size="sm" 
                w="140px" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                data-testid="sort-select"
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
                data-testid="filter-select"
              >
                <option value="all">All ({nfts.length})</option>
                <option value="featured">Featured ({nftClientService.getFeaturedNFTs(nfts).length})</option>
                {uniqueRarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity} ({nftClientService.filterNFTsByRarity(nfts, rarity).length})
                  </option>
                ))}
              </Select>
            </HStack>

            {maxItems && displayedNFTs.length >= maxItems && (
              <Text fontSize="sm" color={textColor}>
                Showing {maxItems} of {getSortedAndFilteredNFTs().length} NFTs
              </Text>
            )}
          </Flex>
        )}

        {/* NFT Grid */}
        <Grid 
          templateColumns={`repeat(auto-fill, minmax(${isCompact ? '240px' : '280px'}, 1fr))`} 
          gap={6}
        >
          {displayedNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              onFeatureToggle={(isFeatured) => handleFeatureToggle(nft, isFeatured)}
              onDetailsClick={() => handleNFTClick(nft)}
              showFeatureButton={!!onFeatureToggle}
              isCompact={isCompact}
            />
          ))}
        </Grid>

        {/* Empty State */}
        {nfts.length === 0 && (
          <Box textAlign="center" py={12}>
            <VStack spacing={4}>
              <Icon as={FaGem} boxSize={12} color={textColor} />
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>No NFTs Yet</Text>
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
        {nfts.length > 0 && displayedNFTs.length === 0 && (
          <Box textAlign="center" py={8}>
            <Text color={textColor} mb={2}>No NFTs match the current filter.</Text>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setFilterBy('all')}
            >
              Show All NFTs
            </Button>
          </Box>
        )}
      </VStack>

      {/* NFT Details Modal */}
      <NFTModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nft={selectedNFT}
        onFeatureToggle={handleModalFeatureToggle}
        showFeatureButton={!!onFeatureToggle}
      />
    </>
  );
}