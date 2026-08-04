import { NextResponse } from "next/server"
import { z } from "zod"

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR") {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR")
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access. Please log in.") {
    super(message, 401, "UNAUTHORIZED")
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: You do not have permission to perform this action.") {
    super(message, 403, "FORBIDDEN")
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Requested resource was not found.") {
    super(message, 404, "NOT_FOUND")
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT")
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded. Please wait before trying again.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED")
  }
}

export class InternalServerError extends AppError {
  constructor(message = "An unexpected internal server error occurred.") {
    super(message, 500, "INTERNAL_SERVER_ERROR")
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        status: error.statusCode,
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof z.ZodError) {
    const message = error.errors[0]?.message || "Validation error"
    return NextResponse.json(
      {
        error: message,
        code: "VALIDATION_ERROR",
        status: 400,
        details: error.errors,
      },
      { status: 400 }
    )
  }

  console.error("[Unhandled API Error]:", error)

  const isDev = process.env.NODE_ENV === "development"
  const message = isDev && error instanceof Error ? error.message : "An unexpected server error occurred"

  return NextResponse.json(
    {
      error: message,
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
    },
    { status: 500 }
  )
}
