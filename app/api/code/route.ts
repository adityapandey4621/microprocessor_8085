import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { z } from "zod"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Allow 20 code saves per 1 minute per user
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
})

const saveCodeSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long").optional(),
    code: z.string().min(1, "Code is required").max(10000, "Code is too large"),
    id: z.string().optional(),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // @ts-ignore
    if (session.user.id === 'guest-user') {
        return NextResponse.json({ error: "Guests cannot save code. Please sign in." }, { status: 403 })
    }

    if (process.env.UPSTASH_REDIS_REST_URL) {
        try {
            const { success } = await ratelimit.limit(session.user.email)
            if (!success) {
                return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 })
            }
        } catch (e) {
            console.error("Rate limiter error:", e)
        }
    }

    const body = await req.json()
    const result = saveCodeSchema.safeParse(body)

    if (!result.success) {
        return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { title, code, id } = result.data

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let savedCode

    if (id) {
        // IDOR FIX: Verify that the code belongs to the user before updating
        const existingCode = await prisma.savedCode.findUnique({
            where: { id }
        })

        if (!existingCode) {
            return NextResponse.json({ error: "Code not found" }, { status: 404 })
        }

        if (existingCode.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden: You do not own this code" }, { status: 403 })
        }

        // Update existing code
        savedCode = await prisma.savedCode.update({
            where: { id },
            data: { title: title || existingCode.title, code }
        })
    } else {
        // Create new code
        savedCode = await prisma.savedCode.create({
            data: {
                title: title || "Untitled",
                code,
                userId: user.id
            }
        })
    }

    return NextResponse.json(savedCode)
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const savedCodes = await prisma.savedCode.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(savedCodes)
}
