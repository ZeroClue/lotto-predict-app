import { authService } from './authService';
import { userRepository } from '@/lib/repositories/userRepository';
import bcrypt from 'bcryptjs';

// Mock userRepository and bcryptjs
jest.mock('@/lib/repositories/userRepository', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const username = 'testuser';
      const hashedPassword = 'hashedpassword';
      const mockUser = { id: '1', email, username, password_hash: hashedPassword };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.findByUsername as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const user = await authService.register(email, password, username);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email,
        password_hash: hashedPassword,
        username,
      });
      expect(user).toEqual(mockUser);
    });

    it('should throw an error if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const username = 'testuser';

      (userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: '1', email, username });

      await expect(authService.register(email, password, username)).rejects.toThrow('User with this email already exists');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.findByUsername).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if username already exists', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const username = 'existinguser';

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.findByUsername as jest.Mock).mockResolvedValue({ id: '1', email, username });

      await expect(authService.register(email, password, username)).rejects.toThrow('User with this username already exists');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedpassword';
      const mockUser = { id: '1', email, username: 'testuser', password_hash: hashedPassword };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const user = await authService.login(email, password);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(user).toEqual(mockUser);
    });

    it('should throw an error for invalid credentials (user not found)', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw an error for invalid credentials (wrong password)', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const hashedPassword = 'hashedpassword';
      const mockUser = { id: '1', email, username: 'testuser', password_hash: hashedPassword };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should throw an error if user has no password hash (e.g., social login)', async () => {
      const email = 'social@example.com';
      const password = 'password123';
      const mockUser = { id: '1', email, username: 'socialuser', password_hash: undefined };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });
});
