import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

const publishSchema = z.object({
  room: z.string().min(1).max(100).default("general"),
  type: z.enum(["JOIN", "LEAVE", "CURSOR", "CODE_CHANGE", "HEARTBEAT", "CHAT_MESSAGE"]),
  payload: z.any().optional(),
  user: z.object({
    id: z.string().min(1).max(100),
    name: z.string().max(100).optional(),
    image: z.string().optional(),
  }),
})

export async function POST(req: Request) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json(
      { error: "Upstash Redis not configured for serverless collaboration" },
      { status: 503 }
    )
  }

  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const result = publishSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid request payload" },
        { status: 400 }
      )
    }

    const { room, type, payload, user } = result.data

    // If authenticated, enforce real session details; otherwise use guest identifier
    if (session?.user?.id) {
      user.id = session.user.id
      user.name = session.user.name || session.user.username || user.name || "Student"
      if (session.user.image) user.image = session.user.image
    } else {
      user.id = user.id.replace(/[^a-zA-Z0-9_-]/g, "").substring(0, 50) || "guest-" + Math.random().toString(36).substring(2, 8)
      user.name = user.name?.substring(0, 50) || "Anonymous Student"
    }

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

    // 2. If chat message, store in room history list for serverless polling (keep last 50)
    if (type === "CHAT_MESSAGE") {
      const chatMsg = {
        id: payload?.id || "msg-" + Math.random().toString(36).substring(2, 9),
        sender: user,
        text: typeof payload === "string" ? payload : (payload?.text || ""),
        codeSnippet: payload?.codeSnippet || undefined,
        timestamp,
      }
      const chatKey = `chat:${room}`
      await redis.rpush(chatKey, JSON.stringify(chatMsg))
      await redis.ltrim(chatKey, -50, -1)
      await redis.expire(chatKey, 86400) // 24 hours retention
    }

    // 3. Publish event to Redis Pub/Sub channel
    const eventMessage = {
      type,
      room,
      payload,
      user,
      timestamp,
    }

    try {
      await redis.publish(`channel:${room}`, JSON.stringify(eventMessage))
    } catch (pubErr) {
      console.warn("Redis publish to channel warning:", pubErr)
    }

    return NextResponse.json({ success: true, timestamp })
  } catch (err: any) {
    console.error("Collaboration publish error:", err)
    return NextResponse.json(
      { error: err?.message || "Publish failed" },
      { status: 500 }
    )
  }
}
