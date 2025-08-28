'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './page';
import { authServiceFrontend } from '@/features/auth/services/authService';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';

// Mock necessary modules
jest.mock('@/features/auth/services/authService', () => ({
  authServiceFrontend: {
    register: jest.fn(),
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

describe('RegisterPage', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('should render the registration form', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should handle successful registration', async () => {
    (authServiceFrontend.register as jest.Mock).mockResolvedValue({});

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(authServiceFrontend.register).toHaveBeenCalledWith('test@example.com', 'password123', 'testuser');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Registration successful.',
        description: 'You can now log in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle failed registration', async () => {
    const errorMessage = 'User with this email already exists';
    (authServiceFrontend.register as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(authServiceFrontend.register).toHaveBeenCalledWith('existing@example.com', 'password123', 'existinguser');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Registration failed.',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
