import bcrypt from "bcryptjs"
import { userRepository } from "@/lib/repositories/user.repository"
import { registerSchema, RegisterInput } from "@/lib/validations"
import { serializeProfilePrivate, ProfilePrivateDTO } from "@/lib/serializers"
import { ConflictError, ValidationError, UnauthorizedError } from "@/lib/errors"
import { logger } from "@/lib/logger"
import { validateEmailStrict } from "@/lib/services/email-validator"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/auth"
import crypto from "crypto"

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

    // 4. Strict Email Validation (Prevent fake emails)
    if (process.env.NODE_ENV !== "development") {
      const validation = await validateEmailStrict(data.email)
      if (!validation.valid) {
        throw new ValidationError(validation.reason || "Please enter a valid, active email address.")
      }
    }

    // 5. Hash password with bcrypt (work factor 12)
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // 5. Create user in database
    const user = await userRepository.create({
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashedPassword,
    })

    // 6. Generate Verification Token and Send Email
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token,
        expires,
      },
    })

    if (resend) {
      const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      const verifyUrl = `${appUrl}/api/auth/verify?token=${token}&email=${encodeURIComponent(user.email!)}`
      
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: user.email!,
          subject: "Verify your email address for 8085 Studio",
          html: `<body style="background: #f9f9f9; padding: 20px;">
                  <div style="background: white; padding: 20px; border-radius: 5px; max-width: 400px; margin: 0 auto;">
                    <h2>Welcome to 8085 Studio!</h2>
                    <p>Please click the button below to verify your email address. You will not be able to log in until you do.</p>
                    <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                  </div>
                </body>`,
        })
      } catch (err) {
        logger.error("Failed to send verification email:", err)
        // We do not fail the registration here, the user can request another email later (if implemented).
      }
    } else {
      logger.warn("Resend is not configured. Verification email was not sent.")
    }

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
