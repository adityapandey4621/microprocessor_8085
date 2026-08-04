import { codeRepository } from "@/lib/repositories/code.repository"
import {
  saveCodeSchema,
  updateCodeSchema,
  paginationQuerySchema,
  SaveCodeInput,
  UpdateCodeInput,
  PaginationQueryInput,
} from "@/lib/validations"
import {
  serializeCode,
  serializeGalleryItem,
  serializePaginated,
  CodeDTO,
  GalleryDTO,
  PaginatedResponseDTO,
} from "@/lib/serializers"
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/errors"
import { logger } from "@/lib/logger"
import { BUILTIN_GALLERY_ITEMS } from "@/lib/builtin-gallery"

export class CodeService {
  async createCode(userId: string, input: SaveCodeInput): Promise<CodeDTO> {
    const parsed = saveCodeSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || "Invalid snippet data")
    }
    const data = parsed.data

    const created = await codeRepository.create({
      userId,
      title: data.title,
      description: data.description,
      code: data.code,
      shared: data.shared,
    })

    logger.info(`Saved new code snippet: ${created.id} by user ${userId}`, {
      userId,
      codeId: created.id,
    })

    return serializeCode(created, userId)
  }

  async getCode(id: string, currentUserId?: string | null): Promise<CodeDTO> {
    const codeItem = await codeRepository.findById(id)
    if (!codeItem) {
      throw new NotFoundError("Code snippet not found")
    }

    // Authorization check: public if shared, otherwise only author can view
    if (!codeItem.shared && codeItem.userId !== currentUserId) {
      throw new ForbiddenError("You do not have permission to view this private code snippet")
    }

    return serializeCode(codeItem, currentUserId)
  }

  async updateCode(id: string, currentUserId: string, input: UpdateCodeInput): Promise<CodeDTO> {
    const parsed = updateCodeSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || "Invalid update data")
    }
    const data = parsed.data

    const existing = await codeRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Code snippet not found")
    }

    if (existing.userId !== currentUserId) {
      throw new ForbiddenError("You do not have permission to edit this code snippet")
    }

    const updated = await codeRepository.update(id, data)

    logger.info(`Updated code snippet: ${id}`, { userId: currentUserId, codeId: id })

    return serializeCode(updated, currentUserId)
  }

  async deleteCode(id: string, currentUserId: string): Promise<{ success: boolean }> {
    const existing = await codeRepository.findById(id)
    if (!existing) {
      throw new NotFoundError("Code snippet not found")
    }

    if (existing.userId !== currentUserId) {
      throw new ForbiddenError("You do not have permission to delete this code snippet")
    }

    await codeRepository.delete(id)

    logger.info(`Deleted code snippet: ${id}`, { userId: currentUserId, codeId: id })

    return { success: true }
  }

  async getUserCodes(
    userId: string,
    query: Partial<PaginationQueryInput>
  ): Promise<PaginatedResponseDTO<CodeDTO>> {
    const parsed = paginationQuerySchema.safeParse(query)
    const { page, limit, search, sort, order } = parsed.success ? parsed.data : paginationQuerySchema.parse({})

    const { items, total } = await codeRepository.findByUser(userId, {
      page,
      limit,
      search,
      sort,
      order,
    })

    const dtos = items.map((it) => serializeCode(it, userId))
    return serializePaginated(dtos, total, page, limit)
  }

  async getGalleryCodes(query: Partial<PaginationQueryInput>): Promise<PaginatedResponseDTO<GalleryDTO>> {
    const parsed = paginationQuerySchema.safeParse(query)
    const { page, limit, search } = parsed.success ? parsed.data : paginationQuerySchema.parse({})

    const { items, total } = await codeRepository.findShared({ page, limit, search })

    let dtos = items.map(serializeGalleryItem)
    let totalCount = total

    // Fallback/Merge with built-in system 8085 gallery programs if DB gallery is empty
    if (dtos.length === 0) {
      const filteredBuiltin = BUILTIN_GALLERY_ITEMS.filter(
        (it) =>
          !search ||
          it.title.toLowerCase().includes(search.toLowerCase()) ||
          it.authorName.toLowerCase().includes(search.toLowerCase()) ||
          (it.description && it.description.toLowerCase().includes(search.toLowerCase()))
      )
      dtos = filteredBuiltin.slice((page - 1) * limit, page * limit).map((it) => ({
        ...it,
        description: it.description || "",
      }))
      totalCount = filteredBuiltin.length
    }

    return serializePaginated(dtos, totalCount, page, limit)
  }
}

export const codeService = new CodeService()
