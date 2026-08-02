import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Allow 10 requests per 1 minute per user
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
})

import { z } from "zod"

const aiRequestSchema = z.object({
    prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt must be under 2000 characters"),
    context: z.any().optional(),
    assistantType: z.string().optional(),
    conversationHistory: z.array(z.any()).optional()
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check rate limit
    if (process.env.UPSTASH_REDIS_REST_URL) {
        try {
            const { success } = await ratelimit.limit(session.user.email)
            if (!success) {
                return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 })
            }
        } catch (e) {
            console.error("Rate limiter error:", e)
        }
    }

    // Check usage
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { aiUsage: true }
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (user.aiUsage && user.aiUsage.count >= 100) {
        return NextResponse.json({ error: "AI usage limit reached (100 requests per email)" }, { status: 403 })
    }

    const body = await req.json()
    const result = aiRequestSchema.safeParse(body)

    if (!result.success) {
        return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { prompt: userMessage, context, assistantType, conversationHistory } = result.data
    const apiKey = process.env.GEMINI_API_KEY

    // Construct the full prompt
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
    if (context && typeof context === 'object') {
        fullPrompt += `=== CURRENT EMULATOR CONTEXT ===\n`
        if (context.code) fullPrompt += `Code:\n\`\`\`assembly\n${context.code}\n\`\`\`\n\n`
        if (context.registers) fullPrompt += `Registers: ${JSON.stringify(context.registers)}\n`
        if (context.flags) fullPrompt += `Flags: ${JSON.stringify(context.flags)}\n`
        if (context.consoleOutput) fullPrompt += `Console Output: ${JSON.stringify(context.consoleOutput)}\n`
        if (context.isAssembled !== undefined) fullPrompt += `Is Assembled: ${context.isAssembled}\n`
        if (context.isRunning !== undefined) fullPrompt += `Is Running: ${context.isRunning}\n`
        if (context.assembledCode?.errors) fullPrompt += `Assembly Errors: ${JSON.stringify(context.assembledCode.errors)}\n`
        if (context.ioPorts) fullPrompt += `I/O Ports: ${JSON.stringify(context.ioPorts)}\n`
        if (context.ledValue !== undefined) fullPrompt += `Output Screen (LED bar): ${context.ledValue} (binary: ${context.ledValue.toString(2).padStart(8, '0')})\n`
        if (context.segmentValue !== undefined) fullPrompt += `Output Screen (7-Segment): ${context.segmentValue}\n`
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

    try {
        let generatedText = ""

        // Try Gemini First if API key exists
        if (apiKey) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: fullPrompt }] }]
                        })
                    }
                )

                if (response.ok) {
                    const data = await response.json()
                    generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
                }
            } catch (err) {
                console.error("Gemini failed, falling back to Pollinations", err)
            }
        }

        // Fallback to Free Pollinations API if Gemini failed or is missing
        if (!generatedText) {
            console.log("Using Pollinations API Fallback...")
            const pollinationsResponse = await fetch(`https://text.pollinations.ai/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        { role: "user", content: fullPrompt }
                    ]
                })
            })
            
            if (!pollinationsResponse.ok) {
                throw new Error("Both Gemini and Fallback AI engines failed.")
            }
            generatedText = await pollinationsResponse.text()
            
            // In case the free API returns raw JSON (e.g., {"role":"assistant", "reasoning": "...", "content": "..."})
            try {
                let cleanText = generatedText.trim()
                if (cleanText.startsWith('```json')) {
                    cleanText = cleanText.replace(/^```json\n?/, '').replace(/```$/, '').trim()
                } else if (cleanText.startsWith('```')) {
                    cleanText = cleanText.replace(/^```\n?/, '').replace(/```$/, '').trim()
                }
                const parsed = JSON.parse(cleanText)
                if (parsed.content) generatedText = parsed.content
                else if (parsed.choices?.[0]?.message?.content) generatedText = parsed.choices[0].message.content
                else if (parsed.message?.content) generatedText = parsed.message.content
                else if (parsed.response) generatedText = parsed.response
            } catch (e) {
                // Not JSON, keep raw text
            }
        }

        if (!generatedText) {
            throw new Error("AI returned empty response")
        }

        // Run robust cleaner to strip reasoning blocks and leading JSON structures
        generatedText = cleanAIResponse(generatedText);

        if (!generatedText) {
            // If the response was entirely thinking, fallback to something generic or ask to retry
            generatedText = "I encountered an error formatting my response. Please try asking again."
        }

        // Update usage
        await prisma.aIUsage.upsert({
            where: { userId: user.id },
            update: { count: { increment: 1 }, lastUsed: new Date() },
            create: { userId: user.id, count: 1 }
        })

        // Return `response` to match the frontend expectations
        return NextResponse.json({ response: generatedText })
    } catch (error) {
        console.error("AI Error:", error)
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
    }
}

