import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  hit,
  checkAiRateLimit,
  AI_ROUTE_LIMIT,
  AI_GLOBAL_LIMIT,
  __resetRateLimits,
} from "./rate-limit";

describe("hit()", () => {
  beforeEach(() => {
    __resetRateLimits();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit and blocks the one after", () => {
    const options = { limit: 3, windowMs: 60_000 };

    expect(hit("user-a", options).ok).toBe(true);
    expect(hit("user-a", options).ok).toBe(true);
    expect(hit("user-a", options).ok).toBe(true);
    expect(hit("user-a", options).ok).toBe(false);
  });

  it("counts down remaining and never reports a negative value", () => {
    const options = { limit: 2, windowMs: 60_000 };

    expect(hit("user-b", options).remaining).toBe(1);
    expect(hit("user-b", options).remaining).toBe(0);
    expect(hit("user-b", options).remaining).toBe(0);
  });

  it("keeps separate budgets per key", () => {
    const options = { limit: 1, windowMs: 60_000 };

    expect(hit("user-c", options).ok).toBe(true);
    expect(hit("user-c", options).ok).toBe(false);
    // A different user is unaffected by the first user's exhaustion.
    expect(hit("user-d", options).ok).toBe(true);
  });

  it("resets once the window elapses", () => {
    const options = { limit: 1, windowMs: 60_000 };

    expect(hit("user-e", options).ok).toBe(true);
    expect(hit("user-e", options).ok).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(hit("user-e", options).ok).toBe(true);
  });

  it("does not reset early, one millisecond before the window closes", () => {
    const options = { limit: 1, windowMs: 60_000 };

    hit("user-f", options);
    vi.advanceTimersByTime(59_999);

    expect(hit("user-f", options).ok).toBe(false);
  });

  it("reports a retryAfter that shrinks as the window drains", () => {
    const options = { limit: 1, windowMs: 60_000 };

    hit("user-g", options);
    vi.advanceTimersByTime(30_000);

    const blocked = hit("user-g", options);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(30);
  });
});

describe("checkAiRateLimit()", () => {
  beforeEach(() => {
    __resetRateLimits();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null while the user is under budget", () => {
    expect(checkAiRateLimit("u1", "hub")).toBeNull();
  });

  it("returns a 429 with Retry-After once a single route is exhausted", async () => {
    for (let i = 0; i < AI_ROUTE_LIMIT.limit; i++) {
      expect(checkAiRateLimit("u2", "hub")).toBeNull();
    }

    const blocked = checkAiRateLimit("u2", "hub");
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
    expect(blocked!.headers.get("Retry-After")).toBeTruthy();

    const body = await blocked!.json();
    expect(body.error).toMatch(/too many ai requests/i);
    expect(body.scope).toBe("hub");
  });

  it("isolates one route's exhaustion from another route", () => {
    for (let i = 0; i < AI_ROUTE_LIMIT.limit; i++) {
      checkAiRateLimit("u3", "hub");
    }

    expect(checkAiRateLimit("u3", "hub")).not.toBeNull();
    // A different endpoint still has its own per-route budget left.
    expect(checkAiRateLimit("u3", "match")).toBeNull();
  });

  it("enforces the global ceiling so routes cannot be summed", () => {
    // Spread requests across enough distinct routes that no per-route budget
    // is ever hit, and confirm the cross-route ceiling still stops the user.
    const routes = ["hub", "match", "proposal", "outreach", "messages"];
    let allowed = 0;

    for (let i = 0; i < AI_GLOBAL_LIMIT.limit + 5; i++) {
      const route = routes[i % routes.length];
      if (checkAiRateLimit("u4", route) === null) allowed++;
    }

    expect(allowed).toBe(AI_GLOBAL_LIMIT.limit);
  });

  it("lets the user through again after the window resets", () => {
    for (let i = 0; i < AI_ROUTE_LIMIT.limit; i++) {
      checkAiRateLimit("u5", "hub");
    }
    expect(checkAiRateLimit("u5", "hub")).not.toBeNull();

    vi.advanceTimersByTime(AI_ROUTE_LIMIT.windowMs + 1);

    expect(checkAiRateLimit("u5", "hub")).toBeNull();
  });
});
