/**
 * Zero-dependency sliding-window in-memory rate limiter.
 * Designed for Next.js API middleware and serverless edge execution.
 */

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

// In-memory store keyed by IP or identifier
const ipRequestStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically to prevent memory bloat
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredRecords(): void {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
    lastCleanup = now;

    for (const [key, record] of ipRequestStore.entries()) {
        if (record.resetAt <= now) {
            ipRequestStore.delete(key);
        }
    }
}

export interface RateLimitOptions {
    /** Maximum allowed requests within the time window. Default: 60 */
    limit?: number;
    /** Window duration in milliseconds. Default: 60,000 (1 minute) */
    windowMs?: number;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
}

/**
 * Checks and increments the rate limit counter for a given client identifier (e.g. IP address).
 * @param identifier - Unique client identifier (IP address, token, etc.)
 * @param options - Configuration overrides for limit and window
 * @returns RateLimitResult with success flag, remaining quota, and reset timestamp
 */
export function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = {}
): RateLimitResult {
    purgeExpiredRecords();

    const limit = options.limit ?? 60;
    const windowMs = options.windowMs ?? 60 * 1000;
    const now = Date.now();

    const existing = ipRequestStore.get(identifier);

    if (!existing || existing.resetAt <= now) {
        // First request or window expired
        const newRecord: RateLimitRecord = {
            count: 1,
            resetAt: now + windowMs,
        };
        ipRequestStore.set(identifier, newRecord);
        return {
            success: true,
            limit,
            remaining: limit - 1,
            resetAt: newRecord.resetAt,
        };
    }

    if (existing.count >= limit) {
        return {
            success: false,
            limit,
            remaining: 0,
            resetAt: existing.resetAt,
        };
    }

    existing.count += 1;
    return {
        success: true,
        limit,
        remaining: limit - existing.count,
        resetAt: existing.resetAt,
    };
}

/**
 * Resets the in-memory rate limit store. Primarily for testing purposes.
 */
export function resetRateLimitStore(): void {
    ipRequestStore.clear();
}
