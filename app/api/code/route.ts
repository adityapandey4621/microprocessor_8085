import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { codeService } from "@/lib/services/code.service"
import {
  handleApiError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
} from "@/lib/errors"
import { saveCodeRateLimiter } from "@/lib/rate-limiter"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    if (session.user.id === "guest-user") {
      throw new ForbiddenError("Guests cannot save code. Please sign in.")
    }

    const rateLimit = await saveCodeRateLimiter.limit(`save_code:${session.user.id}`)
    if (!rateLimit.success) {
      throw new RateLimitError()
    }

    const body = await req.json()
    let savedCode
    if (body.id) {
      savedCode = await codeService.updateCode(body.id, session.user.id, body)
    } else {
      savedCode = await codeService.createCode(session.user.id, body)
    }

    logger.logApiRequest({
      route: "/api/code",
      method: "POST",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session.user.id,
    })

    return NextResponse.json(savedCode, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/code",
      method: "POST",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}

export async function GET(req: Request) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { searchParams } = new URL(req.url)
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
    const search = searchParams.get("search") || undefined
    const paginated = searchParams.get("paginated") === "true"

    const result = await codeService.getUserCodes(session.user.id, {
      page,
      limit,
      search,
    })

    logger.logApiRequest({
      route: "/api/code",
      method: "GET",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session.user.id,
    })

    if (paginated) {
      return NextResponse.json(result, { status: 200 })
    }
    return NextResponse.json(result.items, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/code",
      method: "GET",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}
