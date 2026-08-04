import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { challengeService } from "@/lib/services/challenge.service"
import { handleApiError } from "@/lib/errors"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  const startTime = Date.now()
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const result = await challengeService.submitChallenge(session?.user?.id || null, body)

    logger.logApiRequest({
      route: "/api/challenge/submit",
      method: "POST",
      statusCode: result.success ? 200 : 400,
      executionTimeMs: Date.now() - startTime,
      userId: session?.user?.id,
    })

    return NextResponse.json(result, { status: result.error ? 400 : 200 })
  } catch (error) {
    const res = handleApiError(error)
    logger.logApiRequest({
      route: "/api/challenge/submit",
      method: "POST",
      statusCode: res.status,
      executionTimeMs: Date.now() - startTime,
    })
    return res
  }
}

export async function GET() {
  const startTime = Date.now()
  try {
    const challenges = await challengeService.listChallenges()

    logger.logApiRequest({
      route: "/api/challenge/submit",
      method: "GET",
      statusCode: 200,
      executionTimeMs: Date.now() - startTime,
    })

    return NextResponse.json({ challenges }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
