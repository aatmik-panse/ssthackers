import { NextResponse } from 'next/server';
import { rateLimit } from './lib/rate-limit';

// Define rate limiting for different API endpoints
const apiLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max number of unique users per interval
  limit: 60, // 60 requests per minute for anonymous users
  authUserMultiplier: 5 // 300 requests per minute for authenticated users
});

const authLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, // Max unique users per interval
  limit: 10, // 5 requests per minute for anonymous users
  authUserMultiplier: 1 // Same limit for auth users to prevent brute force
});

const voteLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 100, 
  limit: 10, // 10 votes per minute for anonymous users
  authUserMultiplier: 3 // 30 votes per minute for authenticated users
});

const submitLimiter = rateLimit({
  interval: 10 * 60 * 1000, // 10 minutes
  uniqueTokenPerInterval: 100,
  limit: 2, // 2 submissions per 10 minutes for anonymous users
  authUserMultiplier: 5 // 10 submissions per 10 minutes for authenticated users
});

export async function middleware(request) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;
  
  let limiterResponse = { success: true, limit: 0, remaining: 0 };
  let retryAfter = '60';

  // Apply different rate limits based on the pathname
  if (pathname.startsWith('/api/auth')) {
    try {
      limiterResponse = await authLimiter.check(request);
      if (!limiterResponse.success) {
        return createRateLimitResponse(
          'Too many authentication requests, please try again later',
          limiterResponse,
          retryAfter
        );
      }
    } catch (error) {
      console.error('Rate limit error:', error);
    }
  } else if (pathname.match(/\/api\/posts\/[^/]+\/vote/)) {
    try {
      limiterResponse = await voteLimiter.check(request);
      if (!limiterResponse.success) {
        return createRateLimitResponse(
          'Too many vote requests, please try again later',
          limiterResponse,
          retryAfter
        );
      }
    } catch (error) {
      console.error('Rate limit error:', error);
    }
  } else if (pathname.startsWith('/api/posts') && request.method === 'POST') {
    try {
      limiterResponse = await submitLimiter.check(request);
      retryAfter = '600'; // 10 minutes
      if (!limiterResponse.success) {
        return createRateLimitResponse(
          'Too many submission requests, please try again later',
          limiterResponse,
          retryAfter
        );
      }
    } catch (error) {
      console.error('Rate limit error:', error);
    }
  } else if (pathname.startsWith('/api/')) {
    try {
      limiterResponse = await apiLimiter.check(request);
      if (!limiterResponse.success) {
        return createRateLimitResponse(
          'Too many requests, please try again later',
          limiterResponse,
          retryAfter
        );
      }
    } catch (error) {
      console.error('Rate limit error:', error);
    }
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next();
  
  // Add headers to show rate limit info
  if (limiterResponse.limit > 0) {
    response.headers.set('X-RateLimit-Limit', String(limiterResponse.limit));
    response.headers.set('X-RateLimit-Remaining', String(limiterResponse.remaining));
  }
  
  return response;
}

/**
 * Helper function to create rate limit exceeded response
 */
function createRateLimitResponse(message, limiterResponse, retryAfter) {
  return new NextResponse(
    JSON.stringify({ error: message }),
    { 
      status: 429, 
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(limiterResponse.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + parseInt(retryAfter, 10)),
        'Retry-After': retryAfter
      }
    }
  );
}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 