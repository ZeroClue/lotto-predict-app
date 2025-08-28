import { userRepository } from './userRepository';

// Mock the db module completely
jest.mock('@/lib/db', () => {
  const mockSingle = jest.fn();
  const mockEq = jest.fn(() => ({ single: mockSingle }));
  const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
  const mockInsert = jest.fn(() => ({ select: mockSelect }));
  const mockFrom = jest.fn(() => ({ insert: mockInsert, select: mockSelect }));
  
  return {
    db: { from: mockFrom }
  };
});

import { db } from '@/lib/db';

const mockDb = db as jest.Mocked<typeof db>;
const mockFrom = mockDb.from as jest.MockedFunction<any>;

describe('userRepository', () => {
  let mockSingle: jest.MockedFunction<any>;
  let mockSelect: jest.MockedFunction<any>;
  let mockInsert: jest.MockedFunction<any>;
  let mockEq: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock chain for each test
    mockSingle = jest.fn();
    mockEq = jest.fn(() => ({ single: mockSingle }));
    mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle }));
    mockInsert = jest.fn(() => ({ select: mockSelect }));
    mockFrom.mockReturnValue({ insert: mockInsert, select: mockSelect });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockNewUser = { email: 'new@example.com', password_hash: 'hashedpassword', username: 'newuser' };
      const mockCreatedUser = { id: 'user1', created_at: new Date(), updated_at: new Date(), ...mockNewUser };

      mockSingle.mockResolvedValue({ data: mockCreatedUser, error: null });

      const user = await userRepository.create(mockNewUser);

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalledWith(mockNewUser);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
      expect(user).toEqual(mockCreatedUser);
    });

    it('should throw an error if user creation fails', async () => {
      const mockNewUser = { email: 'fail@example.com', password_hash: 'hashedpassword', username: 'failuser' };
      const mockError = { message: 'Database error' };

      mockSingle.mockResolvedValue({ data: null, error: mockError });

      await expect(userRepository.create(mockNewUser)).rejects.toThrow('Database error');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalledWith(mockNewUser);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockSingle).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = { id: 'user1', email: 'test@example.com', username: 'testuser', password_hash: 'hashedpassword' };

      mockSingle.mockResolvedValue({ data: mockUser, error: null });

      const user = await userRepository.findByEmail('test@example.com');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('email', 'test@example.com');
      expect(mockSingle).toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });

    it('should return null if user not found by email', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const user = await userRepository.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('email', 'nonexistent@example.com');
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should throw an error if find by email fails (not PGRST116)', async () => {
      const mockError = { message: 'Database error', code: 'OTHER_ERROR' };

      mockSingle.mockResolvedValue({ data: null, error: mockError });

      await expect(userRepository.findByEmail('fail@example.com')).rejects.toThrow('Database error');
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('email', 'fail@example.com');
      expect(mockSingle).toHaveBeenCalled();
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      const mockUser = { id: 'user2', email: 'user2@example.com', username: 'testuser2', password_hash: 'hashedpassword2' };

      mockSingle.mockResolvedValue({ data: mockUser, error: null });

      const user = await userRepository.findByUsername('testuser2');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('username', 'testuser2');
      expect(mockSingle).toHaveBeenCalled();
      expect(user).toEqual(mockUser);
    });

    it('should return null if user not found by username', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const user = await userRepository.findByUsername('nonexistentuser');

      expect(user).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('username', 'nonexistentuser');
      expect(mockSingle).toHaveBeenCalled();
    });

    it('should throw an error if find by username fails (not PGRST116)', async () => {
      const mockError = { message: 'Database error', code: 'OTHER_ERROR' };

      mockSingle.mockResolvedValue({ data: null, error: mockError });

      await expect(userRepository.findByUsername('failuser')).rejects.toThrow('Database error');
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('username', 'failuser');
      expect(mockSingle).toHaveBeenCalled();
    });
  });
});