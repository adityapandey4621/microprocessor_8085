import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    )
  }
}
