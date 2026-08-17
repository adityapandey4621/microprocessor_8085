import { useState, useEffect } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AIAssistantState {
  tokens: number;
  messagesUsed: number;
  maxMessagesPerSession: number;
  sessionActive: boolean;
  conversation: Message[];
  loading: boolean;
  error: string | null;
  statusMessage?: string | null;
}

export interface AIContext {
  code: string;
  registers: any;
  flags: any;
  consoleOutput?: string[];
  assembledCode?: any;
  isRunning?: boolean;
  isAssembled?: boolean;
  memory?: Uint8Array;
  ioPorts?: Record<string, string>;
  ledValue?: number;
  segmentValue?: string;
}

const AI_INSTRUCTIONS = {
  GUIDED_HELP: `You are an Elite 10x 8085 Microprocessor Engineer and an exceptional AI Tutor. 
1. Your goal is to be profoundly self-sufficient, effortlessly grasping the user's intent, and providing hyper-accurate, contextual, and intelligent replies.
2. Carefully analyze the provided code, memory states, registers, flags, and assembled output.
3. If the user asks you to write code, fix a bug, or add comments, you MUST output the fully commented, highly optimized code inside an \`\`\`assembly ... \`\`\` block.
4. Explain the code elegantly, mirroring the flow of the code and the underlying architecture.
5. Provide correct opcodes, addressing modes, and cycle counts if relevant.`,

  CODE_REVIEW: `Perform an expert-level architectural review of the user's 8085 assembly code:
1. Identify logic flaws, suboptimal register usage, syntax errors, and flag mismanagement.
2. For any fixes, provide the entirely corrected and optimized code in an \`\`\`assembly ... \`\`\` block.
3. Automatically add clear, professional comments to explain the code flow if asked.
4. Predict potential runtime crashes or memory overwrites based on the provided state.`,

  DEBUGGING: `You are an elite debugging assistant for an 8085 emulator:
1. Synthesize the provided context: current registers, flags, console output, assembly status, and memory states to pinpoint the exact failure.
2. Explain the root cause clearly and concisely.
3. Output the perfectly fixed code in an \`\`\`assembly ... \`\`\` block with comments explaining the fix.`,
};

export const useAIAssistant = () => {
  const [state, setState] = useState<AIAssistantState>({
    tokens: 5,
    messagesUsed: 0,
    maxMessagesPerSession: 5,
    sessionActive: false,
    conversation: [],
    loading: false,
    error: null,
    statusMessage: null,
  });

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aiAssistantState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          tokens: parsed.messagesUsed ? 5 - parsed.messagesUsed : 5,
          messagesUsed: parsed.messagesUsed || 0,
          conversation: parsed.conversation || [],
          sessionActive: parsed.conversation && parsed.conversation.length > 0,
        }));
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(
      'aiAssistantState',
      JSON.stringify({
        tokens: state.tokens,
        messagesUsed: state.messagesUsed,
        conversation: state.conversation,
      })
    );
  }, [state.tokens, state.messagesUsed, state.conversation]);

  const canUseAssistant = (): boolean => {
    return state.messagesUsed < state.maxMessagesPerSession;
  };

  const startSession = async (
    userMessage: string,
    assistantType: 'guided' | 'review' | 'debug' = 'guided',
    context?: AIContext
  ): Promise<string | null> => {
    if (!canUseAssistant()) {
      setState((prev) => ({
        ...prev,
        error: 'No AI messages remaining. The limit is 5 messages.',
      }));
      return null;
    }

    const userMsgObj: Message = {
      id: Date.now() + '_user',
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    // Add user message to conversation immediately and set loading to true
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      statusMessage: 'Calling AI API...',
      conversation: [...prev.conversation, userMsgObj],
    }));

    try {
      // Call the API with updated history containing the new user message
      const response = await callAIService(
        userMessage, 
        assistantType, 
        [...state.conversation, userMsgObj], 
        context,
        (msg: string) => setState(prev => ({ ...prev, statusMessage: msg }))
      );

      if (!response) {
        throw new Error('Failed to get response from AI service');
      }

      setState((prev) => {
        const newMessagesUsed = prev.messagesUsed + 1;
        const newTokens = 5 - newMessagesUsed;

        return {
          ...prev,
          tokens: newTokens,
          messagesUsed: newMessagesUsed,
          sessionActive: true,
          conversation: [
            ...prev.conversation,
            {
              id: Date.now() + '_assistant',
              role: 'assistant',
              content: response,
              timestamp: Date.now(),
            },
          ],
          loading: false,
        };
      });

      return response;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
      return null;
    }
  };

  const addTokens = (amount: number): void => {
    setState((prev) => ({
      ...prev,
      tokens: prev.tokens + amount,
    }));
  };

  const resetSession = (): void => {
    setState((prev) => ({
      ...prev,
      conversation: [],
      sessionActive: false,
      error: null,
    }));
  };

  return {
    ...state,
    startSession,
    addTokens,
    resetSession,
    canUseAssistant,
  };
};

