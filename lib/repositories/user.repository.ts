import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/client"

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        aiUsage: true,
        userStats: true,
        _count: {
          select: {
            savedCodes: true,
            challengeProgress: true,
          },
        },
      },
    })
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    })
  }

  async create(data: {
    name?: string
    username?: string
    email: string
    password?: string
    image?: string
  }) {
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        aiUsage: {
          create: { count: 0 },
        },
        userStats: {
          create: {
            totalExecutions: 0,
            programsCreated: 0,
            challengesSolved: 0,
            xp: 0,
            level: 1,
          },
        },
      },
    })
  }

  async updateProfile(id: string, data: { name?: string; username?: string; image?: string | null }) {
    return prisma.user.update({
      where: { id },
      data,
    })
  }

  async updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })
  }

  async getAiUsage(userId: string) {
    return prisma.aIUsage.upsert({
      where: { userId },
      update: {},
      create: { userId, count: 0 },
    })
  }

  async incrementAiUsage(userId: string) {
    return prisma.aIUsage.upsert({
      where: { userId },
      update: {
        count: { increment: 1 },
        lastUsed: new Date(),
      },
      create: {
        userId,
        count: 1,
        lastUsed: new Date(),
      },
    })
  }
}

export const userRepository = new UserRepository()
