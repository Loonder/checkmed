import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookPublicAppointment } from './actions';

// Mock dependencies
vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({ // tenant query
                    single: vi.fn(() => ({ data: { id: 'tenant-123', name: 'Test Clinic' } }))
                })),
                neq: vi.fn(() => ({
                    lt: vi.fn(() => ({
                        gt: vi.fn(() => ({ data: [] })) // no conflicts
                    }))
                }))
            })),
            insert: vi.fn(() => ({ error: null }))
        }))
    }))
}));

vi.mock("next/headers", () => ({
    headers: vi.fn(() => ({
        get: vi.fn(() => "127.0.0.1")
    }))
}));

describe('Security: bookPublicAppointment', () => {
    it('Should block appointments in the past', async () => {
        const pastDate = "2020-01-01";
        const result = await bookPublicAppointment(
            "test-clinic",
            "presencial",
            pastDate,
            "10:00",
            { name: "Attacker", phone: "11999999999" }
        );

        // Expectation: Should fail, but logic currently allows it (so this test might fail to pass, revealing vuln)
        expect(result).toHaveProperty('error');
        expect(result.error).toMatch(/passado/i);
    });

    it('Should block invalid phone numbers', async () => {
        const result = await bookPublicAppointment(
            "test-clinic",
            "presencial",
            "2026-01-01",
            "10:00",
            { name: "Attacker", phone: "123" } // Too short
        );
        expect(result).toHaveProperty('error', "Telefone inválido.");
    });
});
