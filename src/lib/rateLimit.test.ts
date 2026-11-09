import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, resetRateLimitStore, getRateLimitStoreSize } from '@/lib/rateLimit';

describe('Rate Limiter (in-memory sliding window)', () => {
    beforeEach(() => {
        resetRateLimitStore();
        vi.useRealTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });


    it('allows requests within the limit', () => {
        const clientIp = '192.168.1.1';
        const res1 = checkRateLimit(clientIp, { limit: 5, windowMs: 10000 });
        expect(res1.success).toBe(true);
        expect(res1.remaining).toBe(4);
        expect(res1.limit).toBe(5);

        const res2 = checkRateLimit(clientIp, { limit: 5, windowMs: 10000 });
        expect(res2.success).toBe(true);
        expect(res2.remaining).toBe(3);
    });

    it('blocks requests once limit is exceeded', () => {
        const clientIp = '10.0.0.1';
        for (let i = 0; i < 3; i++) {
            const res = checkRateLimit(clientIp, { limit: 3, windowMs: 10000 });
            expect(res.success).toBe(true);
        }

        // 4th request should be blocked
        const blocked = checkRateLimit(clientIp, { limit: 3, windowMs: 10000 });
        expect(blocked.success).toBe(false);
        expect(blocked.remaining).toBe(0);
    });

    it('tracks different clients independently', () => {
        const ipA = '10.0.0.1';
        const ipB = '10.0.0.2';

        for (let i = 0; i < 2; i++) {
            checkRateLimit(ipA, { limit: 2, windowMs: 10000 });
        }
        expect(checkRateLimit(ipA, { limit: 2, windowMs: 10000 }).success).toBe(false);

        // ipB should still have quota
        expect(checkRateLimit(ipB, { limit: 2, windowMs: 10000 }).success).toBe(true);
    });

    it('resets quota after window expires', () => {
        vi.useFakeTimers();
        const clientIp = '172.16.0.1';

        checkRateLimit(clientIp, { limit: 1, windowMs: 1000 });
        expect(checkRateLimit(clientIp, { limit: 1, windowMs: 1000 }).success).toBe(false);

        // Advance timer past window
        vi.advanceTimersByTime(1001);

        const afterReset = checkRateLimit(clientIp, { limit: 1, windowMs: 1000 });
        expect(afterReset.success).toBe(true);
        expect(afterReset.remaining).toBe(0);
    });

    it('purges expired entries during cleanup intervals', () => {
        vi.useFakeTimers();
        const ip1 = '192.168.1.100';
        const ip2 = '192.168.1.101';

        // Add entries with short window
        checkRateLimit(ip1, { limit: 10, windowMs: 5000 });
        checkRateLimit(ip2, { limit: 10, windowMs: 5000 });

        // Advance time past CLEANUP_INTERVAL_MS (60s)
        vi.advanceTimersByTime(65000);

        // Next request triggers purgeExpiredRecords()
        const res = checkRateLimit('192.168.1.102', { limit: 10, windowMs: 5000 });
        expect(res.success).toBe(true);
        expect(res.remaining).toBe(9);
    });

    it('evicts excess entries when store capacity is reached', () => {
        // Fill store with many records
        for (let i = 0; i < 10050; i++) {
            checkRateLimit(`test-ip-${i}`, { limit: 5, windowMs: 300000 });
        }

        // Trigger store purge at capacity
        const extra = checkRateLimit('trigger-eviction-ip', { limit: 5, windowMs: 300000 });
        expect(extra.success).toBe(true);
        expect(getRateLimitStoreSize()).toBeLessThan(10000);
    });
});
