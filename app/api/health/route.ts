import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Redis } from "@upstash/redis"
import { logger } from "@/lib/logger"

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
  : null

export async function GET() {
  const startTime = Date.now()
  let dbStatus = "disconnected"
  let redisStatus = redis ? "disconnected" : "not_configured"
  let overallStatus = "ok"

  // 1. Check Database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = "connected"
  } catch (err) {
    logger.error("Health Check - DB error:", err)
    dbStatus = "disconnected"
    overallStatus = "error"
  }

  // 2. Check Redis connection if configured
  if (redis) {
    try {
      await redis.ping()
      redisStatus = "connected"
    } catch (err) {
      logger.error("Health Check - Redis error:", err)
      redisStatus = "disconnected"
      // If redis fails, mark degraded or error
      overallStatus = overallStatus === "ok" ? "degraded" : "error"
    }
  }

  const latencyMs = Date.now() - startTime
  const statusCode = overallStatus === "error" ? 503 : 200

  const payload = {
    status: overallStatus,
    database: dbStatus,
    redis: redisStatus,
    environment: process.env.NODE_ENV || "development",
    uptimeSeconds: Math.floor(process.uptime()),
    latencyMs,
    timestamp: new Date().toISOString(),
  }

  logger.logApiRequest({
    route: "/api/health",
    method: "GET",
    statusCode,
    executionTimeMs: latencyMs,
  })

  return NextResponse.json(payload, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}