// We are removing the unstable client-side WebLLM and delegating entirely to the Smart Backend API.

// Actual API call with Fallback
async function callAIService(
  userMessage: string,
  assistantType: 'guided' | 'review' | 'debug',
  conversationHistory: Message[],
  context?: AIContext,
  onProgress?: (msg: string) => void
): Promise<string> {
  const systemPrompt = {
    guided: AI_INSTRUCTIONS.GUIDED_HELP,
    review: AI_INSTRUCTIONS.CODE_REVIEW,
    debug: AI_INSTRUCTIONS.DEBUGGING,
  }[assistantType];

  let fullPrompt = `System Prompt: ${systemPrompt}\n\n`;
  
  if (context) {
    fullPrompt += `=== CURRENT EMULATOR CONTEXT ===\nCode:\n\`\`\`assembly\n${context.code}\n\`\`\`\n\n`;
    fullPrompt += `Registers: ${JSON.stringify(context.registers)}\n`;
    fullPrompt += `Flags: ${JSON.stringify(context.flags)}\n`;
    if (context.consoleOutput) fullPrompt += `Console Output: ${JSON.stringify(context.consoleOutput)}\n`;
    if (context.isAssembled !== undefined) fullPrompt += `Is Assembled: ${context.isAssembled}\n`;
    if (context.isRunning !== undefined) fullPrompt += `Is Running: ${context.isRunning}\n`;
    if (context.assembledCode?.errors) fullPrompt += `Assembly Errors: ${JSON.stringify(context.assembledCode.errors)}\n`;
    if (context.ioPorts) fullPrompt += `I/O Ports: ${JSON.stringify(context.ioPorts)}\n`;
    if (context.ledValue !== undefined) fullPrompt += `Output Screen (LED bar): ${context.ledValue} (binary: ${context.ledValue.toString(2).padStart(8, '0')})\n`;
    if (context.segmentValue !== undefined) fullPrompt += `Output Screen (7-Segment): ${context.segmentValue}\n`;
    if (context.memory) {
      const nonZeroMem: Record<string, string> = {};
      let count = 0;
      for (let i = 0; i < context.memory.length; i++) {
        if (context.memory[i] !== 0) {
          nonZeroMem[i.toString(16).toUpperCase().padStart(4, '0') + 'H'] = 
            context.memory[i].toString(16).toUpperCase().padStart(2, '0') + 'H';
          count++;
          if (count > 150) break;
        }
      }
      fullPrompt += `Non-Zero Memory Locations: ${JSON.stringify(nonZeroMem)}\n`;
    }
    fullPrompt += `=================================\n\n`;
  }
  
  if (conversationHistory.length > 0) {
    fullPrompt += `Conversation History:\n`;
    conversationHistory.slice(-5).forEach(m => {
      fullPrompt += `${m.role}: ${m.content}\n`;
    });
    fullPrompt += `\n`;
  }

  fullPrompt += `User: ${userMessage}\nAssistant:`;
  // Real AI API Call
  try {
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userMessage,
        context: context ? {
          ...context,
          memory: context.memory ? (() => {
            const nonZeroMem: Record<string, string> = {};
            let count = 0;
            for (let i = 0; i < context.memory.length; i++) {
              if (context.memory[i] !== 0) {
                nonZeroMem[i.toString(16).toUpperCase().padStart(4, '0') + 'H'] = 
                  context.memory[i].toString(16).toUpperCase().padStart(2, '0') + 'H';
                count++;
                if (count > 150) break;
              }
            }
            return nonZeroMem;
          })() : undefined
        } : undefined,
        assistantType,
        conversationHistory: conversationHistory.slice(-10),
      }),
    });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          throw new Error("You have reached your maximum limit of 5 AI messages.");
        }
        throw new Error(errorData.error || "I'm currently unable to reach my language backend. Please try again later.");
      }

      const data = await response.json()
      return data.response
    } catch (err: any) {
      console.error("API call failed:", err)
      throw new Error(err.message || "Network error or AI service is temporarily unavailable.")
    }


}
