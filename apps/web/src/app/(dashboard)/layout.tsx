'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Container, Text, Button, VStack, HStack, Badge, Icon } from '@chakra-ui/react';
import { FaCoins, FaGem } from 'react-icons/fa';
import Link from 'next/link';
import { useAuthStore } from '../../stores/authStore';
import { useCryptoStore } from '../../stores/cryptoStore';
import { useNFTStore } from '../../stores/nftStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { balance, fetchBalance } = useCryptoStore();
  const { nfts, fetchNFTs } = useNFTStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && !balance && isAuthenticated) {
      fetchBalance().catch(console.error);
    }
  }, [user, balance, isAuthenticated, fetchBalance]);

  useEffect(() => {
    if (user && nfts.length === 0 && isAuthenticated) {
      fetchNFTs().catch(console.error);
    }
  }, [user, nfts.length, isAuthenticated, fetchNFTs]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <Flex justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              LottoPredict
            </Text>
            <HStack spacing={6}>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/predictions">
                <Button variant="ghost" size="sm">
                  Predictions
                </Button>
              </Link>
              <Link href="/games">
                <Button variant="ghost" size="sm">
                  Games
                </Button>
              </Link>
              <Link href="/collection/nfts">
                <Button variant="ghost" size="sm">
                  Collection
                </Button>
              </Link>
              <HStack spacing={4}>
                {balance && (
                  <HStack spacing={1} px={2} data-testid="crypto-balance">
                    <Icon as={FaCoins} color="yellow.500" />
                    <Badge colorScheme="yellow" variant="solid">
                      {balance.balance.toFixed(1)}
                    </Badge>
                  </HStack>
                )}
                {nfts.length > 0 && (
                  <HStack spacing={1} px={2} data-testid="nft-count-badge">
                    <Icon as={FaGem} color="purple.500" />
                    <Badge colorScheme="purple" variant="solid">
                      {nfts.length}
                    </Badge>
                  </HStack>
                )}
              </HStack>
              <Button onClick={handleLogout} size="sm" colorScheme="red" variant="outline">
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        {children}
      </Container>
    </Box>
  );
}