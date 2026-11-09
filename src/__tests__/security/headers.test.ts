import { describe, it, expect } from 'vitest';
import nextConfig from '../../../next.config';

describe('next.config.ts security headers', () => {
    it('defines security headers on all routes', async () => {
        expect(nextConfig.headers).toBeDefined();
        const headerConfigs = await nextConfig.headers!();
        expect(headerConfigs.length).toBeGreaterThan(0);

        const globalHeaders = headerConfigs.find((cfg) => cfg.source === '/(.*)');
        expect(globalHeaders).toBeDefined();

        const headerMap = Object.fromEntries(
            globalHeaders!.headers.map((h) => [h.key, h.value])
        );

        expect(headerMap['X-Content-Type-Options']).toBe('nosniff');
        expect(headerMap['X-Frame-Options']).toBe('DENY');
        expect(headerMap['X-XSS-Protection']).toBe('1; mode=block');
        expect(headerMap['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
        expect(headerMap['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains');
        expect(headerMap['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()');
        expect(headerMap['Content-Security-Policy']).toBeDefined();
        expect(headerMap['Content-Security-Policy']).toContain("default-src 'self'");
    });
});
