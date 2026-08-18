import { z } from "zod"

// ─── 1. Authentication & Registration Schemas ───────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").trim(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .trim(),
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or Email is required").trim(),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─── 2. User Profile & Password Updates ──────────────────────────────────────
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100, "Name is too long").trim().optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .trim()
    .optional(),
  image: z.string().url("Avatar must be a valid URL").optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
})

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>

// ─── 3. Saved Code & Snippet Schemas ─────────────────────────────────────────
export const saveCodeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long").trim().default("Untitled 8085 Program"),
  description: z.string().max(500, "Description is too long").trim().optional(),
  code: z.string().min(1, "Assembly code cannot be empty").max(20000, "Assembly code is too large"),
  shared: z.boolean().default(false),
  id: z.string().cuid("Invalid snippet ID").optional(),
})

export type SaveCodeInput = z.infer<typeof saveCodeSchema>

export const updateCodeSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(100, "Title is too long").trim().optional(),
  description: z.string().max(500, "Description is too long").trim().optional(),
  code: z.string().min(1, "Assembly code cannot be empty").max(20000, "Assembly code is too large").optional(),
  shared: z.boolean().optional(),
})

export type UpdateCodeInput = z.infer<typeof updateCodeSchema>

// ─── 4. Challenge Submission & Gamification Schemas ──────────────────────────
export const submitChallengeSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required").trim(),
  code: z.string().min(1, "Assembly code is required").max(10000, "Code is too large"),
  executionTimeMs: z.number().nonnegative().optional(),
  cycles: z.number().int().nonnegative().optional(),
})

export type SubmitChallengeInput = z.infer<typeof submitChallengeSchema>

// ─── 5. AI Assistant Request Schema ──────────────────────────────────────────
export const aiGenerateSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt must be under 2000 characters").trim(),
  context: z.any().optional(),
  assistantType: z.string().optional(),
  conversationHistory: z.array(z.any()).optional(),
})

export type AIGenerateInput = z.infer<typeof aiGenerateSchema>

// ─── 6. Common Query & Pagination Schemas ────────────────────────────────────
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
  search: z.string().trim().optional(),
  sort: z.enum(["updatedAt", "createdAt", "title"]).default("updatedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
})

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>
