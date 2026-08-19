import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const room = searchParams.get("room") || "general"

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json(
      { room, count: 0, users: [], messages: [], status: "offline" },
      { status: 200 }
    )
  }

  try {
    // 1. Scan for presence keys in the room
    const prefix = `presence:${room}:`
    const keys = await redis.keys(`${prefix}*`)

    let users: any[] = []
    if (keys && keys.length > 0) {
      const rawUsers = await redis.mget(...keys)
      users = (rawUsers || [])
        .filter((u): u is string | object => u !== null && u !== undefined)
        .map((u) => (typeof u === "string" ? JSON.parse(u) : u))
    }

    // 2. Fetch recent chat messages for serverless stream
    const chatKey = `chat:${room}`
    const rawMessages = await redis.lrange(chatKey, -30, -1)
    const messages = (rawMessages || [])
      .filter((m): m is string | object => m !== null && m !== undefined)
      .map((m) => (typeof m === "string" ? JSON.parse(m) : m))

    return NextResponse.json({
      room,
      count: users.length,
      users,
      messages,
      timestamp: Date.now(),
    })
  } catch (err: any) {
    console.error("Collaboration stream error:", err)
    return NextResponse.json(
      { error: "Failed to fetch room presence", room, count: 0, users: [], messages: [] },
      { status: 500 }
    )
  }
}
