import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

interface WindowEntry {
  count: number
  resetAt: number
}

// Thread-safe In-Memory fallback rate limiter for local development
class InMemoryRateLimiter {
  private cache = new Map<string, WindowEntry>()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowSeconds: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowSeconds * 1000
  }

  public async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const entry = this.cache.get(identifier)

    if (!entry || now >= entry.resetAt) {
      const newEntry = { count: 1, resetAt: now + this.windowMs }
      this.cache.set(identifier, newEntry)
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: newEntry.resetAt,
      }
    }

    if (entry.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: entry.resetAt,
      }
    }

    entry.count += 1
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - entry.count,
      reset: entry.resetAt,
    }
  }
}

export class UnifiedRateLimiter {
  private upstashLimiter: Ratelimit | null = null
  private inMemoryLimiter: InMemoryRateLimiter
  private maxRequests: number

  constructor(maxRequests: number, windowSeconds = 60) {
    this.maxRequests = maxRequests
    this.inMemoryLimiter = new InMemoryRateLimiter(maxRequests, windowSeconds)

    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (url && token && process.env.NODE_ENV === "production") {
      try {
        const redis = new Redis({ url, token })
        this.upstashLimiter = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
          analytics: true,
        })
      } catch (err) {
        console.warn("[RateLimiter] Upstash initialization failed, using in-memory fallback:", err)
      }
    }
  }

  public async limit(identifier: string): Promise<RateLimitResult> {
    if (this.upstashLimiter) {
      try {
        const res = await this.upstashLimiter.limit(identifier)
        return {
          success: res.success,
          limit: res.limit,
          remaining: res.remaining,
          reset: res.reset,
        }
      } catch (err) {
        console.warn("[RateLimiter] Upstash Redis request failed, falling back to in-memory:", err)
      }
    }
    return this.inMemoryLimiter.limit(identifier)
  }
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = new UnifiedRateLimiter(10, 60)       // 10 req / min
export const aiRateLimiter = new UnifiedRateLimiter(5, 60)          // 5 req / min
export const saveCodeRateLimiter = new UnifiedRateLimiter(60, 60)   // 60 req / min
export const generalRateLimiter = new UnifiedRateLimiter(100, 60)   // 100 req / min
export const galleryRateLimiter = new UnifiedRateLimiter(120, 60)   // 120 req / min
