// ─── DTO Type Definitions ──────────────────────────────────────────────────
export interface UserPublicDTO {
  id: string
  name: string | null
  username: string | null
  image: string | null
  role: string
}

export interface ProfilePrivateDTO extends UserPublicDTO {
  email: string | null
  emailVerified: string | null
  aiUsageCount: number
  savedCodesCount?: number
  challengesSolvedCount?: number
}

export interface CodeDTO {
  id: string
  title: string
  description?: string
  code: string
  shared: boolean
  createdAt: string
  updatedAt: string
  author?: UserPublicDTO
  isOwner?: boolean
}

export interface GalleryDTO {
  id: string
  title: string
  description: string
  code: string
  authorName: string
  authorUsername?: string | null
  authorImage?: string | null
  updatedAt: string
}

export interface ChallengeProgressDTO {
  id: string
  challengeId: string
  completedAt: string
  score: number
  code?: string | null
}

export interface PaginatedResponseDTO<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Serializer Transformations ──────────────────────────────────────────────
export function serializeUserPublic(user: any): UserPublicDTO {
  return {
    id: user.id,
    name: user.name || null,
    username: user.username || null,
    image: user.image || null,
    role: user.role || "USER",
  }
}

export function serializeProfilePrivate(user: any): ProfilePrivateDTO {
  return {
    id: user.id,
    name: user.name || null,
    username: user.username || null,
    image: user.image || null,
    role: user.role || "USER",
    email: user.email || null,
    emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
    aiUsageCount: user.aiUsage?.count || 0,
    savedCodesCount: user._count?.savedCodes || user.savedCodes?.length || 0,
    challengesSolvedCount: user._count?.challengeProgress || user.challengeProgress?.length || 0,
  }
}

export function serializeCode(codeItem: any, currentUserId?: string | null): CodeDTO {
  const author = codeItem.user ? serializeUserPublic(codeItem.user) : undefined
  const isOwner = Boolean(currentUserId && codeItem.userId === currentUserId)

  return {
    id: codeItem.id,
    title: codeItem.title || "Untitled",
    description: codeItem.description || undefined,
    code: codeItem.code,
    shared: Boolean(codeItem.shared),
    createdAt: new Date(codeItem.createdAt).toISOString(),
    updatedAt: new Date(codeItem.updatedAt).toISOString(),
    author,
    isOwner,
  }
}

export function serializeGalleryItem(codeItem: any): GalleryDTO {
  return {
    id: codeItem.id,
    title: codeItem.title || "Untitled",
    description: codeItem.description || "",
    code: codeItem.code,
    authorName: codeItem.user?.name || "SYS-COMMUNITY",
    authorUsername: codeItem.user?.username || null,
    authorImage: codeItem.user?.image || null,
    updatedAt: new Date(codeItem.updatedAt).toISOString().split("T")[0],
  }
}

export function serializeChallengeProgress(item: any): ChallengeProgressDTO {
  return {
    id: item.id,
    challengeId: item.challengeId,
    completedAt: new Date(item.completedAt).toISOString(),
    score: item.score || 100,
    code: item.code || null,
  }
}

export function serializePaginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponseDTO<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return {
    items,
    total,
    page,
    limit,
    totalPages,
  }
}
