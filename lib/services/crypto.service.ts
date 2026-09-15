import crypto from "crypto"

// We use NEXTAUTH_SECRET to derive a secure 32-byte key
const secretKey = Buffer.from(
  (process.env.NEXTAUTH_SECRET || "default_development_secret_only").padEnd(32, '0').slice(0, 32)
)

export function encryptPayload(payload: any): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv)
  
  const text = JSON.stringify(payload)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  
  const authTag = cipher.getAuthTag().toString("hex")
  
  // Return iv:encrypted:authTag
  return `${iv.toString("hex")}:${encrypted}:${authTag}`
}

export function decryptPayload<T = any>(encryptedString: string): T {
  const parts = encryptedString.split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid token format")
  }
  
  const [ivHex, encryptedHex, authTagHex] = parts
  
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm", 
    secretKey, 
    Buffer.from(ivHex, "hex")
  )
  
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"))
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8")
  decrypted += decipher.final("utf8")
  
  return JSON.parse(decrypted) as T
}
