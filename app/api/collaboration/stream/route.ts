import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const room = searchParams.get("room") || "general"

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return NextResponse.json(
      { room, count: 0, users: [], status: "offline" },
      { status: 200 }
    )
  }

  try {
    // 1. Scan for presence keys in the room
    const prefix = `presence:${room}:`
    const keys = await redis.keys(`${prefix}*`)

    if (!keys || keys.length === 0) {
      return NextResponse.json({
        room,
        count: 0,
        users: [],
        timestamp: Date.now(),
      })
    }

    // 2. Fetch all online user objects
    const rawUsers = await redis.mget(...keys)
    const users = (rawUsers || [])
      .filter((u): u is string | object => u !== null && u !== undefined)
      .map((u) => (typeof u === "string" ? JSON.parse(u) : u))

    return NextResponse.json({
      room,
      count: users.length,
      users,
      timestamp: Date.now(),
    })
  } catch (err: any) {
    console.error("Collaboration stream error:", err)
    return NextResponse.json(
      { error: "Failed to fetch room presence" },
      { status: 500 }
    )
  }
}
