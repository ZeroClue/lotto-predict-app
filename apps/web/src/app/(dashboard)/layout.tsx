'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Container, Text, Button, VStack, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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