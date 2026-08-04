import pino from "pino"

const isDev = process.env.NODE_ENV !== "production"

export const pinoLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
})

export interface RequestLogMeta {
  requestId?: string
  route?: string
  userId?: string
  method?: string
  statusCode?: number
  executionTimeMs?: number
  [key: string]: any
}

export const logger = {
  info: (message: string, meta: RequestLogMeta = {}) => {
    pinoLogger.info(meta, message)
  },
  warn: (message: string, meta: RequestLogMeta = {}) => {
    pinoLogger.warn(meta, message)
  },
  error: (message: string, error?: unknown, meta: RequestLogMeta = {}) => {
    const errorDetails =
      error instanceof Error
        ? {
            message: error.message,
            stack: isDev ? error.stack : undefined,
            name: error.name,
          }
        : error

    pinoLogger.error({ ...meta, error: errorDetails }, message)
  },
  logApiRequest: (meta: RequestLogMeta & { route: string; method: string; statusCode: number }) => {
    const msg = `[API] ${meta.method} ${meta.route} -> ${meta.statusCode} (${meta.executionTimeMs || 0}ms)`
    if (meta.statusCode >= 500) {
      pinoLogger.error(meta, msg)
    } else if (meta.statusCode >= 400) {
      pinoLogger.warn(meta, msg)
    } else {
      pinoLogger.info(meta, msg)
    }
  },
}
