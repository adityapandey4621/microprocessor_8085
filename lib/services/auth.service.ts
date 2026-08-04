import bcrypt from "bcryptjs"
import { userRepository } from "@/lib/repositories/user.repository"
import { registerSchema, RegisterInput } from "@/lib/validations"
import { serializeProfilePrivate, ProfilePrivateDTO } from "@/lib/serializers"
import { ConflictError, ValidationError, UnauthorizedError } from "@/lib/errors"
import { logger } from "@/lib/logger"

export class AuthService {
  async registerUser(input: RegisterInput): Promise<ProfilePrivateDTO> {
    // 1. Zod Validation
    const parsed = registerSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || "Invalid registration details")
    }
    const data = parsed.data

    // 2. Check for duplicate email
    const existingEmail = await userRepository.findByEmail(data.email)
    if (existingEmail) {
      throw new ConflictError("An account with this email address already exists")
    }

    // 3. Check for duplicate username
    const existingUsername = await userRepository.findByUsername(data.username)
    if (existingUsername) {
      throw new ConflictError("This username is already taken")
    }

    // 4. Hash password with bcrypt (work factor 12)
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // 5. Create user in database
    const user = await userRepository.create({
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashedPassword,
    })

    logger.info(`New user registered successfully: ${user.id}`, {
      userId: user.id,
      username: user.username || undefined,
    })

    return serializeProfilePrivate(user)
  }

  async verifyCredentials(usernameOrEmail: string, passwordPlain: string) {
    if (!usernameOrEmail || !passwordPlain) {
      throw new UnauthorizedError("Please provide both email/username and password")
    }

    // Check by email first, then username
    let user = await userRepository.findByEmail(usernameOrEmail)
    if (!user) {
      user = await userRepository.findByUsername(usernameOrEmail)
    }

    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid email/username or password")
    }

    const isValid = await bcrypt.compare(passwordPlain, user.password)
    if (!isValid) {
      throw new UnauthorizedError("Invalid email/username or password")
    }

    return user
  }
}

export const authService = new AuthService()
