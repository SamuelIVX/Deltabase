import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

// Rate limit: 60 requests per minute per IP for API routes
const API_RATE_LIMIT = 60;
const API_WINDOW_MS = 60 * 1000;

/**
 * Next.js Edge Middleware for rate limiting and API abuse prevention.
 * Inspects incoming requests to `/api/*` and enforces an IP-based sliding window quota.
 *
 * @param request - Next.js incoming HTTP request
 * @returns 429 response when rate limit exceeded, or passes control via `NextResponse.next()`
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only apply rate limiting to /api/* routes
    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Extract client IP from reverse proxy headers.
    // In standard reverse proxy configurations (e.g. Vercel, Cloudflare, AWS CloudFront),
    // the trusted edge proxy sets cf-connecting-ip or appends the real client IP to the
    // end of the X-Forwarded-For header chain.
    const cfIp = request.headers.get('cf-connecting-ip');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    let clientIp: string;
    if (cfIp) {
        clientIp = cfIp.trim();
    } else if (forwardedFor) {
        // Use the rightmost entry added by the trusted edge proxy hop
        const hops = forwardedFor.split(',').map((h) => h.trim()).filter(Boolean);
        clientIp = hops[hops.length - 1] || 'unknown-client';
    } else if (realIp) {
        clientIp = realIp.trim();
    } else {
        clientIp = 'unknown-client';
    }



    const result = checkRateLimit(clientIp, {
        limit: API_RATE_LIMIT,
        windowMs: API_WINDOW_MS,
    });

    if (!result.success) {
        const retryAfterSec = Math.ceil(Math.max(1, (result.resetAt - Date.now()) / 1000));
        return new NextResponse(
            JSON.stringify({
                error: 'Too many requests. Please slow down.',
                retryAfter: retryAfterSec,
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(retryAfterSec),
                    'X-RateLimit-Limit': String(result.limit),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
                },
            }
        );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));

    return response;
}

export const config = {
    matcher: ['/api/:path*'],
};
