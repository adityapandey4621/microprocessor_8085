import bcrypt from "bcryptjs"
import { userRepository } from "@/lib/repositories/user.repository"
import { updateProfileSchema, updatePasswordSchema, UpdateProfileInput, UpdatePasswordInput } from "@/lib/validations"
import { serializeProfilePrivate, ProfilePrivateDTO } from "@/lib/serializers"
import { NotFoundError, ConflictError, UnauthorizedError, ValidationError } from "@/lib/errors"
import { logger } from "@/lib/logger"

export class UserService {
  async getProfile(userId: string): Promise<ProfilePrivateDTO> {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError("User profile not found")
    }
    return serializeProfilePrivate(user)
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfilePrivateDTO> {
    const parsed = updateProfileSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || "Invalid profile data")
    }
    const data = parsed.data

    // Check if new username is taken by someone else
    if (data.username) {
      const existingUser = await userRepository.findByUsername(data.username)
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("Username is already taken by another user")
      }
    }

    const updatedUser = await userRepository.updateProfile(userId, {
      name: data.name,
      username: data.username,
      image: data.image,
    })

    logger.info(`User profile updated: ${userId}`, { userId })

    return serializeProfilePrivate(updatedUser)
  }

  async updatePassword(userId: string, input: UpdatePasswordInput): Promise<{ success: boolean; message: string }> {
    const parsed = updatePasswordSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || "Invalid password data")
    }
    const { currentPassword, newPassword } = parsed.data

    const user = await userRepository.findById(userId)
    if (!user || !user.password) {
      throw new NotFoundError("User not found or uses OAuth authentication")
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      throw new UnauthorizedError("Incorrect current password")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await userRepository.updatePassword(userId, hashedPassword)

    logger.info(`User changed password successfully: ${userId}`, { userId })

    return { success: true, message: "Password updated successfully" }
  }
}

export const userService = new UserService()
