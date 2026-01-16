/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter for API protection
 * Note: For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
    /** Maximum requests allowed in the window */
    limit: number;
    /** Time window in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Check rate limit for a given key (usually IP or user ID)
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig = { limit: 10, windowSeconds: 60 }
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries();
    }

    // No existing entry or expired
    if (!entry || entry.resetAt < now) {
        const newEntry: RateLimitEntry = {
            count: 1,
            resetAt: now + config.windowSeconds * 1000
        };
        rateLimitStore.set(key, newEntry);
        return {
            success: true,
            remaining: config.limit - 1,
            resetAt: newEntry.resetAt
        };
    }

    // Increment count
    entry.count++;

    if (entry.count > config.limit) {
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt
        };
    }

    return {
        success: true,
        remaining: config.limit - entry.count,
        resetAt: entry.resetAt
    };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
    return {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString()
    };
}

/**
 * Clean up expired entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
    return (
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        'unknown'
    );
}

// Pre-configured rate limiters for common use cases
export const RATE_LIMITS = {
    // Very strict for expensive AI operations
    AI_API: { limit: 5, windowSeconds: 60 },
    // Standard API calls
    API: { limit: 30, windowSeconds: 60 },
    // Auth attempts (login, register)
    AUTH: { limit: 5, windowSeconds: 300 },
    // Public forms (check-in, booking)
    PUBLIC_FORM: { limit: 10, windowSeconds: 60 }
} as const;
