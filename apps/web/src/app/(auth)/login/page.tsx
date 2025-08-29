'use client';

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, Text, useToast } from '@chakra-ui/react';
import { authServiceFrontend } from '@/features/auth/services/authService';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { login: authStoreLogin } = useAuthStore();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const { user, token } = await authServiceFrontend.login(email, password);
      // Create a full User object with default dates
      const fullUser = {
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      authStoreLogin(fullUser, token);
      toast({
        title: 'Login successful.',
        description: 'You have been logged in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (error: any) {
      toast({
        title: 'Login failed.',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading as="h2" size="xl" textAlign="center" mb={6}>Login</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="email" mb={4} isRequired>
          <FormLabel>Email address</FormLabel>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id="password" mb={6} isRequired>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg" width="full" isLoading={isLoading}>
          Login
        </Button>
      </form>
      <Text mt={4} textAlign="center">
        Don't have an account? <Button variant="link" onClick={() => router.push('/register')}>Register</Button>
      </Text>
    </Box>
  );
}
