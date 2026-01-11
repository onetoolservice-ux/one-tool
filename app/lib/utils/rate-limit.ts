/**
 * Rate Limiting Utility
 * 
 * NOTE: In-memory rate limiting is for development only.
 * For production, use Redis-based rate limiting (Upstash Redis, Vercel KV, etc.)
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (development only)
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Get client IP address safely
 * Only trusts x-forwarded-for from known proxies (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  // In production behind Vercel/proxy, use x-real-ip header (set by Vercel)
  if (process.env.NODE_ENV === 'production') {
    const realIP = (request.headers as any).get('x-real-ip');
    if (realIP) {
      return realIP;
    }
  }
  
  // Fallback to request IP (may be undefined in some environments)
  const ip = (request as any).ip;
  if (ip) {
    return ip;
  }
  
  // Last resort: use 'unknown' (will be rate limited per path, not per IP)
  return 'unknown';
}

/**
 * Clean up expired rate limit entries
 * Called on each request to avoid memory leaks (no setInterval)
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Prevent unbounded growth - limit store size
  if (rateLimitStore.size > 10000) {
    // Remove oldest 20% of entries
    const entries = Array.from(rateLimitStore.entries());
    entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      rateLimitStore.delete(entries[i][0]);
    }
  }
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit (in-memory, development only)
 * 
 * For production, replace this with Redis-based implementation:
 * - Upstash Redis (serverless Redis)
 * - Vercel KV
 * - Custom Redis instance
 */
export function checkRateLimit(
  ip: string,
  path: string,
  config: RateLimitConfig
): RateLimitResult {
  // Cleanup on each check (no setInterval needed)
  cleanupExpiredEntries();
  
  const key = `${ip}:${path}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newRecord);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}
