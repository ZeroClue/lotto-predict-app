import { POST } from './route';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Mock Supabase Auth Helpers
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
    },
  })),
}));

// Mock next/headers cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
    })),
  },
}));

describe('POST /api/auth/register', () => {
  const mockSignUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (createRouteHandlerClient as jest.Mock).mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    });
  });

  it('should register a user successfully', async () => {
    const mockUser = { id: '123', email: 'test@example.com', user_metadata: { username: 'testuser' } };
    const mockToken = 'mock-access-token';
    mockSignUp.mockResolvedValue({
      data: { user: mockUser, session: { access_token: mockToken } },
      error: null,
    });

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', username: 'testuser' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('User registered successfully');
    expect(data.user).toEqual({ id: mockUser.id, email: mockUser.email, username: mockUser.user_metadata.username });
    expect(data.token).toBe(mockToken);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: { username: 'testuser' },
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }), // Missing username
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Missing required fields');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('should return 400 if registration fails (e.g., email already exists)', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User with this email already exists' },
    });

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'existing@example.com', password: 'password123', username: 'testuser' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('User with this email already exists');
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'existing@example.com',
      password: 'password123',
      options: {
        data: { username: 'testuser' },
      },
    });
  });

  it('should return 500 for internal server errors', async () => {
    mockSignUp.mockRejectedValue(new Error('Something went wrong'));

    const request = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123', username: 'testuser' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Internal server error');
    expect(mockSignUp).toHaveBeenCalled();
  });
});
