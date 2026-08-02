import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Redis } from "@upstash/redis"
import { z } from "zod"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 })
  }

  // 1. Check Upstash Redis Cache (Read-Through Cache)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const cached = await redis.get(`snippet:${id}`)
      if (cached) {
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached
        return NextResponse.json({ ...data, cached: true })
      }
    } catch (err) {
      console.error("Redis cache read error:", err)
    }
  }

  // 2. Query Prisma DB
  const code = await prisma.savedCode.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          username: true,
          email: true,
        },
      },
    },
  })

  if (!code) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
  }

  // 3. Permission check: if not shared, only the author can view
  if (!code.shared) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || session.user.email !== code.user.email) {
      return NextResponse.json(
        { error: "Forbidden: This code is private" },
        { status: 403 }
      )
    }
  }

  // Remove email before sending/caching for privacy
  const { email, ...publicUser } = code.user
  const safeData = {
    ...code,
    user: publicUser,
    cached: false,
  }

  // 4. Cache in Upstash Redis for 24 hours (86400 seconds) if public
  if (code.shared && process.env.UPSTASH_REDIS_REST_URL) {
    try {
      await redis.set(`snippet:${id}`, JSON.stringify(safeData), { ex: 86400 })
    } catch (err) {
      console.error("Redis cache write error:", err)
    }
  }

  return NextResponse.json(safeData)
}

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(10000).optional(),
  shared: z.boolean().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existingCode = await prisma.savedCode.findUnique({
    where: { id },
    include: { user: true },
  })

  if (!existingCode) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 })
  }

  if (existingCode.user.email !== session.user.email) {
    return NextResponse.json(
      { error: "Forbidden: You do not own this snippet" },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parseResult = updateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.errors[0].message },
      { status: 400 }
    )
  }

  const updated = await prisma.savedCode.update({
    where: { id },
    data: parseResult.data,
  })

  // Invalidate Redis cache
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      await redis.del(`snippet:${id}`)
    } catch (err) {
      console.error("Redis cache del error:", err)
    }
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existingCode = await prisma.savedCode.findUnique({
    where: { id },
    include: { user: true },
  })

  if (!existingCode) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 })
  }

  if (existingCode.user.email !== session.user.email) {
    return NextResponse.json(
      { error: "Forbidden: You do not own this snippet" },
      { status: 403 }
    )
  }

  await prisma.savedCode.delete({ where: { id } })

  // Invalidate Redis cache
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      await redis.del(`snippet:${id}`)
    } catch (err) {
      console.error("Redis cache del error:", err)
    }
  }

  return NextResponse.json({ success: true })
}
