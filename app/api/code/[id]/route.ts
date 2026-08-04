import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { codeService } from "@/lib/services/code.service"
import {
  handleApiError,
  UnauthorizedError,
  RateLimitError,
} from "@/lib/errors"
import { saveCodeRateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/logger"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    // 1. Check Upstash Redis Cache for public snippet
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const cached = await redis.get(`snippet:${id}`)
        if (cached) {
          const data = typeof cached === "string" ? JSON.parse(cached) : cached
          return NextResponse.json({ ...data, cached: true }, { status: 200 })
        }
      } catch (err) {
        logger.error("Redis cache read error:", err)
      }
    }

    // 2. Query CodeService
    const code = await codeService.getCode(id, session?.user?.id || null)

    // 3. Cache in Upstash Redis for 24 hours if shared
    if (code.shared && process.env.UPSTASH_REDIS_REST_URL) {
      try {
        await redis.set(`snippet:${id}`, JSON.stringify(code), { ex: 86400 })
      } catch (err) {
        logger.error("Redis cache write error:", err)
      }
    }

    logger.logApiRequest({
      route: `/api/code/${id}`,
      method: "GET",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session?.user?.id,
    })

    return NextResponse.json({ ...code, cached: false }, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: `/api/code/[id]`,
      method: "GET",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { id } = await params
    const rateLimit = await saveCodeRateLimiter.limit(`update_code:${session.user.id}`)
    if (!rateLimit.success) {
      throw new RateLimitError()
    }

    const body = await req.json()
    const updated = await codeService.updateCode(id, session.user.id, body)

    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        await redis.del(`snippet:${id}`)
      } catch (err) {
        logger.error("Redis cache del error:", err)
      }
    }

    logger.logApiRequest({
      route: `/api/code/${id}`,
      method: "PATCH",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session.user.id,
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: `/api/code/[id]`,
      method: "PATCH",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { id } = await params
    await codeService.deleteCode(id, session.user.id)

    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        await redis.del(`snippet:${id}`)
      } catch (err) {
        logger.error("Redis cache del error:", err)
      }
    }

    logger.logApiRequest({
      route: `/api/code/${id}`,
      method: "DELETE",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session.user.id,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: `/api/code/[id]`,
      method: "DELETE",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}
