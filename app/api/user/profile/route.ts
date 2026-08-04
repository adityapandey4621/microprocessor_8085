import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { userService } from "@/lib/services/user.service"
import { handleApiError, UnauthorizedError, RateLimitError } from "@/lib/errors"
import { generalRateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/logger"

export async function GET() {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const profile = await userService.getProfile(session.user.id)

    logger.logApiRequest({
      route: "/api/user/profile",
      method: "GET",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session.user.id,
    })

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/user/profile",
      method: "GET",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}

export async function PATCH(req: Request) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const rateLimit = await generalRateLimiter.limit(`profile:${session.user.id}`)
    if (!rateLimit.success) {
      throw new RateLimitError()
    }

    const body = await req.json()
    const profile = await userService.updateProfile(session.user.id, body)

    logger.logApiRequest({
      route: "/api/user/profile",
      method: "PATCH",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session.user.id,
    })

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/user/profile",
      method: "PATCH",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}
