import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

// Rate limit: 60 requests per minute per IP for API routes
const API_RATE_LIMIT = 60;
const API_WINDOW_MS = 60 * 1000;

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only apply rate limiting to /api/* routes
    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Extract client IP from standard reverse proxy headers
    // When behind reverse proxies (Vercel, Cloudflare, AWS), the rightmost IP in X-Forwarded-For
    // or CF-Connecting-IP represents the verified client address.
    const cfIp = request.headers.get('cf-connecting-ip');
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');

    let clientIp: string;
    if (cfIp) {
        clientIp = cfIp.trim();
    } else if (forwardedFor) {
        // Use the first non-empty IP entry from proxy hops
        const hops = forwardedFor.split(',').map((h) => h.trim()).filter(Boolean);
        clientIp = hops[0] || 'unknown-client';
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
