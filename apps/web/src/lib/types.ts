export interface User {
  id: string;
  email: string;
  password_hash?: string; // Snake case to match database schema
  username?: string;
  created_at: Date;
  updated_at: Date;
  wallet_address?: string; // Snake case to match database schema
  provider?: 'email' | 'google' | 'facebook' | 'github';
  provider_id?: string; // Snake case to match database schema
}

// Camel case version for frontend use
export interface UserDisplay {
  id: string;
  email: string;
  passwordHash?: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  walletAddress?: string;
  provider?: 'email' | 'google' | 'facebook' | 'github';
  providerId?: string;
}

export interface Game {
  id: string;
  name: string;
  description?: string;
  rewardAmount: number;
  nftAwardThreshold?: number; // e.g., complete 5 times for an NFT
  isActive: boolean;
  imageUrl?: string;
}

export interface CryptoBalance {
  userId: string;
  balance: number;
  updatedAt: Date;
}

export interface NFT {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  imageUrl: string;
  rarity: string;
  mintDate: Date;
  dynamicProperties?: Record<string, any>; // Properties that can change
  isFeatured: boolean;
  baseValue: number; // Intrinsic value in custom cryptocurrency
}
