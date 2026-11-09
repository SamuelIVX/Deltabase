/**
 * Fixed-window in-memory rate limiter per process instance.
 * Designed for Next.js API middleware and serverless edge execution.
 * Note: Requests may reach up to twice the configured limit across window boundaries,
 * and quotas are maintained per serverless instance (not globally shared).
 */

interface RateLimitRecord {

    count: number;
    resetAt: number;
}

// In-memory store keyed by IP or identifier
const ipRequestStore = new Map<string, RateLimitRecord>();

// Maximum distinct IPs in memory at any one time to prevent memory exhaustion (DoS)
const MAX_STORE_ENTRIES = 10000;

// Cleanup stale records periodically to prevent memory bloat
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredRecords(): void {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL_MS && ipRequestStore.size < MAX_STORE_ENTRIES) return;
    lastCleanup = now;

    for (const [key, record] of ipRequestStore.entries()) {
        if (record.resetAt <= now) {
            ipRequestStore.delete(key);
        }
    }

    // If still at capacity, evict oldest entries
    if (ipRequestStore.size >= MAX_STORE_ENTRIES) {
        const excess = ipRequestStore.size - Math.floor(MAX_STORE_ENTRIES * 0.8);
        let deleted = 0;
        for (const key of ipRequestStore.keys()) {
            if (deleted >= excess) break;
            ipRequestStore.delete(key);
            deleted++;
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
        // Delete before set to refresh Map insertion order (LRU eviction favor)
        if (existing) {
            ipRequestStore.delete(identifier);
        }
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
 * Returns the current count of active keys in the rate limit store. Primarily for testing.
 */
export function getRateLimitStoreSize(): number {
    return ipRequestStore.size;
}

/**
 * Resets the in-memory rate limit store. Primarily for testing purposes.
 */
export function resetRateLimitStore(): void {
    ipRequestStore.clear();
}
