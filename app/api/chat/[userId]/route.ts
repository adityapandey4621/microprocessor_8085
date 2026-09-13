import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const otherUserId = params.userId

    if (!otherUserId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }

    // Verify friendship exists and is accepted
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId1: currentUserId, userId2: otherUserId, status: 'ACCEPTED' },
          { userId1: otherUserId, userId2: currentUserId, status: 'ACCEPTED' }
        ]
      }
    })

    if (!friendship) {
      return NextResponse.json({ error: 'Not friends' }, { status: 403 })
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      take: 100 // Limit to last 100 for now
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await req.json()
    const currentUserId = session.user.id
    const otherUserId = params.userId

    if (!content || !content.trim() || !otherUserId) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 })
    }

    // Verify friendship exists and is accepted
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId1: currentUserId, userId2: otherUserId, status: 'ACCEPTED' },
          { userId1: otherUserId, userId2: currentUserId, status: 'ACCEPTED' }
        ]
      }
    })

    if (!friendship) {
      return NextResponse.json({ error: 'Not friends' }, { status: 403 })
    }

    // Create message (Supabase Realtime will broadcast this since it's an insert)
    const message = await prisma.message.create({
      data: {
        senderId: currentUserId,
        receiverId: otherUserId,
        content: content.trim()
      }
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
