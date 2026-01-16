import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock Response since we can't easily import actual NextResponse in this env lightly? 
// Actually we can if environment is jsdom and next is installed.
// Validating simple behavior.

// Mock rate limit
vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn(() => ({ success: true })),
    getClientIP: vi.fn(() => '127.0.0.1'),
    RATE_LIMITS: { AUTH: { limit: 5, window: 300 } }
}));

describe('Register API', () => {

    it('should fail with invalid email', async () => {
        const req = new NextRequest('http://localhost/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'invalid-email',
                password: 'Password123!',
                name: 'Test User'
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.error).toBe('Email inválido');
    });

    it('should fail with weak password', async () => {
        const req = new NextRequest('http://localhost/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'valid@example.com',
                password: '123',
                name: 'Test User'
            })
        });

        const res = await POST(req);
        // Note: validation returns 400 with details
        expect(res.status).toBe(400);
    });

    it('should succeed with valid data', async () => {
        const req = new NextRequest('http://localhost/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'newuser@example.com',
                password: 'StrongPassword123!',
                name: 'Dr. Test',
                clinicName: 'Test Clinic'
            })
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
    });
});
