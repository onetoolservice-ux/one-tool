/**
 * OAuth Redirect URL Validation
 * Prevents OAuth token redirection to unauthorized domains
 */

/**
 * Get allowed origins from environment variable
 * Format: comma-separated list of allowed origins
 * Example: "https://onetool.com,https://www.onetool.com,https://staging.onetool.com"
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS;
  
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default: use current origin in production, allow localhost in development
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (process.env.NODE_ENV === 'development') {
      return [origin, 'http://localhost:3000', 'http://127.0.0.1:3000'];
    }
    return [origin];
  }
  
  return [];
}

/**
 * Validate and get OAuth redirect URL
 * Throws error if origin is not in allowed list
 */
export function getOAuthRedirectURL(path: string = '/auth/callback'): string {
  if (typeof window === 'undefined') {
    throw new Error('getOAuthRedirectURL can only be called on the client');
  }
  
  const origin = window.location.origin;
  const allowedOrigins = getAllowedOrigins();
  
  // Validate origin
  if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    throw new Error(
      `Invalid origin for OAuth redirect: ${origin}. ` +
      `Allowed origins: ${allowedOrigins.join(', ')}`
    );
  }
  
  // Validate path
  if (!path.startsWith('/')) {
    throw new Error('OAuth redirect path must start with /');
  }
  
  return `${origin}${path}`;
}

/**
 * Validate origin is allowed (for server-side use)
 */
export function validateOrigin(origin: string): boolean {
  const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  if (allowedOrigins.length === 0) {
    // If no explicit list, allow localhost in development, any origin in production
    // (This is a fallback - should set NEXT_PUBLIC_ALLOWED_ORIGINS in production)
    if (process.env.NODE_ENV === 'development') {
      return origin.includes('localhost') || origin.includes('127.0.0.1');
    }
    // In production without explicit list, be permissive but log warning
    console.warn('NEXT_PUBLIC_ALLOWED_ORIGINS not set - allowing all origins (security risk)');
    return true;
  }
  
  return allowedOrigins.includes(origin);
}
