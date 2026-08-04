import { userRepository } from "@/lib/repositories/user.repository"
import { aiGenerateSchema, AIGenerateInput } from "@/lib/validations"
import { ForbiddenError, ValidationError, InternalServerError } from "@/lib/errors"
import { logger } from "@/lib/logger"

export class AIService {
  async generateResponse(userId: string, input: AIGenerateInput): Promise<{ response: string }> {
    const parsed = aiGenerateSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0]?.message || "Invalid AI prompt data")
    }

    const { prompt: userMessage, context, assistantType, conversationHistory } = parsed.data

    // 1. Check user usage limit (max 100 requests)
    const usage = await userRepository.getAiUsage(userId)
    if (usage.count >= 100) {
      throw new ForbiddenError("AI usage limit reached (max 100 requests per user)")
    }

    // 2. Build full prompt
    let fullPrompt = `You are an expert 8085 Microprocessor Assembly language tutor/assistant.
CRITICAL 8085 RULES:
1. When providing code, ALWAYS wrap it in \`\`\`assembly ... \`\`\`
2. Use strict standard 8085 opcodes. (e.g., Use XRI to XOR an immediate value, NOT XRA. XRA only takes a register).
3. Use standard semicolons ';' for comments, not // or /* */.
4. Output highly optimized, perfectly valid code.
5. You have full visibility of the user's console errors, registers, memory, output screens, and I/O ports via the 'Current Code Context' below. If you see assembly or runtime errors, you should autonomously debug them and provide the fully corrected code. The user has a 1-click 'Apply to Editor' button, so output the complete fixed program when fixing bugs.
6. IMPORTANT: Respond in plain markdown text. DO NOT output raw JSON format (e.g. do not output {"role": "assistant", ...}).
7. DO NOT output any reasoning, thinking process, or thoughts block in the final response. Only output the direct helpful response.
8. DO NOT wrap the output in a JSON container. Output standard markdown directly.
9. CRITICAL ERROR REACTION: If the "Console Output" or "Assembly Errors" contains '[ERROR]' or syntax errors, you MUST address and explain them FIRST. Explain the architectural error and provide the complete fixed program inside an \`\`\`assembly ... \`\`\` code block so the user can click 'Apply to Editor'.
\n`

    if (assistantType) {
      fullPrompt += `Mode: ${assistantType}\n`
    }
    if (context && typeof context === "object") {
      fullPrompt += `=== CURRENT EMULATOR CONTEXT ===\n`
      if (context.code) fullPrompt += `Code:\n\`\`\`assembly\n${context.code}\n\`\`\`\n\n`
      if (context.registers) fullPrompt += `Registers: ${JSON.stringify(context.registers)}\n`
      if (context.flags) fullPrompt += `Flags: ${JSON.stringify(context.flags)}\n`
      if (context.consoleOutput) fullPrompt += `Console Output: ${JSON.stringify(context.consoleOutput)}\n`
      if (context.isAssembled !== undefined) fullPrompt += `Is Assembled: ${context.isAssembled}\n`
      if (context.isRunning !== undefined) fullPrompt += `Is Running: ${context.isRunning}\n`
      if (context.assembledCode?.errors)
        fullPrompt += `Assembly Errors: ${JSON.stringify(context.assembledCode.errors)}\n`
      if (context.ioPorts) fullPrompt += `I/O Ports: ${JSON.stringify(context.ioPorts)}\n`
      if (context.ledValue !== undefined)
        fullPrompt += `Output Screen (LED bar): ${context.ledValue} (binary: ${context.ledValue.toString(2).padStart(8, "0")})\n`
      if (context.segmentValue !== undefined)
        fullPrompt += `Output Screen (7-Segment): ${context.segmentValue}\n`
      if (context.memory) fullPrompt += `Non-Zero Memory Locations: ${JSON.stringify(context.memory)}\n`
      fullPrompt += `=================================\n\n`
    } else if (context) {
      fullPrompt += `Current Code Context:\n${context}\n\n`
    }

    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      fullPrompt += `Conversation History:\n`
      conversationHistory.forEach((m: any) => {
        fullPrompt += `${m.role}: ${m.content}\n`
      })
      fullPrompt += `\n`
    }
    fullPrompt += `User Request: ${userMessage}\n`

    const apiKey = process.env.GEMINI_API_KEY
    let generatedText = ""

    // 3. Try Gemini first
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        }
      } catch (err) {
        logger.error("Gemini AI API call failed, attempting fallback:", err)
      }
    }

    // 4. Fallback to free Pollinations API
    if (!generatedText) {
      try {
        const pollinationsResponse = await fetch(`https://text.pollinations.ai/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: fullPrompt }],
          }),
        })

        if (pollinationsResponse.ok) {
          generatedText = await pollinationsResponse.text()
        }
      } catch (err) {
        logger.error("Fallback Pollinations AI call failed:", err)
      }
    }

    if (!generatedText) {
      throw new InternalServerError("Both primary and fallback AI engines failed to generate a response.")
    }

    // 5. Clean output
    generatedText = this.cleanAIResponse(generatedText)
    if (!generatedText) {
      generatedText = "I encountered an error formatting my response. Please try asking again."
    }

    // 6. Increment user usage count
    await userRepository.incrementAiUsage(userId)

    logger.info(`AI generated response for user ${userId}`, { userId })

    return { response: generatedText }
  }

  private cleanAIResponse(text: string): string {
    if (!text || typeof text !== "string") return ""

    let cleaned = text.trim()

    // 1. Strip out thinking tags: <think>...</think> or <thought>...</thought>
    cleaned = cleaned.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "").trim()

    // 2. Try to extract content if JSON wrapped
    const extracted = this.extractContentFromJSON(cleaned)
    if (extracted !== null) {
      cleaned = extracted.trim()
    } else {
      let potentialJson = cleaned
      if (potentialJson.startsWith("```json")) {
        potentialJson = potentialJson.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim()
      } else if (potentialJson.startsWith("```")) {
        potentialJson = potentialJson.replace(/^```\s*/, "").replace(/\s*```$/, "").trim()
      }

      if (potentialJson.startsWith("{") && potentialJson.endsWith("}")) {
        try {
          const parsed = JSON.parse(potentialJson)
          if (parsed.content && typeof parsed.content === "string") {
            cleaned = parsed.content
          } else if (parsed.response && typeof parsed.response === "string") {
            cleaned = parsed.response
          } else if (parsed.message && typeof parsed.message === "string") {
            cleaned = parsed.message
          } else if (
            parsed.choices?.[0]?.message?.content &&
            typeof parsed.choices[0].message.content === "string"
          ) {
            cleaned = parsed.choices[0].message.content
          }
        } catch (e) {
          // Keep raw text
        }
      }
    }

    cleaned = cleaned.replace(/^(thinking\s*process|thinking|thought|reasoning):\s*/gi, "").trim()

    const jsonBlockRegex = /^```json\s*\{[\s\S]*?\}\s*```\s*/i
    if (jsonBlockRegex.test(cleaned)) {
      cleaned = cleaned.replace(jsonBlockRegex, "").trim()
    }

    cleaned = cleaned.replace(/^\{\s*"content"\s*:\s*"/, "")
    cleaned = cleaned.replace(/",\s*"tool_calls"\s*:\s*\[\s*\]\s*\}/g, "")
    cleaned = cleaned.replace(/\\n/g, "\n")
    cleaned = cleaned.replace(/\\t/g, "\t")
    cleaned = cleaned.replace(/\\"/g, '"')
    cleaned = cleaned.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, "").trim()

    return cleaned
  }

  private extractContentFromJSON(str: string): string | null {
    const keys = ['"content"', '"response"', '"message"']
    for (const key of keys) {
      const keyPos = str.indexOf(key)
      if (keyPos === -1) continue

      const colonPos = str.indexOf(":", keyPos + key.length)
      if (colonPos === -1) continue

      const openQuotePos = str.indexOf('"', colonPos + 1)
      if (openQuotePos === -1) continue

      let closeQuotePos = -1
      for (let i = openQuotePos + 1; i < str.length; i++) {
        if (str[i] === '"' && str[i - 1] !== "\\") {
          closeQuotePos = i
          break
        }
      }

      if (closeQuotePos !== -1) {
        let val = str.substring(openQuotePos + 1, closeQuotePos)
        val = val.replace(/\\n/g, "\n")
        val = val.replace(/\\t/g, "\t")
        val = val.replace(/\\"/g, '"')
        val = val.replace(/\\\\/g, "\\")
        return val
      }
    }
    return null
  }
}

export const aiService = new AIService()
