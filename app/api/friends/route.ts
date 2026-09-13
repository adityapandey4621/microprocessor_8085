import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all friendships where user is involved
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId1: userId },
          { userId2: userId }
        ]
      },
      include: {
        user1: { select: { id: true, name: true, username: true, image: true } },
        user2: { select: { id: true, name: true, username: true, image: true } }
      }
    })

    const friends = friendships
      .filter((f: any) => f.status === 'ACCEPTED')
      .map((f: any) => f.userId1 === userId ? f.user2 : f.user1)

    const pendingRequests = friendships
      .filter((f: any) => f.status === 'PENDING' && f.userId2 === userId)
      .map((f: any) => ({ id: f.id, user: f.user1, createdAt: f.createdAt }))
      
    const sentRequests = friendships
      .filter((f: any) => f.status === 'PENDING' && f.userId1 === userId)
      .map((f: any) => ({ id: f.id, user: f.user2, createdAt: f.createdAt }))

    return NextResponse.json({ friends, pendingRequests, sentRequests })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUserId } = await req.json()
    const userId = session.user.id

    if (!targetUserId || targetUserId === userId) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId1: userId, userId2: targetUserId },
          { userId1: targetUserId, userId2: userId }
        ]
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Friendship or request already exists' }, { status: 400 })
    }

    const friendship = await prisma.friendship.create({
      data: {
        userId1: userId,
        userId2: targetUserId,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, friendship })
  } catch (error) {
    console.error('Error adding friend:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { friendshipId, action } = await req.json()
    const userId = session.user.id

    if (!friendshipId || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    })

    if (!friendship || friendship.userId2 !== userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    if (action === 'accept') {
      const updated = await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: 'ACCEPTED' }
      })
      return NextResponse.json({ success: true, friendship: updated })
    } else {
      await prisma.friendship.delete({
        where: { id: friendshipId }
      })
      return NextResponse.json({ success: true, action: 'rejected' })
    }
  } catch (error) {
    console.error('Error updating friend request:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
