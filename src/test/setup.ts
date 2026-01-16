import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock for ResizeObserver which is not available in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
            limit: vi.fn().mockReturnThis(), // Added limit support
        })),
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        }
    }
}))

// Mock @supabase/supabase-js for Server-Side calls
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            admin: {
                createUser: vi.fn().mockResolvedValue({
                    data: { user: { id: 'test-user-id', email: 'test@example.com' } },
                    error: null
                }),
            }
        },
        from: vi.fn(() => ({
            insert: vi.fn().mockResolvedValue({ error: null }),
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(), // Added update support
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { id: 'test-tenant-id' }, error: null }),
        })),
    }))
}))
