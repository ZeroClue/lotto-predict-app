import bcrypt from 'bcryptjs';
import { userRepository } from '@/lib/repositories/userRepository';
import { User } from '@/lib/types';

const SALT_ROUNDS = 10;

export const authService = {
  async register(email: string, password: string, username: string): Promise<User> {
    // Check if user with email or username already exists
    const existingUserByEmail = await userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new Error('User with this email already exists');
    }
    const existingUserByUsername = await userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error('User with this username already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await userRepository.create({
      email,
      password_hash: passwordHash,
      username,
    });

    return newUser;
  },

  async login(email: string, password: string): Promise<User> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password_hash) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  },
};
