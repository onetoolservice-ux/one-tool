import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClientIP, checkRateLimit, type RateLimitConfig } from '@/app/lib/utils/rate-limit';

/**
 * Rate limit configuration
 * 
 * NOTE: In-memory rate limiting is for development only.
 * For production deployments (especially multi-instance), use Redis-based rate limiting:
 * - Upstash Redis (recommended for Vercel)
 * - Vercel KV
 * - Custom Redis instance
 */
const RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 auth requests per minute
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get client IP safely (prevents IP spoofing)
  const ip = getClientIP(request);
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/auth/');

  // Rate limiting with appropriate config
  const rateLimitConfig = isAuthRoute ? AUTH_RATE_LIMIT : RATE_LIMIT;
  const rateLimit = checkRateLimit(ip, path, rateLimitConfig);
  
  if (!rateLimit.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetTime: rateLimit.resetTime,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(rateLimitConfig.maxRequests),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetTime),
        },
      }
    );
  }

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  response.headers.set('X-RateLimit-Reset', String(rateLimit.resetTime));

  // Content Security Policy with Trusted Types for XSS protection
  // 
  // NOTE: 'unsafe-inline' is required for Next.js inline scripts and styles.
  // In a future update, consider implementing nonce-based CSP for better security.
  // 
  // Only include GA domains if analytics is enabled to avoid third-party cookie warnings
  const scriptSrc = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
    ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com"
    : "script-src 'self' 'unsafe-inline'";
  
  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co wss://*.supabase.in",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "require-trusted-types-for 'script'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS (always set, but with longer max-age in production)
  const hstsMaxAge = process.env.NODE_ENV === 'production' 
    ? 'max-age=31536000; includeSubDomains; preload'
    : 'max-age=86400'; // 1 day for development
  response.headers.set('Strict-Transport-Security', hstsMaxAge);

  // Cross-Origin-Opener-Policy (COOP) for origin isolation
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
