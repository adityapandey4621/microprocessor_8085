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
    tokens: 0,
    messagesUsed: 0,
    maxMessagesPerSession: 100, // Updated to 100
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
          tokens: parsed.tokens || 0,
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
    return state.tokens > 0 || state.messagesUsed < state.maxMessagesPerSession;
  };

  const startSession = async (
    userMessage: string,
    assistantType: 'guided' | 'review' | 'debug' = 'guided',
    context?: AIContext
  ): Promise<string | null> => {
    if (!canUseAssistant()) {
      setState((prev) => ({
        ...prev,
        error: 'No tokens available. Please purchase tokens to continue.',
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

      // Update state with assistant response
      setState((prev) => {
        const newMessagesUsed = prev.tokens > 0 ? prev.messagesUsed : prev.messagesUsed + 1;
        const newTokens = prev.tokens > 0 ? Math.max(0, prev.tokens - 1) : prev.tokens;

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

    if (response.ok) {
      const data = await response.json();
      return data.response;
    }
    
    // If the backend fails entirely, fall back to basic rules
    console.warn("Backend AI failed, falling back to basic rules");
  } catch (err) {
    console.error("API call failed:", err);
  }

  // Final fallback response if network completely drops
  return generateAssistantResponse(userMessage, assistantType, context);
}

function generateAssistantResponse(
  userMessage: string,
  assistantType: 'guided' | 'review' | 'debug',
  context?: AIContext
): string {
  const lowerMessage = userMessage.toLowerCase();

  // 1. Code Generation for common 8085 problems
  if (lowerMessage.includes('write') || lowerMessage.includes('code') || lowerMessage.includes('program')) {
    if (lowerMessage.includes('add') && lowerMessage.includes('two')) {
      return `Here is a program to add two numbers.

\`\`\`assembly
; Program to Add Two 8-bit Numbers
LXI H, 2000H  ; Load address 2000H in HL pair
MOV A, M      ; Move first number to Accumulator
INX H         ; Increment HL pair to point to next memory location
ADD M         ; Add second number to Accumulator
INX H         ; Increment HL pair to store result
MOV M, A      ; Store result in memory
HLT           ; Halt execution
\`\`\`

You can apply this to the editor and test it!`;
    }
    if (lowerMessage.includes('subtract')) {
      return `Here is a program to subtract two numbers.

\`\`\`assembly
; Program to Subtract Two 8-bit Numbers
LXI H, 2000H  ; Point HL to 2000H
MOV A, M      ; Load first number into A
INX H         ; Point HL to next memory location
SUB M         ; Subtract second number from A
INX H         ; Point to destination
MOV M, A      ; Store the result
HLT           ; Halt execution
\`\`\`
`;
    }
    if (lowerMessage.includes('multiply') || lowerMessage.includes('multiplication')) {
      return `Here is a program to multiply two 8-bit numbers (using successive addition).

\`\`\`assembly
; Program to Multiply Two Numbers
LXI H, 2000H  ; Point to first number
MOV B, M      ; Load first number into B (Counter)
INX H         ; Point to second number
MOV C, M      ; Load second number into C (Number to add)
MVI A, 00H    ; Clear Accumulator for result

MULTIPLY_LOOP:
ADD C         ; Add the number to Accumulator
DCR B         ; Decrement counter
JNZ MULTIPLY_LOOP ; Repeat until counter is zero

INX H         ; Point to result location
MOV M, A      ; Store result
HLT           ; Halt execution
\`\`\`
`;
    }
  }

  // 2. Syntax Error Analysis & Debugging
  if ((assistantType === 'debug' || assistantType === 'review' || lowerMessage.includes('error') || lowerMessage.includes('wrong') || lowerMessage.includes('bug')) && context?.assembledCode?.errors?.length > 0) {
    const errorDetails = context?.assembledCode?.errors.map((err: any) => `- Line ${err.line}: ${err.message}`).join('\\n');
    return `I detected syntax errors in your code during assembly. Please fix these issues:\n\n${errorDetails}\n\nOnce fixed, try running the code again!`;
  }

  // 3. Smart Code Review (when no syntax errors)
  if (assistantType === 'review' || lowerMessage.includes('review')) {
    if (context && context.code) {
      let issues = [];
      if (!context.code.toUpperCase().includes('HLT')) {
        issues.push('- ⚠️ **Missing HLT:** Your program does not seem to end with a HLT instruction, which will cause it to run indefinitely.');
      }
      if (context.code.toUpperCase().includes('MOV M, M')) {
        issues.push('- ⚠️ **Invalid MOV M, M:** You cannot move memory to memory directly (MOV M, M is an invalid/halting opcode).');
      }
      
      const lineCount = context.code.split('\\n').filter(l => l.trim() && !l.trim().startsWith(';')).length;
      
      if (issues.length > 0) {
        return `Code Review Analysis:\n\n✓ **Structure:** Found ${lineCount} instructions.\n\n${issues.join('\\n')}\n\nI recommend fixing these issues to prevent unexpected behavior.`;
      }
      
      return `Code Review Analysis:\n\n✓ **Structure:** Found ${lineCount} instructions.\n✓ **Status:** Code assembled successfully without syntax errors!\n\nYour code looks solid architecturally!`;
    }
  }

  // 4. Smart Auto-Commenting Feature
  if (lowerMessage.includes('comment') || lowerMessage.includes('explain')) {
      const codeToComment = context?.code || 'MVI A, 42H\\nHLT';
      const commentedCode = codeToComment.split('\\n').map(line => {
        if (!line.trim() || line.includes(';')) return line;
        const upper = line.toUpperCase();
        let comment = ' ; Execute operation';
        if (upper.includes('MVI A')) comment = ' ; Load immediate value into Accumulator';
        else if (upper.startsWith('LXI')) comment = ' ; Load 16-bit address into register pair';
        else if (upper.startsWith('INX')) comment = ' ; Increment register pair';
        else if (upper.startsWith('DCX')) comment = ' ; Decrement register pair';
        else if (upper.includes('HLT')) comment = ' ; Halt the execution';
        else if (upper.startsWith('MOV B, A')) comment = ' ; Copy Accumulator to register B';
        else if (upper.startsWith('MOV M, A')) comment = ' ; Store Accumulator value into Memory';
        else if (upper.startsWith('MOV A, M')) comment = ' ; Load Memory value into Accumulator';
        else if (upper.startsWith('ADD')) comment = ' ; Add register/memory to Accumulator';
        else if (upper.startsWith('SUB')) comment = ' ; Subtract register/memory from Accumulator';
        else if (upper.startsWith('JMP')) comment = ' ; Unconditional jump to address';
        else if (upper.startsWith('JNZ')) comment = ' ; Jump to address if Zero flag is reset';
        else if (upper.startsWith('JZ')) comment = ' ; Jump to address if Zero flag is set';
        else if (upper.startsWith('STA')) comment = ' ; Store Accumulator direct to memory';
        else if (upper.startsWith('LDA')) comment = ' ; Load Accumulator direct from memory';
        
        // Match instruction spacing (padding to column 15)
        const paddedLine = line.padEnd(15, ' ');
        return paddedLine + comment;
      }).join('\\n');

      return `Here is your code with detailed comments explaining the flow:\n\n\`\`\`assembly\n${commentedCode}\n\`\`\`\n\nYou can click **Apply to Editor** to insert these comments directly into your workspace.`;
  }

  // 5. Execution & Runtime Debugging
  if (assistantType === 'debug' || lowerMessage.includes('debug')) {
    if (context) {
      return `Debug Engine Initialized...\n\n**Current Registers:**\nA: ${context.registers.A || '00'} | B: ${context.registers.B || '00'} | C: ${context.registers.C || '00'}\nDE: ${context.registers.D}${context.registers.E} | HL: ${context.registers.H}${context.registers.L}\nPC: ${context.registers.PC} | SP: ${context.registers.SP}\n\n**Flags:**\nZ: ${context.flags.Z} | S: ${context.flags.S} | CY: ${context.flags.CY}\n\n**Status:** ${context.isRunning ? 'Executing...' : 'Paused/Stopped'}\n\nLook at the registers above. Is the Accumulator (A) holding the value you expect at this point in execution? Step through the code using the Step button to observe changes line-by-line.`;
    }
  }

  // 6. General Knowledge Fallback
  if (lowerMessage.includes('mvi')) {
    return `MVI is used to load an 8-bit immediate value into a register.\nFormat: \`MVI register, data\`\n\n- Takes 2 bytes (1 opcode + 1 data byte)\n- Takes 7 clock cycles\n- Does NOT affect any flags\n\nExample:\n\`\`\`assembly\nMVI A, 42H    ; Load 42 hex into accumulator\n\`\`\``;
  }
  if (lowerMessage.includes('mov')) {
    return `MOV copies data from a source register/memory to a destination register/memory.\nFormat: \`MOV destination, source\`\n\n- Takes 1 byte\n- Takes 4 clock cycles (7 if memory is involved)\n- Does NOT affect any flags\n\nExample:\n\`\`\`assembly\nMOV B, A      ; Copy Accumulator to Register B\n\`\`\``;
  }
  
  return `I am currently operating in **Local Engine Mode** (Offline/API disconnected). \n\nEven offline, I can:\n1. Find syntax errors in your code\n2. Add comments to your code (type "comment my code")\n3. Write basic programs (e.g. "write code to multiply two numbers")\n4. Perform a code review (type "review")\n5. Analyze your current register/flag states (type "debug")\n\nWhat would you like to do?`;
}
