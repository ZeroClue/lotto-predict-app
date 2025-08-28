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
