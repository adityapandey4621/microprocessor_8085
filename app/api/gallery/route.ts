import { NextResponse } from "next/server"
import { codeService } from "@/lib/services/code.service"
import { handleApiError } from "@/lib/errors"
import { logger } from "@/lib/logger"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function GET(req: Request) {
  const startTime = Date.now()
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)))
  const search = (searchParams.get("search") || "").trim()

  const cacheKey = `gallery:${page}:${limit}:${search}`

  try {
    // 1. Check Upstash Redis read-through cache
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          const data = typeof cached === "string" ? JSON.parse(cached) : cached
          return NextResponse.json({ ...data, cached: true }, { status: 200 })
        }
      } catch (err) {
        logger.error("Redis gallery cache read error:", err)
      }
    }

    // 2. Query CodeService
    const result = await codeService.getGalleryCodes({ page, limit, search })
    const responseData = { ...result, cached: false }

    // 3. Cache in Upstash Redis for 24 hours
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        await redis.set(cacheKey, JSON.stringify(responseData), { ex: 86400 })
      } catch (err) {
        logger.error("Redis gallery cache write error:", err)
      }
    }

    logger.logApiRequest({
      route: "/api/gallery",
      method: "GET",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
    })

    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/gallery",
      method: "GET",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}
