import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)))
  const search = (searchParams.get("search") || "").trim()

  const cacheKey = `gallery:${page}:${limit}:${search}`

  // 1. Check Upstash Redis cache (5 minute TTL)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        const data = typeof cached === "string" ? JSON.parse(cached) : cached
        return NextResponse.json({ ...data, cached: true })
      }
    } catch (err) {
      console.error("Redis gallery cache read error:", err)
    }
  }

  // 2. Query DB for shared codes
  const whereClause: any = {
    shared: true,
  }

  if (search) {
    whereClause.title = {
      contains: search,
    }
  }

  const [items, total] = await Promise.all([
    prisma.savedCode.findMany({
      where: whereClause,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            username: true,
          },
        },
      },
    }),
    prisma.savedCode.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(total / limit)
  const responseData = {
    items,
    total,
    page,
    limit,
    totalPages,
    cached: false,
  }

  // 3. Cache in Redis for 5 minutes (300 seconds)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), { ex: 300 })
    } catch (err) {
      console.error("Redis gallery cache write error:", err)
    }
  }

  return NextResponse.json(responseData)
}
