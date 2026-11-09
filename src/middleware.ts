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

    // Extract client IP from standard proxy headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfIp = request.headers.get('cf-connecting-ip');
    const clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || '127.0.0.1';

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
