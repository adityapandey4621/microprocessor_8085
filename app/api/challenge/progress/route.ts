import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { challengeService } from "@/lib/services/challenge.service"
import { handleApiError, UnauthorizedError } from "@/lib/errors"
import { logger } from "@/lib/logger"

export async function GET() {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const progress = await challengeService.getUserProgress(session.user.id)

    logger.logApiRequest({
      route: "/api/challenge/progress",
      method: "GET",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
      userId: session.user.id,
    })

    return NextResponse.json({ progress }, { status: 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/challenge/progress",
      method: "GET",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}
