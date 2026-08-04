import { NextResponse } from "next/server"
import { authService } from "@/lib/services/auth.service"
import { handleApiError, RateLimitError } from "@/lib/errors"
import { authRateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  const startTime = Date.now()
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"

  try {
    const rateLimit = await authRateLimiter.limit(`register:${ip}`)
    if (!rateLimit.success) {
      throw new RateLimitError("Too many registration attempts. Please try again later.")
    }

    const body = await req.json()
    const user = await authService.registerUser(body)

    logger.logApiRequest({
      route: "/api/auth/register",
      method: "POST",
      statusCode: 201,
      executionTimeMs: Date.now() - startTime,
      userId: user.id,
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/auth/register",
      method: "POST",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}
