import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { z } from "zod"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

const publishSchema = z.object({
  room: z.string().min(1).max(100).default("general"),
  type: z.enum(["JOIN", "LEAVE", "CURSOR", "CODE_CHANGE", "HEARTBEAT"]),
  payload: z.any().optional(),
  user: z.object({
    id: z.string(),
    name: z.string().optional(),
    image: z.string().optional(),
  }),
})

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return NextResponse.json(
      { error: "Upstash Redis not configured for serverless collaboration" },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const result = publishSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { room, type, payload, user } = result.data
    // Override user id to ensure no spoofing
    user.id = session.user.id
    
    const timestamp = Date.now()

    // 1. Maintain active presence in Redis with 60-second TTL
    const presenceKey = `presence:${room}:${user.id}`
    if (type === "LEAVE") {
      await redis.del(presenceKey)
    } else {
      await redis.set(
        presenceKey,
        JSON.stringify({
          ...user,
          lastSeen: timestamp,
        }),
        { ex: 60 }
      )
    }

    // 2. Publish event to Redis channel
    const eventMessage = {
      type,
      room,
      payload,
      user,
      timestamp,
    }

    await redis.publish(`channel:${room}`, JSON.stringify(eventMessage))

    return NextResponse.json({ success: true, timestamp })
  } catch (err: any) {
    console.error("Collaboration publish error:", err)
    return NextResponse.json(
      { error: err?.message || "Publish failed" },
      { status: 500 }
    )
  }
}
