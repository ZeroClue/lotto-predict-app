import { middleware } from './middleware';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

describe('Middleware', () => {
  it('should redirect unauthenticated user from protected route to /login', () => {
    const req = new NextRequest('http://localhost/dashboard');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/login');
  });

  it('should redirect authenticated user from auth route to /dashboard', () => {
    const req = new NextRequest('http://localhost/login');
    req.cookies.set('token', 'test-token');
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('should allow authenticated user to access protected route', () => {
    const req = new NextRequest('http://localhost/dashboard');
    req.cookies.set('token', 'test-token');
    const res = middleware(req);
    if (res) {
        expect(res.status).not.toBe(307);
    } else {
        expect(res).toBe(NextResponse.next());
    }
  });

  it('should allow unauthenticated user to access auth route', () => {
    const req = new NextRequest('http://localhost/login');
    const res = middleware(req);
    if (res) {
        expect(res.status).not.toBe(307);
    } else {
        expect(res).toBe(NextResponse.next());
    }
  });

  it('should allow access to public routes for everyone', () => {
    const req = new NextRequest('http://localhost/');
    let res = middleware(req);
    if (res) {
        expect(res.status).not.toBe(307);
    } else {
        expect(res).toBe(NextResponse.next());
    }

    req.cookies.set('token', 'test-token');
    res = middleware(req);
    if (res) {
        expect(res.status).not.toBe(307);
    } else {
        expect(res).toBe(NextResponse.next());
    }
  });
});