function cleanAIResponse(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let cleaned = text.trim();

    // 1. Strip out thinking tags: <think>...</think> or <thought>...</thought> or <reasoning>...</reasoning>
    cleaned = cleaned.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, '').trim();

    // 2. Try to extract content if the response is JSON-wrapped (even if malformed or containing unescaped newlines)
    const extracted = extractContentFromJSON(cleaned);
    if (extracted !== null) {
        cleaned = extracted.trim();
    } else {
        // Fallback to standard parsing
        let potentialJson = cleaned;
        if (potentialJson.startsWith('```json')) {
            potentialJson = potentialJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        } else if (potentialJson.startsWith('```')) {
            potentialJson = potentialJson.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
        }

        if (potentialJson.startsWith('{') && potentialJson.endsWith('}')) {
            try {
                const parsed = JSON.parse(potentialJson);
                if (parsed.content && typeof parsed.content === 'string') {
                    cleaned = parsed.content;
                } else if (parsed.response && typeof parsed.response === 'string') {
                    cleaned = parsed.response;
                } else if (parsed.message && typeof parsed.message === 'string') {
                    cleaned = parsed.message;
                } else if (parsed.choices?.[0]?.message?.content && typeof parsed.choices[0].message.content === 'string') {
                    cleaned = parsed.choices[0].message.content;
                } else if (parsed.text && typeof parsed.text === 'string') {
                    cleaned = parsed.text;
                }
            } catch (e) {
                // Not valid JSON, keep as is
            }
        }
    }

    // 3. Strip out text thinking lines like "Thinking:", "Thought:", "Thinking Process:" at the start
    cleaned = cleaned.replace(/^(thinking\s*process|thinking|thought|reasoning):\s*/gi, '').trim();

    // 4. Sometimes the model outputs a JSON block *followed* by markdown content, e.g.:
    const jsonBlockRegex = /^```json\s*\{[\s\S]*?\}\s*```\s*/i;
    if (jsonBlockRegex.test(cleaned)) {
        cleaned = cleaned.replace(jsonBlockRegex, '').trim();
    }

    // Also strip raw JSON object at the start if followed by markdown
    const rawJsonRegex = /^\{[\s\S]*?\}\s*(?=[a-zA-Z0-9#\-\*])/;
    if (rawJsonRegex.test(cleaned)) {
        try {
            const match = cleaned.match(/^\{[\s\S]*?\}/);
            if (match) {
                JSON.parse(match[0]);
                cleaned = cleaned.replace(/^\{[\s\S]*?\}\s*/, '').trim();
            }
        } catch (e) {
            // Not JSON, do nothing
        }
    }

    // 5. Run the existing aggressive sanitizer replacements for safety
    cleaned = cleaned.replace(/^\{\s*"content"\s*:\s*"/, '');
    cleaned = cleaned.replace(/",\s*"tool_calls"\s*:\s*\[\s*\]\s*\}/g, '');
    cleaned = cleaned.replace(/\\n/g, '\n');
    cleaned = cleaned.replace(/\\t/g, '\t');
    cleaned = cleaned.replace(/\\"/g, '"');

    // Run <think> strip again in case it was inside the JSON
    cleaned = cleaned.replace(/<(think|thought|reasoning)>[\s\S]*?<\/\1>/gi, '').trim();

    return cleaned;
}

function extractContentFromJSON(str: string): string | null {
    const keys = ['"content"', '"response"', '"message"'];
    for (const key of keys) {
        const keyPos = str.indexOf(key);
        if (keyPos === -1) continue;
        
        const colonPos = str.indexOf(':', keyPos + key.length);
        if (colonPos === -1) continue;
        
        const openQuotePos = str.indexOf('"', colonPos + 1);
        if (openQuotePos === -1) continue;
        
        let closeQuotePos = -1;
        for (let i = openQuotePos + 1; i < str.length; i++) {
            if (str[i] === '"' && str[i - 1] !== '\\') {
                closeQuotePos = i;
                break;
            }
        }
        
        if (closeQuotePos !== -1) {
            let val = str.substring(openQuotePos + 1, closeQuotePos);
            val = val.replace(/\\n/g, '\n');
            val = val.replace(/\\t/g, '\t');
            val = val.replace(/\\"/g, '"');
            val = val.replace(/\\\\/g, '\\');
            return val;
        }
    }
    return null;
}
