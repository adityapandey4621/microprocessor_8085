import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export class CodeRepository {
  async findById(id: string) {
    return prisma.savedCode.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            role: true,
          },
        },
      },
    })
  }

  async create(data: {
    userId: string
    title: string
    description?: string
    code: string
    shared?: boolean
  }) {
    return prisma.$transaction(async (tx) => {
      const codeItem = await tx.savedCode.create({
        data: {
          userId: data.userId,
          title: data.title,
          description: data.description || "",
          code: data.code,
          shared: Boolean(data.shared),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
      })

      // Increment programsCreated user stat
      await tx.userStats.upsert({
        where: { userId: data.userId },
        update: {
          programsCreated: { increment: 1 },
          xp: { increment: 10 },
          lastActive: new Date(),
        },
        create: {
          userId: data.userId,
          programsCreated: 1,
          xp: 10,
          lastActive: new Date(),
        },
      })

      return codeItem
    })
  }

  async update(
    id: string,
    data: {
      title?: string
      description?: string
      code?: string
      shared?: boolean
    }
  ) {
    return prisma.savedCode.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            role: true,
          },
        },
      },
    })
  }

  async delete(id: string) {
    return prisma.savedCode.delete({
      where: { id },
    })
  }

  async findByUser(
    userId: string,
    options: {
      page: number
      limit: number
      search?: string
      sort?: string
      order?: "asc" | "desc"
    }
  ) {
    const { page, limit, search, sort = "updatedAt", order = "desc" } = options
    const skip = (page - 1) * limit

    const where: Prisma.SavedCodeWhereInput = {
      userId,
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.savedCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
      }),
      prisma.savedCode.count({ where }),
    ])

    return { items, total }
  }

  async findShared(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options
    const skip = (page - 1) * limit

    const where: Prisma.SavedCodeWhereInput = {
      shared: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { user: { name: { contains: search } } },
              { user: { username: { contains: search } } },
            ],
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.savedCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              role: true,
            },
          },
        },
      }),
      prisma.savedCode.count({ where }),
    ])

    return { items, total }
  }
}

export const codeRepository = new CodeRepository()
