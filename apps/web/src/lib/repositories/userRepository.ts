import { db } from '@/lib/db'; // Assuming you have a Supabase client initialized as `db`
import { User } from '@/lib/types'; // Assuming a User interface is defined

export const userRepository = {
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await db.from('users').insert(user).select().single();
    if (error) throw new Error(error.message);
    return data as User;
  },

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await db.from('users').select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message); // PGRST116 means no rows found
    return data as User | null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await db.from('users').select('*').eq('username', username).single();
    if (error && error.code !== 'PGRST116') throw new Error(error.message); // PGRST116 means no rows found
    return data as User | null;
  },
};
