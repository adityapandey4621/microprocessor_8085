import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiService } from "@/lib/services/ai.service"
import { handleApiError, UnauthorizedError, RateLimitError } from "@/lib/errors"
import { aiRateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const rateLimit = await aiRateLimiter.limit(`ai_gen:${session.user.id}`)
    if (!rateLimit.success) {
      throw new RateLimitError("AI generation rate limit exceeded. Please try again in a minute.")
    }

    const body = await req.json()
    const result = await aiService.generateResponse(session.user.id, body)

    logger.logApiRequest({
      route: "/api/ai/generate",
      method: "POST",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session.user.id,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/ai/generate",
      method: "POST",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}
