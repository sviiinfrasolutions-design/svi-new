import { type NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  },
  5 * 60 * 1000
);

interface RateLimitOptions {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Extract identifier from request (default: IP from headers) */
  keyFn?: (req: NextRequest) => string;
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Simple in-memory rate limiter for API routes.
 *
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     const limited = rateLimit(req, { limit: 10, windowSeconds: 60 });
 *     if (limited) return limited; // 429 response
 *     // ... handle request
 *   }
 */
export function rateLimit(req: NextRequest, options: RateLimitOptions): NextResponse | null {
  const { limit, windowSeconds, keyFn = getClientIp } = options;
  const key = `${keyFn(req)}:${req.nextUrl.pathname}`;
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowSeconds * 1000 };
    store.set(key, entry);
  }

  entry.count++;

  if (entry.count > limit) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }

  return null; // Not rate-limited
}
