import { LRUCache } from 'lru-cache';
import { getToken as getAuthToken } from 'next-auth/jwt';

/**
 * Rate limiter implementation for Next.js middleware
 * Adapted from express-rate-limit to work with Next.js App Router
 */
export function rateLimit({
  interval = 60 * 1000, // 1 minute in milliseconds
  limit = 10, // Default limit per interval
  uniqueTokenPerInterval = 500, // Max number of users per interval
  authUserMultiplier = 5, // Authenticated users get higher limits
}) {
  const tokenCache = new LRUCache({
    max: uniqueTokenPerInterval,
    ttl: interval,
  });

  return {
    check: async (request) => {
      const token = await getToken(request);
      const isAuthenticated = !!token.userId;
      
      // Apply higher rate limits for authenticated users
      const effectiveLimit = isAuthenticated ? limit * authUserMultiplier : limit;
      
      if (!token.key) {
        return { success: false, limit: effectiveLimit, remaining: 0 };
      }
      
      const cacheKey = token.key;
      const tokenCount = (tokenCache.get(cacheKey) || 0) + 1;
      
      tokenCache.set(cacheKey, tokenCount);
      
      const remaining = Math.max(0, effectiveLimit - tokenCount);
      const success = tokenCount <= effectiveLimit;
      
      return {
        success,
        limit: effectiveLimit,
        remaining,
      };
    },
  };
}

/**
 * Get a unique token for the visitor
 * Considers both IP address and authentication status
 */
async function getToken(request) {
  // Try to get IP address
  const ip = request.ip || 
             request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') ||
             'anonymous';
  
  // Try to get authenticated user
  let userId = null;
  try {
    // Check if user is authenticated using NextAuth
    const authToken = await getAuthToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (authToken?.id) {
      userId = authToken.id;
    }
  } catch (error) {
    // Ignore auth errors, treat as anonymous
    console.error('Auth token error:', error);
  }
  
  return {
    key: userId ? `user-${userId}` : `ip-${ip}`,
    userId
  };
} 