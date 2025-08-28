'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { authServiceFrontend } from '@/features/auth/services/authService';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';

// Mock necessary modules
jest.mock('@/features/auth/services/authService', () => ({
  authServiceFrontend: {
    login: jest.fn(),
  },
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: jest.fn(),
}));

describe('LoginPage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('should render the login form', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    (authServiceFrontend.login as jest.Mock).mockResolvedValue({});

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authServiceFrontend.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login successful.',
        description: 'You have been logged in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should handle failed login', async () => {
    const errorMessage = 'Invalid credentials';
    (authServiceFrontend.login as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authServiceFrontend.login).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login failed.',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
