import { NextResponse } from "next/server";

/**
 * Fixed-window rate limiter for the AI (Gemini) endpoints.
 *
 * State lives in the process, which is the right trade-off for a single
 * long-lived server: no extra infrastructure, no network hop on the hot path.
 * On a horizontally scaled or serverless deployment each instance keeps its own
 * counters, so the effective ceiling is `limit x instances`. If that matters,
 * swap `hit()` for a Redis INCR/EXPIRE against the same key — every caller in
 * this file goes through that one function.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Reclaim expired buckets so an idle process doesn't grow the map forever.
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export interface RateLimitOptions {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

/** Per-user budget for a single AI endpoint. */
export const AI_ROUTE_LIMIT: RateLimitOptions = {
  limit: 12,
  windowMs: 60_000,
};

/** Shared ceiling across every AI endpoint, so 9 routes can't be summed. */
export const AI_GLOBAL_LIMIT: RateLimitOptions = {
  limit: 30,
  windowMs: 60_000,
};

export function hit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      ok: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetAt,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, options.limit - existing.count);

  return {
    ok: existing.count <= options.limit,
    limit: options.limit,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

function headersFor(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

/**
 * Applies both the per-route and the cross-route AI budget for one user.
 * Returns a ready-to-send 429 when either is exhausted, otherwise `null`.
 */
export function checkAiRateLimit(
  userId: string,
  routeName: string,
): NextResponse | null {
  const perRoute = hit(`ai:${routeName}:${userId}`, AI_ROUTE_LIMIT);
  if (!perRoute.ok) return tooManyRequests(perRoute, routeName);

  const global = hit(`ai:*:${userId}`, AI_GLOBAL_LIMIT);
  if (!global.ok) return tooManyRequests(global, "ai");

  return null;
}

function tooManyRequests(result: RateLimitResult, scope: string): NextResponse {
  return NextResponse.json(
    {
      error: `Too many AI requests. Please wait ${result.retryAfterSeconds}s before trying again.`,
      scope,
      retryAfter: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        ...headersFor(result),
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}

/** Exposed for tests — clears all counters. */
export function __resetRateLimits() {
  buckets.clear();
  lastSweep = 0;
}
