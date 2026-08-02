import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Redis } from "@upstash/redis"
import { BUILTIN_GALLERY_ITEMS } from "@/lib/builtin-gallery"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)))
  const search = (searchParams.get("search") || "").trim()

  const cacheKey = `gallery:${page}:${limit}:${search}`

  // 1. Check Upstash Redis cache (24h TTL read-through cache)
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

  let items: any[] = []
  let total = 0
  try {
    const [dbItems, dbTotal] = await Promise.all([
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
    items = dbItems.map((it: any) => ({
      id: it.id,
      title: it.title,
      description: it.description || "",
      code: it.code,
      authorName: it.user?.name || "SYS-COMMUNITY",
      updatedAt: new Date(it.updatedAt).toISOString().split("T")[0],
    }))
    total = dbTotal
  } catch (err) {
    console.error("Database gallery query failed, using built-in system items:", err)
  }

  // 3. Fallback / Merge with 15 SYS-BUILTIN programs if DB items are empty
  if (items.length === 0) {
    const filteredBuiltin = BUILTIN_GALLERY_ITEMS.filter(
      (it) =>
        !search ||
        it.title.toLowerCase().includes(search.toLowerCase()) ||
        it.authorName.toLowerCase().includes(search.toLowerCase()) ||
        (it.description && it.description.toLowerCase().includes(search.toLowerCase()))
    )
    items = filteredBuiltin.slice((page - 1) * limit, page * limit)
    total = filteredBuiltin.length
  }

  const totalPages = Math.ceil(total / limit)
  const responseData = {
    items,
    total,
    page,
    limit,
    totalPages,
    cached: false,
  }

  // 4. Cache in Upstash Redis for 24 hours (86400 seconds)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      await redis.set(cacheKey, JSON.stringify(responseData), { ex: 86400 })
    } catch (err) {
      console.error("Redis gallery cache write error:", err)
    }
  }

  return NextResponse.json(responseData)
}